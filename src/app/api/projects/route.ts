import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const role = (session.user as any).role;
  const isClient = role === "CLIENT";

  try {
    let whereClause: any = status ? { status } : {};

    if (isClient) {
      const client = await prisma.client.findFirst({
        where: {
          OR: [
            { userId: session.user.id },
            { email: session.user.email || "" }
          ]
        }
      });

      if (!client) {
        return NextResponse.json([]);
      }

      whereClause.clientId = client.id;
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: true,
        stages: { orderBy: { order: "asc" } },
        payments: { orderBy: { date: "asc" } },
        notes: { orderBy: { createdAt: "asc" } },
        fastFixIssues: { orderBy: { createdAt: "desc" } },
        extensions: { orderBy: { createdAt: "desc" } },
        delivery: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Fetch projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, type } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 });
    }

    const role = (session.user as any).role;
    const isAdminOrManager = ["ADMIN", "MANAGER"].includes(role);

    let targetClientId = body.clientId;

    if (!targetClientId) {
      const userId = session.user.id;
      // Find or create client record for user
      let client = await prisma.client.findFirst({
        where: {
          OR: [
            { userId },
            { email: session.user.email || "" }
          ]
        }
      });

      if (!client) {
        client = await prisma.client.create({
          data: {
            name: session.user.name || "عميل جديد",
            email: session.user.email || "",
            company: (session.user as any).company || "",
            userId: userId,
          }
        });
      }
      targetClientId = client.id;
    } else {
      // Validate client exists
      const existingClient = await prisma.client.findUnique({
        where: { id: targetClientId }
      });
      if (!existingClient) {
        return NextResponse.json({ error: "Selected client does not exist" }, { status: 400 });
      }
    }

    const todayISO = new Date().toISOString().slice(0, 10);
    const initialProgress = isAdminOrManager && typeof body.progress === "number" ? Math.min(100, Math.max(0, body.progress)) : 0;
    const initialStatus = isAdminOrManager && body.status ? body.status : "requested";
    const initialBudget = typeof body.budget === "number" ? body.budget : (body.budget ? parseFloat(body.budget) : 0);
    const initialPaid = typeof body.paid === "number" ? body.paid : (body.paid ? parseFloat(body.paid) : 0);
    const initialTotalDays = typeof body.totalDays === "number" ? body.totalDays : (body.totalDays ? parseInt(body.totalDays) : 30);

    // Default stages if none provided
    const defaultStages = [
      { name: "Discovery", status: initialProgress >= 20 ? "done" : (initialProgress > 0 ? "current" : "pending"), order: 1 },
      { name: "Design", status: initialProgress >= 40 ? "done" : (initialProgress >= 20 ? "current" : "pending"), order: 2 },
      { name: "Development", status: initialProgress >= 75 ? "done" : (initialProgress >= 40 ? "current" : "pending"), order: 3 },
      { name: "Testing", status: initialProgress >= 95 ? "done" : (initialProgress >= 75 ? "current" : "pending"), order: 4 },
      { name: "Launch", status: initialProgress >= 100 ? "done" : "pending", order: 5 },
    ];

    const projectStages = Array.isArray(body.stages) && body.stages.length > 0 
      ? body.stages.map((s: any, idx: number) => ({
          name: s.name || `Stage ${idx + 1}`,
          status: s.status || "pending",
          order: typeof s.order === "number" ? s.order : idx + 1,
        }))
      : defaultStages;

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        type: type || "website",
        status: initialStatus,
        progress: initialProgress,
        budget: initialBudget,
        paid: initialPaid,
        requestDate: body.requestDate || todayISO,
        contractDate: body.contractDate || todayISO,
        contractStatus: body.contractStatus || "Active",
        totalDays: initialTotalDays,
        versionLabel: body.versionLabel || (initialProgress > 0 ? "v0.1 Beta" : "v0.1 Initial"),
        versionNote: body.versionNote || "Created in Moemen Team Management",
        clientId: targetClientId,
        stages: {
          create: projectStages
        }
      },
      include: {
        client: true,
        stages: { orderBy: { order: "asc" } },
        payments: { orderBy: { date: "asc" } },
        notes: { orderBy: { createdAt: "asc" } },
        fastFixIssues: { orderBy: { createdAt: "desc" } },
        extensions: { orderBy: { createdAt: "desc" } },
        delivery: true,
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
