import { NextResponse } from "next/server";
import { ChatApiRequest } from "@/lib/skill-gap-types";
import { analyzeResumeHeuristically } from "@/lib/skill-gap-analysis";

const SYSTEM_PROMPT = `You are Hirefy AI, an empathetic, encouraging, and world-class Senior Career Coach and Hiring Mentor.

Your mission is to provide an easy-to-understand, modern, highly actionable career assessment skimmable in 2–3 minutes. Avoid heavy academic jargon, huge walls of text, and repetitive documentation. Speak like a supportive, direct mentor helping the candidate get hired.

### DESIRED CANDIDATE EXPERIENCE
Understand my scores → See what I am missing → Know what to do next → Follow my phased learning roadmap → Complete my 7-day starter plan.

### REPORT STRUCTURE (When user attaches resume & role)
Organize your response using these clean, friendly sections:

# 🚀 Your Personalized Career Coach Report

---

## 🎯 Your Scores at a Glance

### 1. Overall Role Readiness Score: **[X]%**
* **Your Assessed Level:** **[Early Junior | Associate / Junior | Mid-Level Professional | Senior Specialist]**
* **In Simple Terms:** [1-2 conversational sentences explaining their current standing and what practical proof they need to level up.]

### 2. Specific Job Match Score: **[Y]%** ([Job Description Match | General Role Benchmark])
* **What this means:** [1-2 sentences explaining their alignment to the target job or industry benchmark. If no job description was provided, remind them they can paste one anytime for an exact match.]

---

## 🔍 What You Have vs. What You Are Missing
> 💡 *Note: Skills marked "Missing from Resume" may simply be omitted from your resume text — you might already know some of them!*

### 🌟 Your Strongest Demonstrated Skills
* **[Skill 1]**: Clearly visible in your experience and project descriptions.
* **[Skill 2]**: Demonstrated with practical implementation context.

### ⚠️ Skills That Need More Proof (Partially Demonstrated)
* **[Skill 1]**: Mentioned on your resume, but lacks project bullets demonstrating scale or concrete impact.
* **[Skill 2]**: Listed as a skill, but employers will want to see practical applications.

### 🔴 High-Priority Skills Missing from Your Resume
* **[Skill 1]** *(Critical)*: [Why it matters for this role in plain English. What employers expect.]
* **[Skill 2]** *(Important)*: [Why it matters for this role in plain English. What employers expect.]

---

## ⚡ What Should You Do Next? (Your Top 3 Priorities)
Based on your actual background and target role requirements, focus on these top 3 high-impact actions first:

### 🎯 Priority 1: [Action Title]
* **What to learn:** [Specific skill/concept]
* **Why it matters:** [Practical value for getting hired]
* **Practical task:** [Specific practical hands-on task to complete]
* **Estimated time:** [Realistic duration, e.g., 2–4 hours]

### 🎯 Priority 2: [Action Title]
* **What to learn:** [Specific skill/concept]
* **Why it matters:** [Practical value]
* **Practical task:** [Specific hands-on exercise to complete]
* **Estimated time:** [Realistic duration, e.g., 3–5 hours]

### 🎯 Priority 3: [Action Title]
* **What to learn:** [Specific skill/concept]
* **Why it matters:** [Practical value]
* **Practical task:** [Specific practical exercise to complete]
* **Estimated time:** [Realistic duration]

---

## 🗺️ Phased Learning Roadmap

### Phase 1: Core Fundamentals & Quick Wins (Weeks 1–2)
* **Milestone:** [Short milestone goal]
* **Focus:** Master essential tools and terminology, address high-priority gaps, and set up your development environment.

### Phase 2: Practical Projects & Implementation (Weeks 3–4)
* **Milestone:** [Short milestone goal]
* **Focus:** Build production-grade features, integrate core workflows, and write automated tests or documentation.

### Phase 3: Advanced Optimization & Interview Readiness (Weeks 5–6)
* **Milestone:** [Short milestone goal]
* **Focus:** System-level optimization, architecture tradeoffs, and polishing your portfolio project.

---

## 📅 Your 7-Day Starter Plan (Check off as you complete!)
- [ ] **Day 1:** [Specific small task, e.g. install tool or set up template]
- [ ] **Day 2:** [Hands-on practical exercise]
- [ ] **Day 3:** [Analysis, workflow, or optimization task]
- [ ] **Day 4:** [Case study, architecture, or policy exercise]
- [ ] **Day 5:** [Portfolio artifact or process documentation]
- [ ] **Day 6:** [Rewrite 2 resume bullets using Google XYZ formula]
- [ ] **Day 7:** [Review progress, update resume, and review target job requirements]

---

<details>
<summary>🔍 <strong>Click to view Recommended Portfolio Project & Resume Rewrites</strong></summary>

### Recommended Project: **[Project Title]**
* **The Problem:** [Clear problem statement]
* **Recommended Stack / Tools:** \`[Modern stack or tools for this profession]\`
* **Core Deliverables:** [2-3 key deliverables]
* **What Recruiters Look For:** [Key evaluation criteria]

### High-Impact Resume Rewrites (Google XYZ Formula)
* ❌ *Before:* [Weak passive bullet from their resume]
* ✅ *After:* **[Quantified Google XYZ bullet: Accomplished X, measured by Y, by doing Z]**
</details>

---

### INTERACTION INSTRUCTIONS:
- Tailor all advice strictly to the candidate's target profession (HR, Marketing, Finance, Software Dev, Data Analytics, Product).
- Never introduce unrelated coding or software terms into HR, Finance, or Marketing reviews.
- Keep tone empowering, realistic, pragmatic, and clear. Zero fluff.`;

