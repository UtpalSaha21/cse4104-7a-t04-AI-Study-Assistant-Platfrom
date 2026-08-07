import React, { useState, useEffect } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Trash2,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function Planner({
  tasks,
  setTasks,
  slots,
  setSlots,
  triggerToast,
}) {
  const [newFocus, setNewFocus] = useState("");
  const [newDay, setNewDay] = useState("Mon");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDuration, setNewDuration] = useState("14:00 - 15:30");

  const [todoInputOpen, setTodoInputOpen] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  useEffect(() => {

    const loadPlanner = async () => {

      try {

        const res = await api.get("/planner");

        setSlots(res.data.planners);

      } catch (err) {

        console.log(err);

      }

    };

    loadPlanner();

  }, []);

  // Dates handling: Let's default to October 2026 starting from Oct 14 as in the screenshot
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 14)); // October 14, 2026

  const getWeekDays = (start) => {
    const days = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      // In JS, 0 is Sunday, 1 is Monday... so we map our Monday-start grid
      // Let's calculate the offset
      date.setDate(start.getDate() + i);
      days.push({
        name: dayNames[i],
        dayOfMonth: date.getDate(),
        fullDate: date,
      });
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  const formatWeekRange = () => {
    const start = weekDays[0].fullDate;
    const end = weekDays[6].fullDate;
    const months = [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec"
    ];
    return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const formatMonthYear = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  // Add study slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newFocus.trim()) {
      triggerToast("Please provide a lesson focus name.", "error");
      return;
    }
    if (!newDuration.trim()) {
      triggerToast("Please provide a time duration.", "error");
      return;
    }

    const newSlot = {
      id: "slot_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      day: newDay,
      title: newFocus.trim(),
      time: newDuration.trim(),
      priority: newPriority,
    };

    try {

      const res = await api.post("/planner", {
        title: newFocus,
        day: newDay,
        time: newDuration,
        priority: newPriority
      });

      setSlots([res.data.planner, ...slots]);

    } catch (err) {

      console.log(err);

    }
    setNewFocus("");
    triggerToast("Study block scheduled successfully!");
  };

  const handleDeleteSlot = async (id) => {
    await api.delete(`/planner/${id}`);

    setSlots(slots.filter((s) => s._id !== id));
    triggerToast("Study block removed.");
  };
  const handleDeleteTask = async (id) => {

    try {

      await api.delete(`/tasks/${id}`);

      setTasks(tasks.filter((t) => t._id !== id));

      triggerToast("Task deleted.");

    } catch (err) {

      console.log(err);

      triggerToast("Failed to delete task", "error");

    }

  };

  // Add task to Smart To Do List
  const handleAddTodo = async (e) => {
    e.preventDefault();
    console.log("handleAddTodo called");

    if (!newTodoText.trim()) return;

    try {

      const res = await api.post("/tasks", {
        text: newTodoText
      });

      console.log(res.data);

      setTasks([res.data.task, ...tasks]);

      setNewTodoText("");
      setTodoInputOpen(false);

      triggerToast("Task added!");

    } catch (err) {

      console.log(err);
      triggerToast("Failed to add task", "error");

    }
  };

  const toggleTodo = async (task) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });

      setTasks(
        tasks.map((t) =>
          t._id === task._id ? res.data.task : t
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleOptimizeSchedule = () => {
    triggerToast("AI is optimizing your schedule slots based on syllabus priority...", "info");
    setTimeout(() => {
      // Re-sort slots by priority (High first, then Medium, then Low)
      const priorityOrder = { High: 1, Medium: 2, Low: 3 };
      const sorted = [...slots].sort((a, b) => {
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      });
      setSlots(sorted);
      triggerToast("Schedule optimized by AI! High-priority modules aligned first.");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-sans font-extrabold text-2xl text-slate-800 tracking-tight leading-none">
            Weekly Study Horizon
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1.5">
            Optimize your preparation roadmap and balance active testing blocks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Week Calendar Grid (8/12 on large screens) */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5">

          {/* Calendar Controller (Month name & week navigator) */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-sans font-extrabold text-slate-900 text-lg md:text-xl">
              {formatMonthYear()}
            </h3>

            {/* Week navigation buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevWeek}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-slate-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-bold text-slate-600 lowercase bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg">
                {formatWeekRange()}
              </span>
              <button
                onClick={handleNextWeek}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-slate-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Desktop Week Grid View (Visible on medium screens and up) */}
          <div className="hidden md:grid grid-cols-7 gap-2 min-h-[380px]">
            {weekDays.map((day) => {
              const daySlots = slots.filter(
                (s) => s.day && s.day.toLowerCase() === day.name.toLowerCase()
              );
              return (
                <div
                  key={day.name}
                  className="flex flex-col border border-slate-100 rounded-xl bg-slate-50/40 p-2 min-h-full"
                >
                  {/* Day Header */}
                  <div className="text-center py-1 pb-2 border-b border-slate-100 mb-2">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                      {day.name}
                    </p>
                    <p className="text-sm font-black text-slate-800">
                      {day.dayOfMonth}
                    </p>
                  </div>

                  {/* Day Slots List */}
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[320px] scrollbar-none">
                    <AnimatePresence initial={false}>
                      {daySlots.length > 0 ? (
                        daySlots.map((slot) => {
                          let priorityColor = "border-blue-300 bg-blue-50/20";
                          if (slot.priority === "High") {
                            priorityColor = "border-purple-300 bg-purple-50/20";
                          } else if (slot.priority === "Low") {
                            priorityColor = "border-emerald-300 bg-emerald-50/20";
                          }

                          return (
                            <motion.div
                              key={slot._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className={`border ${priorityColor} p-2 rounded-xl text-left relative group hover:shadow-xs transition-all`}
                            >
                              <p className="text-[10px] font-bold text-slate-800 leading-tight pr-4">
                                {slot.title}
                              </p>
                              <p className="text-[9px] text-slate-500 font-medium mt-1">
                                {slot.time}
                              </p>

                              {/* Hover Delete Button */}
                              <button
                                onClick={() => handleDeleteSlot(slot._id)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                                title="Delete study block"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-300 text-[10px] py-10 font-medium">
                          Empty
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bottom static visual indicator pillar */}
                  <div className="h-1 bg-slate-200/60 rounded-full w-2/3 mx-auto mt-2" />
                </div>
              );
            })}
          </div>

          {/* Mobile List View (Visible on small screens only, matching image 1 perfectly) */}
          <div className="block md:hidden space-y-4">
            {weekDays.map((day) => {
              const daySlots = slots.filter(
                (s) => s.day.toLowerCase() === day.name.toLowerCase()
              );
              return (
                <div
                  key={`mob-${day.name}`}
                  className="bg-white border border-slate-100 rounded-xl p-3 shadow-xxs space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                      {day.name} ({day.dayOfMonth})
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {daySlots.length} block{daySlots.length !== 1 && "s"}
                    </span>
                  </div>

                  {daySlots.length > 0 ? (
                    <div className="space-y-2">
                      {daySlots.map((slot) => {
                        let priorityColor = "border-blue-400 text-slate-800 bg-slate-50";
                        if (slot.priority === "High") {
                          priorityColor = "border-indigo-400 text-slate-800 bg-slate-50";
                        } else if (slot.priority === "Low") {
                          priorityColor = "border-emerald-400 text-slate-800 bg-slate-50";
                        }
                        return (
                          <div
                            key={`mob-${slot._id}`}
                            className={`border-l-4 ${priorityColor} px-3 py-2 rounded-r-lg flex items-center justify-between gap-2 shadow-xxs`}
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {slot.title}
                              </p>
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                {slot.time}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteSlot(slot._id)}
                              className="p-1 rounded text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic py-1 pl-1">
                      No study blocks scheduled for this day.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Action Sidebars (4/12 width) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Form: Schedule Study Slot (Image 2) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="font-sans font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-blue-500" />
              <span>Schedule Study Slot</span>
            </h4>

            <form onSubmit={handleAddSlot} className="space-y-3.5">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Lesson Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fluids Mechanics Lab"
                  value={newFocus}
                  onChange={(e) => setNewFocus(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Settle Day
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white text-slate-800 cursor-pointer"
                  >
                    <option value="Mon">Mon</option>
                    <option value="Tue">Tue</option>
                    <option value="Wed">Wed</option>
                    <option value="Thu">Thu</option>
                    <option value="Fri">Fri</option>
                    <option value="Sat">Sat</option>
                    <option value="Sun">Sun</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Priority factor
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-white text-slate-800 cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Time Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 14:00 - 15:30"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Add Study Block
              </button>
            </form>
          </div>

          {/* Smart To Do List (Image 2) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-sans font-bold text-slate-800 text-sm tracking-tight">
                Smart To Do List
              </h4>
              <button
                onClick={() => setTodoInputOpen(!todoInputOpen)}
                className="h-6 w-6 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                title="Add new checklist item"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Inline Add To-Do Field */}
            <AnimatePresence>
              {todoInputOpen && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddTodo}
                  className="overflow-hidden space-y-2 pb-2"
                >
                  <input
                    type="text"
                    placeholder="Enter task description..."
                    autoFocus
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-slate-800"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTodoInputOpen(false)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] rounded-lg font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] rounded-lg font-bold cursor-pointer"
                    >
                      Save Task
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* ToDo List Items */}
            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {tasks.map((todo) => (
                  <motion.div
                    key={todo._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 group"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTodo(todo)}
                      className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${todo.completed
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "border-slate-300 hover:border-slate-400 bg-white"
                        }`}
                    >
                      {todo.completed && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium text-slate-700 leading-tight ${todo.completed
                          ? "line-through text-slate-400"
                          : ""
                          }`}
                      >
                        {todo.text}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                        {todo.date}
                      </p>
                    </div>

                    {/* Quick Delete option */}
                    <button
                      onClick={async () => {
                        await api.delete(`/tasks/${todo._id}`);

                        setTasks(tasks.filter((t) => t._id !== todo._id));
                        triggerToast("Task deleted.");
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Optimize Button with fine tuning gradient design */}
            <button
              onClick={handleOptimizeSchedule}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Let AI Optimize My Schedule</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
