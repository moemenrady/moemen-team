import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, company, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب ألا تقل عن 6 أحرف" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const initials = name
      .trim()
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CL";

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: "CLIENT",
        company: company?.trim() || "عميل خاص",
        initials,
        phone: phone?.trim() || null,
        clientSince: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      },
    });

    // Create or link client profile
    let client = await prisma.client.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { userId: user.id }],
      },
    });

    if (client) {
      await prisma.client.update({
        where: { id: client.id },
        data: { userId: user.id },
      });
    } else {
      client = await prisma.client.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          company: company?.trim() || "عميل خاص",
          phone: phone?.trim() || null,
          userId: user.id,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "تم إنشاء الحساب بنجاح",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى" },
      { status: 500 }
    );
  }
}
