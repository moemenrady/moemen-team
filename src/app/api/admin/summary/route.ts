import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MANAGER"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [clientsCount, projects, payments, recentNotes, pendingIssuesCount, activeIssuesCount, recentIssues] = await Promise.all([
      prisma.client.count(),
      prisma.project.findMany({
        include: {
          client: true,
          stages: { orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        include: {
          project: {
            include: { client: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.note.findMany({
        include: {
          project: {
            include: { client: true },
          },
          user: true,
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.fastFixIssue.count({ where: { status: "pending" } }),
      prisma.fastFixIssue.count({ where: { status: "on_it" } }),
      prisma.fastFixIssue.findMany({
        include: {
          project: {
            select: { id: true, name: true, client: { select: { name: true, company: true } } }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    const totalProjects = projects.length;
    const requestedProjects = projects.filter((p) => p.status === "requested").length;
    const inReviewProjects = projects.filter((p) => p.status === "in_review").length;
    const inProgressProjects = projects.filter((p) => p.status === "in_progress").length;
    const completedProjects = projects.filter((p) => p.status === "completed").length;
    const activeProjects = inProgressProjects + inReviewProjects + requestedProjects;

    const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
    const totalPaid = projects.reduce((acc, p) => acc + (p.paid || 0), 0);
    const totalRemaining = Math.max(0, totalBudget - totalPaid);

    const averageProgress =
      totalProjects > 0
        ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / totalProjects)
        : 0;

    return NextResponse.json({
      metrics: {
        totalClients: clientsCount,
        totalProjects,
        activeProjects,
        completedProjects,
        requestedProjects,
        inReviewProjects,
        inProgressProjects,
        totalBudget,
        totalPaid,
        totalRemaining,
        averageProgress,
        pendingIssuesCount,
        activeIssuesCount,
      },
      recentProjects: projects.slice(0, 6),
      recentPayments: payments,
      recentNotes,
      recentFastFixIssues: recentIssues,
    });
  } catch (error) {
    console.error("Admin summary error:", error);
    return NextResponse.json({ error: "Failed to fetch admin summary" }, { status: 500 });
  }
}
