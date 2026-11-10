import { JobSeekerDashboard } from "@/components/dashboard/job-seeker-dashboard";
import { requireRole } from "@/lib/auth-session";

export default async function SeekerDashboardPage() {
  await requireRole("CANDIDATE");
  return <JobSeekerDashboard />;
}
