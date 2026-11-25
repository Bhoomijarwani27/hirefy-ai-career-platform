import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth-session";
import { getOrCreateCompanyProfile } from "@/lib/company-jobs";
import { getTrackingDetail } from "@/lib/company-tracking";
import { TrackingDetailView } from "@/components/dashboard/tracking-detail-view";

type PageProps = {
  params: Promise<{ applicationId: string }>;
};

export default async function CandidateTrackingDetailPage({
  params,
}: PageProps) {
  const user = await requireRole("RECRUITER");
  const { applicationId } = await params;

  const [company, candidate] = await Promise.all([
    getOrCreateCompanyProfile(user.id),
    getTrackingDetail(user.id, applicationId),
  ]);

  if (!candidate) {
    notFound();
  }

  return (
    <TrackingDetailView
      initialCandidate={candidate}
      companyName={company.companyName ?? user.name ?? undefined}
    />
  );
}
