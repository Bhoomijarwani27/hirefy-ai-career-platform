"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Eye,
  FileEdit,
  Globe,
  Layers3,
  Lock,
  LockOpen,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  AlertCircle,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { JobConfirmDialog } from "@/components/dashboard/job-confirm-dialog";
import { JobStatusBadge } from "@/components/dashboard/job-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODE_LABELS,
  formatJobDate,
  type CompanyJobDTO,
  type JobStatusValue,
} from "@/lib/job-validation";

type StatusFilter = "ALL" | JobStatusValue;

interface JobManagementProps {
  initialJobs: CompanyJobDTO[];
  companyName?: string | null;
}

export function JobManagement({ initialJobs, companyName }: JobManagementProps) {
  const [jobs, setJobs] = useState<CompanyJobDTO[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Feedback banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Confirmation dialogs
  const [deleteTarget, setDeleteTarget] = useState<CompanyJobDTO | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    job: CompanyJobDTO;
    nextStatus: JobStatusValue;
  } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const counts = useMemo(() => {
    let open = 0;
    let closed = 0;
    let draft = 0;
    let totalApplications = 0;
    for (const job of jobs) {
      if (job.status === "OPEN") open += 1;
      else if (job.status === "CLOSED") closed += 1;
      else if (job.status === "DRAFT") draft += 1;
      totalApplications += job.applicationsCount;
    }
    return {
      ALL: jobs.length,
      OPEN: open,
      CLOSED: closed,
      DRAFT: draft,
      totalApplications,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesStatus =
        statusFilter === "ALL" || job.status === statusFilter;
      const matchesSearch =
        !query || job.title.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [jobs, searchQuery, statusFilter]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/company/jobs", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to refresh jobs.");
      }
      setJobs(data.jobs);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to refresh jobs.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isActionLoading) return;
    setIsActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/company/jobs/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete job.");
      }
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
      setFeedback({
        type: "success",
        message: `"${deleteTarget.title}" was deleted.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete job.",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!statusTarget || isActionLoading) return;
    setIsActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/company/jobs/${statusTarget.job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusTarget.nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update job status.");
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === data.job.id ? data.job : j))
      );
      const verb =
        statusTarget.nextStatus === "OPEN"
          ? statusTarget.job.status === "DRAFT"
            ? "published"
            : "reopened"
          : "closed";
      setFeedback({
        type: "success",
        message: `"${statusTarget.job.title}" has been ${verb}.`,
      });
      setStatusTarget(null);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to update job status.",
      });
      setStatusTarget(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getNextStatusAction = (
    job: CompanyJobDTO
  ): { nextStatus: JobStatusValue; label: string; isClose: boolean } => {
    if (job.status === "OPEN") {
      return { nextStatus: "CLOSED", label: "Close Job", isClose: true };
    }
    if (job.status === "CLOSED") {
      return { nextStatus: "OPEN", label: "Reopen Job", isClose: false };
    }
    return { nextStatus: "OPEN", label: "Open / Publish", isClose: false };
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
              <span className="text-foreground font-semibold">
                Job Management
              </span>
            </nav>

            <h1 className="mt-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Job Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {companyName
                ? `Create, edit, and manage job postings for ${companyName}.`
                : "Create, edit, and manage all job postings for your company."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="min-h-11 rounded-xl gap-2"
            >
              <RefreshCw
                className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>

            <Button
              asChild
              className="min-h-11 rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-700 shadow-xs"
            >
              <Link href="/company/jobs/new">
                <Plus className="size-4" />
                <span>Post New Job</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <BriefcaseBusiness className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Total Jobs
                </p>
                <p className="text-xl font-bold">{counts.ALL}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <LockOpen className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Open Jobs
                </p>
                <p className="text-xl font-bold">{counts.OPEN}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Layers3 className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Drafts
                </p>
                <p className="text-xl font-bold">{counts.DRAFT}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardContent className="flex items-center gap-3 px-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Users className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Applications
                </p>
                <p className="text-xl font-bold">{counts.totalApplications}</p>
              </div>
            </CardContent>
          </Card>
        </section>

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

        {/* Search & Status Filters */}
        <section className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs by job title..."
              aria-label="Search jobs by job title"
              className="min-h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Filter jobs by status"
          >
            {(
              [
                { value: "ALL", label: "All" },
                { value: "OPEN", label: "Open" },
                { value: "CLOSED", label: "Closed" },
                { value: "DRAFT", label: "Draft" },
              ] as const
            ).map((tab) => {
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
                    {counts[tab.value]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Empty State: No Jobs Created Yet */}
        {jobs.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <BriefcaseBusiness className="size-7" />
              </span>
              <h2 className="mt-4 text-lg font-bold">No job postings yet</h2>
              <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
                Post your first open role or save a draft to start managing your
                company&apos;s hiring pipeline.
              </p>
              <Button
                asChild
                className="mt-6 min-h-11 rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-700"
              >
                <Link href="/company/jobs/new">
                  <Plus className="size-4" />
                  <span>Post New Job</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : filteredJobs.length === 0 ? (
          /* Empty State: Search/Filter returned 0 matches */
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <Search className="size-8 text-muted-foreground" />
              <h2 className="mt-3 text-base font-bold">
                No matching jobs found
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search query or status filter.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="mt-4 min-h-11 rounded-xl"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile & Tablet Card Layout (< lg) */}
            <section className="mt-6 grid gap-4 lg:hidden">
              {filteredJobs.map((job) => {
                const statusAction = getNextStatusAction(job);
                return (
                  <Card key={job.id} className="overflow-hidden">
                    <CardContent className="p-4 sm:p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/company/jobs/${job.id}`}
                            className="text-base font-bold text-foreground hover:text-violet-600 transition-colors line-clamp-2"
                          >
                            {job.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {job.department || "General"} • {job.openings}{" "}
                            {job.openings === 1 ? "opening" : "openings"}
                          </p>
                        </div>
                        <JobStatusBadge status={job.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <BriefcaseBusiness className="size-3.5 shrink-0 text-violet-500" />
                          <span className="truncate">
                            {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Globe className="size-3.5 shrink-0 text-sky-500" />
                          <span className="truncate">
                            {WORK_MODE_LABELS[job.workMode]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">
                            {job.location || "Location TBD"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="size-3.5 shrink-0 text-emerald-500" />
                          <span>
                            {job.applicationsCount}{" "}
                            {job.applicationsCount === 1
                              ? "application"
                              : "applications"}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5">
                          <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                          <span>
                            {job.postedAt
                              ? `Posted ${formatJobDate(job.postedAt)}`
                              : `Saved ${formatJobDate(job.createdAt)}`}
                          </span>
                        </div>
                      </div>

                      {/* Comfortable Mobile Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                        <Button
                          asChild
                          variant="outline"
                          className="min-h-11 rounded-xl text-xs font-semibold"
                        >
                          <Link href={`/company/jobs/${job.id}`}>
                            <Eye className="size-3.5" />
                            <span>View Job</span>
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="min-h-11 rounded-xl text-xs font-semibold"
                        >
                          <Link href={`/company/jobs/${job.id}/edit`}>
                            <FileEdit className="size-3.5" />
                            <span>Edit Job</span>
                          </Link>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setStatusTarget({
                              job,
                              nextStatus: statusAction.nextStatus,
                            })
                          }
                          className={`min-h-11 rounded-xl text-xs font-semibold ${
                            statusAction.isClose
                              ? "text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-500/10"
                              : "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                          }`}
                        >
                          {statusAction.isClose ? (
                            <Lock className="size-3.5" />
                          ) : (
                            <LockOpen className="size-3.5" />
                          )}
                          <span>{statusAction.label}</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDeleteTarget(job)}
                          className="min-h-11 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>

            {/* Desktop Structured Table (>= lg) */}
            <section className="mt-6 hidden lg:block">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3.5 pl-5 pr-3">Job Title</th>
                      <th className="px-3 py-3.5">Type &amp; Mode</th>
                      <th className="px-3 py-3.5">Location</th>
                      <th className="px-3 py-3.5">Applications</th>
                      <th className="px-3 py-3.5">Date Posted</th>
                      <th className="px-3 py-3.5">Status</th>
                      <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {filteredJobs.map((job) => {
                      const statusAction = getNextStatusAction(job);
                      return (
                        <tr
                          key={job.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-4 pl-5 pr-3">
                            <Link
                              href={`/company/jobs/${job.id}`}
                              className="font-semibold text-foreground hover:text-violet-600 transition-colors"
                            >
                              {job.title}
                            </Link>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {job.department || "General"} • {job.openings}{" "}
                              {job.openings === 1 ? "opening" : "openings"}
                            </div>
                          </td>

                          <td className="px-3 py-4">
                            <div className="font-medium text-foreground">
                              {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {WORK_MODE_LABELS[job.workMode]}
                            </div>
                          </td>

                          <td className="px-3 py-4 text-muted-foreground">
                            {job.location || "Location TBD"}
                          </td>

                          <td className="px-3 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                              <Users className="size-3.5 text-sky-600 dark:text-sky-400" />
                              {job.applicationsCount}
                            </span>
                          </td>

                          <td className="px-3 py-4 text-xs text-muted-foreground">
                            {job.postedAt
                              ? formatJobDate(job.postedAt)
                              : "Draft"}
                          </td>

                          <td className="px-3 py-4">
                            <JobStatusBadge status={job.status} />
                          </td>

                          <td className="py-4 pl-3 pr-5">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="h-9 rounded-lg px-2.5 text-xs"
                              >
                                <Link href={`/company/jobs/${job.id}`}>
                                  <Eye className="size-3.5" />
                                  <span>View</span>
                                </Link>
                              </Button>

                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="h-9 rounded-lg px-2.5 text-xs"
                              >
                                <Link href={`/company/jobs/${job.id}/edit`}>
                                  <FileEdit className="size-3.5" />
                                  <span>Edit</span>
                                </Link>
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setStatusTarget({
                                    job,
                                    nextStatus: statusAction.nextStatus,
                                  })
                                }
                                className={`h-9 rounded-lg px-2.5 text-xs ${
                                  statusAction.isClose
                                    ? "text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-500/10"
                                    : "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                                }`}
                              >
                                {statusAction.isClose ? (
                                  <Lock className="size-3.5" />
                                ) : (
                                  <LockOpen className="size-3.5" />
                                )}
                                <span>{statusAction.label}</span>
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteTarget(job)}
                                aria-label={`Delete ${job.title}`}
                                className="h-9 rounded-lg px-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <JobConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Job Posting?"
        description={
          deleteTarget
            ? deleteTarget.applicationsCount > 0
              ? `Are you sure you want to permanently delete "${deleteTarget.title}"? This job currently has ${deleteTarget.applicationsCount} application(s), which will also be removed. This action cannot be undone.`
              : `Are you sure you want to permanently delete "${deleteTarget.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Job"
        variant="danger"
        isLoading={isActionLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Open / Close Confirmation Dialog */}
      <JobConfirmDialog
        open={Boolean(statusTarget)}
        title={
          statusTarget?.nextStatus === "CLOSED"
            ? "Close Job Posting?"
            : statusTarget?.job.status === "DRAFT"
              ? "Publish Job Posting?"
              : "Reopen Job Posting?"
        }
        description={
          statusTarget?.nextStatus === "CLOSED"
            ? `Closing "${statusTarget.job.title}" will stop accepting new applications. All ${statusTarget.job.applicationsCount} existing application(s) will remain accessible.`
            : statusTarget?.job.status === "DRAFT"
              ? `Publishing "${statusTarget?.job.title}" will mark it as Open and ready for candidates.`
              : `Reopening "${statusTarget?.job.title}" will mark it as Open so candidates can apply again.`
        }
        confirmLabel={
          statusTarget?.nextStatus === "CLOSED"
            ? "Close Job"
            : statusTarget?.job.status === "DRAFT"
              ? "Publish Job"
              : "Reopen Job"
        }
        variant={statusTarget?.nextStatus === "CLOSED" ? "warning" : "primary"}
        isLoading={isActionLoading}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
}
