import React, { useState } from "react";
import api from "../services/api";
import {
  User,
  Mail,
  BookOpen,
  GraduationCap,
  Award,
  Briefcase,
  Settings,
  Lock,
  Bell,
  Share2,
  Plus,
  Camera,
  Save,
  X,
  Edit3,
  CheckCircle,
  HelpCircle,
  LogOut
} from "lucide-react";

export default function Profile({ user, onUpdateUser, onLogout, triggerToast, onOpenAuth }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "Alex Johnson",
    email: user?.email || "student@university.edu",
    studentId: user?.studentId || "SU-2023-PHY",
    section: user?.section || "Physics",
    university: user?.university || "Stanford University",
    gpa: user?.gpa || "3.8 / 4.0",
    bio: user?.bio || "Physics enthusiast dedicated to mastering quantum mechanics.",
    avatarUrl: user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      triggerToast("Full name is required");
      return;
    }

    if (password !== confirmPassword) {
      triggerToast("Passwords do not match");
      return;
    }

    try {

      // Update name
      const response = await api.put("/auth/profile", {
        name: formData.fullName
      });

      // Update password (only if user entered one)
      if (password.trim() !== "") {

        await api.put("/auth/change-password", {
          currentPassword,
          newPassword: password
        });

      }

      const updatedUser = {
        ...user,
        ...formData,
        name: response.data.user.name
      };

      onUpdateUser(updatedUser);

      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setIsEditing(false);

      triggerToast("Profile updated successfully!");

    } catch (err) {

      triggerToast(
        err.response?.data?.message || "Update failed"
      );

    }
  };

  const handleSharePortfolio = () => {
    // Generate mock share link
    const shareUrl = `${window.location.origin}/portfolio/${formData.studentId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        triggerToast?.("Shareable portfolio link copied to clipboard!");
      })
      .catch(() => {
        triggerToast?.("Shareable portfolio link compiled successfully.");
      });
  };

  return (
    <div className="space-y-6">
      {/* Title & Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-sans font-black text-2xl text-slate-900 tracking-tight">Student Profile</h3>
          <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
            Manage your personal profile, academic credentials, and study environment configurations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10 cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFormData({
                    fullName: user?.fullName || "Alex Johnson",
                    email: user?.email || "student@university.edu",
                    studentId: user?.studentId || "SU-2023-PHY",
                    section: user?.section || "Physics",
                    university: user?.university || "Stanford University",
                    gpa: user?.gpa || "3.8 / 4.0",
                    bio: user?.bio || "Physics enthusiast dedicated to mastering quantum mechanics.",
                    avatarUrl: user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
                  });
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10 cursor-pointer flex items-center gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
          <button
            onClick={handleSharePortfolio}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xxs flex items-center gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Portfolio</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header card */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            <div className="relative group shrink-0">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt={formData.fullName}
                  referrerPolicy="no-referrer"
                  className="h-24 w-24 rounded-full object-cover border-2 border-slate-200 shadow-md shrink-0"
                />
              ) : (
                <div className="h-24 w-24 bg-blue-600 border border-blue-100 rounded-full flex items-center justify-center text-white text-3xl font-black font-sans shadow-md shrink-0">
                  {formData.fullName.split(" ").map(n => n[0]).join("")}
                </div>
              )}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    const newUrl = prompt("Enter new image URL:", formData.avatarUrl);
                    if (newUrl !== null) {
                      setFormData(prev => ({ ...prev, avatarUrl: newUrl }));
                    }
                  }}
                  className="absolute bottom-0 right-0 p-2 bg-slate-900 text-white rounded-full hover:bg-blue-600 transition-colors cursor-pointer shadow-md"
                  title="Change Avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="px-3 py-1 bg-slate-50 border border-slate-250 rounded-lg text-lg font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none focus:border-blue-500 transition-all font-sans"
                    placeholder="Full Name"
                    required
                  />
                ) : (
                  <h3 className="font-sans font-extrabold text-2xl text-slate-900 leading-none">
                    {formData.fullName}
                  </h3>
                )}
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full border border-blue-100 uppercase tracking-widest font-mono inline-block self-center">
                  Student
                </span>
              </div>

              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full max-w-xl px-3 py-2 bg-slate-50 border border-slate-250 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none focus:border-blue-500 transition-all font-sans"
                  placeholder="Tell us a bit about your studies..."
                />
              ) : (
                <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                  {formData.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid split (Left 1/3, Right 2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column (Academic Profile details) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 className="font-sans font-extrabold uppercase tracking-wider text-[11px] text-slate-400">
              Academic Credentials
            </h4>
            <GraduationCap className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-4">
            {/* Major */}
            <div className="p-3.5 bg-[#f8fafc] rounded-xl border border-slate-100">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">Major Track</span>
              {isEditing ? (
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1 mt-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-xs font-extrabold text-slate-800 mt-1">{formData.section}</p>
              )}
            </div>

            {/* Student ID */}
            <div className="p-3.5 bg-[#f8fafc] rounded-xl border border-slate-100">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">Student Registration ID</span>
              {isEditing ? (
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1 mt-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-xs font-extrabold text-slate-800 mt-1">{formData.studentId}</p>
              )}
            </div>

            {/* University */}
            <div className="p-3.5 bg-[#f8fafc] rounded-xl border border-slate-100">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">University</span>
              {isEditing ? (
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1 mt-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-xs font-extrabold text-slate-800 mt-1">{formData.university}</p>
              )}
            </div>

            {/* GPA */}
            <div className="p-3.5 bg-[#f8fafc] rounded-xl border border-slate-100">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider font-mono">Cumulative GPA</span>
              {isEditing ? (
                <input
                  type="text"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1 mt-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-xs font-extrabold text-blue-600 font-mono mt-1">{formData.gpa}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Workspace and security preferences) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6">
          <div>
            <h4 className="font-sans font-bold text-slate-900 text-sm">Workspace Settings</h4>
            <p className="text-xs text-slate-400 mt-1">Manage academic notifications, app credentials, and cloud storage.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Security */}
            {/* Security */}
            <div className="py-4 first:pt-0">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 shrink-0">
                  <Lock className="h-4 w-4" />
                </div>

                <div className="flex-1">
                  <h5 className="text-xs font-bold text-slate-800">
                    Account Security
                  </h5>

                  <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                    Change your account password.
                  </p>

                  {isEditing && (
                    <div className="space-y-3">

                        <input
                          type="password"
                          placeholder="Current Password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />

                      <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />

                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />

                    </div>
                  )}

                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-bold text-blue-600 hover:underline mt-2"
                    >
                      Change Password
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">In-App Study Reminders</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Daily reminder digests, mock test milestones, and dashboard updates.</p>
                </div>
              </div>
              <button
                onClick={() => triggerToast?.("Notification settings module loaded.", "info")}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer hover:text-blue-700 shrink-0"
              >
                Manage
              </button>
            </div>

            {/* App support & instructions */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 shrink-0">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Academic Support Portal</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Need help with study guides? Contact: <span className="font-semibold text-slate-700">support@stanford.edu</span></p>
                </div>
              </div>
              <button
                onClick={() => triggerToast?.("Support system is active.", "info")}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer hover:text-blue-700 shrink-0"
              >
                Contact
              </button>
            </div>

            {/* Deactivate / Logout */}
            <div className="py-4 flex items-center justify-between gap-4 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-500 shrink-0">
                  <LogOut className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-red-600">Disconnect Student Account</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Safely log out and clear active session cookies.</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
