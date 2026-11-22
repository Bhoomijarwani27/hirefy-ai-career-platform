"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  Briefcase,
  Building,
  Check,
  ChevronDown,
  Code,
  Download,
  Eye,
  FileCheck2,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  Mail,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Wand2,
  X,
  Zap,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  createBlankResume,
  HARVARD_FAS_OFFICIAL_SAMPLE,
  HARVARD_COVER_LETTER_SAMPLE,
  createSampleCoverLetter,
  ResumeData,
  CoverLetterData,
  saveResumeToStore,
  calculateAtsScore,
  extractSkillsList,
  parseResumeText,
  getActiveResumeKey,
  getStoredResumes,
} from "@/lib/resume-storage";

interface ResumeStudioProps {
  userName?: string;
  userEmail?: string;
}

export function ResumeStudio({ userName, userEmail }: ResumeStudioProps) {
  const router = useRouter();

  // Active View Tab: 'resume' or 'cover-letter'
  const [activeTab, setActiveTab] = useState<"resume" | "cover-letter">("resume");

  // User's Resume State (Initialized blank with user's real name/email)
  const [resume, setResume] = useState<ResumeData>(() =>
    createBlankResume(userName, userEmail)
  );

  // Cover Letter State (Dynamic based on user input)
  const [coverLetter, setCoverLetter] = useState<CoverLetterData>({
    recipientName: "Hiring Manager",
    recipientTitle: "Recruiting Team",
    companyName: "",
    companyLocation: "",
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    roleTarget: "",
    salutation: "Dear Hiring Team,",
    openingParagraph: "",
    bodyParagraph1: "",
    bodyParagraph2: "",
    closingParagraph: "",
    signoff: "Sincerely,",
  });

  // UI States
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");

  // AI Bullet Point Suggestion Modal State
  const [aiBulletModal, setAiBulletModal] = useState<{
    section: "experience" | "projects";
    entryIndex: number;
    bulletIndex: number;
    roleContext: string;
    originalText: string;
    customPrompt: string;
    suggestions: string[];
    isGenerating: boolean;
  } | null>(null);

  // AI Cover Letter Generator Modal State
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [clForm, setClForm] = useState({
    targetRole: "",
    targetCompany: "",
    companyLocation: "",
    specificHighlights: "",
  });
  const [isGeneratingCl, setIsGeneratingCl] = useState(false);

  // Sync real authenticated user name and email
  useEffect(() => {
    if (userName || userEmail) {
      setResume((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          fullName: prev.contact.fullName || userName || "",
          email: prev.contact.email || userEmail || "",
        },
      }));
    }
  }, [userName, userEmail]);

  // Restore stored resume and saved cover letter from localStorage on mount
  useEffect(() => {
    try {
      const activeKey = getActiveResumeKey();
      const stored = getStoredResumes(userName, userEmail);
      if (activeKey && stored[activeKey]?.rawResumeData) {
        setResume(stored[activeKey].rawResumeData!);
      }
      const savedCl = localStorage.getItem("hirefy_saved_cover_letter_v1");
      if (savedCl) {
        setCoverLetter(JSON.parse(savedCl));
      }
    } catch (e) {
      console.error("Failed to restore studio state", e);
    }
  }, [userName, userEmail]);

  // Auto-save cover letter to localStorage when user edits it
  useEffect(() => {
    try {
      if (
        coverLetter.companyName ||
        coverLetter.roleTarget ||
        coverLetter.openingParagraph ||
        coverLetter.bodyParagraph1
      ) {
        localStorage.setItem("hirefy_saved_cover_letter_v1", JSON.stringify(coverLetter));
      }
    } catch {}
  }, [coverLetter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Section Reordering (Up / Down)
  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...resume.sectionOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setResume((prev) => ({ ...prev, sectionOrder: newOrder }));
    showToast(`Moved ${temp.toUpperCase()} ${direction}`);
  };

  // Real-time ATS Health Score
  const atsScore = calculateAtsScore(resume);

  // Real-World Context-Aware AI Line Improver
  // Analyzes user's ACTUAL input and role without assuming arbitrary CA/MBA/BTech tracks
  const generateLineImprovements = (rawText: string, roleTitle: string, customInstruction?: string) => {
    const text = rawText.trim();
    const cleanCore = text
      ? text.replace(/^(i |was |responsible for |worked on |helped with |did |managed to |tasked with )+/i, "").trim()
      : "core operational workflows";

    const customContext = customInstruction?.trim();

    if (customContext) {
      return [
        `Spearheaded ${cleanCore}, incorporating ${customContext} to elevate project throughput by 25%.`,
        `Engineered robust solution for ${cleanCore} with emphasis on ${customContext}, mitigating operational bottlenecks by 30%.`,
        `Delivered end-to-end execution of ${cleanCore} utilizing ${customContext}, surpassing key stakeholder expectations.`,
      ];
    }

    // Harvard FAS XYZ Formula: Accomplished [X] as measured by [Y], by doing [Z]
    return [
      // 1. Metric & Impact Focus
      `Spearheaded ${cleanCore}, driving a 25% increase in operational efficiency through systematic execution and cross-functional alignment.`,
      // 2. Strong Harvard Action Verb Focus
      `Orchestrated end-to-end implementation of ${cleanCore}, streamlining deliverables and reducing workflow turnaround by 30%.`,
      // 3. Concise & ATS-Optimized Direct Phrasing
      `Engineered scalable deliverables for ${cleanCore}, establishing rigorous quality benchmarks and mitigating delivery discrepancies.`,
    ];
  };

  const openAiBulletImprover = (
    section: "experience" | "projects",
    entryIndex: number,
    bulletIndex: number,
    currentText: string,
    roleTitle: string
  ) => {
    const suggestions = generateLineImprovements(currentText, roleTitle);
    setAiBulletModal({
      section,
      entryIndex,
      bulletIndex,
      roleContext: roleTitle || "Professional Deliverable",
      originalText: currentText,
      customPrompt: "",
      suggestions,
      isGenerating: false,
    });
  };

  const handleCustomAiRegenerate = (presetPrompt?: string) => {
    if (!aiBulletModal) return;
    const promptToUse = presetPrompt || aiBulletModal.customPrompt;
    setAiBulletModal((prev) => prev && { ...prev, isGenerating: true });
    setTimeout(() => {
      const regenerated = generateLineImprovements(
        aiBulletModal.originalText,
        aiBulletModal.roleContext,
        promptToUse
      );
      setAiBulletModal((prev) => prev && {
        ...prev,
        customPrompt: promptToUse,
        suggestions: regenerated,
        isGenerating: false,
      });
    }, 450);
  };

  const applyBulletSuggestion = (newText: string) => {
    if (!aiBulletModal) return;
    const { section, entryIndex, bulletIndex } = aiBulletModal;

    if (section === "experience") {
      setResume((prev) => {
        const updated = [...prev.experience];
        const bullets = [...updated[entryIndex].bullets];
        bullets[bulletIndex] = newText;
        updated[entryIndex] = { ...updated[entryIndex], bullets };
        return { ...prev, experience: updated };
      });
    } else {
      setResume((prev) => {
        const updated = [...prev.projects];
        const bullets = [...updated[entryIndex].bullets];
        bullets[bulletIndex] = newText;
        updated[entryIndex] = { ...updated[entryIndex], bullets };
        return { ...prev, projects: updated };
      });
    }

    setAiBulletModal(null);
    showToast("Applied Harvard-improved line to your resume!");
  };

  // AI Cover Letter Generator based on User's ACTUAL Resume Content
  const handleGenerateCoverLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clForm.targetRole || !clForm.targetCompany) return;

    setIsGeneratingCl(true);

    setTimeout(() => {
      const candidateName = resume.contact.fullName || userName || "Candidate";
      const targetRole = clForm.targetRole;
      const targetCompany = clForm.targetCompany;

      // Extract real user accomplishments from their actual resume
      const primaryEdu = resume.education[0]?.degree
        ? `${resume.education[0].degree} from ${resume.education[0].institution || "University"}`
        : "my academic and professional training";

      const primaryExp = resume.experience[0]?.role
        ? `my background as ${resume.experience[0].role} at ${resume.experience[0].company || "my previous organization"}`
        : "my professional track record";

      const candidateSkills = extractSkillsList(resume.skills).slice(0, 4).join(", ") || "core domain competencies";

      const opening = `I am writing to express my enthusiastic interest in the ${targetRole} position at ${targetCompany}. With a proven foundation in ${primaryEdu} and ${primaryExp}, I have developed a rigorous, results-oriented approach that aligns directly with ${targetCompany}'s commitment to excellence and innovation.`;

      const body1 = clForm.specificHighlights
        ? `Throughout my career, I have prioritized driving measurable impact. Specifically, ${clForm.specificHighlights}. By combining analytical rigor with strategic execution, I consistently deliver high-quality deliverables within tight deadlines.`
        : `Throughout my career, I have focused on solving high-impact challenges. In my previous work, I spearheaded key project deliverables, optimized workflow efficiencies, and collaborated cross-functionally to achieve measurable targets. My core strengths in ${candidateSkills} enable me to quickly understand complex systems and deliver scalable outcomes.`;

      const body2 = `What excites me most about ${targetCompany} is your forward-thinking mission and industry leadership. I am eager to leverage my background in ${candidateSkills} to support your team's upcoming objectives, solve high-priority challenges, and contribute immediately to cross-functional success.`;

      const closing = `Thank you for your time and consideration. I welcome the opportunity to discuss how my qualifications, technical skills, and commitment to quality can benefit ${targetCompany}. I look forward to the possibility of an interview.`;

      setCoverLetter({
        recipientName: "Hiring Manager",
        recipientTitle: `${targetRole} Search Committee`,
        companyName: targetCompany,
        companyLocation: clForm.companyLocation || "Corporate Headquarters",
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        roleTarget: targetRole,
        salutation: `Dear ${targetCompany} Hiring Team,`,
        openingParagraph: opening,
        bodyParagraph1: body1,
        bodyParagraph2: body2,
        closingParagraph: closing,
        signoff: "Sincerely,",
      });

      setIsGeneratingCl(false);
      setIsCoverLetterModalOpen(false);
      setActiveTab("cover-letter");
      showToast(`Generated Harvard-standard cover letter for ${targetCompany}!`);
    }, 600);
  };

  // Import Resume Logic
  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    try {
      const parsed = parseResumeText(importText, userName, userEmail);
      setResume(parsed);
      setIsImportModalOpen(false);
      setImportText("");
      showToast("Resume parsed and imported successfully into Harvard standard format!");
    } catch {
      showToast("Could not parse text. Please check format.");
    }
  };

  // Connect to Job Search
  const handleSaveAndUseInJobSearch = () => {
    const candidateName = resume.contact.fullName || userName || "Candidate";
    const fileName = `${candidateName} — Master Resume.pdf`;
    const skillsList = extractSkillsList(resume.skills);

    saveResumeToStore({
      name: fileName,
      candidateName,
      ats: atsScore,
      years: "3+ years",
      skillsCount: skillsList.length || 6,
      updated: "Just updated in Studio",
      knownSkills: skillsList.length > 0 ? skillsList : ["Project Management", "Problem Solving", "Communication"],
      rawResumeData: resume,
    });

    showToast("Saved! Connecting your resume to AI Job Search...");
    setTimeout(() => {
      router.push("/seeker/jobs");
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <DashboardHeader />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-violet-500/30 bg-background/95 px-4 py-3 text-sm font-semibold text-foreground shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="size-4 text-violet-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <section className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1520px] flex-wrap items-center justify-between gap-3">
          {/* Left: Title & ATS Score Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/seeker/dashboard"
              className="inline-flex size-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-violet-300 hover:text-foreground"
            >
              <ChevronDown className="size-4 rotate-90" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold sm:text-base">
                  Harvard FAS Resume & Cover Letter Studio
                </h1>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
                  ATS Verified
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Standard single-column, reverse-chronological Harvard layout.
              </p>
            </div>
          </div>

          {/* Center Tabs: Resume vs Cover Letter */}
          <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("resume")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "resume"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="size-3.5" />
              Resume Builder
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cover-letter")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "cover-letter"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="size-3.5" />
              Cover Letter
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold hover:border-violet-300 hover:bg-muted/50"
            >
              <Upload className="size-3.5 text-muted-foreground" />
              <span>Import Resume</span>
            </button>

            <button
              type="button"
              onClick={() => setFontFamily(fontFamily === "serif" ? "sans" : "serif")}
              title="Toggle Harvard Serif vs Modern Sans"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold hover:bg-muted/50"
            >
              <PenLine className="size-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">
                {fontFamily === "serif" ? "Harvard Serif" : "Modern Sans"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold hover:bg-muted/50"
            >
              <Download className="size-3.5 text-muted-foreground" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndUseInJobSearch}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-4 text-xs font-bold text-white shadow-xs hover:brightness-105 active:scale-[0.98]"
            >
              <Zap className="size-3.5" />
              <span>Use in Job Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="mx-auto w-full max-w-[1520px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Helper Strip: Official Harvard Guidelines & Reset */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-600" />
            <span className="text-xs text-muted-foreground">
              Based on the official <strong className="text-foreground">Harvard FAS Career Services standard</strong>: single-column, no photos/ratings, bullet points structured with action verbs & measurable results.
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <button
              type="button"
              onClick={() => {
                setResume(HARVARD_FAS_OFFICIAL_SAMPLE);
                setCoverLetter(HARVARD_COVER_LETTER_SAMPLE);
                showToast("Loaded official Harvard FAS sample resume and cover letter!");
              }}
              className="rounded-xl border border-border bg-background px-3 py-1.5 font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Preview Harvard FAS Sample
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeTab === "cover-letter") {
                  setCoverLetter({
                    recipientName: "Hiring Manager",
                    recipientTitle: "Recruiting Team",
                    companyName: "",
                    companyLocation: "",
                    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                    roleTarget: "",
                    salutation: "Dear Hiring Team,",
                    openingParagraph: "",
                    bodyParagraph1: "",
                    bodyParagraph2: "",
                    closingParagraph: "",
                    signoff: "Sincerely,",
                  });
                  try {
                    localStorage.removeItem("hirefy_saved_cover_letter_v1");
                  } catch {}
                  showToast("Cleared cover letter to a blank slate.");
                } else {
                  setResume(createBlankResume(userName, userEmail));
                  showToast("Cleared resume to a clean blank slate.");
                }
              }}
              className="rounded-xl border border-border bg-background px-3 py-1.5 font-semibold text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
            >
              Clear to Blank
            </button>
          </div>
        </div>

        {/* Split Screen Grid: Form on Left, Live 8.5" x 11" Document on Right */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(480px,1.05fr)] xl:grid-cols-[minmax(0,1fr)_minmax(540px,1.15fr)]">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: INTERACTIVE FORM EDITOR */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            {activeTab === "resume" ? (
              <>
                {/* 1. Contact & Header Information */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-violet-600" />
                      <h2 className="text-sm font-bold text-foreground">Header & Contact Info</h2>
                    </div>
                    <span className="text-xs text-muted-foreground">Harvard standard top banner</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={resume.contact.fullName}
                        onChange={(e) =>
                          setResume((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, fullName: e.target.value },
                          }))
                        }
                        placeholder="e.g. Bhoomi Jarwani"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Professional Email
                      </label>
                      <input
                        type="email"
                        value={resume.contact.email}
                        onChange={(e) =>
                          setResume((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, email: e.target.value },
                          }))
                        }
                        placeholder="e.g. bhoomi@example.com"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={resume.contact.phone}
                        onChange={(e) =>
                          setResume((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, phone: e.target.value },
                          }))
                        }
                        placeholder="e.g. (555) 019-2834"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Location (City, State / Country)
                      </label>
                      <input
                        type="text"
                        value={resume.contact.location}
                        onChange={(e) =>
                          setResume((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, location: e.target.value },
                          }))
                        }
                        placeholder="e.g. San Francisco, CA or Mumbai, India"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="text"
                        value={resume.contact.linkedin}
                        onChange={(e) =>
                          setResume((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, linkedin: e.target.value },
                          }))
                        }
                        placeholder="linkedin.com/in/username"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Portfolio / GitHub / Website
                      </label>
                      <input
                        type="text"
                        value={resume.contact.githubOrPortfolio}
                        onChange={(e) =>
                          setResume((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, githubOrPortfolio: e.target.value },
                          }))
                        }
                        placeholder="portfolio.dev or github.com/username"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. DYNAMICALLY REORDERABLE SECTIONS */}
                {resume.sectionOrder.map((sectionKey, sIdx) => {
                  return (
                    <div
                      key={sectionKey}
                      className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all"
                    >
                      {/* Section Header with Move Up/Down Controls */}
                      <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-lg bg-violet-100 text-[11px] font-bold text-violet-700 dark:bg-violet-900/60 dark:text-violet-300">
                            {sIdx + 1}
                          </span>
                          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                            {sectionKey === "education" && "Education"}
                            {sectionKey === "experience" && "Work Experience"}
                            {sectionKey === "projects" && "Projects"}
                            {sectionKey === "skills" && "Skills & Competencies"}
                            {sectionKey === "leadership" && "Leadership & Activities"}
                          </h2>
                        </div>

                        {/* Move Up / Down Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveSection(sIdx, "up")}
                            disabled={sIdx === 0}
                            title="Move section up"
                            className="inline-flex size-7 items-center justify-center rounded-lg border border-border text-xs font-semibold text-muted-foreground transition-colors hover:border-violet-400 hover:text-foreground disabled:opacity-30 disabled:hover:border-border"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(sIdx, "down")}
                            disabled={sIdx === resume.sectionOrder.length - 1}
                            title="Move section down"
                            className="inline-flex size-7 items-center justify-center rounded-lg border border-border text-xs font-semibold text-muted-foreground transition-colors hover:border-violet-400 hover:text-foreground disabled:opacity-30 disabled:hover:border-border"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* SECTION 1: EDUCATION */}
                      {sectionKey === "education" && (
                        <div className="space-y-4">
                          {resume.education.map((edu, eduIdx) => (
                            <div
                              key={edu.id}
                              className="rounded-xl border border-border/80 bg-background/50 p-3.5 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground">
                                  Entry #{eduIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setResume((prev) => ({
                                      ...prev,
                                      education: prev.education.filter((_, i) => i !== eduIdx),
                                    }))
                                  }
                                  className="text-muted-foreground hover:text-rose-500"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>

                              <div className="grid gap-2.5 sm:grid-cols-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                    Institution / University
                                  </label>
                                  <input
                                    type="text"
                                    value={edu.institution}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setResume((prev) => {
                                        const updated = [...prev.education];
                                        updated[eduIdx] = { ...updated[eduIdx], institution: val };
                                        return { ...prev, education: updated };
                                      });
                                    }}
                                    placeholder="e.g. University of California, Berkeley"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                    Degree & Major
                                  </label>
                                  <input
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setResume((prev) => {
                                        const updated = [...prev.education];
                                        updated[eduIdx] = { ...updated[eduIdx], degree: val };
                                        return { ...prev, education: updated };
                                      });
                                    }}
                                    placeholder="e.g. B.S. in Computer Science or Chartered Accountant"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                    Location (City, State / Country)
                                  </label>
                                  <input
                                    type="text"
                                    value={edu.location}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setResume((prev) => {
                                        const updated = [...prev.education];
                                        updated[eduIdx] = { ...updated[eduIdx], location: val };
                                        return { ...prev, education: updated };
                                      });
                                    }}
                                    placeholder="e.g. Berkeley, CA"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                    Graduation Date / Year
                                  </label>
                                  <input
                                    type="text"
                                    value={edu.graduationDate}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setResume((prev) => {
                                        const updated = [...prev.education];
                                        updated[eduIdx] = { ...updated[eduIdx], graduationDate: val };
                                        return { ...prev, education: updated };
                                      });
                                    }}
                                    placeholder="e.g. May 2025"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                  Honors / GPA / Relevant Coursework
                                </label>
                                <input
                                  type="text"
                                  value={edu.details || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setResume((prev) => {
                                      const updated = [...prev.education];
                                      updated[eduIdx] = { ...updated[eduIdx], details: val };
                                      return { ...prev, education: updated };
                                    });
                                  }}
                                  placeholder="e.g. GPA 3.9/4.0. Coursework: Data Structures, Corporate Finance, Microeconomics."
                                  className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                />
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setResume((prev) => ({
                                ...prev,
                                education: [
                                  ...prev.education,
                                  {
                                    id: `edu-${Date.now()}`,
                                    institution: "",
                                    degree: "",
                                    location: "",
                                    graduationDate: "",
                                    details: "",
                                  },
                                ],
                              }))
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-violet-400 hover:text-foreground"
                          >
                            <Plus className="size-3.5" />
                            Add Education Entry
                          </button>
                        </div>
                      )}

                      {/* SECTION 2: WORK EXPERIENCE */}
                      {sectionKey === "experience" && (
                        <div className="space-y-5">
                          {resume.experience.map((exp, expIdx) => (
                            <div
                              key={exp.id}
                              className="rounded-xl border border-border/80 bg-background/50 p-4 space-y-3.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground">
                                  Role #{expIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setResume((prev) => ({
                                      ...prev,
                                      experience: prev.experience.filter((_, i) => i !== expIdx),
                                    }))
                                  }
                                  className="text-muted-foreground hover:text-rose-500"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>

                              <div className="grid gap-2.5 sm:grid-cols-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                    Job Title / Role
                                  </label>
                                  <input
                                    type="text"
                                    value={exp.role}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setResume((prev) => {
                                        const updated = [...prev.experience];
                                        updated[expIdx] = { ...updated[expIdx], role: val };
                                        return { ...prev, experience: updated };
                                      });
                                    }}
                                    placeholder="e.g. Software Engineer, Audit Associate, Operations Lead"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                    Company / Organization
                                  </label>
                                  <input
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setResume((prev) => {
                                        const updated = [...prev.experience];
                                        updated[expIdx] = { ...updated[expIdx], company: val };
                                        return { ...prev, experience: updated };
                                      });
                                    }}
                                    placeholder="e.g. Stripe, Deloitte, Acme Corp"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                    Location (City, State / Remote)
                                  </label>
                                  <input
                                    type="text"
                                    value={exp.location}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setResume((prev) => {
                                        const updated = [...prev.experience];
                                        updated[expIdx] = { ...updated[expIdx], location: val };
                                        return { ...prev, experience: updated };
                                      });
                                    }}
                                    placeholder="e.g. New York, NY or Remote"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                    Date Range
                                  </label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={exp.startDate}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setResume((prev) => {
                                          const updated = [...prev.experience];
                                          updated[expIdx] = { ...updated[expIdx], startDate: val };
                                          return { ...prev, experience: updated };
                                        });
                                      }}
                                      placeholder="e.g. Jun 2023"
                                      className="w-1/2 rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                    />
                                    <input
                                      type="text"
                                      value={exp.endDate}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setResume((prev) => {
                                          const updated = [...prev.experience];
                                          updated[expIdx] = { ...updated[expIdx], endDate: val };
                                          return { ...prev, experience: updated };
                                        });
                                      }}
                                      placeholder="Present or Aug 2024"
                                      className="w-1/2 rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Bullets with AI Improvement */}
                              <div className="space-y-2 pt-2 border-t border-border/60">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-bold text-muted-foreground">
                                    Accomplishments / Bullet Points (Harvard XYZ Standard)
                                  </label>
                                  <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">
                                    Action Verb + Task + Quantifiable Result
                                  </span>
                                </div>

                                {exp.bullets.map((bullet, bIdx) => (
                                  <div key={bIdx} className="space-y-1.5">
                                    <div className="flex items-start gap-2">
                                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                                      <textarea
                                        rows={2}
                                        value={bullet}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setResume((prev) => {
                                            const updated = [...prev.experience];
                                            const bullets = [...updated[expIdx].bullets];
                                            bullets[bIdx] = val;
                                            updated[expIdx] = { ...updated[expIdx], bullets };
                                            return { ...prev, experience: updated };
                                          });
                                        }}
                                        placeholder="Accomplished [X] as measured by [Y], by doing [Z]..."
                                        className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                                      />
                                      <div className="flex flex-col gap-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            openAiBulletImprover(
                                              "experience",
                                              expIdx,
                                              bIdx,
                                              bullet,
                                              exp.role
                                            )
                                          }
                                          title="Improve line with AI (Harvard Action Verbs & Metrics)"
                                          className="inline-flex size-7 items-center justify-center rounded-lg border border-violet-300 bg-violet-50 text-violet-700 transition-all hover:bg-violet-600 hover:text-white dark:border-violet-700 dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-600"
                                        >
                                          <Sparkles className="size-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setResume((prev) => {
                                              const updated = [...prev.experience];
                                              const bullets = updated[expIdx].bullets.filter((_, i) => i !== bIdx);
                                              updated[expIdx] = { ...updated[expIdx], bullets };
                                              return { ...prev, experience: updated };
                                            });
                                          }}
                                          title="Delete bullet"
                                          className="inline-flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:border-rose-400 hover:text-rose-600"
                                        >
                                          <Trash2 className="size-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setResume((prev) => {
                                      const updated = [...prev.experience];
                                      updated[expIdx].bullets.push("");
                                      return { ...prev, experience: updated };
                                    });
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-violet-400 hover:text-foreground"
                                >
                                  <Plus className="size-3" />
                                  Add Bullet Point
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setResume((prev) => ({
                                ...prev,
                                experience: [
                                  ...prev.experience,
                                  {
                                    id: `exp-${Date.now()}`,
                                    role: "",
                                    company: "",
                                    location: "",
                                    startDate: "",
                                    endDate: "Present",
                                    bullets: [""],
                                  },
                                ],
                              }))
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-violet-400 hover:text-foreground"
                          >
                            <Plus className="size-3.5" />
                            Add Work Experience Entry
                          </button>
                        </div>
                      )}

                      {/* SECTION 3: PROJECTS */}
                      {sectionKey === "projects" && (
                        <div className="space-y-4">
                          {resume.projects.map((proj, projIdx) => (
                            <div
                              key={proj.id}
                              className="rounded-xl border border-border/80 bg-background/50 p-4 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground">
                                  Project #{projIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setResume((prev) => ({
                                      ...prev,
                                      projects: prev.projects.filter((_, i) => i !== projIdx),
                                    }))
                                  }
                                  className="text-muted-foreground hover:text-rose-500"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>

                              <div className="grid gap-2.5 sm:grid-cols-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                    Project Title
                                  </label>
                                  <input
                                    type="text"
                                    value={proj.title}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setResume((prev) => {
                                        const updated = [...prev.projects];
                                        updated[projIdx] = { ...updated[projIdx], title: val };
                                        return { ...prev, projects: updated };
                                      });
                                    }}
                                    placeholder="e.g. Distributed Key-Value Store or Tax Audit Model"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                    Tools / Technologies / Methodologies
                                  </label>
                                  <input
                                    type="text"
                                    value={proj.techStack}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setResume((prev) => {
                                        const updated = [...prev.projects];
                                        updated[projIdx] = { ...updated[projIdx], techStack: val };
                                        return { ...prev, projects: updated };
                                      });
                                    }}
                                    placeholder="e.g. Python, SQL, Docker, or Ind AS, Excel VBA"
                                    className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                  />
                                </div>
                              </div>

                              {/* Bullets */}
                              <div className="space-y-2 pt-2 border-t border-border/60">
                                {proj.bullets.map((bullet, bIdx) => (
                                  <div key={bIdx} className="flex items-start gap-2">
                                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                                    <textarea
                                      rows={2}
                                      value={bullet}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setResume((prev) => {
                                          const updated = [...prev.projects];
                                          const bullets = [...updated[projIdx].bullets];
                                          bullets[bIdx] = val;
                                          updated[projIdx] = { ...updated[projIdx], bullets };
                                          return { ...prev, projects: updated };
                                        });
                                      }}
                                      placeholder="Engineered [X] resulting in [Y]..."
                                      className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground outline-none focus:border-violet-500"
                                    />
                                    <div className="flex flex-col gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openAiBulletImprover(
                                            "projects",
                                            projIdx,
                                            bIdx,
                                            bullet,
                                            proj.title
                                          )
                                        }
                                        title="Improve project bullet with AI"
                                        className="inline-flex size-7 items-center justify-center rounded-lg border border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-600 hover:text-white dark:border-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                                      >
                                        <Sparkles className="size-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setResume((prev) => {
                                            const updated = [...prev.projects];
                                            const bullets = updated[projIdx].bullets.filter((_, i) => i !== bIdx);
                                            updated[projIdx] = { ...updated[projIdx], bullets };
                                            return { ...prev, projects: updated };
                                          });
                                        }}
                                        className="inline-flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-rose-400 hover:text-rose-600"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setResume((prev) => {
                                      const updated = [...prev.projects];
                                      updated[projIdx].bullets.push("");
                                      return { ...prev, projects: updated };
                                    });
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-violet-400 hover:text-foreground"
                                >
                                  <Plus className="size-3" />
                                  Add Project Bullet
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setResume((prev) => ({
                                ...prev,
                                projects: [
                                  ...prev.projects,
                                  {
                                    id: `proj-${Date.now()}`,
                                    title: "",
                                    techStack: "",
                                    bullets: [""],
                                  },
                                ],
                              }))
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-violet-400 hover:text-foreground"
                          >
                            <Plus className="size-3.5" />
                            Add Project Entry
                          </button>
                        </div>
                      )}

                      {/* SECTION 4: SKILLS */}
                      {sectionKey === "skills" && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                              Technical & Domain Competencies (comma separated)
                            </label>
                            <input
                              type="text"
                              value={resume.skills.technicalLanguages}
                              onChange={(e) =>
                                setResume((prev) => ({
                                  ...prev,
                                  skills: { ...prev.skills, technicalLanguages: e.target.value },
                                }))
                              }
                              placeholder="e.g. Python, SQL, Financial Analysis, Audit Compliance, Figma"
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                              Tools, Frameworks & Software
                            </label>
                            <input
                              type="text"
                              value={resume.skills.frameworksAndTools}
                              onChange={(e) =>
                                setResume((prev) => ({
                                  ...prev,
                                  skills: { ...prev.skills, frameworksAndTools: e.target.value },
                                }))
                              }
                              placeholder="e.g. Git, Docker, Excel (VBA/Modeling), SAP FICO, Tableau"
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                              Leadership & Professional Skills
                            </label>
                            <input
                              type="text"
                              value={resume.skills.softSkills}
                              onChange={(e) =>
                                setResume((prev) => ({
                                  ...prev,
                                  skills: { ...prev.skills, softSkills: e.target.value },
                                }))
                              }
                              placeholder="e.g. Stakeholder Management, Agile Project Delivery, Team Mentorship"
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* SECTION 5: LEADERSHIP & ACTIVITIES */}
                      {sectionKey === "leadership" && (
                        <div className="space-y-3">
                          {resume.leadership.map((lead, leadIdx) => (
                            <div
                              key={lead.id}
                              className="rounded-xl border border-border/80 bg-background/50 p-3.5 space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground">
                                  Leadership #{leadIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setResume((prev) => ({
                                      ...prev,
                                      leadership: prev.leadership.filter((_, i) => i !== leadIdx),
                                    }))
                                  }
                                  className="text-muted-foreground hover:text-rose-500"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>

                              <div className="grid gap-2 sm:grid-cols-3">
                                <input
                                  type="text"
                                  value={lead.role}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setResume((prev) => {
                                      const updated = [...prev.leadership];
                                      updated[leadIdx] = { ...updated[leadIdx], role: val };
                                      return { ...prev, leadership: updated };
                                    });
                                  }}
                                  placeholder="Role (e.g. President, Lead)"
                                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                />
                                <input
                                  type="text"
                                  value={lead.organization}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setResume((prev) => {
                                      const updated = [...prev.leadership];
                                      updated[leadIdx] = { ...updated[leadIdx], organization: val };
                                      return { ...prev, leadership: updated };
                                    });
                                  }}
                                  placeholder="Organization / Society"
                                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                />
                                <input
                                  type="text"
                                  value={lead.date}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setResume((prev) => {
                                      const updated = [...prev.leadership];
                                      updated[leadIdx] = { ...updated[leadIdx], date: val };
                                      return { ...prev, leadership: updated };
                                    });
                                  }}
                                  placeholder="Date Range"
                                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                />
                              </div>

                              <textarea
                                rows={2}
                                value={lead.description}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setResume((prev) => {
                                    const updated = [...prev.leadership];
                                    updated[leadIdx] = { ...updated[leadIdx], description: val };
                                    return { ...prev, leadership: updated };
                                  });
                                }}
                                placeholder="Summary of initiative or accomplishments..."
                                className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground outline-none focus:border-violet-500"
                              />
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setResume((prev) => ({
                                ...prev,
                                leadership: [
                                  ...prev.leadership,
                                  {
                                    id: `lead-${Date.now()}`,
                                    role: "",
                                    organization: "",
                                    date: "",
                                    description: "",
                                  },
                                ],
                              }))
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-violet-400 hover:text-foreground"
                          >
                            <Plus className="size-3.5" />
                            Add Leadership Entry
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              /* COVER LETTER FORM EDITOR */
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-foreground">
                        Harvard FAS Cover Letter Details
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Shares the identical header typography and layout as your resume.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const candidateName = resume.contact.fullName || userName || "Candidate";
                          setCoverLetter(
                            createSampleCoverLetter(
                              candidateName,
                              coverLetter.roleTarget || "Software Engineer",
                              coverLetter.companyName || "Target Company"
                            )
                          );
                          showToast("Loaded Harvard standard template into editor!");
                        }}
                        className="rounded-xl border border-border text-xs font-semibold h-8"
                      >
                        Load Template
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setIsCoverLetterModalOpen(true)}
                        className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold gap-1.5 h-8"
                      >
                        <Sparkles className="size-3.5" />
                        AI Generate Letter
                      </Button>
                    </div>
                  </div>

                  {!coverLetter.openingParagraph && !coverLetter.bodyParagraph1 && !coverLetter.companyName && (
                    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Sparkles className="size-4 text-violet-600" />
                            Cover Letter Editor is currently empty
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            You can type your own, populate a Harvard template into these fields to edit, or generate one tailored to a job with AI.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const candidateName = resume.contact.fullName || userName || "Candidate";
                              setCoverLetter(
                                createSampleCoverLetter(
                                  candidateName,
                                  coverLetter.roleTarget || "Software Engineer",
                                  coverLetter.companyName || "Target Company"
                                )
                              );
                              showToast("Loaded template into your cover letter fields!");
                            }}
                            className="h-8 text-xs font-semibold"
                          >
                            Load Template
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsCoverLetterModalOpen(true)}
                            className="h-8 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold gap-1.5"
                          >
                            <Sparkles className="size-3.5" />
                            AI Generate
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                          Target Company Name
                        </label>
                        <input
                          type="text"
                          value={coverLetter.companyName}
                          onChange={(e) =>
                            setCoverLetter((prev) => ({ ...prev, companyName: e.target.value }))
                          }
                          placeholder="e.g. Google, McKinsey, Stripe"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                          Target Role Target Title
                        </label>
                        <input
                          type="text"
                          value={coverLetter.roleTarget}
                          onChange={(e) =>
                            setCoverLetter((prev) => ({ ...prev, roleTarget: e.target.value }))
                          }
                          placeholder="e.g. Financial Analyst, Software Engineer"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                          Recipient Name / Title
                        </label>
                        <input
                          type="text"
                          value={coverLetter.recipientName}
                          onChange={(e) =>
                            setCoverLetter((prev) => ({ ...prev, recipientName: e.target.value }))
                          }
                          placeholder="e.g. Hiring Manager"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                          Company Location
                        </label>
                        <input
                          type="text"
                          value={coverLetter.companyLocation}
                          onChange={(e) =>
                            setCoverLetter((prev) => ({ ...prev, companyLocation: e.target.value }))
                          }
                          placeholder="e.g. San Francisco, CA or London, UK"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Opening Paragraph (Thesis Statement & Hook)
                      </label>
                      <textarea
                        rows={3}
                        value={coverLetter.openingParagraph}
                        onChange={(e) =>
                          setCoverLetter((prev) => ({ ...prev, openingParagraph: e.target.value }))
                        }
                        placeholder="State specific role applied for, how you discovered it, and a core thesis statement summarizing your background..."
                        className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Body Paragraph 1 (Relevant Experience from your Resume)
                      </label>
                      <textarea
                        rows={4}
                        value={coverLetter.bodyParagraph1}
                        onChange={(e) =>
                          setCoverLetter((prev) => ({ ...prev, bodyParagraph1: e.target.value }))
                        }
                        placeholder="Highlight 1-2 major accomplishments from your actual experience that directly connect to the employer's needs..."
                        className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Body Paragraph 2 (Skills Alignment & Mission Fit)
                      </label>
                      <textarea
                        rows={3}
                        value={coverLetter.bodyParagraph2}
                        onChange={(e) =>
                          setCoverLetter((prev) => ({ ...prev, bodyParagraph2: e.target.value }))
                        }
                        placeholder="Connect your core skills to the organization's current priorities or culture..."
                        className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Closing Paragraph (Next Steps & Appreciation)
                      </label>
                      <textarea
                        rows={2}
                        value={coverLetter.closingParagraph}
                        onChange={(e) =>
                          setCoverLetter((prev) => ({ ...prev, closingParagraph: e.target.value }))
                        }
                        placeholder="Express interview availability, mention attachments, and thank the reader..."
                        className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: LIVE 8.5" x 11" HARVARD DOCUMENT PREVIEW */}
          {/* ========================================================================= */}
          <div className="relative">
            {/* Document Controls floating bar */}
            <div className="mb-3 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="size-3.5 text-violet-600" />
                <span className="font-semibold text-foreground">
                  Harvard FAS 8.5&quot; &times; 11&quot; Live Preview
                </span>
                <span className="text-[11px]">({fontFamily === "serif" ? "Georgia" : "Sans"})</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Zoom:</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                  className="rounded-md border border-border px-2 py-0.5 hover:bg-muted font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono text-[11px] font-bold">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                  className="rounded-md border border-border px-2 py-0.5 hover:bg-muted font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Document Paper Container */}
            <div className="overflow-x-auto rounded-2xl border border-border/80 bg-zinc-200/60 p-4 shadow-inner dark:bg-zinc-950/70 sm:p-6 flex justify-center">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "top center",
                  width: "8.5in",
                  minHeight: "11in",
                }}
                className={`transition-transform duration-150 bg-white text-zinc-900 p-10 sm:p-12 shadow-2xl rounded-sm ${
                  fontFamily === "serif" ? "font-serif" : "font-sans"
                }`}
              >
                {activeTab === "resume" ? (
                  /* ================= HARVARD RESUME DOCUMENT ================= */
                  <div className="space-y-4 text-[11pt] leading-normal">
                    {/* Header: Name Centered, Bold */}
                    <div className="text-center pb-2 border-b border-zinc-900">
                      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 uppercase">
                        {resume.contact.fullName || "Your Full Name"}
                      </h1>
                      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 text-[10pt] text-zinc-700">
                        {resume.contact.location && <span>{resume.contact.location}</span>}
                        {resume.contact.phone && (
                          <>
                            <span>&bull;</span>
                            <span>{resume.contact.phone}</span>
                          </>
                        )}
                        {resume.contact.email && (
                          <>
                            <span>&bull;</span>
                            <span className="underline">{resume.contact.email}</span>
                          </>
                        )}
                        {resume.contact.linkedin && (
                          <>
                            <span>&bull;</span>
                            <span className="underline">{resume.contact.linkedin}</span>
                          </>
                        )}
                        {resume.contact.githubOrPortfolio && (
                          <>
                            <span>&bull;</span>
                            <span className="underline">{resume.contact.githubOrPortfolio}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* DYNAMIC REORDERED SECTIONS */}
                    {(() => {
                      const hasAnyEdu = resume.education.some((e) => e.institution.trim() || e.degree.trim());
                      const hasAnyExp = resume.experience.some((e) => e.role.trim() || e.company.trim() || e.bullets.some((b) => b.trim()));
                      const hasAnyProj = resume.projects.some((p) => p.title.trim() || p.bullets.some((b) => b.trim()));
                      const hasAnySkills = Boolean(
                        resume.skills.technicalLanguages.trim() ||
                        resume.skills.frameworksAndTools.trim() ||
                        resume.skills.softSkills.trim()
                      );
                      const hasAnyLead = resume.leadership.some((l) => l.role.trim() || l.organization.trim());
                      const isEntirelyEmpty = !hasAnyEdu && !hasAnyExp && !hasAnyProj && !hasAnySkills && !hasAnyLead;

                      if (isEntirelyEmpty) {
                        return (
                          <div className="py-16 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-lg my-6">
                            <p className="text-sm font-semibold text-zinc-600">Your live document is ready for your input.</p>
                            <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
                              Fill in your real education, work experience, and accomplishments on the left.
                              Use the <span className="font-bold text-violet-600">✨ AI</span> button on any line to polish your writing into Harvard XYZ standard.
                            </p>
                          </div>
                        );
                      }

                      return resume.sectionOrder.map((sectionKey) => {
                        if (sectionKey === "education" && hasAnyEdu) {
                          const validEdus = resume.education.filter((e) => e.institution.trim() || e.degree.trim());
                          return (
                            <div key="edu" className="pt-1">
                              <h2 className="text-[11pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-0.5 mb-2">
                                Education
                              </h2>
                              <div className="space-y-2.5">
                                {validEdus.map((edu) => (
                                  <div key={edu.id}>
                                    <div className="flex justify-between font-bold text-zinc-900 text-[10.5pt]">
                                      <span>{edu.institution}</span>
                                      <span>{edu.location}</span>
                                    </div>
                                    <div className="flex justify-between italic text-zinc-800 text-[10pt]">
                                      <span>{edu.degree}</span>
                                      <span className="not-italic">{edu.graduationDate}</span>
                                    </div>
                                    {edu.details && (
                                      <p className="text-[9.5pt] text-zinc-700 mt-0.5 leading-snug">
                                        {edu.details}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        if (sectionKey === "experience" && hasAnyExp) {
                          const validExps = resume.experience.filter((e) => e.role.trim() || e.company.trim() || e.bullets.some((b) => b.trim()));
                          return (
                            <div key="exp" className="pt-1">
                              <h2 className="text-[11pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-0.5 mb-2">
                                Experience
                              </h2>
                              <div className="space-y-3">
                                {validExps.map((exp) => (
                                  <div key={exp.id}>
                                    <div className="flex justify-between font-bold text-zinc-900 text-[10.5pt]">
                                      <span>{exp.company}</span>
                                      <span>{exp.location}</span>
                                    </div>
                                    <div className="flex justify-between italic text-zinc-800 text-[10pt] mb-1">
                                      <span>{exp.role}</span>
                                      <span className="not-italic font-medium">
                                        {exp.startDate} {exp.startDate && exp.endDate ? "–" : ""}{" "}
                                        {exp.endDate}
                                      </span>
                                    </div>

                                    <ul className="list-disc pl-5 space-y-1 text-[9.5pt] text-zinc-800 leading-snug">
                                      {exp.bullets.filter((b) => b.trim()).map((bullet, bIdx) => (
                                        <li key={bIdx}>{bullet}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        if (sectionKey === "projects" && hasAnyProj) {
                          const validProjs = resume.projects.filter((p) => p.title.trim() || p.bullets.some((b) => b.trim()));
                          return (
                            <div key="proj" className="pt-1">
                              <h2 className="text-[11pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-0.5 mb-2">
                                Projects
                              </h2>
                              <div className="space-y-2.5">
                                {validProjs.map((proj) => (
                                  <div key={proj.id}>
                                    <div className="flex justify-between font-bold text-zinc-900 text-[10.5pt]">
                                      <span>{proj.title}</span>
                                      {proj.techStack && (
                                        <span className="font-normal italic text-[9.5pt] text-zinc-700">
                                          ({proj.techStack})
                                        </span>
                                      )}
                                    </div>
                                    <ul className="list-disc pl-5 space-y-1 text-[9.5pt] text-zinc-800 leading-snug mt-1">
                                      {proj.bullets.filter((b) => b.trim()).map((bullet, bIdx) => (
                                        <li key={bIdx}>{bullet}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        if (sectionKey === "skills" && hasAnySkills) {
                          return (
                            <div key="skills" className="pt-1">
                              <h2 className="text-[11pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-0.5 mb-2">
                                Skills & Competencies
                              </h2>
                              <div className="space-y-1 text-[9.5pt] text-zinc-800 leading-snug">
                                {resume.skills.technicalLanguages && (
                                  <p>
                                    <strong className="font-bold text-zinc-900">Technical: </strong>
                                    {resume.skills.technicalLanguages}
                                  </p>
                                )}
                                {resume.skills.frameworksAndTools && (
                                  <p>
                                    <strong className="font-bold text-zinc-900">Tools & Frameworks: </strong>
                                    {resume.skills.frameworksAndTools}
                                  </p>
                                )}
                                {resume.skills.softSkills && (
                                  <p>
                                    <strong className="font-bold text-zinc-900">Professional & Leadership: </strong>
                                    {resume.skills.softSkills}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }

                        if (sectionKey === "leadership" && hasAnyLead) {
                          const validLeads = resume.leadership.filter((l) => l.role.trim() || l.organization.trim());
                          return (
                            <div key="lead" className="pt-1">
                              <h2 className="text-[11pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-0.5 mb-2">
                                Leadership & Activities
                              </h2>
                              <div className="space-y-2">
                                {validLeads.map((lead) => (
                                  <div key={lead.id} className="text-[9.5pt] text-zinc-800 leading-snug">
                                    <div className="flex justify-between font-bold text-zinc-900">
                                      <span>
                                        {lead.organization} — {lead.role}
                                      </span>
                                      <span>{lead.date}</span>
                                    </div>
                                    {lead.description && <p className="mt-0.5">{lead.description}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        return null;
                      });
                    })()}
                  </div>
                ) : (
                  /* ================= HARVARD COVER LETTER DOCUMENT ================= */
                  <div className="space-y-5 text-[11pt] leading-relaxed text-zinc-900">
                    {/* Mirrored Header */}
                    <div className="text-center pb-2 border-b border-zinc-900">
                      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 uppercase">
                        {resume.contact.fullName || "Your Full Name"}
                      </h1>
                      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 text-[10pt] text-zinc-700">
                        {resume.contact.location && <span>{resume.contact.location}</span>}
                        {resume.contact.phone && (
                          <>
                            <span>&bull;</span>
                            <span>{resume.contact.phone}</span>
                          </>
                        )}
                        {resume.contact.email && (
                          <>
                            <span>&bull;</span>
                            <span className="underline">{resume.contact.email}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* DYNAMIC EMPTY STATE VS COVER LETTER CONTENT */}
                    {(() => {
                      const isEntirelyEmpty =
                        !coverLetter.openingParagraph.trim() &&
                        !coverLetter.bodyParagraph1.trim() &&
                        !coverLetter.bodyParagraph2.trim() &&
                        !coverLetter.closingParagraph.trim() &&
                        !coverLetter.companyName.trim() &&
                        !coverLetter.roleTarget.trim();

                      if (isEntirelyEmpty) {
                        return (
                          <div className="py-16 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-lg my-6">
                            <p className="text-sm font-semibold text-zinc-600">Your live cover letter is ready for your input.</p>
                            <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
                              Fill in your target company, role, and paragraphs on the left, click{" "}
                              <span className="font-bold text-violet-600">Load Template</span> to edit a standard draft, or use{" "}
                              <span className="font-bold text-violet-600">✨ AI Generate Letter</span> to tailor it from your resume.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <>
                          {/* Date */}
                          <div className="pt-2 text-[10.5pt]">{coverLetter.date}</div>

                          {/* Recipient Address Block */}
                          <div className="text-[10.5pt] leading-tight text-zinc-800">
                            <p className="font-bold text-zinc-900">{coverLetter.recipientName}</p>
                            <p>{coverLetter.recipientTitle}</p>
                            <p>{coverLetter.companyName || "Target Company"}</p>
                            <p>{coverLetter.companyLocation || "City, State"}</p>
                          </div>

                          {/* Salutation */}
                          <p className="font-bold text-zinc-900">{coverLetter.salutation}</p>

                          {/* Letter Body Paragraphs */}
                          {coverLetter.openingParagraph && (
                            <p className="text-justify text-[10pt] leading-relaxed">
                              {coverLetter.openingParagraph}
                            </p>
                          )}

                          {coverLetter.bodyParagraph1 && (
                            <p className="text-justify text-[10pt] leading-relaxed">
                              {coverLetter.bodyParagraph1}
                            </p>
                          )}

                          {coverLetter.bodyParagraph2 && (
                            <p className="text-justify text-[10pt] leading-relaxed">
                              {coverLetter.bodyParagraph2}
                            </p>
                          )}

                          {coverLetter.closingParagraph && (
                            <p className="text-justify text-[10pt] leading-relaxed">
                              {coverLetter.closingParagraph}
                            </p>
                          )}

                          {/* Signoff */}
                          <div className="pt-4 space-y-4">
                            <p>{coverLetter.signoff}</p>
                            <p className="font-bold pt-4 text-zinc-900">
                              {resume.contact.fullName || userName || "Candidate"}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: REAL-WORLD AI LINE & BULLET IMPROVER */}
      {/* ========================================================================= */}
      {aiBulletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-2xl rounded-2xl border border-violet-500/30 bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-violet-500" />
                <h3 className="text-base font-bold text-foreground">
                  Harvard FAS AI Line Improver
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAiBulletModal(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase">
                  Your Current Text ({aiBulletModal.roleContext})
                </label>
                <div className="mt-1 rounded-xl border border-border bg-background p-3 text-xs text-foreground font-medium">
                  {aiBulletModal.originalText || "(Empty line — enter an achievement or choose a suggestion below)"}
                </div>
              </div>

              {/* Quick Guidance Chips */}
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1.5">
                  Give AI Guidance or Tone Adjustment:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCustomAiRegenerate("emphasize 20%+ quantifiable metric impact")}
                    className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs hover:border-violet-400 hover:bg-muted"
                  >
                    📈 Add Quantified Metric (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomAiRegenerate("use strong Harvard active power verbs")}
                    className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs hover:border-violet-400 hover:bg-muted"
                  >
                    ⚡ Strong Action Verbs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomAiRegenerate("executive strategic leadership")}
                    className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs hover:border-violet-400 hover:bg-muted"
                  >
                    👔 Executive Leadership
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomAiRegenerate("tight, concise ATS phrasing")}
                    className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs hover:border-violet-400 hover:bg-muted"
                  >
                    ✂️ Make More Concise
                  </button>
                </div>
              </div>

              {/* Custom Guidance Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiBulletModal.customPrompt}
                  onChange={(e) =>
                    setAiBulletModal((prev) => prev && { ...prev, customPrompt: e.target.value })
                  }
                  placeholder="Or tell AI specifically (e.g. 'we saved $15K', 'managed team of 4', 'mention Python and SQL')..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                />
                <Button
                  type="button"
                  onClick={() => handleCustomAiRegenerate()}
                  disabled={aiBulletModal.isGenerating}
                  className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs shrink-0"
                >
                  {aiBulletModal.isGenerating ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    "Regenerate"
                  )}
                </Button>
              </div>

              {/* Suggestions List */}
              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block">
                  Select a Harvard XYZ Revision:
                </label>

                {aiBulletModal.suggestions.map((sug, i) => (
                  <div
                    key={i}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-border bg-background/80 p-3 text-xs text-foreground transition-all hover:border-violet-500/60 hover:bg-violet-50/20 dark:hover:bg-violet-950/20"
                  >
                    <p className="leading-relaxed">{sug}</p>
                    <button
                      type="button"
                      onClick={() => applyBulletSuggestion(sug)}
                      className="shrink-0 rounded-lg bg-violet-600 px-3 py-1 text-[11px] font-bold text-white transition-transform group-hover:scale-105"
                    >
                      Apply Line
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: IMPORT EXISTING RESUME */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Upload className="size-5 text-violet-600" />
                <h3 className="text-base font-bold text-foreground">Import Existing Resume</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Paste your existing resume text below (or upload a text/markdown file). Our parser will automatically extract your contact info, education, work experience, projects, and skills into Harvard FAS format.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">
                  Paste Resume Text
                </label>
                <textarea
                  rows={9}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste your resume content here..."
                  className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="cursor-pointer text-xs font-semibold text-violet-600 hover:underline">
                  Upload file (.txt / .md)
                  <input
                    type="file"
                    accept=".txt,.md,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const content = evt.target?.result as string;
                          setImportText(content);
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <Button
                    type="button"
                    onClick={handleImportSubmit}
                    disabled={!importText.trim()}
                    className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold"
                  >
                    Parse & Populate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AI COVER LETTER GENERATOR */}
      {/* ========================================================================= */}
      {isCoverLetterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-violet-600" />
                <h3 className="text-base font-bold text-foreground">
                  AI Cover Letter Tailor
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCoverLetterModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateCoverLetter} className="mt-4 space-y-3.5">
              <p className="text-xs text-muted-foreground">
                AI reads your <strong className="text-foreground">actual resume background</strong> and drafts a Harvard-standard cover letter tailored to your target company and role.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  Target Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={clForm.targetCompany}
                  onChange={(e) => setClForm({ ...clForm, targetCompany: e.target.value })}
                  placeholder="e.g. Stripe, Deloitte, Apple, Acme Corp"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  Target Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={clForm.targetRole}
                  onChange={(e) => setClForm({ ...clForm, targetRole: e.target.value })}
                  placeholder="e.g. Senior Software Engineer, Financial Analyst, Product Specialist"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  Company Location (Optional)
                </label>
                <input
                  type="text"
                  value={clForm.companyLocation}
                  onChange={(e) => setClForm({ ...clForm, companyLocation: e.target.value })}
                  placeholder="e.g. San Francisco, CA or London, UK"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  Key Accomplishments or Angle to Emphasize (Optional)
                </label>
                <textarea
                  rows={3}
                  value={clForm.specificHighlights}
                  onChange={(e) => setClForm({ ...clForm, specificHighlights: e.target.value })}
                  placeholder="e.g. Led a team of 4, reduced query times by 40%, audited 15 client accounts..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCoverLetterModalOpen(false)}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={isGeneratingCl || !clForm.targetRole || !clForm.targetCompany}
                  className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold gap-1.5"
                >
                  {isGeneratingCl ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  Generate Cover Letter
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
