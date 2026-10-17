import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
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

    if (extension.status === "merged") {
      return NextResponse.json({ error: "Extension is already merged" }, { status: 400 });
    }

    const project = extension.project;

    // Parse extension payments to record in base project payments
    let extPayments: any[] = [];
    try {
      extPayments = JSON.parse(extension.payments || "[]");
    } catch {
      extPayments = [];
    }

    // Insert payments into project payments table
    const todayISO = new Date().toISOString().slice(0, 10);
    for (const p of extPayments) {
      if (p.amount && typeof p.amount === "number") {
        await prisma.payment.create({
          data: {
            projectId: project.id,
            amount: p.amount,
            method: p.method || "Bank Transfer",
            note: `[${extension.title}] ${p.note || "Extension Payment"}`,
            date: p.date || todayISO,
          }
        });
      }
    }

    // Calculate updated combined financials
    const combinedBudget = (project.budget || 0) + (extension.budget || 0);
    const combinedPaid = (project.paid || 0) + (extension.paid || 0);

    const newVersion = extension.versionTarget || project.versionLabel || "v2.0";
    const noteSummary = `Merged Extension: ${extension.title}`;
    const newVersionNote = project.versionNote 
      ? `${project.versionNote} | ${noteSummary}`
      : noteSummary;

    // Update the base project
    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: {
        budget: combinedBudget,
        paid: combinedPaid,
        versionLabel: newVersion,
        versionNote: newVersionNote,
        progress: 100,
        status: "completed",
      },
      include: {
        client: true,
        stages: { orderBy: { order: "asc" } },
        payments: { orderBy: { date: "asc" } },
        notes: { orderBy: { createdAt: "asc" } },
        fastFixIssues: { orderBy: { createdAt: "desc" } },
        extensions: { orderBy: { createdAt: "desc" } },
      }
    });

    // Mark extension as merged
    const updatedExtension = await prisma.projectExtension.update({
      where: { id: extension.id },
      data: {
        status: "merged",
        mergedAt: new Date(),
        progress: 100,
      }
    });

    // Also add a project note for transparency and audit trail
    await prisma.note.create({
      data: {
        projectId: project.id,
        author: "team",
        text: `🔀 [Project Evolution Merged]: "${extension.title}" has been successfully merged into the main project. Budget updated to ${combinedBudget} EGP, paid to ${combinedPaid} EGP, version upgraded to ${newVersion}.`,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Development extension merged successfully into project",
      project: updatedProject,
      extension: updatedExtension,
    });
  } catch (error) {
    console.error("Merge extension error:", error);
    return NextResponse.json({ error: "Failed to merge development extension" }, { status: 500 });
  }
}
