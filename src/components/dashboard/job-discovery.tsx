"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Filter,
  Lightbulb,
  MapPin,
  Plus,
  Search,
  Send,
  Sparkles,
  Upload,
  X,
  Sparkle,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: "Full-time" | "Contract" | "Part-time" | "Internship";
  mode: "Remote" | "Hybrid" | "On-site";
  experience: string;
  skills: string[];
  age: string;
  score: number;
  avatarBg: string;
  avatarText: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  tip: string;
  recommendationSummary?: string;
  recommendationDetail?: string;
  industry: "Design" | "Engineering" | "Product";
};

const INITIAL_JOBS: Job[] = [
  {
    id: 1,
    title: "Senior Product Designer",
    company: "Linear",
    location: "San Francisco, CA",
    salary: "$160k – $210k",
    type: "Full-time",
    mode: "Remote",
    experience: "5+ years",
    skills: ["Figma", "Design Systems", "Prototyping", "User Research", "Framer"],
    age: "2d ago",
    score: 82,
    avatarBg: "bg-[#5E6AD2]",
    avatarText: "L",
    requiredSkills: ["Figma", "Design Systems", "Prototyping", "User Research"],
    tip: "Mention any exposure to Framer or Motion Design — it's a tiebreaker here.",
    recommendationSummary: "Your resume covers 5 of 5 required skills — Figma, Design Systems, Prototyping.",
    recommendationDetail: "No preferred skills matched, but required-skill coverage drives most of the score.",
    industry: "Design",
  },
  {
    id: 2,
    title: "Design Engineer",
    company: "Rippling",
    location: "Remote (Global)",
    salary: "$110k – $150k",
    type: "Contract",
    mode: "Remote",
    experience: "2–4 years",
    skills: ["React", "Tailwind", "Motion Design", "Design Systems"],
    age: "10d ago",
    score: 44,
    avatarBg: "bg-[#00835C]",
    avatarText: "R",
    requiredSkills: ["Tailwind", "Design Systems", "React", "Motion Design"],
    tip: "Add evidence of React and Motion Design to your experience bullets.",
    recommendationSummary: "Your resume covers 2 of 4 required skills — Tailwind, Design Systems.",
    recommendationDetail: "No preferred skills matched, but required-skill coverage drives most of the score.",
    industry: "Engineering",
  },
  {
    id: 3,
    title: "Frontend Engineer, Growth",
    company: "Vercel",
    location: "New York, NY",
    salary: "$140k – $190k",
    type: "Full-time",
    mode: "Hybrid",
    experience: "3–5 years",
    skills: ["React", "TypeScript", "Next.js", "A/B Testing", "Tailwind"],
    age: "5d ago",
    score: 38,
    avatarBg: "bg-black dark:bg-zinc-800",
    avatarText: "V",
    requiredSkills: ["Tailwind", "React", "TypeScript", "Next.js"],
    tip: "Add evidence of React and TypeScript to your experience bullets.",
    recommendationSummary: "Your resume covers 1 of 5 required skills — Tailwind.",
    recommendationDetail: "No preferred skills matched, but required-skill coverage drives most of the score.",
    industry: "Engineering",
  },
  {
    id: 4,
    title: "Full-Stack Engineer",
    company: "Notion",
    location: "Remote (US)",
    salary: "$150k – $200k",
    type: "Full-time",
    mode: "Remote",
    experience: "4+ years",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "AWS"],
    age: "1d ago",
    score: 38,
    avatarBg: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white",
    avatarText: "N",
    requiredSkills: ["React", "Node.js", "PostgreSQL"],
    tip: "Add evidence of React and Node.js to your experience bullets.",
    recommendationSummary: "Your resume covers 0 of 5 required skills.",
    recommendationDetail: "No preferred skills matched, but required-skill coverage drives most of the score.",
    industry: "Engineering",
  },
  {
    id: 5,
    title: "Product Designer, Core Systems",
    company: "Figma",
    location: "San Francisco, CA",
    salary: "$155k – $195k",
    type: "Full-time",
    mode: "Hybrid",
    experience: "3–5 years",
    skills: ["Figma", "Design Systems", "Accessibility", "Prototyping"],
    age: "3d ago",
    score: 78,
    avatarBg: "bg-gradient-to-br from-orange-500 to-rose-500",
    avatarText: "F",
    requiredSkills: ["Figma", "Design Systems", "Prototyping", "User Research"],
    tip: "Showcase design token governance and responsive component libraries.",
    recommendationSummary: "Your resume covers 4 of 4 required skills — Figma, Design Systems, Prototyping.",
    recommendationDetail: "High skill alignment across core design system requirements.",
    industry: "Design",
  },
  {
    id: 6,
    title: "UX Engineer",
    company: "Webflow",
    location: "Remote (US)",
    salary: "$130k – $170k",
    type: "Full-time",
    mode: "Remote",
    experience: "3–5 years",
    skills: ["React", "CSS", "Accessibility", "Figma", "Design Systems"],
    age: "4d ago",
    score: 64,
    avatarBg: "bg-[#146EF5]",
    avatarText: "W",
    requiredSkills: ["Figma", "Design Systems", "React", "CSS"],
    tip: "Add an accessibility case study or WCAG 2.1 compliance audit.",
    recommendationSummary: "Your resume covers 3 of 4 required skills — Figma, Design Systems.",
    recommendationDetail: "Strong design foundation; adding web interaction projects boosts match.",
    industry: "Engineering",
  },
  {
    id: 7,
    title: "Staff Product Designer",
    company: "Stripe",
    location: "San Francisco, CA",
    salary: "$190k – $240k",
    type: "Full-time",
    mode: "On-site",
    experience: "5+ years",
    skills: ["Design Systems", "Figma", "Product Strategy", "User Research", "Fintech"],
    age: "6d ago",
    score: 88,
    avatarBg: "bg-[#635BFF]",
    avatarText: "S",
    requiredSkills: ["Figma", "Design Systems", "User Research", "Product Strategy"],
    tip: "Highlight measurable business outcomes and payments workflow design.",
    recommendationSummary: "Your resume covers 4 of 5 required skills — Figma, Design Systems, User Research.",
    recommendationDetail: "Exceptional alignment with executive design leadership criteria.",
    industry: "Design",
  },
  {
    id: 8,
    title: "Senior Design Systems Lead",
    company: "Airbnb",
    location: "Remote (Global)",
    salary: "$180k – $230k",
    type: "Full-time",
    mode: "Remote",
    experience: "5+ years",
    skills: ["Design Systems", "Figma", "Prototyping", "User Research", "Accessibility"],
    age: "1d ago",
    score: 92,
    avatarBg: "bg-[#FF5A5F]",
    avatarText: "A",
    requiredSkills: ["Figma", "Design Systems", "Prototyping", "User Research", "Accessibility"],
    tip: "Highlight experience leading multi-brand system architecture across web and mobile.",
    recommendationSummary: "Your resume covers 5 of 5 required skills — Figma, Design Systems, Prototyping, User Research.",
    recommendationDetail: "Top-tier match across all foundational and preferred requirements.",
    industry: "Design",
  },
];

