"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Globe,
  Smartphone,
  Zap,
  Monitor,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  Check,
  Eye,
  Layers,
  ArrowRight,
  LogOut,
  Sliders,
  Copy,
  FileText,
  Key,
  Inbox,
  GitMerge,
  Camera,
} from "lucide-react";
import { useLanguage, LanguageToggle } from "@/lib/i18n";
import { Footer } from "@/components/ui/Footer";
import { AdminDeliveryModal } from "./AdminDeliveryModal";

// Types
interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
  userId?: string | null;
  user?: { id: string; email: string; role: string } | null;
  _count?: { projects: number };
  projects?: {
    id: string;
    name: string;
    budget?: number | null;
    paid?: number;
    status: string;
    progress: number;
  }[];
}

interface Stage {
  id?: string;
  name: string;
  status: "done" | "current" | "pending";
  order: number;
  projectId?: string;
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  note?: string | null;
  date?: string | null;
  createdAt: string;
  projectId?: string | null;
  project?: {
    id: string;
    name: string;
    client?: {
      id: string;
      name: string;
      company?: string | null;
    } | null;
  } | null;
}

interface Note {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  projectId: string;
  userId?: string | null;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
    client?: {
      name: string;
    } | null;
  } | null;
}

interface Project {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  status: string;
  progress: number;
  budget?: number | null;
  paid: number;
  contractDate?: string | null;
  contractStatus?: string | null;
  requestDate?: string | null;
  duration?: string | null;
  totalDays?: number | null;
  versionLabel?: string | null;
  versionNote?: string | null;
  clientId: string;
  client?: Client;
  stages?: Stage[];
  payments?: Payment[];
  notes?: Note[];
  fastFixIssues?: any[];
  extensions?: any[];
  delivery?: any | null;
  createdAt: string;
}

interface AdminSummary {
  metrics: {
    totalClients: number;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    requestedProjects: number;
    inReviewProjects: number;
    inProgressProjects: number;
    totalBudget: number;
    totalPaid: number;
    totalRemaining: number;
    averageProgress: number;
  };
  recentProjects: Project[];
  recentPayments: Payment[];
  recentNotes: Note[];
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  website: { label: "موقع ويب (Website)", icon: Globe, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  mobile: { label: "تطبيق موبايل (Mobile)", icon: Smartphone, color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  automation: { label: "أتمتة (Automation)", icon: Zap, color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  desktop: { label: "نظام ديسكتوب (Desktop)", icon: Monitor, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  email_service: { label: "خدمة بريد إلكتروني (Email Service)", icon: Mail, color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  erp: { label: "نظام ERP", icon: Layers, color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
};

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; dotCls: string }> = {
  requested: { label: "طلب جديد (Requested)", badgeCls: "bg-amber-500/10 text-amber-300 border-amber-500/30", dotCls: "bg-amber-400" },
  in_review: { label: "قيد المراجعة (In Review)", badgeCls: "bg-blue-500/10 text-blue-300 border-blue-500/30", dotCls: "bg-blue-400" },
  in_progress: { label: "قيد التنفيذ (In Progress)", badgeCls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", dotCls: "bg-emerald-400" },
  completed: { label: "مكتمل (Completed)", badgeCls: "bg-teal-500/10 text-teal-300 border-teal-500/30", dotCls: "bg-teal-400" },
};

export function AdminDashboard() {
  const { data: session } = useSession();
  const { lang, t, formatMoney, formatDuration, formatDate, isRTL } = useLanguage();
  const fmtCurrency = formatMoney;
  const fmtDateStr = formatDate;
  const userRole = (session?.user as any)?.role;
  const userName = session?.user?.name || (lang === "ar" ? "المسؤول" : "Admin");

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "projects" | "fast_fixing" | "payments" | "notes">("overview");

  // Fast Fixing State in Admin
  const [fastFixIssues, setFastFixIssues] = useState<any[]>([]);
  const [fastFixStatusFilter, setFastFixStatusFilter] = useState<string>("ALL");
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);
  const [adminNoteModal, setAdminNoteModal] = useState<{ id: string; notes: string } | null>(null);

  // Project Extensions State in Admin
  const [managingProjectExtensions, setManagingProjectExtensions] = useState<Project | null>(null);
  const [extensionList, setExtensionList] = useState<any[]>([]);
  const [loadingExtensions, setLoadingExtensions] = useState(false);
  const [isMergingExtId, setIsMergingExtId] = useState<string | null>(null);
  const [editingExtensionProgress, setEditingExtensionProgress] = useState<{ id: string; progress: number } | null>(null);

  // Project Delivery State in Admin
  const [managingDeliveryProject, setManagingDeliveryProject] = useState<Project | null>(null);
  const [deliveryDataForModal, setDeliveryDataForModal] = useState<any | null>(null);

  // Main data states
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter states
  const [clientSearch, setClientSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("ALL");
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>("ALL");
  const [projectClientFilter, setProjectClientFilter] = useState<string>("ALL");
  const [paymentSearch, setPaymentSearch] = useState("");

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetProjectId, setPaymentTargetProjectId] = useState<string>("");

  const [isStagesModalOpen, setIsStagesModalOpen] = useState(false);
  const [targetProjectForStages, setTargetProjectForStages] = useState<Project | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [targetProjectForNote, setTargetProjectForNote] = useState<Project | null>(null);

  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "client" | "project" | "payment" | "note";
    id: string;
    projectId?: string;
    name: string;
  } | null>(null);

  // Forms state
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: ""
  });

  const [projectForm, setProjectForm] = useState({
    name: "",
    clientId: "",
    type: "website",
    status: "requested",
    budget: "",
    paid: "",
    progress: 0,
    contractDate: new Date().toISOString().slice(0, 10),
    totalDays: 30,
    versionLabel: "v0.1 Beta",
    versionNote: "",
    description: ""
  });

  const [paymentForm, setPaymentForm] = useState({
    projectId: "",
    amount: "",
    method: "Bank Transfer",
    date: new Date().toISOString().slice(0, 10),
    note: ""
  });

  const [noteForm, setNoteForm] = useState({
    projectId: "",
    text: "",
    author: "team"
  });

  // Account creation state for clients
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [newAccountCreatedInfo, setNewAccountCreatedInfo] = useState<{
    clientName: string;
    email: string;
    password?: string;
  } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = "toast_" + Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Data Fetching
  const loadAllData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [sumRes, clRes, prRes, payRes, ffRes] = await Promise.all([
        fetch("/api/admin/summary"),
        fetch("/api/clients"),
        fetch("/api/projects"),
        fetch("/api/payments"),
        fetch("/api/fast-fixing"),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (clRes.ok) setClients(await clRes.json());
      if (prRes.ok) setProjects(await prRes.json());
      if (payRes.ok) setPayments(await payRes.json());
      if (ffRes.ok) setFastFixIssues(await ffRes.json());
    } catch (err) {
      console.error("Error loading admin data:", err);
      showToast("تعذر تحميل بعض البيانات، يرجى المحاولة مرة أخرى", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // -------------------------------------------------------------
  // FAST FIXING HANDLERS
  // -------------------------------------------------------------
  const loadFastFixIssues = async () => {
    try {
      const res = await fetch("/api/fast-fixing");
      if (res.ok) setFastFixIssues(await res.json());
    } catch (e) {
      console.error("Failed to load fast-fix issues:", e);
    }
  };

  const updateIssueStatus = async (issueId: string, newStatus: "on_it" | "fixed") => {
    try {
      const res = await fetch(`/api/fast-fixing/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(
          newStatus === "fixed"
            ? (lang === "ar" ? "تم تأكيد إصلاح العطل وحساب المدة المستغرقة بنجاح!" : "Issue marked as Fixed & duration recorded!")
            : (lang === "ar" ? "تم بدء العمل على العطل (On It)" : "Issue set to On It — timer started!"),
          "success"
        );
        await loadFastFixIssues();
        await loadAllData(false);
      }
    } catch {
      showToast("فشل تحديث حالة العطل", "error");
    }
  };

  const saveIssueAdminNotes = async () => {
    if (!adminNoteModal) return;
    try {
      const res = await fetch(`/api/fast-fixing/${adminNoteModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: adminNoteModal.notes }),
      });
      if (res.ok) {
        showToast(lang === "ar" ? "تم حفظ ملاحظات حل العطل بنجاح" : "Resolution notes saved successfully", "success");
        setAdminNoteModal(null);
        await loadFastFixIssues();
      }
    } catch {
      showToast("فشل حفظ الملاحظات", "error");
    }
  };

  // -------------------------------------------------------------
  // PROJECT EXTENSION & EVOLUTION HANDLERS
  // -------------------------------------------------------------
  const openProjectExtensions = async (proj: Project) => {
    setManagingProjectExtensions(proj);
    setLoadingExtensions(true);
    try {
      const res = await fetch(`/api/projects/${proj.id}/extensions`);
      if (res.ok) {
        const data = await res.json();
        setExtensionList(data);
      }
    } catch (e) {
      console.error("Error loading extensions:", e);
    } finally {
      setLoadingExtensions(false);
    }
  };

  const updateExtensionProgress = async (extId: string, progress: number) => {
    if (!managingProjectExtensions) return;
    try {
      const res = await fetch(`/api/projects/${managingProjectExtensions.id}/extensions/${extId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress }),
      });
      if (res.ok) {
        showToast(lang === "ar" ? "تم تحديث نسبة إنجاز مرحلة التطوير" : "Extension progress updated", "success");
        await openProjectExtensions(managingProjectExtensions);
      }
    } catch {
      showToast("فشل تحديث النسبة", "error");
    }
  };

  const handleAdminMergeExtension = async (extId: string) => {
    if (!managingProjectExtensions) return;
    if (
      !confirm(
        lang === "ar"
          ? "هل أنت متأكد من دمج مرحلة التطوير في المشروع الأساسي؟ سيتم إضافة الميزانية والدفعات وتحديث رقم الإصدار وتثبيت المشروع كمكتمل."
          : "Are you sure you want to merge this development extension into the base project? This will update the project budget, payments, and version label."
      )
    )
      return;
    setIsMergingExtId(extId);
    try {
      const res = await fetch(`/api/projects/${managingProjectExtensions.id}/extensions/${extId}/merge`, {
        method: "POST",
      });
      if (res.ok) {
        showToast(
          lang === "ar"
            ? "تم دمج مرحلة التطوير بنجاح في المشروع الأساسي!"
            : "Development extension merged successfully into base project!",
          "success"
        );
        await openProjectExtensions(managingProjectExtensions);
        await loadAllData(false);
      } else {
        showToast("فشل دمج مرحلة التطوير", "error");
      }
    } catch {
      showToast("خطأ أثناء دمج مرحلة التطوير", "error");
    } finally {
      setIsMergingExtId(null);
    }
  };

  const openProjectDeliveryModal = async (proj: Project) => {
    setManagingDeliveryProject(proj);
    try {
      const res = await fetch(`/api/projects/${proj.id}/delivery`);
      if (res.ok) {
        const data = await res.json();
        setDeliveryDataForModal(data);
      } else {
        setDeliveryDataForModal(proj.delivery || null);
      }
    } catch {
      setDeliveryDataForModal(proj.delivery || null);
    }
  };

  // -------------------------------------------------------------
  // CLIENT HANDLERS
  // -------------------------------------------------------------
  const openAddClient = () => {
    setEditingClient(null);
    setCreateAccount(false);
    setAccountPassword(`Client#${Math.floor(1000 + Math.random() * 9000)}`);
    setClientForm({ name: "", email: "", phone: "", company: "", address: "", notes: "" });
    setIsClientModalOpen(true);
  };

  const openEditClient = (c: Client) => {
    setEditingClient(c);
    setCreateAccount(false);
    setClientForm({
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      company: c.company || "",
      address: c.address || "",
      notes: c.notes || ""
    });
    setIsClientModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) {
      showToast("اسم العميل مطلوب", "error");
      return;
    }

    if (!editingClient && createAccount && (!clientForm.email || !accountPassword)) {
      showToast("يرجى إدخال البريد الإلكتروني وكلمة المرور لإنشاء حساب العميل", "error");
      return;
    }

    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients";
      const method = editingClient ? "PUT" : "POST";

      const payload: any = { ...clientForm };
      if (!editingClient && createAccount) {
        payload.createAccount = true;
        payload.password = accountPassword;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resData = await res.json();
        showToast(editingClient ? "تم تحديث بيانات العميل بنجاح" : "تمت إضافة العميل بنجاح", "success");
        setIsClientModalOpen(false);

        if (resData.accountCreated) {
          setNewAccountCreatedInfo({
            clientName: clientForm.name,
            email: clientForm.email,
            password: accountPassword,
          });
        }

        loadAllData(true);
      } else {
        const err = await res.json();
        showToast(err.error || "فشلت العملية", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء حفظ العميل", "error");
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("تم حذف العميل بنجاح", "success");
        setDeleteConfirm(null);
        loadAllData(true);
      } else {
        showToast("فشل حذف العميل", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الحذف", "error");
    }
  };

  // -------------------------------------------------------------
  // PROJECT HANDLERS
  // -------------------------------------------------------------
  const openAddProject = (defaultClientId?: string) => {
    setEditingProject(null);
    setProjectForm({
      name: "",
      clientId: defaultClientId || (clients[0]?.id || ""),
      type: "website",
      status: "requested",
      budget: "",
      paid: "0",
      progress: 0,
      contractDate: new Date().toISOString().slice(0, 10),
      totalDays: 30,
      versionLabel: "v0.1 Beta",
      versionNote: "تم إنشاء المشروع",
      description: ""
    });
    setIsProjectModalOpen(true);
  };

  const openEditProject = (p: Project) => {
    setEditingProject(p);
    setProjectForm({
      name: p.name || "",
      clientId: p.clientId || "",
      type: p.type || "website",
      status: p.status || "requested",
      budget: p.budget?.toString() || "",
      paid: p.paid?.toString() || "0",
      progress: p.progress || 0,
      contractDate: p.contractDate || new Date().toISOString().slice(0, 10),
      totalDays: p.totalDays || 30,
      versionLabel: p.versionLabel || "",
      versionNote: p.versionNote || "",
      description: p.description || ""
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name.trim()) {
      showToast("اسم المشروع مطلوب", "error");
      return;
    }
    if (!projectForm.clientId) {
      showToast("يرجى اختيار العميل أولاً", "error");
      return;
    }

    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects";
      const method = editingProject ? "PUT" : "POST";

      const payload = {
        ...projectForm,
        budget: projectForm.budget ? parseFloat(projectForm.budget) : 0,
        paid: projectForm.paid ? parseFloat(projectForm.paid) : 0,
        progress: parseInt(projectForm.progress as any) || 0,
        totalDays: parseInt(projectForm.totalDays as any) || 30,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(editingProject ? "تم تحديث المشروع بنجاح" : "تم إنشاء المشروع بنجاح", "success");
        setIsProjectModalOpen(false);
        loadAllData(true);
      } else {
        const err = await res.json();
        showToast(err.error || "فشل حفظ المشروع", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء حفظ المشروع", "error");
    }
  };

  // Quick progress update
  const handleQuickProgress = async (projectId: string, newProgress: number) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: newProgress }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, progress: newProgress } : p))
        );
        showToast(`تم تحديث نسبة الإنجاز إلى ${newProgress}%`, "success");
        loadAllData(true);
      }
    } catch {
      showToast("فشل تحديث نسبة الإنجاز", "error");
    }
  };

