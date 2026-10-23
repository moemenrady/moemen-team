import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (!["ADMIN", "MANAGER"].includes(role)) {
    return NextResponse.json({ error: "Only admins can upload delivery documents" }, { status: 403 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine type
    const originalName = file.name || "file";
    const ext = path.extname(originalName).toLowerCase();
    
    let docType = "document";
    if (ext === ".pdf") docType = "pdf";
    else if ([".xls", ".xlsx", ".csv"].includes(ext)) docType = "excel";
    else if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)) docType = "image";
    else if ([".mp4", ".mov", ".avi", ".webm", ".mkv"].includes(ext)) docType = "video";
    else if ([".zip", ".rar", ".7z", ".tar", ".gz"].includes(ext)) docType = "archive";

    // Format human-readable file size
    const sizeInBytes = buffer.length;
    let fileSize = "";
    if (sizeInBytes < 1024) fileSize = `${sizeInBytes} B`;
    else if (sizeInBytes < 1024 * 1024) fileSize = `${(sizeInBytes / 1024).toFixed(1)} KB`;
    else fileSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;

    // Target directory: public/uploads/delivery/[projectId]/
    const uploadDir = path.join(process.cwd(), "public", "uploads", "delivery", params.id);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Clean safe filename
    const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_").slice(0, 50);
    const uniqueSuffix = Date.now().toString(36);
    const finalFileName = `${safeBase}-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadDir, finalFileName);

    await fs.promises.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/delivery/${params.id}/${finalFileName}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      fileName: originalName,
      fileSize: fileSize,
      type: docType,
    });
  } catch (error) {
    console.error("Upload delivery file error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
