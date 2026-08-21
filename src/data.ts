import { ResumeAnalysisResult, InterviewQuestion } from "./types";

export const SAMPLE_RESUME_TEXT = `
Likhitha Mullapudi
Hyderabad, Telangana | likithamullapudi@example.com

PROFESSIONAL SUMMARY
Passionate junior software developer with 1+ years of experience building web applications with React, JavaScript, and HTML/CSS. Eager to transition into a Senior Full-Stack Developer role by mastering backend architectures, databases, and advanced cloud systems.

TECHNICAL SKILLS
- Frontend: HTML5, CSS3, Tailwind CSS, JavaScript (ES6+), React.js, Redux
- Tools: Git, GitHub, VS Code, Figma
- Methodologies: Agile, Scrum, Kanban

EXPERIENCE
Associate Frontend Engineer | TechSolutions Inc.
2025 - Present
- Designed and built responsive user interfaces for 5+ high-traffic client websites using React.js and Tailwind CSS.
- Collaborated with UX/UI designers to convert visual mockups into pixel-perfect, accessible React components.
- Integrated RESTful APIs to fetch and render dynamic customer data, reducing load times by 15%.
- Participated in weekly code reviews and sprint planning sessions to deliver secure, high-quality deliverables.

EDUCATION
B.Tech in Computer Science and Engineering
Jawaharlal Nehru Technological University, Hyderabad (JNTUH)
2021 - 2025
`;

export const SAMPLE_ANALYSIS_RESULT: ResumeAnalysisResult = {
  name: "Likhitha Mullapudi",
  currentRole: "Associate Frontend Engineer",
  targetRole: "Senior Full-Stack Engineer",
  targetRoleSpecified: true,
  summary: "A motivated Frontend Engineer with strong foundational skills in React and Tailwind CSS. To transition into a Senior Full-Stack role, she needs to gain experience in backend systems, databases (SQL/NoSQL), and cloud deployment. She possesses a solid track record of collaborative agile development and responsive UI design.",
  resumeScore: 84,
  atsScore: 79,
  skills: [
    "React.js",
    "JavaScript (ES6+)",
    "HTML5 / CSS3",
    "Tailwind CSS",
    "REST APIs",
    "Git / GitHub",
    "Agile / Scrum"
  ],
  strengths: [
    "UI Engineering & Responsive Design",
    "Performance Optimization",
    "Agile Development & Code Review"
  ],
  skillGaps: [
    "Backend Systems (Express.js, Node.js)",
    "Databases (PostgreSQL, MongoDB)",
    "System Design & Architecture",
    "Cloud & DevOps (AWS, Docker)"
  ],
  roadmap: [
    {
      title: "Master Node.js & Express.js Backend Core",
      description: "Week 1: Node.js asynchronous runtime, event loop, and file system modules. Week 2: Building RESTful APIs with Express.js, custom routing, middleware, and error handling.",
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
      description: "Week 3: PostgreSQL relational schema design, complex JOIN queries, and Prisma ORM. Week 4: MongoDB document modeling, Mongoose indexing, and database security.",
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
      description: "Week 5: High-level system architecture, microservices, and load balancing. Week 6: Redis in-memory caching, RabbitMQ/Kafka queues, and API rate limiting.",
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
      description: "Week 7: Docker containerization, multi-stage Dockerfiles, and compose files. Week 8: AWS/GCP cloud hosting, GitHub Actions CI/CD automation, and secrets management.",
      duration: "Week 7 – Week 8",
      status: "upcoming",
      resources: [
        "W3Schools Docker Tutorial",
        "GeeksforGeeks DevOps & CI/CD Guide",
        "YouTube - Docker & GitHub Actions Crash Course",
        "Udemy - Docker & Kubernetes Masterclass"
      ]
    }
  ],
  jobs: [
    {
      title: "Full-Stack Software Engineer",
      company: "Innovate Labs",
      location: "Hyderabad, India (Hybrid)",
      salary: "₹12,00,000 - ₹18,00,000 / year",
      description: "Join our core team building high-performance customer service portals. You'll contribute to React UI features and transition into Node.js backend development under senior guidance.",
      matchPercentage: 82,
      skillsRequired: ["React", "Node.js", "Express", "MongoDB"],
      applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Developer&location=Hyderabad"
    },
    {
      title: "Junior Fullstack Engineer",
      company: "CloudVibe Solutions",
      location: "Bengaluru, India (Remote)",
      salary: "₹10,00,000 - ₹15,00,000 / year",
      description: "Seeking a React developer eager to learn fullstack development. Work alongside our backend team to build APIs in Node.js/PostgreSQL and integrate modern cloud setups.",
      matchPercentage: 78,
      skillsRequired: ["React", "JavaScript", "SQL", "RESTful APIs"],
      applyUrl: "https://www.linkedin.com/jobs/search/?keywords=Junior%20Fullstack%20Engineer"
    },
    {
      title: "Senior UI Developer with Node.js",
      company: "Enterprise Corp",
      location: "Hyderabad, India",
      salary: "₹15,00,000 - ₹22,00,000 / year",
      description: "Leverage your frontend expertise to build large-scale dashboard interfaces. This role bridges frontend visual excellence and middleware Node.js API development.",
      matchPercentage: 75,
      skillsRequired: ["React", "Tailwind CSS", "Node.js", "System Design"],
      applyUrl: "https://www.indeed.com/jobs?q=Frontend+Developer"
    }
  ],
  courses: [
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
  ]
};

export const SAMPLE_QUESTIONS: InterviewQuestion[] = [
  {
    id: 1,
    category: "Technical",
    company: "Google",
    question: "How does the JavaScript event loop handle microtasks versus macrotasks during asynchronous execution?",
    context: "Real-time Google frontend & full-stack core technical interview question."
  },
  {
    id: 2,
    category: "Technical",
    company: "Meta",
    question: "How do React 18 Server Components differ from standard client components, and how does hydration work?",
    context: "Real-time Meta UI systems & architecture question."
  },
  {
    id: 3,
    category: "Scenario",
    company: "Amazon",
    question: "How would you design an API rate limiter to protect checkout services during Prime Day peak traffic?",
    context: "Real-time Amazon backend & high-scale distributed systems question."
  },
  {
    id: 4,
    category: "Behavioral",
    company: "Microsoft",
    question: "Tell me about a time you had to deliver a critical feature under a tight deadline with incomplete requirements.",
    context: "Real-time Microsoft STAR leadership & execution question."
  },
  {
    id: 5,
    category: "Technical",
    company: "Netflix",
    question: "When would you choose database indexing on PostgreSQL versus using an in-memory Redis cache layer?",
    context: "Real-time Netflix latency optimization and caching question."
  },
  {
    id: 6,
    category: "Scenario",
    company: "Uber",
    question: "If an API endpoint suddenly spikes to 504 Gateway Timeout in production, how do you triage and resolve it?",
    context: "Real-time Uber live incident response and production troubleshooting question."
  }
];
