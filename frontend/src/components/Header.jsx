import React, { useState } from "react";
import { Menu, Search, Bell, GraduationCap, ShieldAlert, X, Check } from "lucide-react";

export default function Header({
  activeTab,
  setActiveTab,
  user,
  setIsMobileOpen,
  onOpenAuth,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const notifications = [
    {
      id: 1,
      title: "Welcome to AI Study Assistant! 📚",
      message: "Start learning by typing a topic in the Ask AI tab or asking questions to the AI mentor.",
      time: "Just now",
      unread: true,
    },
    {
      id: 2,
      title: "Study Tracker Active ⏱️",
      message: "Keep up the great work! Your academic dashboard is synchronized.",
      time: "10 mins ago",
      unread: false,
    }
  ];

  return (
    <header className="sticky top-0 bg-white border-b border-slate-200/80 z-20 px-4 py-2.5 sm:px-6 sm:py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Trigger & Figma Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search Bar matching screenshot 3, 5, 6 */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-4.5 w-4.5 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/80 hover:bg-slate-100/50 text-slate-800 placeholder-slate-400 text-sm border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-xxs"
          />
        </div>
      </div>

      {/* Right: Notifications & Student Profile Badge */}
      <div className="flex items-center gap-4.5 shrink-0 relative">
        {/* Notification Bell with dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (!isNotificationsOpen) {
                setUnreadCount(0); // Mark as read on open
              }
            }}
            className={`p-2 rounded-full transition-all cursor-pointer border ${
              isNotificationsOpen 
                ? "bg-blue-50 text-blue-600 border-blue-100" 
                : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-100"
            }`}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border border-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Overlay */}
          {isNotificationsOpen && (
            <>
              {/* Invisible Backdrop to close on outside click */}
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setIsNotificationsOpen(false)}
              />
              
              <div className="absolute right-0 mt-2.5 w-80 sm:w-85 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 py-3 animate-in fade-in slide-in-from-top-3 duration-150 origin-top-right">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <span className="font-sans font-bold text-slate-900 text-sm">Notifications</span>
                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="max-h-64 overflow-y-auto mt-1">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className="px-4 py-3 hover:bg-slate-50/80 transition-colors flex gap-3 border-b border-slate-50 last:border-b-0"
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className={`h-2.5 w-2.5 rounded-full mt-1.5 ${notif.unread && unreadCount > 0 ? "bg-blue-500" : "bg-slate-300"}`} />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-sans font-bold text-xs text-slate-800 leading-snug">
                          {notif.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-slate-400 font-medium block">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="px-4 pt-2 mt-1 text-center border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-medium">All notifications caught up</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Card matching screenshot 3 exactly */}
        {user ? (
          <button
            onClick={() => setActiveTab?.("profile")}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-all text-left"
          >
            <div className="text-right hidden md:block">
              <h4 className="font-sans font-bold text-slate-950 text-xs tracking-tight leading-tight">
                {user.fullName}
              </h4>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
                Student
              </span>
            </div>
            {/* Round Avatar with online status */}
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-blue-600 border border-blue-100 flex items-center justify-center text-white font-bold font-sans text-xs shadow-sm">
                  {user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-100 transition-all cursor-pointer shadow-xs"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Connect Profile</span>
          </button>
        )}
      </div>
    </header>
  );
}
