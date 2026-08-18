import React, { useState, useEffect } from "react";
import api from "./services/api";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import AIChat from "./components/AIChat";
import Summarizer from "./components/Summarizer";
import Quizzes from "./components/Quizzes";
import Profile from "./components/Profile";
import Planner from "./components/Planner";
import {
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  Brain,
  MessageSquare,
  FileText,
  Clock,
  Plus,
  Compass,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Shared state: Default tasks matching the screens perfectly
  const [tasks, setTasks] = useState([]);

  // Shared state: Default study slots matching the screens perfectly
  const [slots, setSlots] = useState([]);

  const [dashboardTodoInputOpen, setDashboardTodoInputOpen] = useState(false);
  const [dashboardTodoText, setDashboardTodoText] = useState("");

  const handleAddDashboardTodo = async (e) => {
    e.preventDefault();

    if (!dashboardTodoText.trim()) return;

    try {
      const res = await api.post("/tasks", {
        text: dashboardTodoText,
      });

      setTasks([res.data.task, ...tasks]);

      setDashboardTodoText("");
      setDashboardTodoInputOpen(false);

      triggerToast("Upcoming task added successfully!");
    } catch (err) {
      console.log(err);
      triggerToast("Failed to add task", "error");
    }
  };

  // Student profile state preloaded as Alex Johnson to match student requirements!
  const [user, setUser] = useState(() => {
    const loggedOut = localStorage.getItem("scholar_student_logged_out");
    if (loggedOut === "true") {
      return null;
    }
    const saved = localStorage.getItem("scholar_student_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email === "nazmulemon24@gmail.com" || parsed.fullName === "Nazmul Lemon") {
          localStorage.removeItem("scholar_student_user");
        } else {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
  });

  // Automatically open auth modal if profile is not connected yet
  useEffect(() => {
    if (!user) {
      setIsAuthOpen(true);
    }
  }, [user]);

  //tasks
  useEffect(() => {
    const fetchTasks = async () => {
        if (!user) return;

        try {
            const res = await api.get("/tasks");
            setTasks(res.data.tasks || []);
        } catch (err) {
            console.log(err);
        }
    };

    fetchTasks();
}, [user]);

  //planner
  useEffect(() => {
    const fetchPlanners = async () => {
        if (!user) return;

        try {
            const res = await api.get("/planner");
            console.log(res.data);
            setSlots(res.data.planners || []);
        } catch (err) {
            console.log(err);
        }
    };

    fetchPlanners();
}, [user]);

  // Sync token-based profile from API on mount
  useEffect(() => {
    const syncProfile = async () => {
      const token = localStorage.getItem("scholar_student_token");

      if (!token) return;

      try {
        const response = await api.get("/auth/profile");

        const syncedUser = {
          ...response.data.user,
          fullName: response.data.user.name,
          studentId: "SU-2023-PHY",
          section: "Physics",
          teamName: "Quantum Mechanics Track",
          university: "Stanford University",
          gpa: "3.8 / 4.0",
          bio: "Physics enthusiast dedicated to mastering quantum mechanics and helping peers bridge the gap between theory and practice.",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
        };

        setUser(syncedUser);
        localStorage.setItem(
          "scholar_student_user",
          JSON.stringify(syncedUser)
        );
      } catch (error) {
        console.log(error);
        localStorage.removeItem("scholar_student_token");
        localStorage.removeItem("scholar_student_user");
        setUser(null);
      }
    };

    syncProfile();
  }, []);

  const handleAuthSuccess = (newUser) => {
    localStorage.removeItem("scholar_student_logged_out");
    setUser(newUser);
    localStorage.setItem("scholar_student_user", JSON.stringify(newUser));
    triggerToast(`Welcome back, ${newUser.fullName.split(" ")[0]}!`);
  };

  const handleLogout = () => {
    localStorage.setItem("scholar_student_logged_out", "true");
    localStorage.removeItem("scholar_student_user");
    localStorage.removeItem("scholar_student_token");
    setUser(null);
    setActiveTab("dashboard");
    setIsAuthOpen(true);
    triggerToast("Logged out of student profile.", "info");
  };

  // Render the currently selected tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "chat":
        return <AIChat triggerToast={triggerToast} />;
      case "summarizer":
        return <Summarizer />;
      case "flashcards":
        return <Quizzes />;
      case "planner":
        return (
          <Planner
            tasks={tasks}
            setTasks={setTasks}
            slots={slots}
            setSlots={setSlots}
            triggerToast={triggerToast}
          />
        );
      case "profile":
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  // 1. Dashboard Render matching NUBT CSE 4104 exactly
  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        {/* Welcome Section Banner Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1/3 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
          <div className="max-w-2xl relative z-10 space-y-2">
            <h3 className="font-sans font-extrabold text-2xl md:text-3xl tracking-tight leading-tight">
              Good afternoon, {user ? (user.fullName || user.name).split(" ")[0] : "Alex"}!
            </h3>
            <p className="text-sm text-blue-100 leading-relaxed font-normal">
              What are we mastering today? Your Physics exam is in 3 days—let's keep the momentum going.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab("chat")}
                className="bg-white text-blue-600 hover:bg-slate-50 transition-colors rounded-xl text-xs px-4 py-2 font-bold shadow-sm cursor-pointer"
              >
                Resume Last Lesson
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout split (2/3 and 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Block (2/3 width) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Quick Actions section */}
            <div className="space-y-3.5">
              <h4 className="font-sans font-bold text-slate-800 text-sm tracking-tight">Quick Actions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* New Chat Card */}
                <div
                  onClick={() => setActiveTab("chat")}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-36"
                >
                  <div className="h-9 w-9 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-xxs">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-sans font-extrabold text-slate-900 text-sm leading-tight">New Chat</h5>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Ask anything about your syllabus</p>
                  </div>
                </div>

                {/* Upload Doc Card */}
                <div
                  onClick={() => setActiveTab("summarizer")}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-36"
                >
                  <div className="h-9 w-9 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl flex items-center justify-center shadow-xxs">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-sans font-extrabold text-slate-900 text-sm leading-tight">Upload Doc</h5>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Get summaries from PDFs or images</p>
                  </div>
                </div>

                {/* Create Quiz Card */}
                <div
                  onClick={() => setActiveTab("flashcards")}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-36"
                >
                  <div className="h-9 w-9 bg-pink-50 border border-pink-100 text-pink-600 rounded-xl flex items-center justify-center shadow-xxs">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-sans font-extrabold text-slate-900 text-sm leading-tight">Create Quiz</h5>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Generate mock tests instantly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Summaries section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-sans font-bold text-slate-800 text-sm tracking-tight">Recent Summaries</h4>
                <button
                  onClick={() => setActiveTab("summarizer")}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {/* Item 1 */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xxs flex items-center gap-3.5 hover:bg-slate-50/40 transition-colors">
                  <div className="h-10 w-10 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="h-5.5 w-5.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Quantum_Mechanics_Lecture_04.pdf</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Summarized 2 hours ago • 12 key concepts identified</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xxs flex items-center gap-3.5 hover:bg-slate-50/40 transition-colors">
                  <div className="h-10 w-10 bg-blue-50 text-blue-500 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="h-5.5 w-5.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Modern_World_History_Notes.docx</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Summarized Yesterday • 8 key dates highlighted</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Block (1/3 width) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Daily Progress Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block self-start mb-4">
                Daily Progress
              </span>

              {/* Styled Circular SVG Progress */}
              <div className="relative h-36 w-36 flex items-center justify-center">
                <svg className="absolute inset-0 h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-slate-100" strokeWidth="8.5" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-blue-600"
                    strokeWidth="8.5"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - 0.75)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center space-y-0.5 relative z-10">
                  <span className="text-2xl font-black text-slate-900 block leading-none">75%</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Complete</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center leading-relaxed mt-5 px-1 font-medium">
                Almost there! Only 45 minutes left to hit your daily goal.
              </p>

              <div className="mt-4.5 px-3 py-1 bg-amber-50 text-amber-600 font-extrabold text-[10px] rounded-full tracking-wider border border-amber-100 uppercase">
                STREAK: 12 DAYS
              </div>
            </div>

            {/* Upcoming Tasks Card matching Image 3 */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-sans font-bold text-slate-800 text-sm tracking-tight">
                  Upcoming Tasks
                </h4>
                <button
                  onClick={() => setDashboardTodoInputOpen(!dashboardTodoInputOpen)}
                  className="h-6 w-6 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  title="Add new upcoming task"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Inline Add Task Form */}
              <AnimatePresence>
                {dashboardTodoInputOpen && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddDashboardTodo}
                    className="overflow-hidden space-y-2 pb-1"
                  >
                    <input
                      type="text"
                      placeholder="e.g. History Quiz: Cold War Era"
                      autoFocus
                      value={dashboardTodoText}
                      onChange={(e) => setDashboardTodoText(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDashboardTodoInputOpen(false)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] rounded-lg font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] rounded-lg font-bold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Task Items List */}
              <div className="space-y-4.5">
                {tasks.filter(t => !t.completed).length > 0 ? (
                  tasks.filter(t => !t.completed).map((todo, idx) => {
                    const dotColors = ["bg-purple-600", "bg-blue-600", "bg-indigo-600", "bg-pink-600"];
                    const dotColor = dotColors[idx % dotColors.length];

                    return (
                      <div
                        key={todo._id}
                        className="flex items-start gap-3.5 group relative cursor-pointer"
                        onClick={ async() => {
                          const res = await api.put(`/tasks/${todo._id}`, {
                            completed: true
                          });

                          setTasks(
                            tasks.map(t =>
                              t._id === todo._id ? res.data.task : t
                            )
                          );
                          triggerToast("Task completed! Settle status synchronized.");
                        }}
                        title="Click to mark as complete"
                      >
                        {/* Dot Indicator */}
                        <div className={`h-2.5 w-2.5 rounded-full ${dotColor} shrink-0 mt-1`} />

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
                            {todo.text}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {todo.date}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">
                    All upcoming tasks are complete!
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // 2. Profile/Settings Page
  const renderProfile = () => {
    return (
      <Profile
        user={user}
        onUpdateUser={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem("scholar_student_user", JSON.stringify(updatedUser));
        }}
        onLogout={handleLogout}
        triggerToast={triggerToast}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
    );
  };

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar (Desktop and Mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        triggerToast={triggerToast}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          setIsMobileOpen={setIsMobileSidebarOpen}
          onOpenAuth={() => setIsAuthOpen(true)}
          triggerToast={triggerToast}
        />

        {/* Scrollable View Area */}
        <main className={`flex-1 flex flex-col min-h-0 min-w-0 ${activeTab === "chat" ? "overflow-hidden p-3 sm:p-6" : "overflow-y-auto p-4 sm:p-6"} scrollbar-thin`}>
          <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col min-h-0 min-w-0">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Auth Modal Trigger */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={user ? () => setIsAuthOpen(false) : undefined}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Global Toast Component */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-slate-800 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold"
          >
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Minimal arrow icons
function ArrowRight(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={props.className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
