import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MANAGER"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.payment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.amount !== undefined) {
      const parsed = typeof body.amount === "number" ? body.amount : parseFloat(body.amount);
      if (!isNaN(parsed) && parsed > 0) updateData.amount = parsed;
    }
    if (body.method !== undefined) updateData.method = body.method;
    if (body.note !== undefined) updateData.note = body.note;
    if (body.date !== undefined) updateData.date = body.date;

    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        project: {
          include: { client: true },
        },
      },
    });

    // Recalculate total paid
    if (existing.projectId) {
      const allPayments = await prisma.payment.findMany({
        where: { projectId: existing.projectId },
        select: { amount: true },
      });
      const totalPaid = allPayments.reduce((acc, p) => acc + p.amount, 0);
      await prisma.project.update({
        where: { id: existing.projectId },
        data: { paid: totalPaid },
      });
    }

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error("Update payment error:", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MANAGER"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.payment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const projectId = existing.projectId;

    await prisma.payment.delete({
      where: { id: params.id },
    });

    // Recalculate total paid
    if (projectId) {
      const allPayments = await prisma.payment.findMany({
        where: { projectId },
        select: { amount: true },
      });
      const totalPaid = allPayments.reduce((acc, p) => acc + p.amount, 0);
      await prisma.project.update({
        where: { id: projectId },
        data: { paid: totalPaid },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete payment error:", error);
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 400 });
  }
}
