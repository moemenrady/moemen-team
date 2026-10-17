import { ClientDashboard } from "@/components/dashboard/ClientDashboard";

export const dynamic = "force-dynamic";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <ClientDashboard initialPage="project-detail" initialProjectId={params.id} />;
}
