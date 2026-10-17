import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Edit, Mail, Phone, MapPin, Building } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      projects: true,
      invoices: true,
      quotations: true
    }
  });

  if (!client) return <div className="p-6">Client not found</div>;

  return (
    <div className="p-6 rtl:text-right" dir="rtl">
      <Link href="/clients" className="text-emerald-700 flex items-center gap-2 mb-4 hover:underline w-fit">
        <ArrowRight size={16} className="rotate-180" /> العودة إلى العملاء
      </Link>
      
      <div className="bg-white rounded-lg border p-6 mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{client.name}</h1>
          <div className="space-y-2 text-gray-600">
            {client.email && <p className="flex items-center gap-2"><Mail size={18} /> {client.email}</p>}
            {client.phone && <p className="flex items-center gap-2"><Phone size={18} /> {client.phone}</p>}
            {client.company && <p className="flex items-center gap-2"><Building size={18} /> {client.company}</p>}
            {client.address && <p className="flex items-center gap-2"><MapPin size={18} /> {client.address}</p>}
          </div>
        </div>
        <button className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-emerald-100">
          <Edit size={18} /> تعديل
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border">
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">مشاريع العميل</h2>
            <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">{client.projects.length}</span>
          </div>
          <div className="p-6 divide-y">
            {client.projects.length > 0 ? client.projects.map(p => (
              <div key={p.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                <Link href={`/projects/${p.id}`} className="font-medium text-emerald-700 hover:underline">{p.name}</Link>
                <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">{p.status}</span>
              </div>
            )) : <p className="text-gray-500 text-center py-4">لا توجد مشاريع</p>}
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">الفواتير</h2>
            <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">{client.invoices.length}</span>
          </div>
          <div className="p-6 divide-y">
            {client.invoices.length > 0 ? client.invoices.map(inv => (
              <div key={inv.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                <span className="font-medium">#{inv.invoiceNumber}</span>
                <span className="font-bold">${inv.amount}</span>
                <span className={`text-sm px-2 py-1 rounded ${inv.status === 'PAID' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {inv.status}
                </span>
              </div>
            )) : <p className="text-gray-500 text-center py-4">لا توجد فواتير</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
