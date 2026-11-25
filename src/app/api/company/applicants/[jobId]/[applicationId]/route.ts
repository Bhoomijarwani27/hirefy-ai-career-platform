import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCompanyProfile } from "@/lib/company-jobs";
import { getApplicationDetailForCompany } from "@/lib/company-applications";
import { applicationStatusPatchSchema } from "@/lib/application-types";

type RouteContext = {
  params: Promise<{ jobId: string; applicationId: string }>;
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

  const { jobId, applicationId } = await context.params;

  try {
    const data = await getApplicationDetailForCompany(
      authResult.user.id,
      jobId,
      applicationId
    );
    if (!data) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error(
      `GET /api/company/applicants/${jobId}/${applicationId} error:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to load application details." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  const authResult = await requireRecruiter();
  if ("error" in authResult) return authResult.error;

  const { jobId, applicationId } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const parsed = applicationStatusPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid status value." },
      { status: 400 }
    );
  }

  try {
    const company = await getOrCreateCompanyProfile(authResult.user.id);

    const existing = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        jobId,
        job: { companyId: company.id },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.jobApplication.update({
        where: { id: existing.id },
        data: {
          status: parsed.data.status,
          selectedAt:
            parsed.data.status === "SELECTED"
              ? new Date()
              : existing.selectedAt,
        },
      });

      if (existing.status !== parsed.data.status) {
        await tx.applicationStageHistory.create({
          data: {
            applicationId: existing.id,
            fromStatus: existing.status,
            toStatus: parsed.data.status,
            changedById: authResult.user.id,
          },
        });
      }

      return app;
    });

    return NextResponse.json({
      success: true,
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error(
      `PATCH /api/company/applicants/${jobId}/${applicationId} error:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to update application status." },
      { status: 500 }
    );
  }
}
