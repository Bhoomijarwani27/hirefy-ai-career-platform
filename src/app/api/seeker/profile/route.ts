import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCandidateProfile } from "@/lib/seeker-jobs-server";
import { seekerProfileSchema } from "@/lib/seeker-profile";
import { getRecommendedJobsForCandidate } from "@/lib/seeker-profile-server";

async function requireCandidate() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if ((session.user as { role?: string }).role !== "CANDIDATE") {
    return {
      error: NextResponse.json(
        { error: "Forbidden: Candidate access only" },
        { status: 403 }
      ),
    };
  }
  return { user: session.user };
}

export async function GET() {
  const authResult = await requireCandidate();
  if ("error" in authResult) return authResult.error;

  try {
    const data = await getRecommendedJobsForCandidate(authResult.user.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/seeker/profile error:", error);
    return NextResponse.json(
      { error: "Failed to load candidate profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const authResult = await requireCandidate();
  if ("error" in authResult) return authResult.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const parsed = seekerProfileSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] ? String(issue.path[0]) : "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message || "Validation failed.",
        fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const existing = await getOrCreateCandidateProfile(authResult.user.id);

    await prisma.$transaction(async (tx) => {
      if (data.name) {
        await tx.user.update({
          where: { id: authResult.user.id },
          data: { name: data.name },
        });
      }

      await tx.candidateProfile.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          bio: data.bio || null,
          skills: data.skills,
          experience: data.experience || null,
          education: data.education || null,
          location: data.location || null,
          preferredWorkMode: data.preferredWorkMode,
          preferredEmploymentType: data.preferredEmploymentType,
          experienceYears: data.experienceYears ?? null,
          expectedSalary: data.expectedSalary || null,
        },
      });
    });

    const updated = await getRecommendedJobsForCandidate(authResult.user.id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/seeker/profile error:", error);
    return NextResponse.json(
      { error: "Failed to save candidate profile." },
      { status: 500 }
    );
  }
}
