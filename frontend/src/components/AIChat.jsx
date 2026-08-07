import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Sparkles,
  User,
  Brain,
  AlertCircle,
  RefreshCw,
  Plus,
  MoreHorizontal,
  Paperclip,
  Clock,
  Bell,
  MessageSquare,
  Compass,
  Trash2
} from "lucide-react";

const defaultChatHistory = [
  {
    id: "welcome-alex",
    role: "assistant",
    content: "Hello Alex! I'm ready to help you with your Calculus and Physics homework today. What would you like to explore first?",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "user-derivative",
    role: "user",
    content: "Can you help me calculate the first derivative of the function f(x) = 3x^3 + 5x^2 - 12 in Python? Also, please explain the power rule briefly.",
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: "assistant-derivative",
    role: "assistant",
    content: "Of course! To find the derivative using the Power Rule, you multiply the coefficient by the exponent and then subtract one from the exponent (nx^(n-1)). Constants like -12 become zero.\n\n```python\nimport sympy as sp\n\n# Define variable\nx = sp.symbols('x')\nf = 3*x**3 + 5*x**2 - 12\n\n# Calculate derivative\nderivative = sp.diff(f, x)\nprint(derivative) # Result: 9*x**2 + 10*x\n```",
    timestamp: new Date(Date.now() - 900000),
  },
];

