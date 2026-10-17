"use client";

import { Bell, Search, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function Topbar() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center bg-gray-800 rounded-lg px-3 py-1.5 w-64">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="بحث..." 
          className="bg-transparent border-none focus:outline-none text-sm text-white px-2 w-full"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white relative">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
            3
          </span>
        </button>
        
        <div className="h-8 w-px bg-gray-700 mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-white">{session?.user?.name || "المستخدم"}</p>
            <p className="text-xs text-gray-400">{(session?.user as any)?.role || "Admin"}</p>
          </div>
          <button 
            onClick={() => signOut()}
            className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white"
          >
            <User size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
