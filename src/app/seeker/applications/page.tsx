import { CareerWorkspace } from "@/components/dashboard/career-workspace";
import { requireAuthUser } from "@/lib/auth-session";
export default async function ApplicationsPage() { await requireAuthUser(); return <CareerWorkspace kind="applications"/>; }
