import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth-session";
import { getCompanyJobById, getOrCreateCompanyProfile } from "@/lib/company-jobs";
import { JobForm } from "@/components/dashboard/job-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCompanyJobPage({ params }: PageProps) {
  const user = await requireRole("RECRUITER");
  const { id } = await params;

  const [company, job] = await Promise.all([
    getOrCreateCompanyProfile(user.id),
    getCompanyJobById(user.id, id),
  ]);

  if (!job) {
    notFound();
  }

  return (
    <JobForm
      mode="edit"
      initialJob={job}
      companyName={company.companyName ?? user.name ?? undefined}
    />
  );
}
