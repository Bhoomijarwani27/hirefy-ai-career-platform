import { requireRole } from "@/lib/auth-session";
import { getOrCreateCompanyProfile, listCompanyJobs } from "@/lib/company-jobs";
import { listCompanySavedCandidates } from "@/lib/company-applications";
import { ApplicationsOverview } from "@/components/dashboard/applications-overview";

export default async function CompanyApplicationsPage() {
  const user = await requireRole("RECRUITER");
  const [company, jobs, savedCandidates] = await Promise.all([
    getOrCreateCompanyProfile(user.id),
    listCompanyJobs(user.id),
    listCompanySavedCandidates(user.id),
  ]);

  return (
    <ApplicationsOverview
      jobs={jobs}
      initialSavedCandidates={savedCandidates}
      companyName={company.companyName ?? user.name ?? undefined}
    />
  );
}
