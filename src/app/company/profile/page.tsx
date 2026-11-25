import { requireRole } from "@/lib/auth-session";
import { getCompanyProfileDTO } from "@/lib/company-profile-server";
import { CompanyProfileView } from "@/components/dashboard/company-profile-view";

export default async function CompanyProfilePage() {
  const user = await requireRole("RECRUITER");
  const profile = await getCompanyProfileDTO(user.id);

  return <CompanyProfileView initialProfile={profile} />;
}
