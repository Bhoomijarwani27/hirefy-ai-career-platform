"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Award,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileText,
  Loader2,
  Mail,
  Moon,
  MoreHorizontal,
  PenLine,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
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
  extractSkillsList,
  parseResumeText,
  getActiveResumeKey,
  getStoredResumes,
  ResumeSlot,
  ResumeSlotId,
  getResumeSlots,
  saveSlotsToStorage,
  getActiveSlotId,
  setActiveSlotId,
  saveResumeToSlot,
  deleteResumeFromSlot,
  duplicateResumeSlot,
  getResumeDataForSlot,
  importResumeToSlot,
  CoverLetterSlot,
  CoverLetterSlotId,
  getCoverLetterSlots,
  saveCoverLetterSlots,
  getActiveCoverLetterSlotId,
  setActiveCoverLetterSlotId,
  saveCoverLetterToSlot,
  deleteCoverLetterFromSlot,
  duplicateCoverLetterSlot,
  getCoverLetterDataForSlot,
} from "@/lib/resume-storage";
import {
  generateResumeHtml,
  generateCoverLetterHtml,
  downloadResumeDirect,
  downloadCoverLetterDirect,
} from "@/lib/resume-pdf-template";

interface ResumeStudioProps {
  userName?: string;
  userEmail?: string;
}

