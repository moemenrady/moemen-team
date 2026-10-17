import { ClientDashboard } from "@/components/dashboard/ClientDashboard";

export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  return <ClientDashboard initialPage="projects" />;
}
