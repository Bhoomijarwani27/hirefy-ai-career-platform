"use client";

import { JOB_STATUS_LABELS, type JobStatusValue } from "@/lib/job-validation";

const STATUS_STYLES: Record<JobStatusValue, string> = {
  OPEN: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  CLOSED:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  DRAFT:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
};

const DOT_STYLES: Record<JobStatusValue, string> = {
  OPEN: "bg-emerald-500",
  CLOSED: "bg-rose-500",
  DRAFT: "bg-amber-500",
};

export function JobStatusBadge({ status }: { status: JobStatusValue }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      <span className={`size-1.5 rounded-full ${DOT_STYLES[status]}`} />
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}
