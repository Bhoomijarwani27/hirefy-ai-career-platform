"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  const closeMenu = (e: React.MouseEvent<HTMLElement>) => {
    const details = e.currentTarget.closest("details") as HTMLDetailsElement;
    if (details) details.open = false;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-linear-to-br from-violet-500 via-blue-500 to-cyan-400 shadow-sm" />
            <span className="text-base font-bold text-foreground">Hirefy</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link href="#platform" className="hover:text-foreground">
              Platform
            </Link>
            <Link href="#features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="#for-companies" className="hover:text-foreground">
              For Companies
            </Link>
            <Link href="#faq" className="hover:text-foreground">
              FAQ
            </Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Login
            </Link>
            <Link
             href="/auth/register"
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get started
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </div>
          <details className="group static md:hidden">
            <summary className="flex h-10 w-10 list-none items-center justify-center rounded-full border border-border text-muted-foreground shadow-sm transition-colors hover:bg-muted [::-webkit-details-marker]:hidden">
              <span className="text-2xl leading-none">≡</span>
            </summary>

            <div className="absolute left-0 top-16 w-screen bg-background p-4">
              <nav className="flex flex-col text-sm font-medium text-muted-foreground">
                <Link
                  href="#platform"
                  onClick={closeMenu}
                  className="px-3 py-3 hover:bg-muted hover:text-foreground"
                >
                  Platform
                </Link>
                <Link
                  href="#features"
                  onClick={closeMenu}
                  className="px-3 py-3 hover:bg-muted hover:text-foreground"
                >
                  Features
                </Link>
                <Link
                  href="#for-companies"
                  onClick={closeMenu}
                  className="px-3 py-3 hover:bg-muted hover:text-foreground"
                >
                  For Companies
                </Link>
                <Link
                  href="#faq"
                  onClick={closeMenu}
                  className="px-3 py-3 hover:bg-muted hover:text-foreground"
                >
                  FAQ
                </Link>
              </nav>

              <div className="mt-4 grid gap-3 border-t border-border pt-4">
                <div className="flex justify-center ">
                  <ThemeToggle onClick={closeMenu} />
                </div>
                <Link
                  href="/login"
                  className="rounded-full border border-border px-4 py-3 text-center text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get started
                  <span aria-hidden="true" className="ml-2">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
