"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  MapPin,
  Search,
  Target,
  Video,
} from "lucide-react";

import { ApplicationStatusBadge } from "@/components/dashboard/application-status-badge";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APPLICATION_FILTER_TABS } from "@/lib/application-types";
import { formatJobDate } from "@/lib/job-validation";
import type { SeekerApplicationDTO } from "@/lib/seeker-jobs-types";
import {
  INTERVIEW_MODE_LABELS,
  INTERVIEW_RESULT_LABELS,
  formatDateTime,
} from "@/lib/tracking-types";

interface SeekerApplicationsViewProps {
  initialApplications: SeekerApplicationDTO[];
  userName?: string;
}

export function SeekerApplicationsView({
  initialApplications,
  userName,
}: SeekerApplicationsViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      ALL: initialApplications.length,
      APPLIED: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
    };
    for (const app of initialApplications) {
      if (map[app.status] !== undefined) map[app.status] += 1;
    }
    return map;
  }, [initialApplications]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialApplications.filter((app) => {
      const matchesStatus =
        statusFilter === "ALL" || app.status === statusFilter;
      const matchesSearch =
        !q ||
        app.jobTitle.toLowerCase().includes(q) ||
        app.companyName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [initialApplications, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader userName={userName} />

      <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/seeker/dashboard"
              className="text-sm font-medium text-violet-700 hover:underline dark:text-violet-300"
            >
              ← Home
            </Link>
            <div className="mt-4 flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300">
                <Target className="size-5" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Application Tracker
                </h1>
                <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">
                  Track your submitted job applications, live status updates,
                  and scheduled interview rounds.
                </p>
              </div>
            </div>
          </div>

          <Button
            asChild
            className="min-h-11 rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-700"
          >
            <Link href="/seeker/jobs">
              <span>Explore Jobs</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {initialApplications.length === 0 ? (
          <section className="mt-7 rounded-2xl border border-border p-5 sm:p-7">
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-5 py-12 text-center">
              <Target className="mx-auto size-8 text-muted-foreground" />
              <h2 className="mt-3 font-semibold">No applications yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Jobs you apply to in Job Discovery will appear here with real
                status updates from recruiters.
              </p>
              <Link
                href="/seeker/jobs"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white hover:bg-violet-800"
              >
                Explore jobs <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        ) : (
          <>
            {/* Search & Filter */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by job or company..."
                  className="min-h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {APPLICATION_FILTER_TABS.map((tab) => {
                  const active = statusFilter === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setStatusFilter(tab.value)}
                      className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? "border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-600/60 dark:bg-violet-500/20 dark:text-violet-200"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                          active
                            ? "bg-violet-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {counts[tab.value] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <section className="mt-6 space-y-4">
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No applications match your current filter.
                  </CardContent>
                </Card>
              ) : (
                filtered.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3.5">
                          {app.companyLogoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={app.companyLogoUrl}
                              alt={app.companyName}
                              className="size-11 shrink-0 rounded-xl border border-border object-cover"
                            />
                          ) : (
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                              <Building2 className="size-5" />
                            </span>
                          )}

                          <div>
                            <h2 className="text-base font-bold text-foreground">
                              {app.jobTitle}
                            </h2>
                            <p className="text-xs font-medium text-muted-foreground">
                              {app.companyName} • {app.department}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="size-3.5" />
                                {app.location} ({app.workMode})
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <BriefcaseBusiness className="size-3.5" />
                                {app.employmentType}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="size-3.5" />
                                Applied {formatJobDate(app.appliedAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-1.5 sm:items-end">
                          <ApplicationStatusBadge status={app.status} />
                          {app.offerStatus && (
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                              Offer: {app.offerStatus}
                            </span>
                          )}
                        </div>
                      </div>

                      {app.interviewRounds.length > 0 && (
                        <div className="space-y-2 border-t border-border pt-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Scheduled Interview Rounds
                          </p>
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            {app.interviewRounds.map((round) => (
                              <div
                                key={round.id}
                                className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-foreground">
                                    {round.roundName}
                                  </span>
                                  <span className="rounded-full bg-background border border-border px-2 py-0.5 text-[10px] font-semibold">
                                    {INTERVIEW_RESULT_LABELS[round.result]}
                                  </span>
                                </div>
                                <p className="text-muted-foreground">
                                  {formatDateTime(round.scheduledAt)} •{" "}
                                  {INTERVIEW_MODE_LABELS[round.mode]}
                                </p>
                                <p className="flex items-center gap-1.5 text-foreground/90 break-all">
                                  {round.mode === "ONLINE" ? (
                                    <Video className="size-3.5 shrink-0 text-sky-600" />
                                  ) : (
                                    <MapPin className="size-3.5 shrink-0 text-violet-600" />
                                  )}
                                  <span>{round.meetingLinkOrLocation}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
