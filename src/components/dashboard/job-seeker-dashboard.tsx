"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  Layers3,
  MapPin,
  Plus,
  Route,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RecommendedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  matchLabel?: string;
};

type RecentApplication = {
  id: string;
  company: string;
  title: string;
  status: string;
  date?: string;
};

type JobSeekerDashboardProps = {
  userName?: string;
  recommendedJobs?: RecommendedJob[];
  recentApplications?: RecentApplication[];
};

const moduleCards = [
  {
    title: "Resume Studio",
    description: "Build, manage, upload, analyze, and improve your resume.",
    cta: "Open Resume Studio",
    href: "/seeker/resume-studio",
    icon: FileText,
    iconClass:
      "bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400",
    hoverClass:
      "hover:border-violet-300 hover:bg-violet-50/40 hover:ring-violet-500/20 focus-within:border-violet-400 focus-within:bg-violet-50/40 focus-within:ring-violet-500/20 dark:hover:border-violet-400/40 dark:hover:bg-violet-400/10 dark:focus-within:border-violet-400/50 dark:focus-within:bg-violet-400/10",
  },
  {
    title: "Job Matches",
    description: "Discover roles matched to your profile, resume, and skills.",
    cta: "Explore Jobs",
    href: "/seeker/jobs",
    icon: BriefcaseBusiness,
    iconClass:
      "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
    hoverClass:
      "hover:border-sky-300 hover:bg-sky-50/40 hover:ring-sky-500/20 focus-within:border-sky-400 focus-within:bg-sky-50/40 focus-within:ring-sky-500/20 dark:hover:border-sky-400/40 dark:hover:bg-sky-400/10 dark:focus-within:border-sky-400/50 dark:focus-within:bg-sky-400/10",
  },
  {
    title: "Skill Gap",
    description: "See which skills to improve for your target roles.",
    cta: "View Skill Gap",
    href: "/seeker/skill-gap",
    icon: Route,
    iconClass:
      "bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400",
    hoverClass:
      "hover:border-violet-300 hover:bg-violet-50/40 hover:ring-violet-500/20 focus-within:border-violet-400 focus-within:bg-violet-50/40 focus-within:ring-violet-500/20 dark:hover:border-violet-400/40 dark:hover:bg-violet-400/10 dark:focus-within:border-violet-400/50 dark:focus-within:bg-violet-400/10",
  },
  {
    title: "Applications",
    description: "Track the jobs you have applied to and their status.",
    cta: "View Applications",
    href: "/seeker/applications",
    icon: Layers3,
    iconClass:
      "bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
    hoverClass:
      "hover:border-sky-300 hover:bg-sky-50/40 hover:ring-sky-500/20 focus-within:border-sky-400 focus-within:bg-sky-50/40 focus-within:ring-sky-500/20 dark:hover:border-sky-400/40 dark:hover:bg-sky-400/10 dark:focus-within:border-sky-400/50 dark:focus-within:bg-sky-400/10",
  },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function JobSeekerDashboard({
  userName,
  recommendedJobs = [],
  recentApplications = [],
}: JobSeekerDashboardProps) {
  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <section className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/80 px-3 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
            <span className="size-1.5 rounded-full bg-violet-500" />
            Job Seeker Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {greeting}
            {userName ? `, ${userName}` : ""}
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Everything you need to move your career forward.
          </p>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {moduleCards.map((module) => {
            const Icon = module.icon;

            return (
              <Card
                key={module.title}
                className={`border-border transition-all ${module.hoverClass}`}
              >
                <CardHeader>
                  <div
                    className={`mb-4 flex size-10 items-center justify-center rounded-lg ${module.iconClass}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription className="leading-6">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto justify-between gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full focus-visible:border-violet-400 focus-visible:ring-violet-500/30 hover:border-violet-300 hover:text-violet-700 active:border-violet-400 dark:focus-visible:border-violet-400/50 dark:hover:border-violet-400/40 dark:hover:text-violet-300"
                  >
                    <Link href={module.href}>
                      {module.cta}
                      <ArrowRight data-icon="inline-end" className="size-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <Card className="gap-0">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle>Recommended Jobs</CardTitle>
              <CardDescription>
                Personalized opportunities will appear here when your profile has
                enough detail.
              </CardDescription>
            </CardHeader>

            {recommendedJobs.length > 0 ? (
              <CardContent className="grid gap-3 pt-4">
                {recommendedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/seeker/jobs/${job.id}`}
                    className="rounded-xl border border-border bg-background p-4 outline-none transition-colors hover:border-violet-300 hover:bg-violet-50/40 focus-visible:border-violet-400 focus-visible:bg-violet-50/40 focus-visible:ring-2 focus-visible:ring-violet-500/20 active:border-violet-400 dark:hover:border-violet-400/40 dark:hover:bg-violet-400/10 dark:focus-visible:border-violet-400/50 dark:focus-visible:bg-violet-400/10"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {job.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {job.company}
                        </p>
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-3.5 text-sky-500" />
                          {job.location}
                        </p>
                      </div>
                      {job.matchLabel ? (
                        <span className="w-fit rounded-full border border-violet-200/70 bg-violet-50/80 px-2.5 py-1 text-xs font-medium text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
                          {job.matchLabel}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 dark:text-violet-300">
                      View job
                      <ArrowRight className="size-4" />
                    </span>
                  </Link>
                ))}
              </CardContent>
            ) : (
              <CardContent className="pt-6">
                <div className="rounded-xl border border-dashed border-violet-200/70 bg-violet-50/40 p-6 dark:border-violet-400/20 dark:bg-violet-400/10">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-background text-violet-600 ring-1 ring-violet-200/70 dark:text-violet-400 dark:ring-violet-400/20">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-foreground">
                    Complete your profile to get personalized job
                    recommendations.
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Add your resume, skills, and target roles so Hirefy can surface
                    relevant opportunities.
                  </p>
                  <Button asChild className="mt-5">
                    <Link href="/seeker/resume-studio">
                      Complete Profile
                      <ArrowRight data-icon="inline-end" className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          <Card className="gap-0">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Track recent roles and application progress.
              </CardDescription>
            </CardHeader>

            {recentApplications.length > 0 ? (
              <CardContent className="grid gap-3 pt-4">
                {recentApplications.map((application) => (
                  <Link
                    key={application.id}
                    href={`/seeker/applications/${application.id}`}
                    className="rounded-xl border border-border bg-background p-4 outline-none transition-colors hover:border-sky-300 hover:bg-sky-50/40 focus-visible:border-sky-400 focus-visible:bg-sky-50/40 focus-visible:ring-2 focus-visible:ring-sky-500/20 active:border-sky-400 dark:hover:border-sky-400/40 dark:hover:bg-sky-400/10 dark:focus-visible:border-sky-400/50 dark:focus-visible:bg-sky-400/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-foreground">
                          {application.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {application.company}
                        </p>
                      </div>
                      <span className="rounded-full border border-sky-200/70 bg-sky-50/80 px-2.5 py-1 text-xs font-medium text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
                        {application.status}
                      </span>
                    </div>
                    {application.date ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        {application.date}
                      </p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 dark:text-violet-300">
                      View application
                      <ArrowRight className="size-4" />
                    </span>
                  </Link>
                ))}
              </CardContent>
            ) : (
              <CardContent className="pt-6">
                <div className="rounded-xl border border-dashed border-sky-200/70 bg-sky-50/40 p-6 dark:border-sky-400/20 dark:bg-sky-400/10">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-background text-sky-600 ring-1 ring-sky-200/70 dark:text-sky-400 dark:ring-sky-400/20">
                    <Plus className="size-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-foreground">
                    No applications yet
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Explore matched roles and save your application progress here.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-5 focus-visible:border-violet-400 focus-visible:ring-violet-500/30 hover:border-violet-300 hover:text-violet-700 active:border-violet-400 dark:focus-visible:border-violet-400/50 dark:hover:border-violet-400/40 dark:hover:text-violet-300"
                  >
                    <Link href="/seeker/jobs">
                      Explore Jobs
                      <ArrowRight data-icon="inline-end" className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}
