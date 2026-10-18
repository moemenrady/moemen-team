"use client";

import React from "react";
import Link from "next/link";
import { useLanguage, LanguageToggle } from "@/lib/i18n";
import { Footer } from "@/components/ui/Footer";
import {
  Globe,
  Smartphone,
  Zap,
  Monitor,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
  Award,
  Layers,
  HeartHandshake,
  Headphones,
  Code2,
  Rocket,
  ChevronRight,
  Flame,
  Phone,
} from "lucide-react";

export default function AboutPage() {
  const { lang, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const coreServices = [
    {
      icon: Globe,
      color: "from-blue-600 to-cyan-600",
      border: "border-blue-500/30",
      title: lang === "ar" ? "مواقع ومنصات الويب المتطورة" : "Modern Web & E-Commerce Systems",
      desc:
        lang === "ar"
          ? "تطوير واجهات فائقة السرعة ومتوافقة مع جميع الأجهزة (Next.js & React)، وأنظمة خلفية قابلة للتوسع والتكامل البرمجي مع بوابات الدفع والشحن."
          : "Ultra-fast, mobile-first responsive web apps (Next.js/React) backed by resilient databases, microservices, and global payment gateways.",
    },
    {
      icon: Smartphone,
      color: "from-purple-600 to-pink-600",
      border: "border-purple-500/30",
      title: lang === "ar" ? "تطبيقات الهواتف الذكية" : "Native & Cross-Platform Mobile Apps",
      desc:
        lang === "ar"
          ? "تطبيقات هواتف بنظامي iOS وأندرويد بتجربة مستخدم تفاعلية وسلسة تركز على سرعة الاستجابة وتكامل الإشعارات والمزامنة المباشرة."
          : "High-performance iOS and Android applications with offline-first synchronization, push notification architectures, and intuitive UI.",
    },
    {
      icon: Zap,
      color: "from-amber-500 to-orange-600",
      border: "border-amber-500/30",
      title: lang === "ar" ? "أتمتة الأعمال والأنظمة الذكية" : "Business Automation & Workflow Engines",
      desc:
        lang === "ar"
          ? "أتمتة العمليات الروتينية للشركات، ربط برمجيات الطرف الثالث، وإنشاء روبوتات ذكية توفر مئات ساعات العمل شهرياً."
          : "Automating repetitive business processes, API orchestration, custom bots, and integrations that eliminate bottlenecks.",
    },
    {
      icon: Mail,
      color: "from-indigo-600 to-blue-600",
      border: "border-indigo-500/30",
      title: lang === "ar" ? "خدمات وسيرفرات البريد المخصصة" : "Dedicated Enterprise Email Services",
      desc:
        lang === "ar"
          ? "تهيئة وإدارة خوادم بريد إلكتروني مستقلة للمؤسسات، مع بروتوكولات حماية متقدمة (DKIM, SPF, DMARC) ونشرات بريدية تضمن وصول الرسائل لصندوق الوارد."
          : "Custom enterprise mail server architecture, bulletproof SPF/DKIM/DMARC deliverability, transactional mail, and privacy isolation.",
    },
    {
      icon: Flame,
      color: "from-amber-600 to-red-600",
      border: "border-amber-500/30",
      title: lang === "ar" ? "خدمة الصيانة السريعة Fast Fixing" : "Fast Fixing & Rapid Problem Solving",
      desc:
        lang === "ar"
          ? "خاصية رائدة تتيح للعميل تصوير أي عطل بالهاتف وشرحه؛ ليباشر مهندسونا التدخل فوراً مع حساب دقيق للوقت المستغرق حتى الإتمام."
          : "Snap a photo of any issue right from your phone, and our engineers jump on it immediately with live time tracking and resolution proof.",
    },
    {
      icon: Rocket,
      color: "from-emerald-600 to-teal-600",
      border: "border-emerald-500/30",
      title: lang === "ar" ? "تطوير وترقية المشاريع (Scope Extensions)" : "Project Evolution & Milestone Merge",
      desc:
        lang === "ar"
          ? "إمكانية طلب مراحل تطوير إضافية داخل نفس المشروع بعد اكتماله، مع دمج الميزانيات والمراحل والإصدارات بنقرة واحدة (Merge)."
          : "Seamlessly expand projects into Phase 2 and evolution branches, then merge progress and financials into the base project cleanly.",
    },
  ];

  const metrics = [
    {
      value: "30+",
      label: lang === "ar" ? "عاماً من الخبرة الهندسية" : "Years Engineering Heritage",
      sub: lang === "ar" ? "معايير برمجية رفيعة" : "High industry standards",
    },
    {
      value: "100%",
      label: lang === "ar" ? "التزام بالتسليم والجودة" : "On-Time Delivery Rate",
      sub: lang === "ar" ? "متابعة شفافة لكل مرحلة" : "Transparent stage tracking",
    },
    {
      value: "24/7",
      label: lang === "ar" ? "جاهزية مهندسي الدعم" : "Engineering Standby SLA",
      sub: lang === "ar" ? "تصليح فوري للأعطال" : "Instant fast fixing response",
    },
    {
      value: "99.9%",
      label: lang === "ar" ? "استقرار وسرعة الأنظمة" : "System Reliability & Uptime",
      sub: lang === "ar" ? "خوادم سحابية مؤمنة" : "Optimized cloud deployments",
    },
  ];

  return (
    <div 
      className="min-h-screen flex flex-col bg-[#1F2A24] text-[#F6F7F5] selection:bg-emerald-600"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[#374A3C] bg-[#1F2A24]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sm:py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="logo-badge w-10 h-10 rounded-xl border border-emerald-500/40 shadow-md group-hover:scale-105 transition-transform" />
            <div>
              <span className="font-extrabold text-base tracking-wider text-white block">
                MOEMEN<span className="text-emerald-400">TEAM</span>
              </span>
              <span className="text-[10px] tracking-widest text-[#A7B7A7] block font-semibold uppercase">
                {lang === "ar" ? "نظام إدارة المشاريع" : "Management Portal"}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-700/80 hover:bg-emerald-600 text-white transition-all shadow-sm"
            >
              <span>{lang === "ar" ? "العودة للنظام" : "Back to Portal"}</span>
              <ArrowIcon size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#374A3C]">
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(#3E7C52 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <Sparkles size={14} className="text-emerald-400" />
            <span>
              {lang === "ar"
                ? "التميز الهندسي والبرمجي منذ البدايات"
                : "Decades of Technical Precision & Craftsmanship"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {lang === "ar" ? (
              <>
                نبني حلولاً برمجية ذكية <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  تنمي أعمالك وتضاعف أرباحك
                </span>
              </>
            ) : (
              <>
                Engineering Intelligent Systems <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  That Scale Your Business Seamlessly
                </span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg text-[#A7B7A7] max-w-3xl mx-auto leading-relaxed">
            {lang === "ar"
              ? "في Moemen Team نمتلك رؤية هندسية عميقة وخبرة تقنية عملية تمتد لأكثر من 30 عاماً في تصميم وبناء البرمجيات والأنظمة المتكاملة. ندمج بين أحدث تقنيات الويب والموبايل والذكاء الاصطناعي وبين أعلى معايير الأمان والاستقرار المؤسسي."
              : "At Moemen Team, we combine over three decades of engineering rigor with cutting-edge cloud architectures, intuitive UI/UX design, and continuous delivery to empower forward-thinking businesses."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>{lang === "ar" ? "ابدأ مشروعك الآن" : "Launch Your Project"}</span>
              <ArrowIcon size={16} />
            </Link>

            <a
              href="https://wa.me/201094619040"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-[#374A3C] bg-[#374A3C]/40 hover:bg-[#374A3C] text-gray-200 hover:text-white transition-all"
            >
              <Headphones size={16} className="text-emerald-400" />
              <span>{lang === "ar" ? "تحدث مع مهندس متخصص (01094619040)" : "Talk to a Senior Engineer (01094619040)"}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="py-12 border-b border-[#374A3C] bg-[#1a231e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {metrics.map((m, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl border border-[#374A3C]/60 bg-[#1F2A24]/60 backdrop-blur"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-1">
                  {m.value}
                </div>
                <div className="text-sm font-bold text-white mb-0.5">{m.label}</div>
                <div className="text-xs text-[#A7B7A7]">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#374A3C]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
              {lang === "ar" ? "ماذا نقدم لعملائنا" : "Core Capabilities"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              {lang === "ar" ? "حلول شاملة متكاملة تحت سقف واحد" : "Comprehensive Solutions Built For Growth"}
            </h2>
            <p className="text-sm sm:text-base text-[#A7B7A7]">
              {lang === "ar"
                ? "من أول فكرة وتخطيط الـ UX وحتى البرمجة والإطلاق والمتابعة المستمرة والصيانة الدقيقة."
                : "From discovery, UI/UX prototyping to mission-critical deployment and around-the-clock maintenance."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreServices.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border ${srv.border} bg-[#1F2A24]/80 hover:bg-[#25332c] transition-all hover:-translate-y-1 shadow-lg space-y-4 flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${srv.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug">{srv.title}</h3>
                    <p className="text-sm text-[#A7B7A7] leading-relaxed">{srv.desc}</p>
                  </div>
                  <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 size={14} />
                    <span>{lang === "ar" ? "تنفيذ احترافي ومضمون" : "Enterprise-grade quality"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Moemen Team Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#374A3C] bg-[#1a231e]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                {lang === "ar" ? "لماذا يختارنا العملاء؟" : "Why Choose Moemen Team?"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {lang === "ar"
                  ? "لسنا مجرد مبرمجين — نحن شركاء نجاح تقني لأعمالك"
                  : "We Don't Just Write Code — We Engineer Your Competitive Edge"}
              </h2>
              <p className="text-sm text-[#A7B7A7] leading-relaxed">
                {lang === "ar"
                  ? "تتميز علاقتنا مع عملائنا بالشفافية الكاملة من خلال لوحة تحكم تفاعلية توضح مراحل التنفيذ، الدفعات المالية المعتمدة، كشوف الحساب الرسمية، وزر تصليح سريع لأي مشكلة طارئة."
                  : "Every client gets total transparency via our proprietary client dashboard: real-time progress percentages, verified milestones, financial statements, and single-tap bug fixing."}
              </p>

              <div className="space-y-3 text-sm text-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mt-0.5 shrink-0">
                    ✓
                  </div>
                  <span>
                    <strong>{lang === "ar" ? "شفافية مالية تامة:" : "Transparent Financials:"}</strong>{" "}
                    {lang === "ar"
                      ? "إمكانية تصدير كشف حساب رسمي PDF معتمد ومفصل لكل دفعة ومرحلة."
                      : "Instant PDF financial statement export for invoices, payments, and quotations."}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mt-0.5 shrink-0">
                    ✓
                  </div>
                  <span>
                    <strong>{lang === "ar" ? "تطوير مستمر بدون توقف:" : "Continuous Evolution:"}</strong>{" "}
                    {lang === "ar"
                      ? "مشروعك لا يموت بعد التسليم؛ يمكنك طلب ميزات جديدة وتوسيع نطاق العمل مع دمج مباشر."
                      : "Request new evolutionary features post-launch and merge them cleanly into the base project."}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mt-0.5 shrink-0">
                    ✓
                  </div>
                  <span>
                    <strong>{lang === "ar" ? "دعم ثنائي اللغة احترافي:" : "Bilingual First-Class Support:"}</strong>{" "}
                    {lang === "ar"
                      ? "النظام مجهز بالكامل للغتين العربية والإنجليزية لسهولة الاستخدام للجميع."
                      : "Seamless English and Arabic localization tailored for both domestic and regional teams."}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Card */}
            <div className="p-8 rounded-3xl border border-[#374A3C] bg-[#1F2A24] shadow-2xl relative space-y-6">
              <div className="flex items-center justify-between border-b border-[#374A3C] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700/40 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold">
                    MT
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Moemen Team Engineering</div>
                    <div className="text-xs text-[#A7B7A7]">Cairo, Egypt · Global Delivery</div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Verified Partner
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[#374A3C]/70 bg-[#161e1a] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#A7B7A7]">
                    <span>{lang === "ar" ? "معدل سرعة الاستجابة" : "Average SLA Response"}</span>
                    <span className="text-emerald-400 font-bold">&lt; 15 Mins</span>
                  </div>
                  <div className="w-full bg-[#374A3C] h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[96%]" />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#374A3C]/70 bg-[#161e1a] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#A7B7A7]">
                    <span>{lang === "ar" ? "جودة الكود واختبارات الأمان" : "Automated QA & Security"}</span>
                    <span className="text-teal-400 font-bold">132+ Tests Passing</span>
                  </div>
                  <div className="w-full bg-[#374A3C] h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-400 h-full w-[100%]" />
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-[#374A3C]/70 hover:bg-[#374A3C] text-white transition-colors"
                >
                  <span>{lang === "ar" ? "دخول بوابة العملاء" : "Go to Client Portal"}</span>
                  <ArrowIcon size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1F2A24] to-[#161e1a] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {lang === "ar" ? "جاهز لبدء مشروعك أو حل مشكلة في نظامك؟" : "Ready to Build Your Platform or Solve an Issue?"}
          </h2>
          <p className="text-sm sm:text-base text-[#A7B7A7]">
            {lang === "ar"
              ? "تواصل معنا مباشرة عبر الواتساب أو أنشئ حسابك وسيقوم مهندسونا بتقديم خطة عمل وعرض سعر دقيق."
              : "Reach out via WhatsApp or log into the portal to consult directly with our senior software engineers."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-all"
            >
              {lang === "ar" ? "ابدأ من لوحة التحكم" : "Open Dashboard"}
            </Link>
            <a
              href="https://wa.me/201094619040"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-emerald-500/50 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-white transition-colors"
            >
              <Phone size={15} />
              <span dir="ltr">01094619040</span>
            </a>
            <a
              href="mailto:contact@moemen-team.tech"
              className="px-6 py-3 rounded-xl font-semibold text-sm border border-[#374A3C] bg-[#374A3C]/40 hover:bg-[#374A3C] text-white transition-colors"
            >
              contact@moemen-team.tech
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
