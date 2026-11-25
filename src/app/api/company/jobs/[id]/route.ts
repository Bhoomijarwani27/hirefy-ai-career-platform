import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getCompanyJobById,
  getOrCreateCompanyProfile,
  serializeCompanyJob,
} from "@/lib/company-jobs";
import { jobPayloadSchema, jobStatusPatchSchema } from "@/lib/job-validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function requireRecruiterSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "RECRUITER") {
    return { error: NextResponse.json({ error: "Forbidden: Recruiter access only" }, { status: 403 }) };
  }

  return { user: session.user };
}

export async function GET(_req: Request, context: RouteContext) {
  const authResult = await requireRecruiterSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;
  try {
    const job = await getCompanyJobById(authResult.user.id, id);
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch (error) {
    console.error(`GET /api/company/jobs/${id} error:`, error);
    return NextResponse.json({ error: "Failed to load job." }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  const authResult = await requireRecruiterSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  try {
    const company = await getOrCreateCompanyProfile(authResult.user.id);
    const existing = await prisma.job.findFirst({
      where: { id, companyId: company.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    // Status-only patch (Open / Close / Draft toggle)
    const keys = Object.keys(body);
    if (keys.length === 1 && keys[0] === "status") {
      const statusParsed = jobStatusPatchSchema.safeParse(body);
      if (!statusParsed.success) {
        return NextResponse.json({ error: "Invalid job status." }, { status: 400 });
      }

      const nextStatus = statusParsed.data.status;

      // If trying to publish a Draft to OPEN, validate existing job fields meet publish requirements
      if (nextStatus === "OPEN" && existing.status === "DRAFT") {
        const checkPublish = jobPayloadSchema.safeParse({
          title: existing.title,
          department: existing.department,
          description: existing.description,
          openings: existing.openings,
          employmentType: existing.employmentType,
          workMode: existing.workMode,
          location: existing.location,
          experienceLevel: existing.experienceLevel,
          minExperience: existing.minExperience,
          maxExperience: existing.maxExperience,
          salaryRange: existing.salaryRange,
          requiredSkills: existing.requiredSkills,
          qualifications: existing.qualifications,
          responsibilities: existing.responsibilities,
          preferredSkills: existing.preferredSkills,
          deadline: existing.deadline ? existing.deadline.toISOString().split("T")[0] : null,
          applicationInstructions: existing.applicationInstructions,
          status: "OPEN",
        });

        if (!checkPublish.success) {
          return NextResponse.json(
            {
              error:
                checkPublish.error.issues[0]?.message ||
                "Please edit and complete all required fields before publishing this draft.",
            },
            { status: 400 }
          );
        }
      }

      const updated = await prisma.job.update({
        where: { id: existing.id },
        data: {
          status: nextStatus,
          postedAt: nextStatus === "OPEN" && !existing.postedAt ? new Date() : existing.postedAt,
        },
        include: {
          _count: { select: { applications: true } },
        },
      });

      return NextResponse.json({ job: serializeCompanyJob(updated) });
    }

    // Full job update
    const parsed = jobPayloadSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] ? String(issue.path[0]) : "form";
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
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
    const updated = await prisma.job.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        department: data.department,
        description: data.description,
        openings: data.openings,
        employmentType: data.employmentType,
        workMode: data.workMode,
        location: data.location,
        experienceLevel: data.experienceLevel,
        minExperience: data.minExperience,
        maxExperience: data.maxExperience ?? null,
        salaryRange: data.salaryRange,
        requiredSkills: data.requiredSkills,
        qualifications: data.qualifications,
        responsibilities: data.responsibilities,
        preferredSkills: data.preferredSkills,
        deadline: data.deadline ? new Date(data.deadline) : null,
        applicationInstructions: data.applicationInstructions,
        status: data.status,
        postedAt:
          data.status === "OPEN" && !existing.postedAt
            ? new Date()
            : existing.postedAt,
      },
      include: {
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({ job: serializeCompanyJob(updated) });
  } catch (error) {
    console.error(`PATCH /api/company/jobs/${id} error:`, error);
    return NextResponse.json({ error: "Failed to update job." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const authResult = await requireRecruiterSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await context.params;

  try {
    const company = await getOrCreateCompanyProfile(authResult.user.id);
    const existing = await prisma.job.findFirst({
      where: { id, companyId: company.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    await prisma.job.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/company/jobs/${id} error:`, error);
    return NextResponse.json({ error: "Failed to delete job." }, { status: 500 });
  }
}
