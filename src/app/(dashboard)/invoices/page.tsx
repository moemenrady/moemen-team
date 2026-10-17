import Link from "next/link";
import { Plus } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { client: true, project: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 rtl:text-right" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-emerald-900">الفواتير (Invoices)</h1>
        <Link href="/invoices/new" className="bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-emerald-800">
          <Plus size={20} />
          <span>إنشاء فاتورة</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">رقم الفاتورة</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">العميل</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">المشروع</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">المبلغ</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">الحالة</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-500">تاريخ الاستحقاق</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">#{invoice.invoiceNumber}</td>
                <td className="px-6 py-4 text-emerald-700 font-medium">{invoice.client.name}</td>
                <td className="px-6 py-4 text-gray-600">{invoice.project?.name || '-'}</td>
                <td className="px-6 py-4 font-bold">${invoice.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('ar-EG') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
