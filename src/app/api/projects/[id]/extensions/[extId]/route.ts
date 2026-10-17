import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string; extId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const extension = await prisma.projectExtension.findUnique({
      where: { id: params.extId },
      include: { project: true }
    });

    if (!extension || extension.projectId !== params.id) {
      return NextResponse.json({ error: "Extension not found" }, { status: 404 });
    }

    return NextResponse.json(extension);
  } catch (error) {
    console.error("Get extension error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; extId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await prisma.projectExtension.findUnique({
      where: { id: params.extId },
      include: { project: true }
    });

    if (!existing || existing.projectId !== params.id) {
      return NextResponse.json({ error: "Extension not found" }, { status: 404 });
    }

    const role = (session.user as any).role;
    const isAdminOrManager = ["ADMIN", "MANAGER"].includes(role);

    const body = await req.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.status !== undefined) updateData.status = body.status;
    if (body.versionTarget !== undefined) updateData.versionTarget = body.versionTarget;
    if (body.notes !== undefined) updateData.notes = body.notes;

    if (body.progress !== undefined) {
      const p = typeof body.progress === "number" ? body.progress : parseInt(body.progress);
      if (!isNaN(p)) {
        updateData.progress = Math.min(100, Math.max(0, p));
        if (p === 100 && existing.status !== "merged") {
          updateData.status = "completed";
        }
      }
    }

    if (body.budget !== undefined && isAdminOrManager) {
      const b = typeof body.budget === "number" ? body.budget : parseFloat(body.budget);
      if (!isNaN(b)) updateData.budget = b;
    }

    if (body.payments !== undefined) {
      // payments array or JSON
      const paymentsArr = Array.isArray(body.payments) ? body.payments : JSON.parse(body.payments || "[]");
      updateData.payments = JSON.stringify(paymentsArr);
      const totalPaid = paymentsArr.reduce((sum: number, p: any) => sum + (parseFloat(p.amount) || 0), 0);
      updateData.paid = totalPaid;
    } else if (body.paid !== undefined && isAdminOrManager) {
      const pd = typeof body.paid === "number" ? body.paid : parseFloat(body.paid);
      if (!isNaN(pd)) updateData.paid = pd;
    }

    if (body.stages !== undefined) {
      const stagesArr = Array.isArray(body.stages) ? body.stages : JSON.parse(body.stages || "[]");
      updateData.stages = JSON.stringify(stagesArr);
    }

    const updated = await prisma.projectExtension.update({
      where: { id: params.extId },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update extension error:", error);
    return NextResponse.json({ error: "Failed to update extension" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; extId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MANAGER"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.projectExtension.delete({ where: { id: params.extId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete extension error:", error);
    return NextResponse.json({ error: "Failed to delete extension" }, { status: 500 });
  }
}
