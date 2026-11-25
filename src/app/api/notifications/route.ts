import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  APPLICATION_STATUS_LABELS,
  type ApplicationStatusValue,
} from "@/lib/application-types";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  href: string;
  createdAt: string;
  type: "application" | "interview" | "status";
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  const items: NotificationItem[] = [];

  try {
    if (role === "RECRUITER") {
      const company = await prisma.companyProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (company) {
        const [recentApps, upcomingRounds] = await Promise.all([
          prisma.jobApplication.findMany({
            where: { job: { companyId: company.id } },
            include: {
              job: { select: { id: true, title: true } },
              candidate: {
                include: {
                  user: { select: { name: true, email: true } },
                },
              },
            },
            orderBy: { appliedAt: "desc" },
            take: 8,
          }),
          prisma.interviewRound.findMany({
            where: {
              scheduledAt: { gte: new Date() },
              application: { job: { companyId: company.id } },
            },
            include: {
              application: {
                include: {
                  job: { select: { title: true } },
                  candidate: {
                    include: {
                      user: { select: { name: true, email: true } },
                    },
                  },
                },
              },
            },
            orderBy: { scheduledAt: "asc" },
            take: 5,
          }),
        ]);

        for (const round of upcomingRounds) {
          const candName =
            round.application.candidate.user.name ||
            round.application.candidate.user.email;
          items.push({
            id: `round-${round.id}`,
            title: `Upcoming Interview: ${round.roundName}`,
            message: `${candName} • ${round.application.job.title}`,
            href: `/company/candidates/${round.applicationId}`,
            createdAt: round.scheduledAt.toISOString(),
            type: "interview",
          });
        }

        for (const app of recentApps) {
          const candName = app.candidate.user.name || app.candidate.user.email;
          items.push({
            id: `app-${app.id}`,
            title: `New Application: ${app.job.title}`,
            message: `${candName} applied for ${app.job.title}`,
            href: `/company/applicants/${app.jobId}/${app.id}`,
            createdAt: app.appliedAt.toISOString(),
            type: "application",
          });
        }
      }
    } else {
      const candidate = await prisma.candidateProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });

      if (candidate) {
        const [recentUpdates, upcomingRounds] = await Promise.all([
          prisma.jobApplication.findMany({
            where: { candidateId: candidate.id },
            include: {
              job: {
                select: {
                  title: true,
                  company: { select: { companyName: true } },
                },
              },
            },
            orderBy: { updatedAt: "desc" },
            take: 8,
          }),
          prisma.interviewRound.findMany({
            where: {
              scheduledAt: { gte: new Date() },
              application: { candidateId: candidate.id },
            },
            include: {
              application: {
                include: {
                  job: {
                    select: {
                      title: true,
                      company: { select: { companyName: true } },
                    },
                  },
                },
              },
            },
            orderBy: { scheduledAt: "asc" },
            take: 5,
          }),
        ]);

        for (const round of upcomingRounds) {
          items.push({
            id: `seeker-round-${round.id}`,
            title: `Interview Scheduled: ${round.roundName}`,
            message: `${round.application.job.title} at ${round.application.job.company.companyName || "Company"}`,
            href: "/seeker/applications",
            createdAt: round.scheduledAt.toISOString(),
            type: "interview",
          });
        }

        for (const app of recentUpdates) {
          const statusLabel =
            APPLICATION_STATUS_LABELS[app.status as ApplicationStatusValue] ||
            app.status;
          items.push({
            id: `seeker-app-${app.id}-${app.status}`,
            title: `${app.job.title} — ${statusLabel}`,
            message: `Application at ${app.job.company.companyName || "Company"} is ${statusLabel}`,
            href: "/seeker/applications",
            createdAt: app.updatedAt.toISOString(),
            type: "status",
          });
        }
      }
    }

    return NextResponse.json({ notifications: items });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ notifications: [] });
  }
}
