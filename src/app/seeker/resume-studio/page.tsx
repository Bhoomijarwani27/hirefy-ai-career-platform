import { CareerWorkspace } from "@/components/dashboard/career-workspace";
import { requireRole } from "@/lib/auth-session";

export default async function ResumeStudioPage() {
  const user = await requireRole("CANDIDATE");
  return (
    <CareerWorkspace
      kind="resume"
      userName={user.name ?? undefined}
      userEmail={user.email}
    />
  );
}
