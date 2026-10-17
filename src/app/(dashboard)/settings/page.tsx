import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="p-6 rtl:text-right max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold text-emerald-900 mb-8">الإعدادات (Settings)</h1>

      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold border-b pb-4 mb-4">الملف الشخصي</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">الاسم</label>
            <input type="text" className="w-full border rounded-md p-2 bg-gray-50" defaultValue={session?.user?.name || ''} readOnly />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">البريد الإلكتروني</label>
            <input type="email" className="w-full border rounded-md p-2 bg-gray-50" defaultValue={session?.user?.email || ''} readOnly />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">الدور</label>
            <input type="text" className="w-full border rounded-md p-2 bg-gray-50" defaultValue={(session?.user as any)?.role || ''} readOnly />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold border-b pb-4 mb-4">معلومات الشركة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">اسم الشركة</label>
            <input type="text" className="w-full border rounded-md p-2" defaultValue="Moemen Team" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">الهاتف</label>
            <input type="text" className="w-full border rounded-md p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">العنوان</label>
            <textarea className="w-full border rounded-md p-2" rows={3}></textarea>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="bg-emerald-700 text-white px-6 py-2 rounded-md hover:bg-emerald-800">حفظ الإعدادات</button>
        </div>
      </div>
    </div>
  );
}
