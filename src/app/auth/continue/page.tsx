"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/auth-utils";

export default function AuthContinuePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/auth/login");
      return;
    }

    const role = (session.user as { role?: string }).role;
    router.replace(getDashboardPath(role));
  }, [isPending, session, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Continuing to your dashboard...</p>
    </main>
  );
}
