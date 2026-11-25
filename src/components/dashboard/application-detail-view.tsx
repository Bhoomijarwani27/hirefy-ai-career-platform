"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  UserCheck,
  UserX,
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
  getCandidateInitials,
  type ApplicantDTO,
  type ApplicationStatusValue,
} from "@/lib/application-types";
import {
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODE_LABELS,
  formatJobDate,
  type CompanyJobDTO,
} from "@/lib/job-validation";
import { downloadResumeDirect } from "@/lib/resume-pdf-template";

interface ApplicationDetailViewProps {
  job: CompanyJobDTO;
  initialApplication: ApplicantDTO;
  companyName?: string | null;
}

export function ApplicationDetailView({
  job,
  initialApplication,
  companyName,
}: ApplicationDetailViewProps) {
  const [app, setApp] = useState<ApplicantDTO>(initialApplication);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isStatusBusy, setIsStatusBusy] = useState(false);
  const [isJobSaveBusy, setIsJobSaveBusy] = useState(false);
  const [isGenSaveBusy, setIsGenSaveBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleStatusChange = async (nextStatus: ApplicationStatusValue) => {
    if (isStatusBusy) return;
    setIsStatusBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(
        `/api/company/applicants/${job.id}/${app.id}`,
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
      setApp((prev) => ({
        ...prev,
        status: nextStatus,
        updatedAt: data.updatedAt || prev.updatedAt,
      }));
      setFeedback({
        type: "success",
        message:
          nextStatus === "SHORTLISTED"
            ? `${app.candidateName} has been shortlisted and is now available in Application Tracking.`
            : `${app.candidateName}'s application was marked as Rejected.`,
      });
      setIsRejectOpen(false);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update application status.",
      });
    } finally {
      setIsStatusBusy(false);
    }
  };

  const handleToggleSaveForJob = async () => {
    if (isJobSaveBusy) return;
    setIsJobSaveBusy(true);
    setFeedback(null);
    const method = app.savedForJob ? "DELETE" : "POST";
    try {
      const res = await fetch(`/api/company/applicants/${job.id}/save`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: app.candidateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update job-saved status.");
      }
      setApp((prev) => ({ ...prev, savedForJob: Boolean(data.savedForJob) }));
      setFeedback({
        type: "success",
        message: data.savedForJob
          ? `Saved ${app.candidateName} for "${job.title}".`
          : `Removed ${app.candidateName} from "${job.title}" saved list.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to save candidate.",
      });
    } finally {
      setIsJobSaveBusy(false);
    }
  };

  const handleToggleSaveGenerally = async () => {
    if (isGenSaveBusy) return;
    setIsGenSaveBusy(true);
    setFeedback(null);
    const method = app.savedGenerally ? "DELETE" : "POST";
    try {
      const res = await fetch("/api/company/saved-candidates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: app.candidateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update general saved list.");
      }
      setApp((prev) => ({
        ...prev,
        savedGenerally: Boolean(data.savedGenerally),
      }));
      setFeedback({
        type: "success",
        message: data.savedGenerally
          ? `Saved ${app.candidateName} to your company's general saved candidates.`
          : `Removed ${app.candidateName} from your company's general saved candidates.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to save candidate.",
      });
    } finally {
      setIsGenSaveBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Breadcrumb & Back Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground"
          >
            <Link
              href="/company/applicants"
              className="hover:text-foreground transition-colors"
            >
              Applications
            </Link>
            <span>/</span>
            <Link
              href={`/company/applicants/${job.id}`}
              className="hover:text-foreground transition-colors"
            >
              {job.title}
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">
              {app.candidateName}
            </span>
          </nav>

          <Link
            href={`/company/applicants/${job.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to {job.title} Applicants</span>
          </Link>
        </div>

        {/* Candidate Profile Header + Actions */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {app.candidateImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={app.candidateImage}
                  alt={app.candidateName}
                  className="size-14 shrink-0 rounded-full object-cover border border-border"
                />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
                  {getCandidateInitials(app.candidateName)}
                </span>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {app.candidateName}
                  </h1>
                  <ApplicationStatusBadge status={app.status} />
                </div>

                {app.candidateTitle && (
                  <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                    {app.candidateTitle}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {app.candidateEmail}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Applied {formatJobDate(app.appliedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Decision & Saving Actions */}
          <div className="flex flex-wrap items-center gap-2.5 border-t border-border pt-4">
            <Button
              type="button"
              disabled={isStatusBusy || app.status === "SHORTLISTED"}
              onClick={() => handleStatusChange("SHORTLISTED")}
              className="min-h-11 rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-700"
            >
              <UserCheck className="size-4" />
              <span>
                {app.status === "SHORTLISTED" ? "Shortlisted" : "Shortlist"}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isStatusBusy || app.status === "REJECTED"}
              onClick={() => setIsRejectOpen(true)}
              className="min-h-11 rounded-xl px-5 font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <UserX className="size-4" />
              <span>{app.status === "REJECTED" ? "Rejected" : "Reject"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isJobSaveBusy}
              onClick={handleToggleSaveForJob}
              className={`min-h-11 rounded-xl px-4 font-semibold ${
                app.savedForJob
                  ? "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-200"
                  : ""
              }`}
            >
              {app.savedForJob ? (
                <BookmarkCheck className="size-4 text-violet-600" />
              ) : (
                <Bookmark className="size-4" />
              )}
              <span>
                {app.savedForJob
                  ? "Saved for This Job"
                  : "Save for This Job"}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isGenSaveBusy}
              onClick={handleToggleSaveGenerally}
              className={`min-h-11 rounded-xl px-4 font-semibold ${
                app.savedGenerally
                  ? "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-200"
                  : ""
              }`}
            >
              {app.savedGenerally ? (
                <BookmarkCheck className="size-4 text-sky-600" />
              ) : (
                <Bookmark className="size-4" />
              )}
              <span>
                {app.savedGenerally ? "Saved Generally" : "Save Generally"}
              </span>
            </Button>
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
              aria-label="Dismiss notification"
              className="rounded-lg p-1 hover:bg-black/5"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left 2 Columns: Profile, Experience, Education, Cover Letter, Resume */}
          <div className="space-y-6 lg:col-span-2">
            {app.candidateBio && (
              <Card>
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base">Candidate Bio</CardTitle>
                </CardHeader>
                <CardContent className="pt-5 text-sm leading-7 text-foreground/90 whitespace-pre-line">
                  {app.candidateBio}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BriefcaseBusiness className="size-4 text-violet-600" />
                  <span>Skills &amp; Experience</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Skills
                  </p>
                  {app.skills.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {app.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-500/20 dark:text-violet-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      No skills listed.
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Experience
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-foreground/90">
                    {app.experienceSummary ||
                      "No experience details provided."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="size-4 text-sky-600" />
                  <span>Education</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 text-sm leading-7 text-foreground/90 whitespace-pre-line">
                {app.educationSummary || "No education details provided."}
              </CardContent>
            </Card>

            {app.coverLetter && (
              <Card>
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base">Cover Letter</CardTitle>
                </CardHeader>
                <CardContent className="pt-5 text-sm leading-7 text-foreground/90 whitespace-pre-line">
                  {app.coverLetter}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="size-4 text-violet-600" />
                  <span>Resume</span>
                </CardTitle>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsResumeOpen(true)}
                    className="h-9 rounded-xl text-xs font-semibold"
                  >
                    Full Preview
                  </Button>
                  {app.resumeData && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        downloadResumeDirect(
                          app.resumeData!,
                          `${app.candidateName.replace(/\s+/g, "_")}_Resume.pdf`
                        )
                      }
                      className="h-9 rounded-xl bg-violet-600 text-xs font-semibold text-white hover:bg-violet-700"
                    >
                      <Download className="size-3.5" />
                      <span>Download PDF</span>
                    </Button>
                  )}
                  {app.resumeUrl && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-xl text-xs font-semibold"
                    >
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Open File</span>
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                {app.resumeText ? (
                  <p className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-muted/30 p-4 text-xs leading-relaxed text-foreground/90">
                    {app.resumeText}
                  </p>
                ) : app.resumeData ? (
                  <p className="text-sm text-muted-foreground">
                    Structured Harvard FAS resume is attached. Click{" "}
                    <button
                      type="button"
                      onClick={() => setIsResumeOpen(true)}
                      className="font-semibold text-violet-700 hover:underline dark:text-violet-300"
                    >
                      Full Preview
                    </button>{" "}
                    or Download PDF to inspect all sections.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {app.resumeUrl
                      ? "External resume link attached above."
                      : "No resume file uploaded; candidate profile details are displayed above."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Applied Job Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">Applied Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/company/jobs/${job.id}`}
                      className="font-bold text-foreground hover:text-violet-600 transition-colors"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {companyName || "Your Company"} •{" "}
                      {job.department || "General"}
                    </p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </div>

                <div className="space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5 shrink-0 text-sky-600" />
                    <span>
                      {job.location} ({WORK_MODE_LABELS[job.workMode]})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="size-3.5 shrink-0 text-violet-600" />
                    <span>{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5 shrink-0" />
                    <span>Applied {formatJobDate(app.appliedAt)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <Button
                    asChild
                    variant="outline"
                    className="min-h-10 w-full rounded-xl text-xs font-semibold"
                  >
                    <Link href={`/company/jobs/${job.id}`}>
                      View Full Job Posting
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ApplicantResumeModal
        applicant={isResumeOpen ? app : null}
        onClose={() => setIsResumeOpen(false)}
      />

      <JobConfirmDialog
        open={isRejectOpen}
        title="Reject Application?"
        description={`Are you sure you want to mark ${app.candidateName}'s application for "${job.title}" as Rejected? Their candidate profile will not be deleted.`}
        confirmLabel="Reject Application"
        variant="danger"
        isLoading={isStatusBusy}
        onConfirm={() => handleStatusChange("REJECTED")}
        onCancel={() => setIsRejectOpen(false)}
      />
    </div>
  );
}
