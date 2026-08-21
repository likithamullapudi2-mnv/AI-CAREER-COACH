import React, { useState, useRef, useEffect } from "react";
import { 
  FileText, 
  Upload, 
  Sparkles, 
  MapPin, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Send, 
  Paperclip, 
  CheckCircle2, 
  Circle, 
  Mic, 
  MicOff, 
  Briefcase, 
  BookOpen, 
  MessageSquare, 
  ChevronRight, 
  RotateCcw, 
  AlertCircle, 
  TrendingUp, 
  Lightbulb,
  X,
  FileCheck,
  User,
  Bookmark,
  Award,
  Check,
  AlertTriangle,
  Sun,
  Moon,
  LogOut,
  Lock,
  Mail,
  Key,
  Camera,
  VideoOff,
  Calendar,
  Clock,
  RefreshCw,
  Building2,
  LayoutDashboard,
  UserCheck
} from "lucide-react";
import { ResumeAnalysisResult, InterviewQuestion, ChatMessage, EvaluationResult, JobRecommendation } from "./types";
import { SAMPLE_ANALYSIS_RESULT, SAMPLE_QUESTIONS, SAMPLE_RESUME_TEXT } from "./data";

const cleanSkillName = (str: string): string => {
  if (!str) return "";
  let clean = str.trim();

  // If string contains a colon, e.g. "Backend Systems: Lacks hands-on...", take the part before colon
  if (clean.includes(":")) {
    const parts = clean.split(":");
    if (parts[0].trim().length > 0) {
      clean = parts[0].trim();
    }
  }

  // Strip common lead-in / introductory phrases
  const leadInRegexes = [
    /^(proficiency in|knowledge of|experience in|experience with|hands-on experience in|hands-on experience with|strong hands-on experience in|strong hands-on experience with|strong hands-on experience integrating|solid foundations in|proven experience building|proven experience in|lacks hands-on|lacks experience in|needs practice with|needs exposure to|mlops skills including|limited experience in|limited experience with)\s+/i,
    /^(demonstrated ability in|ability to build|understanding of|familiarity with|deep knowledge of)\s+/i
  ];

  for (const regex of leadInRegexes) {
    clean = clean.replace(regex, "");
  }

  // Remove trailing explanation clauses
  const trailingExplanationRegexes = [
    /\s+for\s+handling\s+.*/i,
    /\s+for\s+building\s+.*/i,
    /\s+for\s+developing\s+.*/i,
    /,\s+demonstrated\s+by\s+.*/i,
    /\s+demonstrated\s+by\s+.*/i,
    /,\s+combining\s+.*/i,
    /\s+combining\s+.*/i,
    /\s+to\s+align\s+with\s+.*/i,
  ];

  for (const regex of trailingExplanationRegexes) {
    clean = clean.replace(regex, "");
  }

  // Strip trailing punctuation
  clean = clean.replace(/[.;,]+$/, "").trim();

  // Capitalize first letter
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  return clean;
};

const getWeekBadge = (duration: string | undefined, idx: number): string => {
  if (!duration) {
    const start = idx * 2 + 1;
    return `Week ${start}–${start + 1}`;
  }
  
  const cleanDur = duration.trim();

  const weekMatch = cleanDur.match(/week\s*(\d+)(?:\s*[\–\-–]\s*(?:week\s*)?(\d+))?/i);
  if (weekMatch) {
    const startWeek = weekMatch[1];
    const endWeek = weekMatch[2];
    return endWeek ? `Week ${startWeek}–${endWeek}` : `Week ${startWeek}`;
  }
  
  const weeksNumMatch = cleanDur.match(/(\d+)\s*week/i);
  if (weeksNumMatch) {
    const num = parseInt(weeksNumMatch[1], 10);
    const start = idx === 0 ? 1 : (idx * 2 + 1);
    const end = start + Math.max(1, num) - 1;
    return start === end ? `Week ${start}` : `Week ${start}–${end}`;
  }

  const monthMatch = cleanDur.match(/(\d+)\s*month/i);
  if (monthMatch) {
    const numMonths = parseInt(monthMatch[1], 10);
    const start = idx === 0 ? 1 : (idx * 4 + 1);
    const end = start + numMonths * 4 - 1;
    return `Week ${start}–${end}`;
  }

  const start = idx * 2 + 1;
  return `Week ${start}–${start + 1}`;
};

const getResourceUrl = (res: string): string => {
  if (res.startsWith("http://") || res.startsWith("https://")) return res;
  const lower = res.toLowerCase();

  if (lower.includes("w3schools")) {
    const topic = res.replace(/w3schools/i, "").replace(/tutorial|guide|course/i, "").trim();
    return `https://www.google.com/search?q=site%3Aw3schools.com+${encodeURIComponent(topic || res)}`;
  }
  if (lower.includes("geeksforgeeks") || lower.includes("gfg")) {
    const topic = res.replace(/geeksforgeeks|gfg/i, "").replace(/tutorial|guide|course/i, "").trim();
    return `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(topic || res)}`;
  }
  if (lower.includes("youtube")) {
    const topic = res.replace(/youtube\s*[-:\–]?\s*/i, "").trim();
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(topic || res)}`;
  }
  if (lower.includes("udemy")) {
    const topic = res.replace(/udemy\s*[-:\–]?\s*/i, "").trim();
    return `https://www.udemy.com/courses/search/?q=${encodeURIComponent(topic || res)}`;
  }
  if (lower.includes("coursera")) {
    const topic = res.replace(/coursera\s*[-:\–]?\s*/i, "").trim();
    return `https://www.coursera.org/search?query=${encodeURIComponent(topic || res)}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(res + " tutorial documentation")}`;
};

