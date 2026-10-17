import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { client: true }
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const role = (session.user as any).role;
    if (role === "CLIENT") {
      const client = await prisma.client.findFirst({
        where: {
          OR: [
            { userId: session.user.id },
            { email: session.user.email || "" }
          ]
        }
      });
      if (!client || project.clientId !== client.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const extensions = await prisma.projectExtension.findMany({
      where: { projectId: params.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(extensions);
  } catch (error) {
    console.error("Get extensions error:", error);
    return NextResponse.json({ error: "Failed to fetch extensions" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { client: true }
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const role = (session.user as any).role;
    const isClient = role === "CLIENT";

    if (isClient) {
      const client = await prisma.client.findFirst({
        where: {
          OR: [
            { userId: session.user.id },
            { email: session.user.email || "" }
          ]
        }
      });
      if (!client || project.clientId !== client.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const body = await req.json();
    const { title, description, budget, targetDays, versionTarget, stages } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const numBudget = typeof budget === "number" ? budget : (budget ? parseFloat(budget) : 0);
    const numDays = typeof targetDays === "number" ? targetDays : (targetDays ? parseInt(targetDays) : 15);

    const stagesJson = Array.isArray(stages) && stages.length > 0
      ? JSON.stringify(stages)
      : JSON.stringify([
          { name: "Scope & Architecture", status: "pending", order: 1 },
          { name: "Core Enhancements", status: "pending", order: 2 },
          { name: "Integration & Testing", status: "pending", order: 3 },
          { name: "Deployment & Release", status: "pending", order: 4 },
        ]);

    const extension = await prisma.projectExtension.create({
      data: {
        projectId: params.id,
        title: title.trim(),
        description: description.trim(),
        budget: numBudget,
        paid: 0,
        progress: 0,
        targetDays: numDays,
        versionTarget: versionTarget || "v1.1",
        status: "requested",
        stages: stagesJson,
        payments: "[]",
      }
    });

    return NextResponse.json(extension, { status: 201 });
  } catch (error) {
    console.error("Create project extension error:", error);
    return NextResponse.json({ error: "Failed to create development request" }, { status: 500 });
  }
}
