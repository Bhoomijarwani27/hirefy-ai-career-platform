"use client";

import Link from "next/link";
import { Bell, ChevronDown, Search, UserRound } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const profileMenuItems = [
  { label: "My Profile", href: "/seeker/profile" },
  { label: "Settings", href: "/settings" },
  { label: "Help & Support", href: "/help" },
  { label: "Sign out", href: "/auth/login" },
];

export function DashboardHeader() {
  const closeMenu = (event: React.MouseEvent<HTMLElement>) => {
    const details = event.currentTarget.closest("details");
    if (details) details.open = false;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/seeker/dashboard"
            className="flex shrink-0 items-center gap-3 rounded-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-500/30"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white shadow-sm shadow-violet-500/25 dark:bg-violet-500">
              H
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              Hirefy
            </span>
          </Link>

          <div className="hidden w-full max-w-xl items-center md:flex">
            <label className="relative w-full">
              <span className="sr-only">Search</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-violet-500" />
              <input
                type="search"
                placeholder="Search anything..."
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:focus:border-violet-400/50"
              />
            </label>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative border border-transparent text-muted-foreground hover:border-violet-300 hover:text-violet-600 focus-visible:border-violet-400 focus-visible:ring-violet-500/30 active:border-violet-400 dark:hover:border-violet-400/40 dark:hover:text-violet-400 dark:focus-visible:border-violet-400/50"
            >
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-violet-500" />
            </Button>

            <details className="group relative">
              <summary className="flex h-9 list-none items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:border-violet-300 hover:bg-violet-50/60 focus-visible:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-500/20 group-open:border-violet-400 group-open:bg-violet-50/60 dark:hover:border-violet-400/40 dark:hover:bg-violet-400/10 dark:focus-visible:border-violet-400/50 dark:group-open:border-violet-400/50 dark:group-open:bg-violet-400/10 [&::-webkit-details-marker]:hidden">
                <span className="flex size-6 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400">
                  <UserRound className="size-3.5" />
                </span>
                <span className="hidden sm:inline">Profile</span>
                <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180 group-open:text-violet-500" />
              </summary>

              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-sm">
                {profileMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeMenu}
                    className="block rounded-lg border border-transparent px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:border-violet-200/70 hover:bg-violet-50/60 hover:text-violet-700 focus-visible:border-violet-400 focus-visible:bg-violet-50/60 focus-visible:text-violet-700 dark:hover:border-violet-400/20 dark:hover:bg-violet-400/10 dark:hover:text-violet-300 dark:focus-visible:border-violet-400/50 dark:focus-visible:bg-violet-400/10 dark:focus-visible:text-violet-300"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>

        <div className="md:hidden">
          <label className="relative block w-full">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-violet-500" />
            <input
              type="search"
              placeholder="Search anything..."
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:focus:border-violet-400/50"
            />
          </label>
        </div>
      </div>
    </header>
  );
}
