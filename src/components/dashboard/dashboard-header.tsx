"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  CheckCheck,
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
  Building2,
  HelpCircle,
  Users,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/auth-utils";
import { HirefyLogo } from "@/components/logos/hirefylogo";

const candidateMenuItems = [
  { label: "Dashboard", href: "/seeker/dashboard", icon: Layers3 },
  { label: "My Profile", href: "/seeker/profile", icon: UserRound },
  { label: "Resume Studio", href: "/seeker/resume-studio", icon: FileText },
  { label: "Job Discovery", href: "/seeker/jobs", icon: BriefcaseBusiness },
  { label: "Applications", href: "/seeker/applications", icon: Layers3 },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help & Support", href: "/help", icon: HelpCircle },
];

const recruiterMenuItems = [
  { label: "Company Dashboard", href: "/company/dashboard", icon: Building2 },
  { label: "Job Management", href: "/company/jobs", icon: BriefcaseBusiness },
  { label: "Applications", href: "/company/applicants", icon: Users },
  { label: "Application Tracking", href: "/company/candidates", icon: Layers3 },
  { label: "Company Profile", href: "/company/profile", icon: Building2 },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help & Support", href: "/help", icon: HelpCircle },
];

interface DashboardHeaderProps {
  userName?: string;
  userInitials?: string;
  onSearch?: (term: string) => void;
  searchValue?: string;
}

function getInitials(name?: string | null) {
  if (!name?.trim()) return "U";
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  type: "application" | "interview" | "status";
}

function formatNotifTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function DashboardHeader({
  userName,
  userInitials,
  onSearch,
  searchValue,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState(searchValue ?? "");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  const notifContainerRef = useRef<HTMLDivElement | null>(null);

  const readStorageKey = session?.user?.id
    ? `hirefy_read_notifs_${session.user.id}`
    : "hirefy_read_notifs";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(readStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setReadIds(parsed);
      }
    } catch {}
  }, [readStorageKey]);

  const loadNotifications = async () => {
    if (!session?.user) return;
    setIsLoadingNotifs(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch {
      // ignore transient network errors
    } finally {
      setIsLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      void loadNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  useEffect(() => {
    if (!notifOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [notifOpen]);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const markAsRead = (ids: string[]) => {
    const next = Array.from(new Set([...readIds, ...ids]));
    setReadIds(next);
    try {
      localStorage.setItem(readStorageKey, JSON.stringify(next));
    } catch {}
  };

  const role = (session?.user as { role?: string } | undefined)?.role;
  const isRecruiter = role === "RECRUITER";
  const homeHref = getDashboardPath(role);
  const displayName = userName || session?.user?.name || "Account";
  const displayEmail = session?.user?.email || "";
  const displayInitials = userInitials || getInitials(displayName);
  const menuItems = isRecruiter ? recruiterMenuItems : candidateMenuItems;

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
        <Link href={homeHref} className="shrink-0 transition-opacity hover:opacity-90">
          <HirefyLogo size={40} />
        </Link>

        <div className="hidden max-w-xl flex-1 items-center md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchValue !== undefined ? searchValue : internalSearch}
              onChange={handleSearchChange}
              placeholder={
                isRecruiter
                  ? "Search candidates, jobs..."
                  : "Search jobs, companies, skills..."
              }
              className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:focus:border-violet-400/50"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="size-9 rounded-xl border-border text-muted-foreground hover:border-violet-300 hover:text-foreground md:hidden"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <div ref={notifContainerRef} className="relative">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              onClick={() => {
                const next = !notifOpen;
                setNotifOpen(next);
                if (next) void loadNotifications();
              }}
              className="relative size-9 rounded-xl border-border text-muted-foreground hover:border-violet-300 hover:text-foreground focus-visible:ring-violet-500/30"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-violet-600 ring-2 ring-background" />
              )}
            </Button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl ring-1 ring-black/5 z-50">
                <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notifications.map((n) => n.id))}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
                    >
                      <CheckCheck className="size-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                  {isLoadingNotifs && notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                      You&apos;re all caught up — no notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const isUnread = !readIds.includes(n.id);
                      return (
                        <Link
                          key={n.id}
                          href={n.href}
                          onClick={() => {
                            markAsRead([n.id]);
                            setNotifOpen(false);
                          }}
                          className={`flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                            isUnread ? "bg-violet-500/5" : ""
                          }`}
                        >
                          <span
                            className={`mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg ${
                              n.type === "interview"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                            }`}
                          >
                            {n.type === "interview" ? (
                              <Calendar className="size-3.5" />
                            ) : (
                              <BriefcaseBusiness className="size-3.5" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-xs font-bold text-foreground">
                                {n.title}
                              </p>
                              <span className="shrink-0 text-[10px] text-muted-foreground">
                                {formatNotifTime(n.createdAt)}
                              </span>
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {n.message}
                            </p>
                          </div>
                          {isUnread && (
                            <span className="mt-2 size-2 shrink-0 rounded-full bg-violet-600" />
                          )}
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <details className="group relative">
            <summary className="flex h-9 list-none cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-background px-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:border-violet-300 hover:bg-muted/50 focus-visible:border-violet-400 focus-visible:ring-2 focus-visible:ring-violet-500/20 group-open:border-violet-400 dark:hover:border-violet-400/40 [&::-webkit-details-marker]:hidden">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/60 dark:text-violet-300">
                {displayInitials}
              </span>
              <span className="hidden font-medium text-foreground sm:inline">
                {displayName}
              </span>
              <ChevronDown className="hidden size-3.5 text-muted-foreground transition-transform group-open:rotate-180 group-open:text-violet-600 sm:inline" />
            </summary>

            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
              <div className="border-b border-border/60 px-3 py-2 text-xs">
                <p className="font-semibold text-foreground">{displayName}</p>
                {displayEmail ? (
                  <p className="text-muted-foreground">{displayEmail}</p>
                ) : null}
              </div>

              <div className="py-1">
                {menuItems.map((item) => {
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

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <div className="relative mb-3 w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchValue !== undefined ? searchValue : internalSearch}
              onChange={handleSearchChange}
              placeholder={
                isRecruiter
                  ? "Search candidates, jobs..."
                  : "Search jobs, companies, skills..."
              }
              className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <nav className="grid gap-1">
            {isRecruiter ? (
              <Link
                href="/company/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Company Dashboard
              </Link>
            ) : (
              <>
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
              </>
            )}
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Settings
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
