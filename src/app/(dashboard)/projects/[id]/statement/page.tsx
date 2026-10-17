import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { FinancialStatementView } from "@/components/dashboard/FinancialStatementView";

export const dynamic = "force-dynamic";

export default async function ProjectStatementPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as any)?.role;
  const isClient = role === "CLIENT";

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      payments: { orderBy: { date: "asc" } },
      stages: { orderBy: { order: "asc" } },
    },
  });

  if (!project) notFound();

  // If client, ensure they own this project
  if (isClient) {
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { email: session.user.email || "" },
        ],
      },
    });

    if (!client || project.clientId !== client.id) {
      redirect("/");
    }
  }

  return <FinancialStatementView project={project as any} />;
}
