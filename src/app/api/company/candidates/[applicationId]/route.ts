import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCompanyProfile } from "@/lib/company-jobs";
import { getTrackingDetail } from "@/lib/company-tracking";
import {
  trackingDetailsPatchSchema,
  trackingStagePatchSchema,
} from "@/lib/tracking-types";

type RouteContext = {
  params: Promise<{ applicationId: string }>;
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

export async function GET(_req: Request, context: RouteContext) {
  const authResult = await requireRecruiter();
  if ("error" in authResult) return authResult.error;

  const { applicationId } = await context.params;
  try {
    const candidate = await getTrackingDetail(authResult.user.id, applicationId);
    if (!candidate) {
      return NextResponse.json(
        { error: "Tracked application not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ candidate });
  } catch (error) {
    console.error(`GET /api/company/candidates/${applicationId} error:`, error);
    return NextResponse.json(
      { error: "Failed to load tracking details." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  const authResult = await requireRecruiter();
  if ("error" in authResult) return authResult.error;

  const { applicationId } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  try {
    const company = await getOrCreateCompanyProfile(authResult.user.id);
    const existing = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        job: { companyId: company.id },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Tracked application not found." },
        { status: 404 }
      );
    }

    // Stage transition update
    if ("status" in body && body.status !== undefined) {
      const parsed = trackingStagePatchSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Invalid stage update." },
          { status: 400 }
        );
      }

      const data = parsed.data;
      const nextStatus = data.status;
      const historyNote =
        data.note?.trim() ||
        (nextStatus === "REJECTED" && data.rejectionReason?.trim()
          ? `Rejection reason: ${data.rejectionReason.trim()}`
          : null);

      await prisma.$transaction(async (tx) => {
        await tx.jobApplication.update({
          where: { id: existing.id },
          data: {
            status: nextStatus,
            selectedAt:
              nextStatus === "SELECTED" ? new Date() : existing.selectedAt,
            rejectionReason:
              data.rejectionReason !== undefined
                ? data.rejectionReason?.trim() || null
                : existing.rejectionReason,
            offerStatus:
              data.offerStatus !== undefined
                ? data.offerStatus?.trim() || null
                : existing.offerStatus,
            recruiterNotes:
              data.recruiterNotes !== undefined
                ? data.recruiterNotes?.trim() || null
                : existing.recruiterNotes,
          },
        });

        if (existing.status !== nextStatus || historyNote) {
          await tx.applicationStageHistory.create({
            data: {
              applicationId: existing.id,
              fromStatus: existing.status,
              toStatus: nextStatus,
              note: historyNote,
              changedById: authResult.user.id,
            },
          });
        }
      });
    } else {
      // Notes / Offer Status / Rejection Reason update without stage change
      const parsed = trackingDetailsPatchSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Invalid details update." },
          { status: 400 }
        );
      }

      const data = parsed.data;
      await prisma.jobApplication.update({
        where: { id: existing.id },
        data: {
          recruiterNotes:
            data.recruiterNotes !== undefined
              ? data.recruiterNotes?.trim() || null
              : existing.recruiterNotes,
          offerStatus:
            data.offerStatus !== undefined
              ? data.offerStatus?.trim() || null
              : existing.offerStatus,
          rejectionReason:
            data.rejectionReason !== undefined
              ? data.rejectionReason?.trim() || null
              : existing.rejectionReason,
        },
      });
    }

    const updated = await getTrackingDetail(authResult.user.id, existing.id);
    return NextResponse.json({ candidate: updated });
  } catch (error) {
    console.error(`PATCH /api/company/candidates/${applicationId} error:`, error);
    return NextResponse.json(
      { error: "Failed to update candidate tracking." },
      { status: 500 }
    );
  }
}
