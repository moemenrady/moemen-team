import Link from "next/link";
import { Plus, Search, Edit } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      _count: {
        select: { projects: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 rtl:text-right" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-900">العملاء (Clients)</h1>
        <Link href="/clients/new" className="bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-emerald-800">
          <Plus size={20} />
          <span>إضافة عميل (Add Client)</span>
        </Link>
      </div>

      <div className="mb-6 max-w-md relative">
        <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        <input type="text" placeholder="ابحث عن عميل..." className="w-full pr-10 pl-4 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">الاسم</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">الشركة</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">البريد الإلكتروني</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">رقم الهاتف</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">المشاريع</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-emerald-900">
                  <Link href={`/clients/${client.id}`}>{client.name}</Link>
                </td>
                <td className="px-6 py-4 text-gray-600">{client.company || '-'}</td>
                <td className="px-6 py-4 text-gray-600">{client.email || '-'}</td>
                <td className="px-6 py-4 text-gray-600">{client.phone || '-'}</td>
                <td className="px-6 py-4 text-gray-600">
                  <span className="bg-emerald-100 text-emerald-800 py-1 px-2 rounded-full text-xs">
                    {client._count.projects}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/clients/${client.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Edit size={16} /> تعديل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
