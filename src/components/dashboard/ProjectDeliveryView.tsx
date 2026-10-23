"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  Clock,
  ShieldCheck,
  Key,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  FileText,
  FileSpreadsheet,
  Video,
  Image as ImageIcon,
  Archive,
  Link as LinkIcon,
  Download,
  Play,
  Printer,
  Sparkles,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  X,
  FileCheck2,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export interface DeliveryCredential {
  id: string;
  title: string;
  url?: string;
  username?: string;
  password?: string;
  role?: string;
  notes?: string;
}

export interface DeliveryAsset {
  id: string;
  title: string;
  type: "pdf" | "excel" | "image" | "video" | "archive" | "link" | "document";
  url: string;
  fileName?: string;
  fileSize?: string;
  description?: string;
  uploadedAt?: string;
}

export interface ProjectDeliveryData {
  id?: string;
  projectId: string;
  status: "preparing" | "ready_for_review" | "delivered" | "revision_requested";
  title?: string | null;
  summary?: string | null;
  instructions?: string | null;
  credentials?: string | null; // JSON string of DeliveryCredential[]
  assets?: string | null; // JSON string of DeliveryAsset[]
  supportPeriod?: string | null;
  supportContact?: string | null;
  deliveredAt?: string | null;
  clientSignedAt?: string | null;
  clientFeedback?: string | null;
}

interface ProjectDeliveryViewProps {
  project: {
    id: string;
    name: string;
    client?: {
      name?: string | null;
      company?: string | null;
      email?: string | null;
    } | null;
    contractDate?: string | null;
    status?: string;
  };
  delivery?: ProjectDeliveryData | null;
  onRefresh?: () => Promise<void>;
  isAdmin?: boolean;
  onOpenAdminManage?: () => void;
}

