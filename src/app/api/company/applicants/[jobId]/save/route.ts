import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCompanyProfile } from "@/lib/company-jobs";
import { saveCandidateBodySchema } from "@/lib/application-types";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

async function requireRecruiter() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if ((session.user as { role?: string }).role !== "RECRUITER") {
    return {
      error: NextResponse.json(
        { error: "Forbidden: Recruiter access only" },
        { status: 403 }
      ),
    };
  }
  return { user: session.user };
}

/**
 * Job-specific candidate save (JobSavedCandidate).
 * Completely separate from CompanySavedCandidate and does not shortlist.
 */
export async function POST(req: Request, context: RouteContext) {
  const authResult = await requireRecruiter();
  if ("error" in authResult) return authResult.error;

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

  const parsed = saveCandidateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request." },
      { status: 400 }
    );
  }

  try {
    const company = await getOrCreateCompanyProfile(authResult.user.id);
    const job = await prisma.job.findFirst({
      where: { id: jobId, companyId: company.id },
      select: { id: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // Ensure candidate applied or exists
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: parsed.data.candidateId },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found." },
        { status: 404 }
      );
    }

    await prisma.jobSavedCandidate.upsert({
      where: {
        jobId_candidateId: {
          jobId: job.id,
          candidateId: candidate.id,
        },
      },
      create: {
        companyId: company.id,
        jobId: job.id,
        candidateId: candidate.id,
      },
      update: {},
    });

    return NextResponse.json({ success: true, savedForJob: true });
  } catch (error) {
    console.error(`POST /api/company/applicants/${jobId}/save error:`, error);
    return NextResponse.json(
      { error: "Failed to save candidate for this job." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  const authResult = await requireRecruiter();
  if ("error" in authResult) return authResult.error;

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

  const parsed = saveCandidateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request." },
      { status: 400 }
    );
  }

  try {
    const company = await getOrCreateCompanyProfile(authResult.user.id);

    await prisma.jobSavedCandidate.deleteMany({
      where: {
        companyId: company.id,
        jobId,
        candidateId: parsed.data.candidateId,
      },
    });

    return NextResponse.json({ success: true, savedForJob: false });
  } catch (error) {
    console.error(`DELETE /api/company/applicants/${jobId}/save error:`, error);
    return NextResponse.json(
      { error: "Failed to remove saved candidate from this job." },
      { status: 500 }
    );
  }
}
