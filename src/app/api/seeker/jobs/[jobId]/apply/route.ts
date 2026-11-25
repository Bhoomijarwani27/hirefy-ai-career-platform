import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCandidateProfile } from "@/lib/seeker-jobs-server";
import { seekerApplySchema } from "@/lib/seeker-jobs-types";
import type { ResumeData } from "@/lib/resume-storage";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "CANDIDATE") {
    return NextResponse.json(
      { error: "Forbidden: Candidate access only" },
      { status: 403 }
    );
  }

  const { jobId } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const parsed = seekerApplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid application payload." },
      { status: 400 }
    );
  }

  try {
    const candidate = await getOrCreateCandidateProfile(session.user.id);
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, title: true, status: true, deadline: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    if (job.status !== "OPEN") {
      return NextResponse.json(
        { error: "This job is no longer accepting new applications." },
        { status: 400 }
      );
    }

    if (job.deadline) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      if (job.deadline < startOfToday) {
        return NextResponse.json(
          { error: "The application deadline for this job has passed." },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobId_candidateId: {
          jobId: job.id,
          candidateId: candidate.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied to this job." },
        { status: 409 }
      );
    }

    const rd = (parsed.data.resumeData ?? null) as ResumeData | null;
    const experienceSummary = rd?.experience?.length
      ? rd.experience
          .slice(0, 4)
          .map((e) =>
            [
              e.role,
              e.company,
              e.startDate ? `${e.startDate}–${e.endDate || "Present"}` : "",
            ]
              .filter(Boolean)
              .join(" • ")
          )
          .filter(Boolean)
          .join("\n")
      : candidate.experience;

    const educationSummary = rd?.education?.length
      ? rd.education
          .slice(0, 3)
          .map((ed) =>
            [ed.degree, ed.institution, ed.graduationDate]
              .filter(Boolean)
              .join(" • ")
          )
          .filter(Boolean)
          .join("\n")
      : candidate.education;

    const application = await prisma.$transaction(async (tx) => {
      // Sync candidate profile with latest resume snapshot if provided
      if (rd || (parsed.data.skills && parsed.data.skills.length > 0)) {
        await tx.candidateProfile.update({
          where: { id: candidate.id },
          data: {
            skills:
              parsed.data.skills && parsed.data.skills.length > 0
                ? parsed.data.skills
                : candidate.skills,
            experience: experienceSummary || candidate.experience,
            education: educationSummary || candidate.education,
            resumeText: parsed.data.resumeText || candidate.resumeText,
            resumeData: rd ? (rd as object) : undefined,
          },
        });
      }

      const created = await tx.jobApplication.create({
        data: {
          jobId: job.id,
          candidateId: candidate.id,
          status: "APPLIED",
          coverLetter: parsed.data.coverLetter || null,
          resumeText: parsed.data.resumeText || candidate.resumeText,
          resumeData: rd ? (rd as object) : undefined,
          experienceSummary: experienceSummary || null,
          educationSummary: educationSummary || null,
        },
      });

      await tx.applicationStageHistory.create({
        data: {
          applicationId: created.id,
          fromStatus: null,
          toStatus: "APPLIED",
          note: "Candidate submitted application",
          changedById: session.user.id,
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        success: true,
        applicationId: application.id,
        status: application.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`POST /api/seeker/jobs/${jobId}/apply error:`, error);
    return NextResponse.json(
      { error: "Failed to submit application." },
      { status: 500 }
    );
  }
}
