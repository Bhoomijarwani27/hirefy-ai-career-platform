import { JobDiscovery } from "@/components/dashboard/job-discovery";
import { requireRole } from "@/lib/auth-session";
import { listOpenJobsForSeeker } from "@/lib/seeker-jobs-server";
import type { SeekerJobDTO } from "@/lib/seeker-jobs-types";

export const metadata = {
  title: "Job Discovery | Hirefy",
  description:
    "Find your next role with AI resume matching and smart search filters.",
};

export default async function SeekerJobsPage() {
  const user = await requireRole("CANDIDATE");
  const userName = user.name || "Account";
  const userInitials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  let initialJobs: SeekerJobDTO[] = [];
  try {
    initialJobs = await listOpenJobsForSeeker(user.id);
  } catch (error) {
    console.error("Failed to load open jobs for SeekerJobsPage:", error);
  }

  return (
    <JobDiscovery
      userName={userName}
      userInitials={userInitials}
      initialJobs={initialJobs}
    />
  );
}
