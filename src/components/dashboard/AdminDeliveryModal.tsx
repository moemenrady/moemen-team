"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  Key,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  Video,
  Image as ImageIcon,
  Archive,
  Link as LinkIcon,
  Upload,
  CheckCircle,
  Clock,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  Lock,
} from "lucide-react";
import { DeliveryCredential, DeliveryAsset, ProjectDeliveryData } from "./ProjectDeliveryView";

interface AdminDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    clientId?: string;
    client?: {
      name?: string | null;
      company?: string | null;
    } | null;
  };
  deliveryData?: ProjectDeliveryData | null;
  onSaved: () => Promise<void>;
  lang?: "ar" | "en";
}

export function AdminDeliveryModal({
  isOpen,
  onClose,
  project,
  deliveryData,
  onSaved,
  lang = "ar",
}: AdminDeliveryModalProps) {
  // Tabs: "overview" | "credentials" | "guide" | "documents"
  const [activeTab, setActiveTab] = useState<"overview" | "credentials" | "guide" | "documents">("overview");

  // Form states
  const [status, setStatus] = useState<string>("preparing");
  const [title, setTitle] = useState<string>("وثيقة وبيانات تسليم المشروع");
  const [summary, setSummary] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [supportPeriod, setSupportPeriod] = useState<string>("دعم فني وضمان مجاني لمدة شهرين بعد التسليم");
  const [supportContact, setSupportContact] = useState<string>("support@moemen-team.tech | WhatsApp الدعم الفني");
  const [deliveredAt, setDeliveredAt] = useState<string>("");

  // Credentials list
  const [credentials, setCredentials] = useState<DeliveryCredential[]>([]);
  // New credential input state
  const [newCredTitle, setNewCredTitle] = useState("");
  const [newCredUrl, setNewCredUrl] = useState("");
  const [newCredUsername, setNewCredUsername] = useState("");
  const [newCredPassword, setNewCredPassword] = useState("");
  const [newCredRole, setNewCredRole] = useState("");
  const [newCredNotes, setNewCredNotes] = useState("");
  const [showAddCredForm, setShowAddCredForm] = useState(false);

  // Documents & Media list
  const [assets, setAssets] = useState<DeliveryAsset[]>([]);
  // External link / new asset modal state
  const [newAssetTitle, setNewAssetTitle] = useState("");
  const [newAssetUrl, setNewAssetUrl] = useState("");
  const [newAssetType, setNewAssetType] = useState<string>("link");
  const [newAssetDesc, setNewAssetDesc] = useState("");
  const [showAddLinkForm, setShowAddLinkForm] = useState(false);

  // File uploading state
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    if (deliveryData) {
      setStatus(deliveryData.status || "preparing");
      setTitle(deliveryData.title || "وثيقة وبيانات تسليم المشروع");
      setSummary(deliveryData.summary || `تم إنجاز وتسليم مشروع (${project.name}) بنجاح.`);
      setInstructions(deliveryData.instructions || "");
      setSupportPeriod(deliveryData.supportPeriod || "دعم فني وضمان مجاني لمدة شهرين بعد التسليم");
      setSupportContact(deliveryData.supportContact || "support@moemen-team.tech | WhatsApp الدعم الفني");
      setDeliveredAt(deliveryData.deliveredAt ? deliveryData.deliveredAt.slice(0, 10) : "");

      try {
        if (deliveryData.credentials) {
          setCredentials(
            typeof deliveryData.credentials === "string"
              ? JSON.parse(deliveryData.credentials)
              : deliveryData.credentials
          );
        } else {
          setCredentials([]);
        }
      } catch {
        setCredentials([]);
      }

      try {
        if (deliveryData.assets) {
          setAssets(
            typeof deliveryData.assets === "string"
              ? JSON.parse(deliveryData.assets)
              : deliveryData.assets
          );
        } else {
          setAssets([]);
        }
      } catch {
        setAssets([]);
      }
    } else {
      // Defaults
      setStatus("preparing");
      setTitle("وثيقة وبيانات تسليم المشروع");
      setSummary(`تم إنجاز وتسليم مشروع (${project.name}) بنجاح من قبل فريق مؤمن تيم الهندسي.`);
      setInstructions(`1. خطوات تسجيل الدخول:
- توجه إلى رابط لوحة التحكم المرفق أدناه.
- أدخل البريد الإلكتروني وكلمة المرور الموضحة.
- ننصح بتغيير كلمة المرور عند أول تسجيل دخول.

2. إدارة المحتوى والبيانات:
- ستجد كافة الأقسام الرئيسية في القائمة الجانبية.
- يمكنك مراجعة دليل المستخدم المرفق (PDF) لمعرفة كافة التفاصيل خطوة بخطوة.

3. الدعم الفني والمتابعة:
- يتضمن المشروع فترة ضمان ودعم فني مجاني. في حال وجود أي استفسار تواصل معنا مباشرة.`);
      setCredentials([]);
      setAssets([]);
    }
  }, [deliveryData, project, isOpen]);

  if (!isOpen) return null;

  // Generate strong random password
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCredPassword(pass);
  };

  // Add credential
  const handleAddCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCredTitle.trim()) return;

    const newCred: DeliveryCredential = {
      id: "cred_" + Date.now().toString(36),
      title: newCredTitle.trim(),
      url: newCredUrl.trim() || undefined,
      username: newCredUsername.trim() || undefined,
      password: newCredPassword.trim() || undefined,
      role: newCredRole.trim() || undefined,
      notes: newCredNotes.trim() || undefined,
    };

    setCredentials([...credentials, newCred]);
    setNewCredTitle("");
    setNewCredUrl("");
    setNewCredUsername("");
    setNewCredPassword("");
    setNewCredRole("");
    setNewCredNotes("");
    setShowAddCredForm(false);
  };

  const handleRemoveCredential = (id: string) => {
    setCredentials(credentials.filter((c) => c.id !== id));
  };

  // Handle direct file upload (PDF, Excel, Images, Video, Zip)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/projects/${project.id}/delivery/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await res.json();
      const newAsset: DeliveryAsset = {
        id: "asset_" + Date.now().toString(36),
        title: file.name.replace(/\.[^/.]+$/, ""),
        type: data.type as any,
        url: data.url,
        fileName: data.fileName,
        fileSize: data.fileSize,
        uploadedAt: new Date().toISOString(),
      };

      setAssets((prev) => [...prev, newAsset]);
    } catch (err: any) {
      console.error(err);
      setUploadError(lang === "ar" ? "فشل رفع الملف. يرجى التأكد من الحجم والصيغة." : "Upload failed. Please check file format and size.");
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  };

  // Add external link or video
  const handleAddExternalLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetTitle.trim() || !newAssetUrl.trim()) return;

    let detectedType = newAssetType;
    if (newAssetUrl.includes("loom.com") || newAssetUrl.includes("youtube.com") || newAssetUrl.includes("youtu.be")) {
      detectedType = "video";
    }

    const newAsset: DeliveryAsset = {
      id: "asset_" + Date.now().toString(36),
      title: newAssetTitle.trim(),
      type: detectedType as any,
      url: newAssetUrl.trim(),
      description: newAssetDesc.trim() || undefined,
      uploadedAt: new Date().toISOString(),
    };

    setAssets([...assets, newAsset]);
    setNewAssetTitle("");
    setNewAssetUrl("");
    setNewAssetDesc("");
    setNewAssetType("link");
    setShowAddLinkForm(false);
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  // Save full delivery data
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        status,
        title: title.trim(),
        summary: summary.trim(),
        instructions: instructions.trim(),
        supportPeriod: supportPeriod.trim(),
        supportContact: supportContact.trim(),
        deliveredAt: deliveredAt ? new Date(deliveredAt).toISOString() : (status === "delivered" ? new Date().toISOString() : undefined),
        credentials: JSON.stringify(credentials),
        assets: JSON.stringify(assets),
      };

      const res = await fetch(`/api/projects/${project.id}/delivery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await onSaved();
        onClose();
      } else {
        alert(lang === "ar" ? "حدث خطأ أثناء الحفظ" : "Error saving delivery details");
      }
    } catch (err) {
      console.error(err);
      alert(lang === "ar" ? "حدث خطأ أثناء الاتصال بالسيرفر" : "Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl bg-[#1F2A24] text-white border border-[#374A3C] rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]"
        style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#374A3C] bg-[#16201B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{lang === "ar" ? "إدارة تسليم وتوثيق المشروع" : "Project Delivery & Handover"}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {project.name}
                </span>
              </h2>
              <p className="text-xs text-[#A7B7A7]">
                {lang === "ar"
                  ? `العميل: ${project.client?.name || "-"} (${project.client?.company || "مؤسسة"})`
                  : `Client: ${project.client?.name || "-"}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#374A3C]/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#374A3C] px-6 bg-[#1A241F] gap-2 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Clock size={15} />
            <span>{lang === "ar" ? "حالة التسليم والبيانات" : "Status & Overview"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("credentials")}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "credentials"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Key size={15} />
            <span>{lang === "ar" ? "بيانات الدخول والحسابات" : "Access Credentials"}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px]">
              {credentials.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "guide"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <FileText size={15} />
            <span>{lang === "ar" ? "دليل الاستخدام والتشغيل" : "Operations Guide"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "documents"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Archive size={15} />
            <span>{lang === "ar" ? "المستندات والملفات" : "Handover Files"}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px]">
              {assets.length}
            </span>
          </button>
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ==================================================== */}
          {/* TAB 1: OVERVIEW & STATUS */}
          {/* ==================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Status Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">
                  {lang === "ar" ? "حالة التسليم الرسمية *" : "Handover Status *"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: "preparing", label: lang === "ar" ? "قيد التجهيز والتسليم" : "Preparing", color: "border-gray-600 bg-gray-800/60 text-gray-300", active: "border-gray-400 bg-gray-700 text-white shadow-md ring-1 ring-gray-400" },
                    { id: "ready_for_review", label: lang === "ar" ? "جاهز للاستلام والمراجعة" : "Ready for Review", color: "border-amber-500/30 bg-amber-500/10 text-amber-300", active: "border-amber-500 bg-amber-500/25 text-amber-200 ring-2 ring-amber-500/50 shadow-md" },
                    { id: "delivered", label: lang === "ar" ? "تم التسليم والاعتماد الرسمي" : "Delivered & Approved", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300", active: "border-emerald-500 bg-emerald-500/25 text-emerald-200 ring-2 ring-emerald-500/50 shadow-md" },
                    { id: "revision_requested", label: lang === "ar" ? "مطلوب ملاحظات وتعديلات" : "Revisions Requested", color: "border-blue-500/30 bg-blue-500/10 text-blue-300", active: "border-blue-500 bg-blue-500/25 text-blue-200 ring-2 ring-blue-500/50 shadow-md" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStatus(st.id)}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        status === st.id ? st.active : st.color + " hover:opacity-90"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Delivered Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {lang === "ar" ? "عنوان وثيقة التسليم" : "Delivery Document Title"}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#16201B] border border-[#374A3C] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {lang === "ar" ? "تاريخ التسليم الرسمي" : "Official Delivery Date"}
                  </label>
                  <input
                    type="date"
                    value={deliveredAt}
                    onChange={(e) => setDeliveredAt(e.target.value)}
                    className="w-full bg-[#16201B] border border-[#374A3C] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Welcome & Summary note */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {lang === "ar" ? "رسالة التهنئة ومقدمة التسليم للعميل" : "Delivery Introduction & Greeting Message"}
                </label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder={lang === "ar" ? "اكتب كلمة ترحيب وتهنئة للعميل بمناسبة إتمام وتسليم المشروع…" : "Welcome note and project completion message…"}
                  className="w-full bg-[#16201B] border border-[#374A3C] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Support & Warranty fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {lang === "ar" ? "مدة الضمان والدعم الفني المجاني" : "Warranty & Support Period"}
                  </label>
                  <input
                    type="text"
                    value={supportPeriod}
                    onChange={(e) => setSupportPeriod(e.target.value)}
                    className="w-full bg-[#16201B] border border-[#374A3C] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {lang === "ar" ? "بيانات وقنوات التواصل للدعم الفني" : "Support Contact Channels"}
                  </label>
                  <input
                    type="text"
                    value={supportContact}
                    onChange={(e) => setSupportContact(e.target.value)}
                    className="w-full bg-[#16201B] border border-[#374A3C] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Client sign-off display if exists */}
              {deliveryData?.clientSignedAt && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-emerald-300">
                      {lang === "ar" ? "تم اعتماد واستلام المشروع من العميل رسمياً" : "Project Officially Accepted by Client"}
                    </div>
                    <div className="text-emerald-400/80 mt-1">
                      {lang === "ar"
                        ? `بتاريخ: ${new Date(deliveryData.clientSignedAt).toLocaleString("ar-EG")}`
                        : `Signed on: ${new Date(deliveryData.clientSignedAt).toLocaleString()}`}
                    </div>
                    {deliveryData.clientFeedback && (
                      <div className="mt-2 text-white bg-black/30 p-2 rounded-lg font-mono text-xs">
                        &quot;{deliveryData.clientFeedback}&quot;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: ACCESS CREDENTIALS & LOGINS */}
          {/* ==================================================== */}
          {activeTab === "credentials" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key size={16} className="text-emerald-400" />
                    <span>{lang === "ar" ? "بيانات الدخول والحسابات الرسمية" : "Access Credentials & Logins"}</span>
                  </h3>
                  <p className="text-xs text-[#A7B7A7] mt-0.5">
                    {lang === "ar"
                      ? "أضف بيانات الدخول للأنظمة، لوحة الإدارة، السيرفر، أو البريد الإلكتروني مع إمكانية النسخ بنقرة واحدة."
                      : "Add credentials for dashboards, server, hosting, or mailboxes."}
                  </p>
                </div>

                {!showAddCredForm && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewCredTitle("");
                      setNewCredUrl("");
                      setNewCredUsername("");
                      setNewCredPassword("");
                      setNewCredRole("");
                      setNewCredNotes("");
                      setShowAddCredForm(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                  >
                    <Plus size={14} />
                    <span>{lang === "ar" ? "إضافة حساب / بيانات دخول" : "Add Credential"}</span>
                  </button>
                )}
              </div>

              {/* Add Credential Form Modal/Drawer */}
              {showAddCredForm && (
                <form
                  onSubmit={handleAddCredential}
                  className="p-4 bg-[#16201B] border border-emerald-500/40 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#374A3C] pb-2">
                    <span className="text-xs font-bold text-emerald-400">
                      {lang === "ar" ? "بيانات الدخول الجديدة" : "New Access Credential"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddCredForm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-300 mb-1">
                        {lang === "ar" ? "اسم النظام / الخدمة *" : "Service / System Name *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === "ar" ? "مثال: لوحة التحكم الرئيسية (WP-Admin)" : "e.g. Main Admin Dashboard"}
                        value={newCredTitle}
                        onChange={(e) => setNewCredTitle(e.target.value)}
                        className="w-full bg-[#1F2A24] border border-[#374A3C] rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-300 mb-1">
                        {lang === "ar" ? "رابط تسجيل الدخول (URL)" : "Login URL"}
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/admin"
                        value={newCredUrl}
                        onChange={(e) => setNewCredUrl(e.target.value)}
                        className="w-full bg-[#1F2A24] border border-[#374A3C] rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-300 mb-1">
                        {lang === "ar" ? "اسم المستخدم / البريد الإلكتروني" : "Username / Email"}
                      </label>
                      <input
                        type="text"
                        placeholder="admin@example.com"
                        value={newCredUsername}
                        onChange={(e) => setNewCredUsername(e.target.value)}
                        className="w-full bg-[#1F2A24] border border-[#374A3C] rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-300">
                          {lang === "ar" ? "كلمة المرور" : "Password"}
                        </label>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <RefreshCw size={11} />
                          <span>{lang === "ar" ? "توليد كلمة سر قوية" : "Generate"}</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="P@ssw0rd123"
                        value={newCredPassword}
                        onChange={(e) => setNewCredPassword(e.target.value)}
                        className="w-full bg-[#1F2A24] border border-[#374A3C] rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-300 mb-1">
                        {lang === "ar" ? "الصلاحية / الدور (Role)" : "Role / Access Level"}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === "ar" ? "مدير عام / Super Admin" : "Administrator"}
                        value={newCredRole}
                        onChange={(e) => setNewCredRole(e.target.value)}
                        className="w-full bg-[#1F2A24] border border-[#374A3C] rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-300 mb-1">
                        {lang === "ar" ? "ملاحظات إضافية للعميل" : "Notes"}
                      </label>
                      <input
                        type="text"
                        placeholder={lang === "ar" ? "مثال: يرجى تغيير كلمة المرور عند أول دخول" : "e.g. Please change password upon first login"}
                        value={newCredNotes}
                        onChange={(e) => setNewCredNotes(e.target.value)}
                        className="w-full bg-[#1F2A24] border border-[#374A3C] rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCredForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                    >
                      {lang === "ar" ? "حفظ الحساب في القائمة" : "Add to List"}
                    </button>
                  </div>
                </form>
              )}

              {/* Existing Credentials List */}
              {credentials.length > 0 ? (
                <div className="space-y-2.5">
                  {credentials.map((cred, idx) => (
                    <div
                      key={cred.id || idx}
                      className="p-3.5 bg-[#16201B] border border-[#374A3C] rounded-xl flex items-center justify-between gap-4 flex-wrap"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{cred.title}</span>
                          {cred.role && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                              {cred.role}
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-300 flex items-center gap-3 flex-wrap">
                          {cred.username && (
                            <span>
                              {lang === "ar" ? "المستخدم:" : "User:"} <strong className="text-emerald-300 font-mono">{cred.username}</strong>
                            </span>
                          )}
                          {cred.password && (
                            <span>
                              {lang === "ar" ? "كلمة المرور:" : "Pass:"} <strong className="text-amber-300 font-mono">{cred.password}</strong>
                            </span>
                          )}
                          {cred.url && (
                            <a
                              href={cred.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink size={11} />
                              <span>{cred.url}</span>
                            </a>
                          )}
                        </div>

                        {cred.notes && (
                          <div className="text-[11px] text-gray-400 italic">
                            * {cred.notes}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCredential(cred.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                        title={lang === "ar" ? "حذف" : "Delete"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-[#374A3C] rounded-xl">
                  {lang === "ar"
                    ? "لم تقم بإضافة بيانات دخول بعد. اضغط على 'إضافة حساب / بيانات دخول' لإدخال الحسابات."
                    : "No access credentials added yet. Click 'Add Credential' to add one."}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: GUIDE & INSTRUCTIONS */}
          {/* ==================================================== */}
          {activeTab === "guide" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText size={16} className="text-emerald-400" />
                    <span>{lang === "ar" ? "دليل الاستخدام والتشغيل للعميل" : "Operational Guide & Instructions"}</span>
                  </h3>
                  <p className="text-xs text-[#A7B7A7] mt-0.5">
                    {lang === "ar"
                      ? "اشرح للعميل كيفية استخدام النظام، الخطوات التشغيلية، وكيفية التعامل مع مخرجات المشروع."
                      : "Explain user instructions, operational workflows, and system guidelines."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setInstructions(`1. خطوات تسجيل الدخول:
- توجه إلى رابط لوحة التحكم المرفق أدناه.
- أدخل البريد الإلكتروني وكلمة المرور الموضحة.
- ننصح بتغيير كلمة المرور عند أول تسجيل دخول.

2. إدارة المحتوى والبيانات:
- ستجد كافة الأقسام الرئيسية في القائمة الجانبية.
- يمكنك مراجعة دليل المستخدم المرفق (PDF) لمعرفة كافة التفاصيل خطوة بخطوة.

3. النسخ الاحتياطي والأمان:
- النظام يقوم بعمل نسخ احتياطية تلقائية يومية.
- في حال فقدان كلمة المرور استخدم خيار استعادة الحساب الرسمي.

4. الدعم الفني والمتابعة:
- يتضمن المشروع فترة ضمان ودعم فني مجاني. في حال وجود أي استفسار تواصل معنا مباشرة.`);
                  }}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  <span>{lang === "ar" ? "إدراج قالب إرشادي جاهز" : "Insert Guide Template"}</span>
                </button>
              </div>

              <textarea
                rows={12}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={lang === "ar" ? "اكتب دليل التشغيل والإرشادات بالتفصيل هنا…" : "Write detailed instructions here…"}
                className="w-full bg-[#16201B] border border-[#374A3C] rounded-xl p-4 text-xs sm:text-sm text-white font-mono leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: HANDOVER DOCUMENTS & MEDIA */}
          {/* ==================================================== */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Archive size={16} className="text-emerald-400" />
                    <span>{lang === "ar" ? "مستندات وملفات التسليم (PDF, Excel, صور, فيديو)" : "Handover Files & Media"}</span>
                  </h3>
                  <p className="text-xs text-[#A7B7A7] mt-0.5">
                    {lang === "ar"
                      ? "ارفع ملفات التوثيق الرسمية أو أضف روابط لفيديوهات الشرح التوضيحية (Loom, YouTube, Drive)."
                      : "Upload official documents (PDF, Excel, images) or attach tutorial video links."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md transition-colors">
                    <Upload size={14} />
                    <span>{isUploadingFile ? (lang === "ar" ? "جاري الرفع..." : "Uploading...") : (lang === "ar" ? "رفع ملف (PDF/Excel/صور/فيديو)" : "Upload File")}</span>
                    <input
                      type="file"
                      disabled={isUploadingFile}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp,.mp4,.mov,.zip"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowAddLinkForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#374A3C] hover:bg-[#374A3C]/80 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <LinkIcon size={14} />
                    <span>{lang === "ar" ? "إضافة رابط فيديو / سحابي" : "Add Cloud Link"}</span>
                  </button>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-rose-500/20 text-rose-300 text-xs border border-rose-500/30">
                  {uploadError}
                </div>
              )}

              {/* Add Cloud / Video Link Drawer */}
              {showAddLinkForm && (
                <form
                  onSubmit={handleAddExternalLink}
                  className="p-4 bg-[#16201B] border border-blue-500/40 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#374A3C] pb-2">
                    <span className="text-xs font-bold text-blue-400">
                      {lang === "ar" ? "إضافة رابط فيديو أو ملف سحابي" : "Add Cloud Link or Video Tutorial"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddLinkForm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-300 mb-1">
                        {lang === "ar" ? "عنوان المستند أو الفيديو *" : "Title *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === "ar" ? "فيديو شرح لوحة التحكم" : "Dashboard Tutorial Video"}
                        value={newAssetTitle}
                        onChange={(e) => setNewAssetTitle(e.target.value)}
                        className="w-full bg-[#1F2A24] border border-[#374A3C] rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-300 mb-1">
                        {lang === "ar" ? "الرابط (Loom, YouTube, Drive, Link) *" : "URL *"}
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://loom.com/share/..."
                        value={newAssetUrl}
                        onChange={(e) => setNewAssetUrl(e.target.value)}
                        className="w-full bg-[#1F2A24] border border-[#374A3C] rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-300 mb-1">
                        {lang === "ar" ? "التصنيف" : "Category"}
                      </label>
                      <select
                        value={newAssetType}
                        onChange={(e) => setNewAssetType(e.target.value)}
                        className="w-full bg-[#1F2A24] border border-[#374A3C] rounded-lg px-3 py-1.5 text-xs text-white"
                      >
                        <option value="video">{lang === "ar" ? "فيديو توضيحي (Video)" : "Video"}</option>
                        <option value="link">{lang === "ar" ? "رابط سحابي (Link / Drive)" : "Cloud Link"}</option>
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel / Sheets</option>
                        <option value="archive">{lang === "ar" ? "ملف مضغوط (Archive)" : "Archive"}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-300 mb-1">
                      {lang === "ar" ? "وصف إضافي (اختياري)" : "Description"}
                    </label>
                    <input
                      type="text"
                      placeholder={lang === "ar" ? "شرح فيديو تفصيلي لكيفية إدارة المنتجات والطلبات" : "Video explaining how to manage products"}
                      value={newAssetDesc}
                      onChange={(e) => setNewAssetDesc(e.target.value)}
                      className="w-full bg-[#1F2A24] border border-[#374A3C] rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddLinkForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                    >
                      {lang === "ar" ? "إضافة للقائمة" : "Add Asset"}
                    </button>
                  </div>
                </form>
              )}

              {/* Assets List */}
              {assets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assets.map((asset, idx) => (
                    <div
                      key={asset.id || idx}
                      className="p-3.5 bg-[#16201B] border border-[#374A3C] rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                          {asset.type === "pdf" && <FileText size={18} className="text-rose-400" />}
                          {asset.type === "excel" && <FileSpreadsheet size={18} className="text-emerald-400" />}
                          {asset.type === "image" && <ImageIcon size={18} className="text-purple-400" />}
                          {asset.type === "video" && <Video size={18} className="text-amber-400" />}
                          {asset.type === "archive" && <Archive size={18} className="text-blue-400" />}
                          {asset.type === "link" && <LinkIcon size={18} className="text-gray-400" />}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-xs text-white truncate">{asset.title}</div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                            <span className="uppercase text-[10px] font-semibold text-emerald-400">
                              {asset.type}
                            </span>
                            {asset.fileSize && <span>• {asset.fileSize}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title={lang === "ar" ? "معاينة" : "Preview"}
                        >
                          <ExternalLink size={15} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveAsset(asset.id)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                          title={lang === "ar" ? "حذف" : "Delete"}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-[#374A3C] rounded-xl">
                  {lang === "ar"
                    ? "لم يتم إرفاق ملفات تسليم بعد. يمكنك رفع ملفات أو إضافة روابط خارجية."
                    : "No handover documents attached yet. Upload files or attach links."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Save Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#374A3C] bg-[#16201B]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-[#374A3C]/50 transition-colors"
          >
            {lang === "ar" ? "إغلاق" : "Cancel"}
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            <span>{isSaving ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ بيانات التسليم" : "Save Delivery Data")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
