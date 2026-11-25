"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock3,
  FileEdit,
  Globe,
  Info,
  Lock,
  LockOpen,
  MapPin,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { JobConfirmDialog } from "@/components/dashboard/job-confirm-dialog";
import { JobStatusBadge } from "@/components/dashboard/job-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_MODE_LABELS,
  formatJobDate,
  type CompanyJobDTO,
  type JobStatusValue,
} from "@/lib/job-validation";

interface JobDetailViewProps {
  initialJob: CompanyJobDTO;
  companyName?: string | null;
}

export function JobDetailView({ initialJob, companyName }: JobDetailViewProps) {
  const router = useRouter();
  const [job, setJob] = useState<CompanyJobDTO>(initialJob);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [statusConfirmTarget, setStatusConfirmTarget] =
    useState<JobStatusValue | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleConfirmStatusChange = async () => {
    if (!statusConfirmTarget || isActionLoading) return;
    setIsActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/company/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusConfirmTarget }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update job status.");
      }
      setJob(data.job);
      const verb =
        statusConfirmTarget === "OPEN"
          ? job.status === "DRAFT"
            ? "published"
            : "reopened"
          : "closed";
      setFeedback({
        type: "success",
        message: `Job has been ${verb}.`,
      });
      setStatusConfirmTarget(null);
      router.refresh();
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to update job status.",
      });
      setStatusConfirmTarget(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/company/jobs/${job.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete job.");
      }
      router.push("/company/jobs");
      router.refresh();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete job.",
      });
      setIsDeleteOpen(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  const nextStatus: JobStatusValue = job.status === "OPEN" ? "CLOSED" : "OPEN";
  const statusActionLabel =
    job.status === "OPEN"
      ? "Close Job"
      : job.status === "CLOSED"
        ? "Reopen Job"
        : "Publish Job";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Back link */}
        <Link
          href="/company/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Job Management</span>
        </Link>

        {/* Header & Primary Actions */}
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {job.title}
              </h1>
              <JobStatusBadge status={job.status} />
            </div>

            <p className="mt-1.5 text-sm text-muted-foreground">
              {companyName || "Your Company"} •{" "}
              {job.department || "Department not set"} • {job.openings}{" "}
              {job.openings === 1 ? "opening" : "openings"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              asChild
              variant="outline"
              className="min-h-11 rounded-xl gap-2 font-semibold"
            >
              <Link href={`/company/jobs/${job.id}/edit`}>
                <FileEdit className="size-4" />
                <span>Edit Job</span>
              </Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setStatusConfirmTarget(nextStatus)}
              className={`min-h-11 rounded-xl gap-2 font-semibold ${
                job.status === "OPEN"
                  ? "text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-500/10"
                  : "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
              }`}
            >
              {job.status === "OPEN" ? (
                <Lock className="size-4" />
              ) : (
                <LockOpen className="size-4" />
              )}
              <span>{statusActionLabel}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(true)}
              className="min-h-11 rounded-xl gap-2 font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <Trash2 className="size-4" />
              <span>Delete</span>
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
              className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Closed Job Notice */}
        {job.status === "CLOSED" && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              This job is currently closed and no longer accepts new
              applications. Existing applications ({job.applicationsCount})
              remain accessible.
            </span>
          </div>
        )}

        {/* Key Metrics Strip */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="py-4">
            <CardContent className="px-4">
              <p className="text-xs font-medium text-muted-foreground">
                Applications Received
              </p>
              <p className="mt-1 flex items-center gap-2 text-xl font-bold">
                <Users className="size-4 text-sky-600" />
                {job.applicationsCount}
              </p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent className="px-4">
              <p className="text-xs font-medium text-muted-foreground">
                Date Posted
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-bold">
                <Calendar className="size-4 text-violet-600" />
                {job.postedAt ? formatJobDate(job.postedAt) : "Not published"}
              </p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent className="px-4">
              <p className="text-xs font-medium text-muted-foreground">
                Application Deadline
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-bold">
                <Clock3 className="size-4 text-amber-600" />
                {job.deadline ? formatJobDate(job.deadline) : "No deadline set"}
              </p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent className="px-4">
              <p className="text-xs font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="mt-1 text-sm font-bold">
                {formatJobDate(job.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Complete Job Details */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Main Description & Requirements (2 cols) */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">Job Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <p className="whitespace-pre-line text-sm leading-7 text-foreground/90">
                  {job.description || "No description provided yet."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <p className="whitespace-pre-line text-sm leading-7 text-foreground/90">
                  {job.responsibilities || "No responsibilities specified yet."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">Qualifications</CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <p className="whitespace-pre-line text-sm leading-7 text-foreground/90">
                  {job.qualifications || "No qualifications specified yet."}
                </p>
              </CardContent>
            </Card>

            {job.applicationInstructions && (
              <Card>
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="text-base">
                    Application Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <p className="whitespace-pre-line text-sm leading-7 text-foreground/90">
                    {job.applicationInstructions}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Metadata & Skills (1 col) */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">Role Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5 text-sm">
                <div className="flex items-start gap-3">
                  <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-violet-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Employment Type
                    </p>
                    <p className="font-semibold">
                      {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 size-4 shrink-0 text-sky-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Work Mode</p>
                    <p className="font-semibold">
                      {WORK_MODE_LABELS[job.workMode]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-semibold">
                      {job.location || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">
                    Experience Level
                  </p>
                  <p className="mt-0.5 font-semibold">
                    {EXPERIENCE_LEVEL_LABELS[job.experienceLevel]} (
                    {job.minExperience}
                    {job.maxExperience !== null
                      ? `–${job.maxExperience}`
                      : "+"}{" "}
                    years)
                  </p>
                </div>

                {job.salaryRange && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground">
                      Salary Range
                    </p>
                    <p className="mt-0.5 font-semibold">{job.salaryRange}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-base">Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Required Skills
                  </p>
                  {job.requiredSkills.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {job.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-500/20 dark:text-violet-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      None added yet.
                    </p>
                  )}
                </div>

                {job.preferredSkills.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Preferred Skills
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {job.preferredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <JobConfirmDialog
        open={isDeleteOpen}
        title="Delete Job Posting?"
        description={
          job.applicationsCount > 0
            ? `Are you sure you want to permanently delete "${job.title}"? This job currently has ${job.applicationsCount} application(s), which will also be removed. This action cannot be undone.`
            : `Are you sure you want to permanently delete "${job.title}"? This action cannot be undone.`
        }
        confirmLabel="Delete Job"
        variant="danger"
        isLoading={isActionLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />

      {/* Open / Close Confirmation Dialog */}
      <JobConfirmDialog
        open={Boolean(statusConfirmTarget)}
        title={
          statusConfirmTarget === "CLOSED"
            ? "Close Job Posting?"
            : job.status === "DRAFT"
              ? "Publish Job Posting?"
              : "Reopen Job Posting?"
        }
        description={
          statusConfirmTarget === "CLOSED"
            ? `Closing "${job.title}" will stop accepting new applications. All ${job.applicationsCount} existing application(s) will remain accessible.`
            : job.status === "DRAFT"
              ? `Publishing "${job.title}" will mark it as Open and ready for candidates.`
              : `Reopening "${job.title}" will mark it as Open so candidates can apply again.`
        }
        confirmLabel={statusActionLabel}
        variant={statusConfirmTarget === "CLOSED" ? "warning" : "primary"}
        isLoading={isActionLoading}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusConfirmTarget(null)}
      />
    </div>
  );
}
