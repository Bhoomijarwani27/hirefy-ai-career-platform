import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCompanyProfile } from "@/lib/company-jobs";
import { listCompanySavedCandidates } from "@/lib/company-applications";
import { saveCandidateBodySchema } from "@/lib/application-types";

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
 * Company-wide general saved candidates (CompanySavedCandidate).
 * Independent of any specific job and does not shortlist.
 */
export async function GET() {
  const authResult = await requireRecruiter();
  if ("error" in authResult) return authResult.error;

  try {
    const candidates = await listCompanySavedCandidates(authResult.user.id);
    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("GET /api/company/saved-candidates error:", error);
    return NextResponse.json(
      { error: "Failed to load saved candidates." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const authResult = await requireRecruiter();
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

  const parsed = saveCandidateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request." },
      { status: 400 }
    );
  }

  try {
    const company = await getOrCreateCompanyProfile(authResult.user.id);

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

    await prisma.companySavedCandidate.upsert({
      where: {
        companyId_candidateId: {
          companyId: company.id,
          candidateId: candidate.id,
        },
      },
      create: {
        companyId: company.id,
        candidateId: candidate.id,
      },
      update: {},
    });

    return NextResponse.json({ success: true, savedGenerally: true });
  } catch (error) {
    console.error("POST /api/company/saved-candidates error:", error);
    return NextResponse.json(
      { error: "Failed to save candidate generally." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const authResult = await requireRecruiter();
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

  const parsed = saveCandidateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request." },
      { status: 400 }
    );
  }

  try {
    const company = await getOrCreateCompanyProfile(authResult.user.id);

    await prisma.companySavedCandidate.deleteMany({
      where: {
        companyId: company.id,
        candidateId: parsed.data.candidateId,
      },
    });

    return NextResponse.json({ success: true, savedGenerally: false });
  } catch (error) {
    console.error("DELETE /api/company/saved-candidates error:", error);
    return NextResponse.json(
      { error: "Failed to remove candidate from saved list." },
      { status: 500 }
    );
  }
}
