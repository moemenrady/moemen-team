"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetch('/api/clients').then(res => res.json()).then(data => setClients(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        budget: data.budget ? parseFloat(data.budget as string) : undefined
      })
    });

    if (res.ok) {
      router.push('/projects');
    }
  };

  return (
    <div className="p-6 rtl:text-right max-w-3xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold text-emerald-900 mb-6">إنشاء مشروع جديد</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">اسم المشروع</label>
          <input name="name" required className="w-full border rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">العميل</label>
            <select name="clientId" required className="w-full border rounded-md p-2">
              <option value="">اختر العميل</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نوع المشروع</label>
            <select name="type" required className="w-full border rounded-md p-2">
              <option value="website">موقع إلكتروني (Website)</option>
              <option value="mobile">تطبيق موبايل (Mobile App)</option>
              <option value="automation">أتمتة (Automation)</option>
              <option value="desktop">تطبيق سطح المكتب (Desktop App)</option>
              <option value="email_service">خدمة بريد إلكتروني (Email Service)</option>
              <option value="erp">نظام ERP</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">الميزانية (اختياري)</label>
            <input type="number" name="budget" className="w-full border rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الموعد النهائي</label>
            <input type="date" name="deadline" className="w-full border rounded-md p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">وصف المشروع</label>
          <textarea name="description" rows={4} className="w-full border rounded-md p-2"></textarea>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded-md hover:bg-gray-50">إلغاء</button>
          <button type="submit" className="px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800">إنشاء المشروع</button>
        </div>
      </form>
    </div>
  );
}
