import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const stages = await prisma.projectStage.findMany({
      where: { projectId: params.id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(stages);
  } catch (error) {
    console.error("Fetch stages error:", error);
    return NextResponse.json({ error: "Failed to fetch stages" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MANAGER"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, status, order } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Stage name is required" }, { status: 400 });
    }

    const currentCount = await prisma.projectStage.count({
      where: { projectId: params.id },
    });

    const stage = await prisma.projectStage.create({
      data: {
        name: name.trim(),
        status: status || "pending",
        order: typeof order === "number" ? order : currentCount + 1,
        projectId: params.id,
      },
    });

    return NextResponse.json(stage, { status: 201 });
  } catch (error) {
    console.error("Create stage error:", error);
    return NextResponse.json({ error: "Failed to create stage" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MANAGER"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Check if batch update
    if (Array.isArray(body.stages)) {
      for (const s of body.stages) {
        if (s.id) {
          await prisma.projectStage.update({
            where: { id: s.id },
            data: {
              ...(s.name ? { name: s.name } : {}),
              ...(s.status ? { status: s.status } : {}),
              ...(typeof s.order === "number" ? { order: s.order } : {}),
            },
          });
        }
      }
    } else if (body.stageId) {
      // Single stage update
      await prisma.projectStage.update({
        where: { id: body.stageId },
        data: {
          ...(body.name ? { name: body.name } : {}),
          ...(body.status ? { status: body.status } : {}),
          ...(typeof body.order === "number" ? { order: body.order } : {}),
        },
      });
    }

    // Optionally calculate progress percentage from stages
    const allStages = await prisma.projectStage.findMany({
      where: { projectId: params.id },
      orderBy: { order: "asc" },
    });

    if (body.syncProgress && allStages.length > 0) {
      const doneCount = allStages.filter((s) => s.status === "done").length;
      const currentCount = allStages.filter((s) => s.status === "current").length;
      const calcProgress = Math.round(((doneCount + currentCount * 0.5) / allStages.length) * 100);
      await prisma.project.update({
        where: { id: params.id },
        data: { progress: calcProgress },
      });
    }

    return NextResponse.json(allStages);
  } catch (error) {
    console.error("Update stage error:", error);
    return NextResponse.json({ error: "Failed to update stages" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MANAGER"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const stageId = searchParams.get("stageId");

    if (!stageId) {
      return NextResponse.json({ error: "stageId query parameter is required" }, { status: 400 });
    }

    await prisma.projectStage.delete({
      where: { id: stageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete stage error:", error);
    return NextResponse.json({ error: "Failed to delete stage" }, { status: 400 });
  }
}