const highlightPython = (code) => {
  const lines = code.split("\n");
  return lines.map((line, idx) => {
    // Comment line highlight
    if (line.trim().startsWith("#")) {
      return (
        <div key={idx} className="text-slate-400 font-mono whitespace-pre min-h-[1.2rem]">
          {line}
        </div>
      );
    }

    // Inline comments split
    let comment = "";
    let codePart = line;
    const hashIndex = line.indexOf("#");
    if (hashIndex !== -1) {
      codePart = line.substring(0, hashIndex);
      comment = line.substring(hashIndex);
    }

    const tokens = [];
    const regex = /('(?:\\'|[^'])*'|"(?:\\"|[^"])*"|\b(?:import|as|def|return|from|class|print|symbols|diff|sp)\b|\w+|[^\w\s]+|\s+)/g;
    let match;
    while ((match = regex.exec(codePart)) !== null) {
      const token = match[0];
      if (token.startsWith("'") || token.startsWith('"')) {
        tokens.push(<span key={regex.lastIndex} className="text-[#50fa7b]">{token}</span>); // neon green for strings
      } else if (/\b(import|as|from|def|return|class|print)\b/.test(token)) {
        tokens.push(<span key={regex.lastIndex} className="text-[#ff79c6] font-extrabold">{token}</span>); // pink for core keywords
      } else if (/\b(symbols|diff|sp)\b/.test(token)) {
        tokens.push(<span key={regex.lastIndex} className="text-[#8be9fd]">{token}</span>); // cyan for functions/modules
      } else if (/^\d+$/.test(token)) {
        tokens.push(<span key={regex.lastIndex} className="text-[#bd93f9]">{token}</span>); // light purple for numbers
      } else {
        tokens.push(<span key={regex.lastIndex}>{token}</span>);
      }
    }

    return (
      <div key={idx} className="min-h-[1.2rem] font-mono whitespace-pre text-slate-100">
        {tokens}
        {comment && <span className="text-slate-400">{comment}</span>}
      </div>
    );
  });
};

export default function AIChat({ initialHistory = [], triggerToast }) {
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingConversation, setEditingConversation] = useState(null);

  const [newTitle, setNewTitle] = useState("");

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSession, setActiveSession] = useState("current");
  const [currentPdf, setCurrentPdf] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      loadConversation(conversations[0]._id);
    }
  }, [conversations]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (menuRef.current && !menuRef.current.contains(event.target)) {

        setMenuOpen(null);

      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {

      document.removeEventListener("mousedown", handleClickOutside);

    };

  }, []);

  const loadConversations = async () => {
    try {
      const res = await api.get("/conversations");

      setConversations(res.data.conversations);

    } catch (err) {
      console.log(err);
    }
  };

  const loadConversation = async (id) => {

    try {

      setCurrentConversation(id);

      const res = await api.get(`/conversations/${id}/messages`);

      setCurrentPdf(res.data.conversation?.fileName || "");

      const formatted = res.data.messages.map(msg => ({

        id: msg._id,

        role: msg.role,

        content: msg.content,

        timestamp: new Date(msg.createdAt)

      }));

      setMessages(formatted);

    }

    catch (err) {

      console.log(err);

    }

  };

  const handlePdfUpload = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("pdf", file);

    // Send current conversation ID if one exists
    if (currentConversation) {
      formData.append("conversationId", currentConversation);
    }

    try {

      const res = await api.post(
        "/conversations/pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      loadConversations();

      // Only switch conversations if there wasn't one already
      if (!currentConversation) {

        setCurrentConversation(res.data.conversation._id);

        loadConversation(res.data.conversation._id);

      } else {

        loadConversation(currentConversation);

      }

      triggerToast("PDF uploaded successfully.");
      setCurrentPdf(file.name);

    } catch (err) {

      console.log(err);

    }

  };

  const handleSendMessage = async (textToSend) => {

    if (!textToSend.trim() || isLoading) return;

    setError(null);

    // Create a conversation if none exists
    let conversationId = currentConversation;

    try {

      if (!conversationId) {

        const convRes = await api.post("/conversations", {

          title: textToSend.substring(0, 30)

        });

        conversationId = convRes.data.conversation._id;

        setCurrentConversation(conversationId);

        loadConversations();

      }

      // Show user message immediately
      const userMessage = {

        id: Date.now(),

        role: "user",

        content: textToSend,

        timestamp: new Date()

      };

      setMessages(prev => [...prev, userMessage]);

      setInput("");

      setIsLoading(true);


      // Ask AI
      const res = await api.post("/chat", {

        conversationId,
        question: textToSend

      });

      // Show assistant message
      const aiMessage = {

        id: res.data.message._id,

        role: "assistant",

        content: res.data.message.content,

        timestamp: new Date()

      };

      setMessages(prev => [...prev, aiMessage]);

      loadConversations();

    }

    catch (err) {

      console.log(err);

      setError("Failed to send message");

    }

    finally {

      setIsLoading(false);

    }

  };

  const handleDeleteConversation = async (id) => {

    try {

      await api.delete(`/conversations/${id}`);

      setConversations(prev =>
        prev.filter(c => c._id !== id)
      );

      if (currentConversation?._id === id) {

        setCurrentConversation(null);
        setMessages([]);

      }

      triggerToast("Conversation deleted.");

    } catch (err) {

      console.log(err);

      triggerToast("Failed to delete conversation.", "error");

    }

  };

  const handleRenameConversation = async (id) => {
    const title = newTitle.trim();

    if (!title) {

      triggerToast("Title cannot be empty.", "error");

      return;

    }
    try {

      const res = await api.put(`/conversations/${id}`, {

        title: newTitle

      });

      setConversations(prev =>

        prev.map(c =>

          c._id === id

            ? res.data.conversation

            : c

        )

      );

      if (currentConversation?._id === id) {

        setCurrentConversation(res.data.conversation);

      }

      setEditingConversation(null);

      setNewTitle("");

      triggerToast("Conversation renamed.");

    }

    catch (err) {

      console.log(err);

      triggerToast("Rename failed", "error");

    }

  };
  const handleDeleteChat = async (id) => {

    try {

      await api.delete(`/chat/${id}`);

      setMessages(prev =>
        prev.filter(
          msg =>
            msg.id !== id + "_q" &&
            msg.id !== id + "_a"
        )
      );

      triggerToast?.("Chat deleted!");

    } catch (err) {

      console.log(err);
      triggerToast?.("Failed to delete chat", "error");

    }

  };

  const handleNewChat = () => {

    setCurrentConversation(null);

    setMessages([]);

    triggerToast?.("New conversation started!");

  };

  // Helper to parse code blocks or bullet points in chat
  const renderMessageContent = (text) => {
    const parts = text.split(/(```python[\s\S]*?```|```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        // Extract content and clean up
        const isPython = part.startsWith("```python");
        const code = part.replace(/```python|```/g, "").trim();
        return (
          <div key={index} className="my-3 font-mono text-xs rounded-2xl overflow-hidden bg-[#182232] border border-slate-800 shadow-md relative group max-w-full">
            {/* Floating Copy Button on Top Right matching Screenshot 1 */}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(code);
                if (triggerToast) triggerToast("Code copied to clipboard!");
              }}
              className="absolute top-3.5 right-3.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition-all cursor-pointer z-10 shadow-xs"
              title="Copy Code"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <div className="p-4.5 overflow-x-auto scrollbar-thin">
              {isPython ? highlightPython(code) : <pre className="text-slate-100 leading-relaxed font-mono"><code>{code}</code></pre>}
            </div>
          </div>
        );
      }

      // Normal text parsing (bullet points & bold text)
      const lines = part.split("\n");
      return lines.map((line, lIdx) => {
        let content = line;
        const isListItem = line.startsWith("* ") || line.startsWith("- ");
        const cleanedLine = isListItem ? line.substring(2) : line;

        // Bold text parser helper (handles **bold**)
        if (cleanedLine.includes("**")) {
          const boldParts = cleanedLine.split(/\*\*(.*?)\*\*/g);
          content = boldParts.map((bp, bIdx) => {
            if (bIdx % 2 === 1) {
              return <strong key={bIdx} className="font-extrabold text-slate-900">{bp}</strong>;
            }
            return bp;
          });
        }

        if (isListItem) {
          return (
            <div key={lIdx} className="flex items-start gap-2 ml-4 my-1 break-words">
              <span className="text-blue-500 mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span className="flex-1 text-slate-800 break-words whitespace-pre-wrap">{content}</span>
            </div>
          );
        }

        return (
          <p key={lIdx} className={line.trim() === "" ? "h-2" : "my-1 text-slate-800 break-words whitespace-pre-wrap"}>
            {content}
          </p>
        );
      });
    });
  };

  const [mobileActiveView, setMobileActiveView] = useState("chat");

  return (
    <div className="flex flex-col h-full w-full min-h-0 min-w-0 font-sans">
      {/* Mobile/Tablet View Switcher exactly matching Screenshot 1 */}
      <div className="lg:hidden px-4 py-3 shrink-0 bg-white border-b border-slate-200/80">
        <div className="flex bg-slate-100/85 border border-slate-200 rounded-xl p-1 font-sans">
          <button
            type="button"
            onClick={() => setMobileActiveView("chat")}
            className={`flex-1 py-2 text-center text-sm font-extrabold rounded-lg transition-all cursor-pointer ${mobileActiveView === "chat"
              ? "bg-[#1e5af1] text-white shadow-xs"
              : "text-slate-900 hover:bg-slate-200/40"
              }`}
          >
            Chat Window
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveView("sessions")}
            className={`flex-1 py-2 text-center text-sm font-extrabold rounded-lg transition-all cursor-pointer ${mobileActiveView === "sessions"
              ? "bg-[#1e5af1] text-white shadow-xs"
              : "text-slate-900 hover:bg-slate-200/40"
              }`}
          >
            Recent Sessions({conversations.length})
          </button>
        </div>
      </div>

      <div className="flex-1 flex w-full max-w-full bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs min-h-0 min-w-0">
        {/* Middle Pane: RECENTS column on desktop, or full-width list on mobile if active */}
        <div className={`flex-col lg:flex w-full lg:w-64 border-r border-slate-200 bg-[#f8fafc] p-4 shrink-0 justify-between ${mobileActiveView === "sessions" ? "flex" : "hidden"
          }`}>
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">
              Recents
            </span>

            {/* New Chat Button */}
            <button
              onClick={() => {
                handleNewChat();
                setMobileActiveView("chat");
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/10 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </button>

            {/* Recents list */}
            <div className="space-y-1.5">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => {

                    loadConversation(conversation._id);

                    setMobileActiveView("chat");

                  }}
                  className="w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-100 shadow-xxs group transition-all cursor-pointer"
                >

                  <div className="flex items-center gap-2 min-w-0">

                    <MessageSquare className="h-3.5 w-3.5 text-slate-400 shrink-0" />

                    {editingConversation === conversation._id ? (

                      <input
                        autoFocus
                        value={newTitle}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={() => {
                          if (newTitle.trim()) {
                            handleRenameConversation(conversation._id);
                          } else {
                            setEditingConversation(null);
                          }
                        }}
                        onKeyDown={(e) => {

                          if (e.key === "Enter") {

                            e.preventDefault();

                            handleRenameConversation(conversation._id);

                          }

                          if (e.key === "Escape") {

                            setEditingConversation(null);

                            setNewTitle("");

                          }

                        }}
                        className="flex-1 border rounded px-2 py-1 text-xs"
                      />

                    ) : (

                      <span className="truncate">
                        {conversation.title}
                      </span>

                    )}

                  </div>

                  <div className="relative"
                    ref={menuOpen === conversation._id ? menuRef : null}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(
                          menuOpen === conversation._id ? null : conversation._id
                        );
                      }}
                      className="p-1 rounded hover:bg-slate-200 cursor-pointer"
                    >
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </button>

                    {menuOpen === conversation._id && (
                      <div className="absolute right-0 top-7 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-50">

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(null);
                            setEditingConversation(conversation._id);
                            setNewTitle(conversation.title);

                            // Rename later
                          }}
                          className="w-full px-3 py-2 text-left text-xs hover:bg-slate-100 cursor-pointer"
                        >
                          ✏ Rename
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(null);
                            handleDeleteConversation(conversation._id);
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          🗑 Delete
                        </button>

                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Tips section at bottom left column */}
          <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/30 text-xxs text-slate-500 leading-relaxed space-y-1.5">
            <Compass className="h-4 w-4 text-blue-500" />
            <p className="font-semibold text-slate-700">Quick Tutor Tip:</p>
            <p>You can upload syllabus guidelines or notes in the summarizer tab, then ask me to generate practice quizzes directly!</p>
          </div>
        </div>

        {/* Right Pane: Main chat screen area exactly as shown in screenshot 4 */}
        <div className={`flex-1 flex flex-col min-h-0 min-w-0 bg-white relative ${mobileActiveView === "chat" ? "flex" : "hidden lg:flex"
          }`}>
          {/* Chat Header Row - hidden on mobile to match Screenshot 1 */}
          <div className="hidden sm:flex px-6 py-4.5 border-b border-slate-100 items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0 relative">
                <Brain className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-white" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-slate-800 text-sm leading-none">AI Study Assistant</h4>
                {currentPdf && (
                  <span className="text-[15px] text-blue-600 font-semibold block mt-1">
                    📄 {currentPdf}
                  </span>
                )}
              </div>
            </div>

            {/* Middle Nav Tab buttons */}
            <div className="hidden sm:flex bg-slate-100/80 rounded-lg p-0.5 text-xs font-semibold text-slate-500">
              <button
                onClick={() => setActiveSession("current")}
                className={`px-3 py-1 rounded-md transition-all ${activeSession === "current" ? "bg-white text-slate-800 shadow-xxs" : "hover:text-slate-800"
                  }`}
              >
                Current Session
              </button>
              <button
                onClick={() => setActiveSession("history")}
                className={`px-3 py-1 rounded-md transition-all ${activeSession === "history" ? "bg-white text-slate-800 shadow-xxs" : "hover:text-slate-800"
                  }`}
              >
                History
              </button>
            </div>

            {/* Right utility items */}
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Scrollable Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Centered Session Started Tag capsule */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider border border-slate-200/40">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>Session Started</span>
              </span>
            </div>

            {messages.length === 0 ? (

              <div className="flex flex-col items-center justify-center h-full py-20 text-center">

                <Brain className="h-14 w-14 text-blue-500 mb-4" />

                <h2 className="text-2xl font-bold text-slate-800">
                  New Conversation
                </h2>

                <p className="text-slate-500 mt-2 max-w-md">
                  Ask me anything about programming, mathematics, science, or your study materials.
                </p>

              </div>

            ) : (

              messages.map((msg) => {

                const isAI = msg.role === "assistant";
                const isSystem = msg.role === "system";

                if (isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="flex justify-center"
                    >
                      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-xl text-sm">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (

                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 w-full max-w-[94%] sm:max-w-[85%] min-w-0 ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"
                      }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-xxs ${isAI
                        ? "bg-blue-50 border-blue-200 text-blue-600"
                        : "bg-purple-100 border-purple-200 text-purple-600"
                        }`}
                    >
                      {isAI ? (
                        <Brain className="h-4 w-4 text-blue-600" />
                      ) : (
                        <User className="h-4.5 w-4.5 text-purple-600" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`relative p-4 rounded-2xl text-sm leading-relaxed min-w-0 overflow-hidden w-full break-words ${isAI
                        ? "bg-[#f2f6ff] text-slate-800 border border-blue-100/80 rounded-tl-none"
                        : "bg-[#1e5af1] text-white rounded-tr-none shadow-md shadow-blue-600/5"
                        }`}
                    >

                      {msg.role === "assistant" && (
                        <button
                          onClick={() => handleDeleteChat(msg.id.replace("_a", ""))}
                          className="absolute top-2 right-2 p-1 rounded hover:bg-red-100 text-red-500 cursor-pointer"
                          title="Delete Chat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      <div className="space-y-1 min-w-0">
                        {isAI
                          ? renderMessageContent(msg.content)
                          : <p className="whitespace-pre-wrap">{msg.content}</p>}
                      </div>

                    </div>

                  </div>

                );

              })

            )}

            {/* AI Loader Bubble */}
            {isLoading && (
              <div className="flex items-start gap-3 max-w-[80%] mr-auto">
                <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xxs">
                  <Brain className="h-4 w-4 animate-bounce" />
                </div>
                <div className="px-4 py-3 bg-slate-50 text-slate-400 border border-slate-150 rounded-2xl rounded-tl-xs shadow-xxs flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Message Delivery Failed</p>
                  <p className="opacity-90">{error}</p>
                </div>
                <button
                  onClick={() => handleSendMessage(messages[messages.length - 1]?.content || "")}
                  className="p-1 hover:bg-rose-100 rounded text-rose-700"
                  title="Retry last message"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="h-4 shrink-0" />
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar Footer area exactly matching Screenshot 1 & 2 */}
          <div className="p-2 sm:p-4 pb-3 sm:pb-4 border-t border-slate-100 space-y-1.5 sm:space-y-2 bg-white shrink-0 w-full max-w-full min-w-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isLoading || !input.trim()) return;
                handleSendMessage(input);
              }}
              className="w-full h-12 sm:h-14 flex items-stretch bg-white border border-slate-400 rounded-full p-0 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all shadow-md min-w-0 overflow-hidden"
            >
              {/* Attachment paperclip with solid vertical partition line stretching top-to-bottom exactly */}
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="pdfUpload"
                  accept=".pdf"
                  hidden
                  onChange={handlePdfUpload}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="h-full px-4 text-slate-600 hover:text-slate-850 transition-colors cursor-pointer border-r border-slate-400 flex items-center justify-center shrink-0 rounded-l-full hover:bg-slate-50"
                >
                  <Paperclip />
                </button>
              </>
              {/* Input message field */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={isLoading}
                className="w-0 flex-1 h-full bg-transparent text-slate-800 text-sm focus:outline-none px-3 sm:px-4 font-sans font-medium min-w-0"
              />

              {/* Send circle with white plane icon pointing right */}
              <button
                type="submit"
                disabled={isLoading}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#1e5af1] hover:bg-[#154ec1] text-white flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shrink-0 mr-1.5 sm:mr-2 shadow-sm self-center"
              >
                <Send className="h-4.5 w-4.5 sm:h-5 sm:w-5 -mr-0.5" />
              </button>
            </form>

            {/* Accuracy disclaimer exactly matching screenshot footer */}
            <p className="text-[9px] sm:text-[10px] text-slate-400 text-center font-semibold font-sans">
              ScholarAI can make mistakes. Verify important academic information
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
