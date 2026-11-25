import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCompanyProfile } from "@/lib/company-jobs";
import {
  interviewRoundPayloadSchema,
  type InterviewModeValue,
  type InterviewResultValue,
} from "@/lib/tracking-types";

type RouteContext = {
  params: Promise<{ applicationId: string; roundId: string }>;
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

export async function PATCH(req: Request, context: RouteContext) {
  const authResult = await requireRecruiter();
  if ("error" in authResult) return authResult.error;

  const { applicationId, roundId } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const parsed = interviewRoundPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid interview details." },
      { status: 400 }
    );
  }

  try {
    const company = await getOrCreateCompanyProfile(authResult.user.id);
    const existing = await prisma.interviewRound.findFirst({
      where: {
        id: roundId,
        applicationId,
        application: {
          job: { companyId: company.id },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Interview round not found." },
        { status: 404 }
      );
    }

    const data = parsed.data;
    const round = await prisma.interviewRound.update({
      where: { id: existing.id },
      data: {
        roundName: data.roundName,
        scheduledAt: new Date(data.scheduledAt),
        mode: data.mode,
        meetingLinkOrLocation: data.meetingLinkOrLocation,
        interviewerName: data.interviewerName,
        notes: data.notes,
        feedback: data.feedback,
        result: data.result,
      },
    });

    return NextResponse.json({
      round: {
        id: round.id,
        applicationId: round.applicationId,
        roundName: round.roundName,
        scheduledAt: round.scheduledAt.toISOString(),
        mode: round.mode as InterviewModeValue,
        meetingLinkOrLocation: round.meetingLinkOrLocation,
        interviewerName: round.interviewerName,
        notes: round.notes,
        feedback: round.feedback,
        result: round.result as InterviewResultValue,
        createdAt: round.createdAt.toISOString(),
        updatedAt: round.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error(
      `PATCH /api/company/candidates/${applicationId}/interviews/${roundId} error:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to update interview round." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const authResult = await requireRecruiter();
  if ("error" in authResult) return authResult.error;

  const { applicationId, roundId } = await context.params;

  try {
    const company = await getOrCreateCompanyProfile(authResult.user.id);
    const existing = await prisma.interviewRound.findFirst({
      where: {
        id: roundId,
        applicationId,
        application: {
          job: { companyId: company.id },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Interview round not found." },
        { status: 404 }
      );
    }

    await prisma.interviewRound.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      `DELETE /api/company/candidates/${applicationId}/interviews/${roundId} error:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to delete interview round." },
      { status: 500 }
    );
  }
}
