import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * TALENT MANAGEMENT SYSTEM - DATABASE SCHEMA
 * Comprehensive schema for all 7 modules with proper relationships
 */

// ============================================================================
// CORE: USERS & AUTHENTICATION
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["super_admin", "hr_manager", "department_manager", "employee", "licensing_officer", "recruiter"]).default("employee").notNull(),
  emiratesId: varchar("emiratesId", { length: 64 }),
  phone: varchar("phone", { length: 32 }),
  departmentId: int("departmentId"),
  positionId: int("positionId"),
  managerId: int("managerId"),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  parentId: int("parentId"),
  headId: int("headId"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const positions = mysqlTable("positions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  departmentId: int("departmentId"),
  level: int("level"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// MODULE 1: CAREER PROGRESSION AND MOBILITY
// ============================================================================

export const careerPaths = mysqlTable("career_paths", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  departmentId: int("departmentId"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const careerPathSteps = mysqlTable("career_path_steps", {
  id: int("id").autoincrement().primaryKey(),
  careerPathId: int("careerPathId").notNull(),
  position: int("position").notNull(),
  roleName: varchar("roleName", { length: 255 }).notNull(),
  positionId: int("positionId"),
  requiredExperience: int("requiredExperience"),
  salaryRangeMin: int("salaryRangeMin"),
  salaryRangeMax: int("salaryRangeMax"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const roleSkills = mysqlTable("role_skills", {
  id: int("id").autoincrement().primaryKey(),
  positionId: int("positionId").notNull(),
  skillId: int("skillId").notNull(),
  proficiencyLevel: mysqlEnum("proficiencyLevel", ["beginner", "intermediate", "advanced", "expert"]).notNull(),
  isRequired: boolean("isRequired").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const employeeSkills = mysqlTable("employee_skills", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  skillId: int("skillId").notNull(),
  proficiencyLevel: mysqlEnum("proficiencyLevel", ["beginner", "intermediate", "advanced", "expert"]).notNull(),
  verifiedBy: int("verifiedBy"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const skillGaps = mysqlTable("skill_gaps", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  skillId: int("skillId").notNull(),
  currentLevel: mysqlEnum("currentLevel", ["none", "beginner", "intermediate", "advanced", "expert"]).notNull(),
  requiredLevel: mysqlEnum("requiredLevel", ["beginner", "intermediate", "advanced", "expert"]).notNull(),
  gapLevel: int("gapLevel").notNull(),
  recommendedTraining: text("recommendedTraining"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const careerRecommendations = mysqlTable("career_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  recommendedPathId: int("recommendedPathId").notNull(),
  aiScore: int("aiScore"),
  reasons: json("reasons"),
  estimatedTimeMonths: int("estimatedTimeMonths"),
  requiredEffort: text("requiredEffort"),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "completed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 2: SUCCESSION PLANNING
// ============================================================================

export const successionPlans = mysqlTable("succession_plans", {
  id: int("id").autoincrement().primaryKey(),
  criticalPositionId: int("criticalPositionId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "inactive", "completed"]).default("active").notNull(),
  reviewDate: timestamp("reviewDate"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const talentPools = mysqlTable("talent_pools", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  criteria: json("criteria"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const talentPoolMembers = mysqlTable("talent_pool_members", {
  id: int("id").autoincrement().primaryKey(),
  poolId: int("poolId").notNull(),
  employeeId: int("employeeId").notNull(),
  readinessLevel: mysqlEnum("readinessLevel", ["not_ready", "developing", "ready_now", "ready_plus"]).notNull(),
  developmentPlan: text("developmentPlan"),
  addedBy: int("addedBy").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export const successors = mysqlTable("successors", {
  id: int("id").autoincrement().primaryKey(),
  successionPlanId: int("successionPlanId").notNull(),
  employeeId: int("employeeId").notNull(),
  readinessScore: int("readinessScore"),
  developmentProgress: int("developmentProgress"),
  strengths: text("strengths"),
  developmentAreas: text("developmentAreas"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const leadershipAssessments = mysqlTable("leadership_assessments", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  assessmentType: varchar("assessmentType", { length: 100 }).notNull(),
  score: int("score").notNull(),
  maxScore: int("maxScore").notNull(),
  assessedBy: int("assessedBy").notNull(),
  assessedAt: timestamp("assessedAt").defaultNow().notNull(),
  feedback: text("feedback"),
  recommendations: text("recommendations"),
});

// ============================================================================
// MODULE 3: WORKFORCE PLANNING
// ============================================================================

export const workforceScenarios = mysqlTable("workforce_scenarios", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  scenarioType: mysqlEnum("scenarioType", ["expansion", "downsizing", "merger", "restructuring", "custom"]).notNull(),
  parameters: json("parameters"),
  status: mysqlEnum("status", ["draft", "active", "completed", "archived"]).default("draft").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const workforceProjections = mysqlTable("workforce_projections", {
  id: int("id").autoincrement().primaryKey(),
  scenarioId: int("scenarioId").notNull(),
  departmentId: int("departmentId").notNull(),
  currentHeadcount: int("currentHeadcount").notNull(),
  projectedHeadcount: int("projectedHeadcount").notNull(),
  timeframeMonths: int("timeframeMonths").notNull(),
  skillsRequired: json("skillsRequired"),
  gap: int("gap").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const resourceAllocations = mysqlTable("resource_allocations", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  projectName: varchar("projectName", { length: 255 }).notNull(),
  allocationPercentage: int("allocationPercentage").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["planned", "active", "completed", "cancelled"]).default("planned").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const workforceAlerts = mysqlTable("workforce_alerts", {
  id: int("id").autoincrement().primaryKey(),
  alertType: mysqlEnum("alertType", ["skill_shortage", "over_allocation", "resource_conflict", "attrition_risk"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  message: text("message").notNull(),
  affectedDepartmentId: int("affectedDepartmentId"),
  affectedEmployeeId: int("affectedEmployeeId"),
  resolved: boolean("resolved").default(false).notNull(),
  resolvedBy: int("resolvedBy"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 4: EMPLOYEE ENGAGEMENT
// ============================================================================

export const surveys = mysqlTable("surveys", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  surveyType: mysqlEnum("surveyType", ["pulse", "quarterly", "annual", "exit", "custom"]).notNull(),
  targetAudience: json("targetAudience"),
  status: mysqlEnum("status", ["draft", "active", "closed", "archived"]).default("draft").notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const surveyQuestions = mysqlTable("survey_questions", {
  id: int("id").autoincrement().primaryKey(),
  surveyId: int("surveyId").notNull(),
  questionText: text("questionText").notNull(),
  questionType: mysqlEnum("questionType", ["multiple_choice", "likert_scale", "open_ended", "rating", "yes_no"]).notNull(),
  options: json("options"),
  isRequired: boolean("isRequired").default(false).notNull(),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const surveyResponses = mysqlTable("survey_responses", {
  id: int("id").autoincrement().primaryKey(),
  surveyId: int("surveyId").notNull(),
  employeeId: int("employeeId"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export const surveyAnswers = mysqlTable("survey_answers", {
  id: int("id").autoincrement().primaryKey(),
  responseId: int("responseId").notNull(),
  questionId: int("questionId").notNull(),
  answerText: text("answerText"),
  answerValue: int("answerValue"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const engagementActivities = mysqlTable("engagement_activities", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  activityType: mysqlEnum("activityType", ["course_completion", "survey_participation", "workshop", "event", "team_building"]).notNull(),
  activityName: varchar("activityName", { length: 255 }).notNull(),
  points: int("points").default(0).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export const engagementScores = mysqlTable("engagement_scores", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  score: int("score").notNull(),
  factors: json("factors"),
  sentiment: mysqlEnum("sentiment", ["very_negative", "negative", "neutral", "positive", "very_positive"]),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 5: RECRUITMENT AND TALENT ACQUISITION
// ============================================================================

export const jobRequisitions = mysqlTable("job_requisitions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  departmentId: int("departmentId").notNull(),
  positionId: int("positionId"),
  numberOfPositions: int("numberOfPositions").default(1).notNull(),
  salaryRangeMin: int("salaryRangeMin"),
  salaryRangeMax: int("salaryRangeMax"),
  budget: int("budget"),
  requiredSkills: json("requiredSkills"),
  requiredQualifications: text("requiredQualifications"),
  status: mysqlEnum("status", ["draft", "pending_approval", "approved", "posted", "filled", "cancelled"]).default("draft").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdBy: int("createdBy").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const jobPostings = mysqlTable("job_postings", {
  id: int("id").autoincrement().primaryKey(),
  requisitionId: int("requisitionId").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  externalUrl: text("externalUrl"),
  postedAt: timestamp("postedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  status: mysqlEnum("status", ["active", "expired", "removed"]).default("active").notNull(),
});

export const candidates = mysqlTable("candidates", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  resumeUrl: text("resumeUrl"),
  linkedinUrl: text("linkedinUrl"),
  currentCompany: varchar("currentCompany", { length: 255 }),
  currentPosition: varchar("currentPosition", { length: 255 }),
  yearsOfExperience: int("yearsOfExperience"),
  education: json("education"),
  parsedData: json("parsedData"),
  status: mysqlEnum("status", ["new", "screening", "interview", "assessment", "offer", "hired", "rejected", "withdrawn"]).default("new").notNull(),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const candidateApplications = mysqlTable("candidate_applications", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  requisitionId: int("requisitionId").notNull(),
  coverLetter: text("coverLetter"),
  status: mysqlEnum("status", ["applied", "screening", "interview", "assessment", "offer", "hired", "rejected", "withdrawn"]).default("applied").notNull(),
  currentStage: varchar("currentStage", { length: 100 }),
  matchScore: int("matchScore"),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const candidateSkills = mysqlTable("candidate_skills", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  skillId: int("skillId").notNull(),
  proficiencyLevel: mysqlEnum("proficiencyLevel", ["beginner", "intermediate", "advanced", "expert"]).notNull(),
  yearsOfExperience: int("yearsOfExperience"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const interviews = mysqlTable("interviews", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  interviewType: mysqlEnum("interviewType", ["phone_screen", "technical", "behavioral", "panel", "final"]).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  duration: int("duration"),
  location: varchar("location", { length: 255 }),
  meetingLink: text("meetingLink"),
  interviewerId: int("interviewerId").notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "rescheduled"]).default("scheduled").notNull(),
  feedback: text("feedback"),
  rating: int("rating"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  assessmentType: mysqlEnum("assessmentType", ["skill_test", "personality", "culture_fit", "cognitive", "custom"]).notNull(),
  assessmentName: varchar("assessmentName", { length: 255 }).notNull(),
  score: int("score"),
  maxScore: int("maxScore"),
  passed: boolean("passed"),
  completedAt: timestamp("completedAt"),
  results: json("results"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const recruitmentMetrics = mysqlTable("recruitment_metrics", {
  id: int("id").autoincrement().primaryKey(),
  requisitionId: int("requisitionId").notNull(),
  metricType: mysqlEnum("metricType", ["time_to_hire", "cost_per_hire", "source_effectiveness", "diversity", "quality_of_hire"]).notNull(),
  metricValue: int("metricValue"),
  metricData: json("metricData"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 6: PERFORMANCE MANAGEMENT
// ============================================================================

export const performanceCycles = mysqlTable("performance_cycles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  cycleType: mysqlEnum("cycleType", ["annual", "semi_annual", "quarterly", "continuous"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  status: mysqlEnum("status", ["planning", "active", "review", "completed", "archived"]).default("planning").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  cycleId: int("cycleId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  goalType: mysqlEnum("goalType", ["individual", "team", "departmental", "organizational"]).notNull(),
  kpi: varchar("kpi", { length: 255 }),
  targetValue: int("targetValue"),
  currentValue: int("currentValue"),
  unit: varchar("unit", { length: 50 }),
  deadline: timestamp("deadline"),
  status: mysqlEnum("status", ["draft", "active", "completed", "cancelled", "overdue"]).default("draft").notNull(),
  alignedWithGoalId: int("alignedWithGoalId"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const goalProgress = mysqlTable("goal_progress", {
  id: int("id").autoincrement().primaryKey(),
  goalId: int("goalId").notNull(),
  progressPercentage: int("progressPercentage").notNull(),
  notes: text("notes"),
  updatedBy: int("updatedBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const selfAppraisals = mysqlTable("self_appraisals", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  cycleId: int("cycleId").notNull(),
  content: json("content").notNull(),
  achievements: text("achievements"),
  challenges: text("challenges"),
  developmentNeeds: text("developmentNeeds"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export const managerReviews = mysqlTable("manager_reviews", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  cycleId: int("cycleId").notNull(),
  managerId: int("managerId").notNull(),
  overallRating: int("overallRating").notNull(),
  strengths: text("strengths"),
  areasForImprovement: text("areasForImprovement"),
  feedback: text("feedback"),
  recommendations: text("recommendations"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export const feedback360 = mysqlTable("feedback_360", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  cycleId: int("cycleId").notNull(),
  feedbackFrom: int("feedbackFrom"),
  relationship: mysqlEnum("relationship", ["peer", "subordinate", "manager", "self", "other"]).notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  rating: int("rating"),
  comments: text("comments"),
  strengths: text("strengths"),
  developmentAreas: text("developmentAreas"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export const performanceRatings = mysqlTable("performance_ratings", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  cycleId: int("cycleId").notNull(),
  dimension: varchar("dimension", { length: 100 }).notNull(),
  rating: int("rating").notNull(),
  maxRating: int("maxRating").default(5).notNull(),
  ratedBy: int("ratedBy").notNull(),
  ratedAt: timestamp("ratedAt").defaultNow().notNull(),
  comments: text("comments"),
});

// ============================================================================
// MODULE 7: TEACHERS LICENSING
// ============================================================================

export const licenseTypes = mysqlTable("license_types", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  requirements: json("requirements"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const licenseTiers = mysqlTable("license_tiers", {
  id: int("id").autoincrement().primaryKey(),
  licenseTypeId: int("licenseTypeId").notNull(),
  tierName: varchar("tierName", { length: 100 }).notNull(),
  tierLevel: int("tierLevel").notNull(),
  experienceRequired: int("experienceRequired"),
  cpdRequired: int("cpdRequired"),
  requirements: json("requirements"),
  validityYears: int("validityYears").default(3).notNull(),
  fee: int("fee").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const licenseApplications = mysqlTable("license_applications", {
  id: int("id").autoincrement().primaryKey(),
  applicantId: int("applicantId").notNull(),
  licenseTypeId: int("licenseTypeId").notNull(),
  tierId: int("tierId").notNull(),
  applicationNumber: varchar("applicationNumber", { length: 100 }).notNull().unique(),
  personalInfo: json("personalInfo"),
  educationInfo: json("educationInfo"),
  experienceInfo: json("experienceInfo"),
  status: mysqlEnum("status", ["draft", "submitted", "under_review", "documents_pending", "approved", "rejected", "withdrawn"]).default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const applicationDocuments = mysqlTable("application_documents", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  documentType: varchar("documentType", { length: 100 }).notNull(),
  documentName: varchar("documentName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  verified: boolean("verified").default(false).notNull(),
  verifiedBy: int("verifiedBy"),
  verifiedAt: timestamp("verifiedAt"),
  verificationNotes: text("verificationNotes"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export const licenses = mysqlTable("licenses", {
  id: int("id").autoincrement().primaryKey(),
  applicantId: int("applicantId").notNull(),
  applicationId: int("applicationId"),
  licenseNumber: varchar("licenseNumber", { length: 100 }).notNull().unique(),
  licenseTypeId: int("licenseTypeId").notNull(),
  tierId: int("tierId").notNull(),
  issueDate: timestamp("issueDate").notNull(),
  expiryDate: timestamp("expiryDate").notNull(),
  status: mysqlEnum("status", ["active", "expired", "suspended", "revoked", "renewed"]).default("active").notNull(),
  qrCode: text("qrCode"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  issuedBy: int("issuedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const licenseHistory = mysqlTable("license_history", {
  id: int("id").autoincrement().primaryKey(),
  licenseId: int("licenseId").notNull(),
  eventType: mysqlEnum("eventType", ["issued", "renewed", "suspended", "reinstated", "revoked", "expired"]).notNull(),
  eventDate: timestamp("eventDate").defaultNow().notNull(),
  performedBy: int("performedBy"),
  notes: text("notes"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  previousStatus: varchar("previousStatus", { length: 50 }),
  newStatus: varchar("newStatus", { length: 50 }),
});

export const cpdRecords = mysqlTable("cpd_records", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId").notNull(),
  activityName: varchar("activityName", { length: 255 }).notNull(),
  activityType: varchar("activityType", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 255 }),
  hours: int("hours").notNull(),
  completedAt: timestamp("completedAt").notNull(),
  certificateUrl: text("certificateUrl"),
  verified: boolean("verified").default(false).notNull(),
  verifiedBy: int("verifiedBy"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const assessmentResults = mysqlTable("assessment_results", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  assessmentType: mysqlEnum("assessmentType", ["subject_specialization", "professional_pedagogical", "combined"]).notNull(),
  assessmentName: varchar("assessmentName", { length: 255 }).notNull(),
  score: int("score").notNull(),
  maxScore: int("maxScore").notNull(),
  passingScore: int("passingScore").notNull(),
  passed: boolean("passed").notNull(),
  takenAt: timestamp("takenAt").defaultNow().notNull(),
  results: json("results"),
});

// ============================================================================
// CROSS-CUTTING: NOTIFICATIONS, RATINGS, AUDIT LOGS
// ============================================================================

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  actionUrl: text("actionUrl"),
  isRead: boolean("isRead").default(false).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  ratableType: varchar("ratableType", { length: 100 }).notNull(),
  ratableId: int("ratableId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId"),
  changes: json("changes"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  reportType: varchar("reportType", { length: 100 }).notNull(),
  reportName: varchar("reportName", { length: 255 }).notNull(),
  module: varchar("module", { length: 100 }).notNull(),
  parameters: json("parameters"),
  fileUrl: text("fileUrl"),
  fileKey: varchar("fileKey", { length: 255 }),
  status: mysqlEnum("status", ["generating", "completed", "failed"]).default("generating").notNull(),
  generatedBy: int("generatedBy").notNull(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 8: EDUCATOR'S COMPETENCY ASSESSMENTS
// ============================================================================

export const competencyFrameworks = mysqlTable("competency_frameworks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  version: varchar("version", { length: 50 }),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  effectiveDate: timestamp("effective_date"),
  expiryDate: timestamp("expiry_date"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const competencyStandards = mysqlTable("competency_standards", {
  id: int("id").autoincrement().primaryKey(),
  frameworkId: int("framework_id").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  level: mysqlEnum("level", ["foundation", "intermediate", "advanced", "expert"]).notNull(),
  weight: int("weight").default(1),
  criteria: text("criteria"), // JSON array of assessment criteria
  evidenceRequirements: text("evidence_requirements"), // JSON array of evidence types
  parentId: int("parent_id"),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const educatorCompetencies = mysqlTable("educator_competencies", {
  id: int("id").autoincrement().primaryKey(),
  educatorId: int("educator_id").notNull(),
  standardId: int("standard_id").notNull(),
  currentLevel: mysqlEnum("current_level", ["not_started", "developing", "proficient", "advanced", "expert"]).default("not_started").notNull(),
  targetLevel: mysqlEnum("target_level", ["developing", "proficient", "advanced", "expert"]),
  status: mysqlEnum("status", ["in_progress", "achieved", "expired", "under_review"]).default("in_progress").notNull(),
  achievedDate: timestamp("achieved_date"),
  expiryDate: timestamp("expiry_date"),
  lastAssessedDate: timestamp("last_assessed_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const competencyAssessments = mysqlTable("competency_assessments", {
  id: int("id").autoincrement().primaryKey(),
  educatorId: int("educator_id").notNull(),
  standardId: int("standard_id").notNull(),
  assessmentType: mysqlEnum("assessment_type", ["self_assessment", "peer_review", "supervisor_review", "external_assessment", "portfolio_review"]).notNull(),
  assessorId: int("assessor_id"),
  assessmentDate: timestamp("assessment_date").notNull(),
  score: int("score"), // 0-100
  level: mysqlEnum("level", ["not_demonstrated", "developing", "proficient", "advanced", "expert"]),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "verified", "rejected"]).default("scheduled").notNull(),
  strengths: text("strengths"),
  areasForImprovement: text("areas_for_improvement"),
  recommendations: text("recommendations"),
  verifiedBy: int("verified_by"),
  verifiedDate: timestamp("verified_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const assessmentRubrics = mysqlTable("assessment_rubrics", {
  id: int("id").autoincrement().primaryKey(),
  standardId: int("standard_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  criteria: text("criteria"), // JSON array of rubric criteria with scoring levels
  maxScore: int("max_score").default(100),
  passingScore: int("passing_score").default(70),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const assessmentEvidence = mysqlTable("assessment_evidence", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessment_id").notNull(),
  evidenceType: mysqlEnum("evidence_type", ["document", "video", "observation", "artifact", "testimony", "certificate"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: varchar("file_url", { length: 500 }),
  fileType: varchar("file_type", { length: 50 }),
  fileSize: int("file_size"),
  uploadedBy: int("uploaded_by").notNull(),
  verificationStatus: mysqlEnum("verification_status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  verifiedBy: int("verified_by"),
  verifiedDate: timestamp("verified_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const competencyDevelopmentPlans = mysqlTable("competency_development_plans", {
  id: int("id").autoincrement().primaryKey(),
  educatorId: int("educator_id").notNull(),
  standardId: int("standard_id").notNull(),
  currentLevel: mysqlEnum("current_level", ["not_started", "developing", "proficient", "advanced", "expert"]).notNull(),
  targetLevel: mysqlEnum("target_level", ["developing", "proficient", "advanced", "expert"]).notNull(),
  targetDate: timestamp("target_date"),
  activities: text("activities"), // JSON array of development activities
  resources: text("resources"), // JSON array of learning resources
  milestones: text("milestones"), // JSON array of milestones
  status: mysqlEnum("status", ["draft", "active", "completed", "cancelled"]).default("draft").notNull(),
  progress: int("progress").default(0), // 0-100
  supervisorId: int("supervisor_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Department = typeof departments.$inferSelect;
export type Position = typeof positions.$inferSelect;
export type CareerPath = typeof careerPaths.$inferSelect;
export type CareerPathStep = typeof careerPathSteps.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type EmployeeSkill = typeof employeeSkills.$inferSelect;
export type SkillGap = typeof skillGaps.$inferSelect;
export type CareerRecommendation = typeof careerRecommendations.$inferSelect;
export type SuccessionPlan = typeof successionPlans.$inferSelect;
export type TalentPool = typeof talentPools.$inferSelect;
export type TalentPoolMember = typeof talentPoolMembers.$inferSelect;
export type Successor = typeof successors.$inferSelect;
export type LeadershipAssessment = typeof leadershipAssessments.$inferSelect;
export type WorkforceScenario = typeof workforceScenarios.$inferSelect;
export type WorkforceProjection = typeof workforceProjections.$inferSelect;
export type ResourceAllocation = typeof resourceAllocations.$inferSelect;
export type WorkforceAlert = typeof workforceAlerts.$inferSelect;
export type Survey = typeof surveys.$inferSelect;
export type SurveyQuestion = typeof surveyQuestions.$inferSelect;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type SurveyAnswer = typeof surveyAnswers.$inferSelect;
export type EngagementActivity = typeof engagementActivities.$inferSelect;
export type EngagementScore = typeof engagementScores.$inferSelect;
export type JobRequisition = typeof jobRequisitions.$inferSelect;
export type JobPosting = typeof jobPostings.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type CandidateApplication = typeof candidateApplications.$inferSelect;
export type CandidateSkill = typeof candidateSkills.$inferSelect;
export type Interview = typeof interviews.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type RecruitmentMetric = typeof recruitmentMetrics.$inferSelect;
export type PerformanceCycle = typeof performanceCycles.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type GoalProgress = typeof goalProgress.$inferSelect;
export type SelfAppraisal = typeof selfAppraisals.$inferSelect;
export type ManagerReview = typeof managerReviews.$inferSelect;
export type Feedback360 = typeof feedback360.$inferSelect;
export type PerformanceRating = typeof performanceRatings.$inferSelect;
export type LicenseType = typeof licenseTypes.$inferSelect;
export type LicenseTier = typeof licenseTiers.$inferSelect;
export type LicenseApplication = typeof licenseApplications.$inferSelect;
export type ApplicationDocument = typeof applicationDocuments.$inferSelect;
export type License = typeof licenses.$inferSelect;
export type LicenseHistory = typeof licenseHistory.$inferSelect;
export type CpdRecord = typeof cpdRecords.$inferSelect;
export type AssessmentResult = typeof assessmentResults.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Report = typeof reports.$inferSelect;

// ==================== QUESTION BANK TABLES ====================

export const questionBanks = mysqlTable("question_banks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  licenseTypeId: int("license_type_id"),
  licenseTierId: int("license_tier_id"),
  jobRole: varchar("job_role", { length: 100 }),
  subjectArea: varchar("subject_area", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  questionBankId: int("question_bank_id"),
  questionText: text("question_text").notNull(),
  questionContext: text("question_context"),
  questionType: mysqlEnum("question_type", ["multiple_choice", "true_false", "short_answer", "essay", "scenario"]).notNull(),
  difficultyLevel: mysqlEnum("difficulty_level", ["basic", "intermediate", "advanced", "expert"]).notNull(),
  points: int("points").default(1).notNull(),
  explanation: text("explanation"),
  tags: text("tags"), // JSON array
  isAIGenerated: boolean("is_ai_generated").default(false).notNull(),
  aiGenerationPrompt: text("ai_generation_prompt"),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const questionOptions = mysqlTable("question_options", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("question_id").notNull(),
  optionText: text("option_text").notNull(),
  isCorrect: boolean("is_correct").default(false).notNull(),
  optionOrder: int("option_order").notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exams = mysqlTable("exams", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  licenseApplicationId: int("license_application_id"),
  questionBankId: int("question_bank_id"),
  examType: mysqlEnum("exam_type", ["initial", "renewal", "upgrade", "remedial"]).notNull(),
  totalQuestions: int("total_questions").notNull(),
  totalPoints: int("total_points").notNull(),
  passingScore: int("passing_score").notNull(), // percentage
  duration: int("duration").notNull(), // minutes
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  isAdaptive: boolean("is_adaptive").default(false).notNull(),
  shuffleQuestions: boolean("shuffle_questions").default(true).notNull(),
  shuffleOptions: boolean("shuffle_options").default(true).notNull(),
  maxAttempts: int("max_attempts").default(3).notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const examQuestions = mysqlTable("exam_questions", {
  id: int("id").autoincrement().primaryKey(),
  examId: int("exam_id").notNull(),
  questionId: int("question_id").notNull(),
  questionOrder: int("question_order").notNull(),
  points: int("points").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examAttempts = mysqlTable("exam_attempts", {
  id: int("id").autoincrement().primaryKey(),
  examId: int("exam_id").notNull(),
  candidateId: int("candidate_id").notNull(),
  attemptNumber: int("attempt_number").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at"),
  status: mysqlEnum("status", ["in_progress", "submitted", "graded", "expired"]).default("in_progress").notNull(),
  score: int("score"),
  percentage: int("percentage"),
  passed: boolean("passed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examAnswers = mysqlTable("exam_answers", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attempt_id").notNull(),
  questionId: int("question_id").notNull(),
  selectedOptionId: int("selected_option_id"),
  answerText: text("answer_text"),
  isCorrect: boolean("is_correct"),
  pointsEarned: int("points_earned"),
  timeSpent: int("time_spent"), // seconds
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

export const examResults = mysqlTable("exam_results", {
  id: int("id").autoincrement().primaryKey(),
  attemptId: int("attempt_id").notNull(),
  candidateId: int("candidate_id").notNull(),
  examId: int("exam_id").notNull(),
  totalQuestions: int("total_questions").notNull(),
  questionsAnswered: int("questions_answered").notNull(),
  correctAnswers: int("correct_answers").notNull(),
  incorrectAnswers: int("incorrect_answers").notNull(),
  skippedQuestions: int("skipped_questions").notNull(),
  totalPoints: int("total_points").notNull(),
  pointsEarned: int("points_earned").notNull(),
  percentage: int("percentage").notNull(),
  passed: boolean("passed").notNull(),
  grade: varchar("grade", { length: 10 }),
  timeSpent: int("time_spent"), // seconds
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// MODULE 9: STAFF PLACEMENT & MOBILITY
// ============================================================================

export const schools = mysqlTable("schools", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  arabicName: varchar("arabic_name", { length: 255 }),
  schoolCode: varchar("school_code", { length: 50 }).notNull().unique(),
  schoolType: mysqlEnum("school_type", ["public", "private", "charter"]).notNull(),
  educationLevel: mysqlEnum("education_level", ["kindergarten", "primary", "middle", "secondary", "all_levels"]).notNull(),
  emirate: varchar("emirate", { length: 50 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  address: text("address"),
  capacity: int("capacity"),
  currentStaffCount: int("current_staff_count").default(0),
  principalId: int("principal_id"),
  contactEmail: varchar("contact_email", { length: 320 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  status: mysqlEnum("status", ["active", "inactive", "under_construction"]).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Note: Using existing 'positions' table from organization module

export const staffPlacements = mysqlTable("staff_placements", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull(),
  schoolId: int("school_id").notNull(),
  positionId: int("position_id").notNull(),
  placementType: mysqlEnum("placement_type", ["new_hire", "transfer", "promotion", "lateral_move", "temporary", "redeployment"]).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isTemporary: boolean("is_temporary").default(false).notNull(),
  isPrimary: boolean("is_primary").default(true).notNull(),
  workloadPercentage: int("workload_percentage").default(100).notNull(),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  notes: text("notes"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const placementRequests = mysqlTable("placement_requests", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull(),
  requestType: mysqlEnum("request_type", ["transfer", "promotion", "position_change", "school_change"]).notNull(),
  currentSchoolId: int("current_school_id"),
  currentPositionId: int("current_position_id"),
  requestedSchoolId: int("requested_school_id"),
  requestedPositionId: int("requested_position_id"),
  reason: text("reason").notNull(),
  preferredStartDate: timestamp("preferred_start_date"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "under_review", "approved", "rejected", "cancelled"]).default("draft").notNull(),
  submittedAt: timestamp("submitted_at"),
  reviewedBy: int("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const transferHistory = mysqlTable("transfer_history", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull(),
  fromSchoolId: int("from_school_id"),
  toSchoolId: int("to_school_id").notNull(),
  fromPositionId: int("from_position_id"),
  toPositionId: int("to_position_id").notNull(),
  transferType: mysqlEnum("transfer_type", ["voluntary", "administrative", "promotional", "disciplinary"]).notNull(),
  transferDate: timestamp("transfer_date").notNull(),
  reason: text("reason"),
  approvedBy: int("approved_by").notNull(),
  approvalDate: timestamp("approval_date").notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const placementApprovals = mysqlTable("placement_approvals", {
  id: int("id").autoincrement().primaryKey(),
  placementRequestId: int("placement_request_id").notNull(),
  approverId: int("approver_id").notNull(),
  approverRole: varchar("approver_role", { length: 100 }).notNull(),
  approvalLevel: int("approval_level").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "deferred"]).default("pending").notNull(),
  comments: text("comments"),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports for Question Bank
export type QuestionBank = typeof questionBanks.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type QuestionOption = typeof questionOptions.$inferSelect;
export type Exam = typeof exams.$inferSelect;
export type ExamQuestion = typeof examQuestions.$inferSelect;
export type ExamAttempt = typeof examAttempts.$inferSelect;
export type ExamAnswer = typeof examAnswers.$inferSelect;
export type ExamResult = typeof examResults.$inferSelect;

// Competency Assessments Module
export type CompetencyFramework = typeof competencyFrameworks.$inferSelect;
export type CompetencyStandard = typeof competencyStandards.$inferSelect;
export type EducatorCompetency = typeof educatorCompetencies.$inferSelect;
export type CompetencyAssessment = typeof competencyAssessments.$inferSelect;
export type AssessmentRubric = typeof assessmentRubrics.$inferSelect;
export type AssessmentEvidence = typeof assessmentEvidence.$inferSelect;
export type CompetencyDevelopmentPlan = typeof competencyDevelopmentPlans.$inferSelect;

// ============================================================================
// MODULE 10: EDUCATOR PSYCHOMETRIC ASSESSMENTS
// ============================================================================

export const psychometricTestTypes = mysqlTable("psychometric_test_types", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["personality", "cognitive", "emotional_intelligence", "behavioral", "teaching_style"]).notNull(),
  description: text("description"),
  purpose: text("purpose"),
  duration: int("duration"), // minutes
  questionCount: int("question_count"),
  scoringMethod: mysqlEnum("scoring_method", ["likert_scale", "multiple_choice", "true_false", "rating_scale"]).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "draft"]).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const psychometricQuestions = mysqlTable("psychometric_questions", {
  id: int("id").autoincrement().primaryKey(),
  testTypeId: int("test_type_id").notNull(),
  questionText: text("question_text").notNull(),
  questionType: mysqlEnum("question_type", ["likert", "multiple_choice", "true_false", "rating"]).notNull(),
  traitMeasured: varchar("trait_measured", { length: 100 }),
  dimension: varchar("dimension", { length: 100 }),
  isReverseCoded: boolean("is_reverse_coded").default(false),
  orderIndex: int("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const psychometricOptions = mysqlTable("psychometric_options", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("question_id").notNull(),
  optionText: varchar("option_text", { length: 500 }).notNull(),
  scoreValue: int("score_value").notNull(),
  orderIndex: int("order_index").notNull(),
});

export const psychometricAssessments = mysqlTable("psychometric_assessments", {
  id: int("id").autoincrement().primaryKey(),
  educatorId: int("educator_id").notNull(),
  testTypeId: int("test_type_id").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  status: mysqlEnum("status", ["in_progress", "completed", "abandoned"]).default("in_progress").notNull(),
  timeSpent: int("time_spent"), // seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const psychometricResponses = mysqlTable("psychometric_responses", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessment_id").notNull(),
  questionId: int("question_id").notNull(),
  selectedOptionId: int("selected_option_id"),
  responseValue: int("response_value"),
  responseTime: int("response_time"), // seconds
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

export const psychometricResults = mysqlTable("psychometric_results", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessment_id").notNull(),
  educatorId: int("educator_id").notNull(),
  testTypeId: int("test_type_id").notNull(),
  overallScore: int("overall_score"),
  percentileRank: int("percentile_rank"),
  interpretation: text("interpretation"),
  strengths: text("strengths"),
  developmentAreas: text("development_areas"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const personalityProfiles = mysqlTable("personality_profiles", {
  id: int("id").autoincrement().primaryKey(),
  resultId: int("result_id").notNull(),
  educatorId: int("educator_id").notNull(),
  // Big Five traits
  openness: int("openness"),
  conscientiousness: int("conscientiousness"),
  extraversion: int("extraversion"),
  agreeableness: int("agreeableness"),
  neuroticism: int("neuroticism"),
  // Additional traits
  emotionalStability: int("emotional_stability"),
  socialSkills: int("social_skills"),
  adaptability: int("adaptability"),
  leadershipPotential: int("leadership_potential"),
  profileSummary: text("profile_summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cognitiveAbilityScores = mysqlTable("cognitive_ability_scores", {
  id: int("id").autoincrement().primaryKey(),
  resultId: int("result_id").notNull(),
  educatorId: int("educator_id").notNull(),
  verbalReasoning: int("verbal_reasoning"),
  numericalReasoning: int("numerical_reasoning"),
  abstractReasoning: int("abstract_reasoning"),
  spatialReasoning: int("spatial_reasoning"),
  logicalReasoning: int("logical_reasoning"),
  memoryCapacity: int("memory_capacity"),
  processingSpeed: int("processing_speed"),
  problemSolving: int("problem_solving"),
  overallIQ: int("overall_iq"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Staff Placement & Mobility Module
export type School = typeof schools.$inferSelect;
export type StaffPlacement = typeof staffPlacements.$inferSelect;
export type PlacementRequest = typeof placementRequests.$inferSelect;
export type TransferHistory = typeof transferHistory.$inferSelect;
export type PlacementApproval = typeof placementApprovals.$inferSelect;

// Psychometric Assessment Module
export type PsychometricTestType = typeof psychometricTestTypes.$inferSelect;
export type PsychometricQuestion = typeof psychometricQuestions.$inferSelect;
export type PsychometricOption = typeof psychometricOptions.$inferSelect;
export type PsychometricAssessment = typeof psychometricAssessments.$inferSelect;
export type PsychometricResponse = typeof psychometricResponses.$inferSelect;
export type PsychometricResult = typeof psychometricResults.$inferSelect;
export type PersonalityProfile = typeof personalityProfiles.$inferSelect;
export type CognitiveAbilityScore = typeof cognitiveAbilityScores.$inferSelect;

// ============================================================================
// GAMIFICATION & ENGAGEMENT SYSTEM
// ============================================================================

export const gamificationPoints = mysqlTable("gamification_points", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  points: int("points").notNull(),
  description: text("description"),
  metadata: json("metadata"),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const gamificationBadges = mysqlTable("gamification_badges", {
  id: int("id").autoincrement().primaryKey(),
  badgeId: varchar("badge_id", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
  category: varchar("category", { length: 100 }),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
  pointsRequired: int("points_required"),
  criteria: json("criteria"), // Requirements to earn the badge
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  badgeId: varchar("badge_id", { length: 100 }).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  notified: boolean("notified").default(false).notNull(),
});

export const gamificationLeaderboard = mysqlTable("gamification_leaderboard", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  period: varchar("period", { length: 50 }).notNull(), // weekly, monthly, quarterly, allTime
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  totalPoints: int("total_points").default(0).notNull(),
  rank: int("rank"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

export const gamificationStreaks = mysqlTable("gamification_streaks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  streakType: varchar("streak_type", { length: 100 }).notNull(), // daily_login, training, etc.
  currentStreak: int("current_streak").default(0).notNull(),
  longestStreak: int("longest_streak").default(0).notNull(),
  lastActivityDate: timestamp("last_activity_date"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// Gamification Types
export type GamificationPoints = typeof gamificationPoints.$inferSelect;
export type GamificationBadge = typeof gamificationBadges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type GamificationLeaderboard = typeof gamificationLeaderboard.$inferSelect;
export type GamificationStreak = typeof gamificationStreaks.$inferSelect;

// ============================================================================
// INTEGRATION & VERIFICATION LOGS
// ============================================================================

export const verificationLogs = mysqlTable("verification_logs", {
  id: int("id").autoincrement().primaryKey(),
  verificationCode: varchar("verification_code", { length: 100 }).notNull(),
  licenseId: varchar("license_id", { length: 100 }),
  verificationType: varchar("verification_type", { length: 50 }).notNull(), // qr_scan, url, api
  verifierInfo: json("verifier_info"), // IP, user agent, location if available
  status: mysqlEnum("status", ["valid", "invalid", "expired", "revoked"]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const integrationLogs = mysqlTable("integration_logs", {
  id: int("id").autoincrement().primaryKey(),
  integrationId: varchar("integration_id", { length: 100 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  requestData: json("request_data"),
  responseData: json("response_data"),
  status: mysqlEnum("status", ["success", "failed", "pending"]).notNull(),
  errorMessage: text("error_message"),
  durationMs: int("duration_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const proctoringLogs = mysqlTable("proctoring_logs", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  assessmentId: int("assessment_id"),
  candidateId: int("candidate_id").notNull(),
  violationType: varchar("violation_type", { length: 100 }),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]),
  screenshot: text("screenshot"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  reviewed: boolean("reviewed").default(false).notNull(),
  reviewedBy: int("reviewed_by"),
  reviewNotes: text("review_notes"),
});

// Integration Types
export type VerificationLog = typeof verificationLogs.$inferSelect;
export type IntegrationLog = typeof integrationLogs.$inferSelect;
export type ProctoringLog = typeof proctoringLogs.$inferSelect;

// ============================================================================
// AI INTERVIEW MODULE
// ============================================================================

export const aiInterviewTemplates = mysqlTable("ai_interview_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  positionType: varchar("position_type", { length: 100 }), // e.g., "Teacher", "Principal", "Admin"
  subjectArea: varchar("subject_area", { length: 100 }), // e.g., "Mathematics", "Science", "English"
  duration: int("duration").default(30).notNull(), // Duration in minutes
  totalQuestions: int("total_questions").default(10).notNull(),
  passingScore: int("passing_score").default(70).notNull(), // Percentage
  competencies: json("competencies"), // Array of competencies to evaluate
  scoringCriteria: json("scoring_criteria"), // Detailed scoring rubric
  systemPrompt: text("system_prompt"), // AI persona and instructions
  introMessage: text("intro_message"), // Welcome message for candidate
  outroMessage: text("outro_message"), // Closing message
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const aiInterviewQuestions = mysqlTable("ai_interview_questions", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("template_id").notNull(),
  questionOrder: int("question_order").notNull(),
  questionText: text("question_text").notNull(),
  questionType: mysqlEnum("question_type", ["behavioral", "technical", "situational", "competency", "general"]).notNull(),
  competencyId: int("competency_id"), // Links to competency being evaluated
  expectedKeywords: json("expected_keywords"), // Keywords to look for in response
  followUpQuestions: json("follow_up_questions"), // Array of potential follow-ups
  timeLimit: int("time_limit").default(180), // Seconds allowed for answer
  maxScore: int("max_score").default(10).notNull(),
  scoringGuidelines: text("scoring_guidelines"), // How AI should score this question
  isRequired: boolean("is_required").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiInterviewSessions = mysqlTable("ai_interview_sessions", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("template_id").notNull(),
  candidateId: int("candidate_id").notNull(),
  jobRequisitionId: int("job_requisition_id"),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"), // Session link expiry
  accessCode: varchar("access_code", { length: 32 }), // Unique code for candidate access
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "expired", "cancelled"]).default("scheduled").notNull(),
  interviewMode: mysqlEnum("interview_mode", ["text", "voice", "video"]).default("text").notNull(),
  language: varchar("language", { length: 10 }).default("en").notNull(), // en, ar
  totalScore: int("total_score"),
  percentageScore: decimal("percentage_score", { precision: 5, scale: 2 }),
  aiRecommendation: mysqlEnum("ai_recommendation", ["strong_hire", "hire", "maybe", "no_hire"]),
  overallFeedback: text("overall_feedback"),
  recordingUrl: text("recording_url"), // Video/audio recording if applicable
  transcriptUrl: text("transcript_url"), // Full transcript
  requestedBy: int("requested_by").notNull(), // HR/Recruiter who scheduled
  reviewedBy: int("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const aiInterviewResponses = mysqlTable("ai_interview_responses", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("session_id").notNull(),
  questionId: int("question_id").notNull(),
  responseOrder: int("response_order").notNull(),
  candidateResponse: text("candidate_response").notNull(),
  responseTime: int("response_time"), // Seconds taken to respond
  aiFollowUp: text("ai_follow_up"), // Follow-up question asked
  followUpResponse: text("follow_up_response"), // Candidate's follow-up answer
  aiScore: int("ai_score"), // 0-10 score from AI
  aiRationale: text("ai_rationale"), // Why AI gave this score
  keywordsMatched: json("keywords_matched"), // Keywords found in response
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }), // -1 to 1
  confidenceLevel: decimal("confidence_level", { precision: 3, scale: 2 }), // AI confidence in scoring
  flagged: boolean("flagged").default(false).notNull(), // Flag for human review
  flagReason: text("flag_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiInterviewCompetencyScores = mysqlTable("ai_interview_competency_scores", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("session_id").notNull(),
  competencyName: varchar("competency_name", { length: 255 }).notNull(),
  score: int("score").notNull(), // 0-100
  maxScore: int("max_score").default(100).notNull(),
  strengths: json("strengths"), // Array of identified strengths
  improvements: json("improvements"), // Areas for improvement
  evidenceQuotes: json("evidence_quotes"), // Quotes from responses supporting score
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiInterviewReports = mysqlTable("ai_interview_reports", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("session_id").notNull(),
  reportType: mysqlEnum("report_type", ["summary", "detailed", "comparison"]).default("summary").notNull(),
  executiveSummary: text("executive_summary"),
  strengthsAnalysis: text("strengths_analysis"),
  areasForDevelopment: text("areas_for_development"),
  cultureFitAssessment: text("culture_fit_assessment"),
  teachingReadiness: text("teaching_readiness"), // Specific to teacher hiring
  communicationSkills: text("communication_skills"),
  subjectMastery: text("subject_mastery"), // For technical roles
  recommendedNextSteps: text("recommended_next_steps"),
  redFlags: json("red_flags"), // Array of concerns
  highlights: json("highlights"), // Array of positive highlights
  comparisonData: json("comparison_data"), // For comparing with other candidates
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  viewedBy: json("viewed_by"), // Array of user IDs who viewed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Interview Relations
export const aiInterviewTemplatesRelations = relations(aiInterviewTemplates, ({ many, one }) => ({
  questions: many(aiInterviewQuestions),
  sessions: many(aiInterviewSessions),
  createdByUser: one(users, {
    fields: [aiInterviewTemplates.createdBy],
    references: [users.id],
  }),
}));

export const aiInterviewQuestionsRelations = relations(aiInterviewQuestions, ({ one }) => ({
  template: one(aiInterviewTemplates, {
    fields: [aiInterviewQuestions.templateId],
    references: [aiInterviewTemplates.id],
  }),
}));

export const aiInterviewSessionsRelations = relations(aiInterviewSessions, ({ one, many }) => ({
  template: one(aiInterviewTemplates, {
    fields: [aiInterviewSessions.templateId],
    references: [aiInterviewTemplates.id],
  }),
  candidate: one(users, {
    fields: [aiInterviewSessions.candidateId],
    references: [users.id],
  }),
  responses: many(aiInterviewResponses),
  competencyScores: many(aiInterviewCompetencyScores),
  reports: many(aiInterviewReports),
}));

export const aiInterviewResponsesRelations = relations(aiInterviewResponses, ({ one }) => ({
  session: one(aiInterviewSessions, {
    fields: [aiInterviewResponses.sessionId],
    references: [aiInterviewSessions.id],
  }),
  question: one(aiInterviewQuestions, {
    fields: [aiInterviewResponses.questionId],
    references: [aiInterviewQuestions.id],
  }),
}));

// AI Interview Types
export type AIInterviewTemplate = typeof aiInterviewTemplates.$inferSelect;
export type AIInterviewQuestion = typeof aiInterviewQuestions.$inferSelect;
export type AIInterviewSession = typeof aiInterviewSessions.$inferSelect;
export type AIInterviewResponse = typeof aiInterviewResponses.$inferSelect;
export type AIInterviewCompetencyScore = typeof aiInterviewCompetencyScores.$inferSelect;
export type AIInterviewReport = typeof aiInterviewReports.$inferSelect;

