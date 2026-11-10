import { CareerWorkspace } from "@/components/dashboard/career-workspace";
import { requireRole } from "@/lib/auth-session";

export default async function ApplicationsPage() {
  await requireRole("CANDIDATE");
  return <CareerWorkspace kind="applications" />;
}
