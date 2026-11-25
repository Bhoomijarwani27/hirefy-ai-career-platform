import { requireRole } from "@/lib/auth-session";
import { getRecommendedJobsForCandidate } from "@/lib/seeker-profile-server";
import type { RecommendedJobDTO, SeekerProfileDTO } from "@/lib/seeker-profile";
import { SeekerProfileView } from "@/components/dashboard/seeker-profile-view";

export const metadata = {
  title: "My Career Profile | Hirefy",
  description:
    "Update your skills, target role, and preferences for personalized job recommendations.",
};

export default async function SeekerProfilePage() {
  const user = await requireRole("CANDIDATE");

  let profile: SeekerProfileDTO = {
    id: "",
    userId: user.id,
    name: user.name ?? "",
    email: user.email,
    title: "",
    bio: "",
    skills: [],
    experience: "",
    education: "",
    location: "",
    preferredWorkMode: "ANY",
    preferredEmploymentType: "ANY",
    experienceYears: null,
    expectedSalary: "",
    updatedAt: new Date().toISOString(),
  };
  let recommendations: RecommendedJobDTO[] = [];

  try {
    const data = await getRecommendedJobsForCandidate(user.id);
    profile = data.profile;
    recommendations = data.recommendations;
  } catch (error) {
    console.error("Failed to load SeekerProfilePage:", error);
  }

  return (
    <SeekerProfileView
      initialProfile={profile}
      initialRecommendations={recommendations}
    />
  );
}
