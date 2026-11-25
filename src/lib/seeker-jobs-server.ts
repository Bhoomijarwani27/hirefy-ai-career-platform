import { prisma } from "@/lib/prisma";
import { ensureRoleProfile } from "@/lib/user-profile";
import {
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODE_LABELS,
  type EmploymentTypeValue,
  type WorkModeValue,
} from "@/lib/job-validation";
import type { ApplicationStatusValue } from "@/lib/application-types";
import type {
  InterviewModeValue,
  InterviewResultValue,
} from "@/lib/tracking-types";
import type {
  SeekerApplicationDTO,
  SeekerJobDTO,
} from "@/lib/seeker-jobs-types";

export async function getOrCreateCandidateProfile(userId: string) {
  await ensureRoleProfile(userId, "CANDIDATE");
  return prisma.candidateProfile.findUniqueOrThrow({
    where: { userId },
  });
}

function formatAgeLabel(date: Date): { label: string; days: number } {
  const diffMs = Date.now() - date.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (days === 0) return { label: "Today", days: 0 };
  if (days === 1) return { label: "1d ago", days: 1 };
  if (days < 30) return { label: `${days}d ago`, days };
  const months = Math.floor(days / 30);
  return { label: `${months}mo ago`, days };
}

export async function listOpenJobsForSeeker(
  userId: string
): Promise<SeekerJobDTO[]> {
  const candidate = await getOrCreateCandidateProfile(userId);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [jobs, applications, savedJobs] = await Promise.all([
    prisma.job.findMany({
      where: {
        status: "OPEN",
        OR: [{ deadline: null }, { deadline: { gte: startOfToday } }],
      },
      include: {
        company: {
          select: {
            companyName: true,
            logoUrl: true,
            industry: true,
          },
        },
      },
      orderBy: [{ postedAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.jobApplication.findMany({
      where: { candidateId: candidate.id },
      select: { jobId: true, status: true },
    }),
    prisma.savedJob.findMany({
      where: { candidateId: candidate.id },
      select: { jobId: true },
    }),
  ]);

  const appliedMap = new Map(
    applications.map((a) => [a.jobId, a.status as ApplicationStatusValue])
  );
  const savedSet = new Set(savedJobs.map((s) => s.jobId));

  return jobs.map((job) => {
    const refDate = job.postedAt ?? job.createdAt;
    const { label: age, days: ageDays } = formatAgeLabel(refDate);
    const expLabel =
      job.maxExperience !== null
        ? `${job.minExperience}–${job.maxExperience} years`
        : `${job.minExperience}+ years`;

    const allSkills = Array.from(
      new Set([...job.requiredSkills, ...job.preferredSkills])
    );

    return {
      id: job.id,
      title: job.title,
      department: job.department || "General",
      company: job.company.companyName || "Company",
      companyLogoUrl: job.company.logoUrl ?? null,
      industry: job.company.industry || job.department || "General",
      location: job.location || "Location TBD",
      salary: job.salaryRange || "Competitive",
      type:
        EMPLOYMENT_TYPE_LABELS[job.employmentType as EmploymentTypeValue] ||
        "Full-time",
      mode: WORK_MODE_LABELS[job.workMode as WorkModeValue] || "On-site",
      experience: expLabel,
      minExperience: job.minExperience,
      maxExperience: job.maxExperience,
      skills: allSkills,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      description: job.description,
      qualifications: job.qualifications,
      responsibilities: job.responsibilities,
      applicationInstructions: job.applicationInstructions,
      deadline: job.deadline ? job.deadline.toISOString() : null,
      postedAt: refDate.toISOString(),
      age,
      ageDays,
      isApplied: appliedMap.has(job.id),
      isSaved: savedSet.has(job.id),
      applicationStatus: appliedMap.get(job.id) ?? null,
    };
  });
}

export async function listSeekerApplications(
  userId: string
): Promise<SeekerApplicationDTO[]> {
  const candidate = await getOrCreateCandidateProfile(userId);

  const rows = await prisma.jobApplication.findMany({
    where: { candidateId: candidate.id },
    include: {
      job: {
        include: {
          company: {
            select: {
              companyName: true,
              logoUrl: true,
            },
          },
        },
      },
      interviewRounds: {
        orderBy: [{ scheduledAt: "asc" }],
      },
    },
    orderBy: [{ appliedAt: "desc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    jobId: row.jobId,
    jobTitle: row.job.title,
    department: row.job.department,
    companyName: row.job.company.companyName || "Company",
    companyLogoUrl: row.job.company.logoUrl ?? null,
    location: row.job.location,
    employmentType:
      EMPLOYMENT_TYPE_LABELS[row.job.employmentType as EmploymentTypeValue] ||
      "Full-time",
    workMode: WORK_MODE_LABELS[row.job.workMode as WorkModeValue] || "On-site",
    status: row.status as ApplicationStatusValue,
    appliedAt: row.appliedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    coverLetter: row.coverLetter,
    offerStatus: row.offerStatus,
    interviewRounds: row.interviewRounds.map((r) => ({
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
  }));
}