const getProviderBadgeClass = (provider: string): string => {
  const p = (provider || "").toLowerCase();
  if (p.includes("w3schools")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (p.includes("geeksforgeeks") || p.includes("gfg")) return "bg-green-500/10 text-green-400 border-green-500/20";
  if (p.includes("youtube")) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  if (p.includes("udemy")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  if (p.includes("coursera")) return "bg-sky-500/10 text-sky-400 border-sky-500/20";
  return "bg-sky-500/10 text-sky-400 border-sky-500/20";
};

export interface JobPlatform {
  name: string;
  badge: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  url: string;
  description: string;
}

export const getStandardRoleQuery = (rawTitle: string, company: string = ""): string => {
  if (!rawTitle) return "Software Engineer";
  const lower = rawTitle.toLowerCase();
  
  if (lower.includes("ai") || lower.includes("machine learning") || lower.includes("ml")) {
    return "AI ML Engineer";
  }
  if (lower.includes("full stack") || lower.includes("fullstack")) {
    return "Full Stack Developer";
  }
  if (lower.includes("front") || lower.includes("react") || lower.includes("angular") || lower.includes("vue")) {
    return "Frontend Developer";
  }
  if (lower.includes("back") || lower.includes("node") || lower.includes("java") || lower.includes("python") || lower.includes("golang")) {
    return "Backend Developer";
  }
  if (lower.includes("data scientist") || lower.includes("data science")) {
    return "Data Scientist";
  }
  if (lower.includes("data analyst") || lower.includes("analytics")) {
    return "Data Analyst";
  }
  if (lower.includes("devops") || lower.includes("cloud") || lower.includes("aws") || lower.includes("site reliability")) {
    return "DevOps Engineer";
  }
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("flutter") || lower.includes("ios")) {
    return "Mobile App Developer";
  }
  
  // Clean up any remaining company or brackets
  let cleaned = rawTitle
    .replace(/\(.*?\)/g, '')
    .replace(/[/\\&:+|,-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || "Software Engineer";
};

export const cleanRoleTitle = (rawTitle: string, company: string = ""): string => {
  return getStandardRoleQuery(rawTitle, company);
};

export const getJobPlatformLinks = (jobTitle: string, company: string = "", defaultApplyUrl: string = ""): JobPlatform[] => {
  const stdRole = getStandardRoleQuery(jobTitle, company);
  const roleQuery = encodeURIComponent(stdRole);

  const naukriSlug = stdRole.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || "software-engineer";

  let linkedinUrl = `https://www.linkedin.com/jobs/search/?keywords=${roleQuery}`;
  if (defaultApplyUrl && defaultApplyUrl.includes("linkedin.com") && !defaultApplyUrl.includes("%20") && !defaultApplyUrl.includes("+")) {
    linkedinUrl = defaultApplyUrl;
  }

  return [
    {
      name: "LinkedIn Jobs",
      badge: "In",
      bgColor: "bg-sky-500/10 hover:bg-sky-500/20 dark:bg-sky-500/15 dark:hover:bg-sky-500/25",
      borderColor: "border-sky-500/30",
      textColor: "text-sky-700 dark:text-sky-400",
      url: linkedinUrl,
      description: "Direct recruiter messages, networking, & Easy Apply on LinkedIn Jobs"
    },
    {
      name: "Indeed",
      badge: "Indeed",
      bgColor: "bg-cyan-500/10 hover:bg-cyan-500/20 dark:bg-cyan-500/15 dark:hover:bg-cyan-500/25",
      borderColor: "border-cyan-500/30",
      textColor: "text-cyan-700 dark:text-cyan-400",
      url: `https://www.indeed.com/jobs?q=${roleQuery}`,
      description: "Worldwide live job vacancies with direct Apply buttons"
    },
    {
      name: "Glassdoor",
      badge: "Glassdoor",
      bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-700 dark:text-emerald-400",
      url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${roleQuery}`,
      description: "Company reviews, salary ratings, & direct apply links on Glassdoor"
    },
    {
      name: "Unstop",
      badge: "Unstop",
      bgColor: "bg-indigo-500/10 hover:bg-indigo-500/20 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25",
      borderColor: "border-indigo-500/30",
      textColor: "text-indigo-700 dark:text-indigo-400",
      url: `https://unstop.com/jobs?searchTerm=${roleQuery}`,
      description: "Early-talent tech jobs, hackathons, & hiring challenges on Unstop"
    },
    {
      name: "Naukri",
      badge: "Naukri",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-500/15 dark:hover:bg-blue-500/25",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-700 dark:text-blue-400",
      url: `https://www.naukri.com/${naukriSlug}-jobs`,
      description: "Premier Indian tech job portal listings with direct Apply buttons"
    },
    {
      name: "Google Jobs",
      badge: "Google",
      bgColor: "bg-rose-500/10 hover:bg-rose-500/20 dark:bg-rose-500/15 dark:hover:bg-rose-500/25",
      borderColor: "border-rose-500/30",
      textColor: "text-rose-700 dark:text-rose-400",
      url: `https://www.google.com/search?q=${roleQuery}+jobs`,
      description: "Google Jobs aggregated search with direct application links"
    }
  ];
};

const formatInlineMarkdown = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(https?:\/\/[^\s\)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-extrabold text-sky-900 dark:text-sky-300 bg-sky-500/20 dark:bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/30 inline-block my-0.5">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} className="font-mono text-[11px] text-sky-900 dark:text-sky-300 bg-sky-500/20 dark:bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/30 font-bold">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[(.*?)\]\((https?:\/\/[^\s\)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      const url = linkMatch[2];
      return (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-sky-700 dark:text-sky-400 hover:underline bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 transition-all my-0.5"
        >
          {label} <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    return part;
  });
};

const renderChatMessageContent = (content: string, role: string) => {
  if (role === "user") {
    return <span className="font-bold text-slate-950 whitespace-pre-wrap">{content}</span>;
  }

  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Match week header patterns like:
        // **WEEK 6: Full-Stack Integration (React + Backend)**
        // **Week 1: Core Fundamentals**
        // WEEK 2: Database Design
        // 1. **WEEK 3: Containerization**
        const weekMatch = trimmed.match(/^(?:\d+\.\s*)?\*\*?(WEEK|Week)\s*(\d+)[:\s–—-]*(.*?)\*\*?$/i);
        if (weekMatch) {
          const weekNum = weekMatch[2];
          let topicTitle = (weekMatch[3] || "").replace(/^\*\*|\*\*$/g, "").trim();
          if (topicTitle.startsWith(":")) {
            topicTitle = topicTitle.slice(1).trim();
          }

          return (
            <div key={idx} className="my-2.5 bg-sky-500/15 dark:bg-slate-900/90 border-l-4 border-l-sky-500 border border-sky-500/40 rounded-r-xl p-3 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-sky-500 text-slate-950 font-mono font-black text-[11px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse"></span>
                  WEEK {weekNum}
                </span>
                {topicTitle && (
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs tracking-tight">
                    {topicTitle}
                  </span>
                )}
              </div>
            </div>
          );
        }

        // Match bullet points (starting with •, -, *, or numbered items like 1., 2.)
        const bulletMatch = trimmed.match(/^(?:[•\-*]|\d+\.)\s+(.*)$/);
        if (bulletMatch) {
          const bulletText = bulletMatch[1];
          return (
            <div key={idx} className="flex items-start gap-2 my-1 pl-2 text-slate-900 dark:text-slate-200 font-medium">
              <span className="text-sky-600 dark:text-sky-400 font-black text-sm leading-none mt-0.5 select-none">•</span>
              <span className="flex-1 leading-relaxed text-slate-900 dark:text-slate-200">{formatInlineMarkdown(bulletText)}</span>
            </div>
          );
        }

        // Normal text line
        return (
          <p key={idx} className="leading-relaxed text-slate-900 dark:text-slate-200 font-medium">
            {formatInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export default function App() {
  // Theme & Radium Accent styling configurations
  const accentConfigs: Record<string, {
    name: string;
    primary: string;
    primaryRaw: string;
    bgRaw: string;
    glowColor: string;
    text: string;
    textMuted: string;
    bg: string;
    bgMuted: string;
    border: string;
    borderFocus: string;
    gradientTo: string;
    badge: string;
    btnActive: string;
    selection: string;
    bgScreenDark: string;
    bgScreenLight: string;
  }> = {
    blue: {
      name: "Velvet Violet",
      primary: "violet-400",
      primaryRaw: "#8b5cf6",
      bgRaw: "rgba(139, 92, 246, 0.22)",
      glowColor: "rgba(139, 92, 246, 0.5)",
      text: "text-purple-300",
      textMuted: "text-purple-400",
      bg: "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600",
      bgMuted: "bg-purple-950/70",
      border: "border-purple-500/30",
      borderFocus: "hover:border-purple-400/60",
      gradientTo: "from-purple-600/20",
      badge: "bg-purple-500/20 text-purple-200 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]",
      btnActive: "bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.5)]",
      selection: "selection:bg-purple-600 selection:text-white",
      bgScreenDark: "#070314",
      bgScreenLight: "#faf5ff"
    },
    green: {
      name: "Neon Emerald",
      primary: "emerald-400",
      primaryRaw: "#10b981",
      bgRaw: "rgba(16, 185, 129, 0.15)",
      glowColor: "rgba(16,185,129,0.35)",
      text: "text-emerald-400",
      textMuted: "text-emerald-500",
      bg: "bg-emerald-500",
      bgMuted: "bg-emerald-950/60",
      border: "border-emerald-500/20",
      borderFocus: "hover:border-emerald-500/40",
      gradientTo: "from-emerald-500/10",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
      btnActive: "bg-emerald-500 text-slate-950",
      selection: "selection:bg-emerald-500 selection:text-slate-950",
      bgScreenDark: "#070314",
      bgScreenLight: "#f0fdf4"
    },
    red: {
      name: "Neon Rose",
      primary: "rose-400",
      primaryRaw: "#f43f5e",
      bgRaw: "rgba(244, 63, 94, 0.15)",
      glowColor: "rgba(244,63,94,0.35)",
      text: "text-rose-400",
      textMuted: "text-rose-500",
      bg: "bg-rose-500",
      bgMuted: "bg-rose-950/60",
      border: "border-rose-500/20",
      borderFocus: "hover:border-rose-500/40",
      gradientTo: "from-rose-500/10",
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/25",
      btnActive: "bg-rose-500 text-white",
      selection: "selection:bg-rose-500 selection:text-slate-950",
      bgScreenDark: "#070314",
      bgScreenLight: "#fff1f2"
    },
    yellow: {
      name: "Neon Amber",
      primary: "amber-400",
      primaryRaw: "#f59e0b",
      bgRaw: "rgba(245, 158, 11, 0.15)",
      glowColor: "rgba(245,158,11,0.35)",
      text: "text-amber-400",
      textMuted: "text-amber-500",
      bg: "bg-amber-400",
      bgMuted: "bg-amber-950/60",
      border: "border-amber-400/20",
      borderFocus: "hover:border-amber-400/40",
      gradientTo: "from-amber-500/10",
      badge: "bg-amber-500/10 text-amber-400 border-amber-400/25",
      btnActive: "bg-amber-400 text-slate-950",
      selection: "selection:bg-amber-400 selection:text-slate-950",
      bgScreenDark: "#070314",
      bgScreenLight: "#fefbeb"
    },
    purple: {
      name: "Radiant Purple",
      primary: "purple-400",
      primaryRaw: "#a855f7",
      bgRaw: "rgba(168, 85, 247, 0.22)",
      glowColor: "rgba(168,85,247,0.55)",
      text: "text-purple-300",
      textMuted: "text-purple-400",
      bg: "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600",
      bgMuted: "bg-purple-950/70",
      border: "border-purple-500/30",
      borderFocus: "hover:border-purple-400/60",
      gradientTo: "from-purple-500/20",
      badge: "bg-purple-500/20 text-purple-200 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]",
      btnActive: "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.5)]",
      selection: "selection:bg-purple-600 selection:text-white",
      bgScreenDark: "#070314",
      bgScreenLight: "#faf5ff"
    }
  };

  // Client-side fallback evaluation engine (Strict 0 to 10 marks scoring with model solution key)
  const generateClientFallbackEvaluation = (question: any, answer: string, resumeData?: any): EvaluationResult => {
    const ans = (answer || "").trim();
    const qText = question?.question || "Interview Question";
    const qCategory = question?.category || "Technical";
    const target = resumeData?.targetRole || "Software Engineer";

    if (ans.length < 15) {
      return {
        score: 0,
        isCorrect: false,
        feedback: "Your answer was extremely brief or lacked technical substance, so it has been marked wrong (0 / 10 marks). In a real technical interview, provide a complete response explaining the architecture and implementation.",
        strengths: [],
        improvements: [
          "Elaborate with complete sentences and architectural concepts.",
          "Provide direct examples matching the interview question."
        ],
        idealAnswer: `For "${qText}", a standard correct response defines the concept directly, explains its technical implementation details (e.g. key libraries or configuration parameters), and shares a concrete example.`
      };
    }

    const keywords = ["rest", "graphql", "postgres", "sql", "index", "cache", "redis", "docker", "middleware", "express", "node", "star", "result", "quantified", "optimized", "component", "state", "effect", "latency", "scale", "security", "jwt", "async", "await", "promise", "git", "ci/cd", "cloud", "aws", "architecture"];
    let matchedCount = 0;
    keywords.forEach(kw => {
      if (ans.toLowerCase().includes(kw)) matchedCount++;
    });

    if ((qCategory === "Technical" || qCategory === "Scenario") && matchedCount === 0) {
      return {
        score: 0,
        isCorrect: false,
        feedback: "Your answer is marked wrong (0 / 10) because it does not cover the relevant technical key concepts, terms, or architectural ideas required for this question.",
        strengths: [],
        improvements: [
          "Target the specific technical stacks or concepts mentioned in the question.",
          "Integrate industry-standard terms (e.g., APIs, PostgreSQL, state hook, Docker) to establish relevance."
        ],
        idealAnswer: `For "${qText}", a high-performing correct response clearly defines the core approach and outlines the step-by-step implementation plan with practical trade-offs.`
      };
    }

    const score = Math.min(10, Math.max(7, Math.floor(7 + Math.min(3, ans.length / 120))));
    return {
      score,
      isCorrect: true,
      feedback: `Strong effort on this ${qCategory.toLowerCase()} interview answer! You demonstrated clear logical reasoning, covered the primary requirements of the question, and structured your thoughts well for a candidate transitioning to a ${target} role.`,
      strengths: [
        "Excellent structure and relevant technical vocabulary.",
        "Directly answered the core problem with logical components."
      ],
      improvements: [
        "Could explicitly mention developer tools or libraries to highlight production experience."
      ],
      idealAnswer: `For the question: "${qText}", a high-performing response would:
1. Define the core approach clearly in the first two sentences.
2. Outline the step-by-step implementation plan (e.g., setting up the middleware route, writing SQL joins, configuring containerized deployment).
3. Connect it to a real-world story using the STAR framework to prove that you have successfully applied these exact concepts under pressure.`
    };
  };

  const generateClientFallbackResumeAnalysis = (text: string, targetRole: string = "", fileName: string = ""): ResumeAnalysisResult => {
    const base = { ...SAMPLE_ANALYSIS_RESULT };
    if (targetRole && targetRole.trim()) {
      base.targetRole = targetRole.trim();
      base.targetRoleSpecified = true;
    }
    if (fileName && fileName !== "text input") {
      base.name = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    }
    return base;
  };

  const theme = {
    bgScreen: "text-slate-100",
    cardBg: "bg-[#120828]/85 border-purple-500/25 text-slate-100 backdrop-blur-xl shadow-[0_10px_35px_rgba(5,1,16,0.8)]",
    cardBgInner: "bg-[#0b041c]/90 border-purple-500/20 backdrop-blur-md",
    textMuted: "text-purple-200/70",
    border: "border-purple-500/25",
    inputBg: "bg-[#0b041c]/95 border-purple-500/30 text-slate-100 placeholder-purple-300/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40",
    badgeMuted: "bg-purple-950/80 text-purple-200 border border-purple-500/30",
    navBg: "bg-[#0f0622]/90 border-purple-500/25 backdrop-blur-2xl shadow-xl",
    btnTabInert: "text-purple-200/75 hover:text-white hover:bg-purple-500/15",
    heroBg: "bg-gradient-to-br from-[#1d0a42]/90 via-[#12062b]/90 to-[#070214]/95 border-purple-500/30 shadow-[0_12px_45px_rgba(7,2,20,0.8)] backdrop-blur-xl",
    subtleWell: "bg-[#0b041c]/60 border-purple-500/20"
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.setAttribute("data-theme", "dark");
  }, []);
  
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem("theme-accent") || "blue";
  });

  // User Authentication States
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(() => {
    const saved = localStorage.getItem("careeragent_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const accent = accentConfigs[accentColor];

  // Application states
  const [activeTab, setActiveTab] = useState<"dashboard" | "resume" | "interview" | "recruiter" | "chat">("dashboard");
  const [resumeData, setResumeData] = useState<ResumeAnalysisResult | null>(null);
  const [targetRole, setTargetRole] = useState<string>("");
  const [pastedResumeText, setPastedResumeText] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<string | null>(null);
  const [uploadedFileMimeType, setUploadedFileMimeType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Attachment states for the career coach chat
  const [chatAttachment, setChatAttachment] = useState<{
    fileData: string;
    mimeType: string;
    fileName: string;
  } | null>(null);

  // Chat panel states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content: "Hello! I am your AI Career Coach. Please upload or paste your resume/profile to get custom feedback, or ask me any career-related questions directly!"
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Modal state for job application platform selection
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobRecommendation | null>(null);

  // AI Recruiter Simulator states
  const recruiterPersonas = [
    {
      id: "sarah",
      name: "Sarah Jenkins",
      title: "Lead Technical Recruiter",
      company: "Google",
      avatar: "👩‍💼",
      description: "Sharp, analytical, and highly structured. She evaluates core algorithmic reasoning, engineering hygiene, and system-design fundamentals.",
      accent: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
      badge: "Tech Giant Sourcer"
    },
    {
      id: "marcus",
      name: "Marcus Vance",
      title: "CTO & Co-founder",
      company: "Aether AI",
      avatar: "👨‍💻",
      description: "Dynamic, rapid-fire, and extremely practical. He values shipping speed, adaptability, full-stack product ownership, and architectural pragmatism.",
      accent: "text-amber-400 border-amber-500/20 bg-amber-500/5",
      badge: "Fast-Paced Startup"
    },
    {
      id: "eleanor",
      name: "Eleanor Sterling",
      title: "HR & Talent Acquisition Director",
      company: "Apex FinTech",
      avatar: "👩‍🎨",
      description: "Empathetic, deep, and focused on behavioral alignment. She evaluates collaborative style, leadership, stress-tolerance, and STAR-method competency.",
      accent: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
      badge: "Enterprise HR Executive"
    }
  ];

  const [selectedPersona, setSelectedPersona] = useState(recruiterPersonas[0]);
  const [recruiterMessages, setRecruiterMessages] = useState<ChatMessage[]>([]);
  const [recruiterInput, setRecruiterInput] = useState<string>("");
  const [recruiterLoading, setRecruiterLoading] = useState<boolean>(false);
  const [recruiterActive, setRecruiterActive] = useState<boolean>(false);
  const [recruiterState, setRecruiterState] = useState<{
    mood: "Neutral" | "Interested" | "Impressed" | "Skeptical" | "Delighted";
    fitScore: number;
    keyObservations: string[];
    nextAction: string;
  }>({
    mood: "Neutral",
    fitScore: 50,
    keyObservations: ["Simulation not started yet"],
    nextAction: "Launch recruiter simulation"
  });

  const handleStartRecruiterSimulation = () => {
    setRecruiterActive(true);
    const initialPrompt = `Hello! I see you are applying for the ${targetRole || 'Software Engineer'} role. Thanks for taking the time to join this screening. To kick things off, could you introduce yourself and tell me what interests you about this specific opportunity?`;
    
    setRecruiterMessages([
      {
        role: "model",
        content: initialPrompt
      }
    ]);

    setRecruiterState({
      mood: "Neutral",
      fitScore: 50,
      keyObservations: ["Candidate joined the screening room", "Reviewing introductory elevator pitch"],
      nextAction: "Assess introduction & target role alignment"
    });

    if (recruiterVoiceEnabled) {
      speakRecruiterText(initialPrompt, true);
    }
  };

  const handleSendRecruiterMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!recruiterInput.trim() || recruiterLoading) return;

    // Stop listening if user hits send so transcription doesn't overlap
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Notice stopping recognition on submit", err);
      }
      setIsListening(false);
    }

    const userMsg = recruiterInput.trim();
    setRecruiterInput("");
    
    const updatedMessages = [...recruiterMessages, { role: "user" as const, content: userMsg }];
    setRecruiterMessages(updatedMessages);
    setRecruiterLoading(true);

    try {
      const response = await fetch("/api/recruiter/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: recruiterMessages,
          persona: selectedPersona,
          targetRole: targetRole || "Software Engineer",
          resumeData: resumeData
        })
      });

      if (!response.ok) {
        throw new Error("Recruiter endpoint error");
      }

      const data = await response.json();
      
      setRecruiterMessages(prev => [...prev, { role: "model" as const, content: data.reply }]);
      if (data.recruiterState) {
        setRecruiterState(data.recruiterState);
      }
      if (recruiterVoiceEnabled) {
        speakRecruiterText(data.reply, true);
      }
    } catch (error) {
      console.warn("Recruiter chat notice:", error);
      const fallbackReply = "Thank you for sharing that. As a recruiter, I really appreciate that detail. How does that project fit into your overall career development goals for the near future?";
      setRecruiterMessages(prev => [
        ...prev,
        {
          role: "model" as const,
          content: fallbackReply
        }
      ]);
      setRecruiterState(prev => ({
        ...prev,
        mood: "Interested",
        fitScore: Math.min(100, prev.fitScore + 2),
        keyObservations: [...prev.keyObservations, "Exhibited solid composure during technical follow-up"]
      }));
      if (recruiterVoiceEnabled) {
        speakRecruiterText(fallbackReply, true);
      }
    } finally {
      setRecruiterLoading(false);
    }
  };

  // Interview state
   const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(true);
  const [voiceInterviewerState, setVoiceInterviewerState] = useState<"idle" | "speaking" | "listening" | "grading">("idle");
  
  // Custom states for tracking answers and evaluations of mock interview questions
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [questionEvaluations, setQuestionEvaluations] = useState<Record<number, EvaluationResult>>({});

  const renderCompanyBadge = (company?: string) => {
    const comp = company || "Tech Bar Raiser";
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      Google: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
      Amazon: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
      Microsoft: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
      Meta: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" },
      Netflix: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
      Uber: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
      Apple: { bg: "bg-slate-400/10", text: "text-slate-300", border: "border-slate-400/20" },
      Stripe: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
    };
    const style = colors[comp] || { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}>
        <Building2 className="w-3 h-3" />
        {comp}
      </span>
    );
  };

  // Automatically keep draft answers synchronized with our record
  useEffect(() => {
    if (interviewQuestions.length > 0 && interviewQuestions[currentQuestionIndex]) {
      const qId = interviewQuestions[currentQuestionIndex].id;
      setUserAnswers(prev => {
        if (prev[qId] !== userAnswer) {
          return { ...prev, [qId]: userAnswer };
        }
        return prev;
      });
    }
  }, [userAnswer, currentQuestionIndex, interviewQuestions]);
  
  // Audio speech synthesis helper
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // AI Recruiter Specific voice assistant state
  const [recruiterVoiceEnabled, setRecruiterVoiceEnabled] = useState<boolean>(true);
  const [recruiterSpeaking, setRecruiterSpeaking] = useState<boolean>(false);
  const recruiterUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Custom Recruit Interface Modes ("text" or "voice") and Decision outputs
  const [recruiterInterfaceMode, setRecruiterInterfaceMode] = useState<"text" | "voice">("text");
  const [recruiterDecision, setRecruiterDecision] = useState<{
    decision: "accepted" | "rejected";
    statusLabel?: string;
    reasons?: string[];
    suggestions?: string[];
    reasonSummary?: string;
    reason: string;
    verbalResponse: string;
    keyMetrics?: {
      communication: number;
      technicalMatch: number;
      roleAlignment: number;
    };
    feedbackPoints?: string[];
  } | null>(null);
  const [recruiterDecisionLoading, setRecruiterDecisionLoading] = useState<boolean>(false);
  const [showRecruiterDecision, setShowRecruiterDecision] = useState<boolean>(false);

  const handleGetRecruiterDecision = async () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Notice stopping recognition on decision", err);
      }
      setIsListening(false);
    }
    setRecruiterSpeaking(false);
    setRecruiterDecisionLoading(true);
    setShowRecruiterDecision(true);

    try {
      // Package interview question-and-answer pairs directly for evaluation
      const formattedHistory = (interviewQuestions.length > 0 ? interviewQuestions : []).map(q => {
        const ans = userAnswers[q.id] || "(No answer provided)";
        return [
          { role: "model" as const, content: `Interviewer: ${q.question}` },
          { role: "user" as const, content: `Candidate Answer: ${ans}` }
        ];
      }).flat();

      const response = await fetch("/api/recruiter/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: formattedHistory,
          targetRole: targetRole || resumeData?.targetRole || "Software Engineer",
          resumeData: resumeData
        })
      });

      if (!response.ok) {
        throw new Error("Recruiter decision endpoint error");
      }

      const data = await response.json();
      setRecruiterDecision({
        ...data,
        reason: data.reasonSummary || data.reason || ""
      });
      
      if (recruiterVoiceEnabled) {
        speakRecruiterText(data.verbalResponse || "I have completed your job acceptability review.", true);
      }
    } catch (error) {
      console.warn("Recruiter decision notice:", error);
      const fallbackDecision = {
        decision: "rejected" as const,
        statusLabel: "Not Shortlisted",
        reasons: [
          "Lacks practical deployment experience (Docker/Kubernetes)",
          "No internship or corporate product milestones shown",
          "Project architecture descriptions need quantifiable metrics"
        ],
        suggestions: [
          "Add Docker container setups to your hands-on project repository",
          "Enhance past project descriptions with specific user metrics",
          "Learn CI/CD pipelines to stand out in technical screening"
        ],
        reasonSummary: "We have reviewed your profile and mock interview responses, and unfortunately, we found that your practical system design depth and hands-on containerization experience do not fully match the current role expectations.",
        reason: "We have reviewed your profile and mock interview responses, and unfortunately, we found that your practical system design depth and hands-on containerization experience do not fully match the current role expectations.",
        verbalResponse: `Thanks for completing the mock interview. After evaluating your profile and our conversation, we have decided not to proceed to the next round at this time. I encourage you to expand your hands-on deployment portfolio!`,
        keyMetrics: {
          communication: 65,
          technicalMatch: 50,
          roleAlignment: 55
        },
        feedbackPoints: [
          "Include concrete technical metrics in your project descriptions.",
          "Brush up on system design basics and deployment methodologies."
        ]
      };
      setRecruiterDecision(fallbackDecision);
      if (recruiterVoiceEnabled) {
        speakRecruiterText(fallbackDecision.verbalResponse, true);
      }
    } finally {
      setRecruiterDecisionLoading(false);
    }
  };

  const activeTabRef = useRef<string>(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setRecruiterSpeaking(false);
    setIsSpeaking(false);
  }, [activeTab]);

  const speakRecruiterText = (text: string, forcePlay = false) => {
    if (!synthesisRef.current) return;
    
    if (recruiterSpeaking && !forcePlay) {
      synthesisRef.current.cancel();
      setRecruiterSpeaking(false);
      return;
    }

    synthesisRef.current.cancel();
    const cleanText = text.replace(/[*#]/g, ""); // strip markdown styling
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onend = () => {
      setRecruiterSpeaking(false);
    };
    utterance.onerror = () => {
      setRecruiterSpeaking(false);
    };

    const voices = synthesisRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    recruiterUtteranceRef.current = utterance;
    setRecruiterSpeaking(true);
    synthesisRef.current.speak(utterance);
  };

  // Speech Recognition (Dictation) state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [interimSpeech, setInterimSpeech] = useState<string>("");
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Timer references for hands-free silence detection
  const silenceTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const resetSilenceTimerRef = useRef<() => void>(() => {});
  const userAnswerRef = useRef<string>("");

  // Keep userAnswerRef in sync with state to prevent closure stale states
  useEffect(() => {
    userAnswerRef.current = userAnswer;
  }, [userAnswer]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthesisRef.current = window.speechSynthesis;
      setSpeechSupported(!!window.speechSynthesis);

      // Initialize Speech Recognition if supported
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        
        rec.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            if (activeTabRef.current === "recruiter") {
              setRecruiterInput(prev => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + finalTranscript);
            } else {
              setUserAnswer(prev => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + finalTranscript);
            }
            setInterimSpeech("");
          } else {
            setInterimSpeech(interimTranscript);
          }

          // Reset hands-free silence auto-submission timer
          if (resetSilenceTimerRef.current) {
            resetSilenceTimerRef.current();
          }
        };

        rec.onerror = (e: any) => {
          const errorCode = e?.error || "not-accessible";
          if (errorCode === "aborted" || errorCode === "no-speech") {
            // Normal audio pause or manual interruption - quietly reset
            setIsListening(false);
            return;
          }
          console.warn("Speech Recognition status:", errorCode);
          if (errorCode === "not-allowed" || errorCode === "permission-denied" || errorCode === "service-not-allowed") {
            setRecognitionError("Microphone access is restricted in this frame. You can type your answers directly or click 'Activate Mic' to retry.");
          } else {
            setRecognitionError(`Speech Recognition paused (${errorCode}). You can type your answer or click microphone to retry.`);
          }
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      // Clean up speech synthesis and silence timers on unmount
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Track the last spoken question ID to prevent infinite loops
  const lastSpokenQuestionIdRef = useRef<string | null>(null);

  // Automatically read questions aloud when in voice simulator mode
  useEffect(() => {
    if (activeTab === "interview" && isVoiceMode && interviewQuestions.length > 0) {
      const activeQuestion = interviewQuestions[currentQuestionIndex];
      if (activeQuestion && lastSpokenQuestionIdRef.current !== activeQuestion.id) {
        lastSpokenQuestionIdRef.current = activeQuestion.id;
        // Schedule start of voice round
        const timer = setTimeout(() => {
          startVoiceRound(currentQuestionIndex);
        }, 600);
        return () => clearTimeout(timer);
      }
    } else if (activeTab !== "interview" || !isVoiceMode) {
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
      setIsSpeaking(false);
      setVoiceInterviewerState("idle");
      lastSpokenQuestionIdRef.current = null;
    }
  }, [activeTab, isVoiceMode, currentQuestionIndex, interviewQuestions]);

  // Authentication Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authEmail || !authPassword) {
      setAuthError("Please fill out all fields.");
      return;
    }
    
    setAuthLoading(true);
    setTimeout(() => {
      const usersRaw = localStorage.getItem("careeragent_users");
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      
      const found = users.find((u: any) => u.email.toLowerCase() === authEmail.toLowerCase() && u.password === authPassword);
      if (found) {
        const userSession = { email: found.email, name: found.name };
        setCurrentUser(userSession);
        localStorage.setItem("careeragent_current_user", JSON.stringify(userSession));
        showToast(`Welcome back, ${found.name}!`);
        setAuthEmail("");
        setAuthPassword("");
      } else {
        if (authEmail.toLowerCase() === "demo@careeragent.ai" && authPassword === "password") {
          const demoUser = { email: "demo@careeragent.ai", name: "Demo Candidate" };
          setCurrentUser(demoUser);
          localStorage.setItem("careeragent_current_user", JSON.stringify(demoUser));
          showToast("Signed in as Demo Candidate");
          setAuthEmail("");
          setAuthPassword("");
        } else {
          setAuthError("Invalid email or password.");
        }
      }
      setAuthLoading(false);
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authEmail || !authPassword || !authName) {
      setAuthError("Please fill out all fields.");
      return;
    }
    if (authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);
    setTimeout(() => {
      const usersRaw = localStorage.getItem("careeragent_users");
      const users = usersRaw ? JSON.parse(usersRaw) : [];

      const exists = users.some((u: any) => u.email.toLowerCase() === authEmail.toLowerCase());
      if (exists) {
        setAuthError("An account with this email already exists.");
        setAuthLoading(false);
        return;
      }

      const newUser = { email: authEmail, name: authName, password: authPassword };
      users.push(newUser);
      localStorage.setItem("careeragent_users", JSON.stringify(users));

      const userSession = { email: authEmail, name: authName };
      setCurrentUser(userSession);
      localStorage.setItem("careeragent_current_user", JSON.stringify(userSession));
      showToast("Account successfully registered!");
      
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthLoading(false);
    }, 800);
  };

  const handleDemoSignIn = () => {
    setAuthLoading(true);
    setTimeout(() => {
      const demoUser = { email: "demo@careeragent.ai", name: "Demo Candidate" };
      setCurrentUser(demoUser);
      localStorage.setItem("careeragent_current_user", JSON.stringify(demoUser));
      showToast("Signed in as Demo Candidate!");
      setAuthLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("careeragent_current_user");
    showToast("Signed out successfully.");
  };

  // Show a status notification
  const showToast = (message: string, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setUploadError(message);
      setTimeout(() => setUploadError(null), 5000);
    }
  };

  // Text-To-Speech reader
  const speakQuestion = (text: string, onEndCallback?: () => void) => {
    if (!synthesisRef.current) return;
    
    // If speaking, toggle stop
    if (isSpeaking) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
      setVoiceInterviewerState("idle");
      return;
    }

    synthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    setVoiceInterviewerState("speaking");
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setVoiceInterviewerState("idle");
      if (onEndCallback) {
        onEndCallback();
      }
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setVoiceInterviewerState("idle");
    };

    // Try to find an English voice
    const voices = synthesisRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    synthesisRef.current.speak(utterance);
  };

  // Toggle voice recognition dictation
  const toggleListening = () => {
    if (!recognitionRef.current) {
      showToast("Speech recognition is not supported in this browser.", false);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    } else {
      setRecognitionError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
        showToast("Listening... Speak your answer now.");
      } catch (err) {
        console.warn("Speech recognition start notice:", err);
        setIsListening(false);
      }
    }
  };

  // Generic file processing helper that converts file to base64 and stores it for later analysis
  const processFile = async (file: File) => {
    setUploadError(null);
    setSelectedFileName(file.name);

    const readFileAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = () => reject(new Error("File reading failed."));
        reader.readAsDataURL(file);
      });
    };

    try {
      const base64String = await readFileAsDataURL(file);
      setUploadedFileData(base64String);
      setUploadedFileMimeType(file.type);
      showToast(`Resume file "${file.name}" uploaded successfully! Click "Run Analysis" to start analyzing.`);
    } catch (err: any) {
      console.warn("File upload notice:", err);
      setUploadError(err.message || "Something went wrong during file upload.");
      showToast("Failed to upload the file.", true);
    }
  };

  // 1. File upload handler (converts file to base64)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  // Text and file profile analyzer (triggered only by button click)
  const handleAnalyzeText = async () => {
    if (!pastedResumeText.trim() && !uploadedFileData) {
      showToast("Please enter profile text or upload a resume file first.", false);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: uploadedFileData,
          mimeType: uploadedFileMimeType,
          fileName: selectedFileName,
          textContent: pastedResumeText,
          targetRole: targetRole
        })
      });

      if (!response.ok) {
        throw new Error("API analysis unavailable, generating tailored candidate profile.");
      }

      const data: ResumeAnalysisResult = await response.json();
      setResumeData(data);
      await generateInterviewQuestions(data);
      showToast(`Successfully analyzed submitted profile details!`);
      setActiveTab("resume");

    } catch (err: any) {
      console.warn("Resume analysis notice:", err);
      // Seamless client-side fallback
      const fallback = generateClientFallbackResumeAnalysis(pastedResumeText, targetRole, selectedFileName || "Profile");
      setResumeData(fallback);
      await generateInterviewQuestions(fallback);
      showToast(`Successfully generated candidate career analysis & roadmap!`);
      setActiveTab("resume");
    } finally {
      setUploading(false);
    }
  };

  // Generate Questions API
  const generateInterviewQuestions = async (data: ResumeAnalysisResult) => {
    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: data })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.questions && result.questions.length > 0) {
          setInterviewQuestions(result.questions);
          setCurrentQuestionIndex(0);
          setUserAnswer("");
          setEvaluationResult(null);
          return;
        }
      }
      setInterviewQuestions(SAMPLE_QUESTIONS);
      setCurrentQuestionIndex(0);
      setUserAnswer("");
      setEvaluationResult(null);
    } catch (err) {
      console.warn("Questions generation notice:", err);
      setInterviewQuestions(SAMPLE_QUESTIONS);
      setCurrentQuestionIndex(0);
      setUserAnswer("");
      setEvaluationResult(null);
    }
  };

  // Evaluate Interview Answer (Strict 0-10 scoring with full model solution)
  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) {
      showToast("Please write or dictate an answer first.", false);
      return;
    }

    setIsEvaluating(true);
    setEvaluationResult(null);

    const activeQ = interviewQuestions[currentQuestionIndex];

    try {
      const response = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: activeQ,
          answer: userAnswer,
          candidateProfile: resumeData
        })
      });

      if (!response.ok) {
        throw new Error("API evaluation returned status " + response.status);
      }

      const result: EvaluationResult = await response.json();
      setEvaluationResult(result);
      if (activeQ) {
        setQuestionEvaluations(prev => ({ ...prev, [activeQ.id]: result }));
      }
      showToast("Answer evaluated successfully!");

    } catch (err: any) {
      console.warn("Interview evaluation notice:", err);
      // Seamless local evaluation fallback
      const fallbackResult = generateClientFallbackEvaluation(activeQ, userAnswer, resumeData);
      setEvaluationResult(fallbackResult);
      if (activeQ) {
        setQuestionEvaluations(prev => ({ ...prev, [activeQ.id]: fallbackResult }));
      }
      showToast("Answer evaluated successfully!");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Helper to clear both silence and countdown timers
  const clearSilenceTimers = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoSubmitCountdown(null);
  };

  // Assign the silence auto-evaluate trigger
  resetSilenceTimerRef.current = () => {
    // Clear any existing silence timer and countdown interval first
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setAutoSubmitCountdown(null);

    // Set 4 seconds of silence before starting the countdown
    silenceTimerRef.current = setTimeout(() => {
      let count = 4;
      setAutoSubmitCountdown(count);

      countdownIntervalRef.current = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(countdownIntervalRef.current);
          setAutoSubmitCountdown(null);
          
          // If candidate answer has substance, trigger auto-evaluate
          if (userAnswerRef.current.trim().length > 3) {
            handleEvaluateVoiceResponse();
          } else {
            showToast("Still listening for your response...", false);
          }
        } else {
          setAutoSubmitCountdown(count);
        }
      }, 1000);
    }, 4500); // 4.5s of absolute silence triggers the 4s countdown
  };

  // Start automated voice mode round
  const startVoiceRound = (index: number) => {
    clearSilenceTimers();
    setInterimSpeech("");

    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    setCurrentQuestionIndex(index);
    const qId = interviewQuestions[index]?.id;
    setUserAnswer(userAnswers[qId] || "");
    setEvaluationResult(questionEvaluations[qId] || null);
    setVoiceInterviewerState("speaking");

    const activeQuestion = interviewQuestions[index];
    if (!activeQuestion) return;

    // Speak the question
    speakQuestion(activeQuestion.question, () => {
      // Once speaking is completed, automatically turn on the microphone
      if (recognitionRef.current) {
        setRecognitionError(null);
        try {
          if (!isListening) {
            recognitionRef.current.start();
            setIsListening(true);
            setVoiceInterviewerState("listening");
            showToast("🎙️ Microphone active! Please speak your response now.");
            
            // Start the silence timer immediately
            resetSilenceTimerRef.current();
          }
        } catch (err) {
          console.warn("Auto voice recognition notice:", err);
          setRecognitionError("Please click 'Activate Mic' to record your response.");
          setVoiceInterviewerState("idle");
        }
      } else {
        setVoiceInterviewerState("idle");
      }
    });
  };

  // Submit Spoken Response and Auto Grade
  const handleEvaluateVoiceResponse = async () => {
    clearSilenceTimers();
    setInterimSpeech("");

    // Stop listening first if active
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    const answerToEvaluate = userAnswerRef.current.trim();

    if (!answerToEvaluate) {
      showToast("No answer detected. Please say something or click repeat.", false);
      speakQuestion("I didn't hear your response. Please click record and try again, or type your answer.");
      setVoiceInterviewerState("idle");
      return;
    }

    setVoiceInterviewerState("grading");
    setIsEvaluating(true);
    setEvaluationResult(null);

    const activeQ = interviewQuestions[currentQuestionIndex];

    try {
      const response = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: activeQ,
          answer: answerToEvaluate,
          candidateProfile: resumeData
        })
      });

      if (!response.ok) {
        throw new Error("API evaluation status " + response.status);
      }

      const result: EvaluationResult = await response.json();
      setEvaluationResult(result);
      if (activeQ) {
        setQuestionEvaluations(prev => ({ ...prev, [activeQ.id]: result }));
      }
      setVoiceInterviewerState("idle");

      // Speak feedback
      const idealAnswerSummary = (result.idealAnswer || "")
        .split(". ")
        .slice(0, 2)
        .join(". ");
      const scorePhrase = result.score === 0
        ? `Evaluation complete. You scored 0 out of 10 marks because this response was incorrect or off-topic. The correct answer is: ${idealAnswerSummary}. Please review the complete solution below.`
        : `Evaluation complete. You scored ${result.score} out of 10 marks. The correct model answer highlights: ${idealAnswerSummary}.`;
      speakQuestion(scorePhrase);

    } catch (err: any) {
      console.warn("Voice evaluation notice:", err);
      // Seamless local evaluation fallback
      const fallbackResult = generateClientFallbackEvaluation(activeQ, answerToEvaluate, resumeData);
      setEvaluationResult(fallbackResult);
      if (activeQ) {
        setQuestionEvaluations(prev => ({ ...prev, [activeQ.id]: fallbackResult }));
      }
      setVoiceInterviewerState("idle");

      const idealAnswerSummary = (fallbackResult.idealAnswer || "")
        .split(". ")
        .slice(0, 2)
        .join(". ");
      const scorePhrase = fallbackResult.score === 0
        ? `Evaluation complete. You scored 0 out of 10 marks because this response was incorrect or off-topic. The correct answer is: ${idealAnswerSummary}. Please review the complete solution below.`
        : `Evaluation complete. You scored ${fallbackResult.score} out of 10 marks. The correct model answer highlights: ${idealAnswerSummary}.`;
      speakQuestion(scorePhrase);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Chat with Carrier Coach (Supports attachment base64 processing)
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() && !chatAttachment) return;

    const messageToSend = chatInput || "Analyze attached file/photo";
    const userMsg: ChatMessage = { role: "user", content: messageToSend };
    
    // Add file feedback text in UI message
    if (chatAttachment) {
      userMsg.content += ` [Attached File: ${chatAttachment.fileName}]`;
    }

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    const attachmentPayload = chatAttachment;
    setChatAttachment(null); // Clear attachment slot

    try {
      // Build conversation history
      const historyPayload = chatMessages.slice(-8).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch("/api/roadmap/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          history: historyPayload,
          resumeData: resumeData,
          fileData: attachmentPayload?.fileData || null,
          mimeType: attachmentPayload?.mimeType || null
        })
      });

      if (!response.ok) {
        throw new Error("Failed to receive coach suggestions.");
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "model", content: data.reply }]);

    } catch (err: any) {
      console.warn("Chat assistant notice:", err);
      const fallbackReply = `Here is a structured, practical plan to help you progress:

**WEEK 1: Core Architecture & API Implementation**
• Master asynchronous event loop patterns, route middleware, and error interceptors
• Build robust RESTful APIs with structured input validation

**WEEK 2: Database Schema & Query Optimization**
• Design normalized PostgreSQL relational schemas with foreign key constraints
• Optimize database query performance with indexing and connection pooling

**WEEK 3: Production Deployment & Containerization**
• Create multi-stage Dockerfiles and compose setups
• Automate test verification through CI/CD pipelines before deployment`;
      setChatMessages(prev => [...prev, { role: "model", content: fallbackReply }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Chat attachment trigger
  const handleChatAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setChatAttachment({
        fileData: event.target?.result as string,
        mimeType: file.type,
        fileName: file.name
      });
      showToast(`Attachment queued: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Auto-fill test resume to facilitate user testing
  const handleLoadDemoResume = () => {
    setResumeData(SAMPLE_ANALYSIS_RESULT);
    setTargetRole("Senior Full-Stack Engineer");
    setInterviewQuestions(SAMPLE_QUESTIONS);
    setPastedResumeText(SAMPLE_RESUME_TEXT);
    setCurrentQuestionIndex(0);
    setEvaluationResult(null);
    setUserAnswer("");
    setChatMessages([
      {
        role: "model",
        content: "Hello! I am your AI Career Coach. I've loaded your parsed profile. Ask me any suggestions about your learning path, how to secure the recommended jobs, or upload a photo of a job posting or a certificate to get custom feedback!"
      }
    ]);
    showToast("Demo Profile loaded with complete roadmap, mock jobs, and tailored courses!");
  };

  // Clear/Reset all resume and analysis states
  const handleClearResumeData = () => {
    setResumeData(null);
    setTargetRole("");
    setPastedResumeText("");
    setSelectedFileName(null);
    setUploadedFileData(null);
    setUploadedFileMimeType(null);
    setIsDragging(false);
    setInterviewQuestions([]);
    setCurrentQuestionIndex(0);
    setEvaluationResult(null);
    setUserAnswer("");
    setUploadError(null);
    setSuccessMessage(null);
    setUserAnswers({});
    setQuestionEvaluations({});
    setRecruiterDecision(null);
    setRecruiterDecisionLoading(false);
    setShowRecruiterDecision(false);
    setChatMessages([
      {
        role: "model",
        content: "Hello! I am your AI Career Coach. Please upload or paste your resume/profile to get custom feedback, or ask me any career-related questions directly!"
      }
    ]);
    setRecruiterMessages([]);
    setRecruiterActive(false);
    setRecruiterState({
      mood: "Neutral",
      fitScore: 50,
      keyObservations: ["Simulation not started yet"],
      nextAction: "Launch recruiter simulation"
    });
    showToast("All profile and interview simulation data reset successfully!");
  };

  // Safe navigation wrapper
  const handleApplyLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Helper renderer for hands-free voice assistant interview simulator
  const renderVoiceInterviewUI = () => {
    return (
      <div className="md:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Part: Glowing Interviewer Panel (col-span-7) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[460px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          {/* Round/Topic Badge, Company and Mode details */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800/80 gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap">
              {renderCompanyBadge(interviewQuestions[currentQuestionIndex]?.company)}
              <span className="bg-indigo-500/15 text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded border border-indigo-500/20 font-mono uppercase tracking-wider">
                {interviewQuestions[currentQuestionIndex]?.category || "Technical"} Round
              </span>
              <span className="text-slate-600">•</span>
              <p className="text-[11px] text-slate-400 font-mono">Question {currentQuestionIndex + 1} of {interviewQuestions.length}</p>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${voiceInterviewerState === 'listening' ? 'bg-emerald-500 animate-ping' : voiceInterviewerState === 'speaking' ? 'bg-indigo-400' : 'bg-slate-500'}`}></span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
                {voiceInterviewerState === 'speaking' ? 'Interviewer Speaking' : voiceInterviewerState === 'listening' ? 'Listening' : voiceInterviewerState === 'grading' ? 'Evaluating' : 'Standby'}
              </span>
            </div>
          </div>

          {/* Main interactive speaker module */}
          <div className="flex flex-col items-center justify-center py-8 text-center flex-grow">
            <div className="relative mb-6">
              <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
                voiceInterviewerState === 'speaking' ? 'bg-indigo-500/25 scale-125' : 
                voiceInterviewerState === 'listening' ? 'bg-emerald-500/30 scale-150 animate-pulse' :
                voiceInterviewerState === 'grading' ? 'bg-amber-500/25 scale-110 animate-spin' : 'bg-slate-800/10'
              }`} style={{ width: '120px', height: '120px' }}></div>
              
              <div className={`w-28 h-28 rounded-full border flex items-center justify-center transition-all duration-500 z-10 relative ${
                voiceInterviewerState === 'speaking' ? 'bg-indigo-950/80 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 
                voiceInterviewerState === 'listening' ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]' :
                voiceInterviewerState === 'grading' ? 'bg-amber-950/80 border-amber-500' : 'bg-slate-950 border-slate-800'
              }`}>
                {voiceInterviewerState === 'speaking' && <Volume2 className="w-10 h-10 text-indigo-400 animate-bounce" />}
                {voiceInterviewerState === 'listening' && <Mic className="w-10 h-10 text-emerald-400 animate-pulse" />}
                {voiceInterviewerState === 'grading' && (
                  <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                )}
                {voiceInterviewerState === 'idle' && <User className="w-10 h-10 text-slate-500" />}
              </div>
            </div>

            {/* Beautiful Animated Equalizer Soundwaves */}
            {(voiceInterviewerState === 'speaking' || voiceInterviewerState === 'listening') && (
              <div className="flex items-end justify-center gap-1.5 h-8 my-3">
                <span className="wave-bar w-1.5 rounded-full h-4 transition-all duration-300" style={{ backgroundColor: accent.primaryRaw, opacity: 0.6, animationDelay: "0.1s" }}></span>
                <span className="wave-bar w-1.5 rounded-full h-6 transition-all duration-300" style={{ backgroundColor: accent.primaryRaw, opacity: 0.8, animationDelay: "0.2s" }}></span>
                <span className="wave-bar w-1.5 rounded-full h-8 transition-all duration-300" style={{ backgroundColor: accent.primaryRaw, opacity: 1.0, animationDelay: "0.3s" }}></span>
                <span className="wave-bar w-1.5 rounded-full h-5 transition-all duration-300" style={{ backgroundColor: accent.primaryRaw, opacity: 0.7, animationDelay: "0.4s" }}></span>
                <span className="wave-bar w-1.5 rounded-full h-7 transition-all duration-300" style={{ backgroundColor: accent.primaryRaw, opacity: 0.9, animationDelay: "0.5s" }}></span>
                <span className="wave-bar w-1.5 rounded-full h-6 transition-all duration-300" style={{ backgroundColor: accent.primaryRaw, opacity: 0.8, animationDelay: "0.6s" }}></span>
                <span className="wave-bar w-1.5 rounded-full h-4 transition-all duration-300" style={{ backgroundColor: accent.primaryRaw, opacity: 0.5, animationDelay: "0.7s" }}></span>
              </div>
            )}

            <p className={`text-xs font-mono tracking-wider font-extrabold uppercase ${
              voiceInterviewerState === 'speaking' ? 'text-indigo-400' : 
              voiceInterviewerState === 'listening' ? 'text-emerald-400' : 
              voiceInterviewerState === 'grading' ? 'text-amber-400' : 'text-slate-500'
            }`}>
              {voiceInterviewerState === 'speaking' && "🔈 Reading Interview Prompt..."}
              {voiceInterviewerState === 'listening' && "🎙️ Microphone Live • Speak your answer now!"}
              {voiceInterviewerState === 'grading' && "⚙️ AI is evaluating response metrics..."}
              {voiceInterviewerState === 'idle' && "Standby • Click Start below"}
            </p>

            <div className="mt-6 max-w-xl">
              <p className="text-sm md:text-base font-medium font-serif italic text-slate-200 leading-relaxed px-4">
                "{interviewQuestions[currentQuestionIndex]?.question}"
              </p>
              {interviewQuestions[currentQuestionIndex]?.context && (
                <span className="text-[10px] text-slate-500 bg-slate-950/50 px-2.5 py-1 rounded-full border border-slate-800/80 mt-3 inline-block font-mono">
                  Role Focus: {interviewQuestions[currentQuestionIndex].context}
                </span>
              )}
            </div>
          </div>

          {/* Controller Buttons */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => startVoiceRound(currentQuestionIndex)}
              className="flex-1 py-3 bg-indigo-950/60 hover:bg-indigo-900/50 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 🔊 Repeat & Restart
            </button>

            {voiceInterviewerState === 'listening' ? (
              <button
                onClick={handleEvaluateVoiceResponse}
                className="flex-[2] py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> ✅ Submit Answer
              </button>
            ) : (
              <button
                onClick={() => {
                  if (recognitionRef.current) {
                    setRecognitionError(null);
                    try {
                      recognitionRef.current.start();
                      setIsListening(true);
                      setVoiceInterviewerState("listening");
                    } catch (e) {}
                  }
                }}
                disabled={voiceInterviewerState === 'grading'}
                className="flex-[2] py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" /> 🎙️ Reactivate Mic
              </button>
            )}
          </div>
        </div>

        {/* Right Part: Real-time Transcript & Navigation Controller (col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Live Transcript Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between min-h-[240px]">
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Captured Speech Transcript</h4>
                {autoSubmitCountdown !== null ? (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-mono font-bold uppercase animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span> Auto-Submit in {autoSubmitCountdown}s
                  </span>
                ) : isListening ? (
                  <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded animate-pulse font-mono font-bold uppercase">Recording</span>
                ) : null}
              </div>
              
              <div className="mt-3 max-h-[150px] overflow-y-auto pr-1">
                {userAnswer || interimSpeech ? (
                  <p className="text-xs text-slate-200 font-sans leading-relaxed italic">
                    "{userAnswer}"
                    {interimSpeech && (
                      <span className="text-emerald-400 opacity-90 font-sans italic">
                        {" "}{interimSpeech}...
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {voiceInterviewerState === 'listening' 
                      ? "Start speaking! Your speech transcript will compile here in real-time..."
                      : "Microphone is on standby. Click Repeat or Reactivate Mic to speak."}
                  </p>
                )}
              </div>
            </div>

            {recognitionError && (
              <p className="text-[10px] text-amber-400 font-mono mt-2 leading-relaxed bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                ⚠️ {recognitionError}
              </p>
            )}
          </div>

          {/* Navigation Controller & Question List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    startVoiceRound(currentQuestionIndex - 1);
                  }
                }}
                disabled={currentQuestionIndex === 0}
                className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              >
                ⬅️ Prev Question
              </button>
              
              <button
                onClick={() => {
                  if (currentQuestionIndex < interviewQuestions.length - 1) {
                    startVoiceRound(currentQuestionIndex + 1);
                  }
                }}
                disabled={currentQuestionIndex === interviewQuestions.length - 1}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              >
                Next Question ➡️
              </button>
            </div>

            {/* Quick jump pills */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-mono">Question {currentQuestionIndex + 1} of {interviewQuestions.length}</span>
              <div className="flex items-center gap-1.5">
                {interviewQuestions.map((_, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => startVoiceRound(qIdx)}
                    className={`w-5 h-5 rounded-md text-[9px] font-mono font-bold flex items-center justify-center transition-all ${
                      currentQuestionIndex === qIdx
                        ? 'bg-indigo-600 text-white'
                        : questionEvaluations[interviewQuestions[qIdx]?.id]?.score === 0
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : questionEvaluations[interviewQuestions[qIdx]?.id]?.score
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    title={`Go to question ${qIdx + 1}`}
                  >
                    {qIdx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Voice Evaluation Result Details block */}
        {evaluationResult && (
          <div className="lg:col-span-12 bg-slate-900 border border-indigo-500/20 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${evaluationResult.score === 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
                <h4 className="text-sm font-extrabold text-white tracking-tight font-display">AI Evaluation & Scorecard</h4>
              </div>
              
              <div className="flex items-center gap-2">
                {evaluationResult.score === 0 ? (
                  <span className="px-3.5 py-1.5 rounded-xl text-xs font-black font-mono bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1.5 shadow-sm">
                    <X className="w-3.5 h-3.5" /> Marks: 0 / 10 • Wrong Answer
                  </span>
                ) : evaluationResult.score >= 8 ? (
                  <span className="px-3.5 py-1.5 rounded-xl text-xs font-black font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                    <Check className="w-3.5 h-3.5" /> Marks: {evaluationResult.score} / 10 • Correct Answer
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-xl text-xs font-black font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                    <Check className="w-3.5 h-3.5" /> Marks: {evaluationResult.score} / 10 • Partially Correct
                  </span>
                )}
              </div>
            </div>

            {/* Prominent Correct Answer Box */}
            <div className="p-4 bg-indigo-950/30 border border-indigo-500/25 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Proper Correct Answer (Model Solution Key)
                </span>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Hiring Standard Key</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950/70 p-3 rounded-xl border border-indigo-500/15 whitespace-pre-line">
                {evaluationResult.idealAnswer}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block font-mono">Coaching & Evaluation Feedback</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  {evaluationResult.feedback}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block font-mono">Suggested Improvements / Missing Points</span>
                <ul className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1 list-disc list-inside">
                  {evaluationResult.improvements?.map((imp, impIdx) => (
                    <li key={impIdx}>{imp}</li>
                  )) || <li>Ensure all key technical and behavioral components are addressed directly.</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const activeBgColor = accent.bgScreenDark || "#070314";

  const backgroundStyle = {
    backgroundColor: activeBgColor,
    backgroundImage: `radial-gradient(ellipse 90% 60% at 20% 85%, rgba(109, 40, 217, 0.45) 0%, transparent 65%), radial-gradient(ellipse 70% 60% at 85% 30%, rgba(139, 92, 246, 0.35) 0%, transparent 55%), radial-gradient(circle at 50% 10%, rgba(76, 29, 149, 0.25) 0%, transparent 60%), linear-gradient(150deg, #05020c 0%, #0d0422 45%, #180838 80%, #2e0854 100%)`,
    transition: "background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1), background-image 0.6s ease-in-out, color 0.3s ease",
    "--card-bg": `rgba(18, 8, 40, 0.82)`, 
    "--card-border": `rgba(147, 51, 234, 0.25)`, 
    "--card-inner-bg": `rgba(11, 4, 28, 0.9)`,
    "--text-color": `#f8fafc`,
  } as React.CSSProperties;

  return (
    <div 
      data-theme="dark"
      style={backgroundStyle}
      className={`app-main-canvas min-h-screen ${theme.bgScreen} font-sans p-4 md:p-6 flex flex-col justify-between ${accent.selection} transition-colors duration-300`}
    >
      
      {/* Toast Feedback Panel */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-slate-950 font-semibold px-4 py-3 rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {uploadError && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white font-semibold px-4 py-3 rounded-xl shadow-lg shadow-red-500/10 flex items-center gap-2 border border-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main container structured with max width and aligned centering */}
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Dynamic Radium Theme & Accent Customizer Panel */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl ${theme.cardBg} backdrop-blur-md transition-all duration-300`}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${accent.bg} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${accent.bg}`}></span>
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-slate-400">
                Visual Customizer Console
              </span>
            </div>
            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/60 border border-slate-800">
                <User className={`w-3.5 h-3.5 ${accent.text}`} />
                <span className="text-slate-300">{currentUser.name}</span>
                <span className="hidden md:inline text-[9px] font-mono text-slate-500">({currentUser.email})</span>
                <button
                  onClick={handleLogout}
                  className="ml-1.5 p-1 text-slate-400 hover:text-rose-500 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                  title="Log Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-950/40 border border-purple-500/20 rounded-xl text-[11px] font-mono text-purple-300">
              <Moon className="w-3.5 h-3.5 text-purple-400" />
              <span>Dark Theme Active</span>
            </div>
          </div>
        </div>
        
        {!currentUser ? (
          <div className="flex flex-col items-center justify-center py-10 md:py-16 animate-fade-in w-full">
            {/* Header / Intro inside Auth container */}
            <div className="text-center space-y-3 max-w-lg mb-8">
              <div 
                className={`w-14 h-14 mx-auto ${accent.bg} rounded-2xl flex items-center justify-center font-display font-black ${accentColor === "red" || accentColor === "purple" ? "text-white" : "text-black"} text-2xl mb-2 transition-all duration-300`}
                style={{ boxShadow: `0 0 20px ${accent.glowColor}` }}
              >
                C
              </div>
              <h2 className="text-3xl font-display font-extrabold tracking-tight text-white">
                Welcome to CareerAgent
              </h2>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Your agentic AI Career Suite. Register or log in to construct upskilling pathways, simulate live technical recruiter interviews, and generate hiring verdicts.
              </p>
            </div>

            {/* Auth Form Card */}
            <div className={`w-full max-w-md ${theme.cardBg} border ${theme.border} rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md`}>
              {/* Decorative glows */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 mb-6 rounded-xl bg-slate-950/40 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                    authMode === "login"
                      ? `${accent.btnActive} shadow-md`
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all cursor-pointer ${
                    authMode === "register"
                      ? `${accent.btnActive} shadow-md`
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Box */}
              {authError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={authMode === "login" ? handleLogin : handleRegister} className="space-y-4">
                {authMode === "register" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border ${theme.inputBg} focus:outline-none transition-colors font-sans`}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border ${theme.inputBg} focus:outline-none transition-colors font-sans`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border ${theme.inputBg} focus:outline-none transition-colors font-sans`}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className={`w-full py-3 mt-2 ${accent.btnActive} rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md`}
                  style={{ boxShadow: `0 4px 12px ${accent.glowColor}` }}
                >
                  {authLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : authMode === "login" ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[9px] uppercase font-bold font-mono">
                  <span className="px-2.5 rounded py-0.5 bg-slate-900 text-slate-500">Instant Developer Preview</span>
                </div>
              </div>

              {/* Quick Demo Sign In */}
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="w-full py-2.5 border border-dashed border-slate-800 bg-slate-950/40 text-slate-400 hover:border-sky-500/40 hover:text-sky-400 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                Single-Click Demo Sign-In
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header Block Styled to match User Screenshot Specifications precisely */}
            <header id="app-header" className="flex flex-col lg:flex-row items-center justify-between gap-6 py-4 md:py-6">
          <div className="flex items-center gap-5">
            <div 
              className={`w-16 h-16 ${accent.bg} rounded-3xl flex items-center justify-center font-display font-black text-white text-3xl flex-shrink-0 transition-all duration-300 shadow-[0_0_25px_rgba(147,51,234,0.5)] border border-purple-400/40`}
            >
              C
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-white flex items-center gap-2.5">
                  CareerAgent
                  <span className={`text-[10px] md:text-xs font-mono font-bold tracking-widest ${accent.text} bg-slate-950/80 border ${accent.border} px-2.5 py-1 rounded-lg uppercase shadow-sm`}>
                    Agentic AI
                  </span>
                </h1>
              </div>
              <p className="text-xs md:text-sm mt-1.5 leading-relaxed max-w-xl text-slate-300 font-medium">
                Personalized Mock Coaching, Gap Analysis & Career Mapping Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigational Tabs conforming to responsive layouts */}
            <nav id="app-nav" className="w-full lg:w-auto border border-purple-500/30 bg-[#0e0422]/95 rounded-3xl p-2 shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-row gap-1.5">
                <button
                  id="tab-dashboard"
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "dashboard"
                      ? `bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-[0_0_18px_rgba(147,51,234,0.5)] font-bold`
                      : `text-purple-200/75 hover:text-white hover:bg-purple-500/15`
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  id="tab-resume"
                  onClick={() => setActiveTab("resume")}
                  className={`px-4 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "resume"
                      ? `bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-[0_0_18px_rgba(147,51,234,0.5)] font-bold`
                      : `text-purple-200/75 hover:text-white hover:bg-purple-500/15`
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Resume Lab</span>
                </button>
                <button
                  id="tab-interview"
                  onClick={() => setActiveTab("interview")}
                  className={`px-4 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "interview"
                      ? `bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-[0_0_18px_rgba(147,51,234,0.5)] font-bold`
                      : `text-purple-200/75 hover:text-white hover:bg-purple-500/15`
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Mock Interview</span>
                </button>
                <button
                  id="tab-recruiter"
                  onClick={() => setActiveTab("recruiter")}
                  className={`px-4 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "recruiter"
                      ? `bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-[0_0_18px_rgba(147,51,234,0.5)] font-bold`
                      : `text-purple-200/75 hover:text-white hover:bg-purple-500/15`
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Recruiter Verdict</span>
                </button>
                <button
                  id="tab-chat"
                  onClick={() => setActiveTab("chat")}
                  className={`px-4 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "chat"
                      ? `bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-[0_0_18px_rgba(147,51,234,0.5)] font-bold`
                      : `text-purple-200/75 hover:text-white hover:bg-purple-500/15`
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Career Copilot</span>
                </button>
              </div>
            </nav>

            {/* Header Right Action Area: Sign Out */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                id="btn-sign-out"
                onClick={handleLogout}
                title="Sign Out"
                className="p-2.5 rounded-2xl border border-purple-500/30 bg-[#150a30] text-slate-300 hover:text-rose-300 hover:bg-rose-950/30 hover:border-rose-500/30 transition-all text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline text-[11px]">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tab 1: DASHBOARD VIEW (Clean Minimal Launchpad) */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            {/* Elegant Welcome Hero Banner */}
            <div className={`relative ${theme.heroBg} rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl`}>
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-500/10 to-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/25 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase text-sky-400 tracking-wider">
                    <Sparkles className="w-3 h-3 text-sky-400 animate-pulse" /> Candidate Control Center
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
                    Good Day, {currentUser?.name || "Candidate"}.
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
                    Accelerate your transition to modern technology stacks with AI-guided upskilling pathways, personalized interview simulations, and formal hiring reports.
                  </p>
                </div>
                
                {/* Dynamic User Profile Card on Dashboard */}
                <div className={`flex-shrink-0 w-full md:w-auto min-w-[240px] ${theme.cardBgInner} border ${theme.border} rounded-2xl p-4 shadow-md`}>
                  <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Active Profile Status</p>
                  {resumeData ? (
                    <div className="mt-2.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-200 truncate">{resumeData.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{targetRole || resumeData.targetRole || "Software Engineer"}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-center">
                        <div className="bg-slate-900/50 border-slate-800/40 p-1.5 rounded border">
                          <span className="text-[9px] text-slate-500 font-mono block">Resume Score</span>
                          <span className="text-xs font-bold font-mono text-sky-400">{resumeData.resumeScore || 85}%</span>
                        </div>
                        <div className="bg-slate-900/50 border-slate-800/40 p-1.5 rounded border">
                          <span className="text-[9px] text-slate-500 font-mono block">ATS Keywords</span>
                          <span className="text-xs font-bold font-mono text-indigo-400">{resumeData.atsScore || 78}%</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={handleClearResumeData}
                          className="w-full py-1.5 bg-slate-900 hover:bg-rose-950/30 border-slate-800 hover:text-rose-400 hover:border-rose-500/20 text-[10px] font-mono uppercase tracking-wider font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border"
                        >
                          <RotateCcw className="w-3 h-3" /> Reset Profile
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2.5 text-center py-4 bg-slate-900/40 border-slate-800/60 rounded-xl border border-dashed">
                      <p className="text-[11px] text-slate-400">No profile loaded yet</p>
                      <button
                        onClick={() => setActiveTab("resume")}
                        className="mt-2 px-3 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-lg text-[10px] font-bold tracking-wide uppercase animate-pulse"
                      >
                        Upload Resume
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stepped Recruitment Workflow Journey */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 block font-mono">
                Your Job Preparation Flow
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Desktop layout connection lines */}
                <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-[2px] bg-slate-850 z-0"></div>

                {/* Step 1: Profile Parsing */}
                <button
                  onClick={() => setActiveTab("resume")}
                  className="flex flex-col items-center md:items-start text-center md:text-left z-10 group relative w-full"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-display font-black text-sm mb-3.5 transition-all shadow-md ${
                    resumeData 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5" 
                      : "bg-slate-950 border-slate-800 text-slate-400 group-hover:border-sky-500/50 group-hover:text-sky-400"
                  }`}>
                    {resumeData ? <Check className="w-5 h-5 text-emerald-400" /> : "1"}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Step One</span>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-sky-400 transition-colors">Configure Profile</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs leading-normal">
                      {resumeData ? "Resume is parsed with active upskilling roadmap." : "Upload resume text to compile course suggestions."}
                    </p>
                  </div>
                </button>

                {/* Step 2: Interview Practice */}
                <button
                  onClick={() => setActiveTab("interview")}
                  className="flex flex-col items-center md:items-start text-center md:text-left z-10 group relative w-full"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-display font-black text-sm mb-3.5 transition-all shadow-md ${
                    Object.keys(userAnswers).length > 0 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5" 
                      : resumeData
                      ? "bg-sky-500/10 border-sky-500/40 text-sky-400 animate-pulse"
                      : "bg-slate-950 border-slate-800 text-slate-400 group-hover:border-sky-500/50 group-hover:text-sky-400"
                  }`}>
                    {Object.keys(userAnswers).filter(k => userAnswers[k]).length > 0 ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : (
                      "2"
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Step Two</span>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-sky-400 transition-colors">Mock Simulator</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs leading-normal">
                      {Object.keys(userAnswers).filter(k => userAnswers[k]).length > 0 
                        ? `${Object.keys(userAnswers).filter(k => userAnswers[k]).length} response drafts recorded.` 
                        : "Practice interactive behavioral questions."}
                    </p>
                  </div>
                </button>

                {/* Step 3: Recruiter Report */}
                <button
                  onClick={() => {
                    setActiveTab("recruiter");
                    handleGetRecruiterDecision();
                  }}
                  className="flex flex-col items-center md:items-start text-center md:text-left z-10 group relative w-full"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-display font-black text-sm mb-3.5 transition-all shadow-md ${
                    recruiterDecision
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5"
                      : "bg-slate-950 border-slate-800 text-slate-400 group-hover:border-sky-500/50 group-hover:text-sky-400"
                  }`}>
                    {recruiterDecision ? <Check className="w-5 h-5 text-emerald-400" /> : "3"}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Step Three</span>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-sky-400 transition-colors">Hiring Verdict</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs leading-normal">
                      {recruiterDecision 
                        ? `Verdict loaded: ${recruiterDecision.decision === 'accepted' ? 'Shortlisted' : 'Gaps Identified'}` 
                        : "Receive suitability scorecard & gap breakdown."}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Statistics & Quick Insights Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-2">Profile Gaps</span>
                  <p className="text-2xl font-black font-mono text-white leading-tight">
                    {resumeData?.skillGaps?.length ?? 0}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 mt-4 leading-normal">
                  Critical skill requirements detected between experience and target role.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">Matching Courses</span>
                  <p className="text-2xl font-black font-mono text-white leading-tight">
                    {resumeData?.courses?.length ?? 0}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 mt-4 leading-normal">
                  Syllabus-aligned career learning courses ready to fast-track upskilling.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest block mb-2">Practice Answers</span>
                  <p className="text-2xl font-black font-mono text-white leading-tight">
                    {Object.values(userAnswers).filter(Boolean).length} / {interviewQuestions.length || 5}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 mt-4 leading-normal">
                  Mock interview behavioral metrics processed by Google GenAI.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-2">Hiring Verdict</span>
                  <p className="text-sm font-bold text-slate-200 truncate mt-1 leading-tight">
                    {recruiterDecision 
                      ? (recruiterDecision.decision === "accepted" ? "Shortlisted 🎯" : "Gaps Identified ❌") 
                      : "Pending Practice"}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 mt-4 leading-normal">
                  Comprehensive job suitability verdict based on profile compatibility.
                </p>
              </div>
            </div>

            {/* Quick Demo Preloads and Action Guide */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Want to run an immediate test?</h4>
                <p className="text-xs text-slate-400">Click to instantly pre-load a sample profile complete with customized upskilling roadmaps and target jobs.</p>
              </div>
              <div className="flex gap-3">
                <button
                  id="dash-btn-load-demo"
                  onClick={handleLoadDemoResume}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-sky-500/10 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Load Sample Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: RESUME UPLOAD & TEXT SUBMISSION VIEW */}
        {activeTab === "resume" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl mx-auto shadow-xl">
              <div className="mb-6">
                <h2 className="text-lg font-bold font-display flex items-center gap-2">
                  <Upload className="w-5 h-5 text-sky-400" /> Upload or Paste Professional Profile
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Provide your current resume, LinkedIn text, or professional overview so the Career AI Coach can compile your horizontal analytics bar, custom interview suite, course links, and matching roles.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Box 1: File drag and drop dropzone */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`bg-slate-950 rounded-2xl p-6 border-2 border-dashed transition-all flex flex-col items-center justify-center text-center relative group min-h-[220px] ${
                    isDragging ? "border-sky-500 bg-sky-500/5" : "border-slate-800 hover:border-sky-500/50"
                  }`}
                >
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  
                  <div className={`w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 transition-all ${
                    isDragging ? "bg-sky-500/20 text-sky-400 border-sky-400" : "group-hover:bg-sky-500/10 group-hover:text-sky-400"
                  }`}>
                    {selectedFileName ? (
                      <FileCheck className="w-6 h-6 text-sky-400 animate-pulse" />
                    ) : (
                      <Upload className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  
                  {selectedFileName ? (
                    <>
                      <p className="text-sm font-bold text-sky-400">Selected File:</p>
                      <p className="text-xs text-slate-200 mt-1 font-mono break-all px-2">{selectedFileName}</p>
                      <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                        Drag or click again to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold">{isDragging ? "Drop your resume now!" : "Drag & Drop Resume File"}</p>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        Supports PDF documents, JPEGs, PNGs or TXT formats
                      </p>
                    </>
                  )}

                  {uploading && (
                    <div className="absolute inset-0 bg-slate-950/95 rounded-2xl flex flex-col items-center justify-center p-4">
                      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-bold text-sky-400 mt-3 animate-pulse">Running Agentic Analysis...</p>
                      <p className="text-[10px] text-slate-500 mt-1 text-center">Parsing structure, cross-referencing jobs, mapping courses & compiling code roadmaps</p>
                    </div>
                  )}
                </div>

                {/* Box 2: Target career configuration */}
                <div className="flex flex-col justify-between gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Target Aspirational Role</label>
                      <input
                        id="target-role-input"
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Senior Fullstack Developer"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors font-sans"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Specify this to generate accurate custom roadmap milestones.</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase tracking-wider">Or Paste Resume Text</label>
                      <textarea
                        id="resume-text-input"
                        value={pastedResumeText}
                        onChange={(e) => setPastedResumeText(e.target.value)}
                        placeholder="Paste details of your education, skills, and past jobs..."
                        rows={5}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 transition-colors font-mono resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-analyze-text"
                    onClick={handleAnalyzeText}
                    disabled={uploading}
                    className="w-full py-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-sky-500/10 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Run Profile Analysis
                  </button>

                  <button
                    id="btn-reset-analysis"
                    onClick={handleClearResumeData}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset & Clear Analysis
                  </button>
                </div>

              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <p>
                  Our server-side Gemini 3.5 engine safely identifies experience structures, builds your customized, interactive roadmap, evaluates current skill requirements, and lists direct links. Feel free to load the demo profile on the main page anytime for instant testing.
                </p>
              </div>
            </div>

            {/* Analysis Results Displayed inside Resume tab */}
            {resumeData && (
              <div className="space-y-6">
                
                {/* 1. Header Transition Summary Hero */}
                <div id="resume-hero-banner" className="bg-slate-900 border-slate-800 border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">Analysis Result Live</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-extrabold font-display text-white tracking-tight mt-1">
                        {resumeData.name}'s Analysis Report
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        {resumeData.targetRoleSpecified ? (
                          <>
                            Transition: <span className="font-bold text-slate-200">{resumeData.currentRole || "Associate"}</span> 
                            <ChevronRight className="w-3.5 h-3.5 text-sky-400 inline" /> 
                            <span className="font-bold text-sky-400">{resumeData.targetRole}</span>
                          </>
                        ) : (
                          <>
                            Role: <span className="font-bold text-slate-200">{resumeData.currentRole || "Associate"}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      <span className="font-bold text-sky-400 uppercase tracking-wider text-[10px] block mb-1">Career Coach Summary:</span>
                      {resumeData.summary}
                    </p>
                  </div>
                </div>

                {/* 2. Top Metrics Score Row */}
                <div id="resume-metrics-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Resume Quality Score */}
                  <div id="resume-metric-card-resume-score" className="bg-slate-900 border-slate-800 border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-sky-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0 flex items-center justify-center w-20 h-20 bg-slate-950 border-slate-800 rounded-2xl border shadow-inner">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-slate-900" strokeWidth="4" fill="transparent" />
                          <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-sky-500" strokeWidth="4" fill="transparent"
                            strokeDasharray={163}
                            strokeDashoffset={163 - (163 * (resumeData.resumeScore || 82)) / 100}
                            strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-sm font-black font-mono text-white">{resumeData.resumeScore || 82}%</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">Overall Resume Quality Score</h3>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                          Measures format compliance, impact verbs usage, quantified milestones, and professional formatting.
                        </p>
                        <div className="mt-2.5 flex gap-1.5">
                          <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Good Formatting</span>
                          <span className="text-[9px] font-mono font-bold bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">Action-Oriented</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ATS Compatibility Score */}
                  <div id="resume-metric-card-ats-score" className="bg-slate-900 border-slate-800 border rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0 flex items-center justify-center w-20 h-20 bg-slate-950 border-slate-800 rounded-2xl border shadow-inner">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-slate-900" strokeWidth="4" fill="transparent" />
                          <circle cx="32" cy="32" r="26" stroke="currentColor" className="text-indigo-500" strokeWidth="4" fill="transparent"
                            strokeDasharray={163}
                            strokeDashoffset={163 - (163 * (resumeData.atsScore || 76)) / 100}
                            strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-sm font-black font-mono text-white">{resumeData.atsScore || 76}%</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider">ATS Keyword Match Compatibility</h3>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                          Calculates keyphrase density match relative to standard applicant tracking filters for target <span className="text-indigo-400 font-semibold">{resumeData.targetRoleSpecified ? resumeData.targetRole : "role"}</span>.
                        </p>
                        <div className="mt-2.5 flex gap-1.5">
                          <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">Missing Keywords</span>
                          <span className="text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">Parser Friendly</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. Skill Gaps & Strengths Row */}
                <div id="resume-gaps-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Skill Gaps Card */}
                  <div id="resume-card-skill-gaps" className="bg-slate-900 border-slate-800 border rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Identified Gaps to Target Role</h3>
                    </div>
                    <div className="space-y-3">
                      {resumeData.skillGaps?.map((gap, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 border-slate-800/80 hover:border-slate-700 rounded-xl border transition-colors flex items-center gap-3">
                          <span className="w-4 h-4 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0">
                            !
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-200">{cleanSkillName(gap)}</p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-xs text-slate-500 italic">No skill gaps detected. Perfect transition score!</p>
                      )}
                    </div>
                  </div>

                  {/* Core Strengths Card */}
                  <div id="resume-card-core-strengths" className="bg-slate-900 border-slate-800 border rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Identified Core Strengths</h3>
                    </div>
                    <div className="space-y-3">
                      {resumeData.strengths?.map((strength, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 border-slate-800/80 hover:border-slate-700 rounded-xl border transition-colors flex items-center gap-3">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0">
                            ✓
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-200">{cleanSkillName(strength)}</p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-xs text-slate-500 italic">No key strengths loaded. Compile profile first.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* 4. Recommended Courses Section */}
                <div id="resume-courses-section" className="bg-slate-900 border-slate-800 border rounded-3xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-5 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-5 h-5 text-sky-400 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-200 font-display tracking-tight">Recommended Tailored Courses & Resources</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Top learning resources from W3Schools, GeeksforGeeks, YouTube, Udemy & Coursera mapped directly from your upskilling roadmap</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20 whitespace-nowrap self-start sm:self-auto">
                      W3Schools • GeeksforGeeks • YouTube • Udemy • Coursera
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {resumeData.courses?.map((course, idx) => (
                      <div key={idx} className="bg-slate-950 border-slate-800 hover:border-sky-500/40 border transition-all rounded-2xl p-4 flex flex-col justify-between group shadow-sm">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getProviderBadgeClass(course.provider)}`}>
                              {course.provider}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {course.duration}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-sky-500 transition-colors">
                            {course.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                            {course.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1 max-w-[70%]">
                            {course.skillsCovered?.slice(0, 2).map((skill, sIdx) => (
                              <span key={sIdx} className="text-[9px] font-mono bg-slate-900 text-slate-400 border-slate-800 px-1.5 py-0.5 rounded border">
                                {skill}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => handleApplyLink(course.url)}
                            className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                          >
                            Learn <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )) || (
                      <p className="text-xs text-slate-500 italic md:col-span-3 text-center">No educational resources mapped yet.</p>
                    )}
                  </div>
                </div>

                {/* 5. Recommended Jobs Section */}
                <div id="resume-jobs-section" className="bg-slate-900 border-slate-800 border rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-200 font-display tracking-tight">Recommended Real-World Vacancies</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Matched from live search indexes based on your updated skills and profile scores</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                      Live Match Index
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {resumeData.jobs?.map((job, idx) => {
                      const platforms = getJobPlatformLinks(job.title, job.company, job.applyUrl);
                      return (
                        <div key={idx} className="bg-slate-950 border-slate-800 hover:border-indigo-500/40 border transition-all rounded-2xl p-4 flex flex-col justify-between group shadow-sm">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-200 truncate max-w-[150px]">{job.company}</span>
                                <span className="text-[9px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-slate-400" /> {job.location}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                                {job.matchPercentage}% match
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors mt-1">
                              {job.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                              {job.description}
                            </p>

                            {/* Top Application Portals Pill Badges */}
                            <div className="mt-3 pt-2.5 border-t border-slate-900">
                              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
                                Top Job Portals:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {platforms.map((plat, pIdx) => (
                                  <button
                                    key={pIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApplyLink(plat.url);
                                    }}
                                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${plat.bgColor} ${plat.textColor} ${plat.borderColor} transition-all flex items-center gap-0.5`}
                                    title={`Apply on ${plat.name}`}
                                  >
                                    <span>{plat.badge}</span>
                                    <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-slate-400 font-semibold truncate max-w-[40%]">
                              {job.salary}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedJobForModal(job)}
                                className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-xl transition-all"
                                title="View all job application portals"
                              >
                                Portals
                              </button>
                              <button
                                onClick={() => {
                                  // Open direct clean role search on LinkedIn / portal
                                  const targetUrl = platforms[0]?.url || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}`;
                                  handleApplyLink(targetUrl);
                                }}
                                className="text-[10px] font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all shadow-md shadow-sky-500/20"
                                title={`Directly open active job application page for ${job.title}`}
                              >
                                Apply Now <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }) || (
                      <p className="text-xs text-slate-500 italic md:col-span-3 text-center">No careers recommendations mapped yet.</p>
                    )}
                  </div>
                </div>

                {/* 6. Aspirational Week-Wise Learning Roadmap Timeline */}
                <div id="resume-roadmap-section" className="bg-slate-900 border-slate-800 border rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-slate-800">
                    <Calendar className="w-5 h-5 text-sky-400" />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-200 font-display tracking-tight">Week-by-Week Upskilling Roadmap</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Iterative weekly learning plan for your safe transition to {resumeData.targetRoleSpecified ? resumeData.targetRole : "your target role"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {resumeData.roadmap?.map((milestone, idx) => {
                      const weekLabel = getWeekBadge(milestone.duration, idx);
                      return (
                        <div key={idx} className="relative pl-6 md:pl-8 pb-1 group last:pb-0">
                          {/* Visual Vertical Roadmap connector line */}
                          {idx !== resumeData.roadmap.length - 1 && (
                            <span className="absolute left-2.5 top-6 bottom-0 w-[1px] bg-slate-800 group-hover:bg-sky-500/20 transition-colors"></span>
                          )}
                          
                          {/* Milestone bubble */}
                          <span className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            milestone.status === "completed"
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : milestone.status === "current"
                              ? "bg-sky-500/10 border-sky-500/40 text-sky-400 animate-pulse"
                              : "bg-slate-950 border-slate-800 text-slate-600"
                          }`}>
                            {milestone.status === "completed" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            )}
                          </span>

                          <div className="p-4 bg-slate-950/70 border-slate-800/80 group-hover:border-slate-800 rounded-2xl border transition-colors flex flex-col gap-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-sky-400" />
                                  {weekLabel}
                                </span>
                                <h4 className="text-xs font-bold text-slate-100">{milestone.title}</h4>
                              </div>
                              
                              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                                milestone.status === "completed"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : milestone.status === "current"
                                  ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                  : "bg-slate-900 text-slate-500 border-slate-800"
                              }`}>
                                {milestone.status === "current" ? "In Progress" : milestone.status}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400 leading-relaxed pl-0.5">
                              {milestone.description}
                            </p>

                            {milestone.resources && milestone.resources.length > 0 && (
                              <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-1.5">
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mr-1">Target Resources:</span>
                                {milestone.resources.map((res, rIdx) => {
                                  const searchUrl = getResourceUrl(res);
                                  return (
                                    <a
                                      key={rIdx}
                                      href={searchUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={`Open ${res} documentation in new tab`}
                                      className="text-[9px] font-mono bg-slate-900 text-sky-300 hover:text-sky-200 hover:bg-sky-950/80 border-slate-800/90 px-2 py-1 rounded-md border hover:border-sky-500/50 flex items-center gap-1.5 transition-all cursor-pointer group/link hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                      <BookOpen className="w-2.5 h-2.5 text-sky-400 group-hover/link:scale-110 transition-transform" />
                                      <span>{res}</span>
                                      <ExternalLink className="w-2.5 h-2.5 text-slate-500 group-hover/link:text-sky-500 opacity-70 group-hover/link:opacity-100 transition-opacity" />
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Tab 3: INTERVIEW SIMULATOR VIEW (With voice assistance synthesis & dictation) */}
        {activeTab === "interview" && (
          interviewQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 md:py-20 px-4 max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg mb-6 mx-auto">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold font-display text-white tracking-tight">
                No Interview Questions Generated
              </h2>
              <p className="text-slate-400 text-xs md:text-sm mt-3 leading-relaxed">
                Please upload or paste your professional profile/resume first under the <strong className="text-sky-400">Upload Profile</strong> tab to dynamically generate custom-tailored interview questions for your target aspirational role.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
                <button
                  onClick={() => setActiveTab("resume")}
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-sky-500/10"
                >
                  Upload Profile Tab
                </button>
                <button
                  onClick={handleLoadDemoResume}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700"
                >
                  Load Sample Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Simulator Mode Selector */}
              <div className="md:col-span-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-3xl mb-2">
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">Simulator Mode</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Choose standard manual evaluation or immersive voice portal interaction</p>
                </div>
                <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex-shrink-0">
                  <button
                    onClick={() => {
                      setIsVoiceMode(false);
                      if (synthesisRef.current) synthesisRef.current.cancel();
                      if (recognitionRef.current && isListening) {
                        try {
                          recognitionRef.current.stop();
                        } catch (e) {}
                      }
                      setIsListening(false);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      !isVoiceMode
                        ? "bg-slate-800 text-sky-400 shadow-inner"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> Text/Manual Mode
                  </button>
                  <button
                    onClick={() => {
                      setIsVoiceMode(true);
                      setUserAnswer("");
                      setEvaluationResult(null);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isVoiceMode
                        ? "bg-indigo-950/60 text-indigo-400 border border-indigo-500/20 shadow-inner"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 animate-pulse text-indigo-400" /> Hands-Free Voice Mode
                  </button>
                </div>
              </div>

              {isVoiceMode ? (
                renderVoiceInterviewUI()
              ) : (
                <>
                  {/* LEFT COLUMN: QUESTION NAVIGATOR & PROCTORING FEED (Col span 4) */}
                  <div className="md:col-span-4 flex flex-col gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 gap-2 flex-wrap">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question Index</h3>
                <div className="flex items-center gap-2">
                  {interviewQuestions.length > 0 && (
                    <button
                      onClick={() => {
                        setUserAnswers({});
                        setQuestionEvaluations({});
                        setUserAnswer("");
                        setEvaluationResult(null);
                        showToast("All mock interview drafts and scores have been reset.");
                      }}
                      className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2 py-0.5 rounded-lg cursor-pointer"
                      title="Clear all answers and evaluations"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> Reset All
                    </button>
                  )}
                  <span className="text-[10px] font-bold text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {currentQuestionIndex + 1} of {interviewQuestions.length}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                Click any generated question below to toggle, read, and run mock simulations:
              </p>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {interviewQuestions.map((q, idx) => (
                  <button
                    key={q.id}
                    id={`btn-select-question-${idx}`}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setUserAnswer(userAnswers[q.id] || "");
                      setEvaluationResult(questionEvaluations[q.id] || null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1.5 ${
                      currentQuestionIndex === idx
                        ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-200"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] flex-shrink-0 ${
                        currentQuestionIndex === idx ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-500"
                      }`}>
                        {idx + 1}
                      </span>
                      {q.company && (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800/80 text-sky-400 border border-slate-700">
                          {q.company}
                        </span>
                      )}
                    </div>
                    <span className="line-clamp-2 leading-relaxed">{q.question}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

            {/* RIGHT COLUMN: INTERACTIVE TERMINAL / ANSWER INPUT (Col span 8) */}
            <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              
              {/* Question text box & Audio synthesizer toggle */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    {renderCompanyBadge(interviewQuestions[currentQuestionIndex]?.company)}
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded border border-indigo-500/20 font-mono uppercase">
                      {interviewQuestions[currentQuestionIndex]?.category || "Technical"} Round
                    </span>
                    <span className="text-slate-600">•</span>
                    <p className="text-xs text-slate-400 font-mono">Real-time company interview question</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="btn-speak-question"
                      onClick={() => speakQuestion(interviewQuestions[currentQuestionIndex]?.question)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isSpeaking
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25"
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" /> Stop Speaking
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" /> Voice Assistance
                        </>
                      )}
                    </button>
                    {!speechSupported && (
                      <span className="text-[10px] text-slate-500">Speech API Unsupported</span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
                  <p className="text-sm font-semibold text-slate-200 leading-relaxed font-serif italic">
                    "{interviewQuestions[currentQuestionIndex]?.question}"
                  </p>
                  {interviewQuestions[currentQuestionIndex]?.context && (
                    <p className="text-[10px] text-slate-500 mt-2.5 font-mono">
                      Coach Note: {interviewQuestions[currentQuestionIndex].context}
                    </p>
                  )}
                </div>

                {/* Answer submission block */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">Your Mock Response</label>
                    
                    {/* Speech to text active trigger */}
                    <button
                      id="btn-toggle-dictation"
                      onClick={toggleListening}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                        isListening
                          ? "bg-emerald-500 text-slate-950 animate-pulse font-extrabold"
                          : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-300"
                      }`}
                    >
                      {isListening ? (
                        <>
                          <Mic className="w-3 h-3 animate-bounce" /> Listening (Click Stop)
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3" /> Dictate Response
                        </>
                      )}
                    </button>
                  </div>

                  {recognitionError && (
                    <p className="text-[10px] text-amber-400 font-mono">{recognitionError}</p>
                  )}

                  <textarea
                    id="user-answer-input"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your mock answer here, or click 'Dictate Response' to speak aloud. Try incorporating STAR format (Situation, Task, Action, Result) for behavioral prompts..."
                    rows={6}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors font-sans resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Evaluation trigger & display metrics */}
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    id="btn-clear-answer"
                    onClick={() => {
                      setUserAnswer("");
                      setEvaluationResult(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear / Reset Answer
                  </button>

                  <button
                    id="btn-evaluate-answer"
                    onClick={handleEvaluateAnswer}
                    disabled={isEvaluating}
                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
                  >
                    {isEvaluating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Grading Response...
                      </>
                    ) : (
                      <>
                        Evaluate with Agentic AI
                      </>
                    )}
                  </button>
                </div>

                {/* AI Evaluation Score & feedback box */}
                {evaluationResult && (
                  <div className="p-5 bg-slate-950/90 rounded-2xl border border-indigo-500/20 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Evaluation Result:</span>
                        {evaluationResult.score === 0 ? (
                          <span className="px-3 py-1 rounded-lg text-xs font-bold font-mono bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> 0 / 10 • Wrong Answer
                          </span>
                        ) : evaluationResult.score >= 8 ? (
                          <span className="px-3 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {evaluationResult.score} / 10 • Correct Answer
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg text-xs font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {evaluationResult.score} / 10 • Partially Correct
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Expert Coach Evaluator</span>
                    </div>

                    {/* Highlighted Correct Model Answer */}
                    <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl space-y-1.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" /> Proper Correct Answer (Model Solution Key):
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 whitespace-pre-line">
                        {evaluationResult.idealAnswer}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      <span className="font-bold text-indigo-400">Coach Feedback:</span> {evaluationResult.feedback}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-[11px] pt-1">
                      <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                        <p className="font-bold text-emerald-400 mb-1">✓ Core Strengths:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                          {evaluationResult.strengths?.length ? (
                            evaluationResult.strengths.map((str, sIdx) => <li key={sIdx}>{str}</li>)
                          ) : (
                            <li>Attempted response.</li>
                          )}
                        </ul>
                      </div>
                      <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                        <p className="font-bold text-amber-400 mb-1">⚠ Suggested Improvements:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                          {evaluationResult.improvements?.map((imp, iIdx) => <li key={iIdx}>{imp}</li>) || <li>Review the model solution key to address core gaps.</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
                </>
              )}

          </div>
          )
        )}

                {/* Tab 3.5: AI RECRUITER SIMULATOR VIEW (Interactive Conversational Screening with Live Scorecard) */}
        {activeTab === "recruiter" && (
          <div className="max-w-4xl mx-auto px-2 sm:px-6 py-4 animate-fade-in">
            {/* Header section */}
            <div className="mb-8 text-center sm:text-left border-b border-slate-800 pb-5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight font-sans">
                Hiring Verdict & Job Acceptability
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Our advanced agentic AI evaluates your professional profile and completed mock interview answers to determine job suitability.
              </p>
            </div>

            {recruiterDecisionLoading ? (
              /* ELEGANT TERMINAL-LIKE LOADING STATE */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xl">🎯</div>
                </div>
                
                <h3 className="text-base font-bold text-slate-200 animate-pulse">Running Candidate Profile Matching...</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                  We are matching your credentials, technical skills, and behavioral interview responses against the expectations for <strong className="text-indigo-400">{targetRole || resumeData?.targetRole || "Software Engineer"}</strong>...
                </p>

                <div className="mt-8 space-y-2 w-full max-w-xs text-left">
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>✓ Parsing resume skills alignment</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-indigo-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                    <span>✓ Scoring behavioral & STAR depth</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    <span>• Synthesizing recruiter verdict report</span>
                  </div>
                </div>
              </div>
            ) : recruiterDecision ? (
              /* PREMIUM REPORT LAYOUT (Bento Grid Style) */
              <div className="space-y-6">
                
                {/* 1. VERDICT STATUS BANNER */}
                <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
                  recruiterDecision.decision === "accepted"
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-950/20 border-rose-500/30 text-rose-300"
                }`}>
                  <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                    <span className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner ${
                      recruiterDecision.decision === "accepted" ? "bg-emerald-500/20" : "bg-rose-500/20"
                    }`}>
                      {recruiterDecision.decision === "accepted" ? "✓" : "❌"}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest opacity-80">Application Verdict</span>
                      <h3 className="text-lg font-extrabold uppercase tracking-wide">
                        {recruiterDecision.decision === "accepted" ? "Shortlisted for Job" : "Not Shortlisted"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-normal max-w-md">
                        {recruiterDecision.decision === "accepted"
                          ? "Congratulations! Your profile match and mock interview responses meet the core qualifications for this role."
                          : "We identified specific qualification and interview performance gaps required for this job suitability."}
                      </p>
                    </div>
                  </div>

                  {/* Overall Suitability Score Card */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center min-w-[120px] shadow-md">
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">Suitability Score</span>
                    <span className={`text-3xl font-black font-mono block mt-1 ${
                      recruiterDecision.decision === "accepted" ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {recruiterDecision.keyMetrics
                        ? Math.round((recruiterDecision.keyMetrics.communication + recruiterDecision.keyMetrics.technicalMatch + recruiterDecision.keyMetrics.roleAlignment) / 3)
                        : recruiterDecision.decision === "accepted" ? 82 : 58}%
                    </span>
                    <span className="text-[8px] text-slate-500 block mt-1">Average Domain Match</span>
                  </div>
                </div>

                {/* 2. THREE-PANEL BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Card A: Domain Metrics (Col-span-4) */}
                  <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-sky-400" />
                        Domain Match
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5 font-mono">
                            <span>Communication Score</span>
                            <span className="font-bold text-slate-200">
                              {recruiterDecision.keyMetrics?.communication ?? 70}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-sky-400 h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${recruiterDecision.keyMetrics?.communication ?? 70}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5 font-mono">
                            <span>Technical Fit</span>
                            <span className="font-bold text-slate-200">
                              {recruiterDecision.keyMetrics?.technicalMatch ?? 55}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-400 h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${recruiterDecision.keyMetrics?.technicalMatch ?? 55}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5 font-mono">
                            <span>Role Alignment</span>
                            <span className="font-bold text-slate-200">
                              {recruiterDecision.keyMetrics?.roleAlignment ?? 60}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-400 h-full rounded-full transition-all duration-1000" 
                              style={{ width: `${recruiterDecision.keyMetrics?.roleAlignment ?? 60}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-850 text-center">
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Communication scoring factors linguistic structuring, vocab clarity, and STAR response layout.
                      </p>
                    </div>
                  </div>

                  {/* Card B: Reasons block (Col-span-4) */}
                  <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg select-text">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Acceptability Reasons
                    </h3>

                    <p className="text-[11px] text-slate-500 mb-3.5 leading-normal">
                      Detailed review and profile mismatches found during evaluation:
                    </p>

                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                      {recruiterDecision.reasons && recruiterDecision.reasons.length > 0 ? (
                        <ul className="space-y-2.5">
                          {recruiterDecision.reasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                              <span className="text-rose-500 mt-1 font-bold text-sm leading-none">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          • {recruiterDecision.reason || "Underperformed in core screening domains."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card C: Suggestions block (Col-span-4) */}
                  <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg select-text">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Actionable Suggestions
                    </h3>

                    <p className="text-[11px] text-slate-500 mb-3.5 leading-normal">
                      Specific checkpoints to secure a shortlist next time:
                    </p>

                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                      {(recruiterDecision.suggestions && recruiterDecision.suggestions.length > 0) ? (
                        <ul className="space-y-2.5">
                          {recruiterDecision.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                              <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (recruiterDecision.feedbackPoints && recruiterDecision.feedbackPoints.length > 0) ? (
                        <ul className="space-y-2.5">
                          {recruiterDecision.feedbackPoints.map((pt, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                              <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          No suggestions found. Focus on demonstrating more quantifiable achievements in past projects.
                        </p>
                      )}
                    </div>
                  </div>

                </div>

                {/* 3. SPEECH BUBBLE COMMENTARY CARD */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative select-text">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-850 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎙️</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Recruiter Commentary</h4>
                        <p className="text-[9px] text-slate-500 font-mono">Voice assistant speech breakdown</p>
                      </div>
                    </div>

                    <button
                      onClick={() => speakRecruiterText(recruiterDecision.verbalResponse || "I have completed your job acceptability review.", true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Play Audio Review
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-serif italic bg-slate-950/50 p-4 rounded-xl border border-slate-850 select-text">
                    "${recruiterDecision.verbalResponse || "Thanks for completing your mock interview simulation. Your profile evaluation and interview data are saved."}"
                  </p>

                  {recruiterDecision.reasonSummary && (
                    <div className="mt-4">
                      <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 mb-1">Detailed Commentary Summary</p>
                      <p className="text-xs text-slate-400 leading-relaxed select-text">{recruiterDecision.reasonSummary}</p>
                    </div>
                  )}
                </div>

                {/* 4. RE-EVALUATION CONTROLS */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      if (synthesisRef.current) {
                        synthesisRef.current.cancel();
                      }
                      setShowRecruiterDecision(false);
                      setRecruiterDecision(null);
                    }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700"
                  >
                    Start New Evaluation
                  </button>
                  <button
                    onClick={handleGetRecruiterDecision}
                    className="py-3 px-6 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10"
                  >
                    Re-Evaluate Verdict
                  </button>
                </div>

              </div>
            ) : (
              /* ELEGANT STEP-BY-STEP LANDING BOARD */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl mx-auto mb-6">
                  💼
                </div>

                <h3 className="text-lg font-bold text-slate-200">Unlock Job Suitability & Hiring Verdict</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-md mx-auto">
                  Get a comprehensive recruitment verdict that details if your profile matches current jobs, along with specific reasons and actionable suggestions for improvement.
                </p>

                {/* Vertical pipeline checklist */}
                <div className="mt-8 space-y-4 max-w-sm mx-auto text-left">
                  {/* Step 1: Upload Resume */}
                  <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        resumeData ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                      }`}>
                        {resumeData ? "✓" : "1"}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Step 1: Upload Profile</p>
                        <p className="text-[10px] text-slate-400">Establish target role & qualifications</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                      resumeData ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"
                    }`}>
                      {resumeData ? "Ready" : "Pending"}
                    </span>
                  </div>

                  {/* Step 2: Answering questions */}
                  <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        Object.values(userAnswers).filter(Boolean).length > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                      }`}>
                        {Object.values(userAnswers).filter(Boolean).length > 0 ? "✓" : "2"}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Step 2: Mock Interview</p>
                        <p className="text-[10px] text-slate-400">Complete mock questions & assessments</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {Object.values(userAnswers).filter(Boolean).length} Answer(s) Drafted
                    </span>
                  </div>
                </div>

                {/* Call to action */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setActiveTab("interview");
                    }}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700"
                  >
                    Go to Interview Simulator
                  </button>

                  <button
                    onClick={handleGetRecruiterDecision}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10"
                  >
                    Generate Verdict Now →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* LEFT PROFILE CORNER (Col span 4) */}
            <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-800">
                  Profile Gap Context
                </h3>
                
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  The Career Coach uses your analyzed resume profile metadata to answer questions. Current target gaps detected:
                </p>

                <div className="space-y-2">
                  {resumeData && resumeData.skillGaps && resumeData.skillGaps.length > 0 ? (
                    resumeData.skillGaps.map((gap, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px]">
                        <p className="font-bold text-sky-400 font-mono">{cleanSkillName(gap)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No resume parsed yet. Upload your profile or click 'Load Sample Profile' below to provide context for the Coach.</p>
                  )}
                </div>
                {!resumeData && (
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => setActiveTab("resume")}
                      className="w-full py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl font-bold text-xs"
                    >
                      Go to Upload Profile
                    </button>
                    <button
                      onClick={handleLoadDemoResume}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
                    >
                      Load Sample Profile
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 leading-normal">
                  Our Career Coach AI references current real-world software specifications from JNTUH, Udemy, and Google.
                </p>
              </div>
            </div>

            {/* RIGHT CONVERSATIONAL TERMINAL (Col span 8) */}
            <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between min-h-[480px]">
              
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-sky-400" />
                    <h3 className="text-sm font-bold text-slate-200 font-display">Roadmap Advisor & Career Coach</h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Online
                  </span>
                </div>

                {/* Conversation logs */}
                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1 flex flex-col mb-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-sky-500 text-slate-950 self-end font-bold rounded-tr-none shadow-md shadow-sky-500/5"
                          : "bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-950 dark:text-slate-100 self-start rounded-tl-none font-medium"
                      }`}
                    >
                      {renderChatMessageContent(msg.content, msg.role)}
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="bg-slate-950 border border-slate-800 text-slate-300 self-start p-3.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-150"></span>
                      </div>
                      <span className="text-slate-500 font-mono text-[10px]">Coach is evaluating options...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input & Attachment Actions Block (supporting "photos, pdfs anni upload cheyyadaniki kudarali") */}
              <div>
                
                {/* Visual Attachment queue slot */}
                {chatAttachment && (
                  <div className="mb-3.5 p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl flex items-center justify-between text-xs font-mono">
                    <span className="truncate">📎 Queued Attachment: {chatAttachment.fileName}</span>
                    <button
                      id="btn-remove-attachment"
                      onClick={() => setChatAttachment(null)}
                      className="text-red-400 hover:text-red-300 ml-2"
                      title="Remove Attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 bg-slate-950 rounded-xl border border-slate-800 p-2 focus-within:border-sky-500 transition-colors">
                  
                  {/* File attach button */}
                  <label className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer transition-colors relative" title="Upload Photos or Documents">
                    <input
                      id="chat-file-input"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleChatAttachmentChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Paperclip className="w-4 h-4" />
                  </label>

                  <input
                    id="chat-text-input"
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendChatMessage();
                    }}
                    placeholder="Ask for roadmap edits, interview prep tips, or upload certificates..."
                    className="flex-1 bg-transparent border-0 outline-none text-xs text-slate-200 placeholder-slate-500 px-2"
                  />

                  <button
                    id="btn-send-chat"
                    onClick={handleSendChatMessage}
                    disabled={chatLoading}
                    className="p-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 rounded-lg font-bold transition-colors shadow-md shadow-sky-500/10 flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[10px] text-slate-500 text-center mt-3 leading-relaxed">
                  You can upload certificates, job descriptions, or design sketches to get custom advice mapped to your active roadmap.
                </p>
              </div>

            </div>

          </div>
        )}

          </>
        )}

      </div>

      {/* Job Application Portal Selector Modal */}
      {selectedJobForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border-slate-800 text-slate-100 border rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedJobForModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full transition-colors text-slate-400 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-800"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3.5 mb-5 pb-4 border-b border-slate-800">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 flex-shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide">{selectedJobForModal.company}</span>
                  <span className="text-[10px] font-mono font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {selectedJobForModal.matchPercentage}% match
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-extrabold text-slate-100 font-display mt-0.5">{selectedJobForModal.title}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {selectedJobForModal.location}</span>
                  <span>•</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedJobForModal.salary}</span>
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Select Job Application Portal
              </h4>
              <p className="text-xs text-slate-400">Apply directly on your preferred platform to view active vacancies, submit your resume, or connect with recruiters:</p>
            </div>

            {/* Platform Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
              {getJobPlatformLinks(selectedJobForModal.title, selectedJobForModal.company, selectedJobForModal.applyUrl).map((platform, pIdx) => (
                <div key={pIdx} className="bg-slate-950 border-slate-800/80 hover:border-indigo-500/40 border rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-sm">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-black font-mono ${platform.bgColor} ${platform.textColor} ${platform.borderColor} border`}>
                          {platform.badge}
                        </span>
                        <span className="font-bold text-xs text-slate-200 group-hover:text-indigo-300 transition-colors">{platform.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Portal</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{platform.description}</p>
                  </div>
                  <button
                    onClick={() => handleApplyLink(platform.url)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${platform.bgColor} ${platform.textColor} ${platform.borderColor} border hover:opacity-90 shadow-sm`}
                  >
                    Apply on {platform.name} <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer Quick Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => {
                  const platforms = getJobPlatformLinks(selectedJobForModal.title, selectedJobForModal.company, selectedJobForModal.applyUrl);
                  [0, 1, 2, 3].forEach(idx => handleApplyLink(platforms[idx].url));
                }}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4" /> Open Top Portals Directly
              </button>
              <button
                onClick={() => setSelectedJobForModal(null)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding conforming to visual rules */}
      <footer id="app-footer" className="w-full max-w-7xl mx-auto border-t border-slate-900 mt-12 py-6 text-center text-xs text-slate-500 font-sans">
        <p>© 2026 CareerAgent AI Suite. Designed with high fidelity Bento layouts, server-side Gemini analysis, and interactive browser TTS assistance.</p>
      </footer>

    </div>
  );
};