function formatGeminiContents(messages: { role: string; content: string }[]) {
  const turns: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  for (const m of messages) {
    const text = (m.content || "").trim();
    if (!text) continue;

    const role: "user" | "model" = m.role === "assistant" ? "model" : "user";

    // Gemini multiturn conversation MUST start with a "user" turn
    if (turns.length === 0) {
      if (role === "user") {
        turns.push({ role: "user", parts: [{ text }] });
      }
      continue;
    }

    const last = turns[turns.length - 1];
    if (last && last.role === role) {
      // Merge consecutive turns with the same role
      const firstPart = last.parts[0];
      if (firstPart) {
        firstPart.text += `\n\n${text}`;
      } else {
        last.parts.push({ text });
      }
    } else {
      turns.push({ role, parts: [{ text }] });
    }
  }

  // Ensure there is at least one user turn
  if (turns.length === 0) {
    const fallback = messages.map((m) => m.content).filter(Boolean).pop() || "Hello";
    turns.push({ role: "user", parts: [{ text: fallback }] });
  }

  return turns;
}

async function callGemini(apiKey: string, rawMessages: { role: string; content: string }[]) {
  const contents = formatGeminiContents(rawMessages);

  // Default candidate models
  let candidateModels = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro",
  ];

  // 1. Dynamic Model Discovery: Ask Google AI Studio which models are active for this key
  try {
    const listRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      {
        headers: {
          "x-goog-api-key": apiKey,
        },
      }
    );
    if (listRes.ok) {
      const listData = await listRes.json();
      const discovered = (listData.models || [])
        .filter((m: { name?: string; supportedGenerationMethods?: string[] }) =>
          m.supportedGenerationMethods?.includes("generateContent")
        )
        .map((m: { name?: string }) => (m.name || "").replace(/^models\//, ""))
        .filter(Boolean);

      if (discovered.length > 0) {
        // Prioritize flash models first for fast responses
        discovered.sort((a: string, b: string) => {
          if (a.includes("flash") && !b.includes("flash")) return -1;
          if (!a.includes("flash") && b.includes("flash")) return 1;
          return 0;
        });
        candidateModels = [...new Set([...discovered, ...candidateModels])];
      }
    } else {
      const listErr = await listRes.text();
      console.warn("Gemini ListModels check returned:", listRes.status, listErr);
    }
  } catch (err) {
    console.warn("Gemini ListModels query skipped:", err);
  }

  const attemptedErrors: string[] = [];

  // 2. Try candidate models with both query param and header authentication
  for (const model of candidateModels) {
    for (const apiVersion of ["v1beta", "v1"]) {
      try {
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const bodyPayload: Record<string, unknown> = {
          contents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 3800,
          },
        };

        if (apiVersion === "v1beta") {
          bodyPayload.system_instruction = {
            parts: [{ text: SYSTEM_PROMPT }],
          };
        }

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(bodyPayload),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          const errText = await res.text();
          attemptedErrors.push(`${model} (${apiVersion} - ${res.status}): ${errText}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        attemptedErrors.push(`${model} (${apiVersion}): ${msg}`);
      }
    }
  }

  const authOrQuotaError = attemptedErrors.find(
    (e) => e.includes("400") || e.includes("403") || e.includes("429")
  );

  throw new Error(
    authOrQuotaError ||
      attemptedErrors[0] ||
      "Unable to generate content with Gemini. Please verify your API key or check quota."
  );
}

async function callOpenAICompatible(apiKey: string, endpoint: string, model: string, messages: { role: string; content: string }[]) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.6,
      max_tokens: 3800,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`AI API returned ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

export async function POST(req: Request) {
  try {
    const body: ChatApiRequest = await req.json();
    const { messages = [], attachedResume, jobDescription, customApiKey } = body;

    const apiKey =
      customApiKey?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim() ||
      process.env.GROQ_API_KEY?.trim();

    // Extract latest candidate query
    const lastUserMsg = messages.filter((m) => m.role === "user").pop();
    const userQuery = lastUserMsg?.content || "";

    // Run Heuristic Career Coach Engine
    let heuristicSummary = "";
    let heuristicReport = "";
    if (attachedResume && attachedResume.content) {
      const analysis = analyzeResumeHeuristically(attachedResume.content, userQuery, jobDescription);
      heuristicReport = analysis.markdownReport;
      heuristicSummary = `\n\n[Grounded Resume Heuristics:
- Target Role Title: ${analysis.targetRoleTitle}
- Professional Domain: ${analysis.domain}
- Overall Readiness Score: ${analysis.overallRoleReadinessScore}/100 (Assessed Level: ${analysis.currentExperienceLevel})
- Job Match Score: ${analysis.specificJobMatchScore}/100 (${analysis.isJobDescriptionProvided ? "JD Provided" : "General Role Benchmark"})
End Grounded Heuristics]\n\n`;
    }

    // Prepare dialogue context
    const fullMessages = [...messages];
    if (attachedResume && attachedResume.content) {
      const jdContext = jobDescription ? `\n[Target Job Description]\n${jobDescription}\n[End Job Description]\n` : "";
      const resumeContext = `\n\n[Candidate Resume: ${attachedResume.name}]\n${attachedResume.content}\n[End Resume]${jdContext}${heuristicSummary}\n\n`;
      const lastUserIdx = fullMessages.map((m) => m.role).lastIndexOf("user");
      if (lastUserIdx >= 0 && fullMessages[lastUserIdx]) {
        const target = fullMessages[lastUserIdx];
        fullMessages[lastUserIdx] = {
          role: target.role,
          content: `${resumeContext}${target.content}`,
        };
      }
    }

    // If API key provided, invoke real AI
    if (apiKey) {
      try {
        if (apiKey.startsWith("sk-") && !apiKey.startsWith("sk-ant-")) {
          // OpenAI API
          const text = await callOpenAICompatible(
            apiKey,
            "https://api.openai.com/v1/chat/completions",
            "gpt-4o-mini",
            fullMessages.map((m) => ({ role: m.role, content: m.content }))
          );
          return NextResponse.json({
            success: true,
            content: text,
            provider: "openai",
          });
        } else if (apiKey.startsWith("gsk_")) {
          // Groq API
          const text = await callOpenAICompatible(
            apiKey,
            "https://api.groq.com/openai/v1/chat/completions",
            "llama-3.3-70b-versatile",
            fullMessages.map((m) => ({ role: m.role, content: m.content }))
          );
          return NextResponse.json({
            success: true,
            content: text,
            provider: "groq",
          });
        } else {
          // Google Gemini API
          const text = await callGemini(apiKey, fullMessages);
          return NextResponse.json({
            success: true,
            content: text,
            provider: "gemini",
          });
        }
      } catch (aiErr: unknown) {
        console.error("Real AI provider error:", aiErr);
        const errMsg = aiErr instanceof Error ? aiErr.message : "AI generation failed";
        return NextResponse.json(
          {
            error: `AI Provider Error: ${errMsg}. Please verify your API key or check quota.`,
            isApiKeyError: true,
          },
          { status: 502 }
        );
      }
    }

    // No API key provided: Return dynamic, high-intelligence coaching report
    const responseContent = heuristicReport || (
      `### 🚀 Your Personalized Career Coach Report\n\n` +
      `Please attach your resume using the 📎 **Attach Resume** button to generate your personalized career readiness score and actionable 7-day starter plan!\n\n` +
      `* To enable dynamic coaching dialogue and custom questions, connect a free API key via the 🔑 **API Key** button in the top bar.`
    );

    return NextResponse.json({
      success: true,
      content: responseContent,
      needsApiKey: true,
    });
  } catch (error) {
    console.error("Skill Gap Chat error:", error);
    return NextResponse.json({ error: "Failed to process chat message." }, { status: 500 });
  }
}
