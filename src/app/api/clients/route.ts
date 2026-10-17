import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: { projects: true }
        },
        projects: {
          select: {
            id: true,
            name: true,
            budget: true,
            paid: true,
            status: true,
            progress: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'MANAGER'].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }

    let createdUserId: string | null = null;
    let accountCreated = false;

    // If admin requested creating a login account for this client
    if (body.createAccount && body.email && body.password) {
      const email = body.email.trim();
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        createdUserId = existingUser.id;
      } else {
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const initials = body.name ? body.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : "CL";
        const newUser = await prisma.user.create({
          data: {
            name: body.name.trim(),
            email,
            password: hashedPassword,
            role: "CLIENT",
            company: body.company || "عميل خاص",
            initials,
            phone: body.phone,
            clientSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          }
        });
        createdUserId = newUser.id;
        accountCreated = true;
      }
    }

    const client = await prisma.client.create({
      data: {
        name: body.name.trim(),
        email: body.email ? body.email.trim() : null,
        phone: body.phone ? body.phone.trim() : null,
        company: body.company ? body.company.trim() : null,
        address: body.address ? body.address.trim() : null,
        notes: body.notes ? body.notes.trim() : null,
        userId: createdUserId,
      },
      include: {
        user: {
          select: { id: true, email: true, name: true, role: true }
        }
      }
    });

    return NextResponse.json({
      ...client,
      accountCreated,
      accountEmail: body.email,
    }, { status: 201 });
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json({ error: "Invalid data or client creation failed" }, { status: 400 });
  }
}
