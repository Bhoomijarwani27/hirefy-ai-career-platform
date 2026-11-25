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
  params: Promise<{ applicationId: string }>;
};

export async function POST(req: Request, context: RouteContext) {
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

  const { applicationId } = await context.params;

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
    const company = await getOrCreateCompanyProfile(session.user.id);
    const existingApp = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        job: { companyId: company.id },
      },
    });

    if (!existingApp) {
      return NextResponse.json(
        { error: "Tracked application not found." },
        { status: 404 }
      );
    }

    const data = parsed.data;
    const round = await prisma.interviewRound.create({
      data: {
        applicationId: existingApp.id,
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

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      `POST /api/company/candidates/${applicationId}/interviews error:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to add interview round." },
      { status: 500 }
    );
  }
}
