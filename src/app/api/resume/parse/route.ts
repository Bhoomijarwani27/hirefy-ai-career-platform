import { NextResponse } from "next/server";
import { extractTextFromPdfBuffer } from "@/lib/pdf-parser";
import { parseResumeText } from "@/lib/resume-storage";

export const runtime = "nodejs";

const RESUME_PARSE_SYSTEM_PROMPT = `You are a world-class ATS and Harvard FAS resume parser.
Your task is to take unstructured resume text, markdown, or a resume PDF document and parse EVERY SINGLE DETAIL into a structured JSON object.

CRITICAL INSTRUCTIONS:
1. DO NOT truncate or omit any experience, company, bullet point, project, skill, or education entry.
2. If the user lists accomplishments or responsibilities under a job, keep every single one as an item in the "bullets" array.
3. Clean up formatting, fix typos, and ensure bullet points start with strong action verbs where appropriate.
4. Categorize skills into technicalLanguages (programming languages), frameworksAndTools (frameworks, databases, libraries, clouds), and softSkills (methodologies, competencies, communication).
5. Extract contact info: fullName, email, phone, location, linkedin, and githubOrPortfolio.
6. Return ONLY a valid JSON object matching the requested schema. No conversational intro, no markdown backticks, no comments.

Target JSON Schema:
{
  "title": string,
  "contact": {
    "fullName": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string,
    "githubOrPortfolio": string
  },
  "education": [
    {
      "id": string,
      "institution": string,
      "degree": string,
      "location": string,
      "graduationDate": string,
      "gpa": string,
      "details": string
    }
  ],
  "experience": [
    {
      "id": string,
      "role": string,
      "company": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "bullets": string[]
    }
  ],
  "projects": [
    {
      "id": string,
      "title": string,
      "techStack": string,
      "link": string,
      "bullets": string[]
    }
  ],
  "skills": {
    "technicalLanguages": string,
    "frameworksAndTools": string,
    "softSkills": string
  },
  "leadership": [
    {
      "id": string,
      "role": string,
      "organization": string,
      "date": string,
      "description": string
    }
  ]
}`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, pdfBase64, defaultName, defaultEmail } = body;

    const hasText = typeof text === "string" && text.trim().length > 0;
    const hasPdf = typeof pdfBase64 === "string" && pdfBase64.length > 50;

    if (!hasText && !hasPdf) {
      return NextResponse.json({ success: false, error: "No text or PDF provided" }, { status: 400 });
    }

    const cleanPdfBase64 = hasPdf ? pdfBase64.replace(/^data:[^;]+;base64,/, "").trim() : null;

    // 1. If PDF is provided, extract plain text using our universal PDF engine
    let extractedPdfText = "";
    if (cleanPdfBase64) {
      try {
        const pdfBuffer = Buffer.from(cleanPdfBase64, "base64");
        extractedPdfText = extractTextFromPdfBuffer(pdfBuffer);
      } catch (pdfErr) {
        console.warn("Server PDF buffer extraction error:", pdfErr);
      }
    }

    const effectiveText = hasText ? text : extractedPdfText;

    // 2. Check for AI keys
    const rawApiKey =
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim() ||
      process.env.GROQ_API_KEY?.trim();

    // Verify valid API key format:
    // Gemini keys start with "AIza"
    // OpenAI keys start with "sk-"
    // Groq keys start with "gsk_"
    const isGeminiKey = rawApiKey && rawApiKey.startsWith("AIza");
    const isOpenAiKey = rawApiKey && rawApiKey.startsWith("sk-");
    const isGroqKey = rawApiKey && rawApiKey.startsWith("gsk_");

    // 3. Try Gemini AI if valid key is available
    if (isGeminiKey) {
      const candidateModels = [
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
      ];

      const parts: Array<Record<string, unknown>> = [];

      if (cleanPdfBase64) {
        parts.push({
          inlineData: {
            mimeType: "application/pdf",
            data: cleanPdfBase64,
          },
        });
        parts.push({
          text: `${RESUME_PARSE_SYSTEM_PROMPT}\n\nCandidate Name Hint: ${defaultName || ""}\nCandidate Email Hint: ${defaultEmail || ""}\n\nPlease parse this uploaded resume PDF thoroughly into JSON.${extractedPdfText ? `\n\nEXTRACTED TEXT:\n${extractedPdfText}` : ""}`,
        });
      } else {
        parts.push({
          text: `${RESUME_PARSE_SYSTEM_PROMPT}\n\nCandidate Name Hint: ${defaultName || ""}\nCandidate Email Hint: ${defaultEmail || ""}\n\nRESUME TEXT TO PARSE:\n${effectiveText}`,
        });
      }

      for (const model of candidateModels) {
        for (const apiVersion of ["v1beta", "v1"]) {
          try {
            const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${encodeURIComponent(rawApiKey)}`;
            const payload = {
              contents: [{ role: "user", parts }],
              generationConfig: {
                temperature: 0.15,
                maxOutputTokens: 6000,
                responseMimeType: "application/json",
              },
            };

            const res = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": rawApiKey,
              },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              const resData = await res.json();
              const rawJsonText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawJsonText) {
                const cleaned = rawJsonText
                  .replace(/^```json\s*/i, "")
                  .replace(/^```\s*/i, "")
                  .replace(/\s*```$/i, "")
                  .trim();
                const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  return NextResponse.json({
                    success: true,
                    data: parsed,
                    extractedText: extractedPdfText,
                    fromAi: true,
                  });
                }
              }
            }
          } catch (err) {
            console.warn(`Gemini attempt failed on ${model}:`, err);
          }
        }
      }
    }

    // 4. Try OpenAI or Groq if valid key is available
    if ((isOpenAiKey || isGroqKey) && effectiveText) {
      const endpoint = isGroqKey
        ? "https://api.groq.com/openai/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";
      const model = isGroqKey ? "llama-3.3-70b-versatile" : "gpt-4o-mini";

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${rawApiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: RESUME_PARSE_SYSTEM_PROMPT },
              {
                role: "user",
                content: `Candidate Name Hint: ${defaultName || ""}\nCandidate Email Hint: ${defaultEmail || ""}\n\nRESUME TEXT TO PARSE:\n${effectiveText}`,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          }),
        });

        if (res.ok) {
          const resData = await res.json();
          const content = resData?.choices?.[0]?.message?.content;
          if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              return NextResponse.json({
                success: true,
                data: parsed,
                extractedText: extractedPdfText,
                fromAi: true,
              });
            }
          }
        }
      } catch (err) {
        console.warn("OpenAI/Groq attempt failed:", err);
      }
    }

    // 5. Robust Local Parser on extracted or provided text
    if (effectiveText && effectiveText.trim().length >= 15) {
      const parsed = parseResumeText(effectiveText, defaultName, defaultEmail);
      return NextResponse.json({
        success: true,
        data: parsed,
        extractedText: effectiveText,
        fallback: true,
      });
    }

    // 6. If no readable text could be extracted from the PDF
    if (hasPdf && (!effectiveText || effectiveText.trim().length < 15)) {
      return NextResponse.json({
        success: false,
        error: "This PDF contains scanned image data or unreadable font encoding. Please copy and paste your resume text directly into the box.",
      });
    }

    return NextResponse.json({
      success: false,
      error: "Could not parse resume. Please paste text directly.",
    });
  } catch (err) {
    console.error("Resume parse API critical error:", err);
    return NextResponse.json(
      { success: false, error: "Internal parsing error. Please paste text directly." },
      { status: 500 }
    );
  }
}
