import { auth } from "@/lib/auth";
import { ensureRoleProfile } from "@/lib/user-profile";
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

  let newRole: unknown;
  try {
    const body = await req.json();
    newRole = body.newRole;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!allowedRoles.includes(newRole as (typeof allowedRoles)[number])) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const role = newRole as (typeof allowedRoles)[number];

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });

    await ensureRoleProfile(session.user.id, role);

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error(
      `Failed to update role for user ${session.user.id} to ${role}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
