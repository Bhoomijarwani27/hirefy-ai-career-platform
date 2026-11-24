"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Key,
  Paperclip,
  Plus,
  Send,
  Sparkles,
  Square,
  Target,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  CareerChatSession,
  CareerChatMessage,
  AttachedResumeInfo,
} from "@/lib/skill-gap-types";
import {
  getChatSessions,
  saveChatSession,
  deleteChatSession,
  getActiveChatId,
  setActiveChatId,
  createNewSession,
  getStoredUserApiKey,
  saveStoredUserApiKey,
} from "@/lib/skill-gap-storage";
import { getStoredResumes, getActiveResumeKey } from "@/lib/resume-storage";

interface SkillGapStudioProps {
  userName?: string;
  userEmail?: string;
}

export function SkillGapStudio({ userName, userEmail }: SkillGapStudioProps) {
  const [sessions, setSessions] = useState<CareerChatSession[]>([]);
  const [activeSessionId, setActiveId] = useState<string>("");
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Attached Resume & Job Description state
  const [attachedResume, setAttachedResume] = useState<AttachedResumeInfo | null>(null);
  const [attachedJobDescription, setAttachedJobDescription] = useState<string>("");
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [rawResumeInput, setRawResumeInput] = useState("");
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");

  // Interactive Checklist & Accordion State
  const [checkedPlanItems, setCheckedPlanItems] = useState<Record<string, boolean>>({});
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});

  // API Key Settings Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [storedApiKey, setStoredApiKey] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Load Sessions and API Key on Mount
  useEffect(() => {
    const loaded = getChatSessions();
    setSessions(loaded);
    const active = getActiveChatId();
    if (active && loaded.some((s) => s.id === active)) {
      setActiveId(active);
    } else if (loaded.length > 0) {
      setActiveId(loaded[0].id);
    }
    const key = getStoredUserApiKey() || "";
    setStoredApiKey(key);
    setApiKeyInput(key);
  }, []);

  // Sync active session's attached resume and job description
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    if (currentSession?.attachedResume) {
      setAttachedResume(currentSession.attachedResume);
    } else {
      setAttachedResume(null);
    }
    if (currentSession?.jobDescription) {
      setAttachedJobDescription(currentSession.jobDescription);
      setJobDescriptionInput(currentSession.jobDescription);
    } else {
      setAttachedJobDescription("");
      setJobDescriptionInput("");
    }
  }, [currentSession]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages, isSending]);

  // Create New Chat
  const handleCreateNewChat = () => {
    const fresh = createNewSession();
    const updated = [fresh, ...sessions];
    setSessions(updated);
    setActiveId(fresh.id);
    setActiveChatId(fresh.id);
    setAttachedResume(null);
    setAttachedJobDescription("");
    showToast("Started a new career assessment session.");
  };

  // Switch Chat
  const handleSelectChat = (id: string) => {
    setActiveId(id);
    setActiveChatId(id);
  };

  // Delete Chat
  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteChatSession(id);
    setSessions(updated);
    if (activeSessionId === id && updated.length > 0) {
      setActiveId(updated[0].id);
    }
    showToast("Chat removed.");
  };

  // Attach Resume from Studio
  const handleAttachFromStudio = () => {
    try {
      const stored = getStoredResumes(userName, userEmail);
      const activeKey = getActiveResumeKey();
      const resume = stored[activeKey];
      if (!resume) {
        showToast("No resume found in studio. Please paste or upload your resume.");
        return;
      }

      let content = "";
      if (resume.rawResumeData) {
        const r = resume.rawResumeData;
        const parts: string[] = [];
        parts.push(`Candidate: ${r.contact.fullName || userName || "Candidate"}`);
        if (r.contact.email) parts.push(`Email: ${r.contact.email}`);
        if (r.contact.location) parts.push(`Location: ${r.contact.location}`);
        if (r.contact.githubOrPortfolio) parts.push(`GitHub / Portfolio: ${r.contact.githubOrPortfolio}`);
        if (r.contact.linkedin) parts.push(`LinkedIn: ${r.contact.linkedin}`);

        parts.push(`\nTechnical Skills:`);
        if (r.skills.technicalLanguages) parts.push(`- Languages: ${r.skills.technicalLanguages}`);
        if (r.skills.frameworksAndTools) parts.push(`- Frameworks & Tools: ${r.skills.frameworksAndTools}`);
        if (r.skills.softSkills) parts.push(`- Competencies: ${r.skills.softSkills}`);

        if (r.experience && r.experience.length > 0) {
          parts.push(`\nProfessional Experience:`);
          r.experience.forEach((e) => {
            parts.push(`• ${e.role} at ${e.company} (${e.startDate} - ${e.endDate || "Present"}):\n${e.bullets.map((b) => `  - ${b}`).join("\n")}`);
          });
        }

        if (r.projects && r.projects.length > 0) {
          parts.push(`\nTechnical Projects:`);
          r.projects.forEach((p) => {
            parts.push(`• ${p.title} (Tech: ${p.techStack}${p.link ? ` | Link: ${p.link}` : ""}):\n${p.bullets.map((b) => `  - ${b}`).join("\n")}`);
          });
        }

        if (r.education && r.education.length > 0) {
          parts.push(`\nEducation:`);
          r.education.forEach((edu) => {
            parts.push(`• ${edu.degree} from ${edu.institution}${edu.graduationDate ? ` (${edu.graduationDate})` : ""}${edu.details ? ` - ${edu.details}` : ""}`);
          });
        }

        if (r.leadership && r.leadership.length > 0) {
          parts.push(`\nLeadership & Extracurricular:`);
          r.leadership.forEach((l) => {
            parts.push(`• ${l.role} at ${l.organization} (${l.date}): ${l.description}`);
          });
        }

        content = parts.join("\n");
      } else {
        content = `Candidate Name: ${resume.candidateName}\nSkills: ${resume.knownSkills.join(", ")}`;
      }

      const info: AttachedResumeInfo = {
        name: resume.name || "Master Resume",
        content,
        skills: resume.knownSkills || [],
        jobDescription: attachedJobDescription || undefined,
      };

      setAttachedResume(info);
      if (currentSession) {
        const updatedSession = { ...currentSession, attachedResume: info };
        saveChatSession(updatedSession);
        setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
      }
      setIsResumeModalOpen(false);
      showToast(`Attached "${info.name}"!`);
    } catch {
      showToast("Could not load resume from studio.");
    }
  };

  // Attach Raw / Pasted Resume & Job Description
  const handleAttachPastedResume = () => {
    if (!rawResumeInput.trim()) return;
    const info: AttachedResumeInfo = {
      name: "Custom Pasted Resume",
      content: rawResumeInput.trim(),
      skills: [],
      jobDescription: jobDescriptionInput.trim() || undefined,
    };
    setAttachedResume(info);
    setAttachedJobDescription(jobDescriptionInput.trim());

    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        attachedResume: info,
        jobDescription: jobDescriptionInput.trim() || undefined,
      };
      saveChatSession(updatedSession);
      setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
    }
    setIsResumeModalOpen(false);
    setRawResumeInput("");
    showToast(jobDescriptionInput.trim() ? "Attached resume and target job description!" : "Attached custom resume!");
  };

  // Save Target Job Description directly
  const handleSaveJobDescription = () => {
    const jd = jobDescriptionInput.trim();
    setAttachedJobDescription(jd);
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        jobDescription: jd || undefined,
        attachedResume: currentSession.attachedResume
          ? { ...currentSession.attachedResume, jobDescription: jd || undefined }
          : undefined,
      };
      saveChatSession(updatedSession);
      setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
    }
    setIsResumeModalOpen(false);
    showToast(jd ? "Target job description attached!" : "Job description cleared.");
  };

  // Save API Key
  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredUserApiKey(apiKeyInput);
    setStoredApiKey(apiKeyInput.trim());
    setIsKeyModalOpen(false);
    showToast(apiKeyInput.trim() ? "AI API Key saved!" : "API Key cleared.");
  };

  // Send Message
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || isSending || !currentSession) return;

    const userMsg: CareerChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachedResumeName: attachedResume?.name,
    };

    let sessionTitle = currentSession.title;
    if (currentSession.messages.filter((m) => m.role === "user").length === 0) {
      sessionTitle = textToSend.slice(0, 36) + (textToSend.length > 36 ? "..." : "");
    }

    const updatedMessages = [...currentSession.messages, userMsg];
    const workingSession: CareerChatSession = {
      ...currentSession,
      title: sessionTitle,
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
      jobDescription: attachedJobDescription || undefined,
    };

    setSessions((prev) => prev.map((s) => (s.id === workingSession.id ? workingSession : s)));
    saveChatSession(workingSession);
    setInputMessage("");
    setIsSending(true);

    try {
      const res = await fetch("/api/skill-gap/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          attachedResume: attachedResume ? { name: attachedResume.name, content: attachedResume.content } : undefined,
          jobDescription: attachedJobDescription || undefined,
          customApiKey: storedApiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate AI response");
      }

      const aiMsg: CareerChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalSession: CareerChatSession = {
        ...workingSession,
        messages: [...workingSession.messages, aiMsg],
        updatedAt: new Date().toISOString(),
      };

      setSessions((prev) => prev.map((s) => (s.id === finalSession.id ? finalSession : s)));
      saveChatSession(finalSession);
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : "Error connecting to AI";
      const errorMsg: CareerChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **AI Response Notice:**\n\n${errText}\n\n*Click the 🔑 **API Key** button in the top bar to connect your free Google Gemini API key.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const errorSession: CareerChatSession = {
        ...workingSession,
        messages: [...workingSession.messages, errorMsg],
      };
      setSessions((prev) => prev.map((s) => (s.id === errorSession.id ? errorSession : s)));
      saveChatSession(errorSession);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle checklist items
  const togglePlanItem = (key: string) => {
    setCheckedPlanItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Toggle details accordion
  const toggleDetails = (key: string) => {
    setOpenDetails((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // =========================================================================
  // Enhanced, Clean, Interactive Career Coach Response Renderer
  // =========================================================================
  const renderEnhancedMarkdown = (content: string, msgId?: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 1. Table Detection
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          tableLines.push(lines[i]);
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCells = tableLines[0]
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim());
          const isSeparator = /^\|[\s-:]+\|/.test(tableLines[1]);
          const rowLines = isSeparator ? tableLines.slice(2) : tableLines.slice(1);

          elements.push(
            <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-2xl border border-border bg-card/60 shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/70">
                    {headerCells.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        className="p-2.5 font-bold text-foreground text-[11px]"
                        dangerouslySetInnerHTML={{ __html: formatInline(h) }}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {rowLines.map((r, rIdx) => {
                    const cells = r
                      .split("|")
                      .slice(1, -1)
                      .map((c) => c.trim());
                    return (
                      <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                        {cells.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="p-2.5 text-foreground/90 text-xs"
                            dangerouslySetInnerHTML={{ __html: formatInline(cell) }}
                          />
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      // 2. Fenced Code Block
      if (line.trim().startsWith("```")) {
        const lang = line.trim().replace(/^```/, "").trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // Skip closing ```

        elements.push(
          <div key={`code-${i}`} className="my-3 rounded-2xl border border-border bg-muted/40 overflow-hidden font-mono text-xs shadow-xs">
            {lang && (
              <div className="bg-muted px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border flex items-center justify-between">
                <span>{lang}</span>
              </div>
            )}
            <pre className="p-3.5 overflow-x-auto text-[11px] leading-relaxed text-foreground">
              <code>{codeLines.join("\n")}</code>
            </pre>
          </div>
        );
        continue;
      }

      // 3. Expandable Accordion: <details>...</details>
      if (line.trim().startsWith("<details>")) {
        const detailKey = `details-${i}`;
        const isOpen = openDetails[detailKey] ?? false;
        const detailLines: string[] = [];
        let summaryText = "View Detailed Recommendations & Resume Rewrites";

        i++; // Skip <details>
        while (i < lines.length && !lines[i].trim().startsWith("</details>")) {
          if (lines[i].trim().startsWith("<summary>")) {
            summaryText = lines[i].replace(/<\/?summary>/g, "").replace(/<\/?strong>/g, "").trim();
          } else {
            detailLines.push(lines[i]);
          }
          i++;
        }
        i++; // Skip </details>

        elements.push(
          <div key={detailKey} className="my-3 rounded-2xl border border-border bg-muted/20 overflow-hidden shadow-xs transition-all">
            <button
              type="button"
              onClick={() => toggleDetails(detailKey)}
              className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-foreground hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-violet-600" />
                <span>{summaryText}</span>
              </div>
              {isOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
            </button>
            {isOpen && (
              <div className="p-4 border-t border-border/60 bg-card/60 text-xs leading-relaxed space-y-2 animate-in fade-in">
                {renderEnhancedMarkdown(detailLines.join("\n"), msgId)}
              </div>
            )}
          </div>
        );
        continue;
      }

      // 4. Interactive Checklist item: - [ ] or - [x]
      const checkboxMatch = line.match(/^-\s*\[([ xX])\]\s*(.*)/);
      if (checkboxMatch) {
        const isDefaultChecked = checkboxMatch[1].toLowerCase() === "x";
        const itemText = checkboxMatch[2];
        const itemKey = `item-${i}-${itemText.slice(0, 20)}`;
        const isChecked = checkedPlanItems[itemKey] ?? isDefaultChecked;

        elements.push(
          <div
            key={itemKey}
            onClick={() => togglePlanItem(itemKey)}
            className={`my-1.5 flex items-start gap-2.5 rounded-xl border p-2.5 transition-all cursor-pointer ${
              isChecked
                ? "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground line-through"
                : "border-border bg-card/70 hover:border-violet-500/40 text-foreground"
            }`}
          >
            <span className="mt-0.5 shrink-0 text-violet-600">
              {isChecked ? <CheckSquare className="size-4 text-emerald-600" /> : <Square className="size-4 text-muted-foreground" />}
            </span>
            <span className="text-xs leading-relaxed select-none" dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
          </div>
        );
        i++;
        continue;
      }

      // 5. Visual Score Banners: Overall Readiness & Job Match
      if (line.startsWith("### 1. Overall Role Readiness Score:") || line.startsWith("### 1. Overall Readiness Score:")) {
        const scoreStr = line.match(/\*\*(\d+)%?\*\*/)?.[1] || "75";
        const scoreNum = parseInt(scoreStr, 10);

        elements.push(
          <div key={`readiness-card-${i}`} className="my-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-violet-600" />
                <span className="text-xs font-bold text-foreground">Overall Role Readiness</span>
              </div>
              <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-extrabold text-white">
                {scoreNum}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-violet-600 h-2 rounded-full transition-all duration-500" style={{ width: `${scoreNum}%` }} />
            </div>
          </div>
        );
        i++;
        continue;
      }

      if (line.startsWith("### 2. Specific Job Match Score:") || line.startsWith("### 2. Job Match Score:")) {
        const scoreStr = line.match(/\*\*(\d+)%?\*\*/)?.[1] || "70";
        const scoreNum = parseInt(scoreStr, 10);
        const isJD = line.includes("Job Description");

        elements.push(
          <div key={`jobmatch-card-${i}`} className="my-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-emerald-600" />
                <span className="text-xs font-bold text-foreground">
                  {isJD ? "Specific Job Match" : "Target-Role Industry Benchmark"}
                </span>
              </div>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-extrabold text-white">
                {scoreNum}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: `${scoreNum}%` }} />
            </div>
          </div>
        );
        i++;
        continue;
      }

      // 6. Section Banner: "What Should You Do Next?"
      if (line.includes("What Should You Do Next?")) {
        elements.push(
          <div key={`next-steps-${i}`} className="mt-6 mb-3 rounded-2xl border border-violet-500/40 bg-gradient-to-r from-violet-600/15 via-purple-600/10 to-transparent p-3.5 shadow-xs flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white font-bold">
              ⚡
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-600">Action Plan</span>
              <h2 className="text-sm font-bold text-foreground">What Should You Do Next? (Top 3 Priorities)</h2>
            </div>
          </div>
        );
        i++;
        continue;
      }

      // 7. Priority Cards (Priority 1, 2, 3)
      if (line.includes("Priority 1:") || line.includes("Priority 2:") || line.includes("Priority 3:")) {
        const priorityTitle = line.replace(/###\s*🎯?\s*/, "").trim();
        const pNumMatch = priorityTitle.match(/Priority\s*(\d+)/i);
        const pNum = pNumMatch ? pNumMatch[1] : "1";
        const cleanTitle = priorityTitle.replace(/Priority\s*\d+:\s*/i, "");

        const detailItems: string[] = [];
        i++;
        while (i < lines.length && (lines[i].startsWith("* ") || lines[i].startsWith("- ") || lines[i].trim() === "")) {
          if (lines[i].trim().length > 0) {
            detailItems.push(lines[i].replace(/^[*-\s]+/, ""));
          }
          i++;
        }

        elements.push(
          <div key={`p-card-${i}`} className="my-3 rounded-2xl border border-violet-500/25 bg-card p-4 shadow-xs hover:border-violet-500/50 transition-all">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-violet-600 px-2 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                  Priority {pNum}
                </span>
                <span className="text-xs font-bold text-foreground">{cleanTitle}</span>
              </div>
              <span className="rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 px-2 py-0.5 text-[10px] font-semibold">
                ⏱️ Actionable
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-foreground/90">
              {detailItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="mt-1 size-1.5 rounded-full bg-violet-500 shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
                </div>
              ))}
            </div>
          </div>
        );
        continue;
      }

      // 8. Phased Roadmap Steps
      if (line.startsWith("### Phase 1:") || line.startsWith("### Phase 2:") || line.startsWith("### Phase 3:")) {
        const phaseTitle = line.replace(/###\s*/, "").trim();
        const phaseNumMatch = phaseTitle.match(/Phase\s*(\d+)/i);
        const pNum = phaseNumMatch ? phaseNumMatch[1] : "1";
        const cleanPhase = phaseTitle.replace(/Phase\s*\d+:\s*/i, "");

        const phaseDetails: string[] = [];
        i++;
        while (i < lines.length && (lines[i].startsWith("* ") || lines[i].startsWith("- ") || lines[i].trim() === "")) {
          if (lines[i].trim().length > 0) {
            phaseDetails.push(lines[i].replace(/^[*-\s]+/, ""));
          }
          i++;
        }

        elements.push(
          <div key={`phase-step-${i}`} className="my-2.5 rounded-2xl border border-border bg-muted/20 p-3.5 hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white font-extrabold text-xs shadow-xs">
                {pNum}
              </span>
              <span className="text-xs font-bold text-foreground">{cleanPhase}</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground pl-8">
              {phaseDetails.map((item, idx) => (
                <div key={idx} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              ))}
            </div>
          </div>
        );
        continue;
      }

      // 9. Skill Category Badges
      if (line.includes("Your Strongest Demonstrated Skills")) {
        elements.push(
          <div key={`cat-strong-${i}`} className="mt-5 mb-2 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Award className="size-4 text-emerald-600" />
            <span>Your Strongest Demonstrated Skills</span>
          </div>
        );
        i++;
        continue;
      }

      if (line.includes("Skills That Need More Proof")) {
        elements.push(
          <div key={`cat-proof-${i}`} className="mt-5 mb-2 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
            <AlertCircle className="size-4 text-amber-600" />
            <span>Skills Needing Practical Evidence (Partially Demonstrated)</span>
          </div>
        );
        i++;
        continue;
      }

      if (line.includes("High-Priority Skills Missing")) {
        elements.push(
          <div key={`cat-missing-${i}`} className="mt-5 mb-2 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
            <Target className="size-4 text-rose-600" />
            <span>High-Priority Skills Missing from Resume</span>
          </div>
        );
        i++;
        continue;
      }

      // General Headings
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={`h2-${i}`} className="mt-6 mb-2 text-sm font-bold text-foreground border-b border-border/60 pb-1 flex items-center gap-2">
            <span>{line.replace("## ", "")}</span>
          </h2>
        );
        i++;
        continue;
      }

      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={`h1-${i}`} className="mt-5 mb-2 text-base font-extrabold text-foreground">
            {line.replace("# ", "")}
          </h1>
        );
        i++;
        continue;
      }

      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={`h3-${i}`} className="mt-3 mb-1 text-xs font-bold text-foreground">
            {line.replace("### ", "")}
          </h3>
        );
        i++;
        continue;
      }

      // Horizontal Rule
      if (line.trim() === "---") {
        elements.push(<hr key={`hr-${i}`} className="my-3 border-border/70" />);
        i++;
        continue;
      }

      // Blockquotes
      if (line.startsWith("> ")) {
        const text = line.replace("> ", "");
        elements.push(
          <blockquote key={`quote-${i}`} className="my-2 rounded-xl border-l-4 border-violet-500 bg-violet-500/5 p-2.5 text-xs text-foreground/90 italic leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
          </blockquote>
        );
        i++;
        continue;
      }

      // Bullet points
      if (line.startsWith("* ") || line.startsWith("- ")) {
        const content = line.substring(2);
        elements.push(
          <li key={`bullet-${i}`} className="ml-4 list-disc text-xs leading-relaxed text-foreground/90 my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
          </li>
        );
        i++;
        continue;
      }

      // Numbered List
      if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, "");
        elements.push(
          <li key={`num-${i}`} className="ml-4 list-decimal text-xs leading-relaxed text-foreground/90 my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
          </li>
        );
        i++;
        continue;
      }

      // Empty Lines
      if (!line.trim()) {
        elements.push(<div key={`empty-${i}`} className="h-1.5" />);
        i++;
        continue;
      }

      // Standard Paragraph
      elements.push(
        <p key={`p-${i}`} className="text-xs leading-relaxed text-foreground/90 my-1">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
      i++;
    }

    return elements;
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-foreground'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='italic text-foreground/90'>$1</em>")
      .replace(/`([^`]+)`/g, "<code class='bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold text-violet-600 dark:text-violet-400'>$1</code>");
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground antialiased overflow-hidden">
      <DashboardHeader />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-violet-500/30 bg-background/95 px-4 py-3 text-sm font-semibold text-foreground shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="size-4 text-violet-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* ========================================================================= */}
        {/* SIDEBAR: CHAT HISTORY & NEW CHAT */}
        {/* ========================================================================= */}
        <aside className="w-64 border-r border-border bg-card/40 flex flex-col shrink-0 hidden md:flex">
          {/* Top New Chat button */}
          <div className="p-3 border-b border-border">
            <Button
              type="button"
              onClick={handleCreateNewChat}
              className="w-full justify-start gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs h-9 shadow-xs"
            >
              <Plus className="size-4" />
              <span>New Career Assessment</span>
            </Button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Assessment History
            </p>
            {sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectChat(s.id)}
                  className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-violet-500/10 text-violet-700 dark:text-violet-300 font-bold border border-violet-500/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="truncate max-w-[160px]">{s.title || "Career Session"}</span>
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteChat(s.id, e)}
                      title="Delete chat"
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-600 p-1 transition-opacity"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className="p-3 border-t border-border bg-muted/20">
            <Link
              href="/seeker/resume-studio"
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Resume Studio</span>
            </Link>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN CHAT AREA */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Top Active Session Bar */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card/60 backdrop-blur-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
                <Target className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-foreground truncate max-w-xs sm:max-w-md">
                  {currentSession?.title || "AI Career Coach"}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Role Readiness &bull; Skill Gap Analysis &bull; Top 3 Priorities &bull; Phased Roadmap &bull; 7-Day Plan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Attached Resume Indicator */}
              {attachedResume ? (
                <div className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                  <FileText className="size-3.5" />
                  <span className="truncate max-w-[110px]">{attachedResume.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedResume(null)}
                    title="Remove attached resume"
                    className="hover:text-rose-600 ml-1"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="h-8 rounded-xl border border-dashed border-border text-xs font-semibold gap-1.5"
                >
                  <Paperclip className="size-3.5" />
                  <span>Attach Resume</span>
                </Button>
              )}

              {/* Attached Job Description Indicator */}
              {attachedJobDescription ? (
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <Briefcase className="size-3.5" />
                  <span>JD Attached</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedJobDescription("");
                      setJobDescriptionInput("");
                      showToast("Job description removed.");
                    }}
                    title="Remove Job Description"
                    className="hover:text-rose-600 ml-1"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="h-8 rounded-xl border border-border text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Briefcase className="size-3.5" />
                  <span className="hidden sm:inline">Add Job Desc</span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsKeyModalOpen(true)}
                title="Configure Real AI API Key"
                className="h-8 rounded-xl border border-border text-xs font-semibold gap-1"
              >
                <Key className="size-3 text-violet-600" />
                <span className="hidden sm:inline">API Key</span>
              </Button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {currentSession?.messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 max-w-3xl mx-auto ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white text-xs font-bold shadow-xs mt-1">
                      AI
                    </span>
                  )}

                  <div
                    className={`group relative rounded-3xl p-5 text-xs shadow-xs max-w-[92%] sm:max-w-[85%] ${
                      isUser
                        ? "bg-violet-600 text-white rounded-br-xs"
                        : "border border-border bg-card text-foreground rounded-bl-xs"
                    }`}
                  >
                    {/* Attached Resume tag on user message */}
                    {isUser && msg.attachedResumeName && (
                      <div className="mb-2 inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                        <FileText className="size-3" />
                        <span>Attached: {msg.attachedResumeName}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <div>
                          {renderEnhancedMarkdown(msg.content, msg.id)}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px]">
                      <span className={isUser ? "text-violet-200" : "text-muted-foreground"}>
                        {msg.timestamp}
                      </span>

                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-violet-600 text-muted-foreground flex items-center gap-1"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="size-3 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground text-xs font-bold shadow-xs mt-1">
                      <User className="size-4" />
                    </span>
                  )}
                </div>
              );
            })}

            {/* AI Generating Indicator */}
            {isSending && (
              <div className="flex gap-3.5 max-w-3xl mx-auto justify-start">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white text-xs font-bold animate-pulse mt-1">
                  AI
                </span>
                <div className="rounded-3xl border border-border bg-card p-4 text-xs shadow-xs text-muted-foreground flex items-center gap-2">
                  <span className="size-2 rounded-full bg-violet-600 animate-ping" />
                  <span>Your career coach is generating your scores, top 3 actions, and 7-day plan...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestion Chips (if only 1 greeting message) */}
          {currentSession?.messages.length === 1 && (
            <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 mb-2">
              <p className="text-[11px] font-bold text-muted-foreground mb-2">
                Quick actions with your Career Coach:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    handleAttachFromStudio();
                    void handleSendMessage("Here is my resume. I want to crack a Senior Full-Stack Engineer role. Give me a clear, friendly career report: my 2 scores, what I am missing, top 3 next steps, and a 7-day starter plan.");
                  }}
                  className="rounded-2xl border border-border bg-card p-3 text-left hover:border-violet-500 hover:bg-violet-500/5 transition-all text-xs group"
                >
                  <p className="font-bold text-foreground group-hover:text-violet-600 transition-colors">🚀 Complete Career Assessment</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Readiness score, job match, missing skills, and top 3 priorities
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleAttachFromStudio();
                    void handleSendMessage("Based on my resume, tell me my top 3 immediate learning priorities for my target role. Include practical tasks and estimated hours.");
                  }}
                  className="rounded-2xl border border-border bg-card p-3 text-left hover:border-violet-500 hover:bg-violet-500/5 transition-all text-xs group"
                >
                  <p className="font-bold text-foreground group-hover:text-violet-600 transition-colors">⚡ What Should I Do Next? (Top 3)</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Clear, achievable tasks to close your most critical skill gaps
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleAttachFromStudio();
                    void handleSendMessage("Create a structured 3-phase learning roadmap (Weeks 1-2, Weeks 3-4, Weeks 5-6) tailored to my background and target role.");
                  }}
                  className="rounded-2xl border border-border bg-card p-3 text-left hover:border-violet-500 hover:bg-violet-500/5 transition-all text-xs group"
                >
                  <p className="font-bold text-foreground group-hover:text-violet-600 transition-colors">🗺️ Phased Learning Roadmap</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Structured 6-week curriculum with milestone goals
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleAttachFromStudio();
                    void handleSendMessage("Generate a personalized 7-Day Starter Plan with daily practical exercises so I can take action immediately.");
                  }}
                  className="rounded-2xl border border-border bg-card p-3 text-left hover:border-violet-500 hover:bg-violet-500/5 transition-all text-xs group"
                >
                  <p className="font-bold text-foreground group-hover:text-violet-600 transition-colors">📅 7-Day Actionable Plan</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Manageable daily checklist to build immediate hiring momentum
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Chat Input Form */}
          <div className="border-t border-border bg-background p-3 sm:p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendMessage();
              }}
              className="max-w-3xl mx-auto flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-xs focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20"
            >
              <button
                type="button"
                onClick={() => setIsResumeModalOpen(true)}
                title={attachedResume ? `Attached: ${attachedResume.name}` : "Attach Resume"}
                className={`p-2 rounded-xl transition-colors shrink-0 ${
                  attachedResume
                    ? "text-violet-600 bg-violet-100 dark:bg-violet-950/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Paperclip className="size-4" />
              </button>

              <input
                ref={chatInputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  attachedResume
                    ? "Ask a question, request deeper project details, or refine roadmap..."
                    : "Enter target role (e.g. Senior Frontend at Stripe) or attach resume..."
                }
                className="flex-1 bg-transparent px-2 py-1.5 text-xs text-foreground outline-none placeholder:text-muted-foreground"
              />

              <Button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                size="sm"
                className="h-8 w-8 rounded-xl bg-violet-600 p-0 text-white hover:bg-violet-700 disabled:opacity-40 shrink-0"
              >
                <Send className="size-3.5" />
              </Button>
            </form>
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: RESUME & JOB DESCRIPTION ATTACHMENT DRAWER */}
      {/* ========================================================================= */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-violet-600" />
                <h3 className="text-sm font-bold text-foreground">Attach Resume & Target Job</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsResumeModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Option 1: Attach from Studio */}
              <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground">Sync with Resume Studio</p>
                  <p className="text-[11px] text-muted-foreground">
                    Pulls your active resume including experience, projects, skills, and education.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleAttachFromStudio}
                  className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold h-8 shrink-0"
                >
                  Attach Studio Resume
                </Button>
              </div>

              {/* Option 2: Upload File */}
              <div className="rounded-2xl border border-dashed border-border p-4 text-center">
                <input
                  type="file"
                  id="resume-file-picker"
                  accept=".txt,.md,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const content = String(evt.target?.result || "");
                        const info: AttachedResumeInfo = {
                          name: file.name,
                          content,
                          skills: [],
                          jobDescription: attachedJobDescription || undefined,
                        };
                        setAttachedResume(info);
                        if (currentSession) {
                          const updated = { ...currentSession, attachedResume: info };
                          saveChatSession(updated);
                          setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
                        }
                        setIsResumeModalOpen(false);
                        showToast(`Attached "${file.name}"!`);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                <label htmlFor="resume-file-picker" className="cursor-pointer flex flex-col items-center gap-1">
                  <Upload className="size-5 text-violet-600" />
                  <span className="text-xs font-semibold text-foreground">Click to upload .txt / .md resume</span>
                </label>
              </div>

              {/* Option 3: Paste Resume Text */}
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  Or paste resume / background directly:
                </label>
                <textarea
                  rows={3}
                  value={rawResumeInput}
                  onChange={(e) => setRawResumeInput(e.target.value)}
                  placeholder="Paste work experience, skills list, or education details..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground outline-none focus:border-violet-500 leading-relaxed"
                />
              </div>

              {/* Option 4: Target Job Description (Optional) */}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Briefcase className="size-3.5 text-emerald-600" />
                  <label className="text-[11px] font-bold text-foreground">
                    Target Job Description (Optional)
                  </label>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1.5 leading-relaxed">
                  Paste a specific job posting from LinkedIn or careers page to compute an exact Job Match Score.
                </p>
                <textarea
                  rows={3}
                  value={jobDescriptionInput}
                  onChange={(e) => setJobDescriptionInput(e.target.value)}
                  placeholder="Paste job requirements, responsibilities, or qualification criteria..."
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground outline-none focus:border-emerald-500 leading-relaxed font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsResumeModalOpen(false)}
                  className="h-8 text-xs font-semibold"
                >
                  Cancel
                </Button>
                {jobDescriptionInput && !rawResumeInput && (
                  <Button
                    type="button"
                    onClick={handleSaveJobDescription}
                    className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Save Job Description
                  </Button>
                )}
                {rawResumeInput && (
                  <Button
                    type="button"
                    onClick={handleAttachPastedResume}
                    className="h-8 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold"
                  >
                    Attach Resume & Save
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REAL AI API KEY CONFIGURATION */}
      {/* ========================================================================= */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <Key className="size-4 text-violet-600" />
                <h3 className="text-sm font-bold text-foreground">Connect Real AI</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your <strong>Google Gemini API Key</strong> (Free from{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-600 underline font-semibold"
                >
                  Google AI Studio
                </a>
                ) or an OpenAI / Groq key.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Enter your API key..."
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs text-foreground outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/40 p-3 text-[11px] text-muted-foreground">
                <strong>Tip:</strong> You can also set <code className="text-violet-600 font-mono">GEMINI_API_KEY</code> directly inside your project&apos;s <code className="text-violet-600 font-mono">.env</code> file.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="h-9 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold"
                >
                  Save API Key
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
