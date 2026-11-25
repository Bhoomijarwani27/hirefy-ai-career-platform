import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCompanyProfile } from "@/lib/company-jobs";
import {
  companyProfileSchema,
  serializeCompanyProfile,
} from "@/lib/company-profile";
import { getCompanyProfileDTO } from "@/lib/company-profile-server";

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

export async function GET() {
  const authResult = await requireRecruiter();
  if ("error" in authResult) return authResult.error;

  try {
    const profile = await getCompanyProfileDTO(authResult.user.id);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("GET /api/company/profile error:", error);
    return NextResponse.json(
      { error: "Failed to load company profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const authResult = await requireRecruiter();
  if ("error" in authResult) return authResult.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const parsed = companyProfileSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] ? String(issue.path[0]) : "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
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
    const existing = await getOrCreateCompanyProfile(authResult.user.id);

    const updated = await prisma.companyProfile.update({
      where: { id: existing.id },
      data: {
        companyName: data.companyName,
        logoUrl: data.logoUrl,
        industry: data.industry,
        companySize: data.companySize,
        foundedYear: data.foundedYear ?? null,
        website: data.website,
        officialEmail: data.officialEmail,
        contactNumber: data.contactNumber,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
        about: data.about,
        missionVision: data.missionVision,
        culture: data.culture,
        benefitsEnvironment: data.benefitsEnvironment,
      },
    });

    return NextResponse.json({ profile: serializeCompanyProfile(updated) });
  } catch (error) {
    console.error("PATCH /api/company/profile error:", error);
    return NextResponse.json(
      { error: "Failed to save company profile." },
      { status: 500 }
    );
  }
}
