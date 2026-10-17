"use client";

import React from "react";
import Link from "next/link";
import { Printer, ArrowRight, Download, CheckCircle2, Building, Calendar, CreditCard } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  method: string;
  date?: string | null;
  note?: string | null;
  createdAt: string;
}

interface ProjectData {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  budget?: number | null;
  paid: number;
  contractDate?: string | null;
  contractStatus?: string | null;
  client?: {
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
  payments?: Payment[];
}

function fmtMoney(n?: number | null): string {
  if (!n) return "0 ج.م";
  return Math.round(n).toLocaleString("ar-EG") + " ج.م";
}

function fmtDate(d?: string | null): string {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return d;
  }
}

export function FinancialStatementView({ project }: { project: ProjectData }) {
  const payments = project.payments || [];
  const budget = project.budget || 0;
  const paid = project.paid || 0;
  const remaining = Math.max(0, budget - paid);
  const paidPercent = budget > 0 ? Math.round((paid / budget) * 100) : 0;
  const todayStr = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  const statementRef = `STMT-${project.id.slice(-6).toUpperCase()}-${new Date().getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-cairo text-gray-900" dir="rtl">
      {/* Top action bar - Hidden when printing */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 transition-colors"
        >
          <ArrowRight size={16} />
          <span>العودة إلى تفاصيل المشروع</span>
        </Link>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Printer size={18} />
          <span>طباعة / حفظ كـ PDF</span>
        </button>
      </div>

      {/* Printable Statement Document (A4 format) */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 print:p-0 print:shadow-none print:border-none print:rounded-none">
        {/* Document Header */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-emerald-800 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white font-bold text-lg">
                MT
              </div>
              <div>
                <h1 className="text-2xl font-black text-emerald-950 tracking-tight">MOEMEN TEAM</h1>
                <p className="text-xs text-gray-500 font-medium">للحلول البرمجية والتحول الرقمي المتكامل</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 pt-2">moemen-team.tech • info@moemen-team.tech</p>
          </div>

          <div className="text-left space-y-1">
            <span className="inline-block px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              كشف حساب مالي رسمي
            </span>
            <div className="text-xs text-gray-500">رقم المرجع: <strong className="text-gray-800 font-mono" dir="ltr">{statementRef}</strong></div>
            <div className="text-xs text-gray-500">تاريخ الإصدار: <strong className="text-gray-800">{todayStr}</strong></div>
          </div>
        </div>

        {/* Project & Client Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-emerald-900 border-b border-gray-200 pb-1 flex items-center gap-1.5">
              <Building size={14} className="text-emerald-700" />
              <span>بيانات المشروع</span>
            </h3>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">اسم المشروع:</span>
              <strong className="text-gray-900 font-semibold">{project.name}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">نوع المشروع:</span>
              <strong className="text-gray-800 uppercase">{project.type}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">تاريخ التعاقد:</span>
              <strong className="text-gray-800">{fmtDate(project.contractDate)}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">نسبة الإنجاز الفني:</span>
              <strong className="text-emerald-700">{project.progress}%</strong>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-emerald-900 border-b border-gray-200 pb-1 flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-700" />
              <span>بيانات العميل</span>
            </h3>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">اسم العميل:</span>
              <strong className="text-gray-900 font-semibold">{project.client?.name || "العميل"}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">الشركة / الجهة:</span>
              <strong className="text-gray-800">{project.client?.company || "-"}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">الهاتف:</span>
              <strong className="text-gray-800" dir="ltr">{project.client?.phone || "-"}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">البريد الإلكتروني:</span>
              <strong className="text-gray-800">{project.client?.email || "-"}</strong>
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <span className="text-xs text-gray-500 font-medium block">إجمالي قيمة التعاقد</span>
            <span className="text-lg md:text-xl font-black text-gray-900 mt-1 block">
              {fmtMoney(budget)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-xs text-emerald-700 font-medium block">إجمالي المبالغ المسددة</span>
            <span className="text-lg md:text-xl font-black text-emerald-800 mt-1 block">
              {fmtMoney(paid)}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">({paidPercent}% من إجمالي العقد)</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-xs text-amber-700 font-medium block">المتبقي المستحق</span>
            <span className="text-lg md:text-xl font-black text-amber-800 mt-1 block">
              {fmtMoney(remaining)}
            </span>
          </div>
        </div>

        {/* Detailed Transactions Table */}
        <div className="my-8">
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-700" />
            <span>سجل المعاملات والمدفوعات المسجلة بالتفصيل</span>
          </h3>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-100 border-b border-gray-200 text-gray-700">
                <tr>
                  <th className="py-3 px-4 font-bold text-center w-12">#</th>
                  <th className="py-3 px-4 font-bold">تاريخ الدفعة</th>
                  <th className="py-3 px-4 font-bold">طريقة السداد</th>
                  <th className="py-3 px-4 font-bold">البيان / الملاحظة</th>
                  <th className="py-3 px-4 font-bold text-left">المبلغ</th>
                  <th className="py-3 px-4 font-bold text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-4 text-center font-bold text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{fmtDate(p.date)}</td>
                    <td className="py-3 px-4 text-gray-700">
                      <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 font-medium">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs">{p.note || "دفعة معتمدة من العميل"}</td>
                    <td className="py-3 px-4 font-black text-emerald-800 text-sm text-left">
                      {fmtMoney(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} />
                        <span>معتمد ومحصل</span>
                      </span>
                    </td>
                  </tr>
                ))}

                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      لم يتم تسجيل أي دفعات مالية لهذا المشروع بعد.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold text-gray-900">
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-left font-black">إجمالي المدفوعات المسجلة:</td>
                  <td className="py-3 px-4 text-left font-black text-emerald-800 text-sm">
                    {fmtMoney(paid)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Verification and Signature */}
        <div className="pt-8 border-t border-gray-200 mt-12 grid grid-cols-2 gap-8 text-xs text-gray-500">
          <div>
            <p className="font-semibold text-gray-800 mb-1">إقرار صحة البيانات:</p>
            <p className="leading-relaxed">
              تم إصدار هذا الكشف آلياً استناداً إلى سجلات المدفوعات المسجلة في منصة Moemen Team وتعتبر هذه الوثيقة كشف حساب معتمد للتعاملات المالية الخاصة بالمشروع.
            </p>
          </div>

          <div className="text-left flex flex-col items-end justify-between">
            <div className="text-center w-48">
              <p className="font-semibold text-gray-800">إدارة الحسابات والمالية</p>
              <p className="text-[11px] text-gray-400">Moemen Team Financial Office</p>
              <div className="h-16 flex items-center justify-center my-1">
                <div className="w-24 h-12 border-2 border-emerald-800/40 rounded-lg flex items-center justify-center text-[10px] text-emerald-800 font-bold rotate-[-3deg] uppercase">
                  Verified Seal
                </div>
              </div>
              <p className="text-[10px] text-gray-400">معتمد إلكترونياً</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
