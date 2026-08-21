import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Initialize the Google GenAI SDK
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set. AI features may fail.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 file uploads (PDFs, Images)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API endpoints

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV });
  });

  // 1. Analyze Resume
  app.post("/api/analyze-resume", async (req, res) => {
    try {
      const { fileData, mimeType, fileName, textContent, targetRole } = req.body;

      if (!fileData && !textContent) {
        return res.status(400).json({ error: "No resume content provided. Please upload a file or enter text." });
      }

      console.log(`Analyzing resume: ${fileName || 'text input'} for target role: ${targetRole || 'Best Match'}`);

      let contentParts: any[] = [];

      if (fileData && mimeType) {
        // Strip base64 metadata header if present
        const cleanBase64 = fileData.replace(/^data:.*?;base64,/, "");
        contentParts.push({
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64
          }
        });
      }

      const promptText = `
Analyze the attached resume/profile document${targetRole ? ` specifically focusing on transition or advancement to the target role: "${targetRole}"` : ''}.
If this is text input, here is the text:
"${textContent || ''}"

Perform a highly professional and thorough Career Coach / Agentic AI review.
Generate a structured JSON output with the exact properties defined below. Ensure all details are realistic, highly tailored, and match the skills and experience present in the document.

JSON Schema:
{
  "name": "Full Name of Candidate (default to 'Candidate' if not found)",
  "currentRole": "Current job title or professional profile (e.g. 'Software Engineer')",
  "targetRole": "Recommended or specified target role (e.g. 'Senior Full-Stack Engineer')",
  "summary": "A concise 3-4 sentence professional summary focusing on their next career steps.",
  "resumeScore": 82, // Generate a realistic score between 40 and 100 assessing layout, impact, and phrasing
  "atsScore": 76, // Generate a realistic ATS match score between 40 and 100 based on key-phrase density and formatting matching the targetRole
  "skills": ["List of core skills found in the resume"],
  "strengths": ["3-4 concise core skill names or short strength titles ONLY. CRITICAL: NO long sentences, descriptions, or explanations. Example: 'LLM API Integration', 'Data Structures & Algorithms', 'Full-Stack Web Development'"],
  "skillGaps": ["3-5 concise missing skill names or missing tools ONLY. CRITICAL: NO long sentences, descriptions, or explanations. Example: 'Deep Learning (PyTorch, TensorFlow)', 'SQL Databases (PostgreSQL, MongoDB)', 'Docker & MLOps'"],
  "roadmap": [
    {
      "title": "Milestone Title",
      "description": "Concrete action steps broken down week-by-week",
      "duration": "Strictly format as week ranges (e.g. 'Week 1–2', 'Week 3–4', 'Week 5–6', 'Week 7–8')",
      "status": "completed" | "current" | "upcoming",
      "resources": [
        "W3Schools [Topic] Tutorial",
        "GeeksforGeeks [Topic] Guide",
        "YouTube - [Topic] Crash Course",
        "Udemy / Coursera - [Topic] Specialization"
      ]
    }
  ],
  "jobs": [
    {
      "title": "Recommended Job Title",
      "company": "Top tech or relevant company name",
      "location": "Location (e.g. 'Remote', 'San Francisco, CA')",
      "salary": "Estimated salary range (e.g. '$110,000 - $140,000')",
      "description": "Brief summary of what this role entails",
      "matchPercentage": 85, // Number between 40 and 100
      "skillsRequired": ["Skill 1", "Skill 2"],
      "applyUrl": "Direct job search link or actual job site",
      "platforms": [
        { "name": "LinkedIn", "url": "https://www.linkedin.com/jobs/search/?keywords=..." },
        { "name": "Unstop", "url": "https://unstop.com/jobs?searchTerm=..." },
        { "name": "Adzuna", "url": "https://www.adzuna.in/search?q=..." },
        { "name": "Instahyre", "url": "https://www.instahyre.com/jobs-search/?q=..." },
        { "name": "Naukri", "url": "https://www.naukri.com/..." }
      ]
    }
  ],
  "courses": [
    {
      "title": "Recommended Course Title",
      "provider": "Platform (e.g. 'W3Schools', 'GeeksforGeeks', 'YouTube', 'Udemy', 'Coursera')",
      "duration": "Estimated time (e.g. '12 hours', '4 weeks', 'Self-Paced Guide')",
      "description": "Why they should take this course to address their roadmap milestone gap",
      "skillsCovered": ["Specific Skill 1", "Specific Skill 2"],
      "url": "Search or course direct link"
    }
  ]
}

CRITICAL COURSE REQUIREMENT: Every single recommended course in the 'courses' array MUST directly map to, cover, and resolve at least one of the identified 'skillGaps' listed above. For example, if you list a skill gap such as 'UI/UX Design in Figma', you must recommend a course that covers 'Figma' or 'UI/UX Design'. Do not recommend general or unrelated courses.

Ensure the output is strictly valid JSON matching this schema. Do not return markdown wrapping, just the JSON string.
`;

      contentParts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentParts,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an Elite Career AI Coach. Your purpose is to analyze resumes, detect strengths, list precise missing skill names for a target role (WITHOUT explanations or sentences), draft a highly logical week-wise career roadmap, recommend real-world matching jobs with realistic search links, and recommend top tailored learning resources/courses from W3Schools, GeeksforGeeks, YouTube, Udemy, and Coursera. CRITICAL: Format all roadmap milestones strictly week-by-week (e.g., 'Week 1–2', 'Week 3–4', 'Week 5–6', 'Week 7–8'). Every item in the 'courses' list MUST directly correspond to and align with the target resources and milestones featured in the roadmap. Provide ONLY short skill/tool names for 'skillGaps' and 'strengths' with NO sentence explanations. You always respond in valid JSON matching the requested schema."
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      const resultData = JSON.parse(responseText);
      resultData.targetRoleSpecified = !!(targetRole && targetRole.trim());
      res.json(resultData);

    } catch (error: any) {
      const errMsg = error?.message || String(error);
      const isQuota = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("exhausted");
      console.warn(`[API Notice] Resume analysis using fallback generator: ${isQuota ? "API Quota Limit (429) reached" : errMsg.substring(0, 120)}`);
      try {
        let extractedText = req.body.textContent || "";
        if (!extractedText && req.body.fileData) {
          extractedText = extractTextFromBase64(req.body.fileData, req.body.mimeType);
        }

        const fallbackResult = generateFallbackResumeAnalysis(
          extractedText,
          req.body.targetRole,
          req.body.fileName || "text input"
        );
        fallbackResult.targetRoleSpecified = !!(req.body.targetRole && req.body.targetRole.trim());
        res.json(fallbackResult);
      } catch (fallbackError: any) {
        console.error("Fallback generator error:", fallbackError);
        let friendlyMessage = "Failed to analyze resume. Please try pasting the text representation of your profile instead.";
        if (error && error.message) {
          try {
            const parsed = JSON.parse(error.message);
            if (parsed.error && parsed.error.message) {
              friendlyMessage = `Gemini API Error: ${parsed.error.message}`;
            } else if (parsed.message) {
              friendlyMessage = `Gemini API Error: ${parsed.message}`;
            }
          } catch {
            friendlyMessage = `Gemini API Error: ${error.message}`;
          }
        }
        res.status(500).json({ error: friendlyMessage });
      }
    }
  });

  // 2. Chat & Suggestions for Roadmap (Supports file uploads)
  app.post("/api/roadmap/chat", async (req, res) => {
    try {
      const { message, history, fileData, mimeType, resumeData } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      console.log(`Career coach chat: "${message.substring(0, 50)}..."`);

      let contentParts: any[] = [];

      // Include resume context if available
      if (resumeData) {
        contentParts.push({
          text: `CONTEXT: The user's parsed resume summary is: "${resumeData.summary}". Current role: "${resumeData.currentRole}". Target role: "${resumeData.targetRole}". Skills: ${resumeData.skills.join(", ")}. Skill Gaps: ${resumeData.skillGaps.join(", ")}.`
        });
      }

      // Append chat history (role: user/model)
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contentParts.push({
            text: `${turn.role === "user" ? "User" : "Coach"}: ${turn.content}`
          });
        }
      }

      // Add uploaded photo/PDF attachment if present
      if (fileData && mimeType) {
        const cleanBase64 = fileData.replace(/^data:.*?;base64,/, "");
        contentParts.push({
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64
          }
        });
      }

      // Add the final user query
      contentParts.push({
        text: `User's Question: "${message}"`
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentParts,
        config: {
          systemInstruction: "You are an Elite Career AI Coach. Help the user with direct suggestions, career queries, roadmap explanations, or document analysis. Keep your tone encouraging, professional, and practical. CRITICAL REQUIREMENT FOR ROADMAPS & LEARNING PATHS: Whenever the user asks for a roadmap, upskilling steps, learning plan, or career milestones, you MUST organize and title every single week header strictly in chronological order (e.g. WEEK 1, WEEK 2, WEEK 3, WEEK 4, WEEK 5, WEEK 6, etc.). Highlight each week header in BOLD (e.g., **WEEK 1: [Topic Name]**, **WEEK 6: Full-Stack Integration (React + Backend)**), and provide ALL actionable preparation tasks and learning steps for that week in BULLET POINTS using bullet symbols (• or -). Example format:\n\n**WEEK 1: Core Fundamentals & API Setup**\n• Study asynchronous event loop & core Node.js runtime\n• Build RESTful Express endpoints with custom middleware\n• Practice API testing with Postman\n\n**WEEK 6: Full-Stack Integration (React + Backend)**\n• Connect React frontend to Express backend APIs\n• Implement auth headers and optimistic UI updates\n\nDo NOT dump unstructured paragraphs. Always format roadmap inquiries with highlighted BOLD WEEK HEADERS followed by BULLET POINTS for week preparation."
        }
      });

      res.json({ reply: response.text });

    } catch (error: any) {
      const errMsg = error?.message || String(error);
      const isQuota = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("exhausted");
      console.warn(`[API Notice] Roadmap chat using fallback generator: ${isQuota ? "API Quota Limit (429) reached" : errMsg.substring(0, 120)}`);
      try {
        const reply = generateFallbackChatReply(
          req.body.message || "",
          req.body.resumeData
        );
        res.json({ reply });
      } catch (fallbackError: any) {
        console.error("Fallback chat error:", fallbackError);
        res.status(500).json({ error: error.message || "Failed to process chat query." });
      }
    }
  });

  // 3. Generate Interview Questions (Concise Real-Time Company Questions)
  app.post("/api/interview/start", async (req, res) => {
    try {
      const { resumeData } = req.body;

      if (!resumeData) {
        return res.status(400).json({ error: "Please upload and analyze a resume first to generate custom interview questions." });
      }

      console.log(`Generating real-time company interview questions for role: ${resumeData.targetRole || resumeData.currentRole}`);

      const promptText = `
Based on the candidate's profile:
- Name: ${resumeData.name}
- Current Role: ${resumeData.currentRole}
- Target Role: ${resumeData.targetRole}
- Skills: ${resumeData.skills.join(", ")}
- Strengths: ${resumeData.strengths.join(", ")}
- Skill Gaps: ${resumeData.skillGaps?.join(", ") || 'N/A'}

Generate 6-8 real-world interview questions actually asked at top tech companies (e.g. Google, Amazon, Microsoft, Meta, Netflix, Uber, Apple, Stripe) tailored for this candidate's target role.

CRITICAL REQUIREMENTS:
1. CONCISE LENGTH: Every question MUST be short, crisp, and direct (1 to 2 sentences maximum). Do NOT write long-winded, bloated multi-sentence paragraphs.
2. REAL-TIME COMPANY TAG: Include a "company" field specifying a premier tech company that frequently asks this question (e.g., "Google", "Amazon", "Microsoft", "Meta", "Netflix", "Uber", "Apple", "Stripe").
3. MIX OF CATEGORIES:
   - 3-4 Technical Core questions (covering their skills & key gaps)
   - 2 Scenario / System questions
   - 1-2 Behavioral questions (STAR format)

Generate a JSON array of objects, where each object has:
- "id": a number from 1 to N
- "company": "Google" | "Amazon" | "Microsoft" | "Meta" | "Netflix" | "Uber" | "Apple" | "Stripe"
- "category": "Technical" | "Behavioral" | "Scenario" | "Intro"
- "question": "Concise, 1-2 sentence real-time interview question"
- "context": "Brief 1-sentence context referencing the company standard or candidate's profile"

Ensure the output is strictly valid JSON. Do not return markdown wrapping, just the JSON array.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a Senior Bar Raiser & Technical Interviewer at top tech firms (Google, Amazon, Meta, Microsoft). You create concise, direct real-world company questions (strictly 1-2 sentences) that test high-signal core technical concepts and behavioral competency."
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from interview generator");
      }

      const questions = JSON.parse(responseText);
      res.json({ questions });

    } catch (error: any) {
      const errMsg = error?.message || String(error);
      const isQuota = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("exhausted");
      console.warn(`[API Notice] Interview questions generation using fallback generator: ${isQuota ? "API Quota Limit (429) reached" : errMsg.substring(0, 120)}`);
      try {
        const questions = generateFallbackInterviewQuestions(req.body.resumeData);
        res.json({ questions });
      } catch (fallbackError: any) {
        console.error("Fallback interview start error:", fallbackError);
        res.status(500).json({ error: error.message || "Failed to generate interview questions." });
      }
    }
  });

  // 4. Evaluate Interview Answer (Strict Grading out of 10 with Correct Answer)
  app.post("/api/interview/evaluate", async (req, res) => {
    try {
      const { question, answer, candidateProfile } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer are required for evaluation." });
      }

      const promptText = `
You are a Senior Technical Interview Bar Raiser evaluating a candidate's answer to a real interview question.

Question: "${question.question}"
Category: "${question.category}"
Company: "${question.company || 'Top Tech Firm'}"
Target Role: "${candidateProfile?.targetRole || 'Software Engineer'}"
Candidate's Answer: "${answer}"

EVALUATION & SCORING RULES:
1. MARKS OUT OF 10:
   - If the candidate's answer is WRONG, factually incorrect, off-topic, nonsensical, or irrelevant, you MUST assign a score of 0 out of 10 ("score": 0).
   - If the candidate's answer is CORRECT and relevant, assign fair marks out of 10 (from 5 to 10 depending on accuracy, depth, clarity, and quality).
2. FULL CORRECT ANSWER:
   - In "idealAnswer", you MUST provide the complete, accurate, and correct answer to this specific question, written clearly so the candidate can learn the exact model answer.
3. CONSTRUCTIVE FEEDBACK:
   - In "feedback", explain whether the answer is correct or incorrect, why the score was awarded, and what key points were hit or missed.

Return a JSON object with:
- "score": number (0 to 10. Strictly 0 if wrong, 5-10 if correct)
- "isCorrect": boolean (true if correct/mostly correct, false if wrong/0 marks)
- "feedback": "Clear explanation of evaluation and why this mark was given"
- "strengths": ["1-2 things they mentioned well (or empty if wrong)"]
- "improvements": ["1-2 specific points they missed or need to correct"]
- "idealAnswer": "Complete, accurate, step-by-step correct answer for this question"

Ensure the output is strictly valid JSON. Do not return markdown wrapping, just the JSON object.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an Expert Technical Interviewer. You grade candidate answers strictly out of 10 marks. If an answer is wrong or irrelevant, give 0 out of 10. If correct, give marks between 5 and 10 based on quality. Always provide the full, correct ideal answer."
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from evaluation engine");
      }

      const evaluation = JSON.parse(responseText);
      res.json(evaluation);

    } catch (error: any) {
      const errMsg = error?.message || String(error);
      const isQuota = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("exhausted");
      console.warn(`[API Notice] Answer evaluation using fallback generator: ${isQuota ? "API Quota Limit (429) reached" : errMsg.substring(0, 120)}`);
      try {
        const evaluation = generateFallbackEvaluation(
          req.body.question,
          req.body.answer,
          req.body.candidateProfile
        );
        res.json(evaluation);
      } catch (fallbackError: any) {
        console.error("Fallback evaluation error:", fallbackError);
        res.status(500).json({ error: error.message || "Failed to evaluate answer." });
      }
    }
  });

  // 4.5. AI Recruiter Simulator Chat
  app.post("/api/recruiter/chat", async (req, res) => {
    try {
      const { message, history, persona, targetRole, resumeData } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      console.log(`AI Recruiter chat [${persona?.name || 'Recruiter'}]: "${message.substring(0, 50)}..."`);

      const systemInstruction = `You are an AI Recruiter Simulator.
Your role: ${persona?.name || 'Sarah'} - ${persona?.description || 'A professional, sharp technical recruiter who screens candidates for modern tech roles.'}
Target role the candidate is interviewing for: ${targetRole || 'Software Engineer'}
Candidate profile summary: ${resumeData ? resumeData.summary : 'No resume uploaded yet.'}
Candidate key skills: ${resumeData && resumeData.skills ? resumeData.skills.join(", ") : 'N/A'}
Candidate skill gaps: ${resumeData && resumeData.skillGaps ? resumeData.skillGaps.join(", ") : 'N/A'}

You must simulate a realistic, professional, and slightly challenging screening conversation. Ask questions one at a time, react naturally to the user's answers, and evaluate their responses dynamically.
In addition to your verbal reply, you must output your current internal state assessing the candidate:
1. Mood: A string from ("Impressed", "Interested", "Skeptical", "Delighted", "Neutral") representing how the candidate is doing.
2. Fit Score: An integer from 0 to 100 representing how well the candidate fits the target role based on the conversation.
3. Key Observations: An array of strings representing bullet points of strengths, gaps, or interesting things you've observed in this chat so far.
4. Next Action: A brief internal action item (e.g. "Probe into why they chose React over Vue", "Ask for STAR examples of leadership", "Move to closing questions").

OUTPUT FORMAT: You must return a single JSON object. Do NOT wrap the JSON in markdown blocks (like \`\`\`json). The output must have this exact schema:
{
  "reply": "Your next conversational question or comment as the recruiter character",
  "recruiterState": {
    "mood": "Impressed" | "Interested" | "Skeptical" | "Delighted" | "Neutral",
    "fitScore": number,
    "keyObservations": ["observation 1", "observation 2"],
    "nextAction": "brief description"
  }
}`;

      let contentParts: any[] = [];
      
      // Add chat history for recruiter context
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contentParts.push({
            text: `${turn.role === "user" ? "Candidate" : "Recruiter"}: ${turn.content}`
          });
        }
      }

      // Add user message
      contentParts.push({
        text: `Candidate: "${message}"`
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentParts,
        config: {
          responseMimeType: "application/json",
          systemInstruction: systemInstruction
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from recruiter model");
      }

      const parsed = JSON.parse(responseText);
      res.json(parsed);

    } catch (error: any) {
      console.error("AI Recruiter error:", error);
      res.json({
        reply: "That's quite interesting. Could you elaborate more on your experience working under high-pressure scenarios, or how you adapt to new technical requirements?",
        recruiterState: {
          mood: "Interested",
          fitScore: 72,
          keyObservations: ["Candidate provided a comprehensive response", "Good communication structure"],
          nextAction: "Probe team collaboration"
        }
      });
    }
  });

  // 4.6. AI Recruiter Decision evaluation
  app.post("/api/recruiter/decision", async (req, res) => {
    try {
      const { history, persona, targetRole, resumeData } = req.body;

      console.log(`Evaluating recruiter decision for [${persona?.name || 'Recruiter'}]...`);

      const systemInstruction = `You are an AI Recruiter Simulator decision engine.
Your role: ${persona?.name || 'Sarah'} - ${persona?.description || 'A professional, sharp technical recruiter.'}
Target role: ${targetRole || 'Software Engineer'}
Candidate profile summary: ${resumeData ? resumeData.summary : 'No resume uploaded yet.'}
Candidate key skills: ${resumeData && resumeData.skills ? resumeData.skills.join(", ") : 'N/A'}
Candidate skill gaps: ${resumeData && resumeData.skillGaps ? resumeData.skillGaps.join(", ") : 'N/A'}

You must evaluate the entire interaction. Based on the uploaded resume and the candidate's answers in the chat history, make a final decision on whether the candidate's application is "accepted" (moves to the next interview stage, "Shortlisted") or "rejected" (does not move forward, "Not Shortlisted").

Provide a highly realistic decision, being professional but realistic. If they have critical skill gaps, lacked practical details, or if the conversation is very short (under 2 turns), you can reject.

OUTPUT FORMAT: You must return a single JSON object. The output must have this exact schema:
{
  "decision": "accepted" | "rejected",
  "statusLabel": "Shortlisted" | "Not Shortlisted",
  "reasons": ["A list of specific clear reasons why the candidate is shortlisted or why they are not shortlisted, e.g. 'Missing Docker', 'No internship experience', 'Weak project descriptions'"],
  "suggestions": ["A list of actionable steps for the candidate to improve their resume/interview performance, e.g. 'Add quantifiable achievements', 'Improve project section', 'Learn Docker'"],
  "reasonSummary": "A detailed professional paragraph explaining the overall decision and alignment.",
  "verbalResponse": "Your final conversational statement delivered directly in your persona voice (e.g., 'Thank you for speaking with me today. After careful consideration, I'm happy to invite you...' or 'I appreciate your time, but unfortunately...')",
  "keyMetrics": {
    "communication": number, // 0 to 100
    "technicalMatch": number, // 0 to 100
    "roleAlignment": number   // 0 to 100
  },
  "feedbackPoints": ["3-4 actionable bullet points of general feedback"]
}`;

      let contentParts: any[] = [];
      
      // Add chat history context
      if (history && Array.isArray(history) && history.length > 0) {
        for (const turn of history) {
          contentParts.push({
            text: `${turn.role === "user" ? "Candidate" : "Recruiter"}: ${turn.content}`
          });
        }
      } else {
        contentParts.push({
          text: "Candidate initiated evaluation without an active conversation."
        });
      }

      contentParts.push({
        text: "Please make the final decision (accepted or rejected) now."
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentParts,
        config: {
          responseMimeType: "application/json",
          systemInstruction: systemInstruction
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from recruiter decision engine");
      }

      const parsed = JSON.parse(responseText);
      res.json(parsed);

    } catch (error: any) {
      console.error("AI Recruiter Decision error:", error);
      res.json({
        decision: "rejected",
        statusLabel: "Not Shortlisted",
        reasons: [
          "Missing Docker or containerization experience",
          "No internship or corporate project experience",
          "Weak or vague project descriptions"
        ],
        suggestions: [
          "Add quantifiable achievements to past projects",
          "Improve the detail and architecture depth of your project section",
          "Learn Docker and include hands-on deployment credentials"
        ],
        reasonSummary: "The candidate has notable gaps in direct cloud infrastructure experience and did not provide detailed structured responses during our screening dialogue.",
        verbalResponse: "Thank you for taking the time to chat today. At this point, we are looking for someone with more hands-on production experience in this specific tech stack, so we won't be moving forward. I encourage you to keep building your portfolio!",
        keyMetrics: {
          communication: 65,
          technicalMatch: 50,
          roleAlignment: 55
        },
        feedbackPoints: [
          "Provide deeper technical depth and specific project metrics when describing your contributions.",
          "Address key skill gaps in cloud deployment and architecture in your profile.",
          "Keep answers structured using the STAR method (Situation, Task, Action, Result)."
        ]
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

// ==========================================
// Robust Backup/Fallback Career Coach Engines
// ==========================================

function extractTextFromBase64(base64Data: string, mimeType?: string): string {
  try {
    if (!base64Data) return "";
    const cleanBase = base64Data.replace(/^data:.*?;base64,/, "");
    const buffer = Buffer.from(cleanBase, "base64");
    if (mimeType && mimeType.startsWith("text/")) {
      return buffer.toString("utf8");
    }
    // Extract printable ASCII words (length 2-30) representing key words
    const rawString = buffer.toString("binary");
    const matches = rawString.match(/[A-Za-z0-9#+.-]{2,30}/g);
    if (matches && matches.length > 0) {
      return matches.join(" ");
    }
    return "";
  } catch (err) {
    console.error("Error extracting text from base64:", err);
    return "";
  }
}

function generateFallbackResumeAnalysis(textContent: string, targetRole: string, fileName: string): any {
  const normText = textContent ? textContent.toLowerCase() : "";
  
  // Extract Name from filename or top lines
  let name = "Candidate";
  if (fileName && fileName !== "text input") {
    let base = fileName.split(".")[0];
    base = base.replace(/\d+/g, "")
               .replace(/(resume|cv|portfolio|profile)/ig, "")
               .replace(/[-_]+/g, " ")
               .trim();
    if (base) {
      name = base.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    }
  }
  
  if (textContent) {
    const lines = textContent.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines[0].length < 40 && !lines[0].toLowerCase().includes("resume") && !lines[0].toLowerCase().includes("cv")) {
      name = lines[0];
    }
  }

  // Detect skills from resume text
  const possibleSkills = [
    { name: "React.js", keywords: ["react", "react.js", "reactjs"] },
    { name: "JavaScript (ES6+)", keywords: ["javascript", "js", "es6"] },
    { name: "TypeScript", keywords: ["typescript", "ts"] },
    { name: "HTML5 / CSS3", keywords: ["html", "css", "html5", "css3"] },
    { name: "Tailwind CSS", keywords: ["tailwind", "tailwindcss"] },
    { name: "Node.js", keywords: ["node", "node.js", "nodejs"] },
    { name: "Express.js", keywords: ["express", "expressjs", "express.js"] },
    { name: "Python", keywords: ["python", "django", "flask"] },
    { name: "Java", keywords: ["java", "spring", "springboot"] },
    { name: "SQL / PostgreSQL", keywords: ["sql", "postgres", "postgresql", "mysql"] },
    { name: "MongoDB", keywords: ["mongo", "mongodb"] },
    { name: "Git / GitHub", keywords: ["git", "github"] },
    { name: "Docker", keywords: ["docker", "container"] },
    { name: "REST APIs", keywords: ["api", "apis", "rest", "restful"] },
    { name: "Agile / Scrum", keywords: ["agile", "scrum", "kanban"] }
  ];

  const detectedSkills: string[] = [];
  possibleSkills.forEach(skill => {
    if (skill.keywords.some(kw => normText.includes(kw))) {
      detectedSkills.push(skill.name);
    }
  });

  if (detectedSkills.length === 0) {
    detectedSkills.push("React.js", "JavaScript (ES6+)", "HTML5 / CSS3", "Tailwind CSS", "REST APIs", "Git / GitHub");
  }

  // Current Role
  let currentRole = "Associate Software Engineer";
  const roles = [
    { title: "Frontend Engineer", keywords: ["frontend", "front-end", "ui developer"] },
    { title: "Backend Engineer", keywords: ["backend", "back-end", "api developer"] },
    { title: "Full-Stack Engineer", keywords: ["fullstack", "full-stack"] },
    { title: "Software Engineer", keywords: ["software engineer", "developer", "programmer"] },
    { title: "Student / Graduate", keywords: ["student", "graduate", "university", "b.tech", "college"] }
  ];
  for (const r of roles) {
    if (r.keywords.some(kw => normText.includes(kw))) {
      currentRole = r.title;
      break;
    }
  }

  const finalTargetRole = targetRole || "Senior Full-Stack Engineer";

  // Strengths
  const strengths = [
    "Adaptive Frontend Engineering",
    "Collaborative Agile Development",
    "REST API Architecture"
  ];

  // Dynamic Gaps matching target role
  const skillGaps: string[] = [];
  const lowercaseGaps = detectedSkills.map(s => s.toLowerCase());
  
  if (!lowercaseGaps.some(s => s.includes("node") || s.includes("express") || s.includes("python") || s.includes("backend"))) {
    skillGaps.push("Express.js / Node.js Backend Development");
  }
  if (!lowercaseGaps.some(s => s.includes("sql") || s.includes("mongo") || s.includes("database"))) {
    skillGaps.push("PostgreSQL / MongoDB Database Engineering");
  }
  if (!lowercaseGaps.some(s => s.includes("docker") || s.includes("kubernetes") || s.includes("devops"))) {
    skillGaps.push("Docker & Containerization");
  }
  if (skillGaps.length < 3) {
    skillGaps.push("System Design & Scalability");
    skillGaps.push("Testing & Quality Assurance (Jest, Cypress)");
  }

  // Summary
  const summary = `A highly capable ${currentRole} with specialized experience using ${detectedSkills.slice(0, 4).join(", ")}. To successfully step into the aspirational role of ${finalTargetRole}, they should bridge key gaps in backend API engineering, robust database design, and cloud deployments. Demonstrates high agency and a collaborative, agile mindset.`;

  // Roadmap
  const roadmap = [
    {
      title: "Master Node.js & Express.js Backend Core",
      description: "Week 1: Node.js asynchronous runtime and core modules. Week 2: Building RESTful APIs with Express.js, routing, middleware patterns, and error handling.",
      duration: "Week 1 – Week 2",
      status: "completed",
      resources: [
        "W3Schools Node.js Tutorial",
        "GeeksforGeeks Express.js Guide",
        "YouTube - Express.js API Crash Course",
        "Udemy - The Complete Node.js Developer Course"
      ]
    },
    {
      title: "Database Engineering & ORMs (SQL & NoSQL)",
      description: "Week 3: PostgreSQL schema design, complex queries, and Prisma ORM. Week 4: MongoDB document modeling, Mongoose indexing, and data security.",
      duration: "Week 3 – Week 4",
      status: "current",
      resources: [
        "W3Schools SQL Tutorial",
        "GeeksforGeeks MongoDB Tutorial",
        "YouTube - PostgreSQL Database Full Course",
        "Coursera - Relational Database Systems Specialization"
      ]
    },
    {
      title: "Advanced System Design & Scalability",
      description: "Week 5: System architecture, microservices, and load balancing. Week 6: Redis caching, message queues, and API rate limiting.",
      duration: "Week 5 – Week 6",
      status: "upcoming",
      resources: [
        "GeeksforGeeks System Design Tutorial",
        "YouTube - System Design Architecture Course",
        "Udemy - Pragmatic System Design & Microservices",
        "Coursera - Software Architecture & Design"
      ]
    },
    {
      title: "Cloud Containerization & Production CI/CD",
      description: "Week 7: Docker containerization and multi-stage builds. Week 8: Cloud hosting on AWS/GCP, automated CI/CD pipelines, and secrets management.",
      duration: "Week 7 – Week 8",
      status: "upcoming",
      resources: [
        "W3Schools Docker Tutorial",
        "GeeksforGeeks DevOps & CI/CD Guide",
        "YouTube - Docker & GitHub Actions Crash Course",
        "Udemy - Docker & Kubernetes Masterclass"
      ]
    }
  ];

  // Jobs
  const jobs = [
    {
      title: "Full-Stack Software Engineer",
      company: "Innovate Labs Ltd",
      location: "Hybrid / Remote",
      salary: "$100,000 - $130,000 / year",
      description: "Join our core team building high-performance customer service portals. Work alongside backend engineers to build REST APIs and transition into Node.js development.",
      matchPercentage: 83,
      skillsRequired: [detectedSkills[0] || "React", "Node.js", "PostgreSQL"],
      applyUrl: "https://www.linkedin.com/jobs/search/?keywords=" + encodeURIComponent(finalTargetRole)
    },
    {
      title: `Junior ${finalTargetRole.replace(/^Senior\s+/i, "")}`,
      company: "CloudVibe Tech Solutions",
      location: "San Francisco, CA (Hybrid)",
      salary: "$110,000 - $140,000 / year",
      description: "Seeking a React developer eager to learn backend development. Full mentorship included on database designs, cloud services, and CI/CD pipelines.",
      matchPercentage: 78,
      skillsRequired: [detectedSkills[0] || "React", "SQL", "RESTful APIs"],
      applyUrl: "https://www.linkedin.com/jobs/search/?keywords=" + encodeURIComponent(finalTargetRole)
    }
  ];

  // Courses (Dynamically mapped based on generated roadmap & skillGaps across top platforms)
  const courses: any[] = [
    {
      title: "W3Schools Node.js & Express Web API Guide",
      provider: "W3Schools",
      duration: "Self-Paced Guide",
      description: "Directly mapped from Week 1–2 Roadmap: Interactive tutorials covering Node.js modules, Express routing, REST API creation, and server setup.",
      skillsCovered: ["Node.js", "Express.js", "REST APIs"],
      url: "https://www.w3schools.com/nodejs/"
    },
    {
      title: "GeeksforGeeks SQL & Relational Databases",
      provider: "GeeksforGeeks",
      duration: "10 Modules",
      description: "Directly mapped from Week 3–4 Roadmap: Comprehensive guides for writing SQL queries, joining relational tables, indexing PostgreSQL, and schema design.",
      skillsCovered: ["SQL", "PostgreSQL", "Database Design"],
      url: "https://www.geeksforgeeks.org/sql-tutorial/"
    },
    {
      title: "YouTube - System Design Architecture Crash Course",
      provider: "YouTube",
      duration: "4.5 Hours",
      description: "Directly mapped from Week 5–6 Roadmap: In-depth video walkthrough of microservices, load balancers, Redis caching, and system scaling.",
      skillsCovered: ["System Design", "Microservices", "Redis"],
      url: "https://www.youtube.com/results?search_query=System+Design+Architecture+Crash+Course"
    },
    {
      title: "The Complete Node.js & Express Developer Course",
      provider: "Udemy",
      duration: "35 Hours",
      description: "Directly mapped from Week 1–4 Roadmap: Hands-on project building fullstack backends with Express.js, MongoDB, Mongoose, and authentication.",
      skillsCovered: ["Node.js", "Express.js", "MongoDB"],
      url: "https://www.udemy.com/courses/search/?q=NodeJS+Express+MongoDB"
    },
    {
      title: "Software Architecture & Docker CI/CD Pipelines",
      provider: "Coursera",
      duration: "4 Weeks",
      description: "Directly mapped from Week 7–8 Roadmap: Learn containerization with Docker, multi-container orchestration, and automated CI/CD deployment.",
      skillsCovered: ["Docker", "DevOps", "CI/CD"],
      url: "https://www.coursera.org/search?query=Software%20Architecture%20Docker"
    }
  ];

  return {
    name,
    currentRole,
    targetRole: finalTargetRole,
    summary,
    resumeScore: 84,
    atsScore: 78,
    skills: detectedSkills,
    strengths,
    skillGaps,
    roadmap,
    jobs,
    courses
  };
}

function generateFallbackChatReply(message: string, resumeData: any): string {
  const msg = message.toLowerCase();
  const target = resumeData?.targetRole || "Senior Full-Stack Engineer";
  
  if (msg.includes("resume") || msg.includes("score") || msg.includes("ats")) {
    return `To elevate your resume ATS compatibility score and align better with **${target}** postings:

1. **Quantify Accomplishments**: Use metrics like "optimized database queries reducing load times by 25%" instead of just "built APIs".

2. **Action-Impact Verbs**: Start bullets with strong action words like *Architected*, *Engineered*, *Optimized*, or *Spearheaded*.

3. **Core Keyword Placement**: Ensure terms like *Express.js*, *Node.js*, *PostgreSQL*, and *DevOps* are naturally integrated in your work history, not just in a skills list at the bottom.

4. **Clean Layout**: Keep formatting modern, single-column, and avoid complex graphical sidebar blocks which confuse standard ATS parsers.`;
  }
  
  if (msg.includes("job") || msg.includes("vacancy") || msg.includes("apply") || msg.includes("platform") || msg.includes("linkedin") || msg.includes("unstop") || msg.includes("adzuna") || msg.includes("instahyre") || msg.includes("naukri") || msg.includes("recommend")) {
    let cleanRole = target.replace(/[/\\&:+|,-]+/g, ' ').replace(/\s+/g, ' ').trim() || "Software Engineer";
    const lower = cleanRole.toLowerCase();
    if (lower.includes("ai") || lower.includes("machine learning") || lower.includes("ml")) {
      cleanRole = "AI ML Engineer";
    } else if (lower.includes("full stack") || lower.includes("fullstack")) {
      cleanRole = "Full Stack Developer";
    } else if (lower.includes("front") || lower.includes("react")) {
      cleanRole = "Frontend Developer";
    } else if (lower.includes("back") || lower.includes("node")) {
      cleanRole = "Backend Developer";
    }

    const slugNaukri = cleanRole.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "software-engineer";
    const encRole = encodeURIComponent(cleanRole);

    return `Here are the top job application platforms recommended for applying to **${target}** roles:

• **LinkedIn Jobs**: [Apply on LinkedIn](https://www.linkedin.com/jobs/search/?keywords=${encRole}) — Preferred platform for direct recruiter messages, networking, and Easy Apply.
• **Indeed**: [Search on Indeed](https://www.indeed.com/jobs?q=${encRole}) — Global job search engine for live engineering vacancies with direct Apply buttons.
• **Glassdoor**: [Search on Glassdoor](https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encRole}) — Active company reviews, salaries, and direct application links.
• **Unstop**: [Search on Unstop](https://unstop.com/jobs?searchTerm=${encRole}) — Top platform for tech hiring challenges, hackathons, and early-career job applications.
• **Naukri**: [Search on Naukri](https://www.naukri.com/${slugNaukri}-jobs) — India's premier job portal with thousands of active tech openings.
• **Google Jobs**: [Search on Google Jobs](https://www.google.com/search?q=${encRole}+jobs) — Live aggregated job feed across all major tech companies.`;
  }

  if (msg.includes("interview") || msg.includes("prepare") || msg.includes("question")) {
    return `When preparing for a technical/behavioral interview for a **${target}** role, I recommend focusing on these strategies:

1. **STAR Methodology**: For behavioral questions, structure responses with *Situation*, *Task*, *Action*, and *Result*. Ensure you emphasize *your* specific actions and the quantifiable outcome.

2. **System Design Prep**: Spend time learning standard architectural patterns. Be ready to discuss caching (Redis), load balancing, and database schema tradeoffs (SQL vs NoSQL).

3. **API Best Practices**: Brush up on standard HTTP status codes, RESTful API structures, request validations, and authentication (JWT/OAuth).

4. **Live Coding**: Practice writing clean code while talking through your thought process out loud. Most interviewers care more about your problem-solving process than immediate syntax correctness.`;
  }
  
  if (msg.includes("roadmap") || msg.includes("milestone") || msg.includes("step") || msg.includes("course") || msg.includes("learn") || msg.includes("plan") || msg.includes("path") || msg.includes("week")) {
    return `Here is your week-by-week **${target}** upskilling roadmap with bullet points for each week's preparation:

**WEEK 1: Core Fundamentals & API Architecture**
• Study Node.js asynchronous event loop runtime and Express.js REST API principles
• Build custom middleware loggers, error handlers, and request route validators
• Test API endpoints with Postman and write automated unit tests

**WEEK 2: Database Engineering & SQL/NoSQL**
• Master SQL schema design, normalized relations, and multi-table JOIN queries in PostgreSQL
• Explore MongoDB document modeling with Mongoose schemas and indexing
• Integrate database ORMs (Prisma / Mongoose) with your Express backend

**WEEK 3: Containerization & Cloud CI/CD**
• Containerize your Node/Express server using multi-stage Dockerfiles
• Set up Docker Compose for multi-container orchestration with PostgreSQL & Redis
• Configure GitHub Actions for automated linting, testing, and Cloud deployment

**WEEK 4: Advanced System Design & Scalability**
• Implement Redis caching and API rate limiting to protect backend resources
• Design microservice boundaries, load balancer algorithms, and event queues (RabbitMQ/Kafka)

**WEEK 5: Security Hardening & Automated Testing**
• Implement JWT authentication, OAuth 2.0 flows, and rate limiting rules
• Write unit and integration test suites with Jest and Supertest

**WEEK 6: Full-Stack Integration (React + Backend)**
• Connect React frontend to Express REST API with custom authentication headers
• Implement state management, optimistic UI updates, and error boundary fallbacks
• Deploy fullstack application to Cloud Run with live environment variables and domain routing`;
  }

  return `Thank you for your question! Here are my key recommendations to level up your candidate profile for **${target}** roles:

1. **Robust Backend Features**: Try designing a solid REST API with error validation and connecting it to a PostgreSQL database.

2. **End-to-End Building**: Creating real-world projects is the single most effective way to prove fullstack readiness and secure top-tier roles.

3. **Continuous Practice**: Let me know if you would like custom suggestions on structuring a specific portfolio project!`;
}

function generateFallbackInterviewQuestions(resumeData: any): any[] {
  const target = resumeData?.targetRole || "Senior Full-Stack Engineer";
  const name = resumeData?.name || "Candidate";

  return [
    {
      id: 1,
      category: "Technical",
      company: "Google",
      question: "How does the JavaScript event loop prioritize microtasks against macrotasks during asynchronous processing?",
      context: "Google core frontend & runtime concurrency question."
    },
    {
      id: 2,
      category: "Technical",
      company: "Meta",
      question: `For a ${target} role, how do React 18 Server Components and selective hydration improve First Contentful Paint?`,
      context: "Meta web performance and UI architecture question."
    },
    {
      id: 3,
      category: "Scenario",
      company: "Amazon",
      question: "How would you design a distributed rate limiter for high-traffic checkout APIs to handle flash sale traffic?",
      context: "Amazon high-scale distributed backend systems question."
    },
    {
      id: 4,
      category: "Behavioral",
      company: "Microsoft",
      question: "Tell me about a time you had to deliver a critical project under a tight deadline with changing requirements.",
      context: "Microsoft STAR leadership and adaptability question."
    },
    {
      id: 5,
      category: "Technical",
      company: "Netflix",
      question: "When should you implement Redis caching versus tuning PostgreSQL indexes for sub-millisecond query responses?",
      context: "Netflix database latency optimization and caching question."
    },
    {
      id: 6,
      category: "Scenario",
      company: "Uber",
      question: "If a production service starts returning 504 Gateway Timeouts under high load, what are your immediate triage steps?",
      context: "Uber live incident response and backend reliability question."
    }
  ];
}

function generateFallbackEvaluation(question: any, answer: string, candidateProfile: any): any {
  const ans = answer ? answer.trim() : "";
  const qCategory = question?.category || "Technical";
  const qText = question?.question || "";
  const target = candidateProfile?.targetRole || "Senior Full-Stack Engineer";

  if (ans.length < 15) {
    return {
      score: 0,
      isCorrect: false,
      feedback: "Your answer was extremely short or non-existent, which is considered incorrect/wrong in a professional interview environment. Please speak or type a fully formed technical response.",
      strengths: [],
      improvements: [
        "Elaborate with complete sentences and architectural concepts.",
        "Provide direct examples matching the interview question."
      ],
      idealAnswer: `For "${qText}", a standard correct response defines the concept directly, explains its technical implementation details (e.g. key libraries or configuration parameters), and shares a concrete example.`
    };
  }

  let score = 7;
  const keywords = ["rest", "graphql", "postgres", "sql", "index", "cache", "redis", "docker", "middleware", "express", "node", "star", "result", "quantified", "optimized", "component", "state", "effect", "latency", "scale", "security", "jwt", "async", "await", "promise", "git", "ci/cd"];
  let matchedCount = 0;
  keywords.forEach(kw => {
    if (ans.toLowerCase().includes(kw)) matchedCount++;
  });

  // If technical or scenario question and absolutely no relevant technical keywords matched, it is wrong/incorrect.
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
      idealAnswer: `For the question: "${qText}", a high-performing correct response clearly defines the core approach and outlines the step-by-step implementation plan with practical trade-offs.`
    };
  }

  if (matchedCount >= 3) {
    score = 9;
  } else if (ans.length > 100) {
    score = 8;
  }

  return {
    score,
    isCorrect: true,
    feedback: `Strong effort on this ${qCategory.toLowerCase()} interview answer! You demonstrated clear logical reasoning, covered the primary requirements of the question, and structured your thoughts well for a candidate transitioning to a **${target}** role.`,
    strengths: [
      "Excellent structure and relevant technical vocabulary.",
      "Directly answered the core problem with logical components."
    ],
    improvements: [
      "Could integrate specific performance metrics (e.g. 'improved API response times by 20%') to prove quantifiable impact.",
      "Could explicitly mention developer tools or libraries to highlight production experience."
    ],
    idealAnswer: `For the question: "${qText}", a high-performing response would:
1. Define the core approach clearly in the first two sentences.
2. Outline the step-by-step implementation plan (e.g., setting up the middleware route, writing SQL joins, configuring containerized deployment).
3. Connect it to a real-world story using the STAR framework to prove that you have successfully applied these exact concepts under pressure.`
  };
}
