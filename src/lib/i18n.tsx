"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar";

export const translations = {
  en: {
    // Navigation & Shell
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.fastFixing": "Fast Fixing",
    "nav.invoices": "Invoices",
    "nav.clients": "Clients",
    "nav.adminConsole": "Admin Console",
    "nav.logout": "Log Out",
    "nav.newProject": "New Project",
    "nav.backToProjects": "Back to Projects",
    "brand.tagline": "We build solutions that grow businesses.",

    // Topbar
    "topbar.search": "Search...",
    "topbar.contact": "Contact Team",
    "topbar.language": "Language",

    // Home Hero & AI
    "home.greeting": "Hey {name}, what are we building today?",
    "home.subtitle": "Ask Moemen AI, or jump straight into your projects below.",
    "home.stats": "You have {active} active and {completed} completed projects with us.",
    "home.chatPlaceholder": "Message Moemen AI…",
    "home.startWebsite": "Start a website",
    "home.checkProjects": "Check my projects",
    "home.askAi": "Ask Moemen AI",
    "home.yourProjects": "Your Projects",
    "home.seeAll": "See all",

    // Project Types
    "type.website": "Website",
    "type.website.desc": "Marketing sites, stores & web apps",
    "type.mobile": "Mobile App",
    "type.mobile.desc": "iOS & Android native apps",
    "type.automation": "Automation",
    "type.automation.desc": "Workflows, integrations & bots",
    "type.desktop": "Desktop System",
    "type.desktop.desc": "Custom desktop software",
    "type.email_service": "Email Service",
    "type.email_service.desc": "Dedicated mail servers, newsletters & transactional email",
    "type.erp": "ERP System",

    // Project Statuses
    "status.requested": "Requested",
    "status.in_review": "In Review",
    "status.in_progress": "In Progress",
    "status.completed": "Completed",
    "status.delivered": "Delivered",
    "status.merged": "Merged",

    // Project Details
    "project.contractDate": "Contract Date",
    "project.timeline": "Timeline",
    "project.progress": "Progress",
    "project.daysRemaining": "{days} days remaining",
    "project.daysTotal": "{elapsed} / {total} days",
    "project.estCompletion": "Est. completion {date}",
    "project.stages": "Development Stages",
    "project.financials": "Financials",
    "project.totalAgreed": "Total Agreed",
    "project.paid": "Paid",
    "project.remaining": "Remaining",
    "project.exportPdf": "Export Statement PDF",
    "project.quotation": "Agreed Quotation",
    "project.latestVersion": "Design & Latest Version",
    "project.notes": "Notes",
    "project.addNote": "Add a note or feedback…",
    "project.sendNote": "Send Note",

    // Fast Fixing A Problem Feature
    "fastFix.title": "Fast Fixing A Problem",
    "fastFix.badge": "Fast Fixing",
    "fastFix.btn": "⚡ Fast Fixing A Problem",
    "fastFix.subtitle": "Snap a photo or screenshot of any bug/issue, explain what's wrong, and our engineering team will jump on it immediately.",
    "fastFix.selectProject": "Select Project",
    "fastFix.issueTitle": "Issue Summary / Title",
    "fastFix.issueTitlePlaceholder": "e.g. Checkout button not responding on mobile",
    "fastFix.explainingText": "Explaining Text / Details",
    "fastFix.explainingPlaceholder": "Describe what happened, error message, or steps to reproduce…",
    "fastFix.photoLabel": "Take Photo or Upload Screenshot",
    "fastFix.takePhoto": "📷 Take Photo",
    "fastFix.uploadPhoto": "🖼️ Upload Image",
    "fastFix.removePhoto": "Remove photo",
    "fastFix.submit": "Submit Fast Fixing Request",
    "fastFix.submitting": "Submitting...",
    "fastFix.reportedIssues": "Fast Fixing & Bug Reports",
    "fastFix.noIssues": "No issues reported for this project. Everything is running smoothly!",
    "fastFix.status.pending": "Pending Review",
    "fastFix.status.on_it": "On It (Working on fix)",
    "fastFix.status.fixed": "Fixed & Resolved",
    "fastFix.durationLabel": "Time taken to fix",
    "fastFix.durationOngoing": "On it for {time}",
    "fastFix.durationSolved": "Solved in {time}",
    "fastFix.durationPending": "Queued for engineer",
    "fastFix.viewPhoto": "View Screenshot",
    "fastFix.adminNotes": "Team Resolution Notes",
    "fastFix.markOnIt": "⚡ Set to 'On It'",
    "fastFix.markFixed": "✅ Mark as 'Fixed'",

    // Project Extension / Evolution Feature
    "ext.title": "Project Development & Evolution",
    "ext.requestBtn": "🚀 Request New Development / Phase 2",
    "ext.completedBanner": "Project Completed & Fully Paid — Ready for New Evolution Phase!",
    "ext.completedBannerSub": "You can request new features, enhancements, or second-stage development inside this same project.",
    "ext.modalTitle": "Request New Development Phase",
    "ext.extTitle": "Development Title / Feature Set",
    "ext.extTitlePlaceholder": "e.g. Add Multi-Vendor Marketplace & Automated Invoicing",
    "ext.extDesc": "Scope & Requirements Description",
    "ext.extDescPlaceholder": "Detail the new modifications, user flows, and features needed…",
    "ext.extBudget": "Proposed Budget / Investment (Optional)",
    "ext.extTargetDays": "Desired Timeline (Days)",
    "ext.versionTarget": "Target Version Label",
    "ext.submit": "Submit Development Request",
    "ext.activeExtensions": "New Development Extensions",
    "ext.noExtensions": "No development extensions requested yet.",
    "ext.progress": "Extension Progress",
    "ext.budget": "Extension Budget",
    "ext.paid": "Extension Paid",
    "ext.payments": "Installments & Payments",
    "ext.addPayment": "Add Installment",
    "ext.mergeBtn": "🔀 Merge Development into Base Project",
    "ext.mergeSuccess": "Merged successfully into base project!",
    "ext.mergedBadge": "Merged into Project Base",
    "ext.mergedDate": "Merged on {date}",

    // Admin Dashboard
    "admin.consoleTitle": "Admin Management Console",
    "admin.overview": "Overview",
    "admin.projects": "Projects",
    "admin.fastFixingTab": "⚡ Fast Fixing ({count})",
    "admin.clients": "Clients",
    "admin.payments": "Payments",
    "admin.notes": "Notes",
    "admin.totalProjects": "Total Projects",
    "admin.totalBudget": "Total Value",
    "admin.totalPaid": "Collected",
    "admin.totalRemaining": "Remaining",
    "admin.activeFixes": "Active Bug Fixes",
    "admin.newProject": "New Project",
    "admin.newClient": "New Client",
    "admin.recordPayment": "Record Payment",
    "admin.projectFilter": "Filter Type",
    "admin.statusFilter": "Filter Status",
    "admin.search": "Search projects, clients...",
    "admin.manageExtensions": "Development Phases ({count})",
  },
  ar: {
    // Navigation & Shell
    "nav.home": "الرئيسية",
    "nav.projects": "المشاريع",
    "nav.fastFixing": "التصليح السريع",
    "nav.invoices": "الفواتير",
    "nav.clients": "العملاء",
    "nav.adminConsole": "لوحة تحكم الإدارة",
    "nav.logout": "تسجيل الخروج",
    "nav.newProject": "مشروع جديد",
    "nav.backToProjects": "العودة للمشاريع",
    "brand.tagline": "نبني حلولاً تقنية تنمي وتطور أعمالكم.",

    // Topbar
    "topbar.search": "بحث...",
    "topbar.contact": "تواصل مع الفريق",
    "topbar.language": "اللغة",

    // Home Hero & AI
    "home.greeting": "أهلاً {name}، ماذا سنبني معاً اليوم؟",
    "home.subtitle": "استشر ذكاء مؤمن الاصطناعي، أو استعرض مشاريعك أدناه مباشرة.",
    "home.stats": "لديك {active} مشاريع نشطة و {completed} مشاريع مكتملة معنا.",
    "home.chatPlaceholder": "اكتب رسالة لمساعد مؤمن الذكي…",
    "home.startWebsite": "إنشاء موقع إلكتروني",
    "home.checkProjects": "متابعة مشاريعي",
    "home.askAi": "اسأل ذكاء مؤمن",
    "home.yourProjects": "مشاريعك",
    "home.seeAll": "عرض الكل",

    // Project Types
    "type.website": "موقع إلكتروني (Website)",
    "type.website.desc": "مواقع تعريفية، متاجر ومنصات ويب متكاملة",
    "type.mobile": "تطبيق موبايل (Mobile App)",
    "type.mobile.desc": "تطبيقات هواتف ذكية لنظامي iOS وأندرويد",
    "type.automation": "أتمتة وسير عمل (Automation)",
    "type.automation.desc": "ربط أنظمة، روبوتات وأتمتة العمليات",
    "type.desktop": "نظام سطح المكتب (Desktop)",
    "type.desktop.desc": "برمجيات مخصصة لأجهزة الكمبيوتر",
    "type.email_service": "خدمة البريد الإلكتروني (Email Service)",
    "type.email_service.desc": "خوادم بريد مخصصة، نشرات بريدية وإيميلات المعاملات",
    "type.erp": "نظام ERP متكامل",

    // Project Statuses
    "status.requested": "تم الطلب",
    "status.in_review": "قيد المراجعة",
    "status.in_progress": "قيد التنفيذ",
    "status.completed": "مكتمل",
    "status.delivered": "تم التسليم",
    "status.merged": "تم الدمج",

    // Project Details
    "project.contractDate": "تاريخ العقد",
    "project.timeline": "الجدول الزمني",
    "project.progress": "نسبة الإنجاز",
    "project.daysRemaining": "متبقي {days} يوم",
    "project.daysTotal": "{elapsed} من أصل {total} يوم",
    "project.estCompletion": "التسليم المتوقع {date}",
    "project.stages": "مراحل التنفيذ",
    "project.financials": "البيانات المالية",
    "project.totalAgreed": "إجمالي المتفق عليه",
    "project.paid": "المسدد",
    "project.remaining": "المتبقي",
    "project.exportPdf": "تصدير كشف حساب PDF",
    "project.quotation": "عرض السعر المعتمد",
    "project.latestVersion": "التصميم وآخر إصدار",
    "project.notes": "الملاحظات",
    "project.addNote": "أضف ملاحظة أو تعليق…",
    "project.sendNote": "إرسال الملاحظة",

    // Fast Fixing A Problem Feature
    "fastFix.title": "تصليح سريع لعطل (Fast Fixing A Problem)",
    "fastFix.badge": "تصليح سريع",
    "fastFix.btn": "⚡ تصليح سريع لعطل",
    "fastFix.subtitle": "التقط صورة أو لقطة شاشة لأي عطل في المشروع، واكتب توضيح المشكلة وسيباشر فريقنا الهندسي العمل عليها فوراً.",
    "fastFix.selectProject": "اختر المشروع",
    "fastFix.issueTitle": "عنوان المشكلة / ملخص العطل",
    "fastFix.issueTitlePlaceholder": "مثال: زر إتمام الطلب لا يستجيب في الموبايل",
    "fastFix.explainingText": "شرح المشكلة بالتفصيل",
    "fastFix.explainingPlaceholder": "اكتب نصاً يوضح ما حدث، الخطوات، أو أي رسالة خطأ ظهرت…",
    "fastFix.photoLabel": "التقاط صورة للعطل أو رفع لقطة شاشة",
    "fastFix.takePhoto": "📷 تصوير العطل",
    "fastFix.uploadPhoto": "🖼️ رفع صورة",
    "fastFix.removePhoto": "حذف الصورة",
    "fastFix.submit": "تسجيل طلب التصليح السريع",
    "fastFix.submitting": "جاري التسجيل...",
    "fastFix.reportedIssues": "الأعطال المسجلة والمتابعة",
    "fastFix.noIssues": "لا توجد أعطال مسجلة لهذا المشروع. كل شيء يعمل بكفاءة!",
    "fastFix.status.pending": "قيد المراجعة",
    "fastFix.status.on_it": "جارٍ العمل عليها (On It)",
    "fastFix.status.fixed": "تم الإصلاح بنجاح (Fixed)",
    "fastFix.durationLabel": "المدة المستغرقة للحل",
    "fastFix.durationOngoing": "جارٍ العمل عليها منذ {time}",
    "fastFix.durationSolved": "تم الحل خلال {time}",
    "fastFix.durationPending": "في انتظار بدء المهندس",
    "fastFix.viewPhoto": "معاينة لقطة العطل",
    "fastFix.adminNotes": "ملاحظات حل المشكلة من الفريق",
    "fastFix.markOnIt": "⚡ بدء العمل (On It)",
    "fastFix.markFixed": "✅ تأكيد الإصلاح (Fixed)",

    // Project Extension / Evolution Feature
    "ext.title": "تطوير وترقية المشروع",
    "ext.requestBtn": "🚀 طلب تطوير جديد / المرحلة الثانية",
    "ext.completedBanner": "المشروع مكتمل ومسدد بالكامل — جاهز للتطويرات والترقيات الجديدة!",
    "ext.completedBannerSub": "يمكنك طلب ميزات جديدة وتوسيع نطاق المشروع مع بقاء كل البيانات منظمة داخل نفس المشروع.",
    "ext.modalTitle": "طلب مرحلة تطوير جديدة في نفس المشروع",
    "ext.extTitle": "عنوان التطوير الجديد / الميزات المطلوبة",
    "ext.extTitlePlaceholder": "مثال: إضافة نظام نقاط الولاء وبوابة دفع إلكترونية جديدة",
    "ext.extDesc": "وصف المتطلبات والتعديلات المطلوبة",
    "ext.extDescPlaceholder": "اكتب تفاصيل التعديلات المطلوبة، الإضافات، والميزات بالتفصيل…",
    "ext.extBudget": "الميزانية المقترحة / التكلفة (اختياري)",
    "ext.extTargetDays": "المدة الزمنية المقترحة (بالأيام)",
    "ext.versionTarget": "رقم الإصدار المستهدف",
    "ext.submit": "إرسال طلب التطوير للإدارة",
    "ext.activeExtensions": "طلبات ومراحل التطوير المضافة",
    "ext.noExtensions": "لم يتم تسجيل طلبات تطوير إضافية حتى الآن.",
    "ext.progress": "نسبة إنجاز التطوير",
    "ext.budget": "تكلفة التطوير",
    "ext.paid": "المسدد للتطوير",
    "ext.payments": "دفعات التطوير",
    "ext.addPayment": "تسجيل دفعة تطوير",
    "ext.mergeBtn": "🔀 دمج التطوير في المشروع الأساسي (Merge)",
    "ext.mergeSuccess": "تم دمج التطوير بنجاح في المشروع الأساسي وتحديث الميزانية والإصدار!",
    "ext.mergedBadge": "تم الدمج في المشروع الأساسي",
    "ext.mergedDate": "تم الدمج بتاريخ {date}",

    // Admin Dashboard
    "admin.consoleTitle": "لوحة تحكم الإدارة",
    "admin.overview": "نظرة عامة",
    "admin.projects": "المشاريع",
    "admin.fastFixingTab": "⚡ التصليح السريع ({count})",
    "admin.clients": "العملاء",
    "admin.payments": "المدفوعات",
    "admin.notes": "الملاحظات",
    "admin.totalProjects": "إجمالي المشاريع",
    "admin.totalBudget": "إجمالي القيمة",
    "admin.totalPaid": "المحصل",
    "admin.totalRemaining": "المتبقي",
    "admin.activeFixes": "أعطال جاري إصلاحها",
    "admin.newProject": "مشروع جديد",
    "admin.newClient": "عميل جديد",
    "admin.recordPayment": "تسجيل دفعة",
    "admin.projectFilter": "نوع المشروع",
    "admin.statusFilter": "الحالة",
    "admin.search": "بحث في المشاريع والعملاء...",
    "admin.manageExtensions": "مراحل التطوير ({count})",
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (
    key: string,
    fallbackOrReplacements?: string | Record<string, string | number>,
    maybeReplacements?: Record<string, string | number>
  ) => string;
  dir: "ltr" | "rtl";
  isRTL: boolean;
  formatMoney: (amount: number | null | undefined) => string;
  formatDuration: (minutes?: number | null) => string;
  formatDate: (dateStr?: string | null) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
  t: (key, fallback) => (typeof fallback === "string" ? fallback : key),
  dir: "ltr",
  isRTL: false,
  formatMoney: (a) => `EGP ${a}`,
  formatDuration: () => "",
  formatDate: () => "",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // English is default as requested: "وخلي النظام كله انجليزي ديفولت وفي اوبشن عربي تبقا كله عربي"
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("moemen_lang") as Language;
      if (saved === "ar" || saved === "en") {
        setLangState(saved);
      } else {
        // Ensure default is "en"
        setLangState("en");
      }
    } catch {
      setLangState("en");
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("moemen_lang", newLang);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
      if (newLang === "ar") {
        document.body.classList.add("rtl-mode");
      } else {
        document.body.classList.remove("rtl-mode");
      }
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      if (lang === "ar") {
        document.body.classList.add("rtl-mode");
      } else {
        document.body.classList.remove("rtl-mode");
      }
    }
  }, [lang]);

  const toggleLang = () => {
    setLang(lang === "en" ? "ar" : "en");
  };

  const t = (
    key: string,
    fallbackOrReplacements?: string | Record<string, string | number>,
    maybeReplacements?: Record<string, string | number>
  ): string => {
    let fallback: string | undefined = undefined;
    let replacements: Record<string, string | number> | undefined = undefined;

    if (typeof fallbackOrReplacements === "string") {
      fallback = fallbackOrReplacements;
      replacements = maybeReplacements;
    } else if (typeof fallbackOrReplacements === "object") {
      replacements = fallbackOrReplacements;
    }

    const dict = translations[lang] as Record<string, string>;
    let text = dict[key] || translations.en[key as keyof typeof translations.en] || fallback || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return text;
  };

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";
  const isRTL = lang === "ar";

  const formatMoney = (amount: number | null | undefined): string => {
    const val = typeof amount === "number" ? amount : 0;
    const rounded = Math.round(val).toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
    return lang === "ar" ? `${rounded} ج.م` : `EGP ${rounded}`;
  };

  const formatDuration = (minutes?: number | null): string => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return "";
    if (minutes < 1) return lang === "ar" ? "أقل من دقيقة" : "Less than 1 min";
    if (minutes < 60) return lang === "ar" ? `${minutes} دقيقة` : `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (hours < 24) {
      if (remainingMins === 0) {
        return lang === "ar" ? `${hours} ساعة` : `${hours} hour${hours > 1 ? "s" : ""}`;
      }
      return lang === "ar"
        ? `${hours} س و ${remainingMins} د`
        : `${hours}h ${remainingMins}m`;
    }
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return lang === "ar"
      ? `${days} يوم${remHours > 0 ? ` و ${remHours} س` : ""}`
      : `${days}d${remHours > 0 ? ` ${remHours}h` : ""}`;
  };

  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    try {
      const dt = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
      if (isNaN(dt.getTime())) return dateStr;
      return dt.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        t,
        dir,
        isRTL,
        formatMoney,
        formatDuration,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-lg p-0.5 border text-xs font-semibold select-none transition-all ${className}`}
      style={{
        background: "rgba(31, 42, 36, 0.45)",
        borderColor: "rgba(167, 183, 167, 0.3)",
      }}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
          lang === "en"
            ? "bg-emerald-700 text-white shadow-sm font-bold"
            : "text-gray-300 hover:text-white"
        }`}
        title="Switch to English"
      >
        <span>🇺🇸</span>
        <span>EN</span>
      </button>
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
          lang === "ar"
            ? "bg-emerald-700 text-white shadow-sm font-bold"
            : "text-gray-300 hover:text-white"
        }`}
        title="التحويل للغة العربية"
      >
        <span>🇪🇬</span>
        <span>عربي</span>
      </button>
    </div>
  );
}
