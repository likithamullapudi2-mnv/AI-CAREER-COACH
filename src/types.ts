export interface Milestone {
  title: string;
  description: string;
  duration: string;
  status: "completed" | "current" | "upcoming";
  resources?: string[];
}

export interface JobRecommendation {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  matchPercentage: number;
  skillsRequired: string[];
  applyUrl: string;
  platforms?: { name: string; url: string }[];
}

export interface CourseRecommendation {
  title: string;
  provider: string;
  duration: string;
  description: string;
  skillsCovered: string[];
  url: string;
}

export interface ResumeAnalysisResult {
  name: string;
  currentRole: string;
  targetRole: string;
  targetRoleSpecified?: boolean;
  summary: string;
  skills: string[];
  strengths: string[];
  skillGaps: string[];
  roadmap: Milestone[];
  jobs: JobRecommendation[];
  courses: CourseRecommendation[];
  resumeScore?: number;
  atsScore?: number;
}

export interface InterviewQuestion {
  id: number;
  category: "Technical" | "Behavioral" | "Scenario" | "Intro";
  question: string;
  context?: string;
  company?: string;
}

export interface EvaluationResult {
  score: number;
  isCorrect?: boolean;
  feedback: string;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}
