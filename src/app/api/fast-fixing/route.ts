import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");

  const role = (session.user as any).role;
  const isClient = role === "CLIENT";

  try {
    let whereClause: any = {};
    if (status && status !== "ALL") whereClause.status = status;
    if (projectId) whereClause.projectId = projectId;

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

      whereClause.project = {
        clientId: client.id
      };
    }

    const issues = await prisma.fastFixIssue.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true,
                company: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(issues);
  } catch (error) {
    console.error("Fetch fast-fixing issues error:", error);
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { projectId, title, description, photoUrl } = body;

    if (!projectId || !description?.trim()) {
      return NextResponse.json({ error: "Project and problem description are required" }, { status: 400 });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

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
        return NextResponse.json({ error: "Unauthorized access to project" }, { status: 403 });
      }
    }

    const issue = await prisma.fastFixIssue.create({
      data: {
        projectId,
        title: title?.trim() || "Fast Fixing A Problem",
        description: description.trim(),
        photoUrl: photoUrl || null,
        status: "pending",
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            type: true,
            client: {
              select: {
                id: true,
                name: true,
                company: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error("Create fast-fixing issue error:", error);
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 });
  }
}
