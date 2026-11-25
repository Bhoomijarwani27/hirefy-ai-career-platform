import { prisma } from "@/lib/prisma";
import { getOrCreateCompanyProfile } from "@/lib/company-jobs";
import type { ApplicationStatusValue } from "@/lib/application-types";
import type { ResumeData } from "@/lib/resume-storage";
import type {
  InterviewModeValue,
  InterviewResultValue,
  TrackingCandidateDTO,
} from "@/lib/tracking-types";

const ACTIVE_PIPELINE_STATUSES = [
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "OFFER",
  "REJECTED",
] as const;

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
        [
          e.role,
          e.company,
          e.startDate ? `${e.startDate}–${e.endDate || "Present"}` : "",
        ]
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

export async function listPipelineForJob(
  userId: string,
  jobId: string
): Promise<TrackingCandidateDTO[]> {
  const company = await getOrCreateCompanyProfile(userId);

  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId: company.id },
    select: { id: true, title: true, department: true, location: true },
  });

  if (!job) return [];

  const apps = await prisma.jobApplication.findMany({
    where: {
      jobId: job.id,
      status: { in: [...ACTIVE_PIPELINE_STATUSES] },
    },
    include: {
      candidate: {
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
      interviewRounds: {
        orderBy: [{ scheduledAt: "asc" }],
      },
      stageHistory: {
        include: {
          changedBy: {
            select: { name: true, email: true },
          },
        },
        orderBy: [{ changedAt: "desc" }],
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  return apps.map((app) => {
    const resumeData =
      ((app.resumeData ?? app.candidate.resumeData) as ResumeData | null) ??
      null;
    const normalizedStatus =
      app.status === "OFFER"
        ? "SELECTED"
        : (app.status as ApplicationStatusValue);

    return {
      id: app.id,
      jobId: job.id,
      jobTitle: job.title,
      jobDepartment: job.department,
      jobLocation: job.location,
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
      status: normalizedStatus,
      recruiterNotes: app.recruiterNotes,
      selectedAt: app.selectedAt ? app.selectedAt.toISOString() : null,
      offerStatus: app.offerStatus,
      rejectionReason: app.rejectionReason,
      appliedAt: app.appliedAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      interviewRoundsCount: app.interviewRounds.length,
      interviewRounds: app.interviewRounds.map((r) => ({
        id: r.id,
        applicationId: r.applicationId,
        roundName: r.roundName,
        scheduledAt: r.scheduledAt.toISOString(),
        mode: r.mode as InterviewModeValue,
        meetingLinkOrLocation: r.meetingLinkOrLocation,
        interviewerName: r.interviewerName,
        notes: r.notes,
        feedback: r.feedback,
        result: r.result as InterviewResultValue,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      stageHistory: app.stageHistory.map((h) => ({
        id: h.id,
        fromStatus: (h.fromStatus as ApplicationStatusValue | null) ?? null,
        toStatus: h.toStatus as ApplicationStatusValue,
        note: h.note,
        changedByName: h.changedBy.name || h.changedBy.email,
        changedAt: h.changedAt.toISOString(),
      })),
    };
  });
}

export async function getTrackingDetail(
  userId: string,
  applicationId: string
): Promise<TrackingCandidateDTO | null> {
  const company = await getOrCreateCompanyProfile(userId);

  const app = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      job: { companyId: company.id },
    },
    include: {
      job: {
        select: { id: true, title: true, department: true, location: true },
      },
      candidate: {
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
      interviewRounds: {
        orderBy: [{ scheduledAt: "asc" }],
      },
      stageHistory: {
        include: {
          changedBy: {
            select: { name: true, email: true },
          },
        },
        orderBy: [{ changedAt: "desc" }],
      },
    },
  });

  if (!app) return null;

  const resumeData =
    ((app.resumeData ?? app.candidate.resumeData) as ResumeData | null) ?? null;
  const normalizedStatus =
    app.status === "OFFER"
      ? "SELECTED"
      : (app.status as ApplicationStatusValue);

  return {
    id: app.id,
    jobId: app.job.id,
    jobTitle: app.job.title,
    jobDepartment: app.job.department,
    jobLocation: app.job.location,
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
    status: normalizedStatus,
    recruiterNotes: app.recruiterNotes,
    selectedAt: app.selectedAt ? app.selectedAt.toISOString() : null,
    offerStatus: app.offerStatus,
    rejectionReason: app.rejectionReason,
    appliedAt: app.appliedAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    interviewRoundsCount: app.interviewRounds.length,
    interviewRounds: app.interviewRounds.map((r) => ({
      id: r.id,
      applicationId: r.applicationId,
      roundName: r.roundName,
      scheduledAt: r.scheduledAt.toISOString(),
      mode: r.mode as InterviewModeValue,
      meetingLinkOrLocation: r.meetingLinkOrLocation,
      interviewerName: r.interviewerName,
      notes: r.notes,
      feedback: r.feedback,
      result: r.result as InterviewResultValue,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    stageHistory: app.stageHistory.map((h) => ({
      id: h.id,
      fromStatus: (h.fromStatus as ApplicationStatusValue | null) ?? null,
      toStatus: h.toStatus as ApplicationStatusValue,
      note: h.note,
      changedByName: h.changedBy.name || h.changedBy.email,
      changedAt: h.changedAt.toISOString(),
    })),
  };
}
