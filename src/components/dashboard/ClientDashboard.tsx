"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Footer } from "@/components/ui/Footer";
import {
  HomeIcon,
  FolderIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LogoutIcon,
  MenuIcon,
  XIcon,
  SendIcon,
  GlobeIcon,
  SmartphoneIcon,
  ZapIcon,
  MonitorIcon,
  CheckIcon,
  CheckCircleIcon,
  ClockIcon,
  WalletIcon,
  FileTextIcon,
  MessageIcon,
  PlayIcon,
  ArrowLeftIcon,
  CalendarIcon,
  TrendingUpIcon,
  ExternalLinkIcon,
  MailIcon,
  SparkleIcon,
  CollapseIcon,
  CameraIcon,
  UploadIcon,
  GitMergeIcon,
} from "@/components/ui/Icons";
import { useLanguage, LanguageToggle } from "@/lib/i18n";

interface Stage {
  id?: string;
  name: string;
  status: "done" | "current" | "pending";
}

interface PaymentItem {
  id?: string;
  date: string;
  amount: number;
  method: string;
  note: string;
}

interface QuotationItem {
  item: string;
  amount: number;
}

interface NoteItem {
  id?: string;
  author: "client" | "team";
  text: string;
  date?: string;
  createdAt?: string;
}

export interface FastFixIssueItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  photoUrl?: string | null;
  status: "pending" | "on_it" | "fixed";
  startedAt?: string | null;
  resolvedAt?: string | null;
  durationMinutes?: number | null;
  adminNotes?: string | null;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    type: string;
    client?: { id: string; name: string; company?: string };
  };
}

export interface ProjectExtensionItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "requested" | "in_progress" | "completed" | "merged";
  progress: number;
  budget: number;
  paid: number;
  targetDays?: number;
  versionTarget?: string;
  notes?: string;
  payments?: string;
  stages?: string;
  mergedAt?: string | null;
  createdAt: string;
}

interface ProjectData {
  id: string;
  name: string;
  type: "website" | "mobile" | "automation" | "desktop" | "email_service" | string;
  status: "requested" | "in_review" | "in_progress" | "completed" | "merged";
  description: string;
  progress: number;
  contractDate?: string;
  contractStatus?: string;
  requestDate?: string;
  totalDays?: number;
  budget?: number;
  paid?: number;
  versionLabel?: string;
  versionNote?: string;
  quotationItems?: string;
  stages?: Stage[];
  payments?: PaymentItem[];
  notes?: NoteItem[];
  fastFixIssues?: FastFixIssueItem[];
  extensions?: ProjectExtensionItem[];
}

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

interface Toast {
  id: string;
  message: string;
  iconName?: "check" | "sparkle";
}

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  website: { label: "Website", icon: GlobeIcon },
  mobile: { label: "Mobile App", icon: SmartphoneIcon },
  automation: { label: "Automation", icon: ZapIcon },
  desktop: { label: "Desktop System", icon: MonitorIcon },
  email_service: { label: "Email Service", icon: MailIcon },
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  requested: { label: "Requested", cls: "status-requested" },
  in_review: { label: "In Review", cls: "status-in_review" },
  in_progress: { label: "In Progress", cls: "status-in_progress" },
  completed: { label: "Completed", cls: "status-completed" },
  merged: { label: "Merged", cls: "status-completed" },
};

const PROJECT_TYPES = [
  { key: "website", label: "Website", icon: GlobeIcon, desc: "Marketing sites, stores & web apps" },
  { key: "mobile", label: "Mobile App", icon: SmartphoneIcon, desc: "iOS & Android apps" },
  { key: "automation", label: "Automation", icon: ZapIcon, desc: "Workflows, integrations & tools" },
  { key: "desktop", label: "Desktop System", icon: MonitorIcon, desc: "Custom desktop software" },
  { key: "email_service", label: "Email Service", icon: MailIcon, desc: "Dedicated servers, newsletters & transactional email" },
];

function fmtMoney(n: number) {
  return "EGP " + Math.round(n || 0).toLocaleString("en-US");
}

function fmtDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d + (d.includes("T") ? "" : "T00:00:00"));
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function timelineInfo(p: ProjectData) {
  const total = p.totalDays || 60;
  if (!p.contractDate) {
    return { elapsed: 0, remaining: total, total, pct: 0, endDateISO: "" };
  }
  const start = new Date(p.contractDate + (p.contractDate.includes("T") ? "" : "T00:00:00"));
  const today = new Date();
  let elapsed = daysBetween(start, today);
  elapsed = Math.max(0, Math.min(elapsed, total));
  const remaining = Math.max(0, total - elapsed);
  const pct = Math.round((elapsed / total) * 100);
  const endDate = new Date(start.getTime() + total * 86400000);
  const endDateISO = endDate.toISOString().slice(0, 10);
  return { elapsed, remaining, total, pct, endDateISO };
}

