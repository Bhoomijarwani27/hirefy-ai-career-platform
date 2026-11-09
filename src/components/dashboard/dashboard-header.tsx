"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  UserRound,
  X,
  FileText,
  BriefcaseBusiness,
  Layers3,
  Settings,
  LogOut,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { HirefyLogo } from "@/components/logos/hirefylogo";

const profileMenuItems = [
  { label: "My Profile", href: "/seeker/dashboard", icon: UserRound },
  { label: "Resume Studio", href: "/seeker/resume-studio", icon: FileText },
  { label: "Saved Jobs", href: "/seeker/jobs", icon: BriefcaseBusiness },
  { label: "Applications", href: "/seeker/applications", icon: Layers3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface DashboardHeaderProps {
  userName?: string;
  userInitials?: string;
  onSearch?: (term: string) => void;
  searchValue?: string;
}

export function DashboardHeader({
  userName = "Jamie Smith",
  userInitials = "JS",
  onSearch,
  searchValue,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState(searchValue ?? "");

  const closeMenu = (event: React.MouseEvent<HTMLElement>) => {
    const details = event.currentTarget.closest("details");
    if (details) details.open = false;
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch {
      // ignore
    }
    router.push("/auth/login");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalSearch(val);
    onSearch?.(val);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/seeker/dashboard" className="shrink-0 transition-opacity hover:opacity-90">
          <HirefyLogo size={40} />
        </Link>

        {/* Global Search Bar (Middle) */}
        <div className="hidden max-w-xl flex-1 items-center md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchValue !== undefined ? searchValue : internalSearch}
              onChange={handleSearchChange}
              placeholder="Search jobs, companies, skills..."
              className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:focus:border-violet-400/50"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Menu button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="size-9 rounded-xl border-border text-muted-foreground hover:border-violet-300 hover:text-foreground md:hidden"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Notifications button */}
          <Button
            variant="outline"
            size="icon"
            aria-label="Notifications"
            className="relative size-9 rounded-xl border-border text-muted-foreground hover:border-violet-300 hover:text-foreground focus-visible:ring-violet-500/30"
          >
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-violet-600 ring-2 ring-background" />
          </Button>

          {/* Profile Dropdown */}
          <details className="group relative">
            <summary className="flex h-9 list-none cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-background px-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:border-violet-300 hover:bg-muted/50 focus-visible:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-500/20 group-open:border-violet-400 dark:hover:border-violet-400/40 [&::-webkit-details-marker]:hidden">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/60 dark:text-violet-300">
                {userInitials}
              </span>
              <span className="hidden font-medium text-foreground sm:inline">{userName}</span>
              <ChevronDown className="hidden size-3.5 text-muted-foreground transition-transform group-open:rotate-180 group-open:text-violet-600 sm:inline" />
            </summary>

            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
              <div className="border-b border-border/60 px-3 py-2 text-xs">
                <p className="font-semibold text-foreground">{userName}</p>
                <p className="text-muted-foreground">jamie.smith@example.com</p>
              </div>

              <div className="py-1">
                {profileMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeMenu}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-400/10 dark:hover:text-violet-300"
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-border/60 pt-1">
                <div className="flex items-center justify-between px-3 py-1.5 sm:hidden">
                  <span className="text-xs text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    closeMenu(event);
                    void handleLogout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-rose-600 outline-none transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Mobile search bar if menu is open */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <div className="relative mb-3 w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchValue !== undefined ? searchValue : internalSearch}
              onChange={handleSearchChange}
              placeholder="Search jobs, companies, skills..."
              className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <nav className="grid gap-1">
            <Link
              href="/seeker/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Job Discovery
            </Link>
            <Link
              href="/seeker/resume-studio"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Resume Studio
            </Link>
            <Link
              href="/seeker/applications"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Applications
            </Link>
            <Link
              href="/seeker/skill-gap"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Skill Gap
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
