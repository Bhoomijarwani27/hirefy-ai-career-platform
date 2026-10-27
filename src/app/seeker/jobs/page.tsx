import { CareerWorkspace } from "@/components/dashboard/career-workspace";
import { requireAuthUser } from "@/lib/auth-session";
export default async function JobsPage() { await requireAuthUser(); return <CareerWorkspace kind="jobs"/>; }
