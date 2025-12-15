import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

/**
 * AI Interview Router
 * Handles AI-powered interview simulations for candidate screening
 */

// Demo data for AI Interview Templates
const DEMO_TEMPLATES = [
  {
    id: 1,
    name: "Teacher Screening - General",
    description: "Standard screening interview for all teaching positions",
    positionType: "Teacher",
    subjectArea: null,
    duration: 25,
    totalQuestions: 8,
    passingScore: 70,
    competencies: ["Communication", "Classroom Management", "Pedagogy", "Adaptability"],
    status: "active",
    createdBy: 1,
    createdAt: new Date("2024-01-01"),
    questionsCount: 8,
    sessionsCount: 45,
  },
  {
    id: 2,
    name: "Mathematics Teacher - Technical",
    description: "Technical interview focusing on mathematics teaching methodology",
    positionType: "Teacher",
    subjectArea: "Mathematics",
    duration: 30,
    totalQuestions: 10,
    passingScore: 75,
    competencies: ["Subject Mastery", "Problem Solving", "Student Assessment", "Differentiated Instruction"],
    status: "active",
    createdBy: 1,
    createdAt: new Date("2024-01-05"),
    questionsCount: 10,
    sessionsCount: 23,
  },
  {
    id: 3,
    name: "Science Teacher - Lab Skills",
    description: "Interview assessing science teaching and laboratory management",
    positionType: "Teacher",
    subjectArea: "Science",
    duration: 35,
    totalQuestions: 12,
    passingScore: 70,
    competencies: ["Lab Safety", "Experiment Design", "Scientific Inquiry", "Student Engagement"],
    status: "active",
    createdBy: 1,
    createdAt: new Date("2024-01-10"),
    questionsCount: 12,
    sessionsCount: 18,
  },
  {
    id: 4,
    name: "School Principal - Leadership",
    description: "Leadership assessment for principal and vice principal candidates",
    positionType: "Principal",
    subjectArea: null,
    duration: 45,
    totalQuestions: 15,
    passingScore: 80,
    competencies: ["Leadership", "Strategic Planning", "Staff Management", "Community Relations", "Crisis Management"],
    status: "active",
    createdBy: 1,
    createdAt: new Date("2024-01-15"),
    questionsCount: 15,
    sessionsCount: 8,
  },
  {
    id: 5,
    name: "Arabic Language Teacher",
    description: "Interview for Arabic language and literature teaching positions",
    positionType: "Teacher",
    subjectArea: "Arabic",
    duration: 30,
    totalQuestions: 10,
    passingScore: 70,
    competencies: ["Language Proficiency", "Cultural Awareness", "Grammar Instruction", "Literature Analysis"],
    status: "draft",
    createdBy: 1,
    createdAt: new Date("2024-01-20"),
    questionsCount: 10,
    sessionsCount: 0,
  },
];

// Demo questions for templates
const DEMO_QUESTIONS = [
  // Template 1 - General Teacher
  { id: 1, templateId: 1, questionOrder: 1, questionText: "Tell me about yourself and why you chose teaching as a profession.", questionType: "general", competency: "Communication", timeLimit: 120, maxScore: 10 },
  { id: 2, templateId: 1, questionOrder: 2, questionText: "Describe a challenging classroom situation you faced and how you handled it.", questionType: "behavioral", competency: "Classroom Management", timeLimit: 180, maxScore: 10 },
  { id: 3, templateId: 1, questionOrder: 3, questionText: "How do you differentiate instruction to meet diverse student needs?", questionType: "competency", competency: "Pedagogy", timeLimit: 180, maxScore: 10 },
  { id: 4, templateId: 1, questionOrder: 4, questionText: "A student consistently disrupts class. Walk me through your approach.", questionType: "situational", competency: "Classroom Management", timeLimit: 180, maxScore: 10 },
  { id: 5, templateId: 1, questionOrder: 5, questionText: "How do you incorporate technology in your teaching?", questionType: "technical", competency: "Adaptability", timeLimit: 150, maxScore: 10 },
  { id: 6, templateId: 1, questionOrder: 6, questionText: "Describe your approach to parent-teacher communication.", questionType: "behavioral", competency: "Communication", timeLimit: 150, maxScore: 10 },
  { id: 7, templateId: 1, questionOrder: 7, questionText: "How do you assess student learning beyond traditional tests?", questionType: "competency", competency: "Pedagogy", timeLimit: 180, maxScore: 10 },
  { id: 8, templateId: 1, questionOrder: 8, questionText: "Where do you see yourself in 5 years as an educator?", questionType: "general", competency: "Adaptability", timeLimit: 120, maxScore: 10 },
];

