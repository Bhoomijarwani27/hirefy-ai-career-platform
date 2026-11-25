import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getJobApplicationsForCompany } from "@/lib/company-applications";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
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

  const { jobId } = await context.params;

  try {
    const data = await getJobApplicationsForCompany(session.user.id, jobId);
    if (!data) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error(`GET /api/company/applicants/${jobId} error:`, error);
    return NextResponse.json(
      { error: "Failed to load job applications." },
      { status: 500 }
    );
  }
}
