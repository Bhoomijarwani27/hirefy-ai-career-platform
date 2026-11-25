"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  FileText,
  Globe,
  Loader2,
  MapPin,
  Plus,
  Save,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStoredResumes, getActiveResumeKey } from "@/lib/resume-storage";
import {
  PREFERRED_EMPLOYMENT_TYPES,
  PREFERRED_WORK_MODES,
  seekerProfileSchema,
  type RecommendedJobDTO,
  type SeekerProfileDTO,
} from "@/lib/seeker-profile";

interface SeekerProfileViewProps {
  initialProfile: SeekerProfileDTO;
  initialRecommendations: RecommendedJobDTO[];
}

export function SeekerProfileView({
  initialProfile,
  initialRecommendations,
}: SeekerProfileViewProps) {
  const router = useRouter();

  const [profile, setProfile] = useState<SeekerProfileDTO>(initialProfile);
  const [recommendations, setRecommendations] = useState<RecommendedJobDTO[]>(
    initialRecommendations
  );

  // Editable form state
  const [name, setName] = useState(initialProfile.name);
  const [title, setTitle] = useState(initialProfile.title);
  const [experienceYears, setExperienceYears] = useState(
    initialProfile.experienceYears !== null
      ? String(initialProfile.experienceYears)
      : ""
  );
  const [location, setLocation] = useState(initialProfile.location);
  const [preferredWorkMode, setPreferredWorkMode] = useState(
    initialProfile.preferredWorkMode || "ANY"
  );
  const [preferredEmploymentType, setPreferredEmploymentType] = useState(
    initialProfile.preferredEmploymentType || "ANY"
  );
  const [expectedSalary, setExpectedSalary] = useState(
    initialProfile.expectedSalary
  );
  const [skills, setSkills] = useState<string[]>(initialProfile.skills);
  const [skillDraft, setSkillDraft] = useState("");
  const [bio, setBio] = useState(initialProfile.bio);
  const [experience, setExperience] = useState(initialProfile.experience);
  const [education, setEducation] = useState(initialProfile.education);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const addSkillsFromInput = (raw: string) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;

    const existing = new Set(skills.map((s) => s.toLowerCase()));
    const next = [...skills];
    for (const part of parts) {
      if (!existing.has(part.toLowerCase())) {
        existing.add(part.toLowerCase());
        next.push(part);
      }
    }
    setSkills(next);
    setSkillDraft("");
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkillsFromInput(skillDraft);
    } else if (e.key === "Backspace" && !skillDraft && skills.length > 0) {
      setSkills(skills.slice(0, -1));
    }
  };

  const handleImportFromResume = () => {
    const stored = getStoredResumes();
    const activeKey = getActiveResumeKey();
    const active = stored[activeKey] || Object.values(stored)[0];
    if (!active || !active.knownSkills || active.knownSkills.length === 0) {
      setSubmitError(
        "No saved skills found in Resume Studio yet. Add your skills below or build a resume first."
      );
      return;
    }

    const existing = new Set(skills.map((s) => s.toLowerCase()));
    const merged = [...skills];
    for (const s of active.knownSkills) {
      if (!existing.has(s.toLowerCase())) {
        existing.add(s.toLowerCase());
        merged.push(s);
      }
    }
    setSkills(merged);
    if (!title && active.rawResumeData?.title) {
      setTitle(active.rawResumeData.title);
    }
    setSubmitError(null);
    setSuccessMessage(
      `Imported ${active.knownSkills.length} skills from "${active.name}". Click Save Profile to update recommendations.`
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setFieldErrors({});
    setSubmitError(null);
    setSuccessMessage(null);

    const payload = {
      name: name.trim() || undefined,
      title,
      bio,
      skills,
      experience,
      education,
      location,
      preferredWorkMode,
      preferredEmploymentType,
      experienceYears: experienceYears === "" ? null : Number(experienceYears),
      expectedSalary,
    };

    const parsed = seekerProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] ? String(issue.path[0]) : "form";
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      setSubmitError(
        parsed.error.issues[0]?.message ||
          "Please fix the highlighted validation errors."
      );
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/seeker/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors && typeof data.fieldErrors === "object") {
          setFieldErrors(data.fieldErrors);
        }
        throw new Error(data.error || "Failed to save profile.");
      }

      setProfile(data.profile);
      setRecommendations(data.recommendations || []);
      setSuccessMessage(
        "Profile saved! Your job recommendations have been updated."
      );
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = (field: string) =>
    `mt-1.5 min-h-11 w-full rounded-xl border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 ${
      fieldErrors[field] ? "border-rose-500" : "border-border"
    }`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader userName={profile.name || undefined} />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/seeker/dashboard"
              className="text-sm font-medium text-violet-700 hover:underline dark:text-violet-300"
            >
              ← Back to Dashboard
            </Link>
            <div className="mt-3 flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                <UserRound className="size-5" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  My Career Profile
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your target role, skills, and preferences to receive
                  personalized job recommendations.
                </p>
              </div>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="min-h-11 rounded-xl font-semibold gap-2"
          >
            <Link href="/seeker/jobs">
              <span>Browse All Jobs</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div
            role="status"
            className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="rounded-lg p-1 hover:bg-black/5"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {submitError && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Left: Profile Form (7 cols) */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 lg:col-span-7"
            noValidate
          >
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">
                  Basic &amp; Role Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="seeker-name" className="block text-sm font-semibold">
                    Full Name
                  </label>
                  <input
                    id="seeker-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className={inputClass("name")}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="seeker-email" className="block text-sm font-semibold">
                    Email
                  </label>
                  <input
                    id="seeker-email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-muted/40 px-3.5 text-sm text-muted-foreground"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="seeker-title" className="block text-sm font-semibold">
                    Target Role / Headline <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="seeker-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Frontend Developer, Product Designer, Data Analyst"
                    className={inputClass("title")}
                  />
                  {fieldErrors.title && (
                    <p className="mt-1 text-xs text-rose-600">{fieldErrors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="seeker-exp-years" className="block text-sm font-semibold">
                    Years of Experience
                  </label>
                  <input
                    id="seeker-exp-years"
                    type="number"
                    min={0}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="e.g. 2"
                    className={inputClass("experienceYears")}
                  />
                  {fieldErrors.experienceYears && (
                    <p className="mt-1 text-xs text-rose-600">
                      {fieldErrors.experienceYears}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="seeker-location" className="block text-sm font-semibold">
                    Preferred Location
                  </label>
                  <input
                    id="seeker-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, Remote, New York"
                    className={inputClass("location")}
                  />
                </div>

                <div>
                  <label htmlFor="seeker-work-mode" className="block text-sm font-semibold">
                    Preferred Work Mode
                  </label>
                  <select
                    id="seeker-work-mode"
                    value={preferredWorkMode}
                    onChange={(e) => setPreferredWorkMode(e.target.value)}
                    className={inputClass("preferredWorkMode")}
                  >
                    {PREFERRED_WORK_MODES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="seeker-emp-type" className="block text-sm font-semibold">
                    Employment Type
                  </label>
                  <select
                    id="seeker-emp-type"
                    value={preferredEmploymentType}
                    onChange={(e) => setPreferredEmploymentType(e.target.value)}
                    className={inputClass("preferredEmploymentType")}
                  >
                    {PREFERRED_EMPLOYMENT_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="seeker-salary" className="block text-sm font-semibold">
                    Expected Salary{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="seeker-salary"
                    type="text"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder="e.g. $110k+ or ₹12L CTC"
                    className={inputClass("expectedSalary")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                <CardTitle className="text-base">
                  Skills <span className="text-rose-500">*</span>
                </CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleImportFromResume}
                  className="h-9 rounded-xl text-xs font-semibold gap-1.5"
                >
                  <FileText className="size-3.5 text-violet-600" />
                  <span>Import from Resume Studio</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={skillDraft}
                    onChange={(e) => setSkillDraft(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    onBlur={() => {
                      if (skillDraft.trim()) addSkillsFromInput(skillDraft);
                    }}
                    placeholder="Add skills (e.g. React, TypeScript, Python) and press Enter"
                    className={`min-h-11 flex-1 rounded-xl border bg-background px-3.5 text-sm outline-none focus:border-violet-500 ${
                      fieldErrors.skills ? "border-rose-500" : "border-border"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addSkillsFromInput(skillDraft)}
                    className="min-h-11 rounded-xl px-4 font-semibold"
                  >
                    <Plus className="size-4" />
                    <span>Add</span>
                  </Button>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-200"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSkills(skills.filter((s) => s !== skill))
                          }
                          aria-label={`Remove ${skill}`}
                          className="rounded-full p-0.5 hover:bg-violet-200/70"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {fieldErrors.skills && (
                  <p className="text-xs font-medium text-rose-600">
                    {fieldErrors.skills}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">
                  Background &amp; Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div>
                  <label htmlFor="seeker-bio" className="block text-sm font-semibold">
                    About / Career Summary
                  </label>
                  <textarea
                    id="seeker-bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your background and the kind of work you enjoy..."
                    className="mt-1.5 w-full rounded-xl border border-border bg-background p-3.5 text-sm outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label htmlFor="seeker-exp" className="block text-sm font-semibold">
                    Experience Highlights
                  </label>
                  <textarea
                    id="seeker-exp"
                    rows={3}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Key roles, projects, or accomplishments..."
                    className="mt-1.5 w-full rounded-xl border border-border bg-background p-3.5 text-sm outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label htmlFor="seeker-edu" className="block text-sm font-semibold">
                    Education
                  </label>
                  <textarea
                    id="seeker-edu"
                    rows={2}
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="Degree, university, and graduation year..."
                    className="mt-1.5 w-full rounded-xl border border-border bg-background p-3.5 text-sm outline-none focus:border-violet-500"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="min-h-11 rounded-xl bg-violet-600 px-6 font-semibold text-white hover:bg-violet-700"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                <span>
                  {isSaving
                    ? "Saving & Updating Matches..."
                    : "Save Profile & Get Recommendations"}
                </span>
              </Button>
            </div>
          </form>

          {/* Right: Live Recommended Jobs (5 cols) */}
          <aside className="space-y-4 lg:col-span-5">
            <Card className="border-violet-200/80 dark:border-violet-500/30">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-4 text-violet-600" />
                    Recommended Jobs ({recommendations.length})
                  </span>
                  <Link
                    href="/seeker/jobs"
                    className="text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300"
                  >
                    See all →
                  </Link>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 pt-4">
                {!profile.title && profile.skills.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    Add your <strong>Target Role</strong> and{" "}
                    <strong>Skills</strong> on the left and save your profile to
                    unlock personalized job recommendations.
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    No open jobs are posted yet. Check back soon!
                  </div>
                ) : (
                  recommendations.slice(0, 6).map((job) => (
                    <div
                      key={job.id}
                      className="rounded-xl border border-border bg-background p-4 space-y-2.5 hover:border-violet-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-foreground">
                            {job.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {job.company} • {job.location}
                          </p>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
                          <Award className="size-3" />
                          {job.matchScore}% Match
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
                          <BriefcaseBusiness className="size-3" />
                          {job.type}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
                          <Globe className="size-3" />
                          {job.mode}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
                          <MapPin className="size-3" />
                          {job.salary}
                        </span>
                      </div>

                      {job.matchReasons.length > 0 && (
                        <p className="text-[11px] text-muted-foreground">
                          {job.matchReasons.join(" • ")}
                        </p>
                      )}

                      {job.matchedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {job.matchedSkills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                            >
                              <Check className="size-2.5" />
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-border pt-2.5">
                        <span className="text-[11px] text-muted-foreground">
                          {job.isApplied ? "Already applied" : job.age}
                        </span>
                        <Link
                          href="/seeker/jobs"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300"
                        >
                          <span>View &amp; Apply</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
