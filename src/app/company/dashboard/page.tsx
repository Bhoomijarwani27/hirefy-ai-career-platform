import { CompanyDashboard } from "@/components/dashboard/company-dashboard";
import { requireAuthUser } from "@/lib/auth-session";

export default async function CompanyDashboardPage() {
  await requireAuthUser();
  return <CompanyDashboard />;
}
