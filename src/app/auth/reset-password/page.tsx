"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import AuthPanel from "@/components/auth/AuthPanel";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/schemas/resetPasswordSchema";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    if (!email) {
      setError("Missing email. Please restart password reset.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await authClient.emailOtp.resetPassword({
      email,
      otp: data.code,
      password: data.password,
    });

    if (res.error) {
      setError(res.error.message || "Failed to reset password");
      setLoading(false);
      return;
    }

    router.push("/auth/login");
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
              Password reset
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Set a new password
            </h1>

            <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              Enter the verification code sent to{" "}
              <span className="font-medium text-foreground">
                {email || "your email"}
              </span>{" "}
              and choose a new password.
            </p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="code"
                className="text-sm font-medium text-foreground"
              >
                Verification code
              </label>
              <input
                id="code"
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

            <div className="mt-5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                New password
              </label>

              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a new password"
                  autoComplete="new-password"
                  {...form.register("password")}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-1.5 text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="mt-5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                Confirm new password
              </label>

              <div className="relative mt-2">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  {...form.register("confirmPassword")}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Resetting password..." : "Reset password"}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <a
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <AuthPanel
        badge="Account recovery"
        title={
          <>
            Create a new
            <br />
            password.
          </>
        }
        description="Choose a strong password to secure your Hirefy account."
        features={[
          "Create a secure password",
          "Protect your account",
          "Get back to your Hirefy journey",
        ]}
      />

      <Suspense
        fallback={
          <section className="flex min-h-screen items-center justify-center bg-background">
            <p className="text-muted-foreground">Loading...</p>
          </section>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