export function ProjectDeliveryView({
  project,
  delivery,
  onRefresh,
  isAdmin = false,
  onOpenAdminManage,
}: ProjectDeliveryViewProps) {
  const { lang, t, isRTL } = useLanguage();

  // State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Lightbox / Media Preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  // Parse Credentials
  let credentialsList: DeliveryCredential[] = [];
  try {
    if (delivery?.credentials) {
      credentialsList = typeof delivery.credentials === "string" ? JSON.parse(delivery.credentials) : delivery.credentials;
    }
  } catch (e) {
    credentialsList = [];
  }

  // Parse Assets
  let assetsList: DeliveryAsset[] = [];
  try {
    if (delivery?.assets) {
      assetsList = typeof delivery.assets === "string" ? JSON.parse(delivery.assets) : delivery.assets;
    }
  } catch (e) {
    assetsList = [];
  }

  const currentStatus = delivery?.status || "preparing";

  // Copy helper
  const handleCopy = async (text: string, key: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Format date helper
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  // Status Chip config
  const getStatusConfig = () => {
    switch (currentStatus) {
      case "delivered":
        return {
          label: t("delivery.status.delivered", "Delivered & Approved"),
          cls: "delivered",
          icon: <ShieldCheck size={16} className="text-emerald-500" />,
        };
      case "ready_for_review":
        return {
          label: t("delivery.status.ready_for_review", "Ready for Client Review"),
          cls: "ready_for_review",
          icon: <Sparkles size={16} className="text-amber-500" />,
        };
      case "revision_requested":
        return {
          label: t("delivery.status.revision_requested", "Revisions Requested"),
          cls: "revision_requested",
          icon: <HelpCircle size={16} className="text-blue-500" />,
        };
      case "preparing":
      default:
        return {
          label: t("delivery.status.preparing", "Preparing Handover"),
          cls: "preparing",
          icon: <Clock size={16} className="text-gray-400" />,
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Client Confirm Handover
  const handleConfirmHandover = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/delivery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          feedback: feedbackText.trim() || undefined,
        }),
      });
      if (res.ok) {
        setIsConfirmModalOpen(false);
        setActionSuccessMsg(t("delivery.confirmSuccess", "Project handover accepted and signed off successfully!"));
        if (onRefresh) await onRefresh();
        setTimeout(() => setActionSuccessMsg(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Client Request Revision
  const handleRequestRevision = async () => {
    if (!feedbackText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/delivery`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revision",
          feedback: feedbackText.trim(),
        }),
      });
      if (res.ok) {
        setIsRevisionModalOpen(false);
        setActionSuccessMsg(t("delivery.revisionSuccess", "Your notes have been sent to our engineering team."));
        if (onRefresh) await onRefresh();
        setTimeout(() => setActionSuccessMsg(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get icon for asset type
  const renderAssetIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText size={20} className="text-rose-500" />;
      case "excel":
        return <FileSpreadsheet size={20} className="text-emerald-500" />;
      case "image":
        return <ImageIcon size={20} className="text-purple-500" />;
      case "video":
        return <Video size={20} className="text-amber-500" />;
      case "archive":
        return <Archive size={20} className="text-blue-500" />;
      default:
        return <FileText size={20} className="text-gray-400" />;
    }
  };

  const isVideoUrl = (url: string) => {
    return /\.(mp4|mov|webm|mkv)$/i.test(url) || url.includes("loom.com") || url.includes("youtube.com") || url.includes("youtu.be");
  };

  return (
    <div className="delivery-container" id="project-delivery-section">
      {/* Toast Alert on action */}
      {actionSuccessMsg && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.18) 0%, rgba(62,124,82,0.25) 100%)",
            border: "1px solid #22c55e",
            borderRadius: "10px",
            padding: "12px 18px",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#15803d",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          <Sparkles size={18} />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Header & Status Section */}
      <div className={`delivery-hero status-${currentStatus}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "18px", fontWeight: 800, color: "var(--text-1)" }}>
                <FileCheck2 size={22} className="text-emerald-600" />
                <span>{delivery?.title || t("delivery.title", "Project Delivery & Handover")}</span>
              </div>
              <span className={`delivery-status-chip ${statusConfig.cls}`}>
                {statusConfig.icon}
                <span>{statusConfig.label}</span>
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-2)", margin: 0 }}>
              {t("delivery.subtitle", "Official credentials, user manual, and verified handover documents.")}
            </p>
          </div>

          {/* Quick Actions (Print & Admin Control) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-sm btn-ghost"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "12px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
              title={t("delivery.print", "Print Handover Document")}
            >
              <Printer size={14} />
              <span>{t("delivery.print", "Print Handover Document")}</span>
            </button>

            {isAdmin && onOpenAdminManage && (
              <button
                type="button"
                onClick={onOpenAdminManage}
                className="btn btn-sm"
                style={{
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "12px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                }}
              >
                <Key size={14} />
                <span>{lang === "ar" ? "تعديل بيانات التسليم" : "Manage Delivery Data"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Handover Dates & Certificate Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid rgba(62,124,82,0.15)",
            fontSize: "12px",
            color: "var(--text-2)",
          }}
        >
          {delivery?.deliveredAt && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={14} className="text-emerald-600" />
              <span>{t("delivery.deliveredOn", { date: formatDate(delivery.deliveredAt) })}</span>
            </div>
          )}

          {currentStatus === "delivered" && (
            <div className="delivery-seal-badge">
              <CheckCircle size={16} />
              <span>{t("delivery.verifiedSeal", "Officially Delivered & Verified")}</span>
              {delivery?.clientSignedAt && (
                <span style={{ fontSize: "11px", opacity: 0.85, fontWeight: 500 }}>
                  ({formatDate(delivery.clientSignedAt)})
                </span>
              )}
            </div>
          )}

          {currentStatus === "ready_for_review" && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#b45309", fontWeight: 600 }}>
              <Sparkles size={14} />
              <span>{lang === "ar" ? "المشروع متاح الآن لفحصكم واعتماد استلامه" : "Deliverables are ready for your review & approval"}</span>
            </div>
          )}
        </div>

        {/* Welcome / Summary Text */}
        {delivery?.summary && (
          <div
            style={{
              marginTop: 14,
              padding: "12px 16px",
              background: "rgba(255,255,255,0.7)",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              fontSize: "13.5px",
              lineHeight: 1.6,
              color: "var(--text-1)",
            }}
          >
            {delivery.summary}
          </div>
        )}

        {/* Client Feedback Note if delivered */}
        {delivery?.clientFeedback && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 14px",
              background: "rgba(34,197,94,0.08)",
              borderLeft: isRTL ? "none" : "3px solid #22c55e",
              borderRight: isRTL ? "3px solid #22c55e" : "none",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#166534",
            }}
          >
            <strong>{lang === "ar" ? "ملاحظة اعتماد العميل:" : "Client Sign-off Feedback:"}</strong> {delivery.clientFeedback}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. ACCESS CREDENTIALS & LOGINS (بيانات الدخول والحسابات) */}
      {/* ========================================================= */}
      <div className="section" style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div className="section-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Key size={18} className="text-emerald-600" />
            <span>{t("delivery.credentials", "Access Credentials & Logins")}</span>
            {credentialsList.length > 0 && (
              <span style={{ fontSize: "11px", background: "rgba(62,124,82,0.15)", color: "#166534", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
                {credentialsList.length}
              </span>
            )}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
            {t("delivery.credentialsDesc", "Direct logins for dashboards, hosting, domain, and external services.")}
          </span>
        </div>

        {credentialsList.length > 0 ? (
          <div className="credentials-grid">
            {credentialsList.map((cred, idx) => {
              const isPasswordShown = !!visiblePasswords[cred.id || idx];
              const isUserCopied = copiedKey === `user-${cred.id || idx}`;
              const isPassCopied = copiedKey === `pass-${cred.id || idx}`;

              return (
                <div key={cred.id || idx} className="credential-card">
                  {/* Card Title & Role */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-1)", display: "flex", alignItems: "center", gap: 6 }}>
                        <Lock size={15} className="text-emerald-600" />
                        <span>{cred.title || (lang === "ar" ? "بيانات الدخول" : "Access Credentials")}</span>
                      </div>
                      {cred.role && (
                        <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: 2, fontWeight: 600 }}>
                          {cred.role}
                        </div>
                      )}
                    </div>

                    {cred.url && (
                      <a
                        href={cred.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "11px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          color: "var(--moemen-green)",
                        }}
                        title={t("delivery.loginLink", "Open Login Page")}
                      >
                        <ExternalLink size={13} />
                        <span>{t("delivery.loginLink", "Open Portal")}</span>
                      </a>
                    )}
                  </div>

                  {/* Username / Email row */}
                  {cred.username && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600 }}>
                        {lang === "ar" ? "البريد / اسم المستخدم:" : "Username / Email:"}
                      </div>
                      <div className="credential-input-box">
                        <span style={{ direction: "ltr", textAlign: "left" }}>{cred.username}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(cred.username || "", `user-${cred.id || idx}`)}
                          className={`credential-copy-btn ${isUserCopied ? "copied" : ""}`}
                          title={t("delivery.copy", "Copy")}
                        >
                          {isUserCopied ? <Check size={13} /> : <Copy size={13} />}
                          <span>{isUserCopied ? t("delivery.copied", "Copied!") : t("delivery.copy", "Copy")}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Password row */}
                  {cred.password && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600 }}>
                        {lang === "ar" ? "كلمة المرور:" : "Password:"}
                      </div>
                      <div className="credential-input-box">
                        <span style={{ direction: "ltr", textAlign: "left", letterSpacing: isPasswordShown ? "normal" : "2px" }}>
                          {isPasswordShown ? cred.password : "••••••••••••"}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(cred.id || String(idx))}
                            className="credential-copy-btn"
                            title={isPasswordShown ? t("delivery.hidePassword", "Hide") : t("delivery.showPassword", "Show")}
                          >
                            {isPasswordShown ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(cred.password || "", `pass-${cred.id || idx}`)}
                            className={`credential-copy-btn ${isPassCopied ? "copied" : ""}`}
                            title={t("delivery.copy", "Copy")}
                          >
                            {isPassCopied ? <Check size={13} /> : <Copy size={13} />}
                            <span>{isPassCopied ? t("delivery.copied", "Copied!") : t("delivery.copy", "Copy")}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes for this credential */}
                  {cred.notes && (
                    <div style={{ fontSize: "11.5px", color: "var(--text-3)", marginTop: 8, fontStyle: "italic", borderTop: "1px dashed var(--border)", paddingTop: 6 }}>
                      {cred.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: "18px", textAlign: "center", color: "var(--text-3)", fontSize: "13px" }}>
            {t("delivery.noCredentials", "No access credentials added yet.")}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. OPERATIONAL INSTRUCTIONS & GUIDE (دليل الاستخدام والتشغيل) */}
      {/* ========================================================= */}
      <div className="section" style={{ marginBottom: 26 }}>
        <div className="section-title" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={18} className="text-emerald-600" />
          <span>{t("delivery.howToUse", "Operations & User Guide")}</span>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "20px 22px",
            fontSize: "14px",
            lineHeight: 1.7,
            color: "var(--text-1)",
            whiteSpace: "pre-line",
          }}
        >
          {delivery?.instructions ? (
            delivery.instructions
          ) : (
            <p style={{ color: "var(--text-3)", fontStyle: "italic", margin: 0 }}>
              {t("delivery.noInstructions", "Standard operations guide will be provided upon final review.")}
            </p>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. HANDOVER DOCUMENTS & MEDIA (مستندات وملفات التسليم: PDF, Excel, صور, فيديو) */}
      {/* ========================================================= */}
      <div className="section" style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div className="section-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Archive size={18} className="text-emerald-600" />
            <span>{t("delivery.documents", "Handover Documents & Media")}</span>
            {assetsList.length > 0 && (
              <span style={{ fontSize: "11px", background: "rgba(62,124,82,0.15)", color: "#166534", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
                {assetsList.length}
              </span>
            )}
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
            {t("delivery.documentsDesc", "Official PDFs, spreadsheets, image screenshots, and tutorial videos.")}
          </span>
        </div>

        {assetsList.length > 0 ? (
          <div className="delivery-assets-grid">
            {assetsList.map((asset, idx) => {
              const isImg = asset.type === "image" || /\.(png|jpe?g|webp|gif)$/i.test(asset.url);
              const isVid = asset.type === "video" || isVideoUrl(asset.url);

              return (
                <div key={asset.id || idx} className="delivery-asset-card">
                  <div>
                    {/* Top Row: Type Badge + Size */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span className={`asset-badge ${asset.type || "document"}`}>
                        {renderAssetIcon(asset.type)}
                        <span>{asset.type?.toUpperCase()}</span>
                      </span>
                      {asset.fileSize && (
                        <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600 }}>
                          {asset.fileSize}
                        </span>
                      )}
                    </div>

                    {/* Image Thumbnail Preview if applicable */}
                    {isImg && (
                      <div
                        onClick={() => setPreviewImage(asset.url)}
                        style={{
                          width: "100%",
                          height: "120px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          marginBottom: "10px",
                          cursor: "pointer",
                          background: "#f0f2ef",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title={lang === "ar" ? "اضغط للتكبير" : "Click to enlarge"}
                      >
                        <img
                          src={asset.url}
                          alt={asset.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    {/* Video Play Thumbnail Preview */}
                    {isVid && (
                      <div
                        onClick={() => setPreviewVideo({ url: asset.url, title: asset.title })}
                        style={{
                          width: "100%",
                          height: "100px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg, #1F2A24 0%, #374A3C 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "10px",
                          cursor: "pointer",
                          color: "#fff",
                          position: "relative",
                        }}
                        title={lang === "ar" ? "تشغيل الفيديو" : "Play Video"}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Play size={18} fill="#fff" />
                        </div>
                      </div>
                    )}

                    {/* Title */}
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-1)", marginBottom: 4 }}>
                      {asset.title}
                    </div>

                    {/* Description */}
                    {asset.description && (
                      <p style={{ fontSize: "12px", color: "var(--text-2)", margin: "4px 0 8px", lineHeight: 1.4 }}>
                        {asset.description}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                    {isVid ? (
                      <button
                        type="button"
                        onClick={() => setPreviewVideo({ url: asset.url, title: asset.title })}
                        className="btn btn-sm btn-primary"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "11px", padding: "5px 12px", flex: 1, justifyContent: "center" }}
                      >
                        <Play size={13} />
                        <span>{lang === "ar" ? "مشاهدة الفيديو" : "Watch Video"}</span>
                      </button>
                    ) : isImg ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(asset.url)}
                        className="btn btn-sm btn-ghost"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "11px", padding: "5px 12px", flex: 1, justifyContent: "center", border: "1px solid var(--border)" }}
                      >
                        <ImageIcon size={13} />
                        <span>{lang === "ar" ? "تكبير الصورة" : "Enlarge Image"}</span>
                      </button>
                    ) : (
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-ghost"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "11px", padding: "5px 12px", flex: 1, justifyContent: "center", border: "1px solid var(--border)" }}
                      >
                        <ExternalLink size={13} />
                        <span>{lang === "ar" ? "فتح المستند" : "Open File"}</span>
                      </a>
                    )}

                    <a
                      href={asset.url}
                      download
                      className="btn btn-sm btn-ghost"
                      style={{ padding: "5px 8px", borderRadius: "6px", border: "1px solid var(--border)" }}
                      title={lang === "ar" ? "تحميل الملف" : "Download File"}
                    >
                      <Download size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: "18px", textAlign: "center", color: "var(--text-3)", fontSize: "13px" }}>
            {t("delivery.noDocuments", "No handover files attached yet.")}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. WARRANTY & TECHNICAL SUPPORT (الضمان والدعم الفني) */}
      {/* ========================================================= */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(62,124,82,0.06) 0%, rgba(31,42,36,0.03) 100%)",
          border: "1px solid rgba(62,124,82,0.3)",
          borderRadius: "var(--radius-md)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "10px",
              background: "rgba(62,124,82,0.15)",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-1)" }}>
              {t("delivery.support", "Warranty & Technical Support")}
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--text-2)", marginTop: 2 }}>
              {delivery?.supportPeriod || "دعم فني وضمان مجاني لمدة شهرين بعد التسليم"}
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-3)", marginTop: 2 }}>
              {delivery?.supportContact || "support@moemen-team.tech | WhatsApp الدعم الفني"}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. CLIENT CONFIRMATION & INTERACTION BUTTONS */}
      {/* ========================================================= */}
      {currentStatus !== "delivered" && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "14.5px", color: "var(--text-1)" }}>
              {lang === "ar" ? "هل قمت بمراجعة بيانات وملفات التسليم؟" : "Have you reviewed the handover deliverables?"}
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--text-2)", marginTop: 2 }}>
              {lang === "ar"
                ? "يمكنك الآن اعتماد استلام المشروع وتأكيده رسمياً، أو إرسال أي ملاحظات واستفسارات للفريق."
                : "You can officially sign off and accept delivery, or send revision inquiries to our engineering team."}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setFeedbackText("");
                setIsRevisionModalOpen(true);
              }}
              className="btn btn-sm btn-ghost"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: "12.5px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            >
              <MessageSquare size={15} />
              <span>{t("delivery.revisionBtn", "Request Revision / Inquiry")}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFeedbackText("");
                setIsConfirmModalOpen(true);
              }}
              className="btn btn-sm btn-primary"
              style={{
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                color: "#ffffff",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: "13px",
                padding: "8px 20px",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(16, 185, 129, 0.35)",
              }}
            >
              <CheckCircle size={16} />
              <span>{t("delivery.confirmBtn", "Confirm Receipt & Sign-off")}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Confirm Handover & Sign-off */}
      {/* ========================================================= */}
      {isConfirmModalOpen && (
        <div
          className="modal-backdrop open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsConfirmModalOpen(false);
          }}
        >
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "16px" }}>
                <ShieldCheck size={20} className="text-emerald-600" />
                <span>{t("delivery.confirmModalTitle", "Confirm Project Handover & Sign-off")}</span>
              </div>
              <button
                className="icon-btn modal-close"
                onClick={() => setIsConfirmModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="modal-sub" style={{ fontSize: "13px", color: "var(--text-2)", marginTop: 6, lineHeight: 1.5 }}>
              {t("delivery.confirmModalDesc", "By confirming, you acknowledge receipt of all deliverables, access credentials, and operational guides.")}
            </p>

            <div className="field" style={{ marginTop: 14 }}>
              <label htmlFor="client-sign-feedback" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                {t("delivery.feedbackLabel", "Your Feedback or Appreciation Note (Optional)")}
              </label>
              <textarea
                id="client-sign-feedback"
                rows={3}
                placeholder={t("delivery.feedbackPlaceholder", "Write your feedback or comments for Moemen Team…")}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmHandover}
                className="btn btn-sm btn-primary"
                style={{
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <CheckCircle size={15} />
                <span>{isSubmitting ? (lang === "ar" ? "جاري الاعتماد..." : "Signing off...") : (lang === "ar" ? "تأكيد واستلام نهائي" : "Confirm & Sign-off")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Request Revision or Inquiry */}
      {/* ========================================================= */}
      {isRevisionModalOpen && (
        <div
          className="modal-backdrop open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRevisionModalOpen(false);
          }}
        >
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "16px" }}>
                <MessageSquare size={20} className="text-blue-600" />
                <span>{lang === "ar" ? "طلب استفسار أو ملاحظة حول التسليم" : "Request Delivery Revision / Notes"}</span>
              </div>
              <button
                className="icon-btn modal-close"
                onClick={() => setIsRevisionModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="modal-sub" style={{ fontSize: "13px", color: "var(--text-2)", marginTop: 6, lineHeight: 1.5 }}>
              {lang === "ar"
                ? "اكتب أي تفاصيل أو استفسارات تحتاج توضيحها من الفريق الهندسي وسيقوم بالرد والتعديل فوراً."
                : "Describe any questions or adjustments you need from our team regarding project delivery."}
            </p>

            <div className="field" style={{ marginTop: 14 }}>
              <label htmlFor="revision-feedback" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                {lang === "ar" ? "تفاصيل الملاحظات أو الاستفسار *" : "Revision Notes or Inquiry *"}
              </label>
              <textarea
                id="revision-feedback"
                required
                rows={4}
                placeholder={lang === "ar" ? "اكتب ملاحظاتك هنا بالتفصيل…" : "Write your questions or notes here…"}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                className="btn btn-ghost btn-sm"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={isSubmitting || !feedbackText.trim()}
                onClick={handleRequestRevision}
                className="btn btn-sm btn-primary"
                style={{
                  background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MessageSquare size={15} />
                <span>{isSubmitting ? (lang === "ar" ? "جاري الإرسال..." : "Sending...") : (lang === "ar" ? "إرسال الملاحظات" : "Send Notes")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Image Lightbox Modal */}
      {/* ========================================================= */}
      {previewImage && (
        <div
          className="modal-backdrop open"
          style={{ zIndex: 9999, background: "rgba(0,0,0,0.85)" }}
          onClick={() => setPreviewImage(null)}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: "absolute",
                top: -36,
                right: 0,
                color: "#ffffff",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "50%",
                padding: "6px",
              }}
            >
              <X size={20} />
            </button>
            <img
              src={previewImage}
              alt="Enlarged deliverable"
              style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: 8 }}
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Video Player Modal */}
      {/* ========================================================= */}
      {previewVideo && (
        <div
          className="modal-backdrop open"
          style={{ zIndex: 9999, background: "rgba(0,0,0,0.85)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewVideo(null);
          }}
        >
          <div style={{ width: "90%", maxWidth: 800, background: "#1F2A24", borderRadius: 12, padding: 16, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, color: "#fff" }}>
              <div style={{ fontWeight: 700, fontSize: "16px", display: "flex", alignItems: "center", gap: 8 }}>
                <Video size={18} className="text-amber-400" />
                <span>{previewVideo.title}</span>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                style={{ color: "#fff", background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {previewVideo.url.includes("loom.com") ? (
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src={previewVideo.url.replace("/share/", "/embed/")}
                  frameBorder="0"
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 8 }}
                />
              </div>
            ) : previewVideo.url.includes("youtube.com") || previewVideo.url.includes("youtu.be") ? (
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                <iframe
                  src={previewVideo.url.replace("watch?v=", "embed/")}
                  frameBorder="0"
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 8 }}
                />
              </div>
            ) : (
              <video
                src={previewVideo.url}
                controls
                autoPlay
                style={{ width: "100%", maxHeight: "70vh", borderRadius: 8, background: "#000" }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
