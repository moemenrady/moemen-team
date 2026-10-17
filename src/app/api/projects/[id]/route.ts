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
      include: {
        client: true,
        stages: { orderBy: { order: "asc" } },
        payments: { orderBy: { date: "asc" } },
        notes: { orderBy: { createdAt: "asc" } },
        tasks: true,
        documents: true,
        fastFixIssues: { orderBy: { createdAt: "desc" } },
        extensions: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
        return NextResponse.json({ error: "Unauthorized access to project" }, { status: 403 });
      }
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const role = (session.user as any).role;
    const isAdminOrManager = ["ADMIN", "MANAGER"].includes(role);

    const body = await req.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim();
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.contractDate !== undefined) updateData.contractDate = body.contractDate;
    if (body.contractStatus !== undefined) updateData.contractStatus = body.contractStatus;
    if (body.versionLabel !== undefined) updateData.versionLabel = body.versionLabel;
    if (body.versionNote !== undefined) updateData.versionNote = body.versionNote;
    if (body.clientId !== undefined && isAdminOrManager) updateData.clientId = body.clientId;

    if (body.progress !== undefined) {
      const p = typeof body.progress === "number" ? body.progress : parseInt(body.progress);
      if (!isNaN(p)) updateData.progress = Math.min(100, Math.max(0, p));
    }

    if (body.budget !== undefined) {
      const b = typeof body.budget === "number" ? body.budget : parseFloat(body.budget);
      if (!isNaN(b)) updateData.budget = b;
    }

    if (body.paid !== undefined) {
      const pd = typeof body.paid === "number" ? body.paid : parseFloat(body.paid);
      if (!isNaN(pd)) updateData.paid = pd;
    }

    if (body.totalDays !== undefined) {
      const td = typeof body.totalDays === "number" ? body.totalDays : parseInt(body.totalDays);
      if (!isNaN(td)) updateData.totalDays = td;
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: true,
        stages: { orderBy: { order: "asc" } },
        payments: { orderBy: { date: "asc" } },
        notes: { orderBy: { createdAt: "asc" } },
        fastFixIssues: { orderBy: { createdAt: "desc" } },
        extensions: { orderBy: { createdAt: "desc" } },
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MANAGER"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 400 });
  }
}
