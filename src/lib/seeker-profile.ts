import { z } from "zod";
import type { SeekerJobDTO } from "@/lib/seeker-jobs-types";

export const PREFERRED_WORK_MODES = [
  { value: "ANY", label: "Any Work Mode" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ON_SITE", label: "On-site" },
] as const;

export const PREFERRED_EMPLOYMENT_TYPES = [
  { value: "ANY", label: "Any Employment Type" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
] as const;

export interface SeekerProfileDTO {
  id: string;
  userId: string;
  name: string;
  email: string;
  title: string;
  bio: string;
  skills: string[];
  experience: string;
  education: string;
  location: string;
  preferredWorkMode: string;
  preferredEmploymentType: string;
  experienceYears: number | null;
  expectedSalary: string;
  updatedAt: string;
}

export interface RecommendedJobDTO extends SeekerJobDTO {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchReasons: string[];
}

export const seekerProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name must be 100 characters or fewer.")
    .optional(),
  title: z
    .string()
    .trim()
    .min(2, "Target role / headline must be at least 2 characters.")
    .max(120, "Target role must be 120 characters or fewer."),
  bio: z
    .string()
    .trim()
    .max(3000, "Bio must be 3,000 characters or fewer.")
    .optional()
    .default(""),
  skills: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one skill to receive accurate job recommendations.")
    .max(50, "You can add up to 50 skills."),
  experience: z
    .string()
    .trim()
    .max(4000, "Experience summary must be 4,000 characters or fewer.")
    .optional()
    .default(""),
  education: z
    .string()
    .trim()
    .max(2000, "Education summary must be 2,000 characters or fewer.")
    .optional()
    .default(""),
  location: z
    .string()
    .trim()
    .max(120, "Location must be 120 characters or fewer.")
    .optional()
    .default(""),
  preferredWorkMode: z
    .enum(["ANY", "REMOTE", "HYBRID", "ON_SITE"])
    .default("ANY"),
  preferredEmploymentType: z
    .enum(["ANY", "FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"])
    .default("ANY"),
  experienceYears: z
    .union([
      z.coerce
        .number()
        .int("Years of experience must be a whole number.")
        .min(0, "Years of experience cannot be negative.")
        .max(50, "Years of experience cannot exceed 50."),
      z.null(),
      z.literal(""),
    ])
    .optional()
    .transform((val) => (val === "" || val === undefined ? null : val)),
  expectedSalary: z
    .string()
    .trim()
    .max(100, "Expected salary must be 100 characters or fewer.")
    .optional()
    .default(""),
});

export type SeekerProfileParsed = z.output<typeof seekerProfileSchema>;
