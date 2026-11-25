import {
  Award,
  Bookmark,
  BriefcaseBusiness,
  Calendar,
  Check,
  CheckCircle2,
  FileText,
  Layers3,
  MapPin,
  Search,
  Send,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";

function MiniScoreGauge({
  score,
  color = "#F59E0B",
}: {
  score: number;
  color?: string;
}) {
  const size = 44;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center">
      <svg className="size-11 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-muted/40"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <span className="absolute text-xs font-bold text-foreground">
        {score}
      </span>
    </div>
  );
}

/**
 * 1. Hero Workspace Live Component Preview
 */
export function HeroWorkspacePreview() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] text-left">
      {/* Mock App Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-background/70 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-extrabold text-white">
            H
          </span>
          <span className="text-sm font-bold tracking-tight text-foreground">
            Hirefy
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-300">
            <Sparkles className="size-3" />
            AI Career Workspace
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground w-64">
          <Search className="size-3.5" />
          <span>Search jobs, companies, skills...</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            Live Sync
          </span>
          <span className="flex size-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
            AS
          </span>
        </div>
      </div>

      {/* 3-Column Live Workspace Preview */}
      <div className="grid gap-4 p-5 lg:grid-cols-12">
        {/* Left: Resume Studio */}
        <div className="rounded-2xl border border-border bg-background p-4 lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <FileText className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Resume Studio
                </p>
                <p className="text-[11px] text-muted-foreground">
                  2 of 3 slots used
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
              <CheckCircle2 className="size-3" />
              ATS-friendly
            </span>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-3.5 text-zinc-900 shadow-xs space-y-2">
            <div className="border-b border-zinc-200 pb-1.5">
              <p className="text-xs font-extrabold uppercase tracking-wider">
                Aarav Shah
              </p>
              <p className="text-[10px] font-semibold text-zinc-600">
                Frontend Engineer · React &amp; Next.js
              </p>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-zinc-200" />
              <div className="h-1.5 w-5/6 rounded-full bg-zinc-200" />
              <div className="h-1.5 w-4/6 rounded-full bg-zinc-200" />
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {["TypeScript", "Next.js", "Tailwind", "Prisma"].map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Center: AI Job Discovery */}
        <div className="rounded-2xl border border-border bg-background p-4 lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-violet-600" />
              Top AI Job Matches
            </p>
            <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">
              Ranked by Resume
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                title: "Senior Frontend Engineer",
                company: "TechCore",
                location: "Remote · Full-time",
                score: 94,
                color: "#10B981",
                skills: ["React", "TypeScript", "Next.js"],
              },
              {
                title: "Full-Stack Product Engineer",
                company: "Acme Cloud",
                location: "Hybrid · Bengaluru",
                score: 88,
                color: "#F59E0B",
                skills: ["Next.js", "PostgreSQL", "Tailwind"],
              },
            ].map((job) => (
              <div
                key={job.title}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-xs font-bold text-foreground">
                    {job.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {job.company} • {job.location}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {job.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <MiniScoreGauge score={job.score} color={job.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Application & Hiring Pipeline */}
        <div className="rounded-2xl border border-border bg-background p-4 lg:col-span-3 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Layers3 className="size-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground">
                Hiring Pipeline
              </p>
              <p className="text-[11px] text-muted-foreground">
                Real-time status
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { stage: "Shortlisted", count: 8, badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
              { stage: "Interview", count: 4, badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
              { stage: "Selected", count: 2, badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
            ].map((row) => (
              <div
                key={row.stage}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-xs"
              >
                <span className="font-semibold text-foreground">
                  {row.stage}
                </span>
                <span className={`rounded-full px-2 py-0.5 font-bold ${row.badge}`}>
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 2. Resume Section Live Component Preview
 */
export function ResumeStudioPreview() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      {/* Top Studio Bar */}
      <div className="flex items-center justify-between border-b border-border pb-3.5">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            • Resume Studio
          </p>
          <p className="text-sm font-bold text-foreground">
            Harvard FAS Builder &amp; Skill Gap
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-6 rounded-full bg-violet-600" />
          <div className="h-1.5 w-6 rounded-full bg-violet-600" />
          <div className="h-1.5 w-6 rounded-full bg-muted" />
        </div>
      </div>

      {/* Split View: Paper Resume + Skill Gap */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-xs space-y-2.5">
          <div className="border-b border-zinc-300 pb-2 text-center">
            <p className="text-xs font-extrabold uppercase tracking-wider">
              Jamie Smith
            </p>
            <p className="text-[10px] text-zinc-600">
              San Francisco, CA • Senior Product Designer
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-zinc-800">
              Experience
            </p>
            <p className="mt-1 text-[10px] font-semibold">
              Lead Designer · Linear
            </p>
            <div className="mt-1 space-y-1">
              <div className="h-1.5 w-full rounded-full bg-zinc-200" />
              <div className="h-1.5 w-11/12 rounded-full bg-zinc-200" />
              <div className="h-1.5 w-4/5 rounded-full bg-zinc-200" />
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between border-t border-zinc-200">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
              <CheckCircle2 className="size-3" />
              ATS-friendly
            </span>
            <span className="text-[10px] font-semibold text-violet-700">
              Download PDF
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-background p-3.5">
            <div>
              <p className="text-xs font-bold text-foreground">
                Role Match Score
              </p>
              <p className="text-[11px] text-muted-foreground">
                Senior Product Designer
              </p>
            </div>
            <MiniScoreGauge score={92} color="#10B981" />
          </div>

          <div className="rounded-xl border border-border bg-background p-3.5 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Skills Coverage
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: "Figma", ok: true },
                { name: "Design Systems", ok: true },
                { name: "Prototyping", ok: true },
                { name: "Framer", ok: false },
              ].map((sk) => (
                <span
                  key={sk.name}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                    sk.ok
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300"
                  }`}
                >
                  {sk.ok ? (
                    <Check className="size-3" />
                  ) : (
                    <X className="size-3" />
                  )}
                  {sk.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Job Discovery Live Component Preview
 */
export function JobDiscoveryPreview() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] space-y-3.5">
      <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Search className="size-3.5 text-violet-600" />
          Search by title, company, or skill...
        </span>
        <span className="rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background">
          AI Match
        </span>
      </div>

      {[
        {
          title: "Senior Product Designer",
          company: "Linear",
          location: "San Francisco, CA",
          mode: "Remote",
          salary: "$160k – $210k",
          score: 95,
          color: "#10B981",
          skills: ["Figma", "Design Systems", "Prototyping"],
        },
        {
          title: "Full-Stack Software Engineer",
          company: "Vercel",
          location: "Remote (Global)",
          mode: "Remote",
          salary: "$150k – $195k",
          score: 89,
          color: "#F59E0B",
          skills: ["Next.js", "TypeScript", "PostgreSQL"],
        },
      ].map((job) => (
        <div
          key={job.title}
          className="rounded-2xl border border-border bg-background p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-foreground">{job.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/80">
                  {job.company}
                </span>
                <span>•</span>
                <MapPin className="size-3" />
                <span>{job.location}</span>
              </p>
            </div>
            <MiniScoreGauge score={job.score} color={job.color} />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300">
              {job.mode}
            </span>
            <span className="rounded-full border border-border px-2.5 py-0.5 text-muted-foreground">
              {job.salary}
            </span>
            {job.skills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/70 pt-2.5">
            <span className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground">
              <Bookmark className="size-3" />
              Save
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-foreground px-3 py-1 text-[11px] font-bold text-background">
              <Send className="size-3" />
              Apply
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 4. Recruiter & AI Candidate Ranking Live Component Preview
 */
export function RecruiterPipelinePreview() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] space-y-4 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-violet-600" />
          <span className="text-xs font-bold text-foreground">
            AI-Assisted Candidate Ranking
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-800 dark:bg-violet-500/20 dark:text-violet-200">
          <Users className="size-3" />
          18 Applicants
        </span>
      </div>

      {/* Top Ranked Candidates */}
      <div className="space-y-2.5">
        {[
          {
            rank: "#1",
            name: "Aarav Shah",
            exp: "4 yrs • React, Next.js, TypeScript",
            score: "96% Match",
            shortlisted: true,
          },
          {
            rank: "#2",
            name: "Priya Nair",
            exp: "3 yrs • Full-Stack, PostgreSQL, Prisma",
            score: "91% Match",
            shortlisted: false,
          },
        ].map((cand) => (
          <div
            key={cand.name}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-xs font-extrabold text-white">
                {cand.rank}
              </span>
              <div>
                <p className="text-xs font-bold text-foreground">{cand.name}</p>
                <p className="text-[11px] text-muted-foreground">{cand.exp}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300">
                <Award className="size-3" />
                {cand.score}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                  cand.shortlisted
                    ? "bg-violet-600 text-white"
                    : "border border-border text-foreground"
                }`}
              >
                <UserCheck className="size-3" />
                {cand.shortlisted ? "Shortlisted" : "Shortlist"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Kanban Pipeline */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { label: "Shortlisted", count: 5, accent: "border-t-violet-500" },
          { label: "Interview", count: 3, accent: "border-t-amber-500" },
          { label: "Selected", count: 1, accent: "border-t-emerald-500" },
        ].map((col) => (
          <div
            key={col.label}
            className={`rounded-xl border border-border border-t-4 ${col.accent} bg-background p-2.5`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span>{col.label}</span>
              <span className="text-muted-foreground">{col.count}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="size-3" />
              <span>Active stage</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
