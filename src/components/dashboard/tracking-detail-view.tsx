"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock3,
  Download,
  FileEdit,
  FileText,
  GraduationCap,
  History,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Save,
  Trash2,
  User,
  Video,
  X,
} from "lucide-react";

import { ApplicantResumeModal } from "@/components/dashboard/applicant-resume-modal";
import { ApplicationStatusBadge } from "@/components/dashboard/application-status-badge";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { JobConfirmDialog } from "@/components/dashboard/job-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  APPLICATION_STATUS_LABELS,
  getCandidateInitials,
  type ApplicantDTO,
} from "@/lib/application-types";
import { formatJobDate } from "@/lib/job-validation";
import { downloadResumeDirect } from "@/lib/resume-pdf-template";
import {
  INTERVIEW_MODES,
  INTERVIEW_MODE_LABELS,
  INTERVIEW_RESULTS,
  INTERVIEW_RESULT_LABELS,
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  formatDateTime,
  toDateTimeLocalValue,
  type InterviewModeValue,
  type InterviewResultValue,
  type InterviewRoundDTO,
  type PipelineStageValue,
  type TrackingCandidateDTO,
} from "@/lib/tracking-types";

interface TrackingDetailViewProps {
  initialCandidate: TrackingCandidateDTO;
  companyName?: string | null;
}

const RESULT_BADGE_STYLE: Record<InterviewResultValue, string> = {
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
  PASSED:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
  FAILED:
    "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300",
  ON_HOLD:
    "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300",
};