interface ResumeOption {
  name: string;
  ats: number;
  years: string;
  skillsCount: number;
  updated: string;
  knownSkills: string[];
}

const DEFAULT_RESUMES: Record<string, ResumeOption> = {
  "Product Designer — 2026.pdf": {
    name: "Product Designer — 2026.pdf",
    ats: 91,
    years: "6 years",
    skillsCount: 7,
    updated: "Updated 2 days ago",
    knownSkills: ["Figma", "Design Systems", "Prototyping", "User Research", "Tailwind", "Accessibility", "Product Strategy"],
  },
  "Senior UX Engineer — 2026.pdf": {
    name: "Senior UX Engineer — 2026.pdf",
    ats: 88,
    years: "5 years",
    skillsCount: 8,
    updated: "Updated 4 days ago",
    knownSkills: ["Figma", "Design Systems", "React", "CSS", "Tailwind", "Accessibility", "TypeScript"],
  },
  "Full Stack Developer — 2026.pdf": {
    name: "Full Stack Developer — 2026.pdf",
    ats: 84,
    years: "4 years",
    skillsCount: 9,
    updated: "Updated 1 week ago",
    knownSkills: ["React", "Node.js", "TypeScript", "Next.js", "PostgreSQL", "Tailwind", "AWS"],
  },
};

