import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { listOpenJobsForSeeker } from "@/lib/seeker-jobs-server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as { role?: string }).role !== "CANDIDATE") {
    return NextResponse.json(
      { error: "Forbidden: Candidate access only" },
      { status: 403 }
    );
  }

  try {
    const jobs = await listOpenJobsForSeeker(session.user.id);
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("GET /api/seeker/jobs error:", error);
    return NextResponse.json(
      { error: "Failed to load open jobs." },
      { status: 500 }
    );
  }
}