// Demo interview sessions
const DEMO_SESSIONS = [
  {
    id: 1,
    templateId: 1,
    templateName: "Teacher Screening - General",
    candidateId: 101,
    candidateName: "Ahmad Al-Rashid",
    candidateEmail: "ahmad.rashid@email.com",
    candidatePosition: "Expert Teacher - Mathematics",
    scheduledAt: new Date("2024-01-25T10:00:00"),
    startedAt: new Date("2024-01-25T10:02:00"),
    completedAt: new Date("2024-01-25T10:28:00"),
    status: "completed",
    interviewMode: "video",
    language: "en",
    totalScore: 82,
    percentageScore: 82.5,
    aiRecommendation: "hire",
    duration: 26, // minutes
    requestedBy: 1,
    requestedByName: "HR Manager",
  },
  {
    id: 2,
    templateId: 2,
    templateName: "Mathematics Teacher - Technical",
    candidateId: 102,
    candidateName: "Sara Abdullah",
    candidateEmail: "sara.abdullah@email.com",
    candidatePosition: "Teacher - Mathematics",
    scheduledAt: new Date("2024-01-25T14:00:00"),
    startedAt: new Date("2024-01-25T14:01:00"),
    completedAt: new Date("2024-01-25T14:35:00"),
    status: "completed",
    interviewMode: "video",
    language: "en",
    totalScore: 91,
    percentageScore: 91.0,
    aiRecommendation: "strong_hire",
    duration: 34,
    requestedBy: 1,
    requestedByName: "HR Manager",
  },
  {
    id: 3,
    templateId: 1,
    templateName: "Teacher Screening - General",
    candidateId: 103,
    candidateName: "Noura Ahmed",
    candidateEmail: "noura.ahmed@email.com",
    candidatePosition: "Teacher - Arabic",
    scheduledAt: new Date("2024-01-26T09:00:00"),
    startedAt: null,
    completedAt: null,
    status: "scheduled",
    interviewMode: "text",
    language: "ar",
    totalScore: null,
    percentageScore: null,
    aiRecommendation: null,
    duration: null,
    requestedBy: 1,
    requestedByName: "HR Manager",
    accessCode: "AI-INT-2024-003",
  },
  {
    id: 4,
    templateId: 3,
    templateName: "Science Teacher - Lab Skills",
    candidateId: 104,
    candidateName: "Hassan Ibrahim",
    candidateEmail: "hassan.ibrahim@email.com",
    candidatePosition: "Teacher - Physics",
    scheduledAt: new Date("2024-01-26T11:00:00"),
    startedAt: new Date("2024-01-26T11:05:00"),
    completedAt: null,
    status: "in_progress",
    interviewMode: "video",
    language: "en",
    totalScore: null,
    percentageScore: null,
    aiRecommendation: null,
    duration: null,
    requestedBy: 1,
    requestedByName: "HR Manager",
  },
  {
    id: 5,
    templateId: 1,
    templateName: "Teacher Screening - General",
    candidateId: 105,
    candidateName: "Mariam Khalil",
    candidateEmail: "mariam.khalil@email.com",
    candidatePosition: "Teacher - English",
    scheduledAt: new Date("2024-01-24T15:00:00"),
    startedAt: new Date("2024-01-24T15:03:00"),
    completedAt: new Date("2024-01-24T15:30:00"),
    status: "completed",
    interviewMode: "text",
    language: "en",
    totalScore: 65,
    percentageScore: 65.0,
    aiRecommendation: "maybe",
    duration: 27,
    requestedBy: 1,
    requestedByName: "HR Manager",
  },
  {
    id: 6,
    templateId: 4,
    templateName: "School Principal - Leadership",
    candidateId: 106,
    candidateName: "Dr. Khalid Omar",
    candidateEmail: "khalid.omar@email.com",
    candidatePosition: "School Principal",
    scheduledAt: new Date("2024-01-27T10:00:00"),
    startedAt: null,
    completedAt: null,
    status: "scheduled",
    interviewMode: "video",
    language: "en",
    totalScore: null,
    percentageScore: null,
    aiRecommendation: null,
    duration: null,
    requestedBy: 1,
    requestedByName: "HR Manager",
    accessCode: "AI-INT-2024-006",
  },
];

