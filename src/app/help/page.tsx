"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Mail,
  MessageSquare,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const TICKET_CATEGORIES = [
  "Resume & ATS Scoring",
  "Job Discovery & Matching",
  "Application Tracker",
  "Account, Login & OAuth",
  "Billing or Subscription",
  "Report a Bug / Feedback",
];

const COMMON_ISSUES = [
  {
    id: "resume-upload",
    title: "Resume upload failed or timed out",
    category: "Resume & ATS",
    solution:
      "Ensure your resume is a standard text PDF or DOCX file under 10MB. Avoid scanned images or password-protected files, which cannot be parsed by our ATS extractor.",
    actionUrl: "/seeker/resume-studio",
    actionLabel: "Go to Resume Studio",
  },
  {
    id: "ats-score",
    title: "Why did my ATS score change or not update?",
    category: "Resume & ATS",
    solution:
      "ATS scores are calculated based on formatting readability, keyword coverage, and section consistency. If you uploaded a revised file, click 'Re-Analyze' in Resume Studio to trigger an updated evaluation.",
    actionUrl: "/seeker/resume-studio",
    actionLabel: "Recalculate ATS",
  },
  {
    id: "match-scoring",
    title: "How does the Job Match score work?",
    category: "Job Discovery",
    solution:
      "Our AI compares your resume skills against both required and preferred requirements from the employer. High scores (75%+) represent direct overlap with core competencies. In 'Manual Search' mode, match scoring is hidden.",
    actionUrl: "/seeker/jobs",
    actionLabel: "Open Job Discovery",
  },
  {
    id: "oauth-linking",
    title: "Social Login (Google / GitHub) not linking",
    category: "Account & Login",
    solution:
      "If you registered with email and password first, sign in with your password and connect your social accounts in Account Settings to avoid duplicate account conflicts.",
    actionUrl: "/settings",
    actionLabel: "Account Settings",
  },
  {
    id: "privacy-deletion",
    title: "How do I delete my uploaded resume data?",
    category: "Privacy & Data",
    solution:
      "You have full ownership of your data. You can delete individual uploaded resumes from Resume Studio or request a full data wipe under Settings > Account Actions.",
    actionUrl: "/settings",
    actionLabel: "Manage Privacy",
  },
];

