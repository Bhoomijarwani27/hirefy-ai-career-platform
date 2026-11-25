import { CompanyDashboard } from "@/components/dashboard/company-dashboard";
import { requireRole } from "@/lib/auth-session";
import { getOrCreateCompanyProfile, listCompanyJobs } from "@/lib/company-jobs";
import { prisma } from "@/lib/prisma";
import {
  APPLICATION_STATUS_LABELS,
  type ApplicationStatusValue,
} from "@/lib/application-types";
import { formatJobDate, JOB_STATUS_LABELS } from "@/lib/job-validation";

export default async function CompanyDashboardPage() {
  const user = await requireRole("RECRUITER");

  let companyDisplayName = user.name ?? undefined;

  let activeJobs: {
    id: string;
    title: string;
    location: string;
    applicants: number;
    status: string;
    date?: string;
  }[] = [];

  let recentApplicants: {
    id: string;
    jobId: string;
    name: string;
    title: string;
    job: string;
    status: string;
    date?: string;
  }[] = [];

  try {
    const [company, jobs] = await Promise.all([
      getOrCreateCompanyProfile(user.id),
      listCompanyJobs(user.id, { status: "OPEN" }),
    ]);

    if (company.companyName) {
      companyDisplayName = company.companyName;
    }

    activeJobs = jobs.slice(0, 5).map((job) => ({
      id: job.id,
      title: job.title,
      location: job.location || "Location TBD",
      applicants: job.applicationsCount,
      status: JOB_STATUS_LABELS[job.status],
      date: job.postedAt ? `Posted ${formatJobDate(job.postedAt)}` : undefined,
    }));

    const recentApps = await prisma.jobApplication.findMany({
      where: { job: { companyId: company.id } },
      include: {
        job: { select: { id: true, title: true } },
        candidate: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: [{ appliedAt: "desc" }],
      take: 5,
    });

    recentApplicants = recentApps.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      name: app.candidate.user.name || app.candidate.user.email,
      title: app.candidate.title || "Candidate",
      job: app.job.title,
      status:
        APPLICATION_STATUS_LABELS[app.status as ApplicationStatusValue] ||
        app.status,
      date: `Applied ${formatJobDate(app.appliedAt.toISOString())}`,
    }));
  } catch (error) {
    console.error("Failed to load active jobs for CompanyDashboardPage:", error);
  }

  return (
    <CompanyDashboard
      userName={companyDisplayName}
      activeJobs={activeJobs}
      recentApplicants={recentApplicants}
    />
  );
}
