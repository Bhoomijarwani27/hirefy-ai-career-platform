import { prisma } from "@/lib/prisma";
import {
  getOrCreateCompanyProfile,
  serializeCompanyJob,
} from "@/lib/company-jobs";
import type {
  ApplicantDTO,
  ApplicationStatusValue,
  GenerallySavedCandidateDTO,
} from "@/lib/application-types";
import type { CompanyJobDTO } from "@/lib/job-validation";
import type { ResumeData } from "@/lib/resume-storage";

function deriveExperienceSummary(
  appExp: string | null,
  profileExp: string | null,
  resumeData: ResumeData | null
): string | null {
  if (appExp?.trim()) return appExp.trim();
  if (profileExp?.trim()) return profileExp.trim();
  if (resumeData?.experience && resumeData.experience.length > 0) {
    return resumeData.experience
      .slice(0, 3)
      .map((e) =>
        [e.role, e.company, e.startDate ? `${e.startDate}–${e.endDate || "Present"}` : ""]
          .filter(Boolean)
          .join(" • ")
      )
      .filter(Boolean)
      .join("\n");
  }
  return null;
}

function deriveEducationSummary(
  appEdu: string | null,
  profileEdu: string | null,
  resumeData: ResumeData | null
): string | null {
  if (appEdu?.trim()) return appEdu.trim();
  if (profileEdu?.trim()) return profileEdu.trim();
  if (resumeData?.education && resumeData.education.length > 0) {
    return resumeData.education
      .slice(0, 2)
      .map((ed) =>
        [ed.degree, ed.institution, ed.graduationDate].filter(Boolean).join(" • ")
      )
      .filter(Boolean)
      .join("\n");
  }
  return null;
}

function deriveSkills(
  profileSkills: string[],
  resumeData: ResumeData | null
): string[] {
  if (profileSkills && profileSkills.length > 0) return profileSkills;
  if (!resumeData?.skills) return [];
  const raw = [
    resumeData.skills.technicalLanguages,
    resumeData.skills.frameworksAndTools,
    resumeData.skills.softSkills,
  ]
    .filter(Boolean)
    .join(",");
  return Array.from(
    new Set(
      raw
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
  ).slice(0, 20);
}

export async function getJobApplicationsForCompany(
  userId: string,
  jobId: string
): Promise<{ job: CompanyJobDTO; applications: ApplicantDTO[] } | null> {
  const company = await getOrCreateCompanyProfile(userId);

  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId: company.id },
    include: {
      _count: { select: { applications: true } },
    },
  });

  if (!job) return null;

  const [applications, jobSavedRows, companySavedRows] = await Promise.all([
    prisma.jobApplication.findMany({
      where: { jobId: job.id },
      include: {
        candidate: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
      orderBy: [{ appliedAt: "desc" }],
    }),
    prisma.jobSavedCandidate.findMany({
      where: { jobId: job.id, companyId: company.id },
      select: { candidateId: true },
    }),
    prisma.companySavedCandidate.findMany({
      where: { companyId: company.id },
      select: { candidateId: true },
    }),
  ]);

  const jobSavedSet = new Set(jobSavedRows.map((r) => r.candidateId));
  const companySavedSet = new Set(companySavedRows.map((r) => r.candidateId));

  const mapped: ApplicantDTO[] = applications.map((app) => {
    const resumeData =
      ((app.resumeData ?? app.candidate.resumeData) as ResumeData | null) ??
      null;
    return {
      id: app.id,
      jobId: app.jobId,
      candidateId: app.candidateId,
      candidateName:
        app.candidate.user.name ||
        resumeData?.contact?.fullName ||
        app.candidate.user.email,
      candidateEmail: app.candidate.user.email,
      candidateImage: app.candidate.user.image,
      candidateTitle: app.candidate.title,
      candidateBio: app.candidate.bio,
      skills: deriveSkills(app.candidate.skills, resumeData),
      experienceSummary: deriveExperienceSummary(
        app.experienceSummary,
        app.candidate.experience,
        resumeData
      ),
      educationSummary: deriveEducationSummary(
        app.educationSummary,
        app.candidate.education,
        resumeData
      ),
      resumeUrl: app.resumeUrl || app.candidate.resumeUrl,
      resumeText: app.resumeText || app.candidate.resumeText,
      resumeData,
      coverLetter: app.coverLetter,
      status: app.status as ApplicationStatusValue,
      appliedAt: app.appliedAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      savedForJob: jobSavedSet.has(app.candidateId),
      savedGenerally: companySavedSet.has(app.candidateId),
    };
  });

  return {
    job: serializeCompanyJob(job),
    applications: mapped,
  };
}

export async function getApplicationDetailForCompany(
  userId: string,
  jobId: string,
  applicationId: string
): Promise<{ job: CompanyJobDTO; application: ApplicantDTO } | null> {
  const company = await getOrCreateCompanyProfile(userId);

  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId: company.id },
    include: {
      _count: { select: { applications: true } },
    },
  });

  if (!job) return null;

  const app = await prisma.jobApplication.findFirst({
    where: { id: applicationId, jobId: job.id },
    include: {
      candidate: {
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      },
    },
  });

  if (!app) return null;

  const [jobSaved, companySaved] = await Promise.all([
    prisma.jobSavedCandidate.findUnique({
      where: {
        jobId_candidateId: { jobId: job.id, candidateId: app.candidateId },
      },
    }),
    prisma.companySavedCandidate.findUnique({
      where: {
        companyId_candidateId: {
          companyId: company.id,
          candidateId: app.candidateId,
        },
      },
    }),
  ]);

  const resumeData =
    ((app.resumeData ?? app.candidate.resumeData) as ResumeData | null) ?? null;

  return {
    job: serializeCompanyJob(job),
    application: {
      id: app.id,
      jobId: app.jobId,
      candidateId: app.candidateId,
      candidateName:
        app.candidate.user.name ||
        resumeData?.contact?.fullName ||
        app.candidate.user.email,
      candidateEmail: app.candidate.user.email,
      candidateImage: app.candidate.user.image,
      candidateTitle: app.candidate.title,
      candidateBio: app.candidate.bio,
      skills: deriveSkills(app.candidate.skills, resumeData),
      experienceSummary: deriveExperienceSummary(
        app.experienceSummary,
        app.candidate.experience,
        resumeData
      ),
      educationSummary: deriveEducationSummary(
        app.educationSummary,
        app.candidate.education,
        resumeData
      ),
      resumeUrl: app.resumeUrl || app.candidate.resumeUrl,
      resumeText: app.resumeText || app.candidate.resumeText,
      resumeData,
      coverLetter: app.coverLetter,
      status: app.status as ApplicationStatusValue,
      appliedAt: app.appliedAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      savedForJob: Boolean(jobSaved),
      savedGenerally: Boolean(companySaved),
    },
  };
}

export async function listCompanySavedCandidates(
  userId: string
): Promise<GenerallySavedCandidateDTO[]> {
  const company = await getOrCreateCompanyProfile(userId);

  const rows = await prisma.companySavedCandidate.findMany({
    where: { companyId: company.id },
    include: {
      candidate: {
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    candidateId: row.candidateId,
    candidateName: row.candidate.user.name || row.candidate.user.email,
    candidateEmail: row.candidate.user.email,
    candidateImage: row.candidate.user.image,
    candidateTitle: row.candidate.title,
    skills: row.candidate.skills,
    savedAt: row.createdAt.toISOString(),
  }));
}
