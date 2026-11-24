import { NextResponse } from "next/server";
import { QuizEvaluateRequest, QuizAnswerEvaluation } from "@/lib/skill-gap-types";
import { evaluateQuizAnswerHeuristically } from "@/lib/skill-gap-analysis";

export async function POST(req: Request) {
  try {
    const body: QuizEvaluateRequest = await req.json();
    const {
      question,
      category,
      difficulty = "Intermediate",
      userAnswer,
      hint,
      whatInterviewerEvaluates,
      targetRole = "Software Engineer",
      customApiKey,
    } = body;

    if (!question || typeof userAnswer !== "string") {
      return NextResponse.json(
        { error: "Question and userAnswer are required." },
        { status: 400 }
      );
    }

    const apiKey =
      customApiKey?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim() ||
      process.env.GROQ_API_KEY?.trim();

    // If an API key is available, evaluate with AI model
    if (apiKey) {
      try {
        const evaluation = await evaluateWithAI(apiKey, {
          question,
          category,
          difficulty,
          userAnswer,
          hint,
          whatInterviewerEvaluates,
          targetRole,
        });
        if (evaluation) {
          return NextResponse.json({ success: true, evaluation });
        }
      } catch (aiErr) {
        console.warn("AI quiz evaluation failed, using heuristic evaluator:", aiErr);
      }
    }

    // Heuristic fallback: instant, semantic evaluation with partial credit
    const heuristicEval = evaluateQuizAnswerHeuristically(body);
    return NextResponse.json({ success: true, evaluation: heuristicEval });
  } catch (error) {
    console.error("Quiz evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer." },
      { status: 500 }
    );
  }
}

async function evaluateWithAI(
  apiKey: string,
  params: {
    question: string;
    category: string;
    difficulty: string;
    userAnswer: string;
    hint?: string;
    whatInterviewerEvaluates?: string;
    targetRole: string;
  }
): Promise<QuizAnswerEvaluation | null> {
  const prompt = `You are an expert hiring manager, domain specialist, and interviewer for the target role "${params.targetRole}", evaluating a candidate's answer in an interactive practice quiz.

Target Role: ${params.targetRole}
Question Category: ${params.category} (${params.difficulty})
Question: "${params.question}"
Candidate Answer: "${params.userAnswer}"
${params.hint ? `Key Concept / Hint: ${params.hint}` : ""}
${params.whatInterviewerEvaluates ? `What Interviewer Evaluates: ${params.whatInterviewerEvaluates}` : ""}

CRITICAL INSTRUCTIONS:
1. Evaluate the actual knowledge and substance tailored strictly to "${params.targetRole}", NOT just whether specific keywords appear verbatim. Accept correct answers with different phrasing.
2. For partially correct answers:
   - Mark status as "partially_correct".
   - State clearly what part is correct and specifically explain what key detail, nuance, or trade-off is missing.
   - Do NOT mark a partially correct answer as completely incorrect without explanation.
3. Keep the feedback concise, encouraging, and clear. Do NOT generate a lengthy report.
4. Output STRICT JSON format only (no markdown, no backticks, no extra text):
{
  "status": "correct" | "partially_correct" | "incorrect",
  "statusLabel": "Correct" | "Partially Correct" | "Needs Improvement",
  "score": <number between 0 and 10>,
  "conceptExplanation": "<concise 1-2 sentence explanation of the underlying concept for this profession>",
  "userAnswerReview": "<What was right: ... What was missing: ...>",
  "exampleOrCorrection": "<short practical example, recommended workflow, or correction tailored to ${params.targetRole}>",
  "topicToRevise": "<topic name if needs revision, otherwise empty string>"
}`;

  let jsonText = "";

  if (apiKey.startsWith("sk-") && !apiKey.startsWith("sk-ant-")) {
    // OpenAI API
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      jsonText = data?.choices?.[0]?.message?.content || "";
    }
  } else if (apiKey.startsWith("gsk_")) {
    // Groq API
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      jsonText = data?.choices?.[0]?.message?.content || "";
    }
  } else {
    // Google Gemini API
    const candidateModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000,
            },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (jsonText) break;
        }
      } catch (err) {
        console.warn(`Gemini quiz model ${model} failed:`, err);
      }
    }
  }

  if (!jsonText) return null;

  // Clean and parse JSON response
  const cleaned = jsonText.replace(/```json/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  if (parsed && typeof parsed.status === "string" && parsed.conceptExplanation) {
    return {
      status: ["correct", "partially_correct", "incorrect"].includes(parsed.status)
        ? parsed.status
        : "partially_correct",
      statusLabel:
        parsed.statusLabel ||
        (parsed.status === "correct"
          ? "Correct"
          : parsed.status === "partially_correct"
          ? "Partially Correct"
          : "Needs Improvement"),
      score: typeof parsed.score === "number" ? parsed.score : 7,
      conceptExplanation: parsed.conceptExplanation,
      userAnswerReview: parsed.userAnswerReview || "Your answer was reviewed against technical expectations.",
      exampleOrCorrection: parsed.exampleOrCorrection || "",
      topicToRevise: parsed.topicToRevise || (parsed.status !== "correct" ? params.category : undefined),
    };
  }

  return null;
}
