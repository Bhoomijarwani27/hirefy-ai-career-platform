import { requireRole } from "@/lib/auth-session";
import { getOrCreateCompanyProfile, listCompanyJobs } from "@/lib/company-jobs";
import { listPipelineForJob } from "@/lib/company-tracking";
import { ApplicationTrackingBoard } from "@/components/dashboard/application-tracking-board";

type PageProps = {
  searchParams: Promise<{ jobId?: string }>;
};

export default async function ApplicationTrackingPage({
  searchParams,
}: PageProps) {
  const user = await requireRole("RECRUITER");
  const { jobId } = await searchParams;

  const [company, jobs] = await Promise.all([
    getOrCreateCompanyProfile(user.id),
    listCompanyJobs(user.id),
  ]);

  const selectedJobId =
    jobId && jobs.some((j) => j.id === jobId)
      ? jobId
      : jobs[0]?.id ?? null;

  const candidates = selectedJobId
    ? await listPipelineForJob(user.id, selectedJobId)
    : [];

  return (
    <ApplicationTrackingBoard
      jobs={jobs}
      initialSelectedJobId={selectedJobId}
      initialCandidates={candidates}
      companyName={company.companyName ?? user.name ?? undefined}
    />
  );
}
