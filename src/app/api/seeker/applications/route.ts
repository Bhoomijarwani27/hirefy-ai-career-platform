import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { listSeekerApplications } from "@/lib/seeker-jobs-server";

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
    const applications = await listSeekerApplications(session.user.id);
    return NextResponse.json({ applications });
  } catch (error) {
    console.error("GET /api/seeker/applications error:", error);
    return NextResponse.json(
      { error: "Failed to load your applications." },
      { status: 500 }
    );
  }
}
