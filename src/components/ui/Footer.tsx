"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { 
  Globe, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  Heart,
  Sparkles,
  ExternalLink
} from "lucide-react";

export function Footer() {
  const { lang, isRTL } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto border-t border-[var(--border)] bg-[#1F2A24] text-[#F6F7F5] selection:bg-emerald-600 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="logo-badge w-9 h-9 rounded-xl border border-emerald-500/30 shadow-md flex-shrink-0"
              />
              <div>
                <span className="font-extrabold text-base tracking-wider text-white block">
                  MOEMEN<span className="text-emerald-400">TEAM</span>
                </span>
                <span className="text-[10px] tracking-widest text-[#A7B7A7] block font-semibold uppercase">
                  Software Solutions
                </span>
              </div>
            </div>
            <p className="text-sm text-[#A7B7A7] leading-relaxed max-w-sm">
              {lang === "ar"
                ? "فريق برمجي وهندسي متخصص في تطوير المنصات والمواقع وتطبيقات الموبايل وأنظمة الأتمتة والبريد المخصص لدعم نمو أعمالكم."
                : "Professional software engineering team specializing in web, mobile apps, business automation, and enterprise mail systems built for scale."}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400 font-medium">
              <Sparkles size={14} className="shrink-0" />
              <span>
                {lang === "ar"
                  ? "30+ عاماً من الخبرة التقنية التراكمية"
                  : "30+ Years Cumulative Technical Excellence"}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7B7A7] border-b border-[#374A3C] pb-2">
              {lang === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link 
                  href="/" 
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <span>•</span>
                  <span>{lang === "ar" ? "لوحة التحكم الرئيسية" : "Dashboard Home"}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/projects" 
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2"
                >
                  <span>•</span>
                  <span>{lang === "ar" ? "مشاريع العمل" : "Client Projects"}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="hover:text-emerald-400 transition-colors flex items-center gap-2 font-medium text-emerald-300"
                >
                  <span>•</span>
                  <span>{lang === "ar" ? "عن مؤمن تيم (About Us)" : "About Moemen Team"}</span>
                </Link>
              </li>
              <li>
                <a 
                  href="https://moemen-team.tech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>•</span>
                  <span>{lang === "ar" ? "الموقع الرسمي moemen-team.tech" : "Official Website"}</span>
                  <ExternalLink size={12} className="opacity-70" />
                </a>
              </li>
            </ul>
          </div>

          {/* Solutions & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7B7A7] border-b border-[#374A3C] pb-2">
              {lang === "ar" ? "خدماتنا الهندسية" : "Engineering Services"}
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Globe size={14} className="text-emerald-400 shrink-0" />
                <span>{lang === "ar" ? "تطوير مواقع ومتاجر إلكترونية" : "Web & E-Commerce Platforms"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap size={14} className="text-amber-400 shrink-0" />
                <span>{lang === "ar" ? "أتمتة الأعمال وسير العمل" : "Workflow Automation & Integrations"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-indigo-400 shrink-0" />
                <span>{lang === "ar" ? "خدمات وسيرفرات البريد المخصصة" : "Enterprise Email & Servers"}</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span>{lang === "ar" ? "خدمة الصيانة السريعة Fast Fixing" : "Fast Fixing Rapid Problem Resolution"}</span>
              </li>
            </ul>
          </div>

          {/* Direct Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7B7A7] border-b border-[#374A3C] pb-2">
              {lang === "ar" ? "الدعم والتواصل" : "Support & Inquiries"}
            </h4>
            <p className="text-xs text-[#A7B7A7] leading-relaxed">
              {lang === "ar"
                ? "فريق الدعم الفني متواجد للإجابة عن استفساراتكم وحل المشكلات الهندسية على مدار الساعة."
                : "Our engineering and support team is ready to answer inquiries and solve technical issues."}
            </p>
            <div className="space-y-2 pt-1 text-xs">
              <a 
                href="mailto:contact@moemen-team.tech" 
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <Mail size={14} className="text-emerald-400 shrink-0" />
                <span>contact@moemen-team.tech</span>
              </a>
              <a 
                href="https://wa.me/201021464424" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                <Phone size={14} className="shrink-0" />
                <span>{lang === "ar" ? "محادثة فورية واتساب" : "Direct WhatsApp Support"}</span>
                <ArrowUpRight size={13} className="shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-6 border-t border-[#374A3C] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A7B7A7]">
          <p className="text-center sm:text-start">
            © {currentYear} <strong className="text-white">Moemen Team</strong>.{" "}
            {lang === "ar" 
              ? "جميع الحقوق محفوظة. تم التطوير بأعلى معايير الأمان والكفاءة." 
              : "All rights reserved. Engineered for maximum reliability and performance."}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-white transition-colors">
              {lang === "ar" ? "من نحن" : "About Us"}
            </Link>
            <span>•</span>
            <Link href="/projects" className="hover:text-white transition-colors">
              {lang === "ar" ? "المشاريع" : "Projects"}
            </Link>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <Heart size={12} className="fill-emerald-500 text-emerald-500" />
              <span>Moemen Team Tech</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