export default function HelpPage() {
  const { data: session } = authClient.useSession();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState(TICKET_CATEGORIES[0]);
  const [priority, setPriority] = useState<"Normal" | "High" | "Urgent">("Normal");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // Auto-populate user info if logged in
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !name) setName(session.user.name);
      if (session.user.email && !email) setEmail(session.user.email);
    }
  }, [session, name, email]);

  // Troubleshooter Accordion State
  const [expandedIssue, setExpandedIssue] = useState<string | null>("resume-upload");

  // Live Chat Drawer State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "bot" | "user"; text: string; time: string }>
  >([
    {
      sender: "bot",
      text: "Hi there! 👋 I'm the Hirefy Support Assistant. What can I help you troubleshoot today?",
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedId = `HRF-${Math.floor(10000 + Math.random() * 90000)}`;
      setSubmittedTicketId(generatedId);
      setIsSubmitting(false);
    }, 800);
  };

  const handleSendChatMessage = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const userMsg = {
      sender: "user" as const,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput("");

    // Automated smart response
    setTimeout(() => {
      let botReply =
        "Thank you for sharing. I've noted this detail. You can also file a ticket below if you'd like a support specialist to review your account history.";
      const lower = text.toLowerCase();
      if (lower.includes("ats") || lower.includes("score")) {
        botReply =
          "ATS scores inspect your resume structure, keyword relevance, and section headers. Make sure you use standard titles like 'Work Experience' and 'Education'.";
      } else if (lower.includes("upload") || lower.includes("file")) {
        botReply =
          "We accept PDF and DOCX files up to 10MB. If your upload failed, try converting the file to standard text-based PDF.";
      } else if (lower.includes("match") || lower.includes("job")) {
        botReply =
          "Job match scores calculate overlap between your resume keywords and employer job specs. You can switch between 'AI Resume Search' and 'Manual Search' on the Jobs page.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <DashboardHeader />

      <main className="mx-auto w-full max-w-[1360px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <section className="mb-8 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/80 bg-violet-50/80 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
            <Sparkles className="size-3.5 text-violet-600 dark:text-violet-400" />
            Support & Help Desk
          </span>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Need a hand? We&apos;re here to help.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base leading-relaxed">
            Submit a support ticket, chat with our career assistant, or solve common questions below.
          </p>
        </section>

        {/* 3 Action Pillars: Chat, Email Support, System Status */}
        <section className="mb-10 grid gap-4 sm:grid-cols-3">
          {/* Live AI Assistant Card */}
          <div className="relative overflow-hidden rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/60 to-card p-5 shadow-xs transition-all hover:border-violet-300 hover:shadow-md dark:border-violet-800/40 dark:from-violet-950/20 dark:to-card">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs">
              <Bot className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-bold text-foreground">Instant AI Assistant</h2>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Get real-time answers 24/7 for resume scoring, matching logic, and troubleshooting.
            </p>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 hover:underline dark:text-violet-400"
            >
              Start live chat
              <ArrowRight className="size-3.5" />
            </button>
          </div>

          {/* Email Support Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-violet-300 hover:shadow-md">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
              <Mail className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-bold text-foreground">Direct Email Desk</h2>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Speak directly with our engineering & candidate success team. Average response &lt; 2 hrs.
            </p>
            <a
              href="mailto:support@hirefy.ai"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              support@hirefy.ai
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* System Status Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md dark:hover:border-emerald-800">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <ShieldCheck className="size-5" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-bold text-foreground">All Systems Operational</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              AI Job Match Engine, ATS Parser, and Resume Studio services are running at 100% uptime.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Activity className="size-3 text-emerald-500" />
              Real-time telemetry active
            </span>
          </div>
        </section>

        {/* Main Content Layout: Form on Left + Solvers on Right */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          {/* Left Column: Submit a Ticket Form */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
            {submittedTicketId ? (
              <div className="py-10 text-center animate-in fade-in-50 zoom-in-95">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="size-7" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground sm:text-2xl">
                  Ticket Submitted Successfully!
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Your ticket reference is{" "}
                  <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                    #{submittedTicketId}
                  </span>
                  . A confirmation was sent to <strong className="text-foreground">{email}</strong>. Our team will get back to you shortly.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicketId(null);
                      setSubject("");
                      setMessage("");
                      setAttachedFile(null);
                    }}
                    className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    Submit another ticket
                  </button>
                  <Button asChild className="rounded-xl">
                    <Link href="/seeker/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-border/70 pb-4">
                  <h2 className="text-lg font-bold text-foreground sm:text-xl">
                    Submit a Support Ticket
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Provide the details of your inquiry or bug and we will investigate right away.
                  </p>
                </div>

                <form onSubmit={handleSubmitTicket} className="mt-6 space-y-5">
                  {/* Category Selector Chips */}
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-2">
                      Topic or Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TICKET_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            category === cat
                              ? "border border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700/60 dark:bg-violet-950/50 dark:text-violet-300"
                              : "border border-border bg-background text-muted-foreground hover:border-violet-200 hover:text-foreground dark:bg-card"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name and Email Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="ticket-name" className="block text-xs font-bold text-foreground mb-1.5">
                        Your Name
                      </label>
                      <input
                        id="ticket-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs sm:text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                    <div>
                      <label htmlFor="ticket-email" className="block text-xs font-bold text-foreground mb-1.5">
                        Email Address
                      </label>
                      <input
                        id="ticket-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs sm:text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                  </div>

                  {/* Priority & Subject */}
                  <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                    <div>
                      <label htmlFor="ticket-priority" className="block text-xs font-bold text-foreground mb-1.5">
                        Priority
                      </label>
                      <select
                        id="ticket-priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as "Normal" | "High" | "Urgent")}
                        className="h-10 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-8 text-xs sm:text-sm text-foreground outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent / Critical</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="ticket-subject" className="block text-xs font-bold text-foreground mb-1.5">
                        Subject Line
                      </label>
                      <input
                        id="ticket-subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. ATS score not updating after re-uploading resume"
                        required
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs sm:text-sm text-foreground outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                  </div>

                  {/* Message Description */}
                  <div>
                    <label htmlFor="ticket-message" className="block text-xs font-bold text-foreground mb-1.5">
                      Describe the issue
                    </label>
                    <textarea
                      id="ticket-message"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please include as many details as possible (error messages, role title, file name)..."
                      required
                      className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>

                  {/* File Attachment */}
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Attachment (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:border-violet-300 hover:bg-muted/50">
                        <UploadCloud className="size-4 text-muted-foreground" />
                        <span>Upload screenshot or document</span>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.pdf,.docx"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setAttachedFile(f.name);
                          }}
                        />
                      </label>
                      {attachedFile && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-foreground">
                          <Paperclip className="size-3 text-muted-foreground" />
                          <span>{attachedFile}</span>
                          <button
                            type="button"
                            onClick={() => setAttachedFile(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-7 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-70"
                    >
                      <Send className="size-3.5" />
                      {isSubmitting ? "Submitting Ticket..." : "Submit Support Ticket"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>

          {/* Right Column: Common Problem Solvers (Accordion) */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border/70 pb-3">
                <HelpCircle className="size-4 text-violet-600 dark:text-violet-400" />
                <h2 className="text-sm font-bold text-foreground">Common Problem Solvers</h2>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Quick fixes for the most frequent issues before filing a ticket:
              </p>

              <div className="mt-4 space-y-2">
                {COMMON_ISSUES.map((issue) => {
                  const isOpen = expandedIssue === issue.id;
                  return (
                    <div
                      key={issue.id}
                      className="rounded-xl border border-border bg-background/60 transition-colors dark:bg-card/50"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedIssue(isOpen ? null : issue.id)}
                        className="flex w-full items-center justify-between gap-2 p-3 text-left"
                      >
                        <span className="text-xs font-semibold text-foreground leading-snug">
                          {issue.title}
                        </span>
                        <ChevronDown
                          className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-violet-600" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="border-t border-border/60 p-3 pt-2 text-xs text-muted-foreground leading-relaxed animate-in fade-in-50">
                          <p>{issue.solution}</p>
                          <Link
                            href={issue.actionUrl}
                            className="mt-2.5 inline-flex items-center gap-1 font-semibold text-violet-600 hover:underline dark:text-violet-400"
                          >
                            <span>{issue.actionLabel}</span>
                            <ArrowRight className="size-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support Hours Card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                Support Operating Hours
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                Our support engineering team operates <strong>Monday to Friday, 9:00 AM – 7:00 PM EST</strong>. High & Urgent priority tickets are triaged automatically by on-call engineers.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Interactive Floating Live Chat Drawer */}
      {chatOpen && (
        <aside
          role="dialog"
          aria-label="Support Live Chat"
          className="fixed bottom-4 right-4 z-50 flex h-[500px] w-full max-w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-5"
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                <Bot className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-none">Hirefy Support Bot</p>
                <p className="mt-0.5 text-[10px] text-violet-100 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-border/70 bg-muted/30 p-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleSendChatMessage("How is my ATS score calculated?")}
              className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground hover:border-violet-300 hover:text-foreground"
            >
              ATS Score Help
            </button>
            <button
              type="button"
              onClick={() => handleSendChatMessage("My resume upload failed")}
              className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground hover:border-violet-300 hover:text-foreground"
            >
              Upload Issue
            </button>
            <button
              type="button"
              onClick={() => handleSendChatMessage("How does job matching work?")}
              className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-muted-foreground hover:border-violet-300 hover:text-foreground"
            >
              Job Match Score
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-violet-600 text-white rounded-tr-xs"
                      : "border border-border bg-muted/60 text-foreground rounded-tl-xs"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="mt-1 text-[10px] text-muted-foreground px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Chat Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            className="flex items-center gap-2 border-t border-border p-3 bg-background"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              className="h-9 flex-1 rounded-xl border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-500/20"
            />
            <button
              type="submit"
              className="flex size-9 items-center justify-center rounded-xl bg-violet-600 text-white hover:brightness-105 active:scale-95"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </aside>
      )}
    </div>
  );
}

