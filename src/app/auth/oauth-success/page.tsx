"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { OAUTH_ROLE_STORAGE_KEY } from "@/components/auth/oauth-role-picker";
import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/auth-utils";

export default function OAuthSuccessPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const appliedRole = useRef(false);

  useEffect(() => {
    if (isPending || appliedRole.current) return;

    if (!session?.user) {
      router.replace("/auth/login");
      return;
    }

    appliedRole.current = true;

    void (async () => {
      const pendingRole = sessionStorage.getItem(OAUTH_ROLE_STORAGE_KEY) as
        | "CANDIDATE"
        | "RECRUITER"
        | null;

      sessionStorage.removeItem(OAUTH_ROLE_STORAGE_KEY);

      let role = (session.user as { role?: string }).role;

      if (pendingRole === "CANDIDATE" || pendingRole === "RECRUITER") {
        await fetch("/api/user/change-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newRole: pendingRole }),
        });
        role = pendingRole;
      }

      router.replace(getDashboardPath(role));
    })();
  }, [isPending, session, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Signing you in...</p>
    </main>
  );
}
