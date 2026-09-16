"use client";

import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

import {
  OAuthRolePicker,
  OAUTH_ROLE_STORAGE_KEY,
  type OAuthRole,
} from "@/components/auth/oauth-role-picker";

type PendingProvider = "google" | "github" | null;

export default function SocialLogin() {
  const [loadingProvider, setLoadingProvider] = useState<PendingProvider>(null);
  const [pendingProvider, setPendingProvider] = useState<PendingProvider>(null);
  const [error, setError] = useState("");

  const runSocialLogin = async (
    provider: "google" | "github",
    role: OAuthRole
  ) => {
    setPendingProvider(null);
    setLoadingProvider(provider);
    setError("");

    sessionStorage.setItem(OAUTH_ROLE_STORAGE_KEY, role);

    const res = await authClient.signIn.social({
      provider,
      callbackURL: "/auth/oauth-success",
    });

    if (res.error) {
      sessionStorage.removeItem(OAUTH_ROLE_STORAGE_KEY);
      setError(res.error.message || "Sign-in failed");
      setLoadingProvider(null);
    }
  };

  return (
    <>
      <OAuthRolePicker
        open={pendingProvider !== null}
        providerLabel={pendingProvider === "github" ? "GitHub" : "Google"}
        onCancel={() => setPendingProvider(null)}
        onConfirm={(role) => {
          if (pendingProvider) void runSocialLogin(pendingProvider, role);
        }}
      />

      <div className="space-y-4">
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            disabled={!!loadingProvider}
            onClick={() => {
              setError("");
              setPendingProvider("google");
            }}
            className="h-11 w-full cursor-pointer justify-center gap-2 hover:bg-accent"
          >
            <FcGoogle className="size-5" />
            {loadingProvider === "google" ? "Connecting..." : "Continue with Google"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={!!loadingProvider}
            onClick={() => {
              setError("");
              setPendingProvider("github");
            }}
            className="h-11 w-full cursor-pointer justify-center gap-2 hover:bg-accent"
          >
            <FaGithub className="size-5" />
            {loadingProvider === "github" ? "Connecting..." : "Continue with GitHub"}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>
    </>
  );
}
