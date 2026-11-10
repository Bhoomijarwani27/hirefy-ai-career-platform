import { JobDiscovery } from "@/components/dashboard/job-discovery";
import { requireRole } from "@/lib/auth-session";

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

  return <JobDiscovery userName={userName} userInitials={userInitials} />;
}
