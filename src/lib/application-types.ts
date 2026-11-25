import { z } from "zod";
import type { ResumeData } from "@/lib/resume-storage";

export const APPLICATION_STATUSES = [
  "APPLIED",
  "REVIEWING",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "OFFER",
  "REJECTED",
] as const;

export type ApplicationStatusValue = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatusValue, string> =
  {
    APPLIED: "New",
    REVIEWING: "Reviewing",
    SHORTLISTED: "Shortlisted",
    INTERVIEW: "Interview",
    SELECTED: "Selected",
    OFFER: "Offer",
    REJECTED: "Rejected",
  };

export const APPLICATION_FILTER_TABS = [
  { value: "ALL", label: "All" },
  { value: "APPLIED", label: "New" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "SELECTED", label: "Selected" },
  { value: "REJECTED", label: "Rejected" },
] as const;

export interface ApplicantDTO {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateImage: string | null;
  candidateTitle: string | null;
  candidateBio: string | null;
  skills: string[];
  experienceSummary: string | null;
  educationSummary: string | null;
  resumeUrl: string | null;
  resumeText: string | null;
  resumeData: ResumeData | null;
  coverLetter: string | null;
  status: ApplicationStatusValue;
  appliedAt: string;
  updatedAt: string;
  savedForJob: boolean;
  savedGenerally: boolean;
}

export interface GenerallySavedCandidateDTO {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateImage: string | null;
  candidateTitle: string | null;
  skills: string[];
  savedAt: string;
}

export interface AiRankedCandidateDTO {
  rank: number;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  relevantExperience: string;
  explanation: string;
}

export const applicationStatusPatchSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
});

export const saveCandidateBodySchema = z.object({
  candidateId: z.string().trim().min(1, "Candidate ID is required."),
});

export function getCandidateInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
