import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth-session";
import { getOrCreateCompanyProfile } from "@/lib/company-jobs";
import { getApplicationDetailForCompany } from "@/lib/company-applications";
import { ApplicationDetailView } from "@/components/dashboard/application-detail-view";

type PageProps = {
  params: Promise<{ jobId: string; applicationId: string }>;
};

export default async function ApplicationDetailPage({ params }: PageProps) {
  const user = await requireRole("RECRUITER");
  const { jobId, applicationId } = await params;

  const [company, data] = await Promise.all([
    getOrCreateCompanyProfile(user.id),
    getApplicationDetailForCompany(user.id, jobId, applicationId),
  ]);

  if (!data) {
    notFound();
  }

  return (
    <ApplicationDetailView
      job={data.job}
      initialApplication={data.application}
      companyName={company.companyName ?? user.name ?? undefined}
    />
  );
}
