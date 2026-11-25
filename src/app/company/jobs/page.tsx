import { requireRole } from "@/lib/auth-session";
import { getOrCreateCompanyProfile, listCompanyJobs } from "@/lib/company-jobs";
import { JobManagement } from "@/components/dashboard/job-management";

export default async function CompanyJobsPage() {
  const user = await requireRole("RECRUITER");
  const [company, jobs] = await Promise.all([
    getOrCreateCompanyProfile(user.id),
    listCompanyJobs(user.id),
  ]);

  return (
    <JobManagement
      initialJobs={jobs}
      companyName={company.companyName ?? user.name ?? undefined}
    />
  );
}
