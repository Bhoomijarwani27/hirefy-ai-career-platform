import { z } from "zod";
import type { ApplicationStatusValue } from "@/lib/application-types";
import type { ResumeData } from "@/lib/resume-storage";

export const PIPELINE_STAGES = [
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
] as const;

export type PipelineStageValue = (typeof PIPELINE_STAGES)[number];

export const PIPELINE_STAGE_LABELS: Record<PipelineStageValue, string> = {
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  SELECTED: "Selected",
  REJECTED: "Rejected",
};

export const INTERVIEW_MODES = ["ONLINE", "IN_PERSON"] as const;
export type InterviewModeValue = (typeof INTERVIEW_MODES)[number];

export const INTERVIEW_MODE_LABELS: Record<InterviewModeValue, string> = {
  ONLINE: "Online",
  IN_PERSON: "In-person",
};

export const INTERVIEW_RESULTS = [
  "PENDING",
  "PASSED",
  "FAILED",
  "ON_HOLD",
] as const;
export type InterviewResultValue = (typeof INTERVIEW_RESULTS)[number];

export const INTERVIEW_RESULT_LABELS: Record<InterviewResultValue, string> = {
  PENDING: "Pending",
  PASSED: "Passed",
  FAILED: "Failed",
  ON_HOLD: "On Hold",
};

export interface StageHistoryDTO {
  id: string;
  fromStatus: ApplicationStatusValue | null;
  toStatus: ApplicationStatusValue;
  note: string | null;
  changedByName: string;
  changedAt: string;
}

export interface InterviewRoundDTO {
  id: string;
  applicationId: string;
  roundName: string;
  scheduledAt: string;
  mode: InterviewModeValue;
  meetingLinkOrLocation: string;
  interviewerName: string;
  notes: string | null;
  feedback: string | null;
  result: InterviewResultValue;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingCandidateDTO {
  id: string;
  jobId: string;
  jobTitle: string;
  jobDepartment: string;
  jobLocation: string;
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
  recruiterNotes: string | null;
  selectedAt: string | null;
  offerStatus: string | null;
  rejectionReason: string | null;
  appliedAt: string;
  updatedAt: string;
  interviewRoundsCount: number;
  interviewRounds: InterviewRoundDTO[];
  stageHistory: StageHistoryDTO[];
}

export const trackingStagePatchSchema = z.object({
  status: z.enum(PIPELINE_STAGES),
  note: z
    .string()
    .trim()
    .max(1000, "Note must be 1,000 characters or fewer.")
    .optional()
    .nullable(),
  rejectionReason: z
    .string()
    .trim()
    .max(1000, "Rejection reason must be 1,000 characters or fewer.")
    .optional()
    .nullable(),
  offerStatus: z
    .string()
    .trim()
    .max(120, "Offer status must be 120 characters or fewer.")
    .optional()
    .nullable(),
  recruiterNotes: z
    .string()
    .trim()
    .max(4000, "Recruiter notes must be 4,000 characters or fewer.")
    .optional()
    .nullable(),
});

export const trackingDetailsPatchSchema = z.object({
  recruiterNotes: z
    .string()
    .trim()
    .max(4000, "Recruiter notes must be 4,000 characters or fewer.")
    .optional()
    .nullable(),
  offerStatus: z
    .string()
    .trim()
    .max(120, "Offer status must be 120 characters or fewer.")
    .optional()
    .nullable(),
  rejectionReason: z
    .string()
    .trim()
    .max(1000, "Rejection reason must be 1,000 characters or fewer.")
    .optional()
    .nullable(),
});

export const interviewRoundPayloadSchema = z.object({
  roundName: z
    .string()
    .trim()
    .min(2, "Interview round name is required.")
    .max(120, "Round name must be 120 characters or fewer."),
  scheduledAt: z
    .string()
    .trim()
    .refine((val) => !Number.isNaN(new Date(val).getTime()), {
      message: "Please provide a valid interview date and time.",
    }),
  mode: z.enum(INTERVIEW_MODES).default("ONLINE"),
  meetingLinkOrLocation: z
    .string()
    .trim()
    .min(2, "Meeting link or interview location is required.")
    .max(500, "Meeting link or location must be 500 characters or fewer."),
  interviewerName: z
    .string()
    .trim()
    .min(2, "Interviewer name is required.")
    .max(120, "Interviewer name must be 120 characters or fewer."),
  notes: z
    .string()
    .trim()
    .max(2000, "Interview notes must be 2,000 characters or fewer.")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  feedback: z
    .string()
    .trim()
    .max(2000, "Interview feedback must be 2,000 characters or fewer.")
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  result: z.enum(INTERVIEW_RESULTS).default("PENDING"),
});

export function getNextPipelineStage(
  current: ApplicationStatusValue
): PipelineStageValue | null {
  if (current === "SHORTLISTED") return "INTERVIEW";
  if (current === "INTERVIEW") return "SELECTED";
  return null;
}

export function getPrevPipelineStage(
  current: ApplicationStatusValue
): PipelineStageValue | null {
  if (current === "INTERVIEW") return "SHORTLISTED";
  if (current === "SELECTED") return "INTERVIEW";
  if (current === "REJECTED") return "SHORTLISTED";
  return null;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function toDateTimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
