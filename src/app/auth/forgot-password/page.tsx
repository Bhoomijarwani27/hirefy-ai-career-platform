"use client";

import { useRouter } from "next/navigation";
import AuthPanel from "@/components/auth/AuthPanel";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left side */}
      <AuthPanel
        badge="Account recovery"
        title={
          <>
            Get back to
            <br />
            your account.
          </>
        }
        description="Reset your password securely and get back to your Hirefy journey."
        features={[
          "Secure password recovery",
          "Verify your email",
          "Get back to your account quickly",
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
                Forgot password?
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Reset your password
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                Enter your email and we'll send you a verification code to
                reset your password.
              </p>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {/* Send Code */}
            <button
              type="submit"
               onClick={() => router.push("/auth/verify-email")}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Send verification code
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