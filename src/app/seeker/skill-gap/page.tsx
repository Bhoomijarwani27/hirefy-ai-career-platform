import { CareerWorkspace } from "@/components/dashboard/career-workspace";
import { requireRole } from "@/lib/auth-session";

export default async function SkillGapPage() {
  await requireRole("CANDIDATE");
  return <CareerWorkspace kind="skills" />;
}
