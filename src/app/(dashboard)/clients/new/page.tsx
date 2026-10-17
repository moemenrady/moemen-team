"use client";
import { useRouter } from "next/navigation";

export default function NewClientPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      router.push('/clients');
    }
  };

  return (
    <div className="p-6 rtl:text-right max-w-3xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold text-emerald-900 mb-6">إضافة عميل جديد</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">اسم العميل</label>
            <input name="name" required className="w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الشركة</label>
            <input name="company" className="w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
            <input type="email" name="email" className="w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
            <input type="tel" name="phone" className="w-full border rounded-md p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">العنوان</label>
            <input name="address" className="w-full border rounded-md p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea name="notes" rows={3} className="w-full border rounded-md p-2"></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded-md hover:bg-gray-50">إلغاء</button>
          <button type="submit" className="px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800">حفظ العميل</button>
        </div>
      </form>
    </div>
  );
}
