import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/auth-utils";

export async function ensureRoleProfile(
  userId: string,
  role: Exclude<UserRole, "ADMIN">
) {
  if (role === "RECRUITER") {
    await prisma.companyProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    return;
  }

  await prisma.candidateProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}
