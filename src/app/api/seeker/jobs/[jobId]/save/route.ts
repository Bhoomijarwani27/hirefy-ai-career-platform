import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCandidateProfile } from "@/lib/seeker-jobs-server";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

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

export async function POST(_req: Request, context: RouteContext) {
  const authResult = await requireCandidate();
  if ("error" in authResult) return authResult.error;

  const { jobId } = await context.params;
  try {
    const candidate = await getOrCreateCandidateProfile(authResult.user.id);
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true },
    });
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    await prisma.savedJob.upsert({
      where: {
        candidateId_jobId: { candidateId: candidate.id, jobId: job.id },
      },
      create: { candidateId: candidate.id, jobId: job.id },
      update: {},
    });

    return NextResponse.json({ success: true, isSaved: true });
  } catch (error) {
    console.error(`POST /api/seeker/jobs/${jobId}/save error:`, error);
    return NextResponse.json(
      { error: "Failed to save job." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const authResult = await requireCandidate();
  if ("error" in authResult) return authResult.error;

  const { jobId } = await context.params;
  try {
    const candidate = await getOrCreateCandidateProfile(authResult.user.id);
    await prisma.savedJob.deleteMany({
      where: { candidateId: candidate.id, jobId },
    });
    return NextResponse.json({ success: true, isSaved: false });
  } catch (error) {
    console.error(`DELETE /api/seeker/jobs/${jobId}/save error:`, error);
    return NextResponse.json(
      { error: "Failed to remove saved job." },
      { status: 500 }
    );
  }
}
