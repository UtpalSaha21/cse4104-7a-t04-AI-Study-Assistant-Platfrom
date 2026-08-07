import api from "../services/api";
import React, { useState } from "react";
import { Layers, X } from "lucide-react";
import brainBookImage from "../assets/images/brain_learning_book_1782964982918.jpg";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (isSignUp && !fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isSignUp) {
        // Register Call
        const response = await api.post("/auth/register", {
          name: fullName,
          email,
          password,
        });

        const data = response.data;

        // After successful registration, automatically log them in
        const loginResponse = await api.post("/auth/login", {
          email,
          password,
        });

        const loginData = loginResponse.data;

        // Save Token
        // Save Token
        localStorage.setItem("scholar_student_token", loginData.token);

        // Get logged in user's profile
        const profileResponse = await api.get("/auth/profile");

        const user = {
          ...profileResponse.data.user,
          fullName: profileResponse.data.user.name,
        };

        onAuthSuccess(user);

        onClose?.();
      } else {
        // Login Call
        const response = await api.post("/auth/login", {
          email,
          password,
        });

        const data = response.data;

        // Save Token
        // Save Token
        localStorage.setItem("scholar_student_token", data.token);

        // Get logged in user's profile
        const profileResponse = await api.get("/auth/profile");

        const user = {
          ...profileResponse.data.user,
          fullName: profileResponse.data.user.name,
        };

        onAuthSuccess(user);

        onClose?.();
      }
    } catch (err) {
      setApiError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    const authUser = {
      email: "student@university.edu",
      fullName: "Alex Johnson",
      studentId: "SU-2023-PHY",
      section: "Physics",
      teamName: "Quantum Mechanics Track",
      role: "Student",
      university: "Stanford University",
      gpa: "3.8 / 4.0",
      bio: "Physics enthusiast dedicated to mastering quantum mechanics and helping peers bridge the gap between theory and practice.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
    };
    onAuthSuccess(authUser);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-white font-sans overflow-hidden w-screen h-screen">
      {/* 2-Column Split Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">

        {/* Left Column - Scholastic Brand Card Layout */}
        <div className="hidden md:flex flex-col justify-center items-center p-12 bg-[#f0f4f8] relative overflow-hidden h-full">
          <div className="max-w-md w-full flex flex-col items-center text-center space-y-8 z-10">
            {/* Image container styled with rounded corners and subtle shadow */}
            <div className="w-full max-w-sm aspect-square rounded-3xl overflow-hidden shadow-md bg-[#0c1221] flex items-center justify-center">
              <img
                src={brainBookImage}
                alt="AI Learning Brain"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Heading exactly matching layout */}
            <div className="space-y-4">
              <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-[#1e5af1] leading-tight tracking-tight">
                {isSignUp ? (
                  <>
                    Start Your <br /> Academic Journey
                  </>
                ) : (
                  <>
                    Master Your Subjects <br /> with Clarity.
                  </>
                )}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                {isSignUp
                  ? "Join thousands of students mastering their subjects with AI-powered intuition."
                  : "Experience a scholarly workspace where AI meets intuition, designed for deep focus and academic growth."}
              </p>
            </div>

            {/* Badges on Sign In view exactly matching Screenshot 4 */}
            {!isSignUp && (
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs bg-blue-50 border border-blue-100 text-blue-600 font-semibold px-4 py-1.5 rounded-full">
                  Adaptive Learning
                </span>
                <span className="text-xs bg-purple-50 border border-purple-100 text-purple-600 font-semibold px-4 py-1.5 rounded-full">
                  Deep Focus
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Actual Input Forms exactly matching screenshots */}
        <div className="flex flex-col justify-between p-8 sm:p-12 md:p-16 w-full h-full relative bg-white">
          {/* Absolute positioned close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Top/Header branding matching screens */}
          <div className="w-full max-w-md mx-auto shrink-0">
            {isSignUp ? (
              /* Logo row for Sign Up - left-aligned */
              <div className="flex items-center gap-3.5 mb-8">
                <Layers className="h-10 w-10 text-slate-900 stroke-[2.5]" />
                <div className="flex flex-col text-left font-sans">
                  <span className="font-extrabold text-xl leading-none text-[#1e5af1] tracking-tight">AI Study</span>
                  <span className="font-extrabold text-xl leading-none text-[#1e5af1] tracking-tight mt-0.5">Assistant</span>
                </div>
              </div>
            ) : (
              /* Center-aligned Logo Icon for Sign In view */
              <div className="flex flex-col items-center justify-center text-center mt-2 mb-4">
                <Layers className="h-14 w-14 text-slate-900 stroke-[2.5]" />
              </div>
            )}
          </div>

          {/* Inner Form Content */}
          <div className="my-auto max-w-md w-full mx-auto space-y-6 flex-1 flex flex-col justify-center min-h-0">
            <div className={`${isSignUp ? "text-left" : "text-center"} space-y-2`}>
              <h3 className="font-sans font-extrabold text-3xl sm:text-[34px] text-slate-900 tracking-tight leading-tight">
                {isSignUp ? "Create Your Account" : "Welcome Back"}
              </h3>
              <p className="text-sm sm:text-base text-slate-500 font-normal">
                {isSignUp ? "Step into the future of learning today." : "Continue to your journey with mastery"}
              </p>
            </div>

            {apiError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-semibold flex items-start gap-2 animate-pulse">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-[15px] font-bold text-slate-900 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-4 py-3.5 bg-[#f4f6fa] border border-slate-200/50 text-slate-900 text-sm rounded-xl transition-all focus:bg-white focus:outline-none focus:ring-2 ${errors.fullName ? "border-red-300 focus:ring-red-100 focus:border-red-400" : "focus:ring-blue-100 focus:border-blue-500"
                      }`}
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>
              )}

              <div>
                <label className="block text-[15px] font-bold text-slate-900 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder={isSignUp ? "example@scholarai.edu" : "student@university.edu"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3.5 bg-[#f4f6fa] border border-slate-200/50 text-slate-900 text-sm rounded-xl transition-all focus:bg-white focus:outline-none focus:ring-2 ${errors.email ? "border-red-300 focus:ring-red-100 focus:border-red-400" : "focus:ring-blue-100 focus:border-blue-500"
                    }`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[15px] font-bold text-slate-900">Password</label>
                  {!isSignUp && (
                    <button type="button" className="text-sm text-[#1e5af1] hover:underline font-bold cursor-pointer">
                      Forget password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  placeholder="........"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3.5 bg-[#f4f6fa] border border-slate-200/50 text-slate-900 text-sm rounded-xl transition-all focus:bg-white focus:outline-none focus:ring-2 ${errors.password ? "border-red-300 focus:ring-red-100 focus:border-red-400" : "focus:ring-blue-100 focus:border-blue-500"
                    }`}
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* Submit Action Button styled exactly matching screenshots with loading handling */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 bg-[#1e5af1] hover:bg-[#154ec1] text-white rounded-xl text-base font-bold transition-all shadow-sm mt-2 flex items-center justify-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
                  }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Please wait...</span>
                  </>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </button>
            </form>

            {/* Divider exactly matching screens */}
            <div className="flex items-center justify-center gap-3 py-1">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-sm font-bold text-slate-900">or</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Google Login Option with G Logo and "Sign up with Google" text exactly matching both screens */}
            <button
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 shadow-sm transition-colors cursor-pointer"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#ea4335"
                  d="M12 5.04c1.62 0 3.08.56 4.22 1.66l3.15-3.15C17.47 1.8 14.93 1 12 1 7.37 1 3.4 3.63 1.5 7.46l3.66 2.84c.88-2.65 3.37-4.26 6.84-4.26z"
                />
                <path
                  fill="#4285f4"
                  d="M23.49 12.27c0-.8-.07-1.58-.2-2.34H12v4.44h6.43c-.28 1.48-1.12 2.73-2.38 3.58l3.66 2.84c2.14-1.98 3.38-4.89 3.38-8.52z"
                />
                <path
                  fill="#fbbc05"
                  d="M5.16 14.7a7.25 7.25 0 010-4.4l-3.66-2.84A11.96 11.96 0 001 12c0 1.64.33 3.2 1.5 4.54l3.66-2.84z"
                />
                <path
                  fill="#34a853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.47 0-5.96-1.61-6.84-4.26L1.5 16.99C3.4 20.82 7.37 23 12 23z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Toggle Footer Link exactly matching screens */}
            <div className="text-center text-sm font-semibold text-slate-900">
              {isSignUp ? (
                <span>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setErrors({});
                    }}
                    className="text-[#1e5af1] hover:underline cursor-pointer font-bold"
                  >
                    Log in
                  </button>
                </span>
              ) : (
                <span>
                  Don’t have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setErrors({});
                    }}
                    className="text-[#1e5af1] hover:underline cursor-pointer font-bold"
                  >
                    Sign up
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Bottom Footer Links Row exactly matching screens */}
          <div className="w-full max-w-md mx-auto space-y-4 pt-4 shrink-0">
            <hr className="border-slate-150" />
            <div className="flex items-center justify-center gap-6 text-xs text-slate-900 font-bold pb-2">
              <button className="hover:text-slate-600 cursor-pointer">Help Center</button>
              <button className="hover:text-slate-600 cursor-pointer">Privacy policy</button>
              <button className="hover:text-slate-600 cursor-pointer">Terms</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
