import api from "../services/api";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Upload,
  Brain,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Clock,
  BookOpen,
  FileSpreadsheet,
  HelpCircle,
  Award,
  MoreHorizontal,
  MoreVertical
} from "lucide-react";


export default function Quizzes() {
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");

  const [questions, setQuestions] = useState([]);

  const [currentIdx, setCurrentIdx] = useState(0);

  const [quizCompleted, setQuizCompleted] = useState(false);

  const [timeRemaining, setTimeRemaining] = useState(12 * 60 + 45); // 12 minutes 45 seconds to match screenshot 6!
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [apiError, setApiError] = useState("");
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [answers, setAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [count, setCount] = useState(5);
  const [menuOpen, setMenuOpen] = useState(null);
  const menuRef = useRef(null);
  const canGenerate = subject.trim() || uploadedFile;

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {

        setMenuOpen(null);

      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {

      document.removeEventListener("mousedown", handleClickOutside);

    };

  }, []);

  useEffect(() => {

    loadQuizHistory();

  }, []);

  const loadQuizHistory = async () => {

    try {

      const res = await api.get("/quiz/history");

      setQuizHistory(res.data.quizzes);

    }

    catch (err) {

      console.log(err);

    }

  };

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 15 * 60));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleOptionClick = (option) => {
    if (answers[currentIdx] !== undefined) return;

    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: option,
    }));
  };

  const handleGenerateQuiz = async (e) => {
  e.preventDefault();

  setIsLoading(true);
  setApiError("");

  try {
    let res;

    if (uploadedFile) {
      const formData = new FormData();

      formData.append("pdf", uploadedFile);
      formData.append("count", count);
      formData.append("difficulty", difficulty);

      res = await api.post(
        "/quiz/generate-from-pdf",
        formData
      );
    } else {
      res = await api.post(
        "/quiz/generate",
        {
          topic: subject,
          difficulty,
          count
        }
      );
    }

    setCurrentQuiz(res.data.quiz);
    setQuestions(res.data.quiz.questions);
    setCurrentIdx(0);
    setAnswers({});
    setQuizResult(null);

    await loadQuizHistory();

    alert("Quiz generated successfully!");

  } catch (err) {
    console.error("Quiz generation error:", err);

    const message =
      err.response?.data?.message ||
      "Failed to generate quiz. Please try again.";

    setApiError(message);

  } finally {
    setIsLoading(false);
  }
};

  const handleSubmitQuiz = async () => {

    try {

      const answerArray = currentQuiz.questions.map(

        (_, i) => answers[i] || ""

      );

      const res = await api.post(

        `/quiz/${currentQuiz._id}/submit`,

        {

          answers: answerArray

        }

      );

      setQuizResult(res.data);

      setQuizCompleted(true);

      triggerToast("Quiz submitted!");

      loadQuizHistory();

    }

    catch (err) {

      console.log(err);

    }

  };

  const handleOpenQuiz = async (id) => {
    try {

      const res = await api.get(`/quiz/${id}`);

      const quiz = res.data.quiz;

      setCurrentQuiz(quiz);

      setQuestions(quiz.questions);

      setSubject(quiz.topic);

      setCurrentIdx(0);

      setAnswers({});

      setQuizCompleted(false);

      setQuizResult(null);

    } catch (err) {

      console.log(err);

      triggerToast("Failed to open quiz", "error");

    }
  };

  const handleDeleteQuiz = async (id) => {
    try {

      await api.delete(`/quiz/${id}`);

      setQuizHistory(prev =>
        prev.filter(q => q._id !== id)
      );

      if (currentQuiz?._id === id) {

        setCurrentQuiz(null);

        setQuestions([]);

        setQuizCompleted(false);

        setQuizResult(null);

      }

      triggerToast("Quiz deleted.");

    } catch (err) {

      console.log(err);

      triggerToast("Failed to delete quiz.", "error");

    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();

  setDragActive(false);

  const file = e.dataTransfer.files?.[0];

  if (!file) return;

  setUploadedFile(file);
  setUploadedFileName(file.name);
};

  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setUploadedFile(file);

    setUploadedFileName(file.name);

  };

  return (
    <div className="space-y-6">
      {/* Title & Header Section */}
      <div className="space-y-1">
        <h3 className="font-sans font-black text-2xl text-slate-900 tracking-tight">Quiz & Test Center</h3>
        <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
          Challenge yourself with AI-generated assessments tailored to your current study curriculum.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Quiz Settings & Recents) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerateQuiz} className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
              <h4 className="font-sans font-bold text-base text-slate-900">Configure Study Assessment</h4>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${dragActive
                ? "border-blue-500 bg-blue-50/40"
                : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
                }`}
            >
              <input
                type="file"
                id="quiz-file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
              />
              <label htmlFor="quiz-file-upload" className="cursor-pointer block space-y-1.5">
                <Upload className="h-7 w-7 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-700">
                  {uploadedFileName ? (
                    <span className="text-blue-600 font-mono">{uploadedFileName}</span>
                  ) : (
                    <span>Drag and Drop your PDF/Notes here</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">Supports PDF, DOCX, and TXT files up to 50MB</p>
              </label>
            </div>

            {/* Subject Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Quantum Physics"
                className="w-full px-3 py-2 bg-slate-50 text-slate-900 text-sm border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-mono"
              />
            </div>

            {/* Number of Questions (Segmented Control matching Screenshot 6) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Number of Questions</label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${count === num
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={isLoading || !canGenerate}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-600/10 disabled:opacity-40 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Brain className="h-4.5 w-4.5 animate-spin" />
                  <span>Synthesizing Assessment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>

            {apiError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-start gap-2 mt-2 animate-pulse">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{apiError}</span>
              </div>
            )}
          </form>

          {/* history card*/}
          <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm">
            <h4 className="font-bold text-sm mb-3">Recent Quizzes</h4>

            {quizHistory.length === 0 ? (
              <p className="text-xs text-slate-500">
                No quizzes yet.
              </p>
            ) : (
              <div className="space-y-2">
                {quizHistory.map((quiz) => (
                  <div
                    key={quiz._id}
                    onClick={() => handleOpenQuiz(quiz._id)}
                    className="p-3 border rounded-lg bg-slate-50 cursor-pointer hover:bg-blue-100"
                  >

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm">
                          {quiz.topic}
                        </p>

                        <p className="text-xs text-slate-500">
                          {quiz.difficulty}
                        </p>
                      </div>

                      {quiz.completed ? (
                        <span className="text-green-600 font-bold text-xs">
                          {quiz.score}/{quiz.totalQuestions}
                        </span>
                      ) : (
                        <span className="text-yellow-600 font-bold text-xs">
                          Not Completed
                        </span>
                      )}
                      <div className="relative" ref={menuRef}>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(
                              menuOpen === quiz._id ? null : quiz._id
                            );
                          }}
                          className="p-1 rounded hover:bg-red-200 cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {menuOpen === quiz._id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg z-50">

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(null);
                                handleOpenQuiz(quiz._id);
                              }}
                              className="w-full px-3 py-2 text-left text-xs hover:bg-slate-100 cursor-pointer"
                            >
                              📖 Open
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(null);
                                handleDeleteQuiz(quiz._id);
                              }}
                              className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              🗑 Delete
                            </button>

                          </div>
                        )}

                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (The Active Quiz Area or Score Summary!) */}
        <div className="lg:col-span-7 space-y-5">
          {quizCompleted ? (
            <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5.5 w-5.5 text-blue-600" />
                  <div>
                    <h4 className="font-sans font-black text-lg text-slate-900">Assessment Complete</h4>
                    <p className="text-xs text-slate-400 font-mono">Completed successfully</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCurrentIdx(0);
                    setAnswers({});
                    setQuizCompleted(false);
                    setTimeRemaining(questions.length * 90);
                  }}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Retake Assessment
                </button>
              </div>

              {/* Visual Score breakdown */}
              <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50/60 border border-slate-100 p-5 rounded-2xl">
                {/* Circular Score Circle */}
                <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
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
                      strokeDashoffset={
                        251.2 *
                        (1 -
                          ((quizResult?.score ?? 0) /
                            (quizResult?.total || 1)))
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center relative z-10">
                    <span className="text-xl font-black text-slate-900 block leading-none">
                      {Math.round(
                        ((quizResult?.score ?? 0) /
                          (quizResult?.total || 1)) *
                        100
                      )}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Score</span>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  <div className="p-3 bg-white rounded-xl border border-slate-150 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Correct</span>
                    <p className="text-lg font-black text-emerald-600 mt-1">
                      {quizResult?.result?.filter(r => r.correct).length ?? 0}
                    </p>
                    <span className="text-[9px] text-slate-400 font-medium">/{questions.length}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-150 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Wrong</span>
                    <p className="text-lg font-black text-rose-500 mt-1">
                      {quizResult?.result?.filter(r => !r.correct && !r.skipped).length ?? 0}
                    </p>
                    <span className="text-[9px] text-slate-400 font-medium">/{questions.length}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-150 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Blank</span>
                    <p className="text-lg font-black text-slate-500 mt-1">
                      {quizResult?.result?.filter(r => r.skipped).length ?? 0}
                    </p>
                    <span className="text-[9px] text-slate-400 font-medium">unanswered</span>
                  </div>
                </div>
              </div>

              {/* Detailed Question Review */}
              <div className="space-y-4">
                <h5 className="font-sans font-bold text-sm text-slate-800">Review Questions & Explanations</h5>
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {questions.map((q, idx) => {
                    const result = quizResult?.result?.[idx];

                    const wasCorrect = result?.correct;
                    const wasSkipped = result?.skipped;
                    const wasWrong = !result?.correct && !result?.skipped;


                    return (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs font-bold text-slate-400 shrink-0 font-mono mt-0.5">Q{idx + 1}.</span>
                          <p className="text-xs font-bold text-slate-800 leading-normal flex-1">{q.question}</p>
                          {wasCorrect && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[9px] rounded-full border border-emerald-200 uppercase tracking-wider shrink-0">
                              Correct
                            </span>
                          )}
                          {wasWrong && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[9px] rounded-full border border-rose-200 uppercase tracking-wider shrink-0">
                              Incorrect
                            </span>
                          )}
                          {!wasCorrect && !wasWrong && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[9px] rounded-full border border-slate-200 uppercase tracking-wider shrink-0">
                              Skipped
                            </span>
                          )}
                        </div>

                        {/* Answers breakdown */}
                        <div className="text-[11px] text-slate-500 space-y-1 pl-6">
                          <p>
                            Your Answer:
                            <span className="font-bold text-slate-700">
                              {result?.userAnswer || "Not Answered"}
                            </span>
                          </p>

                          <p>
                            Correct Answer:
                            <span className="font-bold text-emerald-600">
                              {result?.correctAnswer}
                            </span>
                          </p>

                          {q.explanation && (
                            <div className="pt-1.5 border-t border-slate-200/60 text-slate-500">
                              <span className="font-bold text-slate-700">
                                Explanation:
                              </span>{" "}
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-5">
              {/* Quiz Heading Header block */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-sans font-bold text-base text-slate-900">{subject}</h4>
                    <p className="text-xs text-slate-400 font-mono">Question {currentIdx + 1} of {questions.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/70 border border-blue-100 rounded-full text-blue-700 text-xs font-bold font-mono shadow-xxs">
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  <span>TIME REMAINING: {formatTime(timeRemaining)}</span>
                </div>
              </div>

              {/* Question Text block */}
              <div className="space-y-1">
                <h5 className="font-sans font-extrabold text-lg text-slate-800 leading-snug">
                  {questions[currentIdx]?.question}
                </h5>
              </div>

              {/* Options list styled exactly like screenshot 6 */}
              <div className="space-y-3">
                {questions[currentIdx]?.options.map((optText, index) => {

                  const letter = String.fromCharCode(65 + index); // A, B, C, D

                  const isSelected =
                    answers[currentIdx] === optText;

                  const isCorrect =
                    questions[currentIdx]?.correctAnswer === optText;

                  const isWrongSelected =
                    isSelected && !isCorrect;

                  let optStyle =
                    "bg-white border-slate-200 hover:bg-slate-50/50 text-slate-700 hover:border-slate-300";

                  let badgeStyle =
                    "bg-slate-50 border-slate-200 text-slate-400";

                  if (isWrongSelected) {
                    optStyle = "bg-rose-50/80 border-rose-300 text-rose-900";
                    badgeStyle = "bg-rose-100 border-rose-200 text-rose-700";
                  } else if (isSelected && isCorrect) {
                    optStyle = "bg-emerald-50/80 border-emerald-300 text-emerald-900";
                    badgeStyle = "bg-emerald-100 border-emerald-200 text-emerald-700";
                  } else if (isSelected) {
                    optStyle = "bg-blue-50/80 border-blue-300 text-blue-900";
                    badgeStyle = "bg-blue-100 border-blue-200 text-blue-700";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionClick(optText)}
                      className={`w-full flex items-center justify-between text-left p-4 rounded-xl border font-sans text-sm font-semibold transition-all duration-150 cursor-pointer ${optStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-6 w-6 rounded-lg border flex items-center justify-center font-mono text-xs font-bold ${badgeStyle}`}
                        >
                          {letter}
                        </span>

                        <span>{optText}</span>
                      </div>

                      <div className="shrink-0 pl-2">
                        {isWrongSelected && (
                          <X className="h-5 w-5 text-rose-600" />
                        )}

                        {isSelected && isCorrect && (
                          <Check className="h-5 w-5 text-emerald-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Previous & Next navigation buttons */}
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                {currentIdx === questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    <span>Finish Quiz</span>
                    <Award className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white shadow-md shadow-blue-600/10 cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}

                {quizResult && (
                  <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
                    <h2 className="text-xl font-bold text-green-700">
                      Quiz Completed 🎉
                    </h2>

                    <p className="mt-2 text-lg">
                      Score: <strong>{quizResult.score}</strong> / {quizResult.total}
                    </p>
                  </div>
                )}

                {quizResult?.result?.map((item, index) => (
                  <div
                    key={index}
                    className="mt-4 rounded-lg border p-4 bg-white"
                  >
                    <h4 className="font-semibold">
                      {index + 1}. {item.question}
                    </h4>

                    <p className="text-green-600 mt-2">
                      Correct Answer: {item.correctAnswer}
                    </p>

                    <p className={item.correct ? "text-green-600" : "text-red-600"}>
                      Your Answer: {item.userAnswer || "Not Answered"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Explanation box matching Screenshot 6 exactly (Only shows if answered) */}
              <AnimatePresence>
                {answers[currentIdx] !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4.5 space-y-2 mt-4"
                  >
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                      <HelpCircle className="h-4 w-4 text-blue-500" />
                      <span>Explanation</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {questions[currentIdx]?.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
