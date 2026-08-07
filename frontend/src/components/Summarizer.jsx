import api from "../services/api";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Upload,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Brain,
  Copy,
  Plus,
  Share2,
  FileSpreadsheet,
  Trash2
} from "lucide-react";

export default function Summarizer() {
  const [docTitle, setDocTitle] = useState("Quantum Mechanics Fundamental Concepts");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Start with preloaded results to match NUBT requirements on startup!
  const [result, setResult] = useState(null);

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState(null);
  const [summaryFile, setSummaryFile] = useState(null);
  const [history, setHistory] = useState([]);

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const getHistory = async () => {
    try {

      const res = await api.get("/summary/history");

      setHistory(res.data.summaries);

    } catch (err) {

      console.log(err);

    }
  };

  useEffect(() => {

    getHistory();

  }, []);

  // Drag and Drop handlers
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSummaryFile(file);
      setUploadedFileName(file.name);
      setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSummaryFile(file);
    setUploadedFileName(file.name);
    setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
    setResult(null);
  };

  const handleGenerateSummary = async () => {

    if (!summaryFile) {
      triggerNotification("Please select a PDF.");
      return;
    }

    try {

      setIsLoading(true);

      const formData = new FormData();

      formData.append("pdf", summaryFile);

      const res = await api.post(
        "/summary/summary-from-pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setResult(res.data.result);
      getHistory();

      triggerNotification("Summary generated successfully!");

    } catch (err) {

      console.log(err);

      triggerNotification("Failed to generate summary.");

    } finally {

      setIsLoading(false);

    }

  };

  const copyToClipboard = () => {
    if (!result) return;
    const textToCopy = `${result.title} - ${result.category}\n\nSummary:\n${result.summary}\n\nKey Observations:\n${result.keyPoints.map((kp) => `• ${kp}`).join("\n")}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteSummary = async (id) => {
    try {

      await api.delete(`/summary/${id}`);

      setHistory(prev =>
        prev.filter(item => item._id !== id)
      );

      triggerNotification("Summary deleted.");

    } catch (err) {

      triggerNotification("Delete failed.");

    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Header Section matching screenshot 5 */}
      <div className="space-y-1">
        <h3 className="font-sans font-black text-2xl text-slate-900 tracking-tight">Summarizer</h3>
        <p className="text-sm text-slate-500 max-w-4xl leading-relaxed">
          Transform dense academic papers and lecture notes into concise, actionable study materials instantly using advanced AI analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Input panel) */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateSummary();
            }} className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h4 className="font-sans font-bold text-base text-slate-900">Upload Study Material</h4>
            </div>

            {/* Drag & Drop Area */}
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
                id="notes-file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf"
              />
              <label htmlFor="notes-file-upload" className="cursor-pointer block space-y-1.5">
                <Upload className="h-7 w-7 text-slate-400 mx-auto animate-pulse" />
                <div className="text-xs font-semibold text-slate-700">
                  {uploadedFileName ? (
                    <span className="text-blue-600 font-mono">{uploadedFileName}</span>
                  ) : (
                    <span>Drag and Drop your PDF/Notes here</span>
                  )}
                </div>
                <div className="inline-block py-1 px-3 bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-sm hover:bg-blue-500 transition-colors mt-1">
                  Browse Files
                </div>
                <p className="text-[10px] text-slate-400 block mt-1">Supports PDF up to 50MB</p>
              </label>
            </div>

            {/* Document Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Document Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g MolecularBiology"
                className="w-full px-3 py-2 bg-slate-50 text-slate-900 text-sm border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-mono"
              />
            </div>

            {/* Summarize Button */}
            <button
              type="submit"
              disabled={isLoading || !summaryFile}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-600/10 disabled:opacity-40 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Brain className="h-4.5 w-4.5 animate-spin" />
                  <span>Analyzing Study Guide...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4.5 w-4.5" />
                  <span>Summarize</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-150 text-rose-800 rounded-xl flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Right Column (Output panel matches Screenshot 5 layout) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-5">
              {/* Tabs Bar */}
              <div className="flex border-b border-slate-100 pb-3 justify-between items-center">
                <div className="flex gap-1">
                  <button className="px-3.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold shadow-xxs">
                    Key Highlights
                  </button>
                  <button className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-bold">
                    Full Text Digest
                  </button>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-150 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  title="Copy Highlights"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Content Analysis */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Content Analysis
                </span>
                <div className="space-y-1">
                  <h4 className="font-sans font-black text-xl text-slate-900 leading-tight">
                    {result.title}
                  </h4>
                  <p className="text-xs font-bold text-violet-600 font-mono">
                    {result.category}
                  </p>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {result.summary}
                </p>
              </div>

              {/* Key Observations Bullet points matching Screenshot 5 */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Key Observations
                </span>
                <ul className="space-y-2 pl-1">
                  {result.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                      <span className="h-1.5 w-1.5 bg-slate-800 rounded-full mt-2 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contextual Background */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  Contextual Background
                </span>
                <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50/20 p-3 rounded-lg border border-slate-100/50">
                  {result.context}
                </p>
              </div>

              {/* Action Buttons matching Screenshot 5 colors */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => triggerNotification("Success! Saved to your academic study library.")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add to Library</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText?.(window.location.href);
                    triggerNotification("Copied! Shareable study notes link copied.");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share Notes</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col justify-center items-center text-center p-8 bg-white border border-slate-150 rounded-2xl shadow-xs">
              <FileSpreadsheet className="h-12 w-12 text-slate-300 mb-4 animate-bounce" />
              <h5 className="font-sans font-bold text-slate-800 text-base">Compile Highlights</h5>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Upload chapter guidelines or paste transcripts on the left to synthesize instant, high-quality key takeaways.
              </p>
            </div>
          )}

          {/* Recents Uploads Section at bottom right matching Screenshot 5 */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <h5 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-widest">
                Recent Uploads
              </h5>
            </div>

            <div className="flex items-center gap-3.5 p-3 hover:bg-slate-50/50 rounded-xl transition-colors cursor-pointer border border-slate-100/60">

              {history.map(item => (

                <div
                  key={item._id}
                  className="flex items-center gap-3.5 p-3 hover:bg-slate-200 rounded-xl cursor-pointer"
                  onClick={() => setResult(item)}
                >

                  <div className="h-10 w-10 bg-rose-50 rounded-xl flex justify-center items-center">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="flex-1">

                    <p className="font-bold">

                      {item.title}

                    </p>

                    <p className="text-xs text-gray-500">

                      {item.category}

                    </p>

                    <p className="text-xs text-gray-500">

                      {new Date(item.createdAt).toLocaleString()}

                    </p>

                    <Trash2
                      className="w-4 h-4 text-red-500 cursor-pointer hover:bg-red-300"
                      onClick={(e) => {

                        e.stopPropagation();

                        deleteSummary(item._id);

                      }}
                    />

                  </div>

                </div>

              ))}

            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-slate-800 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold"
          >
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
