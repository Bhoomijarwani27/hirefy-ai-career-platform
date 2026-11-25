import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateCompanyProfile,
  listCompanyJobs,
  serializeCompanyJob,
} from "@/lib/company-jobs";
import { jobPayloadSchema } from "@/lib/job-validation";

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

export async function GET(req: Request) {
  const authResult = await requireRecruiterSession();
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;

    const jobs = await listCompanyJobs(authResult.user.id, { search, status });
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("GET /api/company/jobs error:", error);
    return NextResponse.json(
      { error: "Failed to load company jobs." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const authResult = await requireRecruiterSession();
  if ("error" in authResult) return authResult.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

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

  try {
    const company = await getOrCreateCompanyProfile(authResult.user.id);

    const created = await prisma.job.create({
      data: {
        companyId: company.id,
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
        postedAt: data.status === "OPEN" ? new Date() : null,
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    return NextResponse.json(
      { job: serializeCompanyJob(created) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/company/jobs error:", error);
    return NextResponse.json(
      { error: "Failed to create job posting." },
      { status: 500 }
    );
  }
}