export function ResumeStudio({ userName, userEmail }: ResumeStudioProps) {
  const router = useRouter();

  // Active View Tab: 'overview' vs 'resume' (Builder) vs 'cover-letter' (Cover Letter Builder)
  const [activeTab, setActiveTab] = useState<"overview" | "resume" | "cover-letter">("overview");

  // In Overview: 'resumes' (3 slots) vs 'cover-letters' (3 slots)
  const [overviewCategory, setOverviewCategory] = useState<"resumes" | "cover-letters">("resumes");

  // 3-Slot Resume Storage State
  const [slots, setSlots] = useState<ResumeSlot[]>(() => getResumeSlots(userName, userEmail));
  const [activeSlotId, setActiveSlotIdState] = useState<ResumeSlotId>("slot-1");

  // 3-Slot Cover Letter Storage State
  const [clSlots, setClSlots] = useState<CoverLetterSlot[]>(() => getCoverLetterSlots());
  const [activeClSlotId, setActiveClSlotIdState] = useState<CoverLetterSlotId>("cl-slot-1");

  // Dropdown menus
  const [openMenuSlotId, setOpenMenuSlotId] = useState<string | null>(null);

  // Modals
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<ResumeSlot | null>(null);
  const [deleteConfirmClSlot, setDeleteConfirmClSlot] = useState<CoverLetterSlot | null>(null);
  const [quickPreviewSlot, setQuickPreviewSlot] = useState<ResumeSlot | null>(null);
  const [quickPreviewClSlot, setQuickPreviewClSlot] = useState<CoverLetterSlot | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTargetSlot, setImportTargetSlot] = useState<ResumeSlotId>("slot-1");
  const [importText, setImportText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [cachedParsedData, setCachedParsedData] = useState<ResumeData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    isPdf: boolean;
    base64?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Current Resume Data being edited in Builder
  const [resume, setResume] = useState<ResumeData>(() =>
    createBlankResume(userName, userEmail)
  );

  // Current Cover Letter State being edited in Builder
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Line Improver Modal State
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

  // Refresh slots on mount and storage updates
  const refreshResumeSlots = () => {
    const loadedSlots = getResumeSlots(userName, userEmail);
    setSlots(loadedSlots);
    const active = getActiveSlotId();
    setActiveSlotIdState(active);
  };

  const refreshCoverLetterSlots = () => {
    const loadedCl = getCoverLetterSlots();
    setClSlots(loadedCl);
    const activeCl = getActiveCoverLetterSlotId();
    setActiveClSlotIdState(activeCl);
  };

  useEffect(() => {
    refreshResumeSlots();
    refreshCoverLetterSlots();

    const handleResumeUpdate = () => refreshResumeSlots();
    const handleClUpdate = () => refreshCoverLetterSlots();

    window.addEventListener("hirefy-resume-storage-update", handleResumeUpdate);
    window.addEventListener("hirefy-cover-letter-storage-update", handleClUpdate);

    return () => {
      window.removeEventListener("hirefy-resume-storage-update", handleResumeUpdate);
      window.removeEventListener("hirefy-cover-letter-storage-update", handleClUpdate);
    };
  }, [userName, userEmail]);

  // Sync user info into current resume
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // ---------------------------------------------------------------------------
  // Resume Slot Action Handlers
  // ---------------------------------------------------------------------------

  // Open Editor for a specific resume slot
  const handleOpenEditorForSlot = (slotId: ResumeSlotId) => {
    const slotData = getResumeDataForSlot(slotId, userName, userEmail);
    setResume(slotData);
    setActiveSlotIdState(slotId);
    setActiveSlotId(slotId);
    setActiveTab("resume");
  };

  // Create New Resume in Slot
  const handleCreateNewInSlot = (targetSlotId?: ResumeSlotId) => {
    let target = targetSlotId;
    if (!target) {
      const emptySlot = slots.find((s) => s.resume === null);
      target = emptySlot ? emptySlot.slotId : "slot-1";
    }

    const blank = createBlankResume(userName, userEmail);
    blank.title = target === "slot-1" ? "Master Resume" : target === "slot-2" ? "Targeted Resume" : "Specialized Resume";
    setResume(blank);
    setActiveSlotIdState(target);
    setActiveSlotId(target);
    setActiveTab("resume");
    showToast(`Created new resume for Slot ${target.replace("slot-", "")}.`);
  };

  // Open Import Modal targeting a specific slot
  const handleOpenImportModal = (targetSlotId?: ResumeSlotId) => {
    if (targetSlotId) {
      setImportTargetSlot(targetSlotId);
    } else {
      const emptySlot = slots.find((s) => s.resume === null);
      setImportTargetSlot(emptySlot ? emptySlot.slotId : "slot-1");
    }
    setImportText("");
    setUploadedFile(null);
    setCachedParsedData(null);
    setIsExtractingPdf(false);
    setIsDragging(false);
    setIsImportModalOpen(true);
  };

  // Browser-based PDF Text Extractor using Mozilla PDF.js via CDN
  const extractTextFromPdfInBrowser = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      let pdfjsLib = (window as any).pdfjsLib;

      if (!pdfjsLib) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.onload = () => {
            const lib = (window as any).pdfjsLib;
            if (lib) {
              lib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
              resolve();
            } else {
              reject(new Error("pdfjsLib not loaded"));
            }
          };
          script.onerror = () => reject(new Error("Failed to load PDF.js"));
          document.head.appendChild(script);
        });
        pdfjsLib = (window as any).pdfjsLib;
      }

      if (pdfjsLib) {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const pageTexts: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          let pageStr = "";
          let lastY: number | null = null;

          for (const item of textContent.items) {
            if ("str" in item) {
              const currentY = item.transform ? item.transform[5] : null;
              if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 6) {
                pageStr += "\n";
              } else if (pageStr && !pageStr.endsWith(" ") && !pageStr.endsWith("\n")) {
                pageStr += " ";
              }
              pageStr += item.str;
              lastY = currentY;
            }
          }

          if (pageStr.trim()) {
            pageTexts.push(pageStr.trim());
          }
        }

        const combined = pageTexts.join("\n\n");
        if (combined.trim().length >= 20) {
          return combined;
        }
      }
    } catch (err) {
      console.warn("Client PDF.js attempt failed, fallback to server:", err);
    }
    return "";
  };

  // Handle file selection (PDF, TXT, MD, JSON)
  const handleFileObject = async (file: File) => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      setIsExtractingPdf(true);
      setImportText("Reading and extracting text from PDF...");

      // 1. Try browser-based PDF extraction first (instant, high-fidelity)
      let browserText = "";
      try {
        browserText = await extractTextFromPdfInBrowser(file);
      } catch {}

      if (browserText && browserText.trim().length >= 25) {
        setImportText(browserText);
        setUploadedFile({
          name: file.name,
          size: file.size,
          isPdf: true,
        });
        setIsExtractingPdf(false);
        showToast(`Extracted resume text from "${file.name}"! Click Import to save.`);
        return;
      }

      // 2. Fall back to server-side extraction & AI
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = evt.target?.result as string;
        setUploadedFile({
          name: file.name,
          size: file.size,
          isPdf: true,
          base64,
        });

        try {
          const res = await fetch("/api/resume/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pdfBase64: base64,
              fileName: file.name,
              defaultName: userName,
              defaultEmail: userEmail,
            }),
          });
          const json = await res.json();
          if (json.success) {
            if (json.extractedText) {
              setImportText(json.extractedText);
            } else if (json.data) {
              const d = json.data;
              const preview = `${d.contact?.fullName || ""}\n${d.contact?.email || ""}${d.contact?.phone ? ` | ${d.contact.phone}` : ""}${d.contact?.location ? ` | ${d.contact.location}` : ""}\n\nEXPERIENCE\n${(d.experience || []).map((e: any) => `${e.role} at ${e.company} (${e.startDate || ""} - ${e.endDate || ""})\n${(e.bullets || []).map((b: string) => `• ${b}`).join("\n")}`).join("\n\n")}\n\nEDUCATION\n${(d.education || []).map((ed: any) => `${ed.degree} - ${ed.institution} (${ed.graduationDate || ""})`).join("\n")}\n\nSKILLS\n${d.skills?.technicalLanguages || ""}, ${d.skills?.frameworksAndTools || ""}`;
              setImportText(preview);
            }
            if (json.data) {
              setCachedParsedData(json.data);
            }
            showToast(`Loaded "${file.name}"! Click Import below to save.`);
          } else {
            setImportText("");
            showToast(json.error || "Could not read text from this PDF. Please paste resume text.");
          }
        } catch {
          setImportText("");
          showToast("Error reading PDF. Please paste resume text.");
        } finally {
          setIsExtractingPdf(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = String(evt.target?.result || "");
        setUploadedFile({
          name: file.name,
          size: file.size,
          isPdf: false,
        });
        setImportText(content);
        setCachedParsedData(null);
      };
      reader.readAsText(file);
    }
  };

  // Save current resume into active slot
  const handleSaveCurrentResume = (andNotify = true) => {
    const updated = saveResumeToSlot(activeSlotId, resume, resume.title);
    refreshResumeSlots();
    if (andNotify) {
      showToast(`Saved "${updated.title}" to Slot ${activeSlotId.replace("slot-", "")}!`);
    }
  };

  // Delete resume from slot
  const handleDeleteSlot = (slotId: ResumeSlotId) => {
    deleteResumeFromSlot(slotId);
    refreshResumeSlots();
    setDeleteConfirmSlot(null);
    showToast(`Cleared Slot ${slotId.replace("slot-", "")}.`);
  };

  // Set slot as primary
  const handleSetPrimary = (slotId: ResumeSlotId) => {
    const updated = slots.map((s) => ({
      ...s,
      isPrimary: s.slotId === slotId,
    }));
    saveSlotsToStorage(updated);
    setActiveSlotId(slotId);
    refreshResumeSlots();
    showToast(`Slot ${slotId.replace("slot-", "")} is now your primary resume.`);
  };

  // Duplicate resume to first available empty slot
  const handleDuplicateToAvailableSlot = (sourceSlotId: ResumeSlotId) => {
    const emptySlot = slots.find((s) => s.resume === null);
    if (!emptySlot) {
      showToast("All 3 resume slots are currently in use. Delete one to duplicate.");
      return;
    }
    duplicateResumeSlot(sourceSlotId, emptySlot.slotId);
    refreshResumeSlots();
    showToast(`Duplicated to Slot ${emptySlot.slotNumber}!`);
  };

  // Import text or PDF submission with Server AI & Fallback Client Parser
  const handleImportSubmit = async () => {
    if (isImporting || isExtractingPdf) return;
    const hasText = !!importText.trim();
    const hasPdf = !!uploadedFile?.base64;
    const hasCached = !!cachedParsedData;

    if (!hasText && !hasPdf && !hasCached) {
      showToast("Please provide resume text or upload a file.");
      return;
    }

    setIsImporting(true);
    try {
      let parsedData: ResumeData | null = cachedParsedData;

      // If we don't have cached data from earlier PDF extraction, parse now
      if (!parsedData) {
        try {
          const res = await fetch("/api/resume/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: importText,
              pdfBase64: uploadedFile?.base64 || undefined,
              fileName: uploadedFile?.name,
              defaultName: userName,
              defaultEmail: userEmail,
            }),
          });

          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              parsedData = json.data;
            }
          }
        } catch (aiErr) {
          console.warn("AI parse API call skipped or errored:", aiErr);
        }

        // Fall back to client parser on importText if available
        if (!parsedData && importText.trim().length >= 15) {
          parsedData = parseResumeText(importText, userName, userEmail);
        }
      }

      // Guard: Ensure parsedData actually contains meaningful content
      const hasRealContent =
        parsedData &&
        (parsedData.experience.some((e) => e.role || e.company || (e.bullets && e.bullets.length > 0 && e.bullets[0])) ||
          parsedData.education.some((e) => e.institution || e.degree) ||
          parsedData.skills.technicalLanguages ||
          importText.trim().length > 30);

      if (!parsedData || !hasRealContent) {
        showToast("Could not extract resume content from this file. Please paste your resume text directly.");
        setIsImporting(false);
        return;
      }

      // Ensure valid structure & titles
      if (!parsedData.id) parsedData.id = `resume-${Date.now()}`;
      if (!parsedData.title) {
        parsedData.title = uploadedFile?.name
          ? uploadedFile.name.replace(/\.[^/.]+$/, "")
          : `${parsedData.contact?.fullName || userName || "My"} — Resume`;
      }

      // Save to target slot
      saveResumeToSlot(importTargetSlot, parsedData, parsedData.title);

      // If current active builder slot is this slot, update React state immediately!
      if (activeSlotId === importTargetSlot) {
        setResume(parsedData);
      }

      refreshResumeSlots();
      setIsImportModalOpen(false);
      setImportText("");
      setUploadedFile(null);
      setCachedParsedData(null);
      showToast(`Imported ${uploadedFile?.name || "full resume"} into Slot ${importTargetSlot.replace("slot-", "")}!`);
    } catch (err) {
      console.error("Resume import error:", err);
      showToast("Could not parse resume. Please check text or file.");
    } finally {
      setIsImporting(false);
    }
  };

  // Connect to Job Search
  const handleSaveAndUseInJobSearch = () => {
    handleSaveCurrentResume(false);
    showToast("Connecting your resume to AI Job Search...");
    setTimeout(() => {
      router.push("/seeker/jobs");
    }, 800);
  };

  // Download Current Active Resume or Cover Letter directly as a PDF file
  const handleDownloadCurrentPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    showToast("Downloading PDF...");
    try {
      if (activeTab === "cover-letter") {
        downloadCoverLetterDirect(
          coverLetter,
          resume.contact.fullName || userName || "Candidate",
          resume.contact,
          undefined,
          fontFamily
        );
        showToast("Cover letter PDF downloaded!");
      } else {
        downloadResumeDirect(resume, undefined, fontFamily);
        showToast("Resume PDF downloaded successfully!");
      }
    } catch (err) {
      console.error("PDF download error:", err);
      showToast("Could not download PDF. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Download PDF directly from any of the 3 slots in Overview
  const handleDownloadSlotPdf = async (slotId: ResumeSlotId) => {
    const targetSlot = slots.find((s) => s.slotId === slotId);
    if (!targetSlot?.resume?.rawResumeData) {
      showToast("Slot is empty. Create or import a resume first.");
      return;
    }
    showToast(`Downloading PDF for ${targetSlot.title}...`);
    try {
      downloadResumeDirect(targetSlot.resume.rawResumeData, undefined, fontFamily);
      showToast(`Downloaded "${targetSlot.title}" PDF!`);
    } catch (err) {
      console.error("Slot PDF download error:", err);
      showToast("Could not download PDF for this slot.");
    }
  };

  // ---------------------------------------------------------------------------
  // Cover Letter Action Handlers
  // ---------------------------------------------------------------------------

  // Open Cover Letter editor for a slot
  const handleOpenCoverLetterForSlot = (slotId: CoverLetterSlotId) => {
    const clData = getCoverLetterDataForSlot(slotId);
    setCoverLetter(clData);
    setActiveClSlotIdState(slotId);
    setActiveCoverLetterSlotId(slotId);
    setActiveTab("cover-letter");
  };

  // Create New Cover Letter in Slot
  const handleCreateNewCoverLetter = (targetSlotId?: CoverLetterSlotId) => {
    let target = targetSlotId;
    if (!target) {
      const emptySlot = clSlots.find((s) => s.data === null);
      target = emptySlot ? emptySlot.slotId : "cl-slot-1";
    }

    const blank: CoverLetterData = {
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
    };

    setCoverLetter(blank);
    setActiveClSlotIdState(target);
    setActiveCoverLetterSlotId(target);
    setActiveTab("cover-letter");
    showToast(`Created blank cover letter for Slot ${target.replace("cl-slot-", "")}.`);
  };

  // Save current cover letter into active cover letter slot
  const handleSaveCurrentCoverLetter = (andNotify = true) => {
    const title = coverLetter.companyName
      ? `${coverLetter.roleTarget || "Role"} at ${coverLetter.companyName}`
      : "My Cover Letter";
    const updated = saveCoverLetterToSlot(activeClSlotId, coverLetter, title);
    refreshCoverLetterSlots();
    if (andNotify) {
      showToast(`Saved "${updated.title}" to Cover Letter Slot ${activeClSlotId.replace("cl-slot-", "")}!`);
    }
  };

  // Delete cover letter from slot
  const handleDeleteCoverLetterSlot = (slotId: CoverLetterSlotId) => {
    deleteCoverLetterFromSlot(slotId);
    refreshCoverLetterSlots();
    setDeleteConfirmClSlot(null);
    showToast(`Cleared Cover Letter Slot ${slotId.replace("cl-slot-", "")}.`);
  };

  // Duplicate cover letter
  const handleDuplicateCoverLetter = (sourceSlotId: CoverLetterSlotId) => {
    const emptySlot = clSlots.find((s) => s.data === null);
    if (!emptySlot) {
      showToast("All 3 cover letter slots are currently full. Delete one to duplicate.");
      return;
    }
    duplicateCoverLetterSlot(sourceSlotId, emptySlot.slotId);
    refreshCoverLetterSlots();
    showToast(`Duplicated cover letter to Slot ${emptySlot.slotNumber}!`);
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

  const filledResumesCount = slots.filter((s) => s.resume !== null).length;
  const filledCoverLettersCount = clSlots.filter((s) => s.data !== null).length;

  // Real-World Context-Aware AI Line Improver
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

    return [
      `Spearheaded ${cleanCore}, driving a 25% increase in operational efficiency through systematic execution and cross-functional alignment.`,
      `Orchestrated end-to-end implementation of ${cleanCore}, streamlining deliverables and reducing workflow turnaround by 30%.`,
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
    showToast("Applied improved line to your resume!");
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

      const generatedCl: CoverLetterData = {
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
      };

      setCoverLetter(generatedCl);
      saveCoverLetterToSlot(activeClSlotId, generatedCl, `${targetRole} at ${targetCompany}`);
      refreshCoverLetterSlots();

      setIsGeneratingCl(false);
      setIsCoverLetterModalOpen(false);
      setActiveTab("cover-letter");
      showToast(`Generated and saved cover letter for ${targetCompany}!`);
    }, 600);
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

      {/* ========================================================================= */}
      {/* 1. OVERVIEW PAGE VIEW: 3-RESUME & 3-COVER LETTER STORE */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 space-y-7">
          {/* Breadcrumb & Theme toggle */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <Link href="/seeker/dashboard" className="hover:text-foreground transition-colors">
                Workspace
              </Link>
              <span>&gt;</span>
              <span className="text-foreground font-semibold">Resume Studio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <Moon className="size-4" />
              </span>
            </div>
          </div>

          {/* Hero Banner: Title, Subtitle, and Capacity Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                <span className="size-2 rounded-full bg-violet-600 animate-pulse" />
                <span>YOUR NEXT CHAPTER</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Resume Studio<span className="text-violet-600">.</span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create, manage, and tailor your resumes and cover letters for your next opportunity.
              </p>
            </div>

            {/* Capacity Card: Shows filled slots for current category */}
            <div className="rounded-2xl border border-border bg-card p-3.5 shadow-xs flex items-center gap-3 shrink-0 self-start sm:self-auto">
              <span className="flex size-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
                {overviewCategory === "resumes" ? <FileText className="size-4" /> : <Mail className="size-4" />}
              </span>
              <div className="space-y-1.5 min-w-[130px]">
                <div className="text-xs font-bold text-foreground">
                  {overviewCategory === "resumes"
                    ? `${filledResumesCount} of 3 resumes`
                    : `${filledCoverLettersCount} of 3 cover letters`}
                </div>
                {/* 3 segmented indicator bars matching Lovable design */}
                <div className="flex items-center gap-1.5 w-28">
                  {[0, 1, 2].map((idx) => {
                    const count =
                      overviewCategory === "resumes" ? filledResumesCount : filledCoverLettersCount;
                    return (
                      <div
                        key={idx}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          idx < count ? "bg-violet-600" : "bg-muted dark:bg-zinc-800"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Pill Bar: Matching Reference Action Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                setOverviewCategory("resumes");
                setActiveTab("overview");
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                overviewCategory === "resumes"
                  ? "bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300 border border-violet-200 dark:border-violet-800 shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FileText className="size-4" />
              <span>My Resumes</span>
            </button>

            <button
              type="button"
              onClick={() => handleCreateNewInSlot()}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Sparkles className="size-4 text-violet-600" />
              <span>Create Resume</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const targetSlot = slots.find((s) => s.resume !== null) || slots[0];
                handleOpenEditorForSlot(targetSlot.slotId);
                showToast("Opened in Builder with AI writing and bullet point improver ready!");
              }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Wand2 className="size-4 text-emerald-600" />
              <span>Improve Resume with AI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const targetSlot = slots.find((s) => s.resume !== null) || slots[0];
                handleOpenEditorForSlot(targetSlot.slotId);
                showToast("Tailor your resume role title, profile & skills for target jobs in the editor!");
              }}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Briefcase className="size-4 text-indigo-600" />
              <span>Create for a Specific Job</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOverviewCategory("cover-letters");
                setActiveTab("overview");
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                overviewCategory === "cover-letters"
                  ? "bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300 border border-violet-200 dark:border-violet-800 shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Mail className="size-4" />
              <span>My Cover Letters ({filledCoverLettersCount}/3)</span>
            </button>
          </div>

          {/* =================================================================== */}
          {/* CATEGORY 1: MY RESUMES (3 SLOTS) */}
          {/* =================================================================== */}
          {overviewCategory === "resumes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-foreground">My Resumes</h2>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-extrabold text-muted-foreground">
                    {filledResumesCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenImportModal()}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted hover:border-violet-400 shadow-xs transition-all"
                >
                  <ArrowUp className="size-3.5 text-muted-foreground" />
                  <span>Import Resume</span>
                </button>
              </div>

              {/* 3-Resume Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                {slots.map((slot) => {
                  // FILLED RESUME SLOT
                  if (slot.resume !== null) {
                    return (
                      <div
                        key={slot.slotId}
                        className="group rounded-2xl border border-border bg-card p-4 flex flex-col justify-between hover:shadow-lg hover:border-violet-300/70 dark:hover:border-violet-700/70 transition-all relative"
                      >
                        {/* Visual Preview Container */}
                        <div
                          onClick={() => handleOpenEditorForSlot(slot.slotId)}
                          className="bg-slate-100/80 dark:bg-zinc-800/40 rounded-xl p-4 flex items-center justify-center relative min-h-[350px] cursor-pointer overflow-hidden transition-all group-hover:bg-slate-100 dark:group-hover:bg-zinc-800/60"
                        >
                          {/* Paper Sheet Preview */}
                          <div className="bg-white text-zinc-900 rounded-md shadow-md border border-zinc-200/90 p-4 aspect-[1/1.3] w-full max-w-[230px] overflow-hidden flex flex-col justify-between select-none pointer-events-none transform group-hover:scale-[1.02] transition-transform">
                            {/* Header */}
                            <div className="border-b border-zinc-300 pb-1.5 mb-1.5">
                              <h4 className="text-[11px] font-extrabold tracking-wider uppercase text-zinc-950 truncate">
                                {slot.resume.candidateName || userName || "Candidate"}
                              </h4>
                              <p className="text-[8px] font-bold text-zinc-700 truncate">
                                {slot.title}
                              </p>
                              <p className="text-[6.5px] text-zinc-500 truncate">
                                {slot.resume.rawResumeData?.contact?.location || "Location"} •{" "}
                                {slot.resume.rawResumeData?.contact?.email || userEmail || "email"}
                              </p>
                            </div>

                            {/* Profile Snippet */}
                            <div className="space-y-1 mb-1">
                              <div className="text-[7px] font-bold uppercase tracking-wider text-zinc-800">
                                Profile
                              </div>
                              <div className="space-y-0.5">
                                <div className="h-1 bg-zinc-200 rounded-full w-full" />
                                <div className="h-1 bg-zinc-200 rounded-full w-11/12" />
                                <div className="h-1 bg-zinc-200 rounded-full w-4/5" />
                              </div>
                            </div>

                            {/* Experience Snippet */}
                            <div className="space-y-1 mb-1 flex-1">
                              <div className="text-[7px] font-bold uppercase tracking-wider text-zinc-800 flex justify-between">
                                <span>Experience</span>
                                <span className="text-[6px] text-zinc-400">Recent</span>
                              </div>
                              <p className="text-[7.5px] font-semibold text-zinc-800 truncate">
                                {slot.resume.rawResumeData?.experience?.[0]?.role || "Professional Experience"}
                              </p>
                              <div className="space-y-0.5">
                                <div className="h-1 bg-zinc-200 rounded-full w-full" />
                                <div className="h-1 bg-zinc-200 rounded-full w-5/6" />
                                <div className="h-1 bg-zinc-200 rounded-full w-3/4" />
                              </div>
                            </div>

                            {/* Paper Footer */}
                            <div className="pt-1 border-t border-zinc-200 flex justify-between items-center text-[6.5px] text-zinc-500">
                              <span>Slot {slot.slotNumber}</span>
                              <span>Harvard FAS Format</span>
                            </div>
                          </div>

                          {/* ATS-friendly Badge */}
                          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-emerald-300/80 bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-xs dark:bg-zinc-900/95 dark:border-emerald-700/60 dark:text-emerald-400">
                            <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                            <span>ATS-friendly</span>
                          </div>

                          {/* Overlay: Eye Quick Preview */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickPreviewSlot(slot);
                            }}
                            title="Quick Preview"
                            className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-xl bg-white/95 dark:bg-zinc-900/90 border border-border text-muted-foreground hover:text-foreground shadow-xs hover:border-violet-400 transition-all"
                          >
                            <Eye className="size-4" />
                          </button>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3.5 flex items-center justify-between">
                          <div
                            onClick={() => handleOpenEditorForSlot(slot.slotId)}
                            className="cursor-pointer space-y-0.5 flex-1 min-w-0 pr-2"
                          >
                            <h3 className="text-sm font-bold text-foreground truncate group-hover:text-violet-600 transition-colors">
                              {slot.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {slot.updatedLabel}
                            </p>
                          </div>

                          {/* 3-Dots Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenMenuSlotId(openMenuSlotId === slot.slotId ? null : slot.slotId)}
                              className="flex size-8 items-center justify-center rounded-lg border border-transparent hover:border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                            >
                              <MoreHorizontal className="size-4" />
                            </button>

                            {openMenuSlotId === slot.slotId && (
                              <div
                                onMouseLeave={() => setOpenMenuSlotId(null)}
                                className="absolute right-0 bottom-full mb-1.5 z-40 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl text-xs space-y-0.5 animate-in fade-in zoom-in-95"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuSlotId(null);
                                    handleOpenEditorForSlot(slot.slotId);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-semibold text-foreground hover:bg-muted"
                                >
                                  <PenLine className="size-3.5 text-violet-600" />
                                  <span>Edit Resume</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuSlotId(null);
                                    handleDownloadSlotPdf(slot.slotId);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-semibold text-foreground hover:bg-muted"
                                >
                                  <Download className="size-3.5 text-violet-600" />
                                  <span>Download PDF</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuSlotId(null);
                                    handleDuplicateToAvailableSlot(slot.slotId);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-semibold text-foreground hover:bg-muted"
                                >
                                  <Copy className="size-3.5 text-indigo-600" />
                                  <span>Duplicate to Empty Slot</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuSlotId(null);
                                    handleSetPrimary(slot.slotId);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-semibold text-foreground hover:bg-muted"
                                >
                                  <Star className={`size-3.5 ${slot.isPrimary ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                                  <span>{slot.isPrimary ? "Active Primary" : "Make Primary"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuSlotId(null);
                                    setDeleteConfirmSlot(slot);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                >
                                  <Trash2 className="size-3.5" />
                                  <span>Delete Resume</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // EMPTY RESUME SLOT
                  return (
                    <div
                      key={slot.slotId}
                      onClick={() => handleCreateNewInSlot(slot.slotId)}
                      className="group rounded-2xl border border-border/80 bg-card hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 hover:border-violet-400 transition-all p-6 flex flex-col items-center justify-center text-center min-h-[420px] cursor-pointer"
                    >
                      <div className="flex size-14 items-center justify-center rounded-full border border-border bg-background text-muted-foreground group-hover:text-violet-600 group-hover:border-violet-500 shadow-xs mb-4 transition-all">
                        <Plus className="size-6 stroke-[1.75]" />
                      </div>

                      <h3 className="text-base font-bold text-foreground mb-1">
                        Create a Resume
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-[210px] mb-4 leading-relaxed">
                        A blank canvas for your next big opportunity.
                      </p>

                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                        <span>Start from scratch</span>
                        <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>

                      <div className="mt-3 text-[11px] text-muted-foreground">
                        or{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenImportModal(slot.slotId);
                          }}
                          className="underline font-semibold hover:text-foreground"
                        >
                          Import document
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* CATEGORY 2: MY COVER LETTERS (3 SLOTS STORAGE) */}
          {/* =================================================================== */}
          {overviewCategory === "cover-letters" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-foreground">My Cover Letters</h2>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-extrabold text-muted-foreground">
                    {filledCoverLettersCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCreateNewCoverLetter()}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted hover:border-violet-400 shadow-xs transition-all"
                >
                  <Plus className="size-3.5 text-muted-foreground" />
                  <span>Create Cover Letter</span>
                </button>
              </div>

              {/* 3-Cover Letter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                {clSlots.map((slot) => {
                  // FILLED COVER LETTER SLOT
                  if (slot.data !== null) {
                    return (
                      <div
                        key={slot.slotId}
                        className="group rounded-2xl border border-border bg-card p-4 flex flex-col justify-between hover:shadow-lg hover:border-violet-300/70 dark:hover:border-violet-700/70 transition-all relative"
                      >
                        {/* Visual Letter Sheet Preview */}
                        <div
                          onClick={() => handleOpenCoverLetterForSlot(slot.slotId)}
                          className="bg-slate-100/80 dark:bg-zinc-800/40 rounded-xl p-4 flex items-center justify-center relative min-h-[350px] cursor-pointer overflow-hidden transition-all group-hover:bg-slate-100 dark:group-hover:bg-zinc-800/60"
                        >
                          <div className="bg-white text-zinc-900 rounded-md shadow-md border border-zinc-200/90 p-4 aspect-[1/1.3] w-full max-w-[230px] overflow-hidden flex flex-col justify-between select-none pointer-events-none transform group-hover:scale-[1.02] transition-transform">
                            {/* Letter Header */}
                            <div className="border-b border-zinc-300 pb-1.5 mb-1.5">
                              <h4 className="text-[10px] font-extrabold uppercase text-zinc-950 truncate">
                                {resume.contact.fullName || userName || "Candidate"}
                              </h4>
                              <p className="text-[7.5px] font-bold text-violet-700 truncate">
                                {slot.data.companyName ? `Target: ${slot.data.companyName}` : slot.title}
                              </p>
                              <p className="text-[6.5px] text-zinc-500">
                                {slot.data.date || "Recent Date"}
                              </p>
                            </div>

                            {/* Salutation & Paragraph Snippet */}
                            <div className="space-y-1.5 text-[7px] text-zinc-700 leading-relaxed flex-1">
                              <p className="font-bold text-zinc-900">{slot.data.salutation}</p>
                              <p className="line-clamp-4 text-justify">
                                {slot.data.openingParagraph || slot.data.bodyParagraph1 || "Letter content tailored to company..."}
                              </p>
                            </div>

                            {/* Signoff */}
                            <div className="pt-2 border-t border-zinc-200 text-[6.5px] text-zinc-600">
                              <p>{slot.data.signoff || "Sincerely,"}</p>
                              <p className="font-bold text-zinc-900 truncate">
                                {resume.contact.fullName || userName || "Candidate"}
                              </p>
                            </div>
                          </div>

                          {/* Quick Preview Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickPreviewClSlot(slot);
                            }}
                            title="Quick Preview"
                            className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-xl bg-white/95 dark:bg-zinc-900/90 border border-border text-muted-foreground hover:text-foreground shadow-xs hover:border-violet-400 transition-all"
                          >
                            <Eye className="size-4" />
                          </button>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3.5 flex items-center justify-between">
                          <div
                            onClick={() => handleOpenCoverLetterForSlot(slot.slotId)}
                            className="cursor-pointer space-y-0.5 flex-1 min-w-0 pr-2"
                          >
                            <h3 className="text-sm font-bold text-foreground truncate group-hover:text-violet-600 transition-colors">
                              {slot.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {slot.updatedLabel}
                            </p>
                          </div>

                          {/* 3-Dots Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenMenuSlotId(openMenuSlotId === slot.slotId ? null : slot.slotId)}
                              className="flex size-8 items-center justify-center rounded-lg border border-transparent hover:border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                            >
                              <MoreHorizontal className="size-4" />
                            </button>

                            {openMenuSlotId === slot.slotId && (
                              <div
                                onMouseLeave={() => setOpenMenuSlotId(null)}
                                className="absolute right-0 bottom-full mb-1.5 z-40 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl text-xs space-y-0.5 animate-in fade-in zoom-in-95"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuSlotId(null);
                                    handleOpenCoverLetterForSlot(slot.slotId);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-semibold text-foreground hover:bg-muted"
                                >
                                  <PenLine className="size-3.5 text-violet-600" />
                                  <span>Edit Cover Letter</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuSlotId(null);
                                    handleDuplicateCoverLetter(slot.slotId);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-semibold text-foreground hover:bg-muted"
                                >
                                  <Copy className="size-3.5 text-indigo-600" />
                                  <span>Duplicate to Empty Slot</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuSlotId(null);
                                    setDeleteConfirmClSlot(slot);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                >
                                  <Trash2 className="size-3.5" />
                                  <span>Delete Cover Letter</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // EMPTY COVER LETTER SLOT
                  return (
                    <div
                      key={slot.slotId}
                      onClick={() => handleCreateNewCoverLetter(slot.slotId)}
                      className="group rounded-2xl border-2 border-dashed border-border bg-card/40 hover:bg-card/70 hover:border-violet-500/50 transition-all p-6 flex flex-col items-center justify-center text-center min-h-[420px] cursor-pointer"
                    >
                      <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-muted-foreground group-hover:text-violet-600 group-hover:border-violet-500 shadow-xs mb-4 transition-all">
                        <Mail className="size-5" />
                      </div>

                      <h3 className="text-base font-bold text-foreground mb-1">
                        Create a Cover Letter
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-[210px] mb-5 leading-relaxed">
                        Slot {slot.slotNumber} is available. Write a tailored letter or use AI to generate from your resume.
                      </p>

                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors">
                        <span>Start from scratch</span>
                        <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>

                      <div className="mt-3 text-[11px] text-muted-foreground">
                        or{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCoverLetterModalOpen(true);
                          }}
                          className="underline font-semibold hover:text-foreground"
                        >
                          AI Tailor with Resume
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. EDITOR VIEW: HARVARD FAS RESUME BUILDER & COVER LETTER BUILDER */}
      {/* ========================================================================= */}
      {activeTab !== "overview" && (
        <>
          {/* Top Action Bar in Editor */}
          <section className="sticky top-0 z-30 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[1520px] flex-wrap items-center justify-between gap-3">
              {/* Left: Back to Overview & Title */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "resume") {
                      handleSaveCurrentResume(false);
                    } else {
                      handleSaveCurrentCoverLetter(false);
                    }
                    setActiveTab("overview");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground shadow-xs transition-all"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>{activeTab === "resume" ? "My Resumes" : "My Cover Letters"}</span>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold sm:text-base">
                      {activeTab === "resume"
                        ? resume.title || "Harvard FAS Resume"
                        : coverLetter.companyName
                        ? `${coverLetter.roleTarget || "Role"} at ${coverLetter.companyName}`
                        : "Harvard Standard Cover Letter"}
                    </h1>
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
                      {activeTab === "resume"
                        ? `Slot ${activeSlotId.replace("slot-", "")}`
                        : `Slot ${activeClSlotId.replace("cl-slot-", "")}`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Standard single-column, professional format.
                  </p>
                </div>
              </div>

              {/* Center: Slot Switcher Pills + Tab Switcher */}
              <div className="flex items-center gap-3">
                {/* Slot Switcher */}
                <div className="hidden sm:inline-flex rounded-xl border border-border bg-card p-1 shadow-xs text-xs">
                  {activeTab === "resume" ? (
                    slots.map((s) => (
                      <button
                        key={s.slotId}
                        type="button"
                        onClick={() => handleOpenEditorForSlot(s.slotId)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          activeSlotId === s.slotId
                            ? "bg-violet-600 text-white shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Slot {s.slotNumber}
                      </button>
                    ))
                  ) : (
                    clSlots.map((s) => (
                      <button
                        key={s.slotId}
                        type="button"
                        onClick={() => handleOpenCoverLetterForSlot(s.slotId)}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                          activeClSlotId === s.slotId
                            ? "bg-violet-600 text-white shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Slot {s.slotNumber}
                      </button>
                    ))
                  )}
                </div>

                {/* Tabs: Resume vs Cover Letter */}
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
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "resume") {
                      handleSaveCurrentResume(true);
                    } else {
                      handleSaveCurrentCoverLetter(true);
                    }
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-violet-400/40 bg-violet-50 dark:bg-violet-950/40 px-3.5 text-xs font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-100 shadow-xs"
                >
                  <Check className="size-3.5" />
                  <span>
                    Save to Slot{" "}
                    {activeTab === "resume"
                      ? activeSlotId.replace("slot-", "")
                      : activeClSlotId.replace("cl-slot-", "")}
                  </span>
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
                  onClick={handleDownloadCurrentPdf}
                  disabled={isDownloadingPdf}
                  title="Download clean Harvard resume PDF"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-violet-500/30 bg-background px-3 text-xs font-semibold hover:bg-violet-500/10 transition-all text-foreground"
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="size-3.5 text-violet-600 animate-spin" />
                  ) : (
                    <Download className="size-3.5 text-violet-600" />
                  )}
                  <span>{isDownloadingPdf ? "Downloading..." : "Download PDF"}</span>
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

          {/* Main Workspace for Builder */}
          <main className="mx-auto w-full max-w-[1520px] px-4 py-6 sm:px-6 lg:px-8">
            {/* Helper Strip */}
            <div className="mb-6 rounded-2xl border border-border bg-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-violet-600" />
                <span className="text-xs text-muted-foreground">
                  Harvard FAS standard: single-column layout, clear reverse-chronological order, and bullet points structured with action verbs.
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setResume(createBlankResume(userName, userEmail));
                    showToast("Cleared resume to a clean blank slate.");
                  }}
                  className="rounded-xl border border-border bg-background px-3 py-1.5 font-semibold text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
                >
                  Clear to Blank
                </button>
              </div>
            </div>

            {/* Split Screen Grid: Form on Left, Live Document on Right */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(480px,1.05fr)] xl:grid-cols-[minmax(0,1fr)_minmax(540px,1.15fr)]">
              {/* LEFT COLUMN: INTERACTIVE FORM EDITOR */}
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
                        <span className="text-xs text-muted-foreground">Standard top banner</span>
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
                            placeholder="e.g. Alex Morgan"
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                            Resume Title / Target Role
                          </label>
                          <input
                            type="text"
                            value={resume.title}
                            onChange={(e) =>
                              setResume((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            placeholder="e.g. Senior Software Engineer"
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
                            placeholder="e.g. alex@example.com"
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
                            placeholder="e.g. San Francisco, CA"
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
                            placeholder="github.com/username or portfolio.dev"
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Reorderable Sections */}
                    {resume.sectionOrder.map((sectionKey, sIdx) => (
                      <div
                        key={sectionKey}
                        className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all"
                      >
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
                                      placeholder="e.g. University"
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
                                      placeholder="e.g. B.S. in Computer Science"
                                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                      Graduation Date
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
                                      placeholder="e.g. May 2024"
                                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                      Location
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
                                      placeholder="e.g. City, State"
                                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                    />
                                  </div>
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
                                    },
                                  ],
                                }))
                              }
                              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs font-semibold text-muted-foreground hover:border-violet-400 hover:text-foreground transition-colors"
                            >
                              <Plus className="size-3.5" />
                              <span>Add Education Entry</span>
                            </button>
                          </div>
                        )}

                        {/* SECTION 2: WORK EXPERIENCE */}
                        {sectionKey === "experience" && (
                          <div className="space-y-4">
                            {resume.experience.map((exp, expIdx) => (
                              <div
                                key={exp.id}
                                className="rounded-xl border border-border/80 bg-background/50 p-3.5 space-y-3"
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
                                      Role Title
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
                                      placeholder="e.g. Software Engineer"
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
                                      placeholder="e.g. Acme Corp"
                                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                      Start Date
                                    </label>
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
                                      placeholder="e.g. Jan 2023"
                                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                      End Date
                                    </label>
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
                                      placeholder="e.g. Present"
                                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                    />
                                  </div>
                                </div>

                                {/* Accomplishment Bullets */}
                                <div className="space-y-2 pt-2">
                                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Accomplishment Bullets
                                  </label>
                                  {exp.bullets.map((bullet, bIdx) => (
                                    <div key={bIdx} className="flex items-start gap-2">
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
                                        className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => openAiBulletImprover("experience", expIdx, bIdx, bullet, exp.role)}
                                        title="Enhance line"
                                        className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg border border-violet-400 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950/60 dark:text-violet-300"
                                      >
                                        <Wand2 className="size-3.5" />
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
                                        className="mt-1 text-muted-foreground hover:text-rose-500 p-1"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </button>
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
                                    className="text-[11px] font-semibold text-violet-600 hover:underline inline-flex items-center gap-1"
                                  >
                                    <Plus className="size-3" /> Add bullet point
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
                              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs font-semibold text-muted-foreground hover:border-violet-400 hover:text-foreground transition-colors"
                            >
                              <Plus className="size-3.5" />
                              <span>Add Experience Entry</span>
                            </button>
                          </div>
                        )}

                        {/* SECTION 3: PROJECTS */}
                        {sectionKey === "projects" && (
                          <div className="space-y-4">
                            {resume.projects.map((proj, projIdx) => (
                              <div
                                key={proj.id}
                                className="rounded-xl border border-border/80 bg-background/50 p-3.5 space-y-3"
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
                                      placeholder="e.g. Distributed Database"
                                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                                      Tech Stack / Tools Used
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
                                      placeholder="e.g. Python, Docker, Next.js"
                                      className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-violet-500"
                                    />
                                  </div>
                                </div>

                                {/* Project Bullets */}
                                <div className="space-y-2">
                                  {proj.bullets.map((bullet, bIdx) => (
                                    <div key={bIdx} className="flex items-start gap-2">
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
                                        placeholder="Action & outcome achieved..."
                                        className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => openAiBulletImprover("projects", projIdx, bIdx, bullet, proj.title)}
                                        title="Enhance line"
                                        className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg border border-violet-400 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-950/60 dark:text-violet-300"
                                      >
                                        <Wand2 className="size-3.5" />
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
                                        className="mt-1 text-muted-foreground hover:text-rose-500 p-1"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </button>
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
                                    className="text-[11px] font-semibold text-violet-600 hover:underline inline-flex items-center gap-1"
                                  >
                                    <Plus className="size-3" /> Add project bullet
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
                              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs font-semibold text-muted-foreground hover:border-violet-400 hover:text-foreground transition-colors"
                            >
                              <Plus className="size-3.5" />
                              <span>Add Project Entry</span>
                            </button>
                          </div>
                        )}

                        {/* SECTION 4: SKILLS */}
                        {sectionKey === "skills" && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                                Technical Skills (Languages & Tools)
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
                                placeholder="Python, SQL, React, TypeScript, Git..."
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                                Frameworks & Platforms
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
                                placeholder="Docker, AWS, PostgreSQL, Tailwind..."
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                                Core Competencies
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
                                placeholder="Problem Solving, Cross-functional Leadership, Analytical Thinking..."
                                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                              />
                            </div>
                          </div>
                        )}

                        {/* SECTION 5: LEADERSHIP */}
                        {sectionKey === "leadership" && (
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">
                              Extracurricular initiatives, community leadership, and certifications.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  /* COVER LETTER FORM */
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-violet-600" />
                        <h2 className="text-sm font-bold text-foreground">Cover Letter Content</h2>
                      </div>
                      <Button
                        type="button"
                        onClick={() => setIsCoverLetterModalOpen(true)}
                        className="h-8 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold gap-1.5"
                      >
                        <Sparkles className="size-3.5" />
                        <span>AI Tailor</span>
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={coverLetter.companyName}
                          onChange={(e) => setCoverLetter({ ...coverLetter, companyName: e.target.value })}
                          placeholder="e.g. Stripe, Apple, Acme Corp"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                          Target Role
                        </label>
                        <input
                          type="text"
                          value={coverLetter.roleTarget}
                          onChange={(e) => setCoverLetter({ ...coverLetter, roleTarget: e.target.value })}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Opening Paragraph
                      </label>
                      <textarea
                        rows={3}
                        value={coverLetter.openingParagraph}
                        onChange={(e) => setCoverLetter({ ...coverLetter, openingParagraph: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Body Paragraph 1 (Key Accomplishments)
                      </label>
                      <textarea
                        rows={4}
                        value={coverLetter.bodyParagraph1}
                        onChange={(e) => setCoverLetter({ ...coverLetter, bodyParagraph1: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Body Paragraph 2 (Why This Company)
                      </label>
                      <textarea
                        rows={3}
                        value={coverLetter.bodyParagraph2}
                        onChange={(e) => setCoverLetter({ ...coverLetter, bodyParagraph2: e.target.value })}
                        className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: LIVE 8.5" x 11" DOCUMENT PREVIEW */}
              <div className="sticky top-20 self-start space-y-4">
                {/* Document Top Bar */}
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
                      {activeTab === "resume" ? <FileText className="size-4" /> : <Mail className="size-4" />}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        {activeTab === "resume" ? "Harvard FAS Resume Preview" : "Cover Letter Preview"}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {activeTab === "resume" ? "Standard single-column" : "Professional business letter"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "resume") {
                          handleSaveCurrentResume(true);
                        } else {
                          handleSaveCurrentCoverLetter(true);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition-all"
                    >
                      <Check className="size-3.5" />
                      <span>
                        Save to Slot{" "}
                        {activeTab === "resume"
                          ? activeSlotId.replace("slot-", "")
                          : activeClSlotId.replace("cl-slot-", "")}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Printable Document Sheet */}
                <div
                  id="harvard-printable-area"
                  className={`relative w-full rounded-xl border border-zinc-200 bg-white p-8 text-zinc-900 shadow-2xl transition-all dark:border-zinc-800 ${
                    fontFamily === "serif" ? "font-serif" : "font-sans"
                  }`}
                  style={{ minHeight: "840px" }}
                >
                  {activeTab === "resume" ? (
                    /* HARVARD FAS RESUME PRINTABLE SHEET */
                    <div className="space-y-4 text-[9.5pt] leading-tight text-zinc-900">
                      {/* Contact Banner */}
                      <div className="border-b border-zinc-400 pb-2 text-center space-y-1">
                        <h1 className="text-[17pt] font-extrabold uppercase tracking-wide text-zinc-950">
                          {resume.contact.fullName || userName || "Candidate"}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-2 text-[9pt] text-zinc-700">
                          {resume.contact.location && <span>{resume.contact.location}</span>}
                          {resume.contact.phone && <span>• {resume.contact.phone}</span>}
                          {resume.contact.email && <span>• {resume.contact.email}</span>}
                          {resume.contact.githubOrPortfolio && <span>• {resume.contact.githubOrPortfolio}</span>}
                        </div>
                      </div>

                      {/* Sections in dynamic order */}
                      {resume.sectionOrder.map((sec) => {
                        if (sec === "education" && resume.education.length > 0 && resume.education.some((e) => e.institution)) {
                          return (
                            <div key="edu" className="space-y-1.5">
                              <h3 className="border-b border-zinc-400 text-[10pt] font-bold uppercase tracking-wider text-zinc-900">
                                Education
                              </h3>
                              {resume.education.map((edu) => (
                                <div key={edu.id} className="text-[9.5pt]">
                                  <div className="flex justify-between font-bold">
                                    <span>{edu.institution}</span>
                                    <span>{edu.location}</span>
                                  </div>
                                  <div className="flex justify-between italic text-zinc-700">
                                    <span>{edu.degree}</span>
                                    <span>{edu.graduationDate}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        if (sec === "experience" && resume.experience.length > 0 && resume.experience.some((e) => e.role || e.company)) {
                          return (
                            <div key="exp" className="space-y-2">
                              <h3 className="border-b border-zinc-400 text-[10pt] font-bold uppercase tracking-wider text-zinc-900">
                                Experience
                              </h3>
                              {resume.experience.map((exp) => (
                                <div key={exp.id} className="text-[9.5pt] space-y-1">
                                  <div className="flex justify-between font-bold">
                                    <span>{exp.company}</span>
                                    <span>{exp.location}</span>
                                  </div>
                                  <div className="flex justify-between italic text-zinc-700">
                                    <span>{exp.role}</span>
                                    <span>
                                      {exp.startDate} – {exp.endDate}
                                    </span>
                                  </div>
                                  <ul className="ml-4 list-disc space-y-0.5 text-[9pt] leading-normal text-zinc-800">
                                    {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                                      <li key={bIdx}>{bullet}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        if (sec === "projects" && resume.projects.length > 0 && resume.projects.some((p) => p.title)) {
                          return (
                            <div key="proj" className="space-y-1.5">
                              <h3 className="border-b border-zinc-400 text-[10pt] font-bold uppercase tracking-wider text-zinc-900">
                                Projects
                              </h3>
                              {resume.projects.map((proj) => (
                                <div key={proj.id} className="text-[9.5pt] space-y-0.5">
                                  <div className="flex justify-between font-bold">
                                    <span>{proj.title}</span>
                                    <span className="font-normal italic text-zinc-600 text-[8.5pt]">
                                      {proj.techStack}
                                    </span>
                                  </div>
                                  <ul className="ml-4 list-disc space-y-0.5 text-[9pt] leading-normal text-zinc-800">
                                    {proj.bullets.filter(Boolean).map((bullet, bIdx) => (
                                      <li key={bIdx}>{bullet}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        if (sec === "skills" && (resume.skills.technicalLanguages || resume.skills.frameworksAndTools || resume.skills.softSkills)) {
                          return (
                            <div key="skills" className="space-y-1 text-[9pt]">
                              <h3 className="border-b border-zinc-400 text-[10pt] font-bold uppercase tracking-wider text-zinc-900">
                                Skills & Competencies
                              </h3>
                              {resume.skills.technicalLanguages && (
                                <p>
                                  <strong className="font-bold">Technical: </strong>
                                  {resume.skills.technicalLanguages}
                                </p>
                              )}
                              {resume.skills.frameworksAndTools && (
                                <p>
                                  <strong className="font-bold">Tools & Frameworks: </strong>
                                  {resume.skills.frameworksAndTools}
                                </p>
                              )}
                              {resume.skills.softSkills && (
                                <p>
                                  <strong className="font-bold">Competencies: </strong>
                                  {resume.skills.softSkills}
                                </p>
                              )}
                            </div>
                          );
                        }

                        return null;
                      })}
                    </div>
                  ) : (
                    /* HARVARD COVER LETTER PRINTABLE SHEET */
                    <div className="space-y-4 text-[10pt] leading-relaxed text-zinc-900">
                      <div className="border-b border-zinc-300 pb-2">
                        <h2 className="text-xl font-bold uppercase text-zinc-950">
                          {resume.contact.fullName || userName || "Candidate"}
                        </h2>
                        <p className="text-xs text-zinc-600">
                          {resume.contact.email} • {resume.contact.phone}
                        </p>
                      </div>

                      <div className="space-y-1 pt-2 text-xs text-zinc-600">
                        <p>{coverLetter.date}</p>
                        <p className="font-bold text-zinc-900">{coverLetter.companyName}</p>
                        <p>{coverLetter.companyLocation}</p>
                      </div>

                      <p className="pt-2 font-bold">{coverLetter.salutation}</p>
                      <p className="text-justify">{coverLetter.openingParagraph}</p>
                      <p className="text-justify">{coverLetter.bodyParagraph1}</p>
                      <p className="text-justify">{coverLetter.bodyParagraph2}</p>
                      <p className="text-justify">{coverLetter.closingParagraph}</p>

                      <div className="pt-4 space-y-4">
                        <p>{coverLetter.signoff}</p>
                        <p className="font-bold text-zinc-950">
                          {resume.contact.fullName || userName || "Candidate"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK RESUME PREVIEW */}
      {/* ========================================================================= */}
      {quickPreviewSlot && quickPreviewSlot.resume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-violet-600" />
                <h3 className="text-base font-bold text-foreground">
                  {quickPreviewSlot.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickPreviewSlot(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-xs space-y-3 font-serif">
              <div className="border-b border-zinc-400 pb-2 text-center space-y-1">
                <h2 className="text-lg font-bold uppercase text-zinc-950">
                  {quickPreviewSlot.resume.candidateName || userName || "Candidate"}
                </h2>
                <p className="text-xs text-zinc-600">
                  {quickPreviewSlot.title} • Slot {quickPreviewSlot.slotNumber}
                </p>
              </div>

              <div className="space-y-2 text-xs text-zinc-800 leading-relaxed">
                <div>
                  <h4 className="font-bold border-b border-zinc-300 pb-0.5 text-zinc-900 uppercase">Skills</h4>
                  <p className="mt-1">{quickPreviewSlot.resume.knownSkills.join(", ")}</p>
                </div>

                {quickPreviewSlot.resume.rawResumeData?.experience?.[0] && (
                  <div>
                    <h4 className="font-bold border-b border-zinc-300 pb-0.5 text-zinc-900 uppercase">Experience</h4>
                    <p className="font-semibold text-zinc-900 mt-1">
                      {quickPreviewSlot.resume.rawResumeData.experience[0].role} at {quickPreviewSlot.resume.rawResumeData.experience[0].company}
                    </p>
                    <ul className="list-disc ml-4 space-y-1 mt-1 text-[11px]">
                      {quickPreviewSlot.resume.rawResumeData.experience[0].bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuickPreviewSlot(null)}
                className="rounded-xl"
              >
                Close
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDownloadSlotPdf(quickPreviewSlot.slotId)}
                disabled={isDownloadingPdf}
                className="rounded-xl gap-1.5 font-bold"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="size-4 animate-spin text-violet-600" />
                ) : (
                  <Download className="size-4 text-violet-600" />
                )}
                <span>Download PDF</span>
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const sId = quickPreviewSlot.slotId;
                  setQuickPreviewSlot(null);
                  handleOpenEditorForSlot(sId);
                }}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold gap-1.5"
              >
                <PenLine className="size-4" />
                <span>Open in Builder</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK COVER LETTER PREVIEW */}
      {/* ========================================================================= */}
      {quickPreviewClSlot && quickPreviewClSlot.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Mail className="size-5 text-violet-600" />
                <h3 className="text-base font-bold text-foreground">
                  {quickPreviewClSlot.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickPreviewClSlot(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-xs space-y-4 font-serif text-xs leading-relaxed">
              <div className="border-b border-zinc-300 pb-2">
                <h2 className="text-lg font-bold uppercase text-zinc-950">
                  {resume.contact.fullName || userName || "Candidate"}
                </h2>
                <p className="text-zinc-600">{resume.contact.email} • {resume.contact.phone}</p>
              </div>

              <div>
                <p>{quickPreviewClSlot.data.date}</p>
                <p className="font-bold">{quickPreviewClSlot.data.companyName}</p>
                <p>{quickPreviewClSlot.data.companyLocation}</p>
              </div>

              <p className="font-bold">{quickPreviewClSlot.data.salutation}</p>
              <p className="text-justify">{quickPreviewClSlot.data.openingParagraph}</p>
              <p className="text-justify">{quickPreviewClSlot.data.bodyParagraph1}</p>
              <p className="text-justify">{quickPreviewClSlot.data.bodyParagraph2}</p>
              <p className="text-justify">{quickPreviewClSlot.data.closingParagraph}</p>

              <div>
                <p>{quickPreviewClSlot.data.signoff}</p>
                <p className="font-bold">{resume.contact.fullName || userName || "Candidate"}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuickPreviewClSlot(null)}
                className="rounded-xl"
              >
                Close
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  downloadCoverLetterDirect(
                    quickPreviewClSlot.data,
                    resume.contact.fullName || userName || "Candidate",
                    resume.contact,
                    `${quickPreviewClSlot.title.replace(/\s+/g, "_")}_Cover_Letter.pdf`,
                    fontFamily
                  );
                  showToast("Cover letter PDF downloaded!");
                }}
                className="rounded-xl gap-1.5 font-bold"
              >
                <Download className="size-4 text-violet-600" />
                <span>Download PDF</span>
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const sId = quickPreviewClSlot.slotId;
                  setQuickPreviewClSlot(null);
                  handleOpenCoverLetterForSlot(sId);
                }}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold gap-1.5"
              >
                <PenLine className="size-4" />
                <span>Open in Editor</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION (RESUME) */}
      {/* ========================================================================= */}
      {deleteConfirmSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-rose-500/30 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <Trash2 className="size-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Delete Resume?
                </h3>
                <p className="text-xs text-muted-foreground">
                  This will clear Slot {deleteConfirmSlot.slotNumber} ({deleteConfirmSlot.title}).
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete this resume? The slot will become available so you can create or import another resume.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmSlot(null)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleDeleteSlot(deleteConfirmSlot.slotId)}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Delete Resume
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION (COVER LETTER) */}
      {/* ========================================================================= */}
      {deleteConfirmClSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-rose-500/30 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <Trash2 className="size-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Delete Cover Letter?
                </h3>
                <p className="text-xs text-muted-foreground">
                  This will clear Cover Letter Slot {deleteConfirmClSlot.slotNumber}.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete this cover letter? The slot will become available for a new letter.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmClSlot(null)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleDeleteCoverLetterSlot(deleteConfirmClSlot.slotId)}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Delete Cover Letter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: IMPORT RESUME WITH SLOT SELECTOR */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Upload className="size-5 text-violet-600" />
                <h3 className="text-base font-bold text-foreground">Import Resume</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Target Slot Selector */}
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 uppercase">
                Choose Storage Slot (Max 3)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.slotId}
                    type="button"
                    onClick={() => setImportTargetSlot(s.slotId)}
                    className={`rounded-xl border p-2.5 text-left text-xs transition-all ${
                      importTargetSlot === s.slotId
                        ? "border-violet-600 bg-violet-500/10 text-violet-700 dark:text-violet-300 font-bold"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="font-bold">Slot {s.slotNumber}</div>
                    <div className="text-[10px] truncate text-muted-foreground">
                      {s.resume ? s.title : "(Empty)"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload / Drag & Drop Area */}
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground mb-1.5 uppercase">
                Upload Resume File (PDF, TXT, MD, JSON)
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileObject(file);
                }}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                  isDragging
                    ? "border-violet-600 bg-violet-500/10"
                    : uploadedFile
                    ? "border-violet-500/40 bg-violet-500/5"
                    : "border-border hover:border-violet-400 bg-muted/20"
                }`}
              >
                {uploadedFile ? (
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="rounded-xl bg-violet-600/10 p-2 text-violet-600">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground truncate max-w-[280px]">
                          {uploadedFile.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {uploadedFile.isPdf ? "PDF Document" : "Text Document"} • {Math.round(uploadedFile.size / 1024)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setImportText("");
                      }}
                      className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground text-xs"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="resume-file-input" className="cursor-pointer space-y-1 w-full py-2">
                    <Upload className="mx-auto size-6 text-violet-600" />
                    <div className="text-xs font-bold text-foreground">
                      Upload PDF or Text Resume
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Drag & drop your resume file here, or click to browse (.pdf, .txt, .md, .json)
                    </div>
                  </label>
                )}
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf,.docx,.txt,.md,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileObject(file);
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-muted-foreground uppercase">
                  {uploadedFile?.isPdf ? "Extracted Resume Content (Editable)" : "Or Paste Resume Content Directly"}
                </label>
                {isExtractingPdf && (
                  <div className="flex items-center gap-1.5 text-[11px] text-violet-600 font-semibold animate-pulse">
                    <Loader2 className="size-3 animate-spin" />
                    <span>Extracting text from PDF...</span>
                  </div>
                )}
              </div>
              <textarea
                rows={5}
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setCachedParsedData(null);
                }}
                disabled={isExtractingPdf}
                placeholder="Paste your raw resume text, education, experience bullets, and skills here..."
                className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed disabled:opacity-60"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setUploadedFile(null);
                  setCachedParsedData(null);
                  setImportText("");
                }}
                disabled={isImporting || isExtractingPdf}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleImportSubmit}
                disabled={
                  (!importText.trim() && !uploadedFile?.base64 && !cachedParsedData) ||
                  isImporting ||
                  isExtractingPdf
                }
                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold"
              >
                {isImporting || isExtractingPdf ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>{isExtractingPdf ? "Reading PDF..." : "Importing to Slot..."}</span>
                  </div>
                ) : (
                  `Import to Slot ${importTargetSlot.replace("slot-", "")}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AI LINE & BULLET IMPROVER */}
      {/* ========================================================================= */}
      {aiBulletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-2xl rounded-2xl border border-violet-500/30 bg-card p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-violet-500" />
                <h3 className="text-base font-bold text-foreground">
                  AI Line Improver
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

              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase block">
                  Select an Improved Line:
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
      {/* MODAL: AI COVER LETTER GENERATOR */}
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
                AI reads your <strong className="text-foreground">actual resume background</strong> and drafts a personalized cover letter tailored to your target company and role.
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
                  placeholder="e.g. Senior Software Engineer, Product Designer"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-violet-500"
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
                  Generate & Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
