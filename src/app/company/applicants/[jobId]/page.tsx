import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth-session";
import { getOrCreateCompanyProfile } from "@/lib/company-jobs";
import { getJobApplicationsForCompany } from "@/lib/company-applications";
import { JobApplicationsView } from "@/components/dashboard/job-applications-view";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function JobApplicationsPage({ params }: PageProps) {
  const user = await requireRole("RECRUITER");
  const { jobId } = await params;

  const [company, data] = await Promise.all([
    getOrCreateCompanyProfile(user.id),
    getJobApplicationsForCompany(user.id, jobId),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <JobApplicationsView
      job={data.job}
      initialApplications={data.applications}
      companyName={company.companyName ?? user.name ?? undefined}
    />
  );
}
