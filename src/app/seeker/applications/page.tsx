import { requireRole } from "@/lib/auth-session";
import { listSeekerApplications } from "@/lib/seeker-jobs-server";
import type { SeekerApplicationDTO } from "@/lib/seeker-jobs-types";
import { SeekerApplicationsView } from "@/components/dashboard/seeker-applications-view";

export default async function ApplicationsPage() {
  const user = await requireRole("CANDIDATE");

  let initialApplications: SeekerApplicationDTO[] = [];
  try {
    initialApplications = await listSeekerApplications(user.id);
  } catch (error) {
    console.error("Failed to load seeker applications:", error);
  }

  return (
    <SeekerApplicationsView
      initialApplications={initialApplications}
      userName={user.name ?? undefined}
    />
  );
}
