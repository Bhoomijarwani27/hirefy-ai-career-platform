import { z } from "zod";

export const JOB_STATUSES = ["OPEN", "CLOSED", "DRAFT"] as const;
export type JobStatusValue = (typeof JOB_STATUSES)[number];

export const EMPLOYMENT_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP",
  "CONTRACT",
] as const;
export type EmploymentTypeValue = (typeof EMPLOYMENT_TYPES)[number];

export const WORK_MODES = ["ON_SITE", "REMOTE", "HYBRID"] as const;
export type WorkModeValue = (typeof WORK_MODES)[number];

export const EXPERIENCE_LEVELS = [
  "ENTRY",
  "MID",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
] as const;
export type ExperienceLevelValue = (typeof EXPERIENCE_LEVELS)[number];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentTypeValue, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
};

export const WORK_MODE_LABELS: Record<WorkModeValue, string> = {
  ON_SITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevelValue, string> = {
  ENTRY: "Entry Level",
  MID: "Mid Level",
  SENIOR: "Senior Level",
  LEAD: "Lead / Staff",
  EXECUTIVE: "Executive",
};

export const JOB_STATUS_LABELS: Record<JobStatusValue, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
  DRAFT: "Draft",
};

export interface CompanyJobDTO {
  id: string;
  companyId: string;
  title: string;
  department: string;
  description: string;
  openings: number;
  employmentType: EmploymentTypeValue;
  workMode: WorkModeValue;
  location: string;
  experienceLevel: ExperienceLevelValue;
  minExperience: number;
  maxExperience: number | null;
  salaryRange: string | null;
  requiredSkills: string[];
  qualifications: string;
  responsibilities: string;
  preferredSkills: string[];
  deadline: string | null;
  applicationInstructions: string | null;
  status: JobStatusValue;
  postedAt: string | null;
  createdAt: string;
  updatedAt: string;
  applicationsCount: number;
}

const baseJobObject = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Job title must be at least 2 characters.")
    .max(120, "Job title must be 120 characters or fewer."),
  department: z
    .string()
    .trim()
    .max(80, "Department must be 80 characters or fewer.")
    .default(""),
  description: z
    .string()
    .trim()
    .max(10000, "Job description must be 10,000 characters or fewer.")
    .default(""),
  openings: z.coerce
    .number()
    .int("Number of openings must be a whole number.")
    .min(1, "At least 1 opening is required.")
    .max(999, "Number of openings cannot exceed 999.")
    .default(1),
  employmentType: z.enum(EMPLOYMENT_TYPES).default("FULL_TIME"),
  workMode: z.enum(WORK_MODES).default("ON_SITE"),
  location: z
    .string()
    .trim()
    .max(120, "Location must be 120 characters or fewer.")
    .default(""),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).default("MID"),
  minExperience: z.coerce
    .number()
    .int("Minimum experience must be a whole number.")
    .min(0, "Minimum experience cannot be negative.")
    .max(50, "Minimum experience cannot exceed 50 years.")
    .default(0),
  maxExperience: z
    .union([
      z.coerce
        .number()
        .int("Maximum experience must be a whole number.")
        .min(0, "Maximum experience cannot be negative.")
        .max(50, "Maximum experience cannot exceed 50 years."),
      z.null(),
      z.literal(""),
    ])
    .optional()
    .transform((val) => (val === "" || val === undefined ? null : val)),
  salaryRange: z
    .string()
    .trim()
    .max(100, "Salary range must be 100 characters or fewer.")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  requiredSkills: z.array(z.string().trim().min(1)).default([]),
  qualifications: z
    .string()
    .trim()
    .max(6000, "Qualifications must be 6,000 characters or fewer.")
    .default(""),
  responsibilities: z
    .string()
    .trim()
    .max(6000, "Responsibilities must be 6,000 characters or fewer.")
    .default(""),
  preferredSkills: z.array(z.string().trim().min(1)).default([]),
  deadline: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  applicationInstructions: z
    .string()
    .trim()
    .max(2000, "Application instructions must be 2,000 characters or fewer.")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  status: z.enum(JOB_STATUSES).default("DRAFT"),
});

export const jobPayloadSchema = baseJobObject.superRefine((data, ctx) => {
  if (
    data.maxExperience !== null &&
    data.maxExperience !== undefined &&
    data.maxExperience < data.minExperience
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["maxExperience"],
      message: "Maximum experience must be greater than or equal to minimum experience.",
    });
  }

  if (data.deadline) {
    const parsed = new Date(data.deadline);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deadline"],
        message: "Please provide a valid application deadline date.",
      });
    }
  }

  // When publishing (OPEN) or updating an OPEN/CLOSED job, enforce all required fields
  if (data.status === "OPEN") {
    if (data.department.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["department"],
        message: "Department is required before publishing.",
      });
    }
    if (data.description.length < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["description"],
        message: "Job description must be at least 20 characters before publishing.",
      });
    }
    if (data.location.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["location"],
        message: "Job location is required before publishing.",
      });
    }
    if (data.requiredSkills.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["requiredSkills"],
        message: "Add at least one required skill before publishing.",
      });
    }
    if (data.qualifications.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["qualifications"],
        message: "Qualifications (at least 10 characters) are required before publishing.",
      });
    }
    if (data.responsibilities.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["responsibilities"],
        message: "Responsibilities (at least 10 characters) are required before publishing.",
      });
    }
    if (!data.deadline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deadline"],
        message: "Application deadline is required before publishing.",
      });
    } else {
      const deadlineDate = new Date(data.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!Number.isNaN(deadlineDate.getTime()) && deadlineDate < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deadline"],
          message: "Application deadline cannot be in the past.",
        });
      }
    }
  }
});

export type JobPayloadInput = z.input<typeof jobPayloadSchema>;
export type JobPayloadParsed = z.output<typeof jobPayloadSchema>;

export const jobStatusPatchSchema = z.object({
  status: z.enum(JOB_STATUSES),
});

export function formatJobDate(iso: Date | string | null | undefined): string {
  if (!iso) return "Not published";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}
