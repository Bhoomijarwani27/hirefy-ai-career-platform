import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { listPipelineForJob } from "@/lib/company-tracking";

export async function GET(req: Request) {
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

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json(
      { error: "jobId query parameter is required." },
      { status: 400 }
    );
  }

  try {
    const candidates = await listPipelineForJob(session.user.id, jobId);
    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("GET /api/company/candidates error:", error);
    return NextResponse.json(
      { error: "Failed to load recruitment pipeline." },
      { status: 500 }
    );
  }
}
