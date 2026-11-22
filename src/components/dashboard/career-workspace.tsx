"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileText, Sparkles, Target, Upload } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { JobDiscovery } from "@/components/dashboard/job-discovery";
import { ResumeStudio } from "@/components/dashboard/resume-studio";

type Props = {
  kind: "jobs" | "resume" | "applications" | "skills";
  userName?: string;
  userEmail?: string;
};

const config = {
  jobs: { title: "Find your next role", intro: "Search opportunities that fit your goals.", icon: BriefcaseBusiness },
  resume: { title: "Resume Studio", intro: "Create, organize, and tailor your resume for the roles you want.", icon: FileText },
  applications: { title: "Application tracker", intro: "Keep your job search organized in one place.", icon: Target },
  skills: { title: "Your skill gap", intro: "Choose a target role to map the skills you want to build.", icon: Sparkles },
} as const;

export function CareerWorkspace({ kind, userName, userEmail }: Props) {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeCreated, setResumeCreated] = useState(false);
  const page = config[kind];
  const Icon = page.icon;

  if (kind === "jobs") return <JobDiscovery />;
  if (kind === "resume") return <ResumeStudio userName={userName} userEmail={userEmail} />;

  return <div className="min-h-screen bg-background"><DashboardHeader/><main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <div className="mb-7"><Link href="/seeker/dashboard" className="text-sm font-medium text-violet-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">← Home</Link><div className="mt-5 flex items-start gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-800"><Icon className="size-5"/></span><div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{page.title}</h1><p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">{page.intro}</p></div></div></div>
    {kind === "applications" && <section className="rounded-2xl border border-border p-5 sm:p-7"><h2 className="text-lg font-semibold">Your applications</h2><div className="mt-5 rounded-xl border border-dashed border-border bg-muted/30 px-5 py-10 text-center"><Target className="mx-auto size-8 text-muted-foreground"/><h3 className="mt-3 font-semibold">No applications to track</h3><p className="mt-1 text-sm text-muted-foreground">Applications you add will be organized here.</p><Link href="/seeker/jobs" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white hover:bg-violet-800">Explore jobs <ArrowRight className="size-4"/></Link></div></section>}
    {kind === "skills" && <section className="rounded-2xl border border-border p-5 sm:p-7"><h2 className="text-lg font-semibold">Choose a target role</h2><p className="mt-1 text-sm text-muted-foreground">We need your target role and skills before a meaningful comparison is possible.</p><form onSubmit={e=>{e.preventDefault();setNotice(query.trim()?`Target role saved for this session: ${query.trim()}. Add a resume to continue.`:"Enter a target role.");}} className="mt-4 flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="target-role">Target role</label><input id="target-role" value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. Frontend engineer" className="h-12 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"/><button className="min-h-12 rounded-lg bg-violet-700 px-5 font-semibold text-white hover:bg-violet-800">Set target role</button></form><Link className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-violet-800 hover:underline" href="/seeker/resume-studio">Add a resume <ArrowRight className="size-4"/></Link></section>}
    {notice&&<p role="status" className="mt-4 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950">{notice}</p>}
  </main></div>;
}
