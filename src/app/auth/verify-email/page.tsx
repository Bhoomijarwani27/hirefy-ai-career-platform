"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import AuthPanel from "@/components/auth/AuthPanel";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/auth-utils";
import { verifyEmailSchema } from "@/schemas/verifyEmailSchema";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "CANDIDATE";
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof verifyEmailSchema>>({
    resolver: zodResolver(verifyEmailSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof verifyEmailSchema>) => {
    if (!email) {
      setError("Missing email. Please register again.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await authClient.emailOtp.verifyEmail({
      email,
      otp: data.code,
    });

    if (res.error) {
      setError(res.error.message || "Invalid or expired OTP");
      setLoading(false);
      return;
    }

    router.push(getDashboardPath(role));
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setMessage("");
    setError("");

    const res = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });

    if (res.error) {
      setError(res.error.message || "Failed to resend code");
      return;
    }

    setMessage(
      "Verification code sent. Check your inbox and spam folder."
    );
  };

  return (
    <section className="relative flex min-h-screen w-full flex-1 items-start bg-background px-5 py-10 text-foreground sm:px-8 sm:py-12 lg:px-12 lg:py-14">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="w-full">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground sm:text-sm">
              Verify your email
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Enter verification code
            </h1>

            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              We sent a 6-digit verification code to{" "}
              <span className="font-medium text-foreground">
                {email || "your email"}
              </span>
              .
            </p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {message && (
            <p className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
              {message}
            </p>
          )}

          <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="otp"
                className="text-sm font-medium text-foreground"
              >
                Verification code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                autoComplete="one-time-code"
                {...form.register("code")}
                className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-center text-lg font-medium tracking-[0.4em] text-foreground outline-none transition-colors placeholder:text-sm placeholder:tracking-normal placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              {form.formState.errors.code && (
                <p className="mt-1.5 text-sm text-destructive">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify code"}
              <span aria-hidden="true">→</span>
            </button>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                className="font-medium text-primary hover:underline"
              >
                Resend code
              </button>
            </p>

            <p className="mt-3 text-center text-sm text-muted-foreground">
              <a
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                ← Back to sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function VerifyCodePage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <AuthPanel
        badge="Email verification"
        title={
          <>
            One step away
            <br />
            from getting started.
          </>
        }
        description="Verify your email to activate your Hirefy account."
        features={[
          "Secure email verification",
          "6-digit OTP code",
          "Access your dashboard",
        ]}
      />

      <Suspense
        fallback={
          <section className="flex min-h-screen items-center justify-center bg-background">
            <p className="text-muted-foreground">Loading...</p>
          </section>
        }
      >
        <VerifyEmailForm />
      </Suspense>
    </main>
  );
}
