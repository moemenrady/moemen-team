import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const isAdminOrManager = ["ADMIN", "MANAGER"].includes(role);

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  try {
    let whereClause: any = {};
    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (role === "CLIENT") {
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
      whereClause.project = { clientId: client.id };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Fetch payments error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MANAGER"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, amount, method, note, date } = body;

    if (!projectId || amount === undefined) {
      return NextResponse.json({ error: "Project and amount are required" }, { status: 400 });
    }

    const parsedAmount = typeof amount === "number" ? amount : parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    const todayISO = new Date().toISOString().slice(0, 10);

    const payment = await prisma.payment.create({
      data: {
        projectId,
        amount: parsedAmount,
        method: method || "Bank Transfer",
        note: note?.trim() || null,
        date: date || todayISO,
      },
      include: {
        project: {
          include: { client: true },
        },
      },
    });

    // Recalculate total paid for this project
    const allProjectPayments = await prisma.payment.findMany({
      where: { projectId },
      select: { amount: true },
    });

    const totalPaid = allProjectPayments.reduce((acc, p) => acc + p.amount, 0);

    await prisma.project.update({
      where: { id: projectId },
      data: { paid: totalPaid },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
