import { CareerWorkspace } from "@/components/dashboard/career-workspace";
import { requireRole } from "@/lib/auth-session";

export default async function ResumeStudioPage() {
  await requireRole("CANDIDATE");
  return <CareerWorkspace kind="resume" />;
}