export function ClientDashboard({
  initialPage = "home",
  initialProjectId = null,
}: {
  initialPage?: "home" | "projects" | "project-detail";
  initialProjectId?: string | null;
}) {
  const { data: session } = useSession();
  const { lang, t, formatMoney, formatDuration, formatDate, isRTL } = useLanguage();

  const userName = session?.user?.name || (lang === "ar" ? "العميل" : "Client");
  const userInitials = (session?.user as any)?.initials || (userName ? userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "CL");
  const userCompany = (session?.user as any)?.company || (lang === "ar" ? "الشركة" : "Company");
  const userEmail = session?.user?.email || "";
  const clientSince = (session?.user as any)?.clientSince || "2026";
  const userRole = (session?.user as any)?.role || "CLIENT";
  const isAdminOrManager = userRole === "ADMIN" || userRole === "MANAGER";

  // Dashboard page state
  const [page, setPage] = useState<"home" | "projects" | "project-detail">(initialPage);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Shell UI states
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Modals state
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectStep, setNewProjectStep] = useState<1 | 2>(1);
  const [selectedNewType, setSelectedNewType] = useState<"website" | "mobile" | "automation" | "desktop" | "email_service">("website");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectBudget, setNewProjectBudget] = useState("");
  const [newProjectDays, setNewProjectDays] = useState("30");
  const [newProjectRequirements, setNewProjectRequirements] = useState("");
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  // Fast Fixing Modal state
  const [isFastFixOpen, setIsFastFixOpen] = useState(false);
  const [fastFixProjectId, setFastFixProjectId] = useState<string>("");
  const [fastFixTitle, setFastFixTitle] = useState("");
  const [fastFixDesc, setFastFixDesc] = useState("");
  const [fastFixPhoto, setFastFixPhoto] = useState<string | null>(null);
  const [isSubmittingFastFix, setIsSubmittingFastFix] = useState(false);
  const [viewingPhotoModal, setViewingPhotoModal] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // Project Extension Modal state
  const [isExtModalOpen, setIsExtModalOpen] = useState(false);
  const [extTargetProjectId, setExtTargetProjectId] = useState<string>("");
  const [extTitle, setExtTitle] = useState("");
  const [extDesc, setExtDesc] = useState("");
  const [extBudget, setExtBudget] = useState("");
  const [extDays, setExtDays] = useState("15");
  const [extVersionTarget, setExtVersionTarget] = useState("v2.0");
  const [isSubmittingExt, setIsSubmittingExt] = useState(false);
  const [isMergingExtId, setIsMergingExtId] = useState<string | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewProjectId, setPreviewProjectId] = useState<string | null>(null);

  const [isContactOpen, setIsContactOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm here to help you figure out your next move: a website, mobile app, automation, or desktop system. What are you looking to build?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

  // Notes state for detail view
  const [noteInput, setNoteInput] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const notesListRef = useRef<HTMLDivElement | null>(null);

  const showToast = (message: string, iconName: "check" | "sparkle" = "check") => {
    const id = "t_" + Date.now();
    setToasts((prev) => [...prev, { id, message, iconName }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  };

  // Fetch projects from backend
  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, chatBusy]);

  // Handle Chat Send
  const handleSendChat = async (overrideText?: string) => {
    const text = (overrideText || chatInput).trim();
    if (!text || chatBusy) return;

    const newMessages: ChatMessage[] = [...chatMessages, { role: "user", content: text }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error("Chat request failed");
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I had trouble connecting. You can tap New in the sidebar to submit your project request directly!",
        },
      ]);
    } finally {
      setChatBusy(false);
    }
  };

  // Navigation helper
  const navigateTo = (toPage: "home" | "projects" | "project-detail", projectId?: string) => {
    setPage(toPage);
    if (projectId !== undefined) setSelectedProjectId(projectId);
    setIsDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit New Project Request
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectDesc.trim() || isSubmittingProject) return;

    setIsSubmittingProject(true);
    try {
      const fullDesc = `${newProjectDesc.trim()}${
        newProjectRequirements.trim() ? `\n\nالمميزات والمتطلبات التفصيلية:\n${newProjectRequirements.trim()}` : ""
      }`;

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: fullDesc,
          type: selectedNewType,
          budget: newProjectBudget ? parseFloat(newProjectBudget) : 0,
          totalDays: newProjectDays ? parseInt(newProjectDays) : 30,
          status: "requested",
          contractStatus: "قيد المراجعة",
        }),
      });

      if (res.ok) {
        const newProj = await res.json();
        setProjects((prev) => [newProj, ...prev]);
        setIsNewProjectOpen(false);
        setNewProjectName("");
        setNewProjectDesc("");
        setNewProjectBudget("");
        setNewProjectDays("30");
        setNewProjectRequirements("");
        setNewProjectStep(1);
        showToast("تم إرسال طلب المشروع بنجاح — سيقوم مهندسونا بمراجعته والبدء بالعمل فوراً!");
        navigateTo("project-detail", newProj.id);
      } else {
        throw new Error("Failed to create project");
      }
    } catch {
      showToast("تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmittingProject(false);
    }
  };

  // Submit Note on Project Detail
  const handleAddNote = async (projectId: string) => {
    if (!noteInput.trim() || isSubmittingNote) return;

    setIsSubmittingNote(true);
    const text = noteInput.trim();
    try {
      const res = await fetch(`/api/projects/${projectId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, author: "client" }),
      });

      if (res.ok) {
        const newNote = await res.json();
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id === projectId) {
              return {
                ...p,
                notes: [...(p.notes || []), newNote],
              };
            }
            return p;
          })
        );
        setNoteInput("");
        showToast("Note added", "check");
      }
    } catch {
      showToast("Failed to add note.");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Fast Fixing Handlers
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFastFixPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleOpenFastFix = (projId?: string) => {
    const targetId = projId || selectedProjectId || (projects[0]?.id || "");
    setFastFixProjectId(targetId);
    setFastFixTitle("");
    setFastFixDesc("");
    setFastFixPhoto(null);
    setIsFastFixOpen(true);
  };

  const handleSubmitFastFix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastFixProjectId || !fastFixDesc.trim() || isSubmittingFastFix) return;
    setIsSubmittingFastFix(true);
    try {
      const res = await fetch("/api/fast-fixing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: fastFixProjectId,
          title: fastFixTitle.trim() || t("fastFix.title", "Fast Fixing A Problem"),
          description: fastFixDesc.trim(),
          photoUrl: fastFixPhoto,
        }),
      });
      if (res.ok) {
        showToast(
          lang === "ar"
            ? "تم تسجيل العطل بنجاح وسيباشر مهندسونا حله فوراً!"
            : "Issue registered! Our engineers are on it.",
          "sparkle"
        );
        setIsFastFixOpen(false);
        setFastFixTitle("");
        setFastFixDesc("");
        setFastFixPhoto(null);
        await fetchProjects();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to submit issue");
      }
    } catch {
      showToast("Error submitting issue");
    } finally {
      setIsSubmittingFastFix(false);
    }
  };

  // Project Extension Handlers
  const handleOpenExtModal = (projId?: string) => {
    const targetId = projId || selectedProjectId || (projects[0]?.id || "");
    setExtTargetProjectId(targetId);
    setExtTitle("");
    setExtDesc("");
    setExtBudget("");
    setExtDays("15");
    setExtVersionTarget("v2.0");
    setIsExtModalOpen(true);
  };

  const handleSubmitExtension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extTargetProjectId || !extTitle.trim() || !extDesc.trim() || isSubmittingExt) return;
    setIsSubmittingExt(true);
    try {
      const res = await fetch(`/api/projects/${extTargetProjectId}/extensions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: extTitle.trim(),
          description: extDesc.trim(),
          budget: extBudget ? parseFloat(extBudget) : 0,
          targetDays: extDays ? parseInt(extDays) : 15,
          versionTarget: extVersionTarget || "v2.0",
        }),
      });
      if (res.ok) {
        showToast(
          lang === "ar"
            ? "تم إرسال طلب مرحلة التطوير الجديدة للإدارة بنجاح!"
            : "Development phase request submitted to management!",
          "sparkle"
        );
        setIsExtModalOpen(false);
        setExtTitle("");
        setExtDesc("");
        setExtBudget("");
        await fetchProjects();
      } else {
        showToast("Failed to submit extension");
      }
    } catch {
      showToast("Error submitting extension");
    } finally {
      setIsSubmittingExt(false);
    }
  };

  const handleMergeExtension = async (projectId: string, extensionId: string) => {
    if (
      !confirm(
        lang === "ar"
          ? "هل أنت متأكد من دمج مرحلة التطوير المكتملة في المشروع الأساسي؟ سيتم تحديث الميزانية الإجمالية ورقم الإصدار."
          : "Are you sure you want to merge this completed development phase into the base project? This will update the project's overall budget, payments, and version."
      )
    )
      return;
    setIsMergingExtId(extensionId);
    try {
      const res = await fetch(`/api/projects/${projectId}/extensions/${extensionId}/merge`, {
        method: "POST",
      });
      if (res.ok) {
        showToast(
          lang === "ar"
            ? "تم دمج مرحلة التطوير بنجاح في المشروع الأساسي!"
            : "Development phase merged successfully into base project!",
          "sparkle"
        );
        await fetchProjects();
      } else {
        showToast("Failed to merge extension");
      }
    } catch {
      showToast("Error merging extension");
    } finally {
      setIsMergingExtId(null);
    }
  };

  // Calculate project metrics
  const activeCount = projects.filter((p) => p.status === "in_progress" || p.status === "in_review").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Dynamic Page Title
  let pageTitle = "Home";
  if (page === "projects") pageTitle = "Projects";
  else if (page === "project-detail" && currentProject) pageTitle = currentProject.name;

  return (
    <div className={`app-shell visible ${isCollapsed ? "collapsed" : ""} ${isDrawerOpen ? "drawer-open" : ""}`}>
      {/* Mobile Backdrop */}
      <div
        id="drawer-backdrop"
        className="drawer-backdrop"
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <aside id="sidebar" className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="logo-badge"></div>
            <span className="sidebar-wordmark">
              MOEMEN<span>TEAM</span>
            </span>
          </div>
          <button
            id="sidebar-collapse-btn"
            className="icon-btn"
            data-collapse-only
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Collapse sidebar"
          >
            <CollapseIcon />
          </button>
          <button
            id="sidebar-close-btn"
            className="icon-btn sidebar-close-btn"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close menu"
          >
            <XIcon />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${page === "home" ? "active" : ""}`}
            onClick={() => navigateTo("home")}
          >
            <HomeIcon />
            <span>{t("nav.home", "Home")}</span>
          </button>
          <button
            className={`nav-item ${page === "projects" ? "active" : ""}`}
            onClick={() => navigateTo("projects")}
          >
            <FolderIcon />
            <span>{t("nav.projects", "Projects")}</span>
          </button>
          <button
            className="nav-item"
            id="fast-fixing-sidebar-btn"
            onClick={() => handleOpenFastFix()}
            style={{ color: "#FBBF24" }}
          >
            <ZapIcon />
            <span>{t("nav.fastFixing", "Fast Fixing")}</span>
          </button>
          <button
            className="nav-item"
            id="new-project-btn"
            onClick={() => {
              setNewProjectStep(1);
              setIsNewProjectOpen(true);
            }}
          >
            <PlusIcon />
            <span>{t("nav.newProject", "New")}</span>
          </button>
          <Link
            href="/about"
            className="nav-item"
            onClick={() => setIsDrawerOpen(false)}
          >
            <SparkleIcon />
            <span>{lang === "ar" ? "من نحن (About Us)" : "About Moemen Team"}</span>
          </Link>

          {isAdminOrManager && (
            <a
              href="/admin"
              className="nav-item"
              style={{
                marginTop: "12px",
                background: "linear-gradient(135deg, rgba(62,124,82,0.25) 0%, rgba(55,74,60,0.4) 100%)",
                border: "1px solid rgba(167,183,167,0.4)",
                color: "#E3E7E1",
                fontWeight: 600,
              }}
              title="لوحة تحكم الإدارة"
            >
              <ZapIcon />
              <span>{lang === "ar" ? "لوحة الإدارة" : "Admin Panel"}</span>
            </a>
          )}
        </nav>

        <div className="sidebar-spacer"></div>

        <div className="sidebar-profile">
          <button
            id="profile-toggle"
            className={`profile-chip ${isProfileOpen ? "open" : ""}`}
            onClick={() => {
              if (isCollapsed) setIsCollapsed(false);
              setIsProfileOpen(!isProfileOpen);
            }}
          >
            <span className="avatar">{userInitials}</span>
            <span className="profile-meta">
              <span className="profile-name">{userName}</span>
              <span className="profile-role">
                {isAdminOrManager ? `🛡️ ${userRole}` : userCompany}
              </span>
            </span>
            <span className="chevron">
              <ChevronDownIcon />
            </span>
          </button>
          <div id="profile-panel" className={`profile-panel ${isProfileOpen ? "open" : ""}`}>
            <div className="profile-panel-inner">
              <div className="profile-email">{userEmail}</div>
              <div className="profile-company">
                {isAdminOrManager ? `Role: ${userRole}` : `Client since ${clientSince}`}
              </div>
              {isAdminOrManager && (
                <a
                  href="/admin"
                  className="btn btn-primary btn-block btn-sm"
                  style={{ marginBottom: "8px", justifyContent: "center" }}
                >
                  🛡️ {lang === "ar" ? "فتح لوحة تحكم الإدارة" : "Open Admin Console"}
                </a>
              )}
              <button
                id="logout-btn"
                className="btn btn-ghost btn-block btn-sm"
                onClick={async () => {
                  try {
                    await signOut({ redirect: false });
                  } catch {}
                  window.location.href = "/login";
                }}
              >
                <LogoutIcon />
                <span>{t("nav.logout", "Log out")}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="app-main">
        {/* Topbar */}
        <header className="topbar">
          <button
            id="hamburger-btn"
            className="icon-btn hamburger-btn"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <div className="topbar-logo-mobile">
            <div className="logo-badge"></div>
          </div>
          <h2 id="page-title" className="topbar-title">
            {pageTitle}
          </h2>
          <div className="topbar-actions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LanguageToggle />
            <button
              id="fast-fix-topbar-btn"
              className="btn btn-sm"
              style={{
                background: "linear-gradient(135deg, #CA8A04 0%, #EAB308 100%)",
                color: "#1F2A24",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 2px 8px rgba(234, 179, 8, 0.25)"
              }}
              onClick={() => handleOpenFastFix()}
              title={t("fastFix.btn", "Fast Fixing A Problem")}
            >
              <ZapIcon />
              <span>{t("fastFix.badge", "Fast Fixing")}</span>
            </button>
            <button
              id="contact-btn"
              className="icon-btn"
              onClick={() => setIsContactOpen(true)}
              aria-label="Contact Moemen Team"
            >
              <MessageIcon />
            </button>
            <button
              id="topbar-avatar-btn"
              className="avatar avatar-sm topbar-avatar"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open menu"
            >
              {userInitials}
            </button>
          </div>
        </header>

        {/* Page Container */}
        <main id="page-container" className="page-container page-enter">
          {/* ==================== HOME VIEW ==================== */}
          {page === "home" && (
            <div className="home-view">
              {isAdminOrManager && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(31,42,36,0.95) 0%, rgba(55,74,60,0.95) 100%)",
                  border: "1px solid rgba(167,183,167,0.35)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: "10px",
                      background: "rgba(62,124,82,0.3)",
                      border: "1px solid rgba(167,183,167,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px"
                    }}>
                      🛡️
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "#F6F7F5" }}>
                        مرحباً بك في نظام الإدارة ({userRole === "ADMIN" ? "مدير النظام — ADMIN" : "المدير — MANAGER"})
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--light-sage)" }}>
                        يتوفر لديك وصول كامل للتحكم في العملاء، المشاريع، نسب الإنجاز، الدفعات المالية والملاحظات.
                      </div>
                    </div>
                  </div>
                  <a
                    href="/admin"
                    className="btn btn-primary btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    <span>الدخول للوحة تحكم الإدارة</span>
                    <span>←</span>
                  </a>
                </div>
              )}
              <div className="home-hero">
                <h1 className="home-greeting">
                  {t("home.greeting", { name: userName.split(" ")[0] })}
                </h1>
                <p className="home-sub">{t("home.subtitle")}</p>
                <p className="home-stats-line">
                  <TrendingUpIcon />
                  <span>
                    {lang === "ar"
                      ? `لديك ${activeCount} مشاريع نشطة و ${completedCount} مشاريع مكتملة معنا.`
                      : `You have ${activeCount} active and ${completedCount} completed project${completedCount === 1 ? "" : "s"} with us.`}
                  </span>
                </p>
                <div className="suggestion-pills">
                  <button
                    className="pill"
                    onClick={() => handleSendChat(lang === "ar" ? "أريد إنشاء موقع إلكتروني جديد لشركتي." : "I want to build a new website for my business.")}
                  >
                    <GlobeIcon /> {t("home.startWebsite", "Start a website")}
                  </button>
                  <button
                    className="pill"
                    onClick={() => handleSendChat(lang === "ar" ? "أريد معرفة نسبة إنجاز مشروعي الحالي." : "I want to check the progress of my current project.")}
                  >
                    <FolderIcon /> {t("home.checkProjects", "Check my projects")}
                  </button>
                  <button
                    className="pill"
                    onClick={() =>
                      handleSendChat(lang === "ar" ? "ما الفرق بين نظام الأتمتة والنظام المخصص لسطح المكتب؟" : "What is the difference between an automation and a custom desktop system?")
                    }
                  >
                    <SparkleIcon /> {t("home.askAi", "Ask Moemen AI")}
                  </button>
                </div>
              </div>

              {/* Chat Panel */}
              <div className="chat-panel">
                <div className="chat-messages" ref={chatMessagesRef}>
                  {chatMessages.map((m, idx) => (
                    <div key={idx} className={`chat-msg ${m.role}`}>
                      <div className="chat-avatar">
                        {m.role === "user" ? userInitials : <SparkleIcon />}
                      </div>
                      <div className="chat-bubble">{m.content}</div>
                    </div>
                  ))}
                  {chatBusy && (
                    <div className="chat-msg assistant chat-typing-row">
                      <div className="chat-avatar">
                        <SparkleIcon />
                      </div>
                      <div className="chat-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="chat-input-row">
                  <input
                    type="text"
                    id="chat-input"
                    placeholder={t("home.chatPlaceholder", "Message Moemen AI…")}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendChat();
                      }
                    }}
                    autoComplete="off"
                  />
                  <button
                    className="send-btn"
                    onClick={() => handleSendChat()}
                    disabled={chatBusy || !chatInput.trim()}
                    aria-label="Send message"
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>

              {/* Home Projects Preview */}
              <div className="home-projects-preview">
                <div className="section-heading">
                  <h3>{t("home.yourProjects", "Your Projects")}</h3>
                  <button className="link-more" onClick={() => navigateTo("projects")}>
                    {t("home.seeAll", "See all")} <ChevronRightIcon />
                  </button>
                </div>
                <div className="mini-cards-row">
                  {projects.slice(0, 3).map((p) => {
                    const TypeIcon = TYPE_META[p.type]?.icon || GlobeIcon;
                    const statusMeta = STATUS_META[p.status] || STATUS_META.requested;
                    return (
                      <button
                        key={p.id}
                        className="project-card"
                        style={{ padding: 16 }}
                        onClick={() => navigateTo("project-detail", p.id)}
                      >
                        <div className="project-card-top">
                          <div className="project-type-icon" style={{ width: 32, height: 32 }}>
                            <TypeIcon />
                          </div>
                          <span className={`status-badge ${statusMeta.cls}`}>{statusMeta.label}</span>
                        </div>
                        <div
                          className="project-card-title"
                          style={{ fontSize: ".92rem", marginBottom: 0 }}
                        >
                          {p.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== PROJECTS GRID VIEW ==================== */}
          {page === "projects" && (
            <div className="projects-view">
              <div className="page-header-row">
                <h1>Your Projects</h1>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setNewProjectStep(1);
                    setIsNewProjectOpen(true);
                  }}
                >
                  <PlusIcon />
                  <span>New Project</span>
                </button>
              </div>

              <div className="projects-grid">
                {projects.map((p) => {
                  const TypeIcon = TYPE_META[p.type]?.icon || GlobeIcon;
                  const statusMeta = STATUS_META[p.status] || STATUS_META.requested;
                  const dateLabel =
                    p.status === "requested"
                      ? "Requested " + fmtDate(p.requestDate)
                      : "Contract " + fmtDate(p.contractDate);

                  return (
                    <button
                      key={p.id}
                      className="project-card"
                      onClick={() => navigateTo("project-detail", p.id)}
                    >
                      <div className="project-card-top">
                        <div className="project-type-icon">
                          <TypeIcon />
                        </div>
                        <span className={`status-badge ${statusMeta.cls}`}>{statusMeta.label}</span>
                      </div>

                      <div>
                        <div className="project-card-title">{p.name}</div>
                        <div className="project-card-desc">{p.description}</div>
                      </div>

                      {p.status !== "requested" ? (
                        <div>
                          <div className="progress-row">
                            <span>Progress</span>
                            <span>{p.progress}%</span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${p.progress}%` }}></div>
                          </div>
                        </div>
                      ) : (
                        <div className="project-card-meta">
                          <ClockIcon /> Awaiting review
                        </div>
                      )}

                      <div className="project-card-meta">
                        <CalendarIcon /> {dateLabel}
                      </div>
                    </button>
                  );
                })}

                <button
                  className="new-project-card"
                  onClick={() => {
                    setNewProjectStep(1);
                    setIsNewProjectOpen(true);
                  }}
                >
                  <span className="icon-circle">
                    <PlusIcon />
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--text-1)" }}>Start a new project</span>
                  <span style={{ fontSize: ".8rem" }}>Website · Mobile · Automation · Desktop</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== PROJECT DETAIL VIEW ==================== */}
          {page === "project-detail" && currentProject && (
            <div className="project-detail-view">
              <button className="back-link" onClick={() => navigateTo("projects")}>
                <ArrowLeftIcon />
                <span>{t("nav.backToProjects", "Back to Projects")}</span>
              </button>

              <div className="detail-header">
                <div className="detail-title-group">
                  <h1>{currentProject.name}</h1>
                  <div className="badge-row">
                    <span className="type-chip">
                      {React.createElement(TYPE_META[currentProject.type]?.icon || GlobeIcon)}
                      {t(`type.${currentProject.type}`, TYPE_META[currentProject.type]?.label || currentProject.type)}
                    </span>
                    <span
                      className={`status-badge ${
                        STATUS_META[currentProject.status]?.cls || "status-requested"
                      }`}
                    >
                      {t(`status.${currentProject.status}`, STATUS_META[currentProject.status]?.label || currentProject.status)}
                    </span>
                  </div>
                </div>
                {currentProject.status === "completed" && (
                  <span className="type-chip delivered-chip">
                    <CheckCircleIcon /> {t("status.delivered", "Delivered")}
                  </span>
                )}
              </div>

              <p className="detail-desc">{currentProject.description}</p>

              {currentProject.status === "requested" ? (
                <div className="empty-state-card">
                  <div className="icon-circle">
                    <ClockIcon />
                  </div>
                  <h3>{lang === "ar" ? "طلبك قيد المراجعة لدى فريقنا الهندسي" : "Your request is with our team"}</h3>
                  <p>
                    {lang === "ar"
                      ? `تم الإرسال بتاريخ ${formatDate(currentProject.requestDate)}. سيتواصل معك فريقنا خلال 24 ساعة لتأكيد النطاق والجدول الزمني.`
                      : `Submitted ${formatDate(currentProject.requestDate)}. We will reach out within 1–2 business days to confirm scope, timeline and pricing.`}
                  </p>
                </div>
              ) : (
                <>
                  {(() => {
                    const tl = timelineInfo(currentProject);
                    return (
                      <>
                        <div className="detail-grid">
                          <div className="card">
                            <div className="card-label">
                              <CalendarIcon /> {t("project.contractDate", "Contract Date")}
                            </div>
                            <div className="card-value" style={{ fontSize: "1.05rem" }}>
                              {formatDate(currentProject.contractDate)}
                            </div>
                            <div className="card-sub">{currentProject.contractStatus || "Active"}</div>
                          </div>

                          <div className="card">
                            <div className="card-label">
                              <ClockIcon /> {t("project.timeline", "Timeline")}
                            </div>
                            <div className="card-value" style={{ fontSize: "1.05rem" }}>
                              {t("project.daysTotal", { elapsed: tl.elapsed, total: tl.total })}
                            </div>
                            <div className="card-sub">{t("project.daysRemaining", { days: tl.remaining })}</div>
                          </div>

                          <div className="card">
                            <div className="card-label">
                              <TrendingUpIcon /> {t("project.progress", "Progress")}
                            </div>
                            <div className="card-value">{currentProject.progress}%</div>
                            <div className="card-sub">{t("project.estCompletion", { date: formatDate(tl.endDateISO) })}</div>
                          </div>
                        </div>

                        <div className="progress-track" style={{ marginBottom: 34 }}>
                          <div
                            className="progress-fill"
                            style={{ width: `${currentProject.progress}%` }}
                          ></div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Development Stages */}
                  {currentProject.stages && currentProject.stages.length > 0 && (
                    <div className="section">
                      <div className="section-title">
                        <CheckCircleIcon /> {t("project.stages", "Development Stages")}
                      </div>
                      <div className="stages-row">
                        {currentProject.stages.map((st, i) => (
                          <div key={i} className={`stage-item ${st.status}`}>
                            <div className="stage-dot">
                              {st.status === "done" ? <CheckIcon /> : null}
                            </div>
                            <div className="stage-name">{st.name}</div>
                            <div className="stage-line"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financials */}
                  <div className="section">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div className="section-title" style={{ margin: 0 }}>
                        <WalletIcon /> {t("project.financials", "Financials")}
                      </div>
                      <a
                        href={`/projects/${currentProject.id}/statement`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "12px", padding: "6px 12px" }}
                        title={t("project.exportPdf", "Export Statement PDF")}
                      >
                        <FileTextIcon />
                        <span>{t("project.exportPdf", "Export Statement PDF")}</span>
                      </a>
                    </div>
                    <div className="finance-stats">
                      <div className="finance-stat">
                        <div className="label">{t("project.totalAgreed", "Total Agreed")}</div>
                        <div className="amount">{formatMoney(currentProject.budget || 0)}</div>
                      </div>
                      <div className="finance-stat paid">
                        <div className="label">{t("project.paid", "Paid")}</div>
                        <div className="amount">{formatMoney(currentProject.paid || 0)}</div>
                      </div>
                      <div className="finance-stat remaining">
                        <div className="label">{t("project.remaining", "Remaining")}</div>
                        <div className="amount">
                          {formatMoney((currentProject.budget || 0) - (currentProject.paid || 0))}
                        </div>
                      </div>
                    </div>

                    {currentProject.payments && currentProject.payments.length > 0 && (
                      <div className="payment-list">
                        {currentProject.payments.map((ph, idx) => (
                          <div key={idx} className="payment-row">
                            <div className="payment-icon">
                              <CheckCircleIcon />
                            </div>
                            <div className="payment-info">
                              <div className="payment-note">{ph.note}</div>
                              <div className="payment-meta">
                                {formatDate(ph.date)} · {ph.method}
                              </div>
                            </div>
                            <div className="payment-amount">{formatMoney(ph.amount)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Agreed Quotation */}
                  {currentProject.quotationItems && (
                    <div className="section">
                      <div className="section-title">
                        <FileTextIcon /> {t("project.quotation", "Agreed Quotation")}
                      </div>
                      {(() => {
                        let parsedItems: QuotationItem[] = [];
                        try {
                          parsedItems = JSON.parse(currentProject.quotationItems);
                        } catch {
                          parsedItems = [];
                        }
                        return (
                          <div className="quote-list">
                            {parsedItems.map((q, idx) => (
                              <div key={idx} className="quote-row">
                                <span>{q.item}</span>
                                <span>{formatMoney(q.amount)}</span>
                              </div>
                            ))}
                            <div className="quote-row total">
                              <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
                              <span>{formatMoney(currentProject.budget || 0)}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Design & Latest Version Card */}
                  <div className="section">
                    <div className="section-title">
                      <PlayIcon /> Design &amp; Latest Version
                    </div>
                    <div className="preview-card">
                      <div className="preview-info">
                        <h4>{currentProject.versionLabel || "v0.9 Beta"}</h4>
                        <p>{currentProject.versionNote || "Interactive preview available"}</p>
                      </div>
                      <div className="preview-actions">
                        <div className="preview-visual">
                          {React.createElement(TYPE_META[currentProject.type]?.icon || GlobeIcon)}
                        </div>
                        <button
                          className="btn btn-ghost"
                          onClick={() => {
                            setPreviewProjectId(currentProject.id);
                            setIsPreviewOpen(true);
                          }}
                        >
                          <ExternalLinkIcon />
                          <span>
                            {currentProject.status === "completed"
                              ? "View Final Version"
                              : "Try Latest Version"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Fast Fixing A Problem Section */}
                  <div className="section" id="fast-fixing-section">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                      <div className="section-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <ZapIcon style={{ color: "#EAB308" }} />
                        <span>{t("fastFix.reportedIssues", "Fast Fixing & Bug Reports")}</span>
                        {currentProject.fastFixIssues && currentProject.fastFixIssues.length > 0 && (
                          <span style={{ fontSize: "12px", background: "rgba(234, 179, 8, 0.2)", color: "#CA8A04", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                            {currentProject.fastFixIssues.length}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleOpenFastFix(currentProject.id)}
                        className="btn btn-sm"
                        style={{
                          background: "linear-gradient(135deg, #CA8A04 0%, #EAB308 100%)",
                          color: "#1F2A24",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          boxShadow: "0 2px 8px rgba(234, 179, 8, 0.25)"
                        }}
                      >
                        <ZapIcon />
                        <span>{t("fastFix.btn", "Fast Fixing A Problem")}</span>
                      </button>
                    </div>

                    {currentProject.fastFixIssues && currentProject.fastFixIssues.length > 0 ? (
                      <div className="space-y-3">
                        {currentProject.fastFixIssues.map((issue) => {
                          const statusCls = issue.status === "fixed" ? "fixed" : issue.status === "on_it" ? "on_it" : "pending";
                          const statusText = issue.status === "fixed" ? t("fastFix.status.fixed", "Fixed & Resolved") : issue.status === "on_it" ? t("fastFix.status.on_it", "On It (Working on fix)") : t("fastFix.status.pending", "Pending Review");

                          // Duration text
                          let durationText = "";
                          if (issue.status === "fixed") {
                            durationText = t("fastFix.durationSolved", { time: formatDuration(issue.durationMinutes || 30) });
                          } else if (issue.status === "on_it") {
                            const elapsed = Math.max(1, Math.round((Date.now() - new Date(issue.startedAt || issue.createdAt).getTime()) / 60000));
                            durationText = t("fastFix.durationOngoing", { time: formatDuration(elapsed) });
                          } else {
                            durationText = t("fastFix.durationPending", "Queued for engineer");
                          }

                          return (
                            <div key={issue.id} className="issue-card">
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
                                    <span>{issue.title}</span>
                                    <span className={`fastfix-chip ${statusCls}`}>{statusText}</span>
                                  </div>
                                  <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: 2 }}>
                                    {formatDate(issue.createdAt)}
                                  </div>
                                </div>
                                <div className={`duration-tag ${statusCls}`}>
                                  <ClockIcon />
                                  <span>{durationText}</span>
                                </div>
                              </div>

                              <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.5, margin: "8px 0" }}>
                                {issue.description}
                              </p>

                              {issue.photoUrl && (
                                <div style={{ marginTop: 10 }}>
                                  <button
                                    type="button"
                                    onClick={() => setViewingPhotoModal(issue.photoUrl || null)}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 8,
                                      padding: "6px 10px",
                                      background: "var(--bg-app)",
                                      border: "1px solid var(--border)",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <img
                                      src={issue.photoUrl}
                                      alt="Issue capture"
                                      style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }}
                                    />
                                    <div style={{ textAlign: isRTL ? "right" : "left" }}>
                                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-1)" }}>
                                        {t("fastFix.viewPhoto", "View Screenshot")}
                                      </div>
                                      <div style={{ fontSize: "11px", color: "var(--text-3)" }}>
                                        {lang === "ar" ? "اضغط للتكبير" : "Click to enlarge"}
                                      </div>
                                    </div>
                                  </button>
                                </div>
                              )}

                              {issue.adminNotes && (
                                <div style={{
                                  marginTop: 10,
                                  padding: "8px 12px",
                                  background: "rgba(34, 197, 94, 0.08)",
                                  borderLeft: isRTL ? "none" : "3px solid #22c55e",
                                  borderRight: isRTL ? "3px solid #22c55e" : "none",
                                  borderRadius: "4px",
                                  fontSize: "13px",
                                  color: "#166534"
                                }}>
                                  <strong>{t("fastFix.adminNotes", "Team Resolution Notes")}:</strong> {issue.adminNotes}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="card" style={{ padding: "20px", textAlign: "center", color: "var(--text-3)", fontSize: "14px" }}>
                        <p>{t("fastFix.noIssues", "No issues reported for this project. Everything is running smoothly!")}</p>
                      </div>
                    )}
                  </div>

                  {/* Project Evolution & Development Requests Section */}
                  <div className="section" id="project-evolution-section">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                      <div className="section-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <GitMergeIcon style={{ color: "#3B82F6" }} />
                        <span>{t("ext.title", "Project Development & Evolution")}</span>
                        {currentProject.extensions && currentProject.extensions.length > 0 && (
                          <span style={{ fontSize: "12px", background: "rgba(59, 130, 246, 0.2)", color: "#1D4ED8", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                            {currentProject.extensions.length}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleOpenExtModal(currentProject.id)}
                        className="btn btn-sm btn-primary"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "12px", padding: "6px 14px" }}
                      >
                        <PlusIcon />
                        <span>{t("ext.requestBtn", "Request New Development / Phase 2")}</span>
                      </button>
                    </div>

                    {/* Banner if project is completed and fully paid */}
                    {((currentProject.status === "completed" || currentProject.progress === 100) && ((currentProject.paid || 0) >= (currentProject.budget || 0))) && (
                      <div style={{
                        background: "linear-gradient(135deg, rgba(62,124,82,0.15) 0%, rgba(31,42,36,0.25) 100%)",
                        border: "1px solid rgba(62,124,82,0.4)",
                        borderRadius: "12px",
                        padding: "16px 20px",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
                            <span>🎉</span>
                            <span>{t("ext.completedBanner", "Project Completed & Fully Paid — Ready for New Evolution Phase!")}</span>
                          </div>
                          <div style={{ fontSize: "13px", color: "var(--text-2)", marginTop: 4 }}>
                            {t("ext.completedBannerSub", "You can request new features, enhancements, or second-stage development inside this same project.")}
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenExtModal(currentProject.id)}
                          className="btn btn-primary btn-sm"
                        >
                          {t("ext.requestBtn", "Request New Development")}
                        </button>
                      </div>
                    )}

                    {currentProject.extensions && currentProject.extensions.length > 0 ? (
                      <div>
                        {currentProject.extensions.map((ext) => {
                          const isMerged = ext.status === "merged";
                          const isCompleted = ext.status === "completed" || ext.progress === 100;
                          return (
                            <div key={ext.id} className={`ext-evolution-card ${isMerged ? "merged" : ""}`}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
                                    <span>{ext.title}</span>
                                    {isMerged ? (
                                      <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(34,197,94,0.15)", color: "#16a34a", padding: "3px 10px", borderRadius: 999 }}>
                                        {t("ext.mergedBadge", "Merged into Base Project")}
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: "11px", fontWeight: 700, background: "rgba(59,130,246,0.15)", color: "#2563eb", padding: "3px 10px", borderRadius: 999 }}>
                                        {ext.status === "completed" ? t("status.completed", "Completed") : t("status.in_progress", "In Progress")}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: 2 }}>
                                    {formatDate(ext.createdAt)} · {ext.versionTarget || "v2.0"}
                                  </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  {!isMerged && (isCompleted || isAdminOrManager) && (
                                    <button
                                      type="button"
                                      disabled={isMergingExtId === ext.id}
                                      onClick={() => handleMergeExtension(currentProject.id, ext.id)}
                                      className="btn btn-sm"
                                      style={{
                                        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                                        color: "#fff",
                                        fontWeight: 700,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "6px 14px",
                                        borderRadius: "8px",
                                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                                      }}
                                      title="دمج مرحلة التطوير في المشروع الأساسي"
                                    >
                                      <GitMergeIcon />
                                      <span>{isMergingExtId === ext.id ? "Merging..." : t("ext.mergeBtn", "Merge into Base Project")}</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.5, margin: "8px 0" }}>
                                {ext.description}
                              </p>

                              {/* Progress bar ("كام في الميه") */}
                              <div style={{ marginTop: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, color: "var(--text-2)", marginBottom: 4 }}>
                                  <span>{t("ext.progress", "Extension Progress")}</span>
                                  <span>{ext.progress}%</span>
                                </div>
                                <div className="progress-track" style={{ height: 8, margin: 0 }}>
                                  <div className="progress-fill" style={{ width: `${ext.progress}%`, background: isMerged ? "linear-gradient(90deg, #10b981, #059669)" : undefined }}></div>
                                </div>
                              </div>

                              {/* Financial details */}
                              <div style={{ display: "flex", gap: 20, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", flexWrap: "wrap", fontSize: "13px" }}>
                                <div>
                                  <span style={{ color: "var(--text-3)" }}>{t("ext.budget", "Budget")}: </span>
                                  <strong style={{ color: "var(--text-1)" }}>{formatMoney(ext.budget)}</strong>
                                </div>
                                <div>
                                  <span style={{ color: "var(--text-3)" }}>{t("ext.paid", "Paid")}: </span>
                                  <strong style={{ color: "#16a34a" }}>{formatMoney(ext.paid)}</strong>
                                </div>
                                <div>
                                  <span style={{ color: "var(--text-3)" }}>{t("project.remaining", "Remaining")}: </span>
                                  <strong style={{ color: "#ca8a04" }}>{formatMoney(Math.max(0, ext.budget - ext.paid))}</strong>
                                </div>
                                {isMerged && ext.mergedAt && (
                                  <div style={{ marginLeft: isRTL ? 0 : "auto", marginRight: isRTL ? "auto" : 0, color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                                    <CheckCircleIcon />
                                    <span>{t("ext.mergedDate", { date: formatDate(ext.mergedAt) })}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="card" style={{ padding: "20px", textAlign: "center", color: "var(--text-3)", fontSize: "14px" }}>
                        <p>{t("ext.noExtensions", "No development extensions requested yet.")}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Notes Section */}
              <div className="section">
                <div className="section-title">
                  <MessageIcon /> Notes
                </div>
                <div className="card" style={{ padding: 18 }}>
                  <div className="notes-list" ref={notesListRef}>
                    {currentProject.notes && currentProject.notes.length > 0 ? (
                      currentProject.notes.map((n, idx) => {
                        const isClient = n.author === "client";
                        return (
                          <div key={idx} className={`note-item ${n.author}`}>
                            <div
                              className="chat-avatar"
                              style={{
                                background: isClient ? "var(--moemen-green)" : "var(--deep-forest)",
                                color: isClient ? "#fff" : "var(--light-sage)",
                              }}
                            >
                              {isClient ? userInitials : "MT"}
                            </div>
                            <div>
                              <div className="note-bubble">{n.text}</div>
                              <div className="note-meta">
                                {isClient ? "You" : "Moemen Team"} · {fmtDate(n.date || n.createdAt)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p
                        style={{
                          color: "var(--text-3)",
                          fontSize: ".87rem",
                          textAlign: "center",
                          padding: "20px 0",
                        }}
                      >
                        No notes yet — add the first one below.
                      </p>
                    )}
                  </div>

                  <div className="notes-input-row" style={{ marginTop: 14 }}>
                    <input
                      type="text"
                      id="note-input"
                      placeholder="Add a note for the Moemen Team…"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNote(currentProject.id);
                        }
                      }}
                      autoComplete="off"
                    />
                    <button
                      className="send-btn"
                      onClick={() => handleAddNote(currentProject.id)}
                      disabled={isSubmittingNote || !noteInput.trim()}
                      aria-label="Send note"
                    >
                      <SendIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>

      {/* ==================== NEW PROJECT MODAL ==================== */}
      <div
        id="new-project-modal"
        className={`modal-backdrop ${isNewProjectOpen ? "open" : ""}`}
        hidden={!isNewProjectOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsNewProjectOpen(false);
        }}
      >
        <div className="modal">
          {newProjectStep === 1 ? (
            <div>
              <div className="modal-header">
                <h3>{lang === "ar" ? "ما نوع المشروع الذي ترغب في بنائه؟" : "What would you like to build?"}</h3>
                <button
                  className="icon-btn modal-close"
                  onClick={() => setIsNewProjectOpen(false)}
                  aria-label="Close"
                >
                  <XIcon />
                </button>
              </div>
              <p className="modal-sub">
                {lang === "ar"
                  ? "اختر تصنيف المشروع وسيقوم فريقنا الهندسي بدراسة الفكرة وتقديم خطة زمنية وعرض سعر مخصص."
                  : "Pick a category to start your project request. Our engineering team will follow up to scope timeline and pricing."}
              </p>
              <div className="type-options-grid">
                {PROJECT_TYPES.map((pt) => {
                  const Icon = pt.icon;
                  return (
                    <button
                      key={pt.key}
                      className="type-option"
                      onClick={() => {
                        setSelectedNewType(pt.key as any);
                        setNewProjectStep(2);
                      }}
                    >
                      <span className="icon-circle">
                        <Icon />
                      </span>
                      <span className="type-option-label">{t(`type.${pt.key}`, pt.label)}</span>
                      <span className="type-option-desc">{t(`type.${pt.key}.desc`, pt.desc)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="modal-header">
                <h3>
                  {React.createElement(TYPE_META[selectedNewType]?.icon || GlobeIcon)}
                  {t(`type.${selectedNewType}`, TYPE_META[selectedNewType]?.label || selectedNewType)}
                </h3>
                <button
                  className="icon-btn modal-close"
                  onClick={() => setIsNewProjectOpen(false)}
                  aria-label="Close"
                >
                  <XIcon />
                </button>
              </div>
              <p className="modal-sub">
                {lang === "ar"
                  ? "اكتب تفاصيل المشروع والمتطلبات الأساسية ليباشر مهندسونا دراسة المشروع فوراً."
                  : "Tell us about your requirements, and our team will follow up with complete specs and pricing."}
              </p>
              <form onSubmit={handleCreateProject}>
                <div className="field">
                  <label htmlFor="np-name">{lang === "ar" ? "اسم المشروع *" : "Project name *"}</label>
                  <input
                    id="np-name"
                    required
                    placeholder={lang === "ar" ? `مثال: متجر أو تطبيق لشركتي` : `e.g. ${TYPE_META[selectedNewType]?.label} for my business`}
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="np-desc">{lang === "ar" ? "وصف وتفاصيل متطلبات المشروع *" : "Project Scope & Description *"}</label>
                  <textarea
                    id="np-desc"
                    rows={3}
                    required
                    placeholder={lang === "ar" ? "ما هي فكرة المشروع؟ ما هي أهم الوظائف التي يجب أن يقوم بها؟ ومن هم المستخدمون؟" : "What is the core problem? What are the key features and target audience?"}
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                  ></textarea>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className="field">
                    <label htmlFor="np-budget">{lang === "ar" ? "الميزانية التقديرية (EGP)" : "Estimated Budget (EGP)"}</label>
                    <input
                      id="np-budget"
                      type="number"
                      placeholder={lang === "ar" ? "مثال: 45000" : "e.g. 45000"}
                      value={newProjectBudget}
                      onChange={(e) => setNewProjectBudget(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="np-days">{lang === "ar" ? "المدة المطلوبة (أيام)" : "Target Days"}</label>
                    <input
                      id="np-days"
                      type="number"
                      placeholder="30"
                      value={newProjectDays}
                      onChange={(e) => setNewProjectDays(e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="np-reqs">{lang === "ar" ? "مميزات أو ملاحظات خاصة (اختياري)" : "Special Requirements / Notes"}</label>
                  <input
                    id="np-reqs"
                    type="text"
                    placeholder={lang === "ar" ? "مثل: بوابات دفع، تكامل واتساب، دعم لغتين..." : "e.g. Payment gateway, WhatsApp integration, Bilingual..."}
                    value={newProjectRequirements}
                    onChange={(e) => setNewProjectRequirements(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button
                    type="button"
                    className="btn btn-ghost-light"
                    onClick={() => setNewProjectStep(1)}
                  >
                    <ArrowLeftIcon />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={isSubmittingProject}
                  >
                    {isSubmittingProject ? "Submitting..." : "Submit request"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ==================== PREVIEW MODAL ==================== */}
      <div
        id="preview-modal"
        className={`modal-backdrop ${isPreviewOpen ? "open" : ""}`}
        hidden={!isPreviewOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsPreviewOpen(false);
        }}
      >
        <div className="modal modal-lg">
          {(() => {
            const previewP = projects.find((p) => p.id === previewProjectId) || currentProject;
            const isPhone = previewP?.type === "mobile";
            return (
              <>
                <div className="modal-header">
                  <h3>{previewP?.name}</h3>
                  <button
                    className="icon-btn modal-close"
                    onClick={() => setIsPreviewOpen(false)}
                    aria-label="Close"
                  >
                    <XIcon />
                  </button>
                </div>
                <p className="modal-sub">
                  {previewP?.versionLabel || "v0.9 Beta"} · {previewP?.versionNote || "Interactive preview"}
                </p>
                <div className={`device-frame ${isPhone ? "device-phone" : "device-panel"}`}>
                  <div className="device-screen">
                    <div className="mock-topbar"></div>
                    <div className="mock-row">
                      <div className="mock-block" style={{ width: "38%" }}></div>
                      <div className="mock-block" style={{ width: "58%" }}></div>
                    </div>
                    <div className="mock-chart"></div>
                    <div className="mock-row">
                      <div className="mock-block" style={{ width: "100%", height: 14 }}></div>
                    </div>
                    <div className="mock-row">
                      <div className="mock-block" style={{ width: "78%", height: 14 }}></div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                  <button className="btn btn-primary" onClick={() => setIsPreviewOpen(false)}>
                    Done
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* ==================== CONTACT MODAL ==================== */}
      <div
        id="contact-modal"
        className={`modal-backdrop ${isContactOpen ? "open" : ""}`}
        hidden={!isContactOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsContactOpen(false);
        }}
      >
        <div className="modal">
          <div className="modal-header">
            <h3>
              <MessageIcon /> Talk to Moemen Team
            </h3>
            <button
              className="icon-btn modal-close"
              onClick={() => setIsContactOpen(false)}
              aria-label="Close"
            >
              <XIcon />
            </button>
          </div>
          <p className="modal-sub">We usually reply within one business day.</p>
          <div className="contact-list">
            <a className="contact-row" href="mailto:info@moemen-team.tech">
              <span className="icon-circle">
                <MailIcon />
              </span>
              <span className="contact-row-text">
                <span className="label">Email</span>
                <br />
                <span className="value">info@moemen-team.tech</span>
              </span>
            </a>
            <a
              className="contact-row"
              href="https://moemen-team.tech"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="icon-circle">
                <GlobeIcon />
              </span>
              <span className="contact-row-text">
                <span className="label">Website</span>
                <br />
                <span className="value">moemen-team.tech</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* ==================== FAST FIXING MODAL ==================== */}
      <div
        id="fast-fixing-modal"
        className={`modal-backdrop ${isFastFixOpen ? "open" : ""}`}
        hidden={!isFastFixOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsFastFixOpen(false);
        }}
      >
        <div className="modal modal-md">
          <div className="modal-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ZapIcon style={{ color: "#EAB308" }} />
              <span>{t("fastFix.title", "Fast Fixing A Problem")}</span>
            </h3>
            <button
              className="icon-btn modal-close"
              onClick={() => setIsFastFixOpen(false)}
              aria-label="Close"
            >
              <XIcon />
            </button>
          </div>
          <p className="modal-sub">
            {t("fastFix.subtitle", "Snap a photo of any issue, write an explanation, and our engineering team will solve it ASAP.")}
          </p>

          <form onSubmit={handleSubmitFastFix} className="space-y-4">
            {/* Project Selector */}
            <div className="field">
              <label htmlFor="ff-project" style={{ fontWeight: 600 }}>{t("fastFix.selectProject", "Select Project")} *</label>
              <select
                id="ff-project"
                required
                value={fastFixProjectId}
                onChange={(e) => setFastFixProjectId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-app)" }}
              >
                <option value="">-- {t("fastFix.selectProject", "Select Project")} --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({TYPE_META[p.type]?.label || p.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Problem Title */}
            <div className="field">
              <label htmlFor="ff-title" style={{ fontWeight: 600 }}>{t("fastFix.issueTitle", "Issue Title / Summary")}</label>
              <input
                id="ff-title"
                type="text"
                placeholder={t("fastFix.issueTitlePlaceholder", "e.g. Button unresponsive or layout issue on mobile")}
                value={fastFixTitle}
                onChange={(e) => setFastFixTitle(e.target.value)}
              />
            </div>

            {/* Explaining Text */}
            <div className="field">
              <label htmlFor="ff-desc" style={{ fontWeight: 600 }}>{t("fastFix.explainingText", "Explaining Text / Details")} *</label>
              <textarea
                id="ff-desc"
                rows={4}
                required
                placeholder={t("fastFix.explainingPlaceholder", "Describe what happened, what you observed, or steps to reproduce…")}
                value={fastFixDesc}
                onChange={(e) => setFastFixDesc(e.target.value)}
              ></textarea>
            </div>

            {/* Photo / Screenshot Capture & Upload */}
            <div className="field">
              <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                {t("fastFix.photoLabel", "Take Photo or Upload Screenshot")}
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={photoInputRef}
                style={{ display: "none" }}
                onChange={handlePhotoCapture}
              />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="btn btn-sm"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    background: "rgba(31,42,36,0.06)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontWeight: 600
                  }}
                >
                  <CameraIcon />
                  <span>{t("fastFix.takePhoto", "Take Photo")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="btn btn-sm"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    background: "rgba(31,42,36,0.06)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontWeight: 600
                  }}
                >
                  <UploadIcon />
                  <span>{t("fastFix.uploadPhoto", "Upload Screenshot")}</span>
                </button>
              </div>

              {/* Photo Preview */}
              {fastFixPhoto && (
                <div style={{ marginTop: 12, position: "relative", display: "inline-block" }}>
                  <img
                    src={fastFixPhoto}
                    alt="Problem preview"
                    style={{
                      maxHeight: "180px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      objectFit: "contain",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFastFixPhoto(null)}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      background: "rgba(0,0,0,0.65)",
                      color: "#fff",
                      borderRadius: "999px",
                      padding: "4px 8px",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    {t("fastFix.removePhoto", "Remove")}
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-ghost-light"
                onClick={() => setIsFastFixOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingFastFix}
                className="btn btn-primary"
                style={{
                  background: "linear-gradient(135deg, #CA8A04 0%, #EAB308 100%)",
                  color: "#1F2A24",
                  fontWeight: 700,
                  border: "none",
                }}
              >
                {isSubmittingFastFix ? t("fastFix.submitting", "Submitting...") : t("fastFix.submit", "Submit Fast Fixing Request")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ==================== PROJECT EXTENSION / EVOLUTION MODAL ==================== */}
      <div
        id="project-extension-modal"
        className={`modal-backdrop ${isExtModalOpen ? "open" : ""}`}
        hidden={!isExtModalOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsExtModalOpen(false);
        }}
      >
        <div className="modal modal-md">
          <div className="modal-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GitMergeIcon style={{ color: "#3B82F6" }} />
              <span>{t("ext.modalTitle", "Request New Development Phase")}</span>
            </h3>
            <button
              className="icon-btn modal-close"
              onClick={() => setIsExtModalOpen(false)}
              aria-label="Close"
            >
              <XIcon />
            </button>
          </div>
          <p className="modal-sub">
            {t("ext.completedBannerSub", "You can request new features, enhancements, or second-stage development inside this same project.")}
          </p>

          <form onSubmit={handleSubmitExtension} className="space-y-4">
            <div className="field">
              <label htmlFor="ext-title" style={{ fontWeight: 600 }}>{t("ext.extTitle", "Development Title / Feature Set")} *</label>
              <input
                id="ext-title"
                required
                type="text"
                placeholder={t("ext.extTitlePlaceholder", "e.g. Add Multi-Vendor Marketplace & Stripe Connect")}
                value={extTitle}
                onChange={(e) => setExtTitle(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="ext-desc" style={{ fontWeight: 600 }}>{t("ext.extDesc", "Scope & Requirements Description")} *</label>
              <textarea
                id="ext-desc"
                rows={4}
                required
                placeholder={t("ext.extDescPlaceholder", "Detail the new modifications, user flows, and features needed…")}
                value={extDesc}
                onChange={(e) => setExtDesc(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="field">
                <label htmlFor="ext-budget" style={{ fontWeight: 600 }}>{t("ext.extBudget", "Proposed Budget (EGP)")}</label>
                <input
                  id="ext-budget"
                  type="number"
                  placeholder="e.g. 25000"
                  value={extBudget}
                  onChange={(e) => setExtBudget(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="ext-days" style={{ fontWeight: 600 }}>{t("ext.extTargetDays", "Desired Timeline (Days)")}</label>
                <input
                  id="ext-days"
                  type="number"
                  placeholder="15"
                  value={extDays}
                  onChange={(e) => setExtDays(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="ext-version" style={{ fontWeight: 600 }}>{t("ext.versionTarget", "Target Version Label")}</label>
              <input
                id="ext-version"
                type="text"
                placeholder="v2.0"
                value={extVersionTarget}
                onChange={(e) => setExtVersionTarget(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-ghost-light"
                onClick={() => setIsExtModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingExt}
                className="btn btn-primary"
              >
                {isSubmittingExt ? "Submitting..." : t("ext.submit", "Submit Development Request")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ==================== PHOTO LIGHTBOX MODAL ==================== */}
      {viewingPhotoModal && (
        <div
          id="photo-lightbox-modal"
          className="modal-backdrop open"
          onClick={() => setViewingPhotoModal(null)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="modal"
            style={{ maxWidth: "800px", padding: 12, background: "rgba(0,0,0,0.9)", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button
                type="button"
                className="icon-btn"
                style={{ color: "#fff" }}
                onClick={() => setViewingPhotoModal(null)}
              >
                <XIcon />
              </button>
            </div>
            <img
              src={viewingPhotoModal}
              alt="Enlarged issue screenshot"
              style={{ maxHeight: "75vh", maxWidth: "100%", margin: "0 auto", objectFit: "contain", borderRadius: "8px" }}
            />
          </div>
        </div>
      )}

      {/* ==================== TOAST CONTAINER ==================== */}
      <div id="toast-container" className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast show">
            {t.iconName === "sparkle" ? <SparkleIcon /> : <CheckIcon />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