export function TrackingDetailView({
  initialCandidate,
  companyName,
}: TrackingDetailViewProps) {
  const [candidate, setCandidate] =
    useState<TrackingCandidateDTO>(initialCandidate);

  // Recruiter notes, offer status, rejection reason
  const [recruiterNotes, setRecruiterNotes] = useState(
    initialCandidate.recruiterNotes ?? ""
  );
  const [offerStatus, setOfferStatus] = useState(
    initialCandidate.offerStatus ?? ""
  );
  const [rejectionReason, setRejectionReason] = useState(
    initialCandidate.rejectionReason ?? ""
  );
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isChangingStage, setIsChangingStage] = useState(false);

  // Resume modal
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  // Interview Round modal (Add or Edit)
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<InterviewRoundDTO | null>(
    null
  );
  const [roundName, setRoundName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [mode, setMode] = useState<InterviewModeValue>("ONLINE");
  const [meetingLinkOrLocation, setMeetingLinkOrLocation] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [roundNotes, setRoundNotes] = useState("");
  const [roundFeedback, setRoundFeedback] = useState("");
  const [roundResult, setRoundResult] =
    useState<InterviewResultValue>("PENDING");
  const [isSavingRound, setIsSavingRound] = useState(false);
  const [roundFormError, setRoundFormError] = useState<string | null>(null);

  // Delete round confirm
  const [deleteRoundTarget, setDeleteRoundTarget] =
    useState<InterviewRoundDTO | null>(null);
  const [isDeletingRound, setIsDeletingRound] = useState(false);

  // Feedback banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const resumeModalAdapter: ApplicantDTO = {
    id: candidate.id,
    jobId: candidate.jobId,
    candidateId: candidate.candidateId,
    candidateName: candidate.candidateName,
    candidateEmail: candidate.candidateEmail,
    candidateImage: candidate.candidateImage,
    candidateTitle: candidate.candidateTitle,
    candidateBio: candidate.candidateBio,
    skills: candidate.skills,
    experienceSummary: candidate.experienceSummary,
    educationSummary: candidate.educationSummary,
    resumeUrl: candidate.resumeUrl,
    resumeText: candidate.resumeText,
    resumeData: candidate.resumeData,
    coverLetter: candidate.coverLetter,
    status: candidate.status,
    appliedAt: candidate.appliedAt,
    updatedAt: candidate.updatedAt,
    savedForJob: false,
    savedGenerally: false,
  };

  const handleStageChange = async (nextStage: PipelineStageValue) => {
    if (isChangingStage || candidate.status === nextStage) return;
    setIsChangingStage(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/company/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStage,
          recruiterNotes,
          offerStatus,
          rejectionReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update recruitment stage.");
      }
      setCandidate(data.candidate);
      setFeedback({
        type: "success",
        message: `Updated stage to ${PIPELINE_STAGE_LABELS[nextStage]}.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update recruitment stage.",
      });
    } finally {
      setIsChangingStage(false);
    }
  };

  const handleSaveNotes = async () => {
    if (isSavingNotes) return;
    setIsSavingNotes(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/company/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruiterNotes,
          offerStatus,
          rejectionReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save recruiter notes.");
      }
      setCandidate(data.candidate);
      setFeedback({
        type: "success",
        message: "Recruiter notes and tracking details saved.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to save recruiter notes.",
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const openAddRound = () => {
    setEditingRound(null);
    setRoundName(`Round ${candidate.interviewRounds.length + 1}`);
    setScheduledAt("");
    setMode("ONLINE");
    setMeetingLinkOrLocation("");
    setInterviewerName("");
    setRoundNotes("");
    setRoundFeedback("");
    setRoundResult("PENDING");
    setRoundFormError(null);
    setIsInterviewModalOpen(true);
  };

  const openEditRound = (round: InterviewRoundDTO) => {
    setEditingRound(round);
    setRoundName(round.roundName);
    setScheduledAt(toDateTimeLocalValue(round.scheduledAt));
    setMode(round.mode);
    setMeetingLinkOrLocation(round.meetingLinkOrLocation);
    setInterviewerName(round.interviewerName);
    setRoundNotes(round.notes ?? "");
    setRoundFeedback(round.feedback ?? "");
    setRoundResult(round.result);
    setRoundFormError(null);
    setIsInterviewModalOpen(true);
  };

  const handleSaveRound = async (e: FormEvent) => {
    e.preventDefault();
    if (isSavingRound) return;

    setRoundFormError(null);
    setIsSavingRound(true);

    try {
      const url = editingRound
        ? `/api/company/candidates/${candidate.id}/interviews/${editingRound.id}`
        : `/api/company/candidates/${candidate.id}/interviews`;
      const method = editingRound ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundName,
          scheduledAt,
          mode,
          meetingLinkOrLocation,
          interviewerName,
          notes: roundNotes,
          feedback: roundFeedback,
          result: roundResult,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save interview round.");
      }

      setCandidate((prev) => {
        const nextRounds = editingRound
          ? prev.interviewRounds.map((r) =>
              r.id === data.round.id ? data.round : r
            )
          : [...prev.interviewRounds, data.round];
        return {
          ...prev,
          interviewRounds: nextRounds,
          interviewRoundsCount: nextRounds.length,
        };
      });

      setIsInterviewModalOpen(false);
      setFeedback({
        type: "success",
        message: editingRound
          ? `Updated "${data.round.roundName}".`
          : `Added "${data.round.roundName}".`,
      });
    } catch (err) {
      setRoundFormError(
        err instanceof Error ? err.message : "Failed to save interview round."
      );
    } finally {
      setIsSavingRound(false);
    }
  };

  const handleDeleteRound = async () => {
    if (!deleteRoundTarget || isDeletingRound) return;
    setIsDeletingRound(true);

    try {
      const res = await fetch(
        `/api/company/candidates/${candidate.id}/interviews/${deleteRoundTarget.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete interview round.");
      }

      setCandidate((prev) => {
        const nextRounds = prev.interviewRounds.filter(
          (r) => r.id !== deleteRoundTarget.id
        );
        return {
          ...prev,
          interviewRounds: nextRounds,
          interviewRoundsCount: nextRounds.length,
        };
      });
      setDeleteRoundTarget(null);
      setFeedback({
        type: "success",
        message: `Removed "${deleteRoundTarget.roundName}".`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to delete interview round.",
      });
      setDeleteRoundTarget(null);
    } finally {
      setIsDeletingRound(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
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
              href={`/company/candidates?jobId=${encodeURIComponent(candidate.jobId)}`}
              className="hover:text-foreground transition-colors"
            >
              Application Tracking
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">
              {candidate.candidateName}
            </span>
          </nav>

          <Link
            href={`/company/candidates?jobId=${encodeURIComponent(candidate.jobId)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Pipeline</span>
          </Link>
        </div>

        {/* Top Candidate Banner & Stage Switcher */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {candidate.candidateImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={candidate.candidateImage}
                  alt={candidate.candidateName}
                  className="size-14 shrink-0 rounded-full object-cover border border-border"
                />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
                  {getCandidateInitials(candidate.candidateName)}
                </span>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {candidate.candidateName}
                  </h1>
                  <ApplicationStatusBadge status={candidate.status} />
                </div>

                <p className="mt-0.5 text-sm text-muted-foreground">
                  Applied for{" "}
                  <Link
                    href={`/company/jobs/${candidate.jobId}`}
                    className="font-semibold text-foreground hover:text-violet-600"
                  >
                    {candidate.jobTitle}
                  </Link>{" "}
                  • {companyName || "Your Company"}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {candidate.candidateEmail}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Applied {formatJobDate(candidate.appliedAt)}
                  </span>
                  {candidate.selectedAt && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="size-3.5" />
                        Selected {formatJobDate(candidate.selectedAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResumeOpen(true)}
                className="min-h-10 rounded-xl text-xs font-semibold gap-1.5"
              >
                <FileText className="size-4" />
                <span>View Resume</span>
              </Button>
              {candidate.resumeData && (
                <Button
                  type="button"
                  onClick={() =>
                    downloadResumeDirect(
                      candidate.resumeData!,
                      `${candidate.candidateName.replace(/\s+/g, "_")}_Resume.pdf`
                    )
                  }
                  className="min-h-10 rounded-xl bg-violet-600 text-xs font-semibold text-white hover:bg-violet-700 gap-1.5"
                >
                  <Download className="size-4" />
                  <span>Download PDF</span>
                </Button>
              )}
            </div>
          </div>

          {/* Stage Selector Pills */}
          <div className="border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recruitment Stage
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {PIPELINE_STAGES.map((stage) => {
                const active = candidate.status === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    disabled={isChangingStage || active}
                    onClick={() => handleStageChange(stage)}
                    className={`min-h-10 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                      active
                        ? stage === "REJECTED"
                          ? "border-rose-300 bg-rose-600 text-white"
                          : stage === "SELECTED"
                            ? "border-emerald-300 bg-emerald-600 text-white"
                            : "border-violet-300 bg-violet-600 text-white"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {PIPELINE_STAGE_LABELS[stage]}
                  </button>
                );
              })}
            </div>
          </div>
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
              className="rounded-lg p-1 hover:bg-black/5"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left 2 Columns: Interview Rounds + Candidate Profile + Notes */}
          <div className="space-y-6 lg:col-span-2">
            {/* Interview Management */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="size-4 text-amber-600" />
                  <span>
                    Interview Rounds ({candidate.interviewRounds.length})
                  </span>
                </CardTitle>

                <Button
                  type="button"
                  size="sm"
                  onClick={openAddRound}
                  className="min-h-10 rounded-xl bg-violet-600 px-3.5 text-xs font-semibold text-white hover:bg-violet-700"
                >
                  <Plus className="size-4" />
                  <span>Add Interview Round</span>
                </Button>
              </CardHeader>

              <CardContent className="pt-5">
                {candidate.interviewRounds.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    No interview rounds scheduled yet. Click{" "}
                    <strong>Add Interview Round</strong> to schedule one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {candidate.interviewRounds.map((round) => (
                      <div
                        key={round.id}
                        className="rounded-xl border border-border bg-background p-4 space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-bold text-foreground">
                                {round.roundName}
                              </h3>
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${RESULT_BADGE_STYLE[round.result]}`}
                              >
                                {INTERVIEW_RESULT_LABELS[round.result]}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDateTime(round.scheduledAt)} •{" "}
                              {INTERVIEW_MODE_LABELS[round.mode]} • Interviewer:{" "}
                              <strong className="text-foreground">
                                {round.interviewerName}
                              </strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openEditRound(round)}
                              className="h-9 rounded-lg px-2.5 text-xs font-semibold"
                            >
                              <FileEdit className="size-3.5" />
                              <span>Edit / Feedback</span>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteRoundTarget(round)}
                              aria-label={`Delete ${round.roundName}`}
                              className="h-9 rounded-lg px-2.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {round.mode === "ONLINE" ? (
                            <Video className="size-3.5 shrink-0 text-sky-600" />
                          ) : (
                            <MapPin className="size-3.5 shrink-0 text-violet-600" />
                          )}
                          <span className="break-all">
                            {round.meetingLinkOrLocation}
                          </span>
                        </div>

                        {round.notes && (
                          <div className="rounded-lg bg-muted/40 p-3 text-xs">
                            <p className="font-semibold text-foreground">
                              Interview Notes
                            </p>
                            <p className="mt-1 whitespace-pre-line text-muted-foreground">
                              {round.notes}
                            </p>
                          </div>
                        )}

                        {round.feedback && (
                          <div className="rounded-lg border border-violet-200/60 bg-violet-50/40 p-3 text-xs dark:border-violet-500/20 dark:bg-violet-500/10">
                            <p className="font-semibold text-foreground">
                              Interview Feedback
                            </p>
                            <p className="mt-1 whitespace-pre-line text-muted-foreground">
                              {round.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recruiter Notes, Offer Status & Rejection Reason */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">
                  Recruiter Notes &amp; Outcome Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                {candidate.status === "SELECTED" && (
                  <div>
                    <label
                      htmlFor="offer-status-input"
                      className="block text-xs font-semibold"
                    >
                      Offer Status
                    </label>
                    <input
                      id="offer-status-input"
                      type="text"
                      value={offerStatus}
                      onChange={(e) => setOfferStatus(e.target.value)}
                      placeholder="e.g. Offer Extended, Offer Accepted"
                      className="mt-1.5 min-h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:border-violet-500"
                    />
                  </div>
                )}

                {candidate.status === "REJECTED" && (
                  <div>
                    <label
                      htmlFor="rejection-reason-input"
                      className="block text-xs font-semibold"
                    >
                      Rejection Reason (Optional)
                    </label>
                    <textarea
                      id="rejection-reason-input"
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Optional note on why candidate was not selected..."
                      className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-violet-500"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="recruiter-notes-input"
                    className="block text-xs font-semibold"
                  >
                    Recruiter Notes &amp; Feedback
                  </label>
                  <textarea
                    id="recruiter-notes-input"
                    rows={4}
                    value={recruiterNotes}
                    onChange={(e) => setRecruiterNotes(e.target.value)}
                    placeholder="Add internal evaluation notes, salary expectations, notice period, or feedback..."
                    className="mt-1.5 w-full rounded-xl border border-border bg-background p-3.5 text-sm outline-none focus:border-violet-500"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="min-h-10 rounded-xl bg-violet-600 px-5 text-xs font-semibold text-white hover:bg-violet-700"
                  >
                    {isSavingNotes ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 size-4" />
                    )}
                    <span>Save Notes</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Profile & Application Details */}
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="size-4 text-violet-600" />
                  <span>Candidate Profile &amp; Application</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5 text-sm">
                {candidate.skills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Skills
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {candidate.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <BriefcaseBusiness className="size-3.5" />
                    Experience
                  </p>
                  <p className="mt-1.5 whitespace-pre-line leading-relaxed text-foreground/90">
                    {candidate.experienceSummary ||
                      "No experience summary provided."}
                  </p>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <GraduationCap className="size-3.5" />
                    Education
                  </p>
                  <p className="mt-1.5 whitespace-pre-line leading-relaxed text-foreground/90">
                    {candidate.educationSummary ||
                      "No education summary provided."}
                  </p>
                </div>

                {candidate.coverLetter && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cover Letter
                    </p>
                    <p className="mt-1.5 whitespace-pre-line leading-relaxed text-foreground/90">
                      {candidate.coverLetter}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Recruitment History + Quick Links */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="size-4 text-violet-600" />
                  <span>Recruitment History</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {candidate.stageHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No stage transitions recorded yet. Future stage changes will
                    appear here with timestamps and recruiter details.
                  </p>
                ) : (
                  <ol className="space-y-4">
                    {candidate.stageHistory.map((h) => (
                      <li
                        key={h.id}
                        className="relative border-l-2 border-violet-200 pl-4 dark:border-violet-500/30"
                      >
                        <span className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-violet-600" />
                        <p className="text-xs font-bold text-foreground">
                          {h.fromStatus
                            ? `${APPLICATION_STATUS_LABELS[h.fromStatus]} → ${APPLICATION_STATUS_LABELS[h.toStatus]}`
                            : `Moved to ${APPLICATION_STATUS_LABELS[h.toStatus]}`}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          By {h.changedByName} • {formatDateTime(h.changedAt)}
                        </p>
                        {h.note && (
                          <p className="mt-1 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs text-foreground/90">
                            {h.note}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Link2 className="size-4 text-sky-600" />
                  <span>Quick Links</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-5">
                <Button
                  asChild
                  variant="outline"
                  className="min-h-10 w-full justify-start rounded-xl text-xs font-semibold"
                >
                  <Link
                    href={`/company/applicants/${candidate.jobId}/${candidate.id}`}
                  >
                    View Original Application
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="min-h-10 w-full justify-start rounded-xl text-xs font-semibold"
                >
                  <Link href={`/company/jobs/${candidate.jobId}`}>
                    View Job Posting
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add / Edit Interview Round Modal */}
      {isInterviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!isSavingRound) setIsInterviewModalOpen(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold">
                {editingRound
                  ? `Edit ${editingRound.roundName}`
                  : "Add Interview Round"}
              </h2>
              <button
                type="button"
                onClick={() => setIsInterviewModalOpen(false)}
                disabled={isSavingRound}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {roundFormError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {roundFormError}
              </div>
            )}

            <form onSubmit={handleSaveRound} className="space-y-4">
              <div>
                <label
                  htmlFor="round-name"
                  className="block text-xs font-semibold"
                >
                  Interview Round Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="round-name"
                  type="text"
                  required
                  value={roundName}
                  onChange={(e) => setRoundName(e.target.value)}
                  placeholder="e.g. Technical Screening, System Design, HR Round"
                  className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="round-datetime"
                    className="block text-xs font-semibold"
                  >
                    Date &amp; Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="round-datetime"
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="round-mode"
                    className="block text-xs font-semibold"
                  >
                    Interview Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="round-mode"
                    value={mode}
                    onChange={(e) =>
                      setMode(e.target.value as InterviewModeValue)
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-violet-500"
                  >
                    {INTERVIEW_MODES.map((m) => (
                      <option key={m} value={m}>
                        {INTERVIEW_MODE_LABELS[m]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="round-location"
                  className="block text-xs font-semibold"
                >
                  {mode === "ONLINE"
                    ? "Meeting Link *"
                    : "Interview Location *"}
                </label>
                <input
                  id="round-location"
                  type="text"
                  required
                  value={meetingLinkOrLocation}
                  onChange={(e) => setMeetingLinkOrLocation(e.target.value)}
                  placeholder={
                    mode === "ONLINE"
                      ? "https://meet.google.com/..."
                      : "Office Room 4B, 3rd Floor"
                  }
                  className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="round-interviewer"
                    className="block text-xs font-semibold"
                  >
                    Interviewer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="round-interviewer"
                    type="text"
                    required
                    value={interviewerName}
                    onChange={(e) => setInterviewerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="round-result"
                    className="block text-xs font-semibold"
                  >
                    Interview Result
                  </label>
                  <select
                    id="round-result"
                    value={roundResult}
                    onChange={(e) =>
                      setRoundResult(e.target.value as InterviewResultValue)
                    }
                    className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-violet-500"
                  >
                    {INTERVIEW_RESULTS.map((r) => (
                      <option key={r} value={r}>
                        {INTERVIEW_RESULT_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="round-notes"
                  className="block text-xs font-semibold"
                >
                  Interview Notes (Optional)
                </label>
                <textarea
                  id="round-notes"
                  rows={2}
                  value={roundNotes}
                  onChange={(e) => setRoundNotes(e.target.value)}
                  placeholder="Topics to cover or preparation notes..."
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label
                  htmlFor="round-feedback"
                  className="block text-xs font-semibold"
                >
                  Interview Feedback (Optional)
                </label>
                <textarea
                  id="round-feedback"
                  rows={3}
                  value={roundFeedback}
                  onChange={(e) => setRoundFeedback(e.target.value)}
                  placeholder="Post-interview evaluation and feedback..."
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-border pt-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInterviewModalOpen(false)}
                  disabled={isSavingRound}
                  className="min-h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingRound}
                  className="min-h-11 rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-700"
                >
                  {isSavingRound && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  <span>
                    {editingRound ? "Update Round" : "Save Interview Round"}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ApplicantResumeModal
        applicant={isResumeOpen ? resumeModalAdapter : null}
        onClose={() => setIsResumeOpen(false)}
      />

      <JobConfirmDialog
        open={Boolean(deleteRoundTarget)}
        title="Delete Interview Round?"
        description={
          deleteRoundTarget
            ? `Are you sure you want to delete "${deleteRoundTarget.roundName}"?`
            : ""
        }
        confirmLabel="Delete Round"
        variant="danger"
        isLoading={isDeletingRound}
        onConfirm={handleDeleteRound}
        onCancel={() => setDeleteRoundTarget(null)}
      />
    </div>
  );
}
