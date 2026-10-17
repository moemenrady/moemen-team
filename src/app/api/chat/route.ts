import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAssistantResponse } from "@/lib/chatAssistant";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userText = (lastMessage.content || "").toLowerCase();
    const userName = session?.user?.name || "عزيزي العميل";
    const userCompany = (session?.user as any)?.company || "شركتكم";
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    // Fetch this specific client's projects and financial data
    let clientProjects: any[] = [];
    if (userId || userEmail) {
      const client = await prisma.client.findFirst({
        where: {
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(userEmail ? [{ email: userEmail }] : []),
          ],
        },
        include: {
          projects: {
            include: {
              stages: { orderBy: { order: "asc" } },
              payments: { orderBy: { date: "asc" } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (client?.projects) {
        clientProjects = client.projects;
      }
    }

    // If an Anthropic API Key is available in environment, call Claude with personalized context
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const projectsSummary = clientProjects
          .map((p) => {
            const currentStage = p.stages?.find((s: any) => s.status === "current")?.name || "Initial";
            return `- Project: "${p.name}", Status: ${p.status}, Progress: ${p.progress}%, Budget: ${p.budget} EGP, Paid: ${p.paid} EGP, Current Stage: ${currentStage}`;
          })
          .join("\n");

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 800,
            system: `You are the personalized AI assistant inside Moemen Team's client portal (moemen-team.tech).
You are speaking specifically with client ${userName} representing ${userCompany}.
Here are the client's actual registered projects in the system:
${projectsSummary || "No projects currently in progress. The client can request a new project anytime using the 'New' button."}

Rules:
1. Always base answers about projects, progress, payments, and deadlines on their EXACT data listed above.
2. If asked about making a payment, explain that payments are settled via Bank Transfer, InstaPay, or Vodafone Cash, and that they can export an official PDF statement from their project page.
3. If asked about creating a new project, guide them to click 'New / طلب مشروع' in the sidebar to submit their specifications.
4. Language: If the user writes in Arabic, respond in fluent, professional, warm Arabic. If they write in English, respond in English.
5. Tone: Helpful, concise (2-4 sentences), professional, and accurate.`,
            messages: messages.map((m: any) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = (data.content || [])
            .map((b: any) => (b.type === "text" ? b.text : ""))
            .join("")
            .trim();
          if (replyText) {
            return NextResponse.json({ reply: replyText });
          }
        }
      } catch (anthropicErr) {
        console.error("Anthropic API error, using intelligent assistant fallback:", anthropicErr);
      }
    }

    const reply = await getAssistantResponse(userText, {
      name: userName,
      company: userCompany,
      userId: userId ?? undefined,
      email: userEmail ?? undefined,
      projects: clientProjects,
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({
      reply: "أهلاً بك، حدث خطأ مؤقت في الاتصال. يمكنك دائماً الضغط على New في القائمة الجانبية لتقديم طلب مشروع أو مراجعة تفاصيل مشاريعك ودفعاتك!",
    });
  }
}
