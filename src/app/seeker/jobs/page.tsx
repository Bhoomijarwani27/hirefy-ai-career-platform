import { JobDiscovery } from "@/components/dashboard/job-discovery";
import { getServerSession } from "@/lib/auth-session";

export const metadata = {
  title: "Job Discovery | Hirefy",
  description: "Find your next role with AI resume matching and smart search filters.",
};

export default async function SeekerJobsPage() {
  const session = await getServerSession().catch(() => null);
  const userName = session?.user?.name || "Jamie Smith";
  const userInitials =
    userName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "JS";

  return <JobDiscovery userName={userName} userInitials={userInitials} />;
}
