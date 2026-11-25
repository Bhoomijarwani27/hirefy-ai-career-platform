import { prisma } from "@/lib/prisma";
import { ensureRoleProfile } from "@/lib/user-profile";
import type {
  CompanyJobDTO,
  EmploymentTypeValue,
  ExperienceLevelValue,
  JobStatusValue,
  WorkModeValue,
} from "@/lib/job-validation";

export async function getOrCreateCompanyProfile(userId: string) {
  await ensureRoleProfile(userId, "RECRUITER");
  return prisma.companyProfile.findUniqueOrThrow({
    where: { userId },
  });
}

type PrismaJobWithCount = {
  id: string;
  companyId: string;
  title: string;
  department: string;
  description: string;
  openings: number;
  employmentType: string;
  workMode: string;
  location: string;
  experienceLevel: string;
  minExperience: number;
  maxExperience: number | null;
  salaryRange: string | null;
  requiredSkills: string[];
  qualifications: string;
  responsibilities: string;
  preferredSkills: string[];
  deadline: Date | null;
  applicationInstructions: string | null;
  status: string;
  postedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { applications: number };
};

export function serializeCompanyJob(job: PrismaJobWithCount): CompanyJobDTO {
  return {
    id: job.id,
    companyId: job.companyId,
    title: job.title,
    department: job.department,
    description: job.description,
    openings: job.openings,
    employmentType: job.employmentType as EmploymentTypeValue,
    workMode: job.workMode as WorkModeValue,
    location: job.location,
    experienceLevel: job.experienceLevel as ExperienceLevelValue,
    minExperience: job.minExperience,
    maxExperience: job.maxExperience,
    salaryRange: job.salaryRange,
    requiredSkills: job.requiredSkills,
    qualifications: job.qualifications,
    responsibilities: job.responsibilities,
    preferredSkills: job.preferredSkills,
    deadline: job.deadline ? job.deadline.toISOString() : null,
    applicationInstructions: job.applicationInstructions,
    status: job.status as JobStatusValue,
    postedAt: job.postedAt ? job.postedAt.toISOString() : null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    applicationsCount: job._count.applications,
  };
}

export async function listCompanyJobs(
  userId: string,
  filters?: { search?: string; status?: string }
): Promise<CompanyJobDTO[]> {
  const company = await getOrCreateCompanyProfile(userId);

  const where: Record<string, unknown> = {
    companyId: company.id,
  };

  if (
    filters?.status &&
    filters.status !== "ALL" &&
    ["OPEN", "CLOSED", "DRAFT"].includes(filters.status)
  ) {
    where.status = filters.status;
  }

  if (filters?.search && filters.search.trim().length > 0) {
    where.title = {
      contains: filters.search.trim(),
      mode: "insensitive",
    };
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      _count: {
        select: { applications: true },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  return jobs.map(serializeCompanyJob);
}

export async function getCompanyJobById(
  userId: string,
  jobId: string
): Promise<CompanyJobDTO | null> {
  const company = await getOrCreateCompanyProfile(userId);

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      companyId: company.id,
    },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!job) return null;
  return serializeCompanyJob(job);
}
