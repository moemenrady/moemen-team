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
      include: { client: true },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const role = (session.user as any).role;
    if (role === "CLIENT") {
      const client = await prisma.client.findFirst({
        where: {
          OR: [
            { userId: session.user.id },
            { email: session.user.email || "" },
          ],
        },
      });
      if (!client || project.clientId !== client.id) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
      }
    }

    let delivery = await prisma.projectDelivery.findUnique({
      where: { projectId: params.id },
    });

    if (!delivery) {
      // Return a default structure
      return NextResponse.json({
        projectId: params.id,
        status: "preparing",
        title: "وثيقة وبيانات تسليم المشروع",
        summary: `تم إنجاز مشروع (${project.name}) بنجاح وتسليمه من قبل فريق مؤمن تيم الهندسي.`,
        instructions: "يرجى الاطلاع على بيانات الدخول المرفقة أدناه والاحتفاظ بها في مكان آمن. في حال واجهتكم أي استفسارات، فريق الدعم الفني متاح دائماً لمساعدتكم.",
        credentials: "[]",
        assets: "[]",
        supportPeriod: "دعم فني وضمان مجاني لمدة شهرين بعد التسليم",
        supportContact: "support@moemen-team.tech | WhatsApp الدعم الفني",
        deliveredAt: null,
        clientSignedAt: null,
        clientFeedback: null,
      });
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("Get delivery error:", error);
    return NextResponse.json({ error: "Failed to fetch delivery" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { client: true },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const role = (session.user as any).role;
    const isAdminOrManager = ["ADMIN", "MANAGER"].includes(role);
    const body = await req.json();

    if (!isAdminOrManager) {
      // Client actions: Confirmation or Revision Request
      const client = await prisma.client.findFirst({
        where: {
          OR: [
            { userId: session.user.id },
            { email: session.user.email || "" },
          ],
        },
      });
      if (!client || project.clientId !== client.id) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
      }

      const clientAction = body.action; // "confirm" | "revision"

      if (clientAction === "confirm") {
        const updated = await prisma.projectDelivery.upsert({
          where: { projectId: params.id },
          update: {
            status: "delivered",
            clientSignedAt: new Date(),
            clientFeedback: body.feedback || "تم استلام المشروع واعتماده بنجاح. شكراً لفريق مؤمن تيم!",
          },
          create: {
            projectId: params.id,
            status: "delivered",
            clientSignedAt: new Date(),
            clientFeedback: body.feedback || "تم استلام المشروع واعتماده بنجاح. شكراً لفريق مؤمن تيم!",
          },
        });

        // Also ensure project status is marked completed if not already
        await prisma.project.update({
          where: { id: params.id },
          data: { status: "completed", progress: 100 },
        });

        return NextResponse.json(updated);
      } else if (clientAction === "revision") {
        const updated = await prisma.projectDelivery.upsert({
          where: { projectId: params.id },
          update: {
            status: "revision_requested",
            clientFeedback: body.feedback || "طلب مراجعة أو استفسار حول التسليم",
          },
          create: {
            projectId: params.id,
            status: "revision_requested",
            clientFeedback: body.feedback || "طلب مراجعة أو استفسار حول التسليم",
          },
        });
        return NextResponse.json(updated);
      } else {
        return NextResponse.json({ error: "Invalid client action" }, { status: 400 });
      }
    }

    // Admin/Manager update
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.instructions !== undefined) updateData.instructions = body.instructions;
    if (body.credentials !== undefined) {
      updateData.credentials = typeof body.credentials === "string" ? body.credentials : JSON.stringify(body.credentials);
    }
    if (body.assets !== undefined) {
      updateData.assets = typeof body.assets === "string" ? body.assets : JSON.stringify(body.assets);
    }
    if (body.supportPeriod !== undefined) updateData.supportPeriod = body.supportPeriod;
    if (body.supportContact !== undefined) updateData.supportContact = body.supportContact;
    if (body.deliveredAt !== undefined) {
      updateData.deliveredAt = body.deliveredAt ? new Date(body.deliveredAt) : new Date();
    }
    if (body.clientFeedback !== undefined) updateData.clientFeedback = body.clientFeedback;

    // If admin marks as delivered, optionally sync project status to completed
    if (body.status === "delivered") {
      updateData.deliveredAt = updateData.deliveredAt || new Date();
      await prisma.project.update({
        where: { id: params.id },
        data: { status: "completed", progress: 100 },
      });
    }

    const delivery = await prisma.projectDelivery.upsert({
      where: { projectId: params.id },
      update: updateData,
      create: {
        projectId: params.id,
        status: body.status || "preparing",
        title: body.title || "وثيقة وبيانات تسليم المشروع",
        summary: body.summary || `تم إنجاز وتسليم مشروع (${project.name}) بنجاح.`,
        instructions: body.instructions || "",
        credentials: typeof body.credentials === "string" ? body.credentials : JSON.stringify(body.credentials || []),
        assets: typeof body.assets === "string" ? body.assets : JSON.stringify(body.assets || []),
        supportPeriod: body.supportPeriod || "دعم فني وضمان مجاني لمدة شهرين بعد التسليم",
        supportContact: body.supportContact || "support@moemen-team.tech | WhatsApp الدعم الفني",
        deliveredAt: body.status === "delivered" ? new Date() : null,
      },
    });

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("Update delivery error:", error);
    return NextResponse.json({ error: "Failed to update delivery" }, { status: 500 });
  }
}
