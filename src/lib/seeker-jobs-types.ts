import { z } from "zod";
import type { ApplicationStatusValue } from "@/lib/application-types";
import type { InterviewRoundDTO } from "@/lib/tracking-types";

export interface SeekerJobDTO {
  id: string;
  title: string;
  department: string;
  company: string;
  companyLogoUrl: string | null;
  industry: string;
  location: string;
  salary: string;
  type: string;
  mode: string;
  experience: string;
  minExperience: number;
  maxExperience: number | null;
  skills: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
  qualifications: string;
  responsibilities: string;
  applicationInstructions: string | null;
  deadline: string | null;
  postedAt: string;
  age: string;
  ageDays: number;
  isApplied: boolean;
  isSaved: boolean;
  applicationStatus: ApplicationStatusValue | null;
}

export interface SeekerApplicationDTO {
  id: string;
  jobId: string;
  jobTitle: string;
  department: string;
  companyName: string;
  companyLogoUrl: string | null;
  location: string;
  employmentType: string;
  workMode: string;
  status: ApplicationStatusValue;
  appliedAt: string;
  updatedAt: string;
  coverLetter: string | null;
  offerStatus: string | null;
  interviewRounds: InterviewRoundDTO[];
}

export const seekerApplySchema = z.object({
  coverLetter: z
    .string()
    .trim()
    .max(5000, "Cover letter/note must be 5,000 characters or fewer.")
    .optional()
    .nullable(),
  resumeName: z.string().trim().max(160).optional(),
  resumeText: z.string().trim().max(25000).optional().nullable(),
  resumeData: z.any().optional().nullable(),
  skills: z.array(z.string().trim().min(1)).optional(),
});
