import { CareerWorkspace } from "@/components/dashboard/career-workspace";
import { requireRole } from "@/lib/auth-session";

export default async function SkillGapPage() {
  const user = await requireRole("CANDIDATE");
  return (
    <CareerWorkspace
      kind="skills"
      userName={user.name ?? undefined}
      userEmail={user.email}
    />
  );
}