// Circular gauge for matching score
function ScoreGauge({ score }: { score: number }) {
  const size = 46;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Amber for high, coral for medium/lower matching the screenshot
  const strokeColor =
    score >= 75
      ? "#F59E0B" // warm amber / yellow
      : score >= 50
      ? "#F59E0B"
      : "#EF4444"; // coral / red

  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center">
      <svg className="size-11 -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-muted/40 dark:stroke-muted/20"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-bold text-foreground">{score}</span>
    </div>
  );
}

interface JobDiscoveryProps {
  userName?: string;
  userInitials?: string;
}

export function JobDiscovery({
  userName = "Jamie Smith",
  userInitials = "JS",
}: JobDiscoveryProps = {}) {
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [query, setQuery] = useState("");
  const [workMode, setWorkMode] = useState("Any");
  const [employment, setEmployment] = useState("Any");
  const [experience, setExperience] = useState("Any");
  const [location, setLocation] = useState("Any");
  const [industry, setIndustry] = useState("Any");
  const [company, setCompany] = useState("Any");
  const [salary, setSalary] = useState(0);
  const [sort, setSort] = useState("match");
  const [visibleCount, setVisibleCount] = useState(4);
  const [saved, setSaved] = useState<number[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [selectedResumeKey, setSelectedResumeKey] = useState("Product Designer — 2026.pdf");
  const [resumes, setResumes] = useState(DEFAULT_RESUMES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSearchingWithAI, setIsSearchingWithAI] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [applyNote, setApplyNote] = useState("");

  const currentResume = resumes[selectedResumeKey] || DEFAULT_RESUMES["Product Designer — 2026.pdf"];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newResume: ResumeOption = {
        name: file.name,
        ats: 92,
        years: "5+ years",
        skillsCount: 8,
        updated: "Just uploaded",
        knownSkills: ["Figma", "Design Systems", "Prototyping", "User Research", "Tailwind", "React"],
      };
      setResumes((prev) => ({
        ...prev,
        [file.name]: newResume,
      }));
      setSelectedResumeKey(file.name);
      showToast(`Uploaded and analyzed "${file.name}" with ATS 92 score.`);
    }
  };

  const triggerAISearch = () => {
    setIsSearchingWithAI(true);
    setSort("match");
    setTimeout(() => {
      setIsSearchingWithAI(false);
      showToast(`AI re-ranked jobs for ${currentResume.name}`);
    }, 600);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applyingJob) {
      setAppliedJobs((prev) => [...prev, applyingJob.id]);
      showToast(`Application successfully sent to ${applyingJob.company} for ${applyingJob.title}!`);
      setApplyingJob(null);
      setApplyNote("");
    }
  };

  const resetFilters = () => {
    setWorkMode("Any");
    setEmployment("Any");
    setExperience("Any");
    setLocation("Any");
    setIndustry("Any");
    setCompany("Any");
    setSalary(0);
    setQuery("");
  };

  // Filtered and sorted job list
  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = INITIAL_JOBS.filter((job) => {
      const queryMatch =
        !q ||
        [job.title, job.company, job.location, ...job.skills].some((item) =>
          item.toLowerCase().includes(q)
        );

      const workMatch = workMode === "Any" || job.mode === workMode;
      const typeMatch = employment === "Any" || job.type === employment;

      const expMatch =
        experience === "Any" ||
        (experience === "0–2 years" && ["0–2 years", "2–4 years"].includes(job.experience)) ||
        (experience === "3–5 years" &&
          ["2–4 years", "3–5 years", "4+ years"].includes(job.experience)) ||
        (experience === "5+ years" && job.experience === "5+ years");

      const locationMatch =
        location === "Any" ||
        job.location.toLowerCase().includes(location.toLowerCase());

      const industryMatch = industry === "Any" || job.industry === industry;
      const companyMatch = company === "Any" || job.company === company;

      const salaryNumber = Number(job.salary.match(/\$(\d+)/)?.[1] ?? 0);
      const salaryMatch = salaryNumber >= salary;

      return (
        queryMatch &&
        workMatch &&
        typeMatch &&
        expMatch &&
        locationMatch &&
        industryMatch &&
        companyMatch &&
        salaryMatch
      );
    });

    // Sorting
    if (sort === "salary") {
      result.sort(
        (a, b) =>
          Number(b.salary.match(/\$(\d+)/)?.[1] ?? 0) -
          Number(a.salary.match(/\$(\d+)/)?.[1] ?? 0)
      );
    } else if (sort === "recent") {
      result.sort((a, b) => Number.parseInt(a.age) - Number.parseInt(b.age));
    } else if (sort === "match" || mode === "ai") {
      result.sort((a, b) => b.score - a.score);
    }

    return result;
  }, [query, workMode, employment, experience, location, industry, company, salary, sort, mode]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Navigation Header */}
      <DashboardHeader
        userName={userName}
        userInitials={userInitials}
        onSearch={(val) => setQuery(val)}
        searchValue={query}
      />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Top Title Section */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-violet-50/80 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
            <Sparkles className="size-3.5 text-violet-600 dark:text-violet-400" />
            Job discovery
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Find your next role
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            Use AI to surface your best-fit jobs — or search manually with filters.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          className="mb-6 inline-flex rounded-xl border border-border bg-card p-1 shadow-sm"
          role="tablist"
          aria-label="Job search method"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "ai"}
            onClick={() => {
              setMode("ai");
              setSort("match");
            }}
            className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-semibold sm:text-sm transition-all ${
              mode === "ai"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            <Sparkles className="size-4" />
            AI Resume Search
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "manual"}
            onClick={() => {
              setMode("manual");
              setSort("recent");
            }}
            className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-semibold sm:text-sm transition-all ${
              mode === "manual"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            <Search className="size-4" />
            Manual Search
          </button>
        </div>

        {/* AI Resume Search Card (Rendered only in AI mode) */}
        {mode === "ai" && (
          <section
            aria-labelledby="resume-search-title"
            className="mb-6 relative overflow-hidden rounded-3xl border border-violet-200/90 bg-gradient-to-br from-violet-50/70 via-card to-card p-5 sm:p-7 shadow-[0_12px_40px_-20px_rgba(139,92,246,0.35)] dark:border-violet-800/40 dark:from-violet-950/20 dark:via-card dark:to-card dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.6)]"
          >
            {/* Subtle glow effect */}
            <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-violet-400/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/80 bg-background/80 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:border-violet-700/50 dark:bg-card dark:text-violet-300">
                  <Sparkles className="size-3.5" />
                  Powered by Hirefy AI
                </span>

                <h2
                  id="resume-search-title"
                  className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
                >
                  Search jobs using your resume
                </h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm leading-relaxed max-w-3xl">
                  AI extracts your skills, experience, education, projects, certifications, and keywords — then ranks every job by resume match score.
                </p>

                {/* Resume Selector and Action Buttons */}
                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-end">
                  <div className="flex-1 min-w-0 max-w-md">
                    <label
                      htmlFor="resume-select"
                      className="mb-1.5 block text-xs font-semibold text-foreground"
                    >
                      Use resume
                    </label>
                    <div className="relative">
                      <select
                        id="resume-select"
                        value={selectedResumeKey}
                        onChange={(e) => {
                          setSelectedResumeKey(e.target.value);
                          showToast(`Selected resume: ${e.target.value}`);
                        }}
                        className="h-10 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-9 text-xs sm:text-sm text-foreground outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                      >
                        {Object.keys(resumes).map((key) => (
                          <option key={key} value={key}>
                            {resumes[key].name} — ATS {resumes[key].ats}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:border-violet-300 hover:bg-muted/50">
                      <Upload className="size-4 text-muted-foreground" />
                      Upload
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        onChange={handleFileUpload}
                      />
                    </label>

                    <Link
                      href="/seeker/resume-studio"
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:border-violet-300 hover:bg-muted/50"
                    >
                      <Plus className="size-4 text-muted-foreground" />
                      Build
                    </Link>
                  </div>
                </div>

                {/* Resume Meta Pill Badges */}
                <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 font-medium text-foreground dark:bg-card">
                    <FileText className="size-3.5 text-muted-foreground" />
                    {currentResume.name}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    ATS {currentResume.ats}
                  </span>
                  <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 font-medium text-muted-foreground dark:bg-card">
                    {currentResume.years}
                  </span>
                  <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 font-medium text-muted-foreground dark:bg-card">
                    {currentResume.skillsCount} skills
                  </span>
                  <span className="ml-1 text-muted-foreground">
                    {currentResume.updated}
                  </span>
                </div>
              </div>

              {/* Purple CTA Button on the right */}
              <div className="shrink-0 xl:self-center">
                <button
                  type="button"
                  onClick={triggerAISearch}
                  disabled={isSearchingWithAI}
                  className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 px-6 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-70"
                >
                  <Sparkle className={`size-4 ${isSearchingWithAI ? "animate-spin" : ""}`} />
                  {isSearchingWithAI ? "Analyzing Match..." : "Search Jobs Using My Resume"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Global Search and Sort Row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisibleCount(4);
              }}
              placeholder="Search by title, company, skill, or keyword"
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search input"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sort Dropdown */}
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-border bg-background pl-3.5 pr-8 text-xs sm:text-sm font-medium text-foreground outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              >
                <option value="match">Sort: Resume Match Score</option>
                <option value="recent">Sort: Most Recent</option>
                <option value="salary">Sort: Highest Salary</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* Mobile Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:border-violet-300 hover:bg-muted/50 lg:hidden"
            >
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <span>Filters</span>
            </button>

            {/* Desktop Filters Button (anchors or resets) */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("filters-sidebar");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hidden lg:inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-violet-300 hover:bg-muted/50"
            >
              <Filter className="size-4 text-muted-foreground" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Main Content Layout: Sidebar on left + Job Cards on right */}
        <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Filters Sidebar (Desktop) */}
          <aside
            id="filters-sidebar"
            className="hidden lg:block rounded-2xl border border-border bg-card p-5 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h2 className="text-sm font-bold text-foreground">Filters</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline dark:text-violet-400"
              >
                Reset
              </button>
            </div>

            <FilterSection
              workMode={workMode}
              setWorkMode={setWorkMode}
              employment={employment}
              setEmployment={setEmployment}
              salary={salary}
              setSalary={setSalary}
              experience={experience}
              setExperience={setExperience}
              location={location}
              setLocation={setLocation}
              industry={industry}
              setIndustry={setIndustry}
              company={company}
              setCompany={setCompany}
            />
          </aside>

          {/* Mobile Filter Drawer / Collapsible */}
          {mobileFiltersOpen && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-lg lg:hidden mb-4">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <h2 className="text-sm font-bold text-foreground">Filters</h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <FilterSection
                workMode={workMode}
                setWorkMode={setWorkMode}
                employment={employment}
                setEmployment={setEmployment}
                salary={salary}
                setSalary={setSalary}
                experience={experience}
                setExperience={setExperience}
                location={location}
                setLocation={setLocation}
                industry={industry}
                setIndustry={setIndustry}
                company={company}
                setCompany={setCompany}
              />
            </div>
          )}

          {/* Jobs Listing Grid (Right Column) */}
          <section className="min-w-0" aria-label="Job listings">
            {/* Header with count and ranking indicator */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
              <span className="text-muted-foreground">
                <strong className="text-foreground font-bold">{filteredJobs.length}</strong> matching jobs
              </span>

              {mode === "ai" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                  <Sparkles className="size-3.5" />
                  Ranked by match with {currentResume.name}
                </span>
              )}
            </div>

            {/* Empty State */}
            {filteredJobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
                <Search className="mx-auto size-8 text-muted-foreground" />
                <h3 className="mt-3 text-base font-bold text-foreground">
                  No matching jobs found
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Try adjusting your search query, location, or resetting the filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 rounded-xl border border-border bg-background px-4 py-2 text-xs sm:text-sm font-semibold text-violet-600 hover:bg-muted dark:text-violet-400"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              /* Job Cards Grid (2 Columns on large screens) */
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredJobs.slice(0, visibleCount).map((job) => {
                  const isSaved = saved.includes(job.id);
                  const isApplied = appliedJobs.includes(job.id);

                  return (
                    <article
                      key={job.id}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-violet-300/80 hover:shadow-md dark:hover:border-violet-800/60"
                    >
                      <div>
                        {/* Card Header: Avatar + Title/Company + Score Gauge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Company Avatar */}
                            <div
                              className={`flex size-11 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-xs ${job.avatarBg}`}
                            >
                              <span className="text-base">{job.avatarText}</span>
                            </div>

                            {/* Job Title and Company / Location */}
                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-foreground leading-snug truncate">
                                {job.title}
                              </h3>
                              <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                <span className="font-medium text-foreground/80">{job.company}</span>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="size-3 text-muted-foreground" />
                                  {job.location}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Circular Gauge */}
                          <ScoreGauge score={job.score} />
                        </div>

                        {/* Meta Badges Row */}
                        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
                          {/* Salary Badge */}
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground dark:bg-card">
                            <BriefcaseBusiness className="size-3 text-muted-foreground" />
                            {job.salary}
                          </span>

                          {/* Type */}
                          <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground dark:bg-card">
                            {job.type}
                          </span>

                          {/* Mode (Remote has a distinctive tint) */}
                          <span
                            className={`rounded-full px-2.5 py-1 font-medium ${
                              job.mode === "Remote"
                                ? "border border-indigo-200 bg-indigo-50/80 text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300"
                                : job.mode === "Hybrid"
                                ? "border border-violet-200 bg-violet-50/80 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-300"
                                : "border border-border bg-background/80 text-muted-foreground dark:bg-card"
                            }`}
                          >
                            {job.mode}
                          </span>

                          {/* Experience */}
                          <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground dark:bg-card">
                            {job.experience}
                          </span>
                        </div>

                        {/* Skills Row */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                          {job.skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-muted/70 px-2.5 py-0.5 text-muted-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="rounded-full border border-border bg-background/80 px-2 py-0.5 text-[11px] text-muted-foreground">
                              +{job.skills.length - 4}
                            </span>
                          )}
                        </div>

                        {/* Posted Time & Action Buttons Row */}
                        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock3 className="size-3 text-muted-foreground" />
                            {job.age}
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Save Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSaved((prev) =>
                                  isSaved ? prev.filter((id) => id !== job.id) : [...prev, job.id]
                                );
                                showToast(
                                  isSaved
                                    ? `Removed ${job.title} from saved jobs`
                                    : `Saved ${job.title} to your bookmarks`
                                );
                              }}
                              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                                isSaved
                                  ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                                  : "border-border bg-background text-foreground hover:border-violet-300 hover:bg-muted/50"
                              }`}
                            >
                              <Bookmark
                                className={`size-3.5 ${
                                  isSaved ? "fill-violet-600 text-violet-600 dark:fill-violet-400 dark:text-violet-400" : ""
                                }`}
                              />
                              <span>{isSaved ? "Saved" : "Save"}</span>
                            </button>

                            {/* Apply Button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isApplied) {
                                  showToast(`You have already applied for ${job.title}`);
                                } else {
                                  setApplyingJob(job);
                                }
                              }}
                              disabled={isApplied}
                              className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold transition-all ${
                                isApplied
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 cursor-default"
                                  : "bg-foreground text-background hover:opacity-90 active:scale-[0.98]"
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <CheckCircle2 className="size-3.5" />
                                  Applied
                                </>
                              ) : (
                                <>
                                  <Send className="size-3" />
                                  Apply
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* AI "Why we recommend this" section (Rendered only in AI mode) */}
                      {mode === "ai" && (
                        <div className="mt-3.5 rounded-xl border border-dashed border-violet-200/90 bg-violet-50/40 p-3.5 dark:border-violet-800/40 dark:bg-violet-950/20">
                          <p className="flex items-center gap-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">
                            <Sparkles className="size-3.5 text-violet-600 dark:text-violet-400" />
                            Why we recommend this
                          </p>

                          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            {job.recommendationSummary ||
                              `Your resume covers skills required for ${job.title}.`}
                          </p>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {job.recommendationDetail ||
                              "Required-skill coverage drives most of the score."}
                          </p>

                          {/* Skill Match Pills with Green Checkmarks or Red Crosses */}
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {job.requiredSkills.map((skill) => {
                              const isMatched = currentResume.knownSkills.includes(skill);
                              return (
                                <span
                                  key={skill}
                                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                                    isMatched
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                                      : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300"
                                  }`}
                                >
                                  {isMatched ? (
                                    <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <X className="size-3 text-rose-600 dark:text-rose-400" />
                                  )}
                                  {skill}
                                </span>
                              );
                            })}
                          </div>

                          {/* Pro-Tip Line */}
                          {job.tip && (
                            <p className="mt-2.5 flex items-start gap-1.5 text-xs text-muted-foreground leading-normal">
                              <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                              <span>{job.tip}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            {/* Load More Jobs Button */}
            {filteredJobs.length > visibleCount && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 2)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-xs sm:text-sm font-semibold text-foreground shadow-xs transition-colors hover:border-violet-300 hover:bg-muted/50"
                >
                  <Plus className="size-4 text-muted-foreground" />
                  Load more jobs ({filteredJobs.length - visibleCount} left)
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Quick Apply Modal Drawer */}
      {applyingJob && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-50"
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                  Quick Apply
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  {applyingJob.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {applyingJob.company} · {applyingJob.location} · {applyingJob.salary}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApplyingJob(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Resume to submit
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-xs">
                  <FileText className="size-4 text-violet-600" />
                  <span className="font-medium text-foreground flex-1">
                    {currentResume.name}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ATS {currentResume.ats}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="apply-note"
                  className="block text-xs font-semibold text-foreground mb-1.5"
                >
                  Note to recruiter (optional)
                </label>
                <textarea
                  id="apply-note"
                  rows={3}
                  value={applyNote}
                  onChange={(e) => setApplyNote(e.target.value)}
                  placeholder="Introduce yourself and highlight your relevant experience..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-95"
                >
                  <Send className="size-3" />
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-border bg-card/95 p-4 text-xs sm:text-sm font-medium text-foreground shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5"
        >
          <Sparkles className="size-4 text-violet-600 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </aside>
      )}
    </div>
  );
}

