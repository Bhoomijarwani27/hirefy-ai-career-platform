"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  Search,
  Sparkles,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";

import { ApplicantResumeModal } from "@/components/dashboard/applicant-resume-modal";
import { ApplicationStatusBadge } from "@/components/dashboard/application-status-badge";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { JobConfirmDialog } from "@/components/dashboard/job-confirm-dialog";
import { JobStatusBadge } from "@/components/dashboard/job-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  APPLICATION_FILTER_TABS,
  getCandidateInitials,
  type AiRankedCandidateDTO,
  type ApplicantDTO,
  type ApplicationStatusValue,
} from "@/lib/application-types";
import { formatJobDate, type CompanyJobDTO } from "@/lib/job-validation";
import { downloadResumeDirect } from "@/lib/resume-pdf-template";

interface JobApplicationsViewProps {
  job: CompanyJobDTO;
  initialApplications: ApplicantDTO[];
  companyName?: string | null;
}

export function JobApplicationsView({
  job,
  initialApplications,
  companyName,
}: JobApplicationsViewProps) {
  const [applications, setApplications] =
    useState<ApplicantDTO[]>(initialApplications);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [onlySavedForJob, setOnlySavedForJob] = useState(false);

  // Resume Preview modal
  const [resumeModalApplicant, setResumeModalApplicant] =
    useState<ApplicantDTO | null>(null);

  // Reject confirmation modal
  const [rejectTarget, setRejectTarget] = useState<ApplicantDTO | null>(null);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});

  // AI Ranking state
  const [isRanking, setIsRanking] = useState(false);
  const [aiRankings, setAiRankings] = useState<AiRankedCandidateDTO[] | null>(
    null
  );
  const [aiError, setAiError] = useState<string | null>(null);

  // Feedback banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: applications.length,
      APPLIED: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
      SAVED_FOR_JOB: 0,
    };
    for (const app of applications) {
      if (counts[app.status] !== undefined) {
        counts[app.status] += 1;
      }
      if (app.savedForJob) counts.SAVED_FOR_JOB += 1;
    }
    return counts;
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesStatus =
        statusFilter === "ALL" || app.status === statusFilter;
      const matchesSaved = !onlySavedForJob || app.savedForJob;
      const matchesSearch =
        !q || app.candidateName.toLowerCase().includes(q);
      return matchesStatus && matchesSaved && matchesSearch;
    });
  }, [applications, searchQuery, statusFilter, onlySavedForJob]);

  const setBusy = (key: string, val: boolean) =>
    setBusyIds((prev) => ({ ...prev, [key]: val }));

  const handleUpdateStatus = async (
    applicant: ApplicantDTO,
    nextStatus: ApplicationStatusValue
  ) => {
    const key = `status-${applicant.id}`;
    if (busyIds[key]) return;
    setBusy(key, true);
    setFeedback(null);

    try {
      const res = await fetch(
        `/api/company/applicants/${job.id}/${applicant.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update application status.");
      }

      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicant.id ? { ...a, status: nextStatus } : a
        )
      );
      setFeedback({
        type: "success",
        message:
          nextStatus === "SHORTLISTED"
            ? `${applicant.candidateName} has been shortlisted and is now available in Application Tracking.`
            : `${applicant.candidateName}'s application was marked as Rejected.`,
      });
      setRejectTarget(null);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update application status.",
      });
    } finally {
      setBusy(key, false);
    }
  };

  const handleToggleSaveForJob = async (applicant: ApplicantDTO) => {
    const key = `job-save-${applicant.id}`;
    if (busyIds[key]) return;
    setBusy(key, true);
    setFeedback(null);

    const method = applicant.savedForJob ? "DELETE" : "POST";
    try {
      const res = await fetch(`/api/company/applicants/${job.id}/save`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: applicant.candidateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update job-saved status.");
      }

      setApplications((prev) =>
        prev.map((a) =>
          a.candidateId === applicant.candidateId
            ? { ...a, savedForJob: Boolean(data.savedForJob) }
            : a
        )
      );
      setFeedback({
        type: "success",
        message: data.savedForJob
          ? `Saved ${applicant.candidateName} for "${job.title}".`
          : `Removed ${applicant.candidateName} from "${job.title}" saved list.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to save candidate.",
      });
    } finally {
      setBusy(key, false);
    }
  };

  const handleToggleSaveGenerally = async (applicant: ApplicantDTO) => {
    const key = `gen-save-${applicant.id}`;
    if (busyIds[key]) return;
    setBusy(key, true);
    setFeedback(null);

    const method = applicant.savedGenerally ? "DELETE" : "POST";
    try {
      const res = await fetch("/api/company/saved-candidates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: applicant.candidateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update general saved list.");
      }

      setApplications((prev) =>
        prev.map((a) =>
          a.candidateId === applicant.candidateId
            ? { ...a, savedGenerally: Boolean(data.savedGenerally) }
            : a
        )
      );
      setFeedback({
        type: "success",
        message: data.savedGenerally
          ? `Saved ${applicant.candidateName} to your company's general saved candidates.`
          : `Removed ${applicant.candidateName} from your company's general saved candidates.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to save candidate.",
      });
    } finally {
      setBusy(key, false);
    }
  };

  const handleRunAiRanking = async () => {
    if (isRanking || applications.length === 0) return;
    setIsRanking(true);
    setAiError(null);
    setFeedback(null);

    try {
      const res = await fetch(`/api/company/applicants/${job.id}/ai-rank`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to run AI ranking.");
      }
      setAiRankings(data.rankings || []);
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "Failed to run AI ranking."
      );
    } finally {
      setIsRanking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Back & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground"
          >
            <Link
              href="/company/dashboard"
              className="hover:text-foreground transition-colors"
            >
              Company Dashboard
            </Link>
            <span>/</span>
            <Link
              href="/company/applicants"
              className="hover:text-foreground transition-colors"
            >
              Applications
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">{job.title}</span>
          </nav>

          <Link
            href="/company/applicants"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Posted Jobs</span>
          </Link>
        </div>

        {/* Top Selected Job Banner + AI Ranking CTA */}
        <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {job.title}
              </h1>
              <JobStatusBadge status={job.status} />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm">
              <span>{companyName || "Your Company"}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                <Users className="size-4 text-sky-600" />
                {applications.length}{" "}
                {applications.length === 1 ? "Application" : "Applications"}
              </span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleRunAiRanking}
            disabled={isRanking || applications.length === 0}
            className="min-h-11 shrink-0 rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-700 shadow-xs gap-2"
          >
            {isRanking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            <span>{isRanking ? "Ranking Applicants..." : "AI Ranking"}</span>
          </Button>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            role="status"
            className={`mt-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === "success" ? (
                <CheckCircle2 className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* AI Error Banner */}
        {aiError && (
          <div
            role="alert"
            className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0" />
              <span>{aiError}</span>
            </div>
            <button
              type="button"
              onClick={() => setAiError(null)}
              className="rounded-lg p-1 hover:bg-black/5"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* AI-Assisted Ranking Results Panel */}
        {aiRankings && (
          <section className="mt-6">
            <Card className="border-violet-200 bg-violet-50/30 dark:border-violet-500/30 dark:bg-violet-950/15">
              <CardHeader className="flex flex-col gap-2 border-b border-violet-200/70 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-violet-500/20">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Sparkles className="size-4 text-violet-600" />
                    <CardTitle className="text-base">
                      AI-Assisted Ranking for {job.title}
                    </CardTitle>
                    <span className="rounded-full border border-violet-300 bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/20 dark:text-violet-200">
                      AI-Assisted
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Evaluates only the applicants of this job against its
                    requirements. Recruiters remain in full control of all
                    shortlist and rejection decisions.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setAiRankings(null)}
                  className="self-start rounded-xl text-xs sm:self-auto"
                >
                  Hide Ranking
                </Button>
              </CardHeader>

              <CardContent className="grid gap-4 pt-5">
                {aiRankings.map((ranked) => {
                  const app = applications.find(
                    (a) => a.id === ranked.applicationId
                  );
                  return (
                    <div
                      key={ranked.applicationId}
                      className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-sm font-extrabold text-white">
                            #{ranked.rank}
                          </span>
                          <div>
                            <h3 className="text-base font-bold text-foreground">
                              {ranked.candidateName}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Relevant Experience: {ranked.relevantExperience}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
                            <Award className="size-3.5" />
                            {ranked.matchScore}% Match
                          </span>
                          {app && (
                            <ApplicationStatusBadge status={app.status} />
                          )}
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed text-foreground/90">
                        {ranked.explanation}
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Matching Skills
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {ranked.matchingSkills.length > 0 ? (
                              ranked.matchingSkills.map((s) => (
                                <span
                                  key={s}
                                  className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/30"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                None explicitly matched
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            Missing or Weaker Required Skills
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {ranked.missingSkills.length > 0 ? (
                              ranked.missingSkills.map((s) => (
                                <span
                                  key={s}
                                  className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/30"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                No major gaps identified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {app && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="min-h-9 rounded-xl text-xs font-semibold"
                          >
                            <Link
                              href={`/company/applicants/${job.id}/${app.id}`}
                            >
                              <Eye className="size-3.5" />
                              <span>View Application</span>
                            </Link>
                          </Button>

                          {app.status !== "SHORTLISTED" && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(app, "SHORTLISTED")
                              }
                              disabled={busyIds[`status-${app.id}`]}
                              className="min-h-9 rounded-xl bg-violet-600 text-xs font-semibold text-white hover:bg-violet-700"
                            >
                              <UserCheck className="size-3.5" />
                              <span>Shortlist</span>
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleSaveForJob(app)}
                            disabled={busyIds[`job-save-${app.id}`]}
                            className="min-h-9 rounded-xl text-xs font-semibold"
                          >
                            {app.savedForJob ? (
                              <BookmarkCheck className="size-3.5 text-violet-600" />
                            ) : (
                              <Bookmark className="size-3.5" />
                            )}
                            <span>
                              {app.savedForJob
                                ? "Saved for This Job"
                                : "Save for This Job"}
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Search & Status Filters */}
        <section className="mt-6 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applicants by name..."
                aria-label="Search applicants by name"
                className="min-h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <button
              type="button"
              onClick={() => setOnlySavedForJob((v) => !v)}
              className={`inline-flex min-h-10 items-center gap-2 self-start rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all lg:self-auto ${
                onlySavedForJob
                  ? "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-600/60 dark:bg-violet-500/20 dark:text-violet-200"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <BookmarkCheck className="size-4" />
              <span>Saved for This Job ({filterCounts.SAVED_FOR_JOB})</span>
            </button>
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter applicants by status"
          >
            {APPLICATION_FILTER_TABS.map((tab) => {
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                    active
                      ? "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-600/60 dark:bg-violet-500/20 dark:text-violet-200"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      active
                        ? "bg-violet-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {filterCounts[tab.value] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Applicants List */}
        {applications.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <Users className="size-10 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-bold">No applications yet</h2>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                No candidates have applied to &ldquo;{job.title}&rdquo; yet.
              </p>
            </CardContent>
          </Card>
        ) : filteredApplications.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="px-6 py-12 text-center">
              <p className="text-sm font-semibold">
                No applicants match your current search or filters.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setOnlySavedForJob(false);
                }}
                className="mt-4 min-h-10 rounded-xl"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="flex flex-col justify-between">
                <CardContent className="flex h-full flex-col justify-between p-5 space-y-4">
                  <div className="space-y-3.5">
                    {/* Candidate Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {app.candidateImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={app.candidateImage}
                            alt={app.candidateName}
                            className="size-11 shrink-0 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
                            {getCandidateInitials(app.candidateName)}
                          </span>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/company/applicants/${job.id}/${app.id}`}
                            className="block truncate text-base font-bold text-foreground hover:text-violet-600 transition-colors"
                          >
                            {app.candidateName}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">
                            {app.candidateTitle || app.candidateEmail}
                          </p>
                        </div>
                      </div>
                      <ApplicationStatusBadge status={app.status} />
                    </div>

                    {/* Skills */}
                    {app.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {app.skills.slice(0, 6).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                        {app.skills.length > 6 && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                            +{app.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Experience, Education, Date */}
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <BriefcaseBusiness className="mt-0.5 size-3.5 shrink-0 text-violet-600" />
                        <span className="line-clamp-2">
                          {app.experienceSummary ||
                            "Experience not specified on profile"}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-sky-600" />
                        <span className="line-clamp-2">
                          {app.educationSummary ||
                            "Education not specified on profile"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="size-3.5 shrink-0" />
                          Applied {formatJobDate(app.appliedAt)}
                        </span>

                        {app.resumeData && (
                          <button
                            type="button"
                            onClick={() =>
                              downloadResumeDirect(
                                app.resumeData!,
                                `${app.candidateName.replace(/\s+/g, "_")}_Resume.pdf`
                              )
                            }
                            className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:underline dark:text-violet-300"
                          >
                            <Download className="size-3.5" />
                            <span>Download PDF</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* All 6 Required Actions */}
                  <div className="grid grid-cols-2 gap-2 border-t border-border pt-3.5 sm:grid-cols-3">
                    <Button
                      asChild
                      variant="outline"
                      className="min-h-10 rounded-xl text-xs font-semibold"
                    >
                      <Link href={`/company/applicants/${job.id}/${app.id}`}>
                        <Eye className="size-3.5" />
                        <span>View Application</span>
                      </Link>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setResumeModalApplicant(app)}
                      className="min-h-10 rounded-xl text-xs font-semibold"
                    >
                      <FileText className="size-3.5" />
                      <span>View Resume</span>
                    </Button>

                    <Button
                      type="button"
                      variant={
                        app.status === "SHORTLISTED" ? "default" : "outline"
                      }
                      disabled={
                        busyIds[`status-${app.id}`] ||
                        app.status === "SHORTLISTED"
                      }
                      onClick={() => handleUpdateStatus(app, "SHORTLISTED")}
                      className={`min-h-10 rounded-xl text-xs font-semibold ${
                        app.status === "SHORTLISTED"
                          ? "bg-violet-600 text-white"
                          : "text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/10"
                      }`}
                    >
                      <UserCheck className="size-3.5" />
                      <span>
                        {app.status === "SHORTLISTED"
                          ? "Shortlisted"
                          : "Shortlist"}
                      </span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        busyIds[`status-${app.id}`] || app.status === "REJECTED"
                      }
                      onClick={() => setRejectTarget(app)}
                      className="min-h-10 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    >
                      <UserX className="size-3.5" />
                      <span>
                        {app.status === "REJECTED" ? "Rejected" : "Reject"}
                      </span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={busyIds[`job-save-${app.id}`]}
                      onClick={() => handleToggleSaveForJob(app)}
                      className={`min-h-10 rounded-xl text-xs font-semibold ${
                        app.savedForJob
                          ? "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-200"
                          : ""
                      }`}
                    >
                      {app.savedForJob ? (
                        <BookmarkCheck className="size-3.5 text-violet-600" />
                      ) : (
                        <Bookmark className="size-3.5" />
                      )}
                      <span className="truncate">
                        {app.savedForJob ? "Saved (Job)" : "Save for This Job"}
                      </span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={busyIds[`gen-save-${app.id}`]}
                      onClick={() => handleToggleSaveGenerally(app)}
                      className={`min-h-10 rounded-xl text-xs font-semibold ${
                        app.savedGenerally
                          ? "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-200"
                          : ""
                      }`}
                    >
                      {app.savedGenerally ? (
                        <BookmarkCheck className="size-3.5 text-sky-600" />
                      ) : (
                        <Bookmark className="size-3.5" />
                      )}
                      <span className="truncate">
                        {app.savedGenerally
                          ? "Saved (General)"
                          : "Save Generally"}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </main>

      {/* Resume Preview & Download Modal */}
      <ApplicantResumeModal
        applicant={resumeModalApplicant}
        onClose={() => setResumeModalApplicant(null)}
      />

      {/* Reject Confirmation Dialog */}
      <JobConfirmDialog
        open={Boolean(rejectTarget)}
        title="Reject Application?"
        description={
          rejectTarget
            ? `Are you sure you want to mark ${rejectTarget.candidateName}'s application for "${job.title}" as Rejected? Their candidate profile will not be deleted.`
            : ""
        }
        confirmLabel="Reject Application"
        variant="danger"
        isLoading={
          rejectTarget ? Boolean(busyIds[`status-${rejectTarget.id}`]) : false
        }
        onConfirm={() => {
          if (rejectTarget) handleUpdateStatus(rejectTarget, "REJECTED");
        }}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  );
}
