"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  OAUTH_REGISTRATION_KEY,
  OAUTH_ROLE_STORAGE_KEY,
  clearOAuthRoleStorage,
} from "@/components/auth/oauth-role-picker";
import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/auth-utils";

const NEW_USER_WINDOW_MS = 5 * 60 * 1000;

function isRecentAccount(createdAt?: Date | string | null) {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < NEW_USER_WINDOW_MS;
}

export default function OAuthSuccessPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const appliedRole = useRef(false);
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    if (isPending || appliedRole.current) return;

    if (!session?.user) {
      clearOAuthRoleStorage();
      router.replace("/auth/login");
      return;
    }

    appliedRole.current = true;

    void (async () => {
      const pendingRole = sessionStorage.getItem(OAUTH_ROLE_STORAGE_KEY);
      const isRegistrationFlow =
        sessionStorage.getItem(OAUTH_REGISTRATION_KEY) === "1";
      clearOAuthRoleStorage();

      const currentRole = (session.user as { role?: string }).role;
      let role = currentRole;

      const createdAt = (session.user as { createdAt?: Date | string })
        .createdAt;
      const shouldApplyRegistrationRole =
        isRegistrationFlow &&
        (pendingRole === "CANDIDATE" || pendingRole === "RECRUITER") &&
        isRecentAccount(createdAt);

      if (shouldApplyRegistrationRole) {
        const res = await fetch("/api/user/change-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newRole: pendingRole }),
        });

        if (res.ok) {
          role = pendingRole;
        } else {
          setStatus(
            "Signed in, but your selected role could not be saved. Opening your current dashboard..."
          );
          await new Promise((resolve) => window.setTimeout(resolve, 1600));
        }
      }

      router.replace(getDashboardPath(role));
    })();
  }, [isPending, session, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="max-w-md text-center text-sm text-muted-foreground">
        {status}
      </p>
    </main>
  );
}
