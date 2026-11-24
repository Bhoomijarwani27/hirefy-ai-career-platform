"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/auth-utils";

export default function AuthContinuePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    // Safety fallback timer if session resolution takes too long
    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      // Clear any invalid or stale session cookies
      authClient.signOut().catch(() => {});
      router.replace("/auth/login?error=session_expired");
      return;
    }

    const role = (session.user as { role?: string }).role;
    router.replace(getDashboardPath(role));
  }, [isPending, session, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex flex-col items-center gap-4 max-w-sm">
        <Loader2 className="size-8 animate-spin text-violet-600" />
        <p className="text-sm font-medium text-muted-foreground">Continuing to your dashboard...</p>

        {hasTimedOut && (
          <div className="mt-4 flex flex-col gap-2 w-full animate-in fade-in">
            <button
              type="button"
              onClick={() => router.replace("/seeker/dashboard")}
              className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-violet-700 transition-colors"
            >
              Go to Candidate Dashboard
            </button>
            <Link
              href="/auth/login?error=timeout"
              className="w-full rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
