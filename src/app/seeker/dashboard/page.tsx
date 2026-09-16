import { JobSeekerDashboard } from "@/components/dashboard/job-seeker-dashboard";
import { requireAuthUser } from "@/lib/auth-session";

export default async function SeekerDashboardPage() {
  await requireAuthUser();
  return <JobSeekerDashboard />;
}