  // Quick status update
  const handleQuickStatus = async (projectId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
        );
        showToast("تم تحديث حالة المشروع", "success");
        loadAllData(true);
      }
    } catch {
      showToast("فشل تحديث الحالة", "error");
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("تم حذف المشروع بنجاح", "success");
        setDeleteConfirm(null);
        loadAllData(true);
      } else {
        showToast("فشل حذف المشروع", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الحذف", "error");
    }
  };

  // -------------------------------------------------------------
  // STAGES HANDLERS
  // -------------------------------------------------------------
  const openStagesModal = (p: Project) => {
    setTargetProjectForStages(p);
    setIsStagesModalOpen(true);
  };

  const handleCycleStageStatus = async (projectId: string, stage: Stage) => {
    const nextStatus: Record<string, "pending" | "current" | "done"> = {
      pending: "current",
      current: "done",
      done: "pending",
    };
    const updatedStatus = nextStatus[stage.status] || "pending";

    try {
      const res = await fetch(`/api/projects/${projectId}/stages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stageId: stage.id,
          status: updatedStatus,
          syncProgress: true,
        }),
      });

      if (res.ok) {
        showToast(`تم تغيير مرحلة ${stage.name} إلى ${updatedStatus}`, "info");
        loadAllData(true);
        if (targetProjectForStages?.id === projectId) {
          const updatedStages = targetProjectForStages.stages?.map((s) =>
            s.id === stage.id ? { ...s, status: updatedStatus } : s
          );
          setTargetProjectForStages({ ...targetProjectForStages, stages: updatedStages });
        }
      }
    } catch {
      showToast("فشل تحديث المرحلة", "error");
    }
  };

  const handleAddStage = async (projectId: string, stageName: string) => {
    if (!stageName.trim()) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: stageName.trim(), status: "pending" }),
      });
      if (res.ok) {
        showToast("تمت إضافة المرحلة", "success");
        loadAllData(true);
        const addedStage = await res.json();
        if (targetProjectForStages?.id === projectId) {
          setTargetProjectForStages({
            ...targetProjectForStages,
            stages: [...(targetProjectForStages.stages || []), addedStage],
          });
        }
      }
    } catch {
      showToast("فشلت إضافة المرحلة", "error");
    }
  };

  // -------------------------------------------------------------
  // PAYMENT HANDLERS
  // -------------------------------------------------------------
  const openAddPayment = (defaultProjectId?: string) => {
    setPaymentForm({
      projectId: defaultProjectId || (projects[0]?.id || ""),
      amount: "",
      method: "Bank Transfer",
      date: new Date().toISOString().slice(0, 10),
      note: ""
    });
    setPaymentTargetProjectId(defaultProjectId || "");
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.projectId) {
      showToast("يرجى اختيار المشروع", "error");
      return;
    }
    const amt = parseFloat(paymentForm.amount);
    if (isNaN(amt) || amt <= 0) {
      showToast("يرجى إدخال مبلغ صحيح", "error");
      return;
    }

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentForm,
          amount: amt,
        }),
      });

      if (res.ok) {
        showToast("تم تسجيل الدفعة بنجاح وتحديث حساب المشروع", "success");
        setIsPaymentModalOpen(false);
        loadAllData(true);
      } else {
        const err = await res.json();
        showToast(err.error || "فشل تسجيل الدفعة", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء تسجيل الدفعة", "error");
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("تم حذف الدفعة وإعادة احتساب المدفوعات", "success");
        setDeleteConfirm(null);
        loadAllData(true);
      } else {
        showToast("فشل حذف الدفعة", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الحذف", "error");
    }
  };

  // -------------------------------------------------------------
  // NOTE HANDLERS
  // -------------------------------------------------------------
  const openAddNote = (p?: Project) => {
    setTargetProjectForNote(p || null);
    setNoteForm({
      projectId: p?.id || (projects[0]?.id || ""),
      text: "",
      author: "team"
    });
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.projectId || !noteForm.text.trim()) {
      showToast("يرجى كتابة الملاحظة واختيار المشروع", "error");
      return;
    }

    try {
      const res = await fetch(`/api/projects/${noteForm.projectId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteForm),
      });

      if (res.ok) {
        showToast("تمت إضافة الملاحظة بنجاح", "success");
        setIsNoteModalOpen(false);
        loadAllData(true);
      } else {
        showToast("فشلت إضافة الملاحظة", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء إضافة الملاحظة", "error");
    }
  };

  const handleDeleteNote = async (projectId: string, noteId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/notes?noteId=${noteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("تم حذف الملاحظة", "success");
        setDeleteConfirm(null);
        loadAllData(true);
      } else {
        showToast("فشل حذف الملاحظة", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الحذف", "error");
    }
  };

  // -------------------------------------------------------------
  // FILTERED DATA
  // -------------------------------------------------------------
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = clientSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
      );
    });
  }, [clients, clientSearch]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = projectSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.client?.name && p.client.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesStatus = projectStatusFilter === "ALL" || p.status === projectStatusFilter;
      const matchesType = projectTypeFilter === "ALL" || p.type === projectTypeFilter;
      const matchesClient = projectClientFilter === "ALL" || p.clientId === projectClientFilter;

      return matchesSearch && matchesStatus && matchesType && matchesClient;
    });
  }, [projects, projectSearch, projectStatusFilter, projectTypeFilter, projectClientFilter]);

  const requestedProjects = useMemo(() => {
    return projects.filter((p) => p.status === "requested" || p.status === "in_review");
  }, [projects]);

  const handleApproveProject = async (project: Project) => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "in_progress",
          contractStatus: "تم الاعتماد وبدء التنفيذ",
          progress: project.progress > 0 ? project.progress : 5,
        }),
      });
      if (res.ok) {
        showToast(`تم اعتماد وبدء تنفيذ مشروع "${project.name}" بنجاح!`, "success");
        loadAllData(true);
      } else {
        showToast("فشل اعتماد المشروع", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء اعتماد المشروع", "error");
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((pay) => {
      const q = paymentSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        (pay.project?.name && pay.project.name.toLowerCase().includes(q)) ||
        (pay.project?.client?.name && pay.project.client.name.toLowerCase().includes(q)) ||
        (pay.method && pay.method.toLowerCase().includes(q)) ||
        (pay.note && pay.note.toLowerCase().includes(q)) ||
        pay.amount.toString().includes(q)
      );
    });
  }, [payments, paymentSearch]);

  // All notes flattened from projects
  const allNotes = useMemo(() => {
    const list: (Note & { projectName: string; clientName?: string })[] = [];
    projects.forEach((p) => {
      (p.notes || []).forEach((n) => {
        list.push({
          ...n,
          projectName: p.name,
          clientName: p.client?.name,
        });
      });
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projects]);

  return (
    <div className={`min-h-screen flex flex-col bg-[#1F2A24] text-[#F6F7F5] ${isRTL ? "font-cairo" : ""}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Toast notifications */}
      <div className="fixed top-5 left-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-2xl border text-sm flex items-center gap-3 backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 ${
              t.type === "success"
                ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40"
                : t.type === "error"
                ? "bg-rose-950/90 text-rose-200 border-rose-500/40"
                : "bg-gray-900/90 text-gray-200 border-gray-700"
            }`}
          >
            {t.type === "success" && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
            {t.type === "error" && <AlertCircle size={18} className="text-rose-400 shrink-0" />}
            {t.type === "info" && <Clock size={18} className="text-blue-400 shrink-0" />}
            <span className="font-medium">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Top Header */}
      <header className="border-b border-[#374A3C] bg-[#1F2A24]/90 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-[#374A3C] flex items-center justify-center border border-emerald-500/30 shadow-lg">
              <ShieldCheck className="text-emerald-200" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-wide">
                  {lang === "ar" ? "لوحة تحكم الإدارة" : "Admin Management Console / لوحة تحكم الإدارة"}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {userRole === "ADMIN" ? (lang === "ar" ? "مدير النظام (ADMIN)" : "System Admin") : (lang === "ar" ? "المدير (MANAGER)" : "Manager")}
                </span>
              </div>
              <p className="text-xs text-[#A7B7A7]">
                {lang === "ar"
                  ? "إدارة بيانات العملاء، المشاريع، نسب التطور والدفعات المالية"
                  : "Manage clients, projects, evolutionary extensions, and fast bug fixing"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />

            <button
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-[#374A3C] bg-[#374A3C]/40 hover:bg-[#374A3C] text-[#A7B7A7] hover:text-white transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin text-emerald-400" : ""} />
            </button>

            <Link
              href="/"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border border-[#374A3C] bg-[#374A3C]/30 hover:bg-[#374A3C]/70 text-[#A7B7A7] hover:text-white transition-colors"
            >
              <ExternalLink size={16} />
              <span>{lang === "ar" ? "بوابة العميل" : "Client Portal"}</span>
            </Link>

            <button
              onClick={async () => {
                try {
                  await signOut({ redirect: false });
                } catch {}
                window.location.href = "/login";
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border border-rose-900/50 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 transition-colors"
            >
              <LogOut size={16} />
              <span>{lang === "ar" ? "تسجيل خروج" : "Log out"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/40"
                : "text-[#A7B7A7] hover:text-white hover:bg-[#374A3C]/40"
            }`}
          >
            <LayoutDashboard size={18} />
            <span>{lang === "ar" ? "نظرة عامة" : "Overview"}</span>
          </button>

          <button
            onClick={() => setActiveTab("clients")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "clients"
                ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/40"
                : "text-[#A7B7A7] hover:text-white hover:bg-[#374A3C]/40"
            }`}
          >
            <Users size={18} />
            <span>{lang === "ar" ? `إدارة العملاء (${clients.length})` : `Clients (${clients.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "projects"
                ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/40"
                : "text-[#A7B7A7] hover:text-white hover:bg-[#374A3C]/40"
            }`}
          >
            <FolderKanban size={18} />
            <span>{lang === "ar" ? `المشاريع والتطور (${projects.length})` : `Projects (${projects.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab("fast_fixing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "fast_fixing"
                ? "bg-amber-600 text-white shadow-md shadow-amber-900/40"
                : "text-[#A7B7A7] hover:text-white hover:bg-[#374A3C]/40"
            }`}
          >
            <Zap size={18} className="text-amber-300" />
            <span>
              {lang === "ar" ? "التصليح السريع" : "Fast Fixing"} (
              {fastFixIssues.filter((i) => i.status !== "fixed").length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "payments"
                ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/40"
                : "text-[#A7B7A7] hover:text-white hover:bg-[#374A3C]/40"
            }`}
          >
            <CreditCard size={18} />
            <span>{lang === "ar" ? `الدفعات المالية (${payments.length})` : `Payments (${payments.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "notes"
                ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/40"
                : "text-[#A7B7A7] hover:text-white hover:bg-[#374A3C]/40"
            }`}
          >
            <MessageSquare size={18} />
            <span>{lang === "ar" ? `الملاحظات والمتابعة (${allNotes.length})` : `Notes (${allNotes.length})`}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Action floating/pinned bar */}
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#374A3C]/30 border border-[#374A3C] flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              ⚡ إجراءات سريعة
            </span>
            <span className="text-xs text-[#A7B7A7]">إضافة بيانات وتحكم فوري بكافة أجزاء النظام:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openAddClient}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
            >
              <Plus size={15} />
              <span>عميل جديد</span>
            </button>

            <button
              onClick={() => openAddProject()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#506055] hover:bg-[#506055]/80 text-white border border-emerald-500/30 transition-all"
            >
              <Plus size={15} />
              <span>مشروع جديد</span>
            </button>

            <button
              onClick={() => openAddPayment()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-700 hover:bg-teal-600 text-white shadow-sm transition-all"
            >
              <Plus size={15} />
              <span>تسجيل دفعة</span>
            </button>

            <button
              onClick={() => openAddNote()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-700 hover:bg-amber-600 text-white shadow-sm transition-all"
            >
              <Plus size={15} />
              <span>كتابة ملاحظة</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Clients Card */}
              <div className="p-5 rounded-2xl bg-[#374A3C]/40 border border-[#374A3C] shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#A7B7A7]">إجمالي العملاء</p>
                  <p className="text-2xl font-bold text-white mt-1">{summary?.metrics.totalClients ?? clients.length}</p>
                  <button
                    onClick={() => setActiveTab("clients")}
                    className="text-xs text-emerald-400 hover:underline mt-2 flex items-center gap-1"
                  >
                    <span>استعراض العملاء</span>
                    <ArrowRight size={13} className="rotate-180" />
                  </button>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Users size={24} />
                </div>
              </div>

              {/* Projects Card */}
              <div className="p-5 rounded-2xl bg-[#374A3C]/40 border border-[#374A3C] shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#A7B7A7]">المشاريع النشطة</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-white">
                      {summary?.metrics.activeProjects ?? projects.filter((p) => p.status !== "completed").length}
                    </span>
                    <span className="text-xs text-[#A7B7A7]">/ {projects.length} كلي</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("projects")}
                    className="text-xs text-emerald-400 hover:underline mt-2 flex items-center gap-1"
                  >
                    <span>إدارة المشاريع</span>
                    <ArrowRight size={13} className="rotate-180" />
                  </button>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FolderKanban size={24} />
                </div>
              </div>

              {/* Revenue Card */}
              <div className="p-5 rounded-2xl bg-[#374A3C]/40 border border-[#374A3C] shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#A7B7A7]">إجمالي المحصل</p>
                  <p className="text-xl font-bold text-emerald-300 mt-1">
                    {formatMoney(summary?.metrics.totalPaid ?? projects.reduce((acc, p) => acc + (p.paid || 0), 0))}
                  </p>
                  <p className="text-xs text-[#A7B7A7] mt-1">
                    المتبقي: {formatMoney(summary?.metrics.totalRemaining ?? 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
              </div>

              {/* Average Progress Card */}
              <div className="p-5 rounded-2xl bg-[#374A3C]/40 border border-[#374A3C] shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#A7B7A7]">متوسط تقدم المشاريع</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {summary?.metrics.averageProgress ?? 0}%
                  </p>
                  <div className="w-24 bg-gray-700 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${summary?.metrics.averageProgress ?? 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            {/* New Project Requests from Clients Banner / Section */}
            {requestedProjects.length > 0 && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#1F2A24] to-[#1F2A24] border-2 border-amber-500/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                      <Inbox size={22} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <span>طلبات المشاريع الجديدة من العملاء (قيد المراجعة)</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40">
                          {requestedProjects.length} طلب جديد
                        </span>
                      </h2>
                      <p className="text-xs text-[#A7B7A7] mt-0.5">
                        هذه طلبات مشاريع مرسلة من حسابات العملاء بانتظار المراجعة والاعتماد وتحديد خطة العمل
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProjectStatusFilter("requested");
                      setActiveTab("projects");
                    }}
                    className="text-xs text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>عرض الكل في إدارة المشاريع</span>
                    <ArrowRight size={14} className="rotate-180" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {requestedProjects.map((rp) => {
                    const typeMeta = TYPE_CONFIG[rp.type] || TYPE_CONFIG.website;
                    return (
                      <div
                        key={rp.id}
                        className="p-4 rounded-xl bg-[#141E18]/80 border border-amber-500/30 hover:border-amber-400/50 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-white text-sm">{rp.name}</h3>
                              <span className={`text-[10px] px-2 py-0.5 rounded border ${typeMeta.color}`}>
                                {typeMeta.label}
                              </span>
                            </div>
                            <p className="text-xs text-[#A7B7A7] mt-1">
                              العميل: <strong className="text-white">{rp.client?.name || "عميل"}</strong>
                              {rp.client?.company && <span> ({rp.client.company})</span>}
                              {rp.createdAt && <span> • تاريخ الطلب: {formatDate(rp.createdAt)}</span>}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                            قيد المراجعة
                          </span>
                        </div>

                        {rp.description && (
                          <div className="text-xs text-gray-300 bg-black/30 p-2.5 rounded-lg border border-[#374A3C]/40 line-clamp-3 whitespace-pre-line leading-relaxed">
                            {rp.description}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-[#A7B7A7] pt-1 border-t border-[#374A3C]/40">
                          <div>
                            <span>الميزانية المقترحة: </span>
                            <strong className="text-emerald-400 font-mono">
                              {rp.budget ? formatMoney(rp.budget) : "لم تُحدد"}
                            </strong>
                            <span className="mx-2">•</span>
                            <span>المدة المستهدفة: </span>
                            <strong className="text-white font-mono">{rp.totalDays || 30} يوم</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleApproveProject(rp)}
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          >
                            <CheckCircle2 size={14} />
                            <span>قبول واعتماد وبدء التنفيذ</span>
                          </button>
                          <button
                            onClick={() => openEditProject(rp)}
                            className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#374A3C]/50 hover:bg-[#374A3C] text-amber-300 border border-[#374A3C] flex items-center gap-1 transition-colors"
                          >
                            <Edit size={13} />
                            <span>مراجعة وتعديل</span>
                          </button>
                          <button
                            onClick={() => openAddNote(rp)}
                            className="p-1.5 rounded-lg bg-[#374A3C]/50 hover:bg-[#374A3C] text-gray-300 border border-[#374A3C] transition-colors"
                            title="إرسال ملاحظة للعميل"
                          >
                            <MessageSquare size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Overview Section: Recent Projects & Recent Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Projects with Live Progress Control */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-[#374A3C]/30 border border-[#374A3C] shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="text-emerald-400" size={20} />
                    <h2 className="text-base font-bold text-white">المشاريع الأكثر نشاطاً ونسب الإنجاز</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("projects")}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    عرض الكل
                  </button>
                </div>

                <div className="space-y-3">
                  {projects.slice(0, 5).map((project) => {
                    const typeMeta = TYPE_CONFIG[project.type] || TYPE_CONFIG.website;
                    const statusMeta = STATUS_CONFIG[project.status] || STATUS_CONFIG.requested;
                    return (
                      <div
                        key={project.id}
                        className="p-4 rounded-xl bg-[#1F2A24]/70 border border-[#374A3C] hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm hover:text-emerald-300">
                              {project.name}
                            </span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-md border ${typeMeta.color}`}>
                              {typeMeta.label}
                            </span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-md border ${statusMeta.badgeCls}`}>
                              {statusMeta.label}
                            </span>
                          </div>
                          <div className="text-xs text-[#A7B7A7] flex items-center gap-3 flex-wrap">
                            <span>العميل: <strong className="text-white">{project.client?.name || "-"}</strong></span>
                            <span>•</span>
                            <span>الميزانية: <strong className="text-emerald-400">{formatMoney(project.budget)}</strong></span>
                            <span>•</span>
                            <span>المدفوع: <strong>{formatMoney(project.paid)}</strong></span>
                          </div>
                        </div>

                        {/* Interactive Progress Slider */}
                        <div className="md:w-64 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#A7B7A7]">نسبة التطور:</span>
                            <span className="font-bold text-emerald-300">{project.progress}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={project.progress}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setProjects((prev) =>
                                  prev.map((p) => (p.id === project.id ? { ...p, progress: val } : p))
                                );
                              }}
                              onMouseUp={(e) => handleQuickProgress(project.id, parseInt((e.target as any).value))}
                              onTouchEnd={(e) => handleQuickProgress(project.id, parseInt((e.target as any).value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>
                          <div className="flex justify-between gap-1 text-[10px]">
                            {[0, 25, 50, 75, 100].map((step) => (
                              <button
                                key={step}
                                onClick={() => handleQuickProgress(project.id, step)}
                                className={`px-1.5 py-0.5 rounded border transition-colors ${
                                  project.progress === step
                                    ? "bg-emerald-600 text-white border-emerald-400"
                                    : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
                                }`}
                              >
                                {step}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Payments Feed */}
              <div className="p-5 rounded-2xl bg-[#374A3C]/30 border border-[#374A3C] shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-teal-400" size={20} />
                    <h2 className="text-base font-bold text-white">أحدث الدفعات المسجلة</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("payments")}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    عرض الكل
                  </button>
                </div>

                <div className="space-y-3">
                  {payments.slice(0, 6).map((pay) => (
                    <div
                      key={pay.id}
                      className="p-3 rounded-xl bg-[#1F2A24]/70 border border-[#374A3C] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{pay.project?.name || "مشروع"}</p>
                        <p className="text-[#A7B7A7] mt-0.5">
                          {pay.project?.client?.name || "-"} • {pay.method}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(pay.date)}</p>
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-emerald-300 text-sm block">
                          +{formatMoney(pay.amount)}
                        </span>
                        {pay.note && <span className="text-[10px] text-gray-400 truncate max-w-[100px] block">{pay.note}</span>}
                      </div>
                    </div>
                  ))}
                  {payments.length === 0 && (
                    <p className="text-center py-8 text-xs text-[#A7B7A7]">لم يتم تسجيل أي دفعات بعد.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CLIENTS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === "clients" && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute right-3.5 top-3 text-[#A7B7A7]" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، الشركة، البريد أو الهاتف..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#1F2A24] border border-[#374A3C] text-sm text-white placeholder-[#A7B7A7] focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                onClick={openAddClient}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition-all"
              >
                <Plus size={18} />
                <span>إضافة عميل جديد</span>
              </button>
            </div>

            {/* Clients Table / Cards */}
            <div className="rounded-2xl border border-[#374A3C] bg-[#1F2A24]/60 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#374A3C]/40 border-b border-[#374A3C] text-xs text-[#A7B7A7]">
                      <th className="px-5 py-3.5 font-bold">اسم العميل والشركة</th>
                      <th className="px-5 py-3.5 font-bold">بيانات التواصل</th>
                      <th className="px-5 py-3.5 font-bold">المشاريع</th>
                      <th className="px-5 py-3.5 font-bold">إجمالي الميزانيات</th>
                      <th className="px-5 py-3.5 font-bold">المحصل</th>
                      <th className="px-5 py-3.5 font-bold text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#374A3C]/40">
                    {filteredClients.map((client) => {
                      const totalBudget = (client.projects || []).reduce((acc, p) => acc + (p.budget || 0), 0);
                      const totalPaid = (client.projects || []).reduce((acc, p) => acc + (p.paid || 0), 0);
                      const remaining = Math.max(0, totalBudget - totalPaid);

                      return (
                        <tr key={client.id} className="hover:bg-[#374A3C]/20 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-base">{client.name}</span>
                              {client.userId || client.user ? (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                                  <Key size={10} />
                                  <span>حساب دخول نشط</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-700/30 text-gray-400 border border-gray-600/30">
                                  بدون حساب دخول
                                </span>
                              )}
                            </div>
                            {client.company && (
                              <div className="text-xs text-[#A7B7A7] flex items-center gap-1 mt-0.5">
                                <Building size={12} />
                                <span>{client.company}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs text-[#A7B7A7] space-y-1">
                            {client.phone && (
                              <div className="flex items-center gap-1 text-gray-300">
                                <Phone size={12} className="text-emerald-400" />
                                <span dir="ltr">{client.phone}</span>
                              </div>
                            )}
                            {client.email && (
                              <div className="flex items-center gap-1">
                                <Mail size={12} className="text-blue-400" />
                                <span>{client.email}</span>
                              </div>
                            )}
                            {client.address && (
                              <div className="flex items-center gap-1 text-[11px]">
                                <MapPin size={12} />
                                <span>{client.address}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {client._count?.projects ?? client.projects?.length ?? 0} مشاريع
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-white">
                            {formatMoney(totalBudget)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-emerald-400">{formatMoney(totalPaid)}</div>
                            {remaining > 0 && (
                              <div className="text-[11px] text-amber-400/80 mt-0.5">
                                متبقي: {formatMoney(remaining)}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setViewingClient(client);
                                  setIsClientDetailsOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                                title="عرض التفاصيل والمشاريع"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => openEditClient(client)}
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors"
                                title="تعديل العميل"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => openAddProject(client.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                                title="إضافة مشروع لهذا العميل"
                              >
                                <Plus size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    type: "client",
                                    id: client.id,
                                    name: client.name,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                                title="حذف العميل"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredClients.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#A7B7A7]">
                          لا توجد نتائج مطابقة لبحثك.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PROJECTS & PROGRESS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-[#374A3C]/30 border border-[#374A3C] space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search size={18} className="absolute right-3.5 top-3 text-[#A7B7A7]" />
                  <input
                    type="text"
                    placeholder="ابحث باسم المشروع، العميل أو الوصف..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#1F2A24] border border-[#374A3C] text-sm text-white placeholder-[#A7B7A7] focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <button
                  onClick={() => openAddProject()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition-all"
                >
                  <Plus size={18} />
                  <span>إضافة مشروع جديد</span>
                </button>
              </div>

              {/* Filters row */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#374A3C]/50 text-xs">
                <span className="text-[#A7B7A7] font-semibold">تصفية:</span>

                {/* Status Filter */}
                <select
                  value={projectStatusFilter}
                  onChange={(e) => setProjectStatusFilter(e.target.value)}
                  className="bg-[#1F2A24] border border-[#374A3C] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">جميع الحالات</option>
                  <option value="requested">طلب جديد (Requested)</option>
                  <option value="in_review">قيد المراجعة (In Review)</option>
                  <option value="in_progress">قيد التنفيذ (In Progress)</option>
                  <option value="completed">مكتمل (Completed)</option>
                </select>

                {/* Type Filter */}
                <select
                  value={projectTypeFilter}
                  onChange={(e) => setProjectTypeFilter(e.target.value)}
                  className="bg-[#1F2A24] border border-[#374A3C] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">جميع الأنواع</option>
                  <option value="website">مواقع الويب (Website)</option>
                  <option value="mobile">تطبيقات الموبايل (Mobile)</option>
                  <option value="automation">أتمتة (Automation)</option>
                  <option value="desktop">أنظمة سطح المكتب (Desktop)</option>
                  <option value="email_service">خدمة بريد إلكتروني (Email Service)</option>
                  <option value="erp">أنظمة ERP</option>
                </select>

                {/* Client Filter */}
                <select
                  value={projectClientFilter}
                  onChange={(e) => setProjectClientFilter(e.target.value)}
                  className="bg-[#1F2A24] border border-[#374A3C] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">جميع العملاء</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {(projectSearch || projectStatusFilter !== "ALL" || projectTypeFilter !== "ALL" || projectClientFilter !== "ALL") && (
                  <button
                    onClick={() => {
                      setProjectSearch("");
                      setProjectStatusFilter("ALL");
                      setProjectTypeFilter("ALL");
                      setProjectClientFilter("ALL");
                    }}
                    className="text-emerald-400 hover:underline mr-auto"
                  >
                    إعادة ضبط التصفية
                  </button>
                )}
              </div>
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredProjects.map((project) => {
                const typeMeta = TYPE_CONFIG[project.type] || TYPE_CONFIG.website;
                const statusMeta = STATUS_CONFIG[project.status] || STATUS_CONFIG.requested;
                const TypeIcon = typeMeta.icon;
                const stages = project.stages || [];
                const remaining = Math.max(0, (project.budget || 0) - (project.paid || 0));

                return (
                  <div
                    key={project.id}
                    className="p-5 rounded-2xl bg-[#1F2A24]/80 border border-[#374A3C] hover:border-emerald-500/40 transition-all shadow-lg space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-xl border ${typeMeta.color} shrink-0`}>
                          <TypeIcon size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-white text-lg">{project.name}</h3>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusMeta.badgeCls}`}>
                              {statusMeta.label}
                            </span>
                            {project.versionLabel && (
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-gray-700">
                                {project.versionLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#A7B7A7] mt-1 flex items-center gap-2">
                            <span>العميل: <strong className="text-white">{project.client?.name || "-"}</strong></span>
                            {project.client?.company && <span>({project.client.company})</span>}
                            <span>•</span>
                            <span>تاريخ البدء: {formatDate(project.contractDate || project.requestDate)}</span>
                            <span>•</span>
                            <span>المدة: {project.totalDays || 30} يوم</span>
                          </p>
                        </div>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                        <button
                          onClick={() => openProjectDeliveryModal(project)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                            project.delivery?.status === "delivered"
                              ? "bg-emerald-600/25 hover:bg-emerald-600/35 text-emerald-300 border-emerald-500/50"
                              : project.delivery?.status === "ready_for_review"
                              ? "bg-amber-600/25 hover:bg-amber-600/35 text-amber-300 border-amber-500/50"
                              : project.delivery?.status === "revision_requested"
                              ? "bg-blue-600/25 hover:bg-blue-600/35 text-blue-300 border-blue-500/50"
                              : "bg-emerald-700/20 hover:bg-emerald-700/30 text-emerald-300 border-emerald-600/30"
                          }`}
                          title="إدارة بيانات التسليم والتوثيق وحسابات الدخول ومستندات المشروع"
                        >
                          <ShieldCheck size={14} />
                          <span>
                            {lang === "ar" ? "التسليم والتوثيق" : "Delivery"}
                            {project.delivery?.status === "delivered" && " (معتمد ✓)"}
                            {project.delivery?.status === "ready_for_review" && " (جاهز)"}
                            {project.delivery?.status === "revision_requested" && " (ملاحظات)"}
                          </span>
                        </button>
                        <button
                          onClick={() => openProjectExtensions(project)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-colors"
                          title="إدارة طلبات التطوير ومراحل التوسيع والدمج في المشروع"
                        >
                          <GitMerge size={14} />
                          <span>{lang === "ar" ? "تطوير ودمج" : "Evolution & Merge"} ({project.extensions?.length || 0})</span>
                        </button>
                        <button
                          onClick={() => openStagesModal(project)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors"
                        >
                          <Sliders size={14} />
                          <span>إدارة المراحل ({stages.length})</span>
                        </button>
                        <button
                          onClick={() => openAddPayment(project.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 transition-colors"
                        >
                          <CreditCard size={14} />
                          <span>إضافة دفعة</span>
                        </button>
                        <button
                          onClick={() => openAddNote(project)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition-colors"
                        >
                          <MessageSquare size={14} />
                          <span>ملاحظة ({project.notes?.length || 0})</span>
                        </button>
                        <Link
                          href={`/projects/${project.id}/statement`}
                          target="_blank"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-colors"
                          title="تصدير كشف حساب PDF رسمي"
                        >
                          <FileText size={14} />
                          <span>كشف حساب PDF</span>
                        </Link>
                        <button
                          onClick={() => openEditProject(project)}
                          className="p-2 rounded-xl bg-[#374A3C]/40 hover:bg-[#374A3C] text-amber-300 border border-[#374A3C] transition-colors"
                          title="تعديل المشروع"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              type: "project",
                              id: project.id,
                              name: project.name,
                            })
                          }
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          title="حذف المشروع"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-xs text-[#A7B7A7] leading-relaxed bg-[#374A3C]/20 p-3 rounded-xl border border-[#374A3C]/40">
                        {project.description}
                      </p>
                    )}

                    {/* Progress Control & Financials Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#374A3C]/40">
                      {/* Interactive Progress Bar */}
                      <div className="space-y-2 p-3 rounded-xl bg-[#1F2A24] border border-[#374A3C]/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <TrendingUp size={15} className="text-emerald-400" />
                            <span>مؤشر التطور والإنجاز</span>
                          </span>
                          <span className="font-bold text-emerald-300 text-sm">{project.progress}%</span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={project.progress}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setProjects((prev) =>
                              prev.map((p) => (p.id === project.id ? { ...p, progress: val } : p))
                            );
                          }}
                          onMouseUp={(e) => handleQuickProgress(project.id, parseInt((e.target as any).value))}
                          onTouchEnd={(e) => handleQuickProgress(project.id, parseInt((e.target as any).value))}
                          className="w-full h-2.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />

                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] text-[#A7B7A7]">تحديد سريع:</span>
                          <div className="flex gap-1 text-[11px]">
                            {[0, 25, 50, 75, 100].map((step) => (
                              <button
                                key={step}
                                onClick={() => handleQuickProgress(project.id, step)}
                                className={`px-2 py-0.5 rounded border transition-colors ${
                                  project.progress === step
                                    ? "bg-emerald-600 text-white border-emerald-400 font-bold"
                                    : "bg-[#374A3C]/40 text-[#A7B7A7] border-[#374A3C] hover:text-white"
                                }`}
                              >
                                {step}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Financial Status Summary */}
                      <div className="space-y-2 p-3 rounded-xl bg-[#1F2A24] border border-[#374A3C]/60">
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span className="flex items-center gap-1.5">
                            <CreditCard size={15} className="text-teal-400" />
                            <span>الموقف المالي</span>
                          </span>
                          <span className="text-emerald-400">
                            {Math.round(((project.paid || 0) / (project.budget || 1)) * 100)}% تم سداده
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 rounded-lg bg-[#374A3C]/30 border border-[#374A3C]/50">
                            <span className="text-[10px] text-[#A7B7A7] block">الميزانية</span>
                            <span className="font-bold text-white">{formatMoney(project.budget)}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-[#374A3C]/30 border border-[#374A3C]/50">
                            <span className="text-[10px] text-[#A7B7A7] block">المدفوع</span>
                            <span className="font-bold text-emerald-400">{formatMoney(project.paid)}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-[#374A3C]/30 border border-[#374A3C]/50">
                            <span className="text-[10px] text-[#A7B7A7] block">المتبقي</span>
                            <span className="font-bold text-amber-400">{formatMoney(remaining)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#A7B7A7] pt-1">
                          <span>سجل الدفعات: {(project.payments || []).length} دفعة</span>
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/projects/${project.id}/statement`}
                              target="_blank"
                              className="text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <FileText size={12} />
                              <span>كشف الحساب PDF</span>
                            </Link>
                            <button
                              onClick={() => openAddPayment(project.id)}
                              className="text-emerald-400 hover:underline"
                            >
                              + تسجيل دفعة
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stages Badges (Interactive click to cycle status) */}
                    {stages.length > 0 && (
                      <div className="pt-2 border-t border-[#374A3C]/40 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-[#A7B7A7]">
                          <span>مراحل المشروع (انقر على المرحلة لتغيير حالتها فوراً):</span>
                          <button
                            onClick={() => openStagesModal(project)}
                            className="text-emerald-400 hover:underline text-[11px]"
                          >
                            تعديل المراحل
                          </button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {stages.map((stage) => {
                            const isDone = stage.status === "done";
                            const isCurrent = stage.status === "current";
                            return (
                              <button
                                key={stage.id || stage.name}
                                onClick={() => handleCycleStageStatus(project.id, stage)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                                  isDone
                                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60"
                                    : isCurrent
                                    ? "bg-blue-950/60 text-blue-300 border-blue-500/50 hover:bg-blue-900/60 animate-pulse"
                                    : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
                                }`}
                                title="انقر للتبديل: قيد الانتظار -> جاري -> مكتمل"
                              >
                                {isDone && <Check size={12} className="text-emerald-400" />}
                                {isCurrent && <Clock size={12} className="text-blue-400" />}
                                <span>{stage.name}</span>
                                <span className="text-[10px] opacity-75">
                                  ({isDone ? "مكتمل" : isCurrent ? "جاري" : "معلق"})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredProjects.length === 0 && (
                <div className="p-12 text-center text-[#A7B7A7] rounded-2xl border border-[#374A3C] bg-[#1F2A24]/60">
                  لا توجد مشاريع مطابقة لمعايير البحث.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: PAYMENTS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            {/* Top Financial Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#374A3C]/40 border border-[#374A3C]">
                <span className="text-xs text-[#A7B7A7]">إجمالي ميزانيات المشاريع</span>
                <p className="text-xl font-bold text-white mt-1">
                  {formatMoney(projects.reduce((acc, p) => acc + (p.budget || 0), 0))}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#374A3C]/40 border border-[#374A3C]">
                <span className="text-xs text-[#A7B7A7]">إجمالي المبالغ المحصلة</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">
                  {formatMoney(payments.reduce((acc, p) => acc + p.amount, 0))}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#374A3C]/40 border border-[#374A3C]">
                <span className="text-xs text-[#A7B7A7]">المتبقي للتحصيل</span>
                <p className="text-xl font-bold text-amber-400 mt-1">
                  {formatMoney(
                    Math.max(
                      0,
                      projects.reduce((acc, p) => acc + (p.budget || 0), 0) -
                        payments.reduce((acc, p) => acc + p.amount, 0)
                    )
                  )}
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute right-3.5 top-3 text-[#A7B7A7]" />
                <input
                  type="text"
                  placeholder="ابحث بالمشروع، العميل، طريقة الدفع أو البيان..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#1F2A24] border border-[#374A3C] text-sm text-white placeholder-[#A7B7A7] focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                onClick={() => openAddPayment()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/40 transition-all"
              >
                <Plus size={18} />
                <span>تسجيل دفعة جديدة</span>
              </button>
            </div>

            {/* Payments Table */}
            <div className="rounded-2xl border border-[#374A3C] bg-[#1F2A24]/60 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#374A3C]/40 border-b border-[#374A3C] text-xs text-[#A7B7A7]">
                      <th className="px-5 py-3.5 font-bold">التاريخ</th>
                      <th className="px-5 py-3.5 font-bold">المشروع والعميل</th>
                      <th className="px-5 py-3.5 font-bold">المبلغ</th>
                      <th className="px-5 py-3.5 font-bold">طريقة الدفع</th>
                      <th className="px-5 py-3.5 font-bold">ملاحظة / البيان</th>
                      <th className="px-5 py-3.5 font-bold text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#374A3C]/40">
                    {filteredPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-[#374A3C]/20 transition-colors">
                        <td className="px-5 py-4 text-xs text-gray-300 font-medium">
                          {formatDate(pay.date)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-white">{pay.project?.name || "مشروع"}</div>
                          <div className="text-xs text-[#A7B7A7] mt-0.5">
                            العميل: {pay.project?.client?.name || "-"}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-emerald-400 text-base">
                          {formatMoney(pay.amount)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                            {pay.method}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-[#A7B7A7] max-w-xs truncate">
                          {pay.note || "-"}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                type: "payment",
                                id: pay.id,
                                name: `${formatMoney(pay.amount)} - ${pay.project?.name}`,
                              })
                            }
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            title="حذف الدفعة"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredPayments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#A7B7A7]">
                          لا توجد دفعات مطابقة.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: NOTES & ACTIVITY LOG */}
        {/* ======================================================== */}
        {activeTab === "notes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">سجل الملاحظات والتواصل</h2>
                <p className="text-xs text-[#A7B7A7]">متابعة التحديثات والملاحظات المتبادلة بين الإدارة والعملاء</p>
              </div>

              <button
                onClick={() => openAddNote()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40 transition-all"
              >
                <Plus size={18} />
                <span>إضافة ملاحظة جديدة</span>
              </button>
            </div>

            <div className="space-y-3">
              {allNotes.map((note) => {
                const isTeam = note.author === "team";
                return (
                  <div
                    key={note.id}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                      isTeam
                        ? "bg-[#374A3C]/40 border-emerald-500/30"
                        : "bg-blue-950/20 border-blue-500/30"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
                            isTeam
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                          }`}
                        >
                          {isTeam ? "فريق العمل / الإدارة" : "العميل"}
                        </span>
                        <span className="text-xs font-bold text-white">
                          المشروع: {note.projectName}
                        </span>
                        {note.clientName && (
                          <span className="text-xs text-[#A7B7A7]">({note.clientName})</span>
                        )}
                        <span className="text-[11px] text-[#A7B7A7] mr-auto">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed pr-1">{note.text}</p>
                    </div>

                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          type: "note",
                          id: note.id,
                          projectId: note.projectId,
                          name: note.text.slice(0, 30) + "...",
                        })
                      }
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors shrink-0"
                      title="حذف الملاحظة"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}

              {allNotes.length === 0 && (
                <div className="p-12 text-center text-[#A7B7A7] rounded-2xl border border-[#374A3C] bg-[#1F2A24]/60">
                  لا توجد أي ملاحظات مسجلة حتى الآن.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: FAST FIXING ISSUES */}
        {/* ======================================================== */}
        {activeTab === "fast_fixing" && (
          <div className="space-y-6">
            {/* KPI Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#374A3C]/40 border border-[#374A3C]">
                <span className="text-xs text-[#A7B7A7]">
                  {lang === "ar" ? "إجمالي الأعطال المسجلة" : "Total Reported Issues"}
                </span>
                <p className="text-2xl font-bold text-white mt-1">{fastFixIssues.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-xs text-amber-300 font-medium">
                  {lang === "ar" ? "أعطال بانتظار المعالجة" : "Pending Issues"}
                </span>
                <p className="text-2xl font-bold text-amber-300 mt-1">
                  {fastFixIssues.filter((i) => i.status === "pending").length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <span className="text-xs text-blue-300 font-medium">
                  {lang === "ar" ? "أعطال جاري العمل عليها (On It)" : "In Progress (On It)"}
                </span>
                <p className="text-2xl font-bold text-blue-300 mt-1">
                  {fastFixIssues.filter((i) => i.status === "on_it").length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-xs text-emerald-300 font-medium">
                  {lang === "ar" ? "أعطال تم إصلاحها بنجاح (Fixed)" : "Fixed & Resolved"}
                </span>
                <p className="text-2xl font-bold text-emerald-300 mt-1">
                  {fastFixIssues.filter((i) => i.status === "fixed").length}
                </p>
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex items-center justify-between gap-4 flex-wrap p-4 rounded-2xl bg-[#374A3C]/30 border border-[#374A3C]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[#A7B7A7] font-semibold">
                  {lang === "ar" ? "تصفية حسب الحالة:" : "Filter by status:"}
                </span>
                <div className="flex gap-2">
                  {[
                    { id: "ALL", label: lang === "ar" ? "الكل" : "All" },
                    { id: "pending", label: lang === "ar" ? "قيد الانتظار" : "Pending" },
                    { id: "on_it", label: lang === "ar" ? "جاري العمل (On It)" : "On It" },
                    { id: "fixed", label: lang === "ar" ? "تم الإصلاح (Fixed)" : "Fixed" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFastFixStatusFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        fastFixStatusFilter === tab.id
                          ? "bg-amber-600 text-white shadow-md shadow-amber-900/40"
                          : "bg-[#1F2A24] text-[#A7B7A7] border border-[#374A3C] hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-xs text-[#A7B7A7]">
                {lang === "ar"
                  ? `يتم عرض ${fastFixIssues.filter((i) => fastFixStatusFilter === "ALL" || i.status === fastFixStatusFilter).length} عطل`
                  : `Showing ${fastFixIssues.filter((i) => fastFixStatusFilter === "ALL" || i.status === fastFixStatusFilter).length} issues`}
              </span>
            </div>

            {/* Issues List */}
            <div className="space-y-4">
              {fastFixIssues
                .filter((issue) => fastFixStatusFilter === "ALL" || issue.status === fastFixStatusFilter)
                .map((issue) => {
                  const statusCls =
                    issue.status === "fixed"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : issue.status === "on_it"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40";

                  const statusText =
                    issue.status === "fixed"
                      ? (lang === "ar" ? "تم الإصلاح (Fixed)" : "Fixed")
                      : issue.status === "on_it"
                      ? (lang === "ar" ? "جاري العمل (On It)" : "On It")
                      : (lang === "ar" ? "قيد الانتظار (Pending)" : "Pending");

                  return (
                    <div
                      key={issue.id}
                      className="p-5 rounded-2xl bg-[#1F2A24] border border-[#374A3C] hover:border-amber-500/40 transition-all shadow-lg space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                            <Zap size={22} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-white text-base">{issue.title}</h3>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${statusCls}`}>
                                {statusText}
                              </span>
                              {issue.durationMinutes != null && (
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                                  <Clock size={12} />
                                  <span>{formatDuration(issue.durationMinutes)}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#A7B7A7] mt-1 flex items-center gap-2 flex-wrap">
                              <span>{lang === "ar" ? "المشروع:" : "Project:"} <strong className="text-white">{issue.project?.name || "-"}</strong></span>
                              {issue.project?.client && (
                                <>
                                  <span>•</span>
                                  <span>{lang === "ar" ? "العميل:" : "Client:"} <strong className="text-emerald-300">{issue.project.client.name}</strong></span>
                                </>
                              )}
                              <span>•</span>
                              <span>{fmtDateStr(issue.createdAt)}</span>
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {issue.status === "pending" && (
                            <button
                              onClick={() => updateIssueStatus(issue.id, "on_it")}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/40 transition-colors"
                            >
                              <Zap size={14} />
                              <span>{lang === "ar" ? "⚡ بدء المعالجة (On It)" : "Start Working (On It)"}</span>
                            </button>
                          )}
                          {issue.status === "on_it" && (
                            <button
                              onClick={() => updateIssueStatus(issue.id, "fixed")}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40 transition-colors"
                            >
                              <CheckCircle2 size={14} />
                              <span>{lang === "ar" ? "✅ تأكيد حل العطل (Mark Fixed)" : "Mark as Fixed"}</span>
                            </button>
                          )}
                          <button
                            onClick={() => setAdminNoteModal({ id: issue.id, notes: issue.adminNotes || "" })}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#374A3C]/40 hover:bg-[#374A3C] text-amber-300 border border-[#374A3C] transition-colors"
                          >
                            <MessageSquare size={14} />
                            <span>{issue.adminNotes ? (lang === "ar" ? "تعديل الملاحظات" : "Edit Notes") : (lang === "ar" ? "إضافة ملاحظات" : "Add Notes")}</span>
                          </button>
                        </div>
                      </div>

                      {/* Description & Photo */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-[#374A3C]/40">
                        <div className={`${issue.photoUrl ? "md:col-span-3" : "md:col-span-4"} space-y-2`}>
                          <span className="text-xs font-semibold text-[#A7B7A7] block">
                            {lang === "ar" ? "وصف وشرح العطل من العميل:" : "Client Issue Explanation:"}
                          </span>
                          <div className="p-3.5 rounded-xl bg-black/30 border border-[#374A3C]/40 text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                            {issue.description}
                          </div>
                          {issue.adminNotes && (
                            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                              <span className="font-bold flex items-center gap-1">
                                <Check size={13} className="text-emerald-400" />
                                <span>{lang === "ar" ? "ملاحظات الإدارة وحل العطل:" : "Admin Resolution Notes:"}</span>
                              </span>
                              <p className="leading-relaxed">{issue.adminNotes}</p>
                            </div>
                          )}
                        </div>

                        {issue.photoUrl && (
                          <div className="md:col-span-1 space-y-1.5">
                            <span className="text-xs font-semibold text-[#A7B7A7] block">
                              {lang === "ar" ? "صورة العطل المرفقة:" : "Attached Photo:"}
                            </span>
                            <div
                              onClick={() => setViewingPhotoUrl(issue.photoUrl)}
                              className="group relative rounded-xl overflow-hidden border border-[#374A3C] cursor-pointer aspect-video bg-black/40 flex items-center justify-center hover:border-amber-400 transition-all"
                            >
                              <img
                                src={issue.photoUrl}
                                alt="Issue Screenshot"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-white text-xs font-bold transition-opacity">
                                <Eye size={16} />
                                <span>{lang === "ar" ? "تكبير" : "View"}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Timing details */}
                      <div className="flex items-center justify-between text-xs text-[#A7B7A7] pt-2 border-t border-[#374A3C]/40 flex-wrap gap-2">
                        <div className="flex items-center gap-4">
                          {issue.startedAt && (
                            <span>
                              {lang === "ar" ? "تاريخ بدء العمل:" : "Started:"}{" "}
                              <strong className="text-white font-mono">{fmtDateStr(issue.startedAt)}</strong>
                            </span>
                          )}
                          {issue.resolvedAt && (
                            <span>
                              {lang === "ar" ? "تاريخ الإصلاح:" : "Resolved:"}{" "}
                              <strong className="text-emerald-300 font-mono">{fmtDateStr(issue.resolvedAt)}</strong>
                            </span>
                          )}
                        </div>
                        {issue.durationMinutes != null && (
                          <div className="text-emerald-300 font-semibold font-mono">
                            {lang === "ar" ? "استغرق حل العطل:" : "Resolution Duration:"} {formatDuration(issue.durationMinutes)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              {fastFixIssues.filter((i) => fastFixStatusFilter === "ALL" || i.status === fastFixStatusFilter).length === 0 && (
                <div className="p-12 text-center text-[#A7B7A7] rounded-2xl border border-[#374A3C] bg-[#1F2A24]/60">
                  {lang === "ar" ? "لا توجد أي بلاغات أعطال مسجلة ضمن هذا التصنيف." : "No fast-fix issues found under this filter."}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT CLIENT */}
      {/* ======================================================== */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-lg my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#1F2A24] border border-[#374A3C] shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#374A3C]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="text-emerald-400" size={20} />
                <span>{editingClient ? "تعديل بيانات العميل" : "إضافة عميل جديد"}</span>
              </h3>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">اسم العميل *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="مثال: أحمد يوسف"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">الشركة / المؤسسة</label>
                  <input
                    type="text"
                    value={clientForm.company}
                    onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                    placeholder="مثال: Cairo Fresh Market"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="+20 100 000 0000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    dir="ltr"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="client@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">العنوان</label>
                  <input
                    type="text"
                    value={clientForm.address}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    placeholder="القاهرة، مصر"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={3}
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  placeholder="أي بيانات خاصة بالعميل..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              {!editingClient && (
                <div className="p-4 rounded-xl bg-[#141E18] border border-[#374A3C] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={createAccount}
                        onChange={(e) => setCreateAccount(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Key size={14} className="text-emerald-400" />
                        <span>إنشاء حساب دخول للمنصة لهذا العميل (Login Credentials)</span>
                      </span>
                    </label>
                  </div>

                  {createAccount && (
                    <div className="space-y-3 pt-2 border-t border-[#374A3C]/60 text-xs">
                      <p className="text-[11px] text-[#A7B7A7]">
                        سيتم إنشاء حساب دخول برتبة عميل يمكنه تسجيل الدخول ومتابعة مشاريعه وحساباته حصراً.
                      </p>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-[#A7B7A7]">كلمة المرور المؤقتة *</label>
                          <button
                            type="button"
                            onClick={() => setAccountPassword(`Client#${Math.floor(1000 + Math.random() * 9000)}`)}
                            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <RefreshCw size={11} />
                            <span>توليد عشوائي</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          dir="ltr"
                          required={createAccount}
                          value={accountPassword}
                          onChange={(e) => setAccountPassword(e.target.value)}
                          placeholder="مثال: Client#4829"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#374A3C]">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-[#374A3C] text-[#A7B7A7] hover:bg-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40"
                >
                  {editingClient ? "حفظ التعديلات" : "إضافة العميل"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NEW ACCOUNT CREATED SUCCESS / COPY CREDENTIALS */}
      {/* ======================================================== */}
      {newAccountCreatedInfo && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-md my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#1F2A24] border border-emerald-500/50 shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5 text-right">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">تم إنشاء حساب العميل بنجاح!</h3>
              <p className="text-xs text-[#A7B7A7]">
                يمكنك الآن نسخ بيانات الدخول التالية وإرسالها للعميل للبدء في استخدام حسابه الخاص
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#141E18] border border-[#374A3C] space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#374A3C]/60">
                <span className="text-[#A7B7A7]">العميل:</span>
                <span className="font-bold text-white">{newAccountCreatedInfo.clientName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#374A3C]/60">
                <span className="text-[#A7B7A7]">البريد الإلكتروني (اسم المستخدم):</span>
                <span className="font-mono text-emerald-300" dir="ltr">{newAccountCreatedInfo.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#374A3C]/60">
                <span className="text-[#A7B7A7]">كلمة المرور:</span>
                <span className="font-mono text-amber-300 font-bold" dir="ltr">{newAccountCreatedInfo.password}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#A7B7A7]">صلاحية الحساب:</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  لوحة العميل الخاصة (بيانات معزولة)
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const text = `مرحباً ${newAccountCreatedInfo.clientName}،\nتم تجهيز حسابك الخاص بنظام Moemen Team.\n\nرابط تسجيل الدخول:\n${window.location.origin}/login\nالبريد الإلكتروني:\n${newAccountCreatedInfo.email}\nكلمة المرور:\n${newAccountCreatedInfo.password}\n\nيمكنك تسجيل الدخول ومتابعة حالة مشاريعك والمراحل وكشوفات الحساب المالية في أي وقت.`;
                  navigator.clipboard.writeText(text);
                  showToast("تم نسخ بيانات الدخول إلى الحافظة بنجاح!", "success");
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition-all"
              >
                <Copy size={16} />
                <span>نسخ بيانات الدخول للعميل</span>
              </button>

              <button
                type="button"
                onClick={() => setNewAccountCreatedInfo(null)}
                className="w-full py-2 rounded-xl text-xs text-[#A7B7A7] hover:text-white border border-[#374A3C] hover:bg-gray-800"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PROJECT */}
      {/* ======================================================== */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#1F2A24] border border-[#374A3C] shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#374A3C]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderKanban className="text-emerald-400" size={20} />
                <span>{editingProject ? "تعديل بيانات المشروع" : "إنشاء مشروع جديد"}</span>
              </h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">اسم المشروع *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    placeholder="مثال: تطبيق متجر إلكتروني"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">العميل المرتبط *</label>
                  <select
                    required
                    value={projectForm.clientId}
                    onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">اختر العميل...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">نوع المشروع</label>
                  <select
                    value={projectForm.type}
                    onChange={(e) => setProjectForm({ ...projectForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="website">موقع إلكتروني (Website)</option>
                    <option value="mobile">تطبيق موبايل (Mobile App)</option>
                    <option value="automation">أتمتة وسير عمل (Automation)</option>
                    <option value="desktop">تطبيق سطح المكتب (Desktop App)</option>
                    <option value="email_service">خدمة بريد إلكتروني (Email Service)</option>
                    <option value="erp">نظام إدارة شامل (ERP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">حالة المشروع</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="requested">طلب جديد (Requested)</option>
                    <option value="in_review">قيد المراجعة (In Review)</option>
                    <option value="in_progress">قيد التنفيذ (In Progress)</option>
                    <option value="completed">مكتمل (Completed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">الميزانية (EGP)</label>
                  <input
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                    placeholder="مثال: 120000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">المدفوع مبدئياً (EGP)</label>
                  <input
                    type="number"
                    value={projectForm.paid}
                    onChange={(e) => setProjectForm({ ...projectForm, paid: e.target.value })}
                    placeholder="مثال: 50000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">المدة الإجمالية (أيام)</label>
                  <input
                    type="number"
                    value={projectForm.totalDays}
                    onChange={(e) => setProjectForm({ ...projectForm, totalDays: parseInt(e.target.value) || 30 })}
                    placeholder="مثال: 60"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Progress Slider */}
              <div className="p-3 rounded-xl bg-[#374A3C]/30 border border-[#374A3C]/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">نسبة إنجاز المشروع:</span>
                  <span className="font-bold text-emerald-400">{projectForm.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={projectForm.progress}
                  onChange={(e) => setProjectForm({ ...projectForm, progress: parseInt(e.target.value) || 0 })}
                  className="w-full h-2.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">وسم الإصدار (Version)</label>
                  <input
                    type="text"
                    value={projectForm.versionLabel}
                    onChange={(e) => setProjectForm({ ...projectForm, versionLabel: e.target.value })}
                    placeholder="مثال: v1.0 Release"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">ملاحظة الإصدار</label>
                  <input
                    type="text"
                    value={projectForm.versionNote}
                    onChange={(e) => setProjectForm({ ...projectForm, versionNote: e.target.value })}
                    placeholder="مثال: تم إطلاق النسخة التجريبية"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">وصف المشروع ومجال العمل</label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="وصف تفصيلي لمتطلبات ومميزات المشروع..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#374A3C]">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-[#374A3C] text-[#A7B7A7] hover:bg-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40"
                >
                  {editingProject ? "حفظ التعديلات" : "إنشاء المشروع"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PROJECT STAGES CONTROLLER */}
      {/* ======================================================== */}
      {isStagesModalOpen && targetProjectForStages && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-xl my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#1F2A24] border border-[#374A3C] shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#374A3C]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="text-emerald-400" size={20} />
                  <span>إدارة وتطور مراحل: {targetProjectForStages.name}</span>
                </h3>
                <p className="text-xs text-[#A7B7A7] mt-1">
                  يمكنك تبديل حالة أي مرحلة بالضغط عليها، أو إضافة مرحلة جديدة للمشروع.
                </p>
              </div>
              <button
                onClick={() => setIsStagesModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stages List */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {(targetProjectForStages.stages || []).map((stage, idx) => {
                const isDone = stage.status === "done";
                const isCurrent = stage.status === "current";
                return (
                  <div
                    key={stage.id || idx}
                    className="p-3.5 rounded-xl bg-[#374A3C]/30 border border-[#374A3C] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-800 text-gray-300 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-white text-sm">{stage.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCycleStageStatus(targetProjectForStages.id, stage)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                          isDone
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900"
                            : isCurrent
                            ? "bg-blue-950/80 text-blue-300 border-blue-500/50 hover:bg-blue-900 animate-pulse"
                            : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
                        }`}
                      >
                        {isDone && <Check size={13} className="text-emerald-400" />}
                        {isCurrent && <Clock size={13} className="text-blue-400" />}
                        <span>
                          {isDone ? "مكتمل (Done)" : isCurrent ? "جاري العمل (Current)" : "معلق (Pending)"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Stage Input */}
            <div className="pt-3 border-t border-[#374A3C]">
              <label className="block text-xs font-semibold text-[#A7B7A7] mb-1.5">+ إضافة مرحلة جديدة:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="new_stage_input"
                  placeholder="اسم المرحلة (مثال: ربط بوابة الدفع)..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value;
                      handleAddStage(targetProjectForStages.id, val);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("new_stage_input") as HTMLInputElement;
                    if (el && el.value) {
                      handleAddStage(targetProjectForStages.id, el.value);
                      el.value = "";
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  إضافة
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsStagesModalOpen(false)}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-[#374A3C] text-white hover:bg-gray-700"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD PAYMENT */}
      {/* ======================================================== */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-md my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#1F2A24] border border-[#374A3C] shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#374A3C]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="text-teal-400" size={20} />
                <span>تسجيل دفعة مالية</span>
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">المشروع المستهدف *</label>
                <select
                  required
                  value={paymentForm.projectId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, projectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">اختر المشروع...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.client?.name || "بدون عميل"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">المبلغ المحصل (EGP) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="مثال: 30000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">طريقة الدفع</label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Bank Transfer">تحويل بنكي (Bank Transfer)</option>
                    <option value="InstaPay">إنستاباي (InstaPay)</option>
                    <option value="Vodafone Cash">فودافون كاش (Vodafone Cash)</option>
                    <option value="Cash">نقداً (Cash)</option>
                    <option value="Cheque">شيك مصرفي (Cheque)</option>
                    <option value="Online Gateway">دفع إلكتروني (Online)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">تاريخ الدفعة</label>
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">ملاحظة / بيان الدفعة</label>
                <input
                  type="text"
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  placeholder="مثال: دفعة مقدمة 50% لبدء مرحلة التطوير"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#374A3C]">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-[#374A3C] text-[#A7B7A7] hover:bg-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-900/40"
                >
                  تسجيل الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD NOTE */}
      {/* ======================================================== */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-md my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#1F2A24] border border-[#374A3C] shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#374A3C]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="text-amber-400" size={20} />
                <span>إضافة ملاحظة جديدة</span>
              </h3>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">المشروع المرتبط *</label>
                <select
                  required
                  value={noteForm.projectId}
                  onChange={(e) => setNoteForm({ ...noteForm, projectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">اختر المشروع...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.client?.name || "بدون عميل"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">جهة الملاحظة</label>
                <select
                  value={noteForm.author}
                  onChange={(e) => setNoteForm({ ...noteForm, author: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="team">فريق العمل / الإدارة (Team)</option>
                  <option value="client">العميل (Client)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">نص الملاحظة *</label>
                <textarea
                  required
                  rows={4}
                  value={noteForm.text}
                  onChange={(e) => setNoteForm({ ...noteForm, text: e.target.value })}
                  placeholder="اكتب التحديث أو الملاحظة الخاصة بهذا المشروع..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#374A3C]">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-[#374A3C] text-[#A7B7A7] hover:bg-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-900/40"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW CLIENT PROFILE */}
      {/* ======================================================== */}
      {isClientDetailsOpen && viewingClient && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#1F2A24] border border-[#374A3C] shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#374A3C]">
              <div>
                <h3 className="text-xl font-bold text-white">{viewingClient.name}</h3>
                {viewingClient.company && (
                  <p className="text-xs text-emerald-400 mt-0.5">{viewingClient.company}</p>
                )}
              </div>
              <button
                onClick={() => setIsClientDetailsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-[#374A3C]/30 p-4 rounded-xl border border-[#374A3C]">
              <div>
                <span className="text-[#A7B7A7] block">البريد الإلكتروني:</span>
                <span className="text-white font-medium">{viewingClient.email || "-"}</span>
              </div>
              <div>
                <span className="text-[#A7B7A7] block">رقم الهاتف:</span>
                <span className="text-white font-medium" dir="ltr">{viewingClient.phone || "-"}</span>
              </div>
              <div>
                <span className="text-[#A7B7A7] block">العنوان:</span>
                <span className="text-white font-medium">{viewingClient.address || "-"}</span>
              </div>
              <div>
                <span className="text-[#A7B7A7] block">تاريخ التسجيل:</span>
                <span className="text-white font-medium">{formatDate(viewingClient.createdAt)}</span>
              </div>
            </div>

            {/* Client's Projects */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderKanban size={16} className="text-emerald-400" />
                  <span>مشاريع العميل ({projects.filter((p) => p.clientId === viewingClient.id).length})</span>
                </h4>
                <button
                  onClick={() => {
                    setIsClientDetailsOpen(false);
                    openAddProject(viewingClient.id);
                  }}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  + إضافة مشروع جديد
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {projects
                  .filter((p) => p.clientId === viewingClient.id)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-[#1F2A24] border border-[#374A3C] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{p.name}</span>
                        <span className="text-[#A7B7A7] mt-0.5 block">
                          الميزانية: {formatMoney(p.budget)} • المدفوع: {formatMoney(p.paid)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          {p.progress}%
                        </span>
                        <button
                          onClick={() => {
                            setIsClientDetailsOpen(false);
                            openEditProject(p);
                          }}
                          className="p-1 rounded bg-[#374A3C]/40 text-amber-300"
                          title="تعديل"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                {projects.filter((p) => p.clientId === viewingClient.id).length === 0 && (
                  <p className="text-center py-6 text-xs text-[#A7B7A7]">لا توجد مشاريع مسجلة لهذا العميل.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#374A3C]">
              <button
                onClick={() => setIsClientDetailsOpen(false)}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-[#374A3C] text-white hover:bg-gray-700"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRM DELETE */}
      {/* ======================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-sm my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#1F2A24] border border-rose-900/60 shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <h3 className="text-base font-bold text-white">تأكيد عملية الحذف</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف:{" "}
              <strong className="text-rose-300 block mt-1">{deleteConfirm.name}</strong>
              لا يمكن التراجع عن هذا الإجراء وسيتم مسح كافة البيانات المرتبطة به.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs border border-[#374A3C] text-[#A7B7A7] hover:bg-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === "client") handleDeleteClient(deleteConfirm.id);
                  else if (deleteConfirm.type === "project") handleDeleteProject(deleteConfirm.id);
                  else if (deleteConfirm.type === "payment") handleDeletePayment(deleteConfirm.id);
                  else if (deleteConfirm.type === "note" && deleteConfirm.projectId) {
                    handleDeleteNote(deleteConfirm.projectId, deleteConfirm.id);
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/40"
              >
                نعم، احذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PROJECT EXTENSIONS & MERGE MANAGEMENT */}
      {/* ======================================================== */}
      {managingProjectExtensions && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-3xl my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#1F2A24] border border-purple-500/40 shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#374A3C]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <GitMerge size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {lang === "ar" ? "مراحل تطوير وتوسيع المشروع (Evolution & Merge)" : "Project Scope Extensions & Merge"}
                  </h3>
                  <p className="text-xs text-[#A7B7A7]">
                    {lang === "ar" ? "المشروع الأساسي:" : "Base Project:"} <strong className="text-white">{managingProjectExtensions.name}</strong>
                    {managingProjectExtensions.client && (
                      <span> ({managingProjectExtensions.client.name})</span>
                    )}
                    <span className="mx-2">•</span>
                    <span>{lang === "ar" ? "الإصدار الحالي:" : "Current Version:"} </span>
                    <strong className="text-emerald-400 font-mono">{managingProjectExtensions.versionLabel || "v1.0"}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManagingProjectExtensions(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Base Project Financial Stats */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-black/30 border border-[#374A3C] text-center text-xs">
              <div>
                <span className="text-[10px] text-[#A7B7A7] block">{lang === "ar" ? "ميزانية المشروع الأساسي" : "Base Budget"}</span>
                <span className="font-bold text-white text-sm">{formatMoney(managingProjectExtensions.budget)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#A7B7A7] block">{lang === "ar" ? "إجمالي المسدد حتى الآن" : "Total Paid"}</span>
                <span className="font-bold text-emerald-400 text-sm">{formatMoney(managingProjectExtensions.paid)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#A7B7A7] block">{lang === "ar" ? "حالة المشروع الأساسي" : "Base Status"}</span>
                <span className="font-bold text-teal-300 text-sm">{managingProjectExtensions.status}</span>
              </div>
            </div>

            {/* Extensions List */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>{lang === "ar" ? "طلبات ومراحل التطوير الإضافية:" : "Development Requests & Extensions:"}</span>
                <span className="text-xs text-[#A7B7A7]">({extensionList.length} {lang === "ar" ? "مرحلة" : "phases"})</span>
              </h4>

              {loadingExtensions ? (
                <div className="p-8 text-center text-emerald-400">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                  <span className="text-xs">{lang === "ar" ? "جاري تحميل مراحل التطوير..." : "Loading extensions..."}</span>
                </div>
              ) : extensionList.length === 0 ? (
                <div className="p-8 text-center text-[#A7B7A7] rounded-xl border border-[#374A3C] bg-[#141E18]">
                  {lang === "ar"
                    ? "لا توجد طلبات تطوير جديدة مسجلة لهذا المشروع حتى الآن."
                    : "No development extension requests found for this project yet."}
                </div>
              ) : (
                extensionList.map((ext) => {
                  const isMerged = ext.status === "merged";
                  return (
                    <div
                      key={ext.id}
                      className={`p-4 rounded-xl border space-y-4 transition-all ${
                        isMerged
                          ? "bg-black/40 border-gray-700/60 opacity-80"
                          : "bg-[#141E18] border-purple-500/40 shadow-lg"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-white text-base">{ext.title}</h4>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
                                isMerged
                                  ? "bg-gray-800 text-gray-300 border-gray-600"
                                  : ext.status === "completed"
                                  ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                                  : "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              }`}
                            >
                              {isMerged
                                ? (lang === "ar" ? "تم الدمج في المشروع (Merged)" : "Merged into Base Project")
                                : ext.status}
                            </span>
                            {ext.versionTarget && (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-200 border border-purple-700/40 font-mono">
                                {ext.versionTarget}
                              </span>
                            )}
                          </div>
                          {ext.description && (
                            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{ext.description}</p>
                          )}
                        </div>

                        {/* Merge Button */}
                        {!isMerged && (
                          <button
                            onClick={() => handleAdminMergeExtension(ext.id)}
                            disabled={isMergingExtId === ext.id}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/40 flex items-center gap-1.5 shrink-0 transition-all disabled:opacity-50"
                          >
                            <GitMerge size={15} />
                            <span>{isMergingExtId === ext.id ? (lang === "ar" ? "جاري الدمج..." : "Merging...") : (lang === "ar" ? "🔀 دمج في المشروع الأساسي" : "Merge into Base Project")}</span>
                          </button>
                        )}
                      </div>

                      {/* Progress & Financials for this Extension */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg bg-[#1F2A24] border border-[#374A3C]">
                        {/* Progress slider */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#A7B7A7] font-semibold">{lang === "ar" ? "نسبة إنجاز التطوير (كام في الميه):" : "Progress %:"}</span>
                            <strong className="text-purple-300 font-bold">{ext.progress}%</strong>
                          </div>
                          {!isMerged ? (
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={ext.progress}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setExtensionList((prev) =>
                                  prev.map((item) => (item.id === ext.id ? { ...item, progress: val } : item))
                                );
                              }}
                              onMouseUp={(e) => updateExtensionProgress(ext.id, parseInt((e.target as any).value))}
                              onTouchEnd={(e) => updateExtensionProgress(ext.id, parseInt((e.target as any).value))}
                              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                          ) : (
                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${ext.progress}%` }}></div>
                            </div>
                          )}
                          {!isMerged && (
                            <div className="flex items-center justify-between gap-1 pt-1">
                              <span className="text-[10px] text-[#A7B7A7]">{lang === "ar" ? "تحديد سريع:" : "Quick steps:"}</span>
                              <div className="flex gap-1 text-[10px]">
                                {[0, 25, 50, 75, 100].map((step) => (
                                  <button
                                    key={step}
                                    onClick={() => updateExtensionProgress(ext.id, step)}
                                    className={`px-1.5 py-0.5 rounded border ${
                                      ext.progress === step
                                        ? "bg-purple-600 text-white border-purple-400 font-bold"
                                        : "bg-[#374A3C]/40 text-[#A7B7A7] border-[#374A3C]"
                                    }`}
                                  >
                                    {step}%
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Financials for Extension */}
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="p-2 rounded bg-black/30 border border-[#374A3C]/50">
                            <span className="text-[10px] text-[#A7B7A7] block">{lang === "ar" ? "ميزانية التطوير" : "Extension Budget"}</span>
                            <strong className="text-white font-mono">{formatMoney(ext.budget)}</strong>
                          </div>
                          <div className="p-2 rounded bg-black/30 border border-[#374A3C]/50">
                            <span className="text-[10px] text-[#A7B7A7] block">{lang === "ar" ? "المسدد منها" : "Extension Paid"}</span>
                            <strong className="text-emerald-400 font-mono">{formatMoney(ext.paid)}</strong>
                          </div>
                        </div>
                      </div>

                      {isMerged && ext.mergedAt && (
                        <p className="text-[11px] text-[#A7B7A7] flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-400" />
                          <span>
                            {lang === "ar"
                              ? `تم دمج هذا التطوير بنجاح بتاريخ ${formatDate(ext.mergedAt)} وإضافته إلى حسابات المشروع الأساسي.`
                              : `Merged into base project on ${formatDate(ext.mergedAt)}.`}
                          </span>
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-[#374A3C]">
              <button
                onClick={() => {
                  setManagingProjectExtensions(null);
                  loadAllData(false);
                }}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-[#374A3C] text-white hover:bg-gray-700"
              >
                {lang === "ar" ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PHOTO LIGHTBOX */}
      {/* ======================================================== */}
      {viewingPhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setViewingPhotoUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setViewingPhotoUrl(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-rose-400 text-sm font-bold flex items-center gap-1"
            >
              <X size={20} />
              <span>{lang === "ar" ? "إغلاق" : "Close"}</span>
            </button>
            <img
              src={viewingPhotoUrl}
              alt="Enlarged issue"
              className="max-w-full max-h-[80vh] rounded-xl border border-gray-700 shadow-2xl object-contain bg-black"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADMIN NOTE / RESOLUTION NOTE */}
      {/* ======================================================== */}
      {adminNoteModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-lg my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl bg-[#1F2A24] border border-[#374A3C] shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#374A3C]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="text-amber-400" size={18} />
                <span>{lang === "ar" ? "ملاحظات وتفاصيل حل العطل" : "Issue Resolution Notes"}</span>
              </h3>
              <button
                onClick={() => setAdminNoteModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A7B7A7] mb-1">
                {lang === "ar" ? "الملاحظات الفنية وخطوات الحل:" : "Resolution Steps & Technical Notes:"}
              </label>
              <textarea
                rows={4}
                value={adminNoteModal.notes}
                onChange={(e) => setAdminNoteModal({ ...adminNoteModal, notes: e.target.value })}
                placeholder={lang === "ar" ? "اكتب هنا تفاصيل إصلاح المشكلة للعميل..." : "Describe how the issue was resolved..."}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#374A3C]/40 border border-[#374A3C] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#374A3C]">
              <button
                onClick={() => setAdminNoteModal(null)}
                className="px-4 py-2 rounded-xl text-xs border border-[#374A3C] text-[#A7B7A7] hover:bg-gray-800"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={saveIssueAdminNotes}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-900/40"
              >
                {lang === "ar" ? "حفظ الملاحظات" : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROJECT DELIVERY & HANDOVER MANAGEMENT */}
      {managingDeliveryProject && (
        <AdminDeliveryModal
          isOpen={!!managingDeliveryProject}
          onClose={() => setManagingDeliveryProject(null)}
          project={managingDeliveryProject}
          deliveryData={deliveryDataForModal}
          onSaved={async () => {
            await loadAllData(false);
            setManagingDeliveryProject(null);
          }}
          lang={lang as any}
        />
      )}
    </div>
  );
}
