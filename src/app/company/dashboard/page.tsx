import { CompanyDashboard } from "@/components/dashboard/company-dashboard";
import { requireRole } from "@/lib/auth-session";

export default async function CompanyDashboardPage() {
  await requireRole("RECRUITER");
  return <CompanyDashboard />;
}