// Reusable Filter Section Component
function FilterSection({
  workMode,
  setWorkMode,
  employment,
  setEmployment,
  salary,
  setSalary,
  experience,
  setExperience,
  location,
  setLocation,
  industry,
  setIndustry,
  company,
  setCompany,
}: {
  workMode: string;
  setWorkMode: (v: string) => void;
  employment: string;
  setEmployment: (v: string) => void;
  salary: number;
  setSalary: (v: number) => void;
  experience: string;
  setExperience: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  company: string;
  setCompany: (v: string) => void;
}) {
  return (
    <div className="space-y-5 pt-3">
      {/* Work Mode */}
      <fieldset>
        <legend className="mb-2 text-xs font-bold text-foreground">Work mode</legend>
        <div className="flex flex-wrap gap-1.5">
          {["Any", "Remote", "Hybrid", "On-site"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setWorkMode(opt)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                workMode === opt
                  ? "border border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700/60 dark:bg-violet-950/50 dark:text-violet-300"
                  : "border border-border bg-background text-muted-foreground hover:border-violet-200 hover:text-foreground dark:bg-card"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Employment Type */}
      <fieldset>
        <legend className="mb-2 text-xs font-bold text-foreground">Employment type</legend>
        <div className="flex flex-wrap gap-1.5">
          {["Any", "Full-time", "Part-time", "Contract", "Internship"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setEmployment(opt)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                employment === opt
                  ? "border border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700/60 dark:bg-violet-950/50 dark:text-violet-300"
                  : "border border-border bg-background text-muted-foreground hover:border-violet-200 hover:text-foreground dark:bg-card"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Min Salary Range Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <label htmlFor="min-salary-slider">
            Min salary — ${salary === 0 ? "0" : `${salary}k`}
          </label>
        </div>
        <input
          id="min-salary-slider"
          type="range"
          min="0"
          max="200"
          step="10"
          value={salary}
          onChange={(e) => setSalary(Number(e.target.value))}
          className="mt-2.5 w-full accent-violet-600 dark:accent-violet-400"
        />
      </div>

      {/* Experience */}
      <fieldset>
        <legend className="mb-2 text-xs font-bold text-foreground">Experience</legend>
        <div className="flex flex-wrap gap-1.5">
          {["Any", "0–2 years", "3–5 years", "5+ years"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setExperience(opt)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                experience === opt
                  ? "border border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700/60 dark:bg-violet-950/50 dark:text-violet-300"
                  : "border border-border bg-background text-muted-foreground hover:border-violet-200 hover:text-foreground dark:bg-card"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Location */}
      <div>
        <label
          htmlFor="filter-location"
          className="mb-1.5 block text-xs font-bold text-foreground"
        >
          Location
        </label>
        <div className="relative">
          <select
            id="filter-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-9 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-8 text-xs text-foreground outline-none transition-colors focus:border-violet-400 focus:ring-1 focus:ring-violet-500/20"
          >
            <option value="Any">Any</option>
            <option value="San Francisco">San Francisco, CA</option>
            <option value="New York">New York, NY</option>
            <option value="Remote">Remote</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Industry */}
      <div>
        <label
          htmlFor="filter-industry"
          className="mb-1.5 block text-xs font-bold text-foreground"
        >
          Industry
        </label>
        <div className="relative">
          <select
            id="filter-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="h-9 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-8 text-xs text-foreground outline-none transition-colors focus:border-violet-400 focus:ring-1 focus:ring-violet-500/20"
          >
            <option value="Any">Any</option>
            <option value="Design">Design</option>
            <option value="Engineering">Engineering</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Company */}
      <div>
        <label
          htmlFor="filter-company"
          className="mb-1.5 block text-xs font-bold text-foreground"
        >
          Company
        </label>
        <div className="relative">
          <select
            id="filter-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="h-9 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-8 text-xs text-foreground outline-none transition-colors focus:border-violet-400 focus:ring-1 focus:ring-violet-500/20"
          >
            <option value="Any">Any</option>
            <option value="Linear">Linear</option>
            <option value="Rippling">Rippling</option>
            <option value="Vercel">Vercel</option>
            <option value="Notion">Notion</option>
            <option value="Figma">Figma</option>
            <option value="Webflow">Webflow</option>
            <option value="Stripe">Stripe</option>
            <option value="Airbnb">Airbnb</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