// Demo competency scores for completed sessions
const DEMO_COMPETENCY_SCORES = [
  // Session 1 - Ahmad
  { sessionId: 1, competencyName: "Communication", score: 85, maxScore: 100, strengths: ["Clear articulation", "Active listening"], improvements: ["Could be more concise"] },
  { sessionId: 1, competencyName: "Classroom Management", score: 80, maxScore: 100, strengths: ["Strong discipline approach", "Fair treatment"], improvements: ["More proactive strategies"] },
  { sessionId: 1, competencyName: "Pedagogy", score: 82, maxScore: 100, strengths: ["Differentiated instruction", "Student-centered"], improvements: ["Assessment variety"] },
  { sessionId: 1, competencyName: "Adaptability", score: 83, maxScore: 100, strengths: ["Tech-savvy", "Growth mindset"], improvements: ["Curriculum flexibility"] },
  
  // Session 2 - Sara
  { sessionId: 2, competencyName: "Subject Mastery", score: 95, maxScore: 100, strengths: ["Exceptional math knowledge", "Real-world applications"], improvements: [] },
  { sessionId: 2, competencyName: "Problem Solving", score: 92, maxScore: 100, strengths: ["Logical approach", "Multiple solutions"], improvements: ["Time management"] },
  { sessionId: 2, competencyName: "Student Assessment", score: 88, maxScore: 100, strengths: ["Formative assessment", "Data-driven"], improvements: ["Peer assessment"] },
  { sessionId: 2, competencyName: "Differentiated Instruction", score: 89, maxScore: 100, strengths: ["Learning styles awareness", "Scaffolding"], improvements: ["Advanced learners"] },
];

// Demo interview responses
const DEMO_RESPONSES = [
  {
    id: 1,
    sessionId: 1,
    questionId: 1,
    responseOrder: 1,
    candidateResponse: "I've been passionate about mathematics since childhood. Teaching allows me to share this passion and make a difference in students' lives. I believe every student can excel with the right guidance.",
    responseTime: 95,
    aiScore: 8,
    aiRationale: "Clear motivation, shows passion for subject and students. Could elaborate more on teaching philosophy.",
    sentimentScore: 0.85,
    flagged: false,
  },
  {
    id: 2,
    sessionId: 1,
    questionId: 2,
    responseOrder: 2,
    candidateResponse: "I had a student who was constantly disruptive. Instead of punishment, I spoke privately with them, learned about their home situation, and adapted my approach. We created a behavior plan together, and they became one of my most engaged students.",
    responseTime: 145,
    aiScore: 9,
    aiRationale: "Excellent example of empathetic approach, collaborative problem-solving, and positive outcome.",
    sentimentScore: 0.78,
    flagged: false,
  },
];

// Demo reports
const DEMO_REPORTS = [
  {
    id: 1,
    sessionId: 1,
    candidateName: "Ahmad Al-Rashid",
    templateName: "Teacher Screening - General",
    reportType: "detailed",
    executiveSummary: "Ahmad Al-Rashid demonstrates strong potential as an Expert Mathematics Teacher. With an overall score of 82.5%, he shows excellent communication skills and a solid foundation in classroom management. His passion for mathematics and student-centered approach make him a recommended hire.",
    strengthsAnalysis: "• Excellent verbal communication and articulation\n• Strong classroom management philosophy\n• Genuine passion for mathematics education\n• Shows growth mindset and adaptability to new technologies\n• Student-centered teaching approach",
    areasForDevelopment: "• Could improve on being more concise in responses\n• Assessment strategies could be more varied\n• May benefit from additional training in differentiated instruction",
    cultureFitAssessment: "Ahmad shows strong alignment with our school's values of student success and continuous improvement. His collaborative approach to problem-solving indicates he would work well with colleagues.",
    teachingReadiness: "Ready to take on a full teaching load with minimal onboarding. Recommended for mentorship program participation.",
    communicationSkills: "8.5/10 - Clear, articulate, and engaging. Maintains appropriate professional tone.",
    subjectMastery: "Demonstrated strong mathematical knowledge with ability to explain complex concepts simply.",
    recommendedNextSteps: "1. Schedule final panel interview\n2. Conduct demo lesson observation\n3. Complete reference checks",
    redFlags: [],
    highlights: ["Excellent classroom management example", "Strong passion for teaching", "Collaborative approach"],
    generatedAt: new Date("2024-01-25T10:30:00"),
  },
  {
    id: 2,
    sessionId: 2,
    candidateName: "Sara Abdullah",
    templateName: "Mathematics Teacher - Technical",
    reportType: "detailed",
    executiveSummary: "Sara Abdullah is an exceptional candidate for the Mathematics Teacher position. With an outstanding score of 91%, she demonstrates superior subject mastery and innovative teaching methods. Strongly recommended for immediate hire.",
    strengthsAnalysis: "• Exceptional mathematics knowledge and real-world application ability\n• Outstanding problem-solving approach with multiple solution paths\n• Data-driven assessment practices\n• Excellent differentiated instruction strategies\n• Strong technology integration skills",
    areasForDevelopment: "• Could improve time management during complex explanations\n• Peer assessment strategies could be expanded\n• Advanced learner engagement techniques",
    cultureFitAssessment: "Sara exemplifies our core values of excellence and innovation. Her collaborative nature and continuous learning attitude make her an ideal addition to our mathematics department.",
    teachingReadiness: "Fully prepared for classroom responsibilities. Recommended as potential department mentor.",
    communicationSkills: "9/10 - Exceptionally clear and engaging communication style.",
    subjectMastery: "Outstanding - 95% competency score in subject mastery evaluation.",
    recommendedNextSteps: "1. Expedite final interview\n2. Prepare offer letter\n3. Discuss department lead opportunities",
    redFlags: [],
    highlights: ["Top 5% of all mathematics teacher candidates", "Innovative teaching methods", "Strong data analysis skills"],
    generatedAt: new Date("2024-01-25T14:40:00"),
  },
];

