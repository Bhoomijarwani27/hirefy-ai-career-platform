"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  Layers3,
  Loader2,
  UserX,
  Users,
  X,
} from "lucide-react";

import { ApplicationStatusBadge } from "@/components/dashboard/application-status-badge";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCandidateInitials } from "@/lib/application-types";
import { formatJobDate, type CompanyJobDTO } from "@/lib/job-validation";
import {
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  getNextPipelineStage,
  getPrevPipelineStage,
  type PipelineStageValue,
  type TrackingCandidateDTO,
} from "@/lib/tracking-types";

interface ApplicationTrackingBoardProps {
  jobs: CompanyJobDTO[];
  initialSelectedJobId: string | null;
  initialCandidates: TrackingCandidateDTO[];
  companyName?: string | null;
}

const COLUMN_ACCENTS: Record<PipelineStageValue, string> = {
  SHORTLISTED: "border-t-4 border-t-violet-500",
  INTERVIEW: "border-t-4 border-t-amber-500",
  SELECTED: "border-t-4 border-t-emerald-500",
  REJECTED: "border-t-4 border-t-rose-500",
};

export function ApplicationTrackingBoard({
  jobs,
  initialSelectedJobId,
  initialCandidates,
  companyName,
}: ApplicationTrackingBoardProps) {
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialSelectedJobId ?? ""
  );
  const [candidates, setCandidates] =
    useState<TrackingCandidateDTO[]>(initialCandidates);
  const [mobileStage, setMobileStage] =
    useState<PipelineStageValue>("SHORTLISTED");
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [busyAppId, setBusyAppId] = useState<string | null>(null);

  // Stage transition modal (for Reject reason or Selected offer status / note)
  const [transitionModal, setTransitionModal] = useState<{
    candidate: TrackingCandidateDTO;
    nextStage: PipelineStageValue;
  } | null>(null);
  const [transitionNote, setTransitionNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [offerStatus, setOfferStatus] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === selectedJobId) ?? null,
    [jobs, selectedJobId]
  );

  const groupedByStage = useMemo(() => {
    const groups: Record<PipelineStageValue, TrackingCandidateDTO[]> = {
      SHORTLISTED: [],
      INTERVIEW: [],
      SELECTED: [],
      REJECTED: [],
    };
    for (const c of candidates) {
      if (c.status === "SHORTLISTED") groups.SHORTLISTED.push(c);
      else if (c.status === "INTERVIEW") groups.INTERVIEW.push(c);
      else if (c.status === "SELECTED" || c.status === "OFFER")
        groups.SELECTED.push(c);
      else if (c.status === "REJECTED") groups.REJECTED.push(c);
    }
    return groups;
  }, [candidates]);

  const handleSelectJob = async (nextJobId: string) => {
    setSelectedJobId(nextJobId);
    setFeedback(null);
    if (!nextJobId) {
      setCandidates([]);
      return;
    }

    setIsLoadingJob(true);
    router.replace(`/company/candidates?jobId=${encodeURIComponent(nextJobId)}`, {
      scroll: false,
    });

    try {
      const res = await fetch(
        `/api/company/candidates?jobId=${encodeURIComponent(nextJobId)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load recruitment pipeline.");
      }
      setCandidates(data.candidates || []);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to load recruitment pipeline.",
      });
    } finally {
      setIsLoadingJob(false);
    }
  };

  const executeStageChange = async (
    candidate: TrackingCandidateDTO,
    nextStage: PipelineStageValue,
    extra?: {
      note?: string;
      rejectionReason?: string;
      offerStatus?: string;
    }
  ) => {
    if (busyAppId) return;
    setBusyAppId(candidate.id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/company/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStage,
          note: extra?.note || null,
          rejectionReason: extra?.rejectionReason || null,
          offerStatus: extra?.offerStatus || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to move candidate stage.");
      }

      setCandidates((prev) =>
        prev.map((c) => (c.id === candidate.id ? data.candidate : c))
      );
      setFeedback({
        type: "success",
        message: `Moved ${candidate.candidateName} to ${PIPELINE_STAGE_LABELS[nextStage]}.`,
      });
      setTransitionModal(null);
      setTransitionNote("");
      setRejectionReason("");
      setOfferStatus("");
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to move candidate stage.",
      });
    } finally {
      setBusyAppId(null);
    }
  };

  const requestStageMove = (
    candidate: TrackingCandidateDTO,
    nextStage: PipelineStageValue
  ) => {
    if (nextStage === "REJECTED" || nextStage === "SELECTED") {
      setTransitionNote("");
      setRejectionReason(candidate.rejectionReason || "");
      setOfferStatus(candidate.offerStatus || "");
      setTransitionModal({ candidate, nextStage });
      return;
    }
    executeStageChange(candidate, nextStage);
  };

  const renderCandidateCard = (c: TrackingCandidateDTO) => {
    const nextStage = getNextPipelineStage(c.status);
    const prevStage = getPrevPipelineStage(c.status);
    const isBusy = busyAppId === c.id;

    return (
      <Card key={c.id} className="border-border shadow-xs">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {c.candidateImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.candidateImage}
                  alt={c.candidateName}
                  className="size-10 shrink-0 rounded-full object-cover border border-border"
                />
              ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
                  {getCandidateInitials(c.candidateName)}
                </span>
              )}
              <div className="min-w-0">
                <Link
                  href={`/company/candidates/${c.id}`}
                  className="block truncate text-sm font-bold text-foreground hover:text-violet-600 transition-colors"
                >
                  {c.candidateName}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {c.jobTitle}
                </p>
              </div>
            </div>

            <ApplicationStatusBadge status={c.status} />
          </div>

          {/* Skills */}
          {c.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {c.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                >
                  {skill}
                </span>
              ))}
              {c.skills.length > 4 && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  +{c.skills.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Experience & Meta */}
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {c.experienceSummary && (
              <p className="line-clamp-2 leading-relaxed">
                {c.experienceSummary}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3" />
                Updated {formatJobDate(c.updatedAt)}
              </span>

              {c.interviewRoundsCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                  <Calendar className="size-3" />
                  {c.interviewRoundsCount}{" "}
                  {c.interviewRoundsCount === 1 ? "round" : "rounds"}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex flex-wrap gap-1.5">
              {prevStage && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => requestStageMove(c, prevStage)}
                  className="min-h-9 flex-1 rounded-lg px-2 text-xs font-semibold"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>{PIPELINE_STAGE_LABELS[prevStage]}</span>
                </Button>
              )}

              {nextStage && (
                <Button
                  type="button"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => requestStageMove(c, nextStage)}
                  className="min-h-9 flex-1 rounded-lg bg-violet-600 px-2 text-xs font-semibold text-white hover:bg-violet-700"
                >
                  <span>{PIPELINE_STAGE_LABELS[nextStage]}</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="min-h-9 flex-1 rounded-lg text-xs font-semibold"
              >
                <Link href={`/company/candidates/${c.id}`}>
                  <Eye className="size-3.5" />
                  <span>Tracking Details</span>
                </Link>
              </Button>

              {c.status !== "REJECTED" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => requestStageMove(c, "REJECTED")}
                  aria-label={`Reject ${c.candidateName}`}
                  className="min-h-9 rounded-lg px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <UserX className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
            >
              <Link
                href="/company/dashboard"
                className="hover:text-foreground transition-colors"
              >
                Company Dashboard
              </Link>
              <span>/</span>
              <span className="font-semibold text-foreground">
                Application Tracking
              </span>
            </nav>

            <h1 className="mt-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Application Tracking
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {companyName
                ? `Manage shortlisted candidates and interview rounds for ${companyName}.`
                : "Track shortlisted candidates through interviews, selection, and final outcomes."}
            </p>
          </div>

          {/* Job Selector */}
          {jobs.length > 0 && (
            <div className="w-full lg:w-80">
              <label
                htmlFor="pipeline-job-select"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Select Job Pipeline
              </label>
              <select
                id="pipeline-job-select"
                value={selectedJobId}
                onChange={(e) => handleSelectJob(e.target.value)}
                disabled={isLoadingJob}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-foreground outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              >
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.department || "General"})
                  </option>
                ))}
              </select>
            </div>
          )}
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
              className="rounded-lg p-1 hover:bg-black/5"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* No Jobs State */}
        {jobs.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <BriefcaseBusiness className="size-10 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-bold">No posted jobs yet</h2>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                Post a job first, then shortlist candidates in Applications to
                track them through your recruitment pipeline here.
              </p>
              <Button
                asChild
                className="mt-6 min-h-11 rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-700"
              >
                <Link href="/company/jobs/new">Post New Job</Link>
              </Button>
            </CardContent>
          </Card>
        ) : isLoadingJob ? (
          <Card className="mt-6">
            <CardContent className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-violet-600" />
              <span>Loading pipeline...</span>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stage Counts Summary Strip */}
            <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PIPELINE_STAGES.map((stage) => (
                <Card key={stage} className="py-3.5">
                  <CardContent className="flex items-center justify-between px-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        {PIPELINE_STAGE_LABELS[stage]}
                      </p>
                      <p className="mt-0.5 text-xl font-bold">
                        {groupedByStage[stage].length}
                      </p>
                    </div>
                    <Layers3 className="size-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </section>

            {candidates.length === 0 ? (
              <Card className="mt-6">
                <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <Users className="size-10 text-muted-foreground" />
                  <h2 className="mt-4 text-lg font-bold">
                    No shortlisted candidates for{" "}
                    {selectedJob?.title || "this job"} yet
                  </h2>
                  <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                    Review applicants for this job in the Applications section
                    and click <strong>Shortlist</strong> to move them into this
                    pipeline.
                  </p>
                  {selectedJob && (
                    <Button
                      asChild
                      variant="outline"
                      className="mt-6 min-h-11 rounded-xl font-semibold"
                    >
                      <Link href={`/company/applicants/${selectedJob.id}`}>
                        Go to Job Applications
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Mobile/Tablet Stage Tabs (< lg) — avoids horizontal scroll */}
                <section className="mt-6 lg:hidden">
                  <div
                    className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                    role="tablist"
                    aria-label="Recruitment pipeline stages"
                  >
                    {PIPELINE_STAGES.map((stage) => {
                      const active = mobileStage === stage;
                      return (
                        <button
                          key={stage}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setMobileStage(stage)}
                          className={`flex min-h-11 items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                            active
                              ? "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-600/60 dark:bg-violet-500/20 dark:text-violet-200"
                              : "border-border bg-card text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <span>{PIPELINE_STAGE_LABELS[stage]}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              active
                                ? "bg-violet-600 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {groupedByStage[stage].length}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-3">
                    {groupedByStage[mobileStage].length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                        No candidates in {PIPELINE_STAGE_LABELS[mobileStage]}.
                      </div>
                    ) : (
                      groupedByStage[mobileStage].map(renderCandidateCard)
                    )}
                  </div>
                </section>

                {/* Desktop 4-Column Kanban Pipeline (>= lg) */}
                <section className="mt-6 hidden lg:grid lg:grid-cols-4 lg:gap-4 lg:items-start">
                  {PIPELINE_STAGES.map((stage) => (
                    <div
                      key={stage}
                      className={`rounded-2xl border border-border bg-muted/25 p-3.5 ${COLUMN_ACCENTS[stage]}`}
                    >
                      <div className="mb-3 flex items-center justify-between px-1">
                        <h2 className="text-sm font-bold text-foreground">
                          {PIPELINE_STAGE_LABELS[stage]}
                        </h2>
                        <span className="rounded-full bg-background border border-border px-2.5 py-0.5 text-xs font-bold text-foreground">
                          {groupedByStage[stage].length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {groupedByStage[stage].length === 0 ? (
                          <div className="rounded-xl border border-dashed border-border bg-background/50 p-6 text-center text-xs text-muted-foreground">
                            No candidates in this stage
                          </div>
                        ) : (
                          groupedByStage[stage].map(renderCandidateCard)
                        )}
                      </div>
                    </div>
                  ))}
                </section>
              </>
            )}
          </>
        )}
      </main>

      {/* Stage Transition Modal (Selected / Rejected) */}
      {transitionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!busyAppId) setTransitionModal(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">
                  Move {transitionModal.candidate.candidateName} to{" "}
                  {PIPELINE_STAGE_LABELS[transitionModal.nextStage]}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {transitionModal.nextStage === "REJECTED"
                    ? "Their application and recruitment history will be preserved. Their profile will not be deleted."
                    : "Record selection details and optional offer status."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTransitionModal(null)}
                disabled={Boolean(busyAppId)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {transitionModal.nextStage === "SELECTED" && (
              <div>
                <label
                  htmlFor="modal-offer-status"
                  className="block text-xs font-semibold"
                >
                  Offer Status (Optional)
                </label>
                <input
                  id="modal-offer-status"
                  type="text"
                  value={offerStatus}
                  onChange={(e) => setOfferStatus(e.target.value)}
                  placeholder="e.g. Offer Sent, Pending Approval, Accepted"
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-violet-500"
                />
              </div>
            )}

            {transitionModal.nextStage === "REJECTED" && (
              <div>
                <label
                  htmlFor="modal-rejection-reason"
                  className="block text-xs font-semibold"
                >
                  Rejection Reason (Optional)
                </label>
                <textarea
                  id="modal-rejection-reason"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Optional reason for internal recruitment records..."
                  className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-violet-500"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="modal-stage-note"
                className="block text-xs font-semibold"
              >
                Stage Change Note (Optional)
              </label>
              <input
                id="modal-stage-note"
                type="text"
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                placeholder="Optional note for recruitment history..."
                className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTransitionModal(null)}
                disabled={Boolean(busyAppId)}
                className="min-h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={Boolean(busyAppId)}
                onClick={() =>
                  executeStageChange(
                    transitionModal.candidate,
                    transitionModal.nextStage,
                    {
                      note: transitionNote,
                      rejectionReason,
                      offerStatus,
                    }
                  )
                }
                className={`min-h-11 rounded-xl font-semibold text-white ${
                  transitionModal.nextStage === "REJECTED"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {busyAppId && <Loader2 className="mr-2 size-4 animate-spin" />}
                Confirm {PIPELINE_STAGE_LABELS[transitionModal.nextStage]}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
