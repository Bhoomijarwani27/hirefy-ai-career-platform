"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import AuthPanel from "@/components/auth/AuthPanel";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left side */}
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

      {/* Right side */}
      <section className="relative flex min-h-screen w-full flex-1 items-start bg-background px-5 py-10 text-foreground sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        {/* Theme Toggle */}
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>

        {/* Content */}
        <div className="w-full">
          <div className="w-full max-w-xl">
            {/* Heading */}
            <div className="mb-8">
              <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground sm:text-sm">
                Password reset
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Set a new password
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                Enter your new password below to secure your account.
              </p>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                New password
              </label>

              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a new password"
                  autoComplete="new-password"
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
            </div>

            {/* Confirm Password */}
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
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
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
            </div>

            {/* Reset Password */}
            <button
              type="submit"
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Reset password
              <span aria-hidden="true">→</span>
            </button>

            {/* Back to Login */}
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
    </main>
  );
}