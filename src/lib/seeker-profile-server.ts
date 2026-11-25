import { prisma } from "@/lib/prisma";
import { getOrCreateCandidateProfile, listOpenJobsForSeeker } from "@/lib/seeker-jobs-server";
import {
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODE_LABELS,
  type EmploymentTypeValue,
  type WorkModeValue,
} from "@/lib/job-validation";
import type {
  RecommendedJobDTO,
  SeekerProfileDTO,
} from "@/lib/seeker-profile";
import type { SeekerJobDTO } from "@/lib/seeker-jobs-types";

export async function getSeekerProfileDTO(
  userId: string
): Promise<SeekerProfileDTO> {
  const [profile, user] = await Promise.all([
    getOrCreateCandidateProfile(userId),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, email: true },
    }),
  ]);

  return {
    id: profile.id,
    userId: profile.userId,
    name: user.name ?? "",
    email: user.email,
    title: profile.title ?? "",
    bio: profile.bio ?? "",
    skills: profile.skills ?? [],
    experience: profile.experience ?? "",
    education: profile.education ?? "",
    location: profile.location ?? "",
    preferredWorkMode: profile.preferredWorkMode ?? "ANY",
    preferredEmploymentType: profile.preferredEmploymentType ?? "ANY",
    experienceYears: profile.experienceYears ?? null,
    expectedSalary: profile.expectedSalary ?? "",
    updatedAt: profile.updatedAt.toISOString(),
  };
}

function scoreJobForProfile(
  job: SeekerJobDTO,
  profile: SeekerProfileDTO
): RecommendedJobDTO {
  const candidateSkills = profile.skills.map((s) => s.toLowerCase());
  const targetSkills =
    job.requiredSkills.length > 0 ? job.requiredSkills : job.skills;

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const reqSkill of targetSkills) {
    const reqLower = reqSkill.toLowerCase();
    const isHit = candidateSkills.some(
      (cs) => cs === reqLower || cs.includes(reqLower) || reqLower.includes(cs)
    );
    if (isHit) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  }

  // Preferred skills bonus match
  for (const pref of job.preferredSkills) {
    if (
      !matchedSkills.includes(pref) &&
      candidateSkills.some(
        (cs) =>
          cs === pref.toLowerCase() ||
          cs.includes(pref.toLowerCase()) ||
          pref.toLowerCase().includes(cs)
      )
    ) {
      matchedSkills.push(pref);
    }
  }

  let score = 0;
  const reasons: string[] = [];

  // 1. Skills overlap (up to 60 pts)
  if (targetSkills.length > 0) {
    const reqMatchCount = targetSkills.filter((s) =>
      matchedSkills.includes(s)
    ).length;
    const skillRatio = reqMatchCount / targetSkills.length;
    score += Math.round(skillRatio * 60);
    if (reqMatchCount > 0) {
      reasons.push(
        `Matches ${reqMatchCount} of ${targetSkills.length} required skills`
      );
    }
  } else {
    score += 30;
  }

  // 2. Title / role keyword overlap (up to 15 pts)
  if (profile.title.trim()) {
    const titleWords = profile.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);
    const jobText = `${job.title} ${job.department}`.toLowerCase();
    const titleHits = titleWords.filter((w) => jobText.includes(w));
    if (titleHits.length > 0) {
      score += Math.min(15, titleHits.length * 6);
      reasons.push("Aligns with your target role");
    }
  }

  // 3. Work mode & Employment type preferences (up to 15 pts)
  if (
    profile.preferredWorkMode &&
    profile.preferredWorkMode !== "ANY" &&
    job.mode === WORK_MODE_LABELS[profile.preferredWorkMode as WorkModeValue]
  ) {
    score += 8;
    reasons.push(`Matches ${job.mode} preference`);
  } else if (profile.preferredWorkMode === "ANY") {
    score += 4;
  }

  if (
    profile.preferredEmploymentType &&
    profile.preferredEmploymentType !== "ANY" &&
    job.type ===
      EMPLOYMENT_TYPE_LABELS[
        profile.preferredEmploymentType as EmploymentTypeValue
      ]
  ) {
    score += 7;
    reasons.push(`Matches ${job.type} preference`);
  } else if (profile.preferredEmploymentType === "ANY") {
    score += 4;
  }

  // 4. Experience & Location fit (up to 10 pts)
  if (profile.experienceYears !== null) {
    const meetsMin = profile.experienceYears >= job.minExperience;
    const withinMax =
      job.maxExperience === null ||
      profile.experienceYears <= job.maxExperience + 2;
    if (meetsMin && withinMax) {
      score += 6;
      reasons.push(`Fits your ${profile.experienceYears} yrs experience`);
    } else if (meetsMin) {
      score += 3;
    }
  }

  if (
    profile.location.trim() &&
    (job.location.toLowerCase().includes(profile.location.toLowerCase()) ||
      job.mode === "Remote")
  ) {
    score += 4;
  }

  const finalScore = Math.min(99, Math.max(15, score));

  return {
    ...job,
    matchScore: finalScore,
    matchedSkills,
    missingSkills,
    matchReasons: reasons,
  };
}

export async function getRecommendedJobsForCandidate(
  userId: string
): Promise<{ profile: SeekerProfileDTO; recommendations: RecommendedJobDTO[] }> {
  const [profile, openJobs] = await Promise.all([
    getSeekerProfileDTO(userId),
    listOpenJobsForSeeker(userId),
  ]);

  const recommendations = openJobs
    .map((job) => scoreJobForProfile(job, profile))
    .sort((a, b) => b.matchScore - a.matchScore);

  return { profile, recommendations };
}
