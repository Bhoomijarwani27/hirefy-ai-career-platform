"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  getStoredResumes,
  saveResumeToStore,
  getActiveResumeKey,
  extractSkillsList,
  type ResumeData,
  type ResumeOption,
} from "@/lib/resume-storage";
import type { SeekerJobDTO } from "@/lib/seeker-jobs-types";
import { formatJobDate } from "@/lib/job-validation";
import {
  Bookmark,
  BriefcaseBusiness,
  Calendar,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  Filter,
  Loader2,
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

export type Job = SeekerJobDTO & {
  score: number;
};

function computeJobMatchScore(
  job: SeekerJobDTO,
  candidateSkills: string[]
): number {
  if (!candidateSkills || candidateSkills.length === 0) return 45;
  const targetSkills =
    job.requiredSkills.length > 0 ? job.requiredSkills : job.skills;
  if (targetSkills.length === 0) return 65;

  const matched = targetSkills.filter((req) =>
    candidateSkills.some(
      (s) =>
        s.toLowerCase() === req.toLowerCase() ||
        s.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(s.toLowerCase())
    )
  );
  const ratio = matched.length / Math.max(targetSkills.length, 1);
  return Math.min(98, Math.max(35, Math.round(35 + ratio * 60)));
}

function ScoreGauge({ score }: { score: number }) {
  const size = 46;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const strokeColor =
    score >= 75 ? "#F59E0B" : score >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center">
      <svg
        className="size-11 -rotate-90 transform"
        viewBox={`0 0 ${size} ${size}`}
      >
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
      <span className="absolute text-xs font-bold text-foreground">
        {score}
      </span>
    </div>
  );
}

interface JobDiscoveryProps {
  userName?: string;
  userInitials?: string;
  initialJobs?: SeekerJobDTO[];
}