// Available candidates for scheduling
const AVAILABLE_CANDIDATES = [
  { id: 107, name: "Fatima Al-Sayed", email: "fatima.alsayed@email.com", position: "Teacher - English" },
  { id: 108, name: "Omar Hassan", email: "omar.hassan@email.com", position: "Expert Teacher - History" },
  { id: 109, name: "Layla Mohammed", email: "layla.m@email.com", position: "Teacher - Art" },
  { id: 110, name: "Youssef Ahmed", email: "youssef.a@email.com", position: "Teacher - Physical Education" },
];

export const aiInterviewRouter = router({
  // Get all templates
  getTemplates: protectedProcedure
    .input(z.object({
      status: z.enum(["all", "draft", "active", "archived"]).optional(),
      positionType: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      let templates = [...DEMO_TEMPLATES];
      
      if (input?.status && input.status !== "all") {
        templates = templates.filter(t => t.status === input.status);
      }
      if (input?.positionType) {
        templates = templates.filter(t => t.positionType === input.positionType);
      }
      
      return templates;
    }),

  // Get single template with questions
  getTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const template = DEMO_TEMPLATES.find(t => t.id === input.id);
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }
      
      const questions = DEMO_QUESTIONS.filter(q => q.templateId === input.id);
      
      return { ...template, questions };
    }),

  // Create new template
  createTemplate: protectedProcedure
    .input(z.object({
      name: z.string().min(3),
      description: z.string().optional(),
      positionType: z.string(),
      subjectArea: z.string().optional(),
      duration: z.number().min(5).max(120),
      totalQuestions: z.number().min(3).max(30),
      passingScore: z.number().min(50).max(100),
      competencies: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const newTemplate = {
        id: DEMO_TEMPLATES.length + 1,
        ...input,
        status: "draft" as const,
        createdBy: 1,
        createdAt: new Date(),
        questionsCount: 0,
        sessionsCount: 0,
      };
      DEMO_TEMPLATES.push(newTemplate);
      return newTemplate;
    }),

  // Get all sessions
  getSessions: protectedProcedure
    .input(z.object({
      status: z.enum(["all", "scheduled", "in_progress", "completed", "expired", "cancelled"]).optional(),
      templateId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      let sessions = [...DEMO_SESSIONS];
      
      if (input?.status && input.status !== "all") {
        sessions = sessions.filter(s => s.status === input.status);
      }
      if (input?.templateId) {
        sessions = sessions.filter(s => s.templateId === input.templateId);
      }
      
      return sessions.sort((a, b) => (b.scheduledAt?.getTime() || 0) - (a.scheduledAt?.getTime() || 0));
    }),

  // Get single session with details
  getSession: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const session = DEMO_SESSIONS.find(s => s.id === input.id);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }
      
      const competencyScores = DEMO_COMPETENCY_SCORES.filter(c => c.sessionId === input.id);
      const responses = DEMO_RESPONSES.filter(r => r.sessionId === input.id);
      const report = DEMO_REPORTS.find(r => r.sessionId === input.id);
      
      return { ...session, competencyScores, responses, report };
    }),

  // Schedule new interview session
  scheduleSession: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      candidateId: z.number(),
      candidateName: z.string(),
      candidateEmail: z.string().email(),
      candidatePosition: z.string(),
      scheduledAt: z.string(),
      interviewMode: z.enum(["text", "voice", "video"]),
      language: z.enum(["en", "ar"]),
    }))
    .mutation(async ({ input }) => {
      const template = DEMO_TEMPLATES.find(t => t.id === input.templateId);
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }
      
      const newSession = {
        id: DEMO_SESSIONS.length + 1,
        templateId: input.templateId,
        templateName: template.name,
        candidateId: input.candidateId,
        candidateName: input.candidateName,
        candidateEmail: input.candidateEmail,
        candidatePosition: input.candidatePosition,
        scheduledAt: new Date(input.scheduledAt),
        startedAt: null,
        completedAt: null,
        status: "scheduled" as const,
        interviewMode: input.interviewMode,
        language: input.language,
        totalScore: null,
        percentageScore: null,
        aiRecommendation: null,
        duration: null,
        requestedBy: 1,
        requestedByName: "HR Manager",
        accessCode: `AI-INT-${new Date().getFullYear()}-${String(DEMO_SESSIONS.length + 1).padStart(3, "0")}`,
      };
      
      DEMO_SESSIONS.push(newSession);
      return newSession;
    }),

  // Get interview report
  getReport: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const report = DEMO_REPORTS.find(r => r.sessionId === input.sessionId);
      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }
      
      const session = DEMO_SESSIONS.find(s => s.id === input.sessionId);
      const competencyScores = DEMO_COMPETENCY_SCORES.filter(c => c.sessionId === input.sessionId);
      
      return { ...report, session, competencyScores };
    }),

  // Get available candidates for scheduling
  getAvailableCandidates: protectedProcedure
    .query(async () => {
      return AVAILABLE_CANDIDATES;
    }),

  // Get dashboard statistics
  getDashboardStats: protectedProcedure
    .query(async () => {
      const completed = DEMO_SESSIONS.filter(s => s.status === "completed");
      const avgScore = completed.length > 0 
        ? completed.reduce((sum, s) => sum + (s.percentageScore || 0), 0) / completed.length 
        : 0;
      
      return {
        totalTemplates: DEMO_TEMPLATES.filter(t => t.status === "active").length,
        totalSessions: DEMO_SESSIONS.length,
        completedSessions: completed.length,
        scheduledSessions: DEMO_SESSIONS.filter(s => s.status === "scheduled").length,
        inProgressSessions: DEMO_SESSIONS.filter(s => s.status === "in_progress").length,
        averageScore: Math.round(avgScore * 10) / 10,
        strongHireCount: DEMO_SESSIONS.filter(s => s.aiRecommendation === "strong_hire").length,
        hireCount: DEMO_SESSIONS.filter(s => s.aiRecommendation === "hire").length,
        maybeCount: DEMO_SESSIONS.filter(s => s.aiRecommendation === "maybe").length,
        noHireCount: DEMO_SESSIONS.filter(s => s.aiRecommendation === "no_hire").length,
      };
    }),

  // Candidate access - start interview session
  startSession: publicProcedure
    .input(z.object({ accessCode: z.string() }))
    .mutation(async ({ input }) => {
      const session = DEMO_SESSIONS.find(s => s.accessCode === input.accessCode);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid access code" });
      }
      if (session.status !== "scheduled") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Interview already started or completed" });
      }
      
      session.status = "in_progress";
      session.startedAt = new Date();
      
      const template = DEMO_TEMPLATES.find(t => t.id === session.templateId);
      const questions = DEMO_QUESTIONS.filter(q => q.templateId === session.templateId);
      
      return { session, template, questions };
    }),

  // Submit interview response (for live interview)
  submitResponse: publicProcedure
    .input(z.object({
      sessionId: z.number(),
      questionId: z.number(),
      response: z.string().min(10),
      responseTime: z.number(),
    }))
    .mutation(async ({ input }) => {
      // In real implementation, this would:
      // 1. Call OpenAI to analyze response
      // 2. Score based on keywords and criteria
      // 3. Generate follow-up question if needed
      // 4. Save to database
      
      const aiScore = Math.floor(Math.random() * 3) + 7; // Simulated 7-10 score
      const sentimentScore = 0.7 + Math.random() * 0.3;
      
      return {
        success: true,
        aiScore,
        sentimentScore,
        followUp: null, // Would contain AI-generated follow-up question
      };
    }),

  // Complete interview session
  completeSession: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const session = DEMO_SESSIONS.find(s => s.id === input.sessionId);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }
      
      session.status = "completed";
      session.completedAt = new Date();
      session.totalScore = Math.floor(Math.random() * 30) + 65; // Simulated 65-95
      session.percentageScore = session.totalScore;
      session.aiRecommendation = session.totalScore >= 85 ? "strong_hire" : 
                                  session.totalScore >= 70 ? "hire" : 
                                  session.totalScore >= 60 ? "maybe" : "no_hire";
      
      return session;
    }),
});
