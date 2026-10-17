import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage({
  searchParams,
}: {
  searchParams?: { view?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any)?.role;
  // If user is Admin or Manager, direct them immediately to the Admin Management Console
  if ((role === "ADMIN" || role === "MANAGER") && searchParams?.view !== "client") {
    redirect("/admin");
  }

  return <ClientDashboard initialPage="home" />;
}
