import { JobSeekerDashboard } from "@/components/dashboard/job-seeker-dashboard";
import { requireRole } from "@/lib/auth-session";
import { APPLICATION_STATUS_LABELS } from "@/lib/application-types";
import { formatJobDate } from "@/lib/job-validation";
import {
  listOpenJobsForSeeker,
  listSeekerApplications,
} from "@/lib/seeker-jobs-server";

export default async function SeekerDashboardPage() {
  const user = await requireRole("CANDIDATE");

  let recommendedJobs: {
    id: string;
    title: string;
    company: string;
    location: string;
    skills: string[];
    matchLabel?: string;
  }[] = [];

  let recentApplications: {
    id: string;
    title: string;
    company: string;
    status: string;
    date?: string;
  }[] = [];

  try {
    const [openJobs, apps] = await Promise.all([
      listOpenJobsForSeeker(user.id),
      listSeekerApplications(user.id),
    ]);

    recommendedJobs = openJobs.slice(0, 4).map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      skills: job.skills.slice(0, 4),
      matchLabel: `${job.type} • ${job.mode}`,
    }));

    recentApplications = apps.slice(0, 5).map((app) => ({
      id: app.id,
      title: app.jobTitle,
      company: app.companyName,
      status: APPLICATION_STATUS_LABELS[app.status] || app.status,
      date: `Applied ${formatJobDate(app.appliedAt)}`,
    }));
  } catch (error) {
    console.error("Failed to load seeker dashboard data:", error);
  }

  return (
    <JobSeekerDashboard
      userName={user.name ?? undefined}
      recommendedJobs={recommendedJobs}
      recentApplications={recentApplications}
    />
  );
}
