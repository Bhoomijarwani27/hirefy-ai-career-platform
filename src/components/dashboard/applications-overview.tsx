"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Calendar,
  MapPin,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { JobStatusBadge } from "@/components/dashboard/job-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCandidateInitials,
  type GenerallySavedCandidateDTO,
} from "@/lib/application-types";
import {
  EMPLOYMENT_TYPE_LABELS,
  formatJobDate,
  type CompanyJobDTO,
} from "@/lib/job-validation";

interface ApplicationsOverviewProps {
  jobs: CompanyJobDTO[];
  initialSavedCandidates: GenerallySavedCandidateDTO[];
  companyName?: string | null;
}

export function ApplicationsOverview({
  jobs,
  initialSavedCandidates,
  companyName,
}: ApplicationsOverviewProps) {
  const [activeView, setActiveView] = useState<"jobs" | "saved">("jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedCandidates, setSavedCandidates] = useState<
    GenerallySavedCandidateDTO[]
  >(initialSavedCandidates);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
    );
  }, [jobs, searchQuery]);

  const totalApplications = useMemo(
    () => jobs.reduce((acc, j) => acc + j.applicationsCount, 0),
    [jobs]
  );

  const handleRemoveGenerallySaved = async (candidateId: string) => {
    if (removingId) return;
    setRemovingId(candidateId);
    try {
      const res = await fetch("/api/company/saved-candidates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });
      if (res.ok) {
        setSavedCandidates((prev) =>
          prev.filter((c) => c.candidateId !== candidateId)
        );
      }
    } finally {
      setRemovingId(null);
    }
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
              <span className="font-semibold text-foreground">
                Applications
              </span>
            </nav>

            <h1 className="mt-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Applications
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {companyName
                ? `Select a posted job from ${companyName} to review applicants and run job-specific AI ranking.`
                : "Select a posted job to review its applicants, run AI ranking, and shortlist or save candidates."}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm">
            <Users className="size-4 text-sky-600" />
            <span className="font-bold">{totalApplications}</span>
            <span className="text-muted-foreground">
              total {totalApplications === 1 ? "application" : "applications"}
            </span>
          </div>
        </div>

        {/* View Switcher: Posted Jobs (Default) vs Generally Saved Candidates */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView("jobs")}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                activeView === "jobs"
                  ? "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-600/60 dark:bg-violet-500/20 dark:text-violet-200"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <BriefcaseBusiness className="size-4" />
              <span>Posted Jobs ({jobs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView("saved")}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                activeView === "saved"
                  ? "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-600/60 dark:bg-violet-500/20 dark:text-violet-200"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Bookmark className="size-4" />
              <span>Saved Generally ({savedCandidates.length})</span>
            </button>
          </div>

          {activeView === "jobs" && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter jobs by title or location..."
                aria-label="Filter jobs"
                className="min-h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          )}
        </div>

        {/* Job-wise Cards View (Default) */}
        {activeView === "jobs" && (
          <>
            {jobs.length === 0 ? (
              <Card className="mt-6">
                <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <BriefcaseBusiness className="size-7" />
                  </span>
                  <h2 className="mt-4 text-lg font-bold">
                    No posted jobs yet
                  </h2>
                  <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
                    Post a job in Job Management first. Once candidates apply,
                    each job will appear here so you can review its applicants.
                  </p>
                  <Button
                    asChild
                    className="mt-6 min-h-11 rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-700"
                  >
                    <Link href="/company/jobs/new">
                      Post a Job
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : filteredJobs.length === 0 ? (
              <Card className="mt-6">
                <CardContent className="px-6 py-12 text-center">
                  <p className="text-sm font-semibold">
                    No jobs match &ldquo;{searchQuery}&rdquo;
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="mt-4 min-h-10 rounded-xl"
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/company/applicants/${job.id}`}
                    className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  >
                    <Card className="h-full border-border transition-all group-hover:border-violet-300 group-hover:shadow-md dark:group-hover:border-violet-500/40">
                      <CardContent className="flex h-full flex-col justify-between p-5 space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h2 className="text-base font-bold text-foreground group-hover:text-violet-600 transition-colors line-clamp-2">
                                {job.title}
                              </h2>
                              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                                {job.department || "General"}
                              </p>
                            </div>
                            <JobStatusBadge status={job.status} />
                          </div>

                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="size-3.5 shrink-0 text-sky-600" />
                              <span className="truncate">
                                {job.location || "Location TBD"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BriefcaseBusiness className="size-3.5 shrink-0 text-violet-600" />
                              <span>
                                {EMPLOYMENT_TYPE_LABELS[job.employmentType]}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                              <span>
                                {job.postedAt
                                  ? `Posted ${formatJobDate(job.postedAt)}`
                                  : `Created ${formatJobDate(job.createdAt)}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                            <Users className="size-3.5" />
                            {job.applicationsCount}{" "}
                            {job.applicationsCount === 1
                              ? "Application"
                              : "Applications"}
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 group-hover:translate-x-0.5 transition-transform dark:text-violet-300">
                            <span>View Applicants</span>
                            <ArrowRight className="size-3.5" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </section>
            )}
          </>
        )}

        {/* Generally Saved Candidates View */}
        {activeView === "saved" && (
          <section className="mt-6">
            {savedCandidates.length === 0 ? (
              <Card>
                <CardContent className="px-6 py-12 text-center">
                  <Bookmark className="mx-auto size-8 text-muted-foreground" />
                  <h2 className="mt-3 text-base font-bold">
                    No generally saved candidates yet
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Use &ldquo;Save Generally&rdquo; on any applicant to keep
                    promising talent in your company&apos;s general pool for
                    future openings.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedCandidates.map((cand) => (
                  <Card key={cand.id}>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {cand.candidateImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cand.candidateImage}
                              alt={cand.candidateName}
                              className="size-10 shrink-0 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
                              {getCandidateInitials(cand.candidateName)}
                            </span>
                          )}
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold">
                              {cand.candidateName}
                            </h3>
                            <p className="truncate text-xs text-muted-foreground">
                              {cand.candidateTitle || cand.candidateEmail}
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={removingId === cand.candidateId}
                          onClick={() =>
                            handleRemoveGenerallySaved(cand.candidateId)
                          }
                          aria-label={`Remove ${cand.candidateName}`}
                          className="h-9 rounded-lg px-2.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      {cand.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {cand.skills.slice(0, 5).map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-[11px] text-muted-foreground">
                        Saved on {formatJobDate(cand.savedAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
