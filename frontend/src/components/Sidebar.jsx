import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  MessageSquareCode,
  CalendarCheck,
  FileSpreadsheet,
  Layers,
  User,
  GraduationCap,
  LogOut,
  X,
  Settings,
  HelpCircle,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  onOpenAuth,
  isMobileOpen,
  setIsMobileOpen,
  triggerToast,
}) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "chat", label: "Ask AI", icon: MessageSquareCode },
    { id: "summarizer", label: "Summarizer", icon: FileSpreadsheet },
    { id: "flashcards", label: "Quizzes", icon: Layers },
    { id: "planner", label: "Planner", icon: CalendarCheck },
  ];

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-800 border-r border-slate-200">
      {/* Brand & Logo matching screenshot 3 */}
      <div className="p-6 pb-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/10">
          <Layers className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-lg tracking-tight text-blue-600 leading-none">AI Study Assistant</h1>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-1">Academic Mentor</span>
        </div>
      </div>

      {/* Navigation Items (White Cards styled in screenshots) */}
      <nav className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`sidebar-tab-${item.id}`}
              onClick={() => handleTabSelect(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-100 shadow-xs hover:border-slate-200"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Settings, Support and Profile info */}
      <div className="p-4 border-t border-slate-200 bg-white space-y-2">
        {/* Settings and Support items */}
        <button
          onClick={() => handleTabSelect("profile")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <Settings className="h-4 w-4 text-slate-400" />
          <span>Setting</span>
        </button>

        <button
          onClick={() => triggerToast?.("Academic Support is active. Email: support@stanford.edu", "info")}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <HelpCircle className="h-4 w-4 text-slate-400" />
          <span>Support</span>
        </button>

        {user ? (
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            {/* Clickable user card -> Profile tab */}
            <button
              onClick={() => handleTabSelect("profile")}
              className="flex-1 flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-all cursor-pointer"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold font-sans text-xs shrink-0">
                  {user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">{user.fullName}</p>
                <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">Student</p>
              </div>
            </button>

            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            id="sidebar-auth-btn"
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-600/10 cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span>Connect Profile</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 flex-shrink-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (Overlay) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/40"
            />

            {/* Drawer Body */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="relative w-72 max-w-sm h-full flex flex-col z-50 shadow-2xl"
            >
              <SidebarContent />
              {/* Close Button Inside Drawer */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 -right-12 h-9 w-9 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
