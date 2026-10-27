import { CareerWorkspace } from "@/components/dashboard/career-workspace";
import { requireAuthUser } from "@/lib/auth-session";
export default async function ResumeStudioPage() { await requireAuthUser(); return <CareerWorkspace kind="resume"/>; }
