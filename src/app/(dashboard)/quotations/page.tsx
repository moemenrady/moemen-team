import Link from "next/link";
import { Plus } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function QuotationsPage() {
  const quotations = await prisma.quotation.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 rtl:text-right" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-900">عروض الأسعار (Quotations)</h1>
        <Link href="/quotations/new" className="bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-emerald-800">
          <Plus size={20} />
          <span>إنشاء عرض سعر</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">العنوان</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">العميل</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">السعر النهائي</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">الحالة</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">صالح حتى</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {quotations.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{q.title}</td>
                <td className="px-6 py-4 text-emerald-700">{q.client.name}</td>
                <td className="px-6 py-4 font-bold">${q.finalPrice}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    q.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                    q.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {q.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {q.validUntil ? new Date(q.validUntil).toLocaleDateString('ar-EG') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
