import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const issue = await prisma.fastFixIssue.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            client: true
          }
        }
      }
    });

    if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 });

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
      if (!client || issue.project.clientId !== client.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    return NextResponse.json(issue);
  } catch (error) {
    console.error("Get fast-fixing issue error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await prisma.fastFixIssue.findUnique({
      where: { id: params.id },
      include: { project: true }
    });

    if (!existing) return NextResponse.json({ error: "Issue not found" }, { status: 404 });

    const role = (session.user as any).role;
    const isAdminOrManager = ["ADMIN", "MANAGER"].includes(role);

    // If client, ensure ownership
    if (!isAdminOrManager) {
      const client = await prisma.client.findFirst({
        where: {
          OR: [
            { userId: session.user.id },
            { email: session.user.email || "" }
          ]
        }
      });
      if (!client || existing.project.clientId !== client.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.adminNotes !== undefined && isAdminOrManager) updateData.adminNotes = body.adminNotes.trim();

    if (body.status !== undefined) {
      const newStatus = body.status; // pending, on_it, fixed
      updateData.status = newStatus;

      if (newStatus === "on_it") {
        if (!existing.startedAt) {
          updateData.startedAt = new Date();
        }
      } else if (newStatus === "fixed") {
        const resolvedAt = new Date();
        updateData.resolvedAt = resolvedAt;

        if (typeof body.durationMinutes === "number") {
          updateData.durationMinutes = body.durationMinutes;
        } else {
          const startTime = existing.startedAt || existing.createdAt;
          const diffMs = resolvedAt.getTime() - new Date(startTime).getTime();
          const mins = Math.max(1, Math.round(diffMs / 60000));
          updateData.durationMinutes = mins;
        }
      }
    }

    if (typeof body.durationMinutes === "number" && isAdminOrManager) {
      updateData.durationMinutes = body.durationMinutes;
    }

    const updated = await prisma.fastFixIssue.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update fast-fixing issue error:", error);
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MANAGER"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.fastFixIssue.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete fast-fixing issue error:", error);
    return NextResponse.json({ error: "Failed to delete issue" }, { status: 500 });
  }
}
