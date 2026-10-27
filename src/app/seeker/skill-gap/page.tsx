import { CareerWorkspace } from "@/components/dashboard/career-workspace";
import { requireAuthUser } from "@/lib/auth-session";
export default async function SkillGapPage() { await requireAuthUser(); return <CareerWorkspace kind="skills"/>; }
