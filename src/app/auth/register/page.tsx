"use client";
import AuthPanel from "@/components/auth/AuthPanel";
import SocialLogin from "@/components/auth/social-login";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Building2, Check, FileText, Search, Sparkles, UserRound, Users } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountType, setAccountType] = useState<"seeker" | "company">("seeker");
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
        {/* left side */}
        <AuthPanel
        badge="AI-powered career platform"
        title={
         <>
           Get hired faster.
           <br />
           Hire smarter.
         </>
        }
       description="Build your career with AI-powered tools designed to help you stand out."
       features={[
        "AI-powered resume analysis",
        "Personalized job matching",
        "Build and manage your resume",
      ]} 
       />
       

<section className="relative flex min-h-screen w-full flex-1 items-start bg-background px-5 py-10 text-foreground sm:px-8 sm:py-12 lg:px-12 lg:py-14">
  {/* Theme Toggle - temporary */}
  <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
    <ThemeToggle />
  </div>

  {/* Right side content */}
  <div className="w-full">
    <div className="w-full max-w-xl">
      
      {/* Heading */}
      <div className="mb-8">
        <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground sm:text-sm">
          Create your account
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Join Hirefy today
        </h1>

        <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
          Choose how you'll use Hirefy — you can switch anytime.
        </p>
      </div>

      {/* OAuth will come here */}
      <SocialLogin />
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
   <div className="mt-5">
  <label
    htmlFor="password"
    className="text-sm font-medium text-foreground"
  >
    Password
  </label>

  <div className="relative mt-2">
    <input
      id="password"
      name="password"
      type={showPassword ? "text" : "password"}
      placeholder="Create a password"
      autoComplete="new-password"
      className="h-11 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <EyeOff className="size-4" />
      ) : (
        <Eye className="size-4" />
      )}
    </button>
  </div>
</div>
<div className="mt-5">
  <label
    htmlFor="confirmPassword"
    className="text-sm font-medium text-foreground"
  >
    Confirm password
  </label>

  <div className="relative mt-2">
    <input
      id="confirmPassword"
      name="confirmPassword"
      type={showConfirmPassword ? "text" : "password"}
      placeholder="Confirm your password"
      autoComplete="new-password"
      className="h-11 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
    />

    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      aria-label={
        showConfirmPassword ? "Hide confirm password" : "Show confirm password"
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

{/* Account Type */}
<div className="mt-6">
  <div className="flex items-center justify-between">
    <p className="text-sm font-medium text-foreground">
      I'm joining as a
    </p>

    <span className="text-xs text-muted-foreground">
      Choose one
    </span>
  </div>

  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
    {/* Job Seeker */}
    <button
      type="button"
      onClick={() => setAccountType("seeker")}
      className={`relative rounded-xl border p-4 text-left transition-all ${
        accountType === "seeker"
          ? "border-violet-400 bg-violet-50/60 shadow-sm shadow-violet-500/10 dark:border-violet-400/50 dark:bg-violet-400/10"
          : "border-border bg-background hover:border-violet-300 hover:bg-muted/40"
      }`}
    >
      {accountType === "seeker" && (
        <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-violet-600 text-white">
          <Check className="size-3.5" />
        </span>
      )}

      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400">
          <UserRound className="size-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            Job Seeker
          </p>
          <p className="text-xs text-muted-foreground">
            Individuals
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="size-3.5 text-violet-500" />
          Build and manage your resume
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Search className="size-3.5 text-violet-500" />
          Discover matching jobs
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-violet-500" />
          Prepare with AI interviews
        </div>
      </div>
    </button>

    {/* Company */}
    <button
      type="button"
      onClick={() => setAccountType("company")}
      className={`relative rounded-xl border p-4 text-left transition-all ${
        accountType === "company"
          ? "border-violet-400 bg-violet-50/60 shadow-sm shadow-violet-500/10 dark:border-violet-400/50 dark:bg-violet-400/10"
          : "border-border bg-background hover:border-violet-300 hover:bg-muted/40"
      }`}
    >
      {accountType === "company" && (
        <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-violet-600 text-white">
          <Check className="size-3.5" />
        </span>
      )}

      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400">
          <Building2 className="size-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            Company
          </p>
          <p className="text-xs text-muted-foreground">
            Teams
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="size-3.5 text-sky-500" />
          Manage applicants
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Search className="size-3.5 text-sky-500" />
          Find relevant candidates
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-sky-500" />
          AI-assisted candidate evaluation
        </div>
      </div>
    </button>
  </div>
</div>

{/* Terms */}
<div className="mt-5 flex items-start gap-3 rounded-lg border border-border bg-muted/20 px-3 py-3">
  <input
    id="terms"
    name="terms"
    type="checkbox"
    className="mt-0.5 size-4 shrink-0 rounded border-input accent-violet-600"
  />

  <label
    htmlFor="terms"
    className="text-xs leading-5 text-muted-foreground sm:text-sm"
  >
    I agree to Hirefy's{" "}
    <a
      href="/terms"
      className="font-medium text-primary hover:underline"
    >
      Terms of Service
    </a>{" "}
    and{" "}
    <a
      href="/privacy"
      className="font-medium text-primary hover:underline"
    >
      Privacy Policy
    </a>
    .
  </label>
</div>

{/* Create Account */}
<button
  type="submit"
  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
>
  Create account
  <span aria-hidden="true">→</span>
</button>

{/* Login link */}
<p className="mt-5 text-center text-sm text-muted-foreground">
  Already have an account?{" "}
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
