import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import type { UserRole } from "@/lib/auth-utils";

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: UserRole;
};

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireAuthUser() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return session.user as AuthUser;
}
