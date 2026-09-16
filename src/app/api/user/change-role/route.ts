import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const allowedRoles = ["CANDIDATE", "RECRUITER"] as const;

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newRole } = await req.json();

  if (!allowedRoles.includes(newRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: newRole },
  });

  if (newRole === "RECRUITER") {
    await prisma.companyProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    });
  } else {
    await prisma.candidateProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    });
  }

  return NextResponse.json({ success: true, role: newRole });
}
