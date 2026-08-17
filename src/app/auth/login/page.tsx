"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import AuthPanel from "@/components/auth/AuthPanel";
import SocialLogin from "@/components/auth/social-login";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left side */}
      <AuthPanel
        badge="AI-powered career platform"
        title={
          <>
            Welcome back.
            <br />
            Keep moving forward.
          </>
        }
        description="Continue your journey with Hirefy and discover your next opportunity."
        features={[
          "AI-powered resume analysis",
          "Personalized job matching",
          "Build and manage your resume",
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
                Welcome back
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Sign in to Hirefy
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                Sign in to continue your career journey.
              </p>
            </div>

            {/* OAuth */}
            <SocialLogin />

            {/* Email */}
            <div className="mt-6">
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

            {/* Password */}
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>

                <a
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            {/* Sign in */}
            <button
              type="submit"
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in
              <span aria-hidden="true">→</span>
            </button>

            {/* Register link */}
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a
                href="/auth/register"
                className="font-medium text-primary hover:underline"
              >
                Create one
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}