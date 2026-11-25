"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  Globe,
  Loader2,
  MapPin,
  Plus,
  Save,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { JobStatusBadge } from "@/components/dashboard/job-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_MODES,
  WORK_MODE_LABELS,
  formatJobDate,
  jobPayloadSchema,
  toDateInputValue,
  type CompanyJobDTO,
  type EmploymentTypeValue,
  type ExperienceLevelValue,
  type JobStatusValue,
  type WorkModeValue,
} from "@/lib/job-validation";

interface JobFormProps {
  mode: "create" | "edit";
  initialJob?: CompanyJobDTO;
  companyName?: string | null;
}

interface SkillTagInputProps {
  id: string;
  label: string;
  required?: boolean;
  skills: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  error?: string;
}

function SkillTagInput({
  id,
  label,
  required,
  skills,
  onChange,
  placeholder,
  error,
}: SkillTagInputProps) {
  const [draft, setDraft] = useState("");

  const addSkill = (raw: string) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;

    const existingLower = new Set(skills.map((s) => s.toLowerCase()));
    const next = [...skills];
    for (const part of parts) {
      if (!existingLower.has(part.toLowerCase())) {
        existingLower.add(part.toLowerCase());
        next.push(part);
      }
    }
    onChange(next);
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(draft);
    } else if (e.key === "Backspace" && !draft && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-foreground"
      >
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (draft.trim()) addSkill(draft);
          }}
          placeholder={placeholder}
          className={`min-h-11 flex-1 rounded-xl border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ${
            error ? "border-rose-500" : "border-border"
          }`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => addSkill(draft)}
          className="min-h-11 rounded-xl px-4 font-semibold"
        >
          <Plus className="size-4" />
          <span>Add</span>
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-200"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() =>
                  onChange(skills.filter((s) => s !== skill))
                }
                aria-label={`Remove ${skill}`}
                className="rounded-full p-0.5 hover:bg-violet-200/70 dark:hover:bg-violet-400/20"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function JobForm({ mode, initialJob, companyName }: JobFormProps) {
  const router = useRouter();

  // Basic Information
  const [title, setTitle] = useState(initialJob?.title ?? "");
  const [department, setDepartment] = useState(initialJob?.department ?? "");
  const [description, setDescription] = useState(initialJob?.description ?? "");
  const [openings, setOpenings] = useState(
    initialJob?.openings ? String(initialJob.openings) : "1"
  );

  // Job Details
  const [employmentType, setEmploymentType] = useState<EmploymentTypeValue>(
    initialJob?.employmentType ?? "FULL_TIME"
  );
  const [workMode, setWorkMode] = useState<WorkModeValue>(
    initialJob?.workMode ?? "ON_SITE"
  );
  const [location, setLocation] = useState(initialJob?.location ?? "");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevelValue>(
    initialJob?.experienceLevel ?? "MID"
  );
  const [minExperience, setMinExperience] = useState(
    initialJob?.minExperience !== undefined
      ? String(initialJob.minExperience)
      : "0"
  );
  const [maxExperience, setMaxExperience] = useState(
    initialJob?.maxExperience !== null && initialJob?.maxExperience !== undefined
      ? String(initialJob.maxExperience)
      : ""
  );
  const [salaryRange, setSalaryRange] = useState(initialJob?.salaryRange ?? "");

  // Requirements
  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    initialJob?.requiredSkills ?? []
  );
  const [qualifications, setQualifications] = useState(
    initialJob?.qualifications ?? ""
  );
  const [responsibilities, setResponsibilities] = useState(
    initialJob?.responsibilities ?? ""
  );
  const [preferredSkills, setPreferredSkills] = useState<string[]>(
    initialJob?.preferredSkills ?? []
  );

  // Application Settings
  const [deadline, setDeadline] = useState(
    toDateInputValue(initialJob?.deadline)
  );
  const [applicationInstructions, setApplicationInstructions] = useState(
    initialJob?.applicationInstructions ?? ""
  );

  // Form States
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<
    "DRAFT" | "OPEN" | "SAVE" | null
  >(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const buildPayload = (targetStatus: JobStatusValue) => ({
    title,
    department,
    description,
    openings: Number(openings) || 1,
    employmentType,
    workMode,
    location,
    experienceLevel,
    minExperience: minExperience === "" ? 0 : Number(minExperience),
    maxExperience: maxExperience === "" ? null : Number(maxExperience),
    salaryRange: salaryRange.trim() || null,
    requiredSkills,
    qualifications,
    responsibilities,
    preferredSkills,
    deadline: deadline || null,
    applicationInstructions: applicationInstructions.trim() || null,
    status: targetStatus,
  });

  const handleOpenPreview = () => {
    setFieldErrors({});
    setSubmitError(null);

    const payload = buildPayload("OPEN");
    const parsed = jobPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] ? String(issue.path[0]) : "form";
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      setSubmitError(
        parsed.error.issues[0]?.message ||
          "Please complete the required fields before previewing to publish."
      );
      return;
    }

    setIsPreviewOpen(true);
  };

  const handleSubmit = async (
    targetStatus: JobStatusValue,
    actionTag: "DRAFT" | "OPEN" | "SAVE"
  ) => {
    if (isSubmitting) return;

    setFieldErrors({});
    setSubmitError(null);

    const payload = buildPayload(targetStatus);
    const parsed = jobPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] ? String(issue.path[0]) : "form";
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      setSubmitError(
        parsed.error.issues[0]?.message ||
          "Please fix the highlighted validation errors."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmittingAction(actionTag);

    try {
      const url =
        mode === "create"
          ? "/api/company/jobs"
          : `/api/company/jobs/${initialJob!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors && typeof data.fieldErrors === "object") {
          setFieldErrors(data.fieldErrors);
        }
        throw new Error(data.error || "Failed to save job.");
      }

      setIsPreviewOpen(false);
      router.push(`/company/jobs/${data.job.id}`);
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save job posting."
      );
    } finally {
      setIsSubmitting(false);
      setSubmittingAction(null);
    }
  };

  const inputClass = (field: string) =>
    `mt-1.5 min-h-11 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ${
      fieldErrors[field] ? "border-rose-500" : "border-border"
    }`;

  const textareaClass = (field: string) =>
    `mt-1.5 w-full rounded-xl border bg-background p-3.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ${
      fieldErrors[field] ? "border-rose-500" : "border-border"
    }`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Back link & Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href={
                mode === "edit" && initialJob
                  ? `/company/jobs/${initialJob.id}`
                  : "/company/jobs"
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300"
            >
              <ArrowLeft className="size-3.5" />
              <span>
                {mode === "edit" ? "Back to Job Details" : "Back to Job Management"}
              </span>
            </Link>

            <div className="mt-2.5 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {mode === "create" ? "Post New Job" : "Edit Job Posting"}
              </h1>
              {mode === "edit" && initialJob && (
                <JobStatusBadge status={initialJob.status} />
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {companyName
                ? `Complete the details below for ${companyName}. Fields marked with * are required to publish.`
                : "Complete the job details below. Fields marked with * are required to publish."}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleOpenPreview}
            disabled={isSubmitting}
            className="min-h-11 shrink-0 rounded-xl gap-2 font-semibold"
          >
            <Eye className="size-4" />
            <span>Preview Job</span>
          </Button>
        </div>

        {/* Error Alert */}
        {submitError && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(
              mode === "edit" && initialJob?.status === "CLOSED"
                ? "CLOSED"
                : "OPEN",
              mode === "edit" ? "SAVE" : "OPEN"
            );
          }}
          className="mt-6 space-y-6"
          noValidate
        >
          {/* Section 1: Basic Information */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <BriefcaseBusiness className="size-4 text-violet-600" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 pt-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="job-title"
                  className="block text-sm font-semibold"
                >
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="job-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className={inputClass("title")}
                />
                {fieldErrors.title && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="job-department"
                  className="block text-sm font-semibold"
                >
                  Department <span className="text-rose-500">*</span>
                </label>
                <input
                  id="job-department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering, Product, Design"
                  className={inputClass("department")}
                />
                {fieldErrors.department && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fieldErrors.department}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="job-openings"
                  className="block text-sm font-semibold"
                >
                  Number of Openings <span className="text-rose-500">*</span>
                </label>
                <input
                  id="job-openings"
                  type="number"
                  min={1}
                  max={999}
                  value={openings}
                  onChange={(e) => setOpenings(e.target.value)}
                  placeholder="1"
                  className={inputClass("openings")}
                />
                {fieldErrors.openings && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fieldErrors.openings}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="job-description"
                  className="block text-sm font-semibold"
                >
                  Job Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="job-description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, team mission, and what makes this opportunity exciting..."
                  className={textareaClass("description")}
                />
                {fieldErrors.description && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fieldErrors.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Job Details */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="size-4 text-sky-600" />
                <span>Job Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 pt-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="employment-type"
                  className="block text-sm font-semibold"
                >
                  Employment Type <span className="text-rose-500">*</span>
                </label>
                <select
                  id="employment-type"
                  value={employmentType}
                  onChange={(e) =>
                    setEmploymentType(e.target.value as EmploymentTypeValue)
                  }
                  className={inputClass("employmentType")}
                >
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {EMPLOYMENT_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="work-mode"
                  className="block text-sm font-semibold"
                >
                  Work Mode <span className="text-rose-500">*</span>
                </label>
                <select
                  id="work-mode"
                  value={workMode}
                  onChange={(e) =>
                    setWorkMode(e.target.value as WorkModeValue)
                  }
                  className={inputClass("workMode")}
                >
                  {WORK_MODES.map((modeOpt) => (
                    <option key={modeOpt} value={modeOpt}>
                      {WORK_MODE_LABELS[modeOpt]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="job-location"
                  className="block text-sm font-semibold"
                >
                  Job Location <span className="text-rose-500">*</span>
                </label>
                <input
                  id="job-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India or Remote (US)"
                  className={inputClass("location")}
                />
                {fieldErrors.location && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fieldErrors.location}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="experience-level"
                  className="block text-sm font-semibold"
                >
                  Experience Level <span className="text-rose-500">*</span>
                </label>
                <select
                  id="experience-level"
                  value={experienceLevel}
                  onChange={(e) =>
                    setExperienceLevel(e.target.value as ExperienceLevelValue)
                  }
                  className={inputClass("experienceLevel")}
                >
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {EXPERIENCE_LEVEL_LABELS[lvl]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="min-experience"
                  className="block text-sm font-semibold"
                >
                  Minimum Experience (Years){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  id="min-experience"
                  type="number"
                  min={0}
                  max={50}
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                  placeholder="0"
                  className={inputClass("minExperience")}
                />
                {fieldErrors.minExperience && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fieldErrors.minExperience}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="max-experience"
                  className="block text-sm font-semibold"
                >
                  Maximum Experience (Years){" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </label>
                <input
                  id="max-experience"
                  type="number"
                  min={0}
                  max={50}
                  value={maxExperience}
                  onChange={(e) => setMaxExperience(e.target.value)}
                  placeholder="e.g. 5"
                  className={inputClass("maxExperience")}
                />
                {fieldErrors.maxExperience && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fieldErrors.maxExperience}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="salary-range"
                  className="block text-sm font-semibold"
                >
                  Salary Range{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </label>
                <input
                  id="salary-range"
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. $120,000 – $155,000 / year or ₹18L – ₹25L CTC"
                  className={inputClass("salaryRange")}
                />
                {fieldErrors.salaryRange && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fieldErrors.salaryRange}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Requirements */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-violet-600" />
                <span>Requirements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <SkillTagInput
                id="required-skills"
                label="Required Skills"
                required
                skills={requiredSkills}
                onChange={setRequiredSkills}
                placeholder="Type a skill (e.g. React, TypeScript, PostgreSQL) and press Enter or Add"
                error={fieldErrors.requiredSkills}
              />

              <div>
                <label
                  htmlFor="qualifications"
                  className="block text-sm font-semibold"
                >
                  Qualifications <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="qualifications"
                  rows={4}
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="List degree requirements, certifications, or core background expectations..."
                  className={textareaClass("qualifications")}
                />
                {fieldErrors.qualifications && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fieldErrors.qualifications}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="responsibilities"
                  className="block text-sm font-semibold"
                >
                  Responsibilities <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="responsibilities"
                  rows={4}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="Outline day-to-day responsibilities, key deliverables, and team collaboration..."
                  className={textareaClass("responsibilities")}
                />
                {fieldErrors.responsibilities && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fieldErrors.responsibilities}
                  </p>
                )}
              </div>

              <SkillTagInput
                id="preferred-skills"
                label="Preferred Skills (Optional)"
                skills={preferredSkills}
                onChange={setPreferredSkills}
                placeholder="Nice-to-have skills (e.g. GraphQL, Docker, AWS)"
                error={fieldErrors.preferredSkills}
              />
            </CardContent>
          </Card>

          {/* Section 4: Application Settings */}
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="size-4 text-sky-600" />
                <span>Application Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="sm:max-w-xs">
                <label
                  htmlFor="application-deadline"
                  className="block text-sm font-semibold"
                >
                  Application Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  id="application-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={inputClass("deadline")}
                />
                {fieldErrors.deadline && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fieldErrors.deadline}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="application-instructions"
                  className="block text-sm font-semibold"
                >
                  Additional Application Instructions{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </label>
                <textarea
                  id="application-instructions"
                  rows={3}
                  value={applicationInstructions}
                  onChange={(e) => setApplicationInstructions(e.target.value)}
                  placeholder="e.g. Include a portfolio link or GitHub profile when applying..."
                  className={textareaClass("applicationInstructions")}
                />
                {fieldErrors.applicationInstructions && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    {fieldErrors.applicationInstructions}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bottom Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenPreview}
              disabled={isSubmitting}
              className="min-h-11 rounded-xl gap-2 font-semibold"
            >
              <Eye className="size-4" />
              <span>Preview Before Publishing</span>
            </Button>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit("DRAFT", "DRAFT")}
                disabled={isSubmitting}
                className="min-h-11 rounded-xl px-5 font-semibold"
              >
                {submittingAction === "DRAFT" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                <span>Save as Draft</span>
              </Button>

              {mode === "edit" && initialJob?.status === "CLOSED" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmit("CLOSED", "SAVE")}
                    disabled={isSubmitting}
                    className="min-h-11 rounded-xl px-5 font-semibold"
                  >
                    {submittingAction === "SAVE" && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    <span>Save Changes</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit("OPEN", "OPEN")}
                    disabled={isSubmitting}
                    className="min-h-11 rounded-xl bg-violet-600 px-6 font-semibold text-white hover:bg-violet-700"
                  >
                    {submittingAction === "OPEN" ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 size-4" />
                    )}
                    <span>Save &amp; Reopen Job</span>
                  </Button>
                </>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 rounded-xl bg-violet-600 px-6 font-semibold text-white hover:bg-violet-700"
                >
                  {submittingAction === "OPEN" ||
                  submittingAction === "SAVE" ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 size-4" />
                  )}
                  <span>
                    {mode === "create"
                      ? "Publish Job"
                      : initialJob?.status === "DRAFT"
                        ? "Publish Job"
                        : "Save Changes"}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </form>
      </main>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-preview-title"
          onClick={() => {
            if (!isSubmitting) setIsPreviewOpen(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                  Job Posting Preview
                </p>
                <h2
                  id="job-preview-title"
                  className="mt-1 text-xl font-bold text-foreground"
                >
                  {title || "Untitled Role"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {companyName || "Your Company"} • {department || "Department"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                disabled={isSubmitting}
                aria-label="Close preview"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1">
                <BriefcaseBusiness className="size-3.5 text-violet-600" />
                {EMPLOYMENT_TYPE_LABELS[employmentType]}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1">
                <Globe className="size-3.5 text-sky-600" />
                {WORK_MODE_LABELS[workMode]}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1">
                <MapPin className="size-3.5" />
                {location}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                {EXPERIENCE_LEVEL_LABELS[experienceLevel]} ({minExperience}
                {maxExperience ? `–${maxExperience}` : "+"} yrs)
              </span>
              {salaryRange && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1">
                  {salaryRange}
                </span>
              )}
              {deadline && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1">
                  <Calendar className="size-3.5" />
                  Apply by {formatJobDate(deadline)}
                </span>
              )}
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="size-4 text-violet-600" />
                  Description
                </h3>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-foreground">Responsibilities</h3>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed text-muted-foreground">
                  {responsibilities}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-foreground">Qualifications</h3>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed text-muted-foreground">
                  {qualifications}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-foreground">Required Skills</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-500/20 dark:text-violet-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {preferredSkills.length > 0 && (
                <div>
                  <h3 className="font-bold text-foreground">Preferred Skills</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {preferredSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {applicationInstructions && (
                <div>
                  <h3 className="font-bold text-foreground">
                    Application Instructions
                  </h3>
                  <p className="mt-1.5 whitespace-pre-line leading-relaxed text-muted-foreground">
                    {applicationInstructions}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPreviewOpen(false)}
                disabled={isSubmitting}
                className="min-h-11 rounded-xl"
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit("OPEN", "OPEN")}
                disabled={isSubmitting}
                className="min-h-11 rounded-xl bg-violet-600 px-6 font-semibold text-white hover:bg-violet-700"
              >
                {submittingAction === "OPEN" ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Send className="mr-2 size-4" />
                )}
                <span>Publish Job Now</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
