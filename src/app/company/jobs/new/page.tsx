import { requireRole } from "@/lib/auth-session";
import { getOrCreateCompanyProfile } from "@/lib/company-jobs";
import { JobForm } from "@/components/dashboard/job-form";

export default async function NewCompanyJobPage() {
  const user = await requireRole("RECRUITER");
  const company = await getOrCreateCompanyProfile(user.id);

  return (
    <JobForm
      mode="create"
      companyName={company.companyName ?? user.name ?? undefined}
    />
  );
}
