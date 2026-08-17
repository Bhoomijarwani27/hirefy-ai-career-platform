import AuthPanel from "@/components/auth/AuthPanel";
import { ThemeToggle } from "@/components/theme-toggle";

export default function VerifyCodePage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left side */}
      <AuthPanel
        badge="Account recovery"
        title={
          <>
            One step away
            <br />
            from getting back in.
          </>
        }
        description="Verify your email to securely reset your Hirefy password."
        features={[
          "Secure account recovery",
          "Email verification",
          "Set a new password",
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
                Verify your email
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Enter verification code
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                We sent a 6-digit verification code to your email address.
              </p>
            </div>

            {/* OTP */}
            <div>
              <label
                htmlFor="otp"
                className="text-sm font-medium text-foreground"
              >
                Verification code
              </label>

              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                autoComplete="one-time-code"
                className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-center text-lg font-medium tracking-[0.4em] text-foreground outline-none transition-colors placeholder:text-sm placeholder:tracking-normal placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {/* Verify */}
            <button
              type="submit"
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Verify code
              <span aria-hidden="true">→</span>
            </button>

            {/* Resend */}
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
              >
                Resend code
              </button>
            </p>

            {/* Back */}
            <p className="mt-3 text-center text-sm text-muted-foreground">
              <a
                href="/auth/forgot-password"
                className="font-medium text-primary hover:underline"
              >
                ← Back to forgot password
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}