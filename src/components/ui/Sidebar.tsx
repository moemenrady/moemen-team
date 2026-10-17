"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  FileText, 
  Settings,
  Receipt,
  MessageSquare,
  ShieldCheck
} from "lucide-react";
import { useSession } from "next-auth/react";

const baseNavItems = [
  { name: "الرئيسية", href: "/", icon: LayoutDashboard },
  { name: "المشاريع", href: "/projects", icon: FolderKanban },
  { name: "العملاء", href: "/clients", icon: Users },
  { name: "الفواتير", href: "/invoices", icon: Receipt },
  { name: "عروض الأسعار", href: "/quotations", icon: FileText },
  { name: "الرسائل", href: "/messages", icon: MessageSquare },
  { name: "الإعدادات", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";

  const navItems = isAdminOrManager
    ? [
        { name: "تحكم الإدارة", href: "/admin", icon: ShieldCheck, badge: "إدارة" },
        ...baseNavItems,
      ]
    : baseNavItems;

  return (
    <aside className="w-64 bg-gray-900 border-l border-gray-800 h-screen fixed right-0 top-0 flex flex-col">
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-primary-400 font-cairo">Moemen Team</h1>
        {isAdminOrManager && (
          <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
            {role === "ADMIN" ? "ADMIN" : "MANAGER"}
          </span>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-primary-600/10 text-primary-400" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