export function JobDiscovery({
  userName,
  userInitials,
  initialJobs = [],
}: JobDiscoveryProps = {}) {
  const [jobs] = useState<SeekerJobDTO[]>(initialJobs);
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
  const [visibleCount, setVisibleCount] = useState(6);

  const [saved, setSaved] = useState<string[]>(() =>
    initialJobs.filter((j) => j.isSaved).map((j) => j.id)
  );
  const [appliedJobs, setAppliedJobs] = useState<string[]>(() =>
    initialJobs.filter((j) => j.isApplied).map((j) => j.id)
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  const [resumes, setResumes] = useState<Record<string, ResumeOption>>({});
  const [selectedResumeKey, setSelectedResumeKey] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSearchingWithAI, setIsSearchingWithAI] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [inspectingJob, setInspectingJob] = useState<Job | null>(null);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [applyNote, setApplyNote] = useState("");
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    const syncResumes = () => {
      const stored = getStoredResumes();
      setResumes(stored);
      const activeKey = getActiveResumeKey();
      if (activeKey && stored[activeKey]) {
        setSelectedResumeKey(activeKey);
      } else {
        const firstKey = Object.keys(stored)[0] || "";
        setSelectedResumeKey(firstKey);
      }
    };
    syncResumes();
    window.addEventListener("hirefy-resume-storage-update", syncResumes);
    return () =>
      window.removeEventListener("hirefy-resume-storage-update", syncResumes);
  }, []);

  const currentResume = resumes[selectedResumeKey] ||
    Object.values(resumes)[0] || {
      name: "No Resume Uploaded",
      ats: 0,
      years: "Profile",
      skillsCount: 0,
      updated: "Create in Resume Studio",
      knownSkills: [] as string[],
      rawResumeData: undefined as ResumeData | undefined,
    };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const filterOptions = useMemo(() => {
    const locations = Array.from(
      new Set(jobs.map((j) => j.location).filter(Boolean))
    ).sort();
    const industries = Array.from(
      new Set(jobs.map((j) => j.industry).filter(Boolean))
    ).sort();
    const companies = Array.from(
      new Set(jobs.map((j) => j.company).filter(Boolean))
    ).sort();
    return { locations, industries, companies };
  }, [jobs]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    try {
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      const payload: Record<string, unknown> = {
        defaultName: userName,
      };

      if (isPdf) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("Failed to read file."));
          reader.readAsDataURL(file);
        });
        payload.pdfBase64 = base64;
      } else {
        const text = await file.text();
        payload.text = text;
      }

      const res = await fetch("/api/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.error || "Could not parse uploaded resume.");
      }

      const parsedData = json.data as ResumeData;
      const skills = extractSkillsList(
        parsedData.skills ?? {
          technicalLanguages: "",
          frameworksAndTools: "",
          softSkills: "",
        }
      );
      const newResume = {
        name: file.name,
        ats: 90,
        years:
          parsedData.experience?.length > 0
            ? `${parsedData.experience.length} role(s)`
            : "Parsed",
        skillsCount: skills.length,
        updated: "Just uploaded",
        knownSkills: skills,
        rawResumeData: parsedData,
      };
      saveResumeToStore(newResume);
      setSelectedResumeKey(file.name);
      showToast(`Parsed "${file.name}" (${skills.length} skills extracted).`);
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : "Could not parse resume. Try uploading in Resume Studio."
      );
    } finally {
      setIsUploadingResume(false);
      e.target.value = "";
    }
  };

  const triggerAISearch = () => {
    setIsSearchingWithAI(true);
    setSort("match");
    setTimeout(() => {
      setIsSearchingWithAI(false);
      showToast(`Ranked jobs by skill match for ${currentResume.name}`);
    }, 400);
  };

  const handleToggleSave = async (job: Job) => {
    if (savingId === job.id) return;
    const currentlySaved = saved.includes(job.id);
    setSavingId(job.id);

    try {
      const res = await fetch(`/api/seeker/jobs/${job.id}/save`, {
        method: currentlySaved ? "DELETE" : "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update saved jobs.");
      }
      setSaved((prev) =>
        data.isSaved
          ? prev.includes(job.id)
            ? prev
            : [...prev, job.id]
          : prev.filter((id) => id !== job.id)
      );
      showToast(
        data.isSaved
          ? `Saved "${job.title}" to your bookmarks.`
          : `Removed "${job.title}" from saved jobs.`
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not update saved job."
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob || isSubmittingApply) return;

    setIsSubmittingApply(true);
    setApplyError(null);

    try {
      const res = await fetch(`/api/seeker/jobs/${applyingJob.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverLetter: applyNote.trim() || null,
          resumeName: currentResume.name,
          resumeData: currentResume.rawResumeData ?? null,
          skills: currentResume.knownSkills ?? [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application.");
      }

      setAppliedJobs((prev) =>
        prev.includes(applyingJob.id) ? prev : [...prev, applyingJob.id]
      );
      showToast(
        `Application sent to ${applyingJob.company} for ${applyingJob.title}!`
      );
      setApplyingJob(null);
      setApplyNote("");
    } catch (err) {
      setApplyError(
        err instanceof Error ? err.message : "Failed to submit application."
      );
    } finally {
      setIsSubmittingApply(false);
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

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const candidateSkills = currentResume.knownSkills || [];

    const result: Job[] = jobs
      .map((job) => ({
        ...job,
        score: computeJobMatchScore(job, candidateSkills),
      }))
      .filter((job) => {
        const queryMatch =
          !q ||
          [job.title, job.company, job.location, job.department, ...job.skills].some(
            (item) => item.toLowerCase().includes(q)
          );

        const workMatch = workMode === "Any" || job.mode === workMode;
        const typeMatch = employment === "Any" || job.type === employment;

        const expMatch =
          experience === "Any" ||
          (experience === "0–2 years" && job.minExperience <= 2) ||
          (experience === "3–5 years" &&
            job.minExperience >= 2 &&
            job.minExperience <= 5) ||
          (experience === "5+ years" && job.minExperience >= 5);

        const locationMatch =
          location === "Any" ||
          job.location.toLowerCase().includes(location.toLowerCase());

        const industryMatch = industry === "Any" || job.industry === industry;
        const companyMatch = company === "Any" || job.company === company;

        const salaryMatchNum = Number(
          job.salary.replace(/,/g, "").match(/\d+/)?.[0] ?? 0
        );
        const salaryK =
          salaryMatchNum > 1000 ? Math.round(salaryMatchNum / 1000) : salaryMatchNum;
        const salaryMatch = salary === 0 || salaryK >= salary;

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

    if (sort === "salary") {
      result.sort(
        (a, b) =>
          Number(b.salary.replace(/,/g, "").match(/\d+/)?.[0] ?? 0) -
          Number(a.salary.replace(/,/g, "").match(/\d+/)?.[0] ?? 0)
      );
    } else if (sort === "recent") {
      result.sort((a, b) => a.ageDays - b.ageDays);
    } else if (sort === "match" || mode === "ai") {
      result.sort((a, b) => b.score - a.score);
    }

    return result;
  }, [
    jobs,
    query,
    workMode,
    employment,
    experience,
    location,
    industry,
    company,
    salary,
    sort,
    mode,
    currentResume.knownSkills,
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <DashboardHeader
        userName={userName}
        userInitials={userInitials}
        onSearch={(val) => setQuery(val)}
        searchValue={query}
      />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-violet-50/80 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
              <Sparkles className="size-3.5 text-violet-600 dark:text-violet-400" />
              Job discovery
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Find your next role
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
              Browse live open roles posted by companies on Hirefy and apply
              directly with your resume.
            </p>
          </div>

          <Link
            href="/seeker/applications"
            className="inline-flex min-h-10 items-center gap-2 self-start rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:border-violet-300 hover:bg-muted/50 sm:self-auto"
          >
            <BriefcaseBusiness className="size-4 text-violet-600" />
            <span>My Applications ({appliedJobs.length})</span>
          </Link>
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

        {/* AI Resume Search Card */}
        {mode === "ai" && (
          <section
            aria-labelledby="resume-search-title"
            className="mb-6 relative overflow-hidden rounded-3xl border border-violet-200/90 bg-gradient-to-br from-violet-50/70 via-card to-card p-5 sm:p-7 shadow-[0_12px_40px_-20px_rgba(139,92,246,0.35)] dark:border-violet-800/40 dark:from-violet-950/20 dark:via-card dark:to-card dark:shadow-[0_12px_40px_-20px_rgba(0,0,0,0.6)]"
          >
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
                  Matches your active Resume Studio skills against required
                  skills on live company job postings.
                </p>

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
                        {Object.keys(resumes).length === 0 ? (
                          <option value="">
                            No saved resume — upload or build one
                          </option>
                        ) : (
                          Object.keys(resumes).map((key) => (
                            <option key={key} value={key}>
                              {resumes[key].name} ({resumes[key].skillsCount}{" "}
                              skills)
                            </option>
                          ))
                        )}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:border-violet-300 hover:bg-muted/50">
                      {isUploadingResume ? (
                        <Loader2 className="size-4 animate-spin text-violet-600" />
                      ) : (
                        <Upload className="size-4 text-muted-foreground" />
                      )}
                      <span>{isUploadingResume ? "Parsing..." : "Upload"}</span>
                      <input
                        type="file"
                        accept=".pdf,.txt,.md"
                        disabled={isUploadingResume}
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

                <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 font-medium text-foreground dark:bg-card">
                    <FileText className="size-3.5 text-muted-foreground" />
                    {currentResume.name}
                  </span>
                  <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 font-medium text-muted-foreground dark:bg-card">
                    {currentResume.skillsCount} skills
                  </span>
                  <span className="ml-1 text-muted-foreground">
                    {currentResume.updated}
                  </span>
                </div>
              </div>

              <div className="shrink-0 xl:self-center">
                <button
                  type="button"
                  onClick={triggerAISearch}
                  disabled={isSearchingWithAI}
                  className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 px-6 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-70"
                >
                  <Sparkle
                    className={`size-4 ${isSearchingWithAI ? "animate-spin" : ""}`}
                  />
                  {isSearchingWithAI
                    ? "Analyzing Match..."
                    : "Search Jobs Using My Resume"}
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
                setVisibleCount(6);
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

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm font-semibold text-foreground transition-colors hover:border-violet-300 hover:bg-muted/50 lg:hidden"
            >
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <span>Filters</span>
            </button>

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

        {/* Main Content Layout */}
        <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
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
              locationOptions={filterOptions.locations}
              industryOptions={filterOptions.industries}
              companyOptions={filterOptions.companies}
            />
          </aside>

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
                locationOptions={filterOptions.locations}
                industryOptions={filterOptions.industries}
                companyOptions={filterOptions.companies}
              />
            </div>
          )}

          {/* Jobs Listing Grid */}
          <section className="min-w-0" aria-label="Job listings">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
              <span className="text-muted-foreground">
                <strong className="text-foreground font-bold">
                  {filteredJobs.length}
                </strong>{" "}
                open {filteredJobs.length === 1 ? "job" : "jobs"}
              </span>

              {mode === "ai" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                  <Sparkles className="size-3.5" />
                  Ranked by match with {currentResume.name}
                </span>
              )}
            </div>

            {jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
                <BriefcaseBusiness className="mx-auto size-9 text-muted-foreground" />
                <h3 className="mt-3 text-base font-bold text-foreground">
                  No open jobs posted yet
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Check back soon as companies publish new opportunities on
                  Hirefy.
                </p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
                <Search className="mx-auto size-8 text-muted-foreground" />
                <h3 className="mt-3 text-base font-bold text-foreground">
                  No matching jobs found
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Try adjusting your search query, location, or resetting the
                  filters.
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
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            {job.companyLogoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={job.companyLogoUrl}
                                alt={job.company}
                                className="size-11 shrink-0 rounded-xl border border-border object-cover"
                              />
                            ) : (
                              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 font-bold text-white shadow-xs">
                                <span className="text-base">
                                  {job.company[0]?.toUpperCase() || "C"}
                                </span>
                              </div>
                            )}

                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => setInspectingJob(job)}
                                className="text-left text-base font-bold text-foreground leading-snug hover:text-violet-600 transition-colors line-clamp-1"
                              >
                                {job.title}
                              </button>
                              <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                <span className="font-medium text-foreground/80">
                                  {job.company}
                                </span>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="size-3 text-muted-foreground" />
                                  {job.location}
                                </span>
                              </p>
                            </div>
                          </div>

                          <ScoreGauge score={job.score} />
                        </div>

                        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground dark:bg-card">
                            <BriefcaseBusiness className="size-3 text-muted-foreground" />
                            {job.salary}
                          </span>
                          <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground dark:bg-card">
                            {job.type}
                          </span>
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
                          <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground dark:bg-card">
                            {job.experience}
                          </span>
                        </div>

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

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock3 className="size-3 text-muted-foreground" />
                            {job.age}
                          </span>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setInspectingJob(job)}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground hover:bg-muted/50"
                            >
                              <Eye className="size-3.5" />
                              <span>Details</span>
                            </button>

                            <button
                              type="button"
                              disabled={savingId === job.id}
                              onClick={() => handleToggleSave(job)}
                              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                                isSaved
                                  ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                                  : "border-border bg-background text-foreground hover:border-violet-300 hover:bg-muted/50"
                              }`}
                            >
                              <Bookmark
                                className={`size-3.5 ${
                                  isSaved
                                    ? "fill-violet-600 text-violet-600 dark:fill-violet-400 dark:text-violet-400"
                                    : ""
                                }`}
                              />
                              <span>{isSaved ? "Saved" : "Save"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (!isApplied) {
                                  setApplyError(null);
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

                      {mode === "ai" && job.requiredSkills.length > 0 && (
                        <div className="mt-3.5 rounded-xl border border-dashed border-violet-200/90 bg-violet-50/40 p-3.5 dark:border-violet-800/40 dark:bg-violet-950/20">
                          <p className="flex items-center gap-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">
                            <Sparkles className="size-3.5 text-violet-600 dark:text-violet-400" />
                            Skill Match Breakdown
                          </p>

                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {job.requiredSkills.map((skill) => {
                              const isMatched = (
                                currentResume.knownSkills || []
                              ).some(
                                (s) =>
                                  s.toLowerCase() === skill.toLowerCase() ||
                                  s.toLowerCase().includes(skill.toLowerCase()) ||
                                  skill.toLowerCase().includes(s.toLowerCase())
                              );
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
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            {filteredJobs.length > visibleCount && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 4)}
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

      {/* Job Details Modal */}
      {inspectingJob && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setInspectingJob(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-bold">{inspectingJob.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {inspectingJob.company} • {inspectingJob.department} •{" "}
                  {inspectingJob.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingJob(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border px-3 py-1">
                {inspectingJob.type}
              </span>
              <span className="rounded-full border border-border px-3 py-1">
                {inspectingJob.mode}
              </span>
              <span className="rounded-full border border-border px-3 py-1">
                {inspectingJob.experience}
              </span>
              <span className="rounded-full border border-border px-3 py-1">
                {inspectingJob.salary}
              </span>
              {inspectingJob.deadline && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1">
                  <Calendar className="size-3.5" />
                  Apply by {formatJobDate(inspectingJob.deadline)}
                </span>
              )}
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-bold">Description</h3>
                <p className="mt-1 whitespace-pre-line leading-relaxed text-muted-foreground">
                  {inspectingJob.description}
                </p>
              </div>
              <div>
                <h3 className="font-bold">Responsibilities</h3>
                <p className="mt-1 whitespace-pre-line leading-relaxed text-muted-foreground">
                  {inspectingJob.responsibilities}
                </p>
              </div>
              <div>
                <h3 className="font-bold">Qualifications</h3>
                <p className="mt-1 whitespace-pre-line leading-relaxed text-muted-foreground">
                  {inspectingJob.qualifications}
                </p>
              </div>
              {inspectingJob.applicationInstructions && (
                <div>
                  <h3 className="font-bold">Application Instructions</h3>
                  <p className="mt-1 whitespace-pre-line leading-relaxed text-muted-foreground">
                    {inspectingJob.applicationInstructions}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setInspectingJob(null)}
                className="min-h-10 rounded-xl border border-border px-4 text-xs font-semibold hover:bg-muted"
              >
                Close
              </button>
              {!appliedJobs.includes(inspectingJob.id) && (
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectingJob;
                    setInspectingJob(null);
                    setApplyError(null);
                    setApplyingJob(target);
                  }}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-violet-600 px-5 text-xs font-bold text-white hover:bg-violet-700"
                >
                  <Send className="size-3.5" />
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Apply Modal */}
      {applyingJob && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                  Apply to Job
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  {applyingJob.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {applyingJob.company} · {applyingJob.location} ·{" "}
                  {applyingJob.salary}
                </p>
              </div>
              <button
                type="button"
                disabled={isSubmittingApply}
                onClick={() => setApplyingJob(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {applyError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {applyError}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Resume to submit
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-xs">
                  <FileText className="size-4 text-violet-600" />
                  <span className="font-medium text-foreground flex-1 truncate">
                    {currentResume.name}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                    {currentResume.skillsCount} skills
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="apply-note"
                  className="block text-xs font-semibold text-foreground mb-1.5"
                >
                  Cover letter / note to recruiter (optional)
                </label>
                <textarea
                  id="apply-note"
                  rows={4}
                  value={applyNote}
                  onChange={(e) => setApplyNote(e.target.value)}
                  placeholder="Introduce yourself and highlight your relevant experience..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingApply}
                  onClick={() => setApplyingJob(null)}
                  className="min-h-10 rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApply}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60"
                >
                  {isSubmittingApply ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3" />
                  )}
                  {isSubmittingApply ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-border bg-card/95 p-4 text-xs sm:text-sm font-medium text-foreground shadow-xl backdrop-blur-md"
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
  locationOptions,
  industryOptions,
  companyOptions,
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
  locationOptions: string[];
  industryOptions: string[];
  companyOptions: string[];
}) {
  return (
    <div className="space-y-5 pt-3">
      <fieldset>
        <legend className="mb-2 text-xs font-bold text-foreground">
          Work mode
        </legend>
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

      <fieldset>
        <legend className="mb-2 text-xs font-bold text-foreground">
          Employment type
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {["Any", "Full-time", "Part-time", "Contract", "Internship"].map(
            (opt) => (
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
            )
          )}
        </div>
      </fieldset>

      <div>
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <label htmlFor="min-salary-slider">
            Min salary — {salary === 0 ? "Any" : `${salary}k+`}
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

      <fieldset>
        <legend className="mb-2 text-xs font-bold text-foreground">
          Experience
        </legend>
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
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

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
            {industryOptions.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

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
            {companyOptions.map((comp) => (
              <option key={comp} value={comp}>
                {comp}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
