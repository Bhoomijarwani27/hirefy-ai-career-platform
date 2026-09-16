"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, LogOut, Trash2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/auth-utils";

type AccountActionsProps = {
  currentRole: "CANDIDATE" | "RECRUITER";
  email: string;
};

export function AccountActions({ currentRole, email }: AccountActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogout = async () => {
    setLoading("logout");
    setError("");
    await authClient.signOut();
    router.push("/auth/login");
  };

  const handleChangeRole = async (newRole: "CANDIDATE" | "RECRUITER") => {
    if (newRole === currentRole) return;

    setLoading(`role-${newRole}`);
    setError("");
    setMessage("");

    const res = await fetch("/api/user/change-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newRole }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to change role");
      setLoading(null);
      return;
    }

    setMessage(
      newRole === "RECRUITER"
        ? "Switched to Company account."
        : "Switched to Job Seeker account."
    );
    setLoading(null);
    router.push(getDashboardPath(newRole));
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "This permanently deletes your account and all associated data. This cannot be undone."
    );

    if (!confirmed) return;

    setLoading("delete");
    setError("");

    const res = await fetch("/api/user/delete-account", {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to delete account");
      setLoading(null);
      return;
    }

    await authClient.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">{email}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Current role:{" "}
          <span className="font-medium text-foreground">
            {currentRole === "RECRUITER" ? "Company" : "Job Seeker"}
          </span>
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Change role</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Switch between job seeker and company modes anytime.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant={currentRole === "CANDIDATE" ? "default" : "outline"}
            disabled={loading !== null}
            onClick={() => handleChangeRole("CANDIDATE")}
            className="h-auto justify-start gap-3 px-4 py-4"
          >
            <UserRound className="size-4 shrink-0" />
            <span className="text-left">
              <span className="block font-medium">Job Seeker</span>
              <span className="block text-xs opacity-80">
                Resume, jobs, interviews
              </span>
            </span>
          </Button>

          <Button
            type="button"
            variant={currentRole === "RECRUITER" ? "default" : "outline"}
            disabled={loading !== null}
            onClick={() => handleChangeRole("RECRUITER")}
            className="h-auto justify-start gap-3 px-4 py-4"
          >
            <Building2 className="size-4 shrink-0" />
            <span className="text-left">
              <span className="block font-medium">Company</span>
              <span className="block text-xs opacity-80">
                Hiring, candidates, analytics
              </span>
            </span>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Session</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign out of your account on this device.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          disabled={loading !== null}
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          {loading === "logout" ? "Signing out..." : "Sign out"}
        </Button>
      </div>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-lg font-semibold text-destructive">
          Delete account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently remove your account, profiles, and session data.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="mt-4"
          disabled={loading !== null}
          onClick={handleDeleteAccount}
        >
          <Trash2 className="size-4" />
          {loading === "delete" ? "Deleting..." : "Delete account"}
        </Button>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          {message}
        </p>
      )}
    </div>
  );
}
