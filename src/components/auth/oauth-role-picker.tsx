"use client";

import { Building2, UserRound } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type OAuthRole = "CANDIDATE" | "RECRUITER";

type OAuthRolePickerProps = {
  open: boolean;
  providerLabel: "Google" | "GitHub";
  onCancel: () => void;
  onConfirm: (role: OAuthRole) => void;
};

export function OAuthRolePicker({
  open,
  providerLabel,
  onCancel,
  onConfirm,
}: OAuthRolePickerProps) {
  const [role, setRole] = useState<OAuthRole>("CANDIDATE");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oauth-role-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl">
        <h2 id="oauth-role-title" className="text-lg font-semibold text-foreground">
          Continue with {providerLabel}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how you want to use Hirefy. You can change this later in Settings.
        </p>

        <div className="mt-4 grid gap-3">
          <button
            type="button"
            onClick={() => setRole("CANDIDATE")}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
              role === "CANDIDATE"
                ? "border-violet-400 bg-violet-50/60 dark:bg-violet-400/10"
                : "border-border hover:bg-muted/40"
            )}
          >
            <UserRound className="size-5 text-violet-600 dark:text-violet-400" />
            <span>
              <span className="block font-medium text-foreground">Job Seeker</span>
              <span className="block text-xs text-muted-foreground">
                Resume, jobs, interviews
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRole("RECRUITER")}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
              role === "RECRUITER"
                ? "border-sky-400 bg-sky-50/60 dark:bg-sky-400/10"
                : "border-border hover:bg-muted/40"
            )}
          >
            <Building2 className="size-5 text-sky-600 dark:text-sky-400" />
            <span>
              <span className="block font-medium text-foreground">Company</span>
              <span className="block text-xs text-muted-foreground">
                Hiring and candidates
              </span>
            </span>
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={() => onConfirm(role)}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

export const OAUTH_ROLE_STORAGE_KEY = "hirefy_pending_oauth_role";
