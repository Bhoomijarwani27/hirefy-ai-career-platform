import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getJobApplicationsForCompany } from "@/lib/company-applications";
import type { AiRankedCandidateDTO } from "@/lib/application-types";
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from "@/lib/job-validation";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

const aiRankingItemSchema = z.object({
  applicationId: z.string(),
  matchScore: z.number().min(0).max(100),
  matchingSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  relevantExperience: z.string().default("Not specified"),
  explanation: z.string(),
});

const aiRankingResponseSchema = z.object({
  rankings: z.array(aiRankingItemSchema),
});

export async function POST(_req: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "RECRUITER") {
    return NextResponse.json(
      { error: "Forbidden: Recruiter access only" },
      { status: 403 }
    );
  }

  const { jobId } = await context.params;

  const rawApiKey = process.env.GEMINI_API_KEY?.trim();
  if (!rawApiKey || !rawApiKey.startsWith("AIza")) {
    return NextResponse.json(
      {
        error:
          "Gemini AI is not configured. Please set a valid GEMINI_API_KEY in your environment.",
      },
      { status: 503 }
    );
  }

  try {
    const data = await getJobApplicationsForCompany(session.user.id, jobId);
    if (!data) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const { job, applications } = data;
    if (applications.length === 0) {
      return NextResponse.json(
        { error: "No applicants have applied to this job yet." },
        { status: 400 }
      );
    }

    const applicantProfiles = applications.map((app) => ({
      applicationId: app.id,
      candidateId: app.candidateId,
      candidateName: app.candidateName,
      title: app.candidateTitle || "",
      bio: app.candidateBio || "",
      skills: app.skills,
      experienceSummary: app.experienceSummary || "",
      educationSummary: app.educationSummary || "",
      resumeText: app.resumeText ? app.resumeText.slice(0, 4000) : "",
      resumeStructured: app.resumeData
        ? {
            experience: app.resumeData.experience?.slice(0, 5),
            education: app.resumeData.education?.slice(0, 3),
            projects: app.resumeData.projects?.slice(0, 4),
            skills: app.resumeData.skills,
          }
        : null,
      coverLetter: app.coverLetter ? app.coverLetter.slice(0, 1500) : "",
    }));

    const prompt = `You are an objective, fair AI recruiting assistant for Hirefy.
Evaluate ONLY the provided applicants against the requirements of the SINGLE selected job below.

STRICT RULES:
1. Base your evaluation STRICTLY on the actual candidate application and resume data provided below.
2. NEVER invent skills, degrees, companies, years of experience, or facts not present in the applicant data.
3. Evaluate each applicant on:
   - Required skills
   - Relevant experience (against min/max years and level)
   - Education and qualifications
   - Alignment with job description and responsibilities
   - Preferred skills
4. Sort applicants from highest matchScore to lowest matchScore (0 to 100 integer).
5. Include EVERY applicant's exact applicationId in the response.
6. Return ONLY valid JSON matching this schema:
{
  "rankings": [
    {
      "applicationId": string,
      "matchScore": number,
      "matchingSkills": string[],
      "missingSkills": string[],
      "relevantExperience": string,
      "explanation": string
    }
  ]
}

SELECTED JOB:
- Title: ${job.title}
- Department: ${job.department}
- Employment Type: ${EMPLOYMENT_TYPE_LABELS[job.employmentType]}
- Experience Level: ${EXPERIENCE_LEVEL_LABELS[job.experienceLevel]} (${job.minExperience}${job.maxExperience !== null ? `–${job.maxExperience}` : "+"} years)
- Required Skills: ${job.requiredSkills.join(", ") || "None listed"}
- Preferred Skills: ${job.preferredSkills.join(", ") || "None listed"}
- Qualifications: ${job.qualifications}
- Responsibilities: ${job.responsibilities}
- Description: ${job.description}

APPLICANTS FOR THIS JOB (${applicantProfiles.length}):
${JSON.stringify(applicantProfiles, null, 2)}`;

    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    let parsedJson: z.infer<typeof aiRankingResponseSchema> | null = null;
    let lastError = "Gemini AI failed to generate a valid ranking.";

    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(rawApiKey)}`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": rawApiKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 6000,
              responseMimeType: "application/json",
            },
          }),
        });

        if (!res.ok) {
          lastError = `Gemini API error (${res.status})`;
          continue;
        }

        const resData = await res.json();
        const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        const cleaned = rawText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        const obj = JSON.parse(cleaned);
        const validated = aiRankingResponseSchema.safeParse(obj);
        if (validated.success) {
          parsedJson = validated.data;
          break;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : lastError;
      }
    }

    if (!parsedJson) {
      return NextResponse.json({ error: lastError }, { status: 502 });
    }

    const appById = new Map(applications.map((a) => [a.id, a]));
    const verifiedRankings: AiRankedCandidateDTO[] = parsedJson.rankings
      .filter((item) => appById.has(item.applicationId))
      .sort((a, b) => b.matchScore - a.matchScore)
      .map((item, idx) => {
        const app = appById.get(item.applicationId)!;
        return {
          rank: idx + 1,
          applicationId: app.id,
          candidateId: app.candidateId,
          candidateName: app.candidateName,
          matchScore: Math.round(item.matchScore),
          matchingSkills: item.matchingSkills,
          missingSkills: item.missingSkills,
          relevantExperience: item.relevantExperience,
          explanation: item.explanation,
        };
      });

    return NextResponse.json({
      success: true,
      aiAssisted: true,
      jobId: job.id,
      rankings: verifiedRankings,
    });
  } catch (error) {
    console.error(`POST /api/company/applicants/${jobId}/ai-rank error:`, error);
    return NextResponse.json(
      { error: "Failed to run AI ranking." },
      { status: 500 }
    );
  }
}
