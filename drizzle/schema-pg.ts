import { integer, pgEnum, pgTable, text, timestamp, varchar, boolean, numeric, json, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * TALENT MANAGEMENT SYSTEM - POSTGRESQL DATABASE SCHEMA
 * Comprehensive schema for all 10 modules with proper relationships
 * Converted from MySQL to PostgreSQL for Render deployment
 */

// ============================================================================
// ENUMS (PostgreSQL requires separate enum definitions)
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["super_admin", "hr_manager", "department_manager", "employee", "licensing_officer", "recruiter"]);
export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "suspended"]);
export const careerPathStatusEnum = pgEnum("career_path_status", ["draft", "published", "archived"]);
export const proficiencyLevelEnum = pgEnum("proficiency_level", ["beginner", "intermediate", "advanced", "expert"]);
export const skillGapLevelEnum = pgEnum("skill_gap_level", ["none", "beginner", "intermediate", "advanced", "expert"]);
export const recommendationStatusEnum = pgEnum("recommendation_status", ["pending", "accepted", "rejected", "completed"]);
export const successionStatusEnum = pgEnum("succession_status", ["active", "inactive", "completed"]);
export const readinessLevelEnum = pgEnum("readiness_level", ["not_ready", "developing", "ready_now", "ready_plus"]);
export const scenarioTypeEnum = pgEnum("scenario_type", ["expansion", "downsizing", "merger", "restructuring", "custom"]);
export const workforceStatusEnum = pgEnum("workforce_status", ["draft", "active", "completed", "archived"]);
export const allocationStatusEnum = pgEnum("allocation_status", ["planned", "active", "completed", "cancelled"]);
export const alertTypeEnum = pgEnum("alert_type", ["skill_shortage", "over_allocation", "resource_conflict", "attrition_risk"]);
export const severityEnum = pgEnum("severity", ["low", "medium", "high", "critical"]);
export const surveyTypeEnum = pgEnum("survey_type", ["pulse", "quarterly", "annual", "exit", "custom"]);
export const surveyStatusEnum = pgEnum("survey_status", ["draft", "active", "closed", "archived"]);
export const questionTypeEnum = pgEnum("question_type", ["multiple_choice", "likert_scale", "open_ended", "rating", "yes_no"]);
export const activityTypeEnum = pgEnum("activity_type", ["course_completion", "survey_participation", "workshop", "event", "team_building"]);
export const sentimentEnum = pgEnum("sentiment", ["very_negative", "negative", "neutral", "positive", "very_positive"]);
export const requisitionStatusEnum = pgEnum("requisition_status", ["draft", "pending_approval", "approved", "posted", "filled", "cancelled"]);
export const postingStatusEnum = pgEnum("posting_status", ["active", "expired", "removed"]);
export const candidateStatusEnum = pgEnum("candidate_status", ["new", "screening", "interview", "assessment", "offer", "hired", "rejected", "withdrawn"]);
export const applicationStatusEnum = pgEnum("application_status", ["applied", "screening", "interview", "assessment", "offer", "hired", "rejected", "withdrawn"]);
export const interviewTypeEnum = pgEnum("interview_type", ["phone_screen", "technical", "behavioral", "panel", "final"]);
export const interviewStatusEnum = pgEnum("interview_status", ["scheduled", "completed", "cancelled", "rescheduled"]);
export const assessmentTypeEnum = pgEnum("assessment_type", ["skill_test", "personality", "culture_fit", "cognitive", "custom"]);
export const metricTypeEnum = pgEnum("metric_type", ["time_to_hire", "cost_per_hire", "source_effectiveness", "diversity", "quality_of_hire"]);
export const cycleTypeEnum = pgEnum("cycle_type", ["annual", "semi_annual", "quarterly", "continuous"]);
export const cycleStatusEnum = pgEnum("cycle_status", ["planning", "active", "review", "completed", "archived"]);
export const goalTypeEnum = pgEnum("goal_type", ["individual", "team", "departmental", "organizational"]);
export const goalStatusEnum = pgEnum("goal_status", ["draft", "active", "completed", "cancelled", "overdue"]);
export const relationshipEnum = pgEnum("relationship", ["peer", "subordinate", "manager", "self", "other"]);
export const licenseStatusEnum = pgEnum("license_status", ["active", "inactive"]);
export const applicationLicenseStatusEnum = pgEnum("application_license_status", ["draft", "submitted", "under_review", "documents_pending", "approved", "rejected", "withdrawn"]);
export const issuedLicenseStatusEnum = pgEnum("issued_license_status", ["active", "expired", "suspended", "revoked", "renewed"]);
export const eventTypeEnum = pgEnum("event_type", ["issued", "renewed", "suspended", "reinstated", "revoked", "expired"]);
export const licensingAssessmentTypeEnum = pgEnum("licensing_assessment_type", ["subject_specialization", "professional_pedagogical", "combined"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "urgent"]);
export const reportStatusEnum = pgEnum("report_status", ["generating", "completed", "failed"]);
export const frameworkStatusEnum = pgEnum("framework_status", ["draft", "active", "archived"]);
export const competencyLevelEnum = pgEnum("competency_level", ["foundation", "intermediate", "advanced", "expert"]);
export const educatorCompetencyLevelEnum = pgEnum("educator_competency_level", ["not_started", "developing", "proficient", "advanced", "expert"]);
export const targetLevelEnum = pgEnum("target_level", ["developing", "proficient", "advanced", "expert"]);
export const competencyStatusEnum = pgEnum("competency_status", ["in_progress", "achieved", "expired", "under_review"]);
export const assessmentSessionTypeEnum = pgEnum("assessment_session_type", ["self_assessment", "peer_review", "supervisor_review", "external_assessment", "portfolio_review"]);
export const assessmentSessionStatusEnum = pgEnum("assessment_session_status", ["scheduled", "in_progress", "completed", "verified", "rejected"]);
export const evidenceTypeEnum = pgEnum("evidence_type", ["document", "video", "observation", "artifact", "testimony", "certificate"]);
export const verificationStatusEnum = pgEnum("verification_status", ["pending", "verified", "rejected"]);
export const devPlanStatusEnum = pgEnum("dev_plan_status", ["draft", "active", "completed", "cancelled"]);
export const questionBankTypeEnum = pgEnum("question_bank_type", ["multiple_choice", "true_false", "short_answer", "essay", "scenario"]);
export const difficultyLevelEnum = pgEnum("difficulty_level", ["basic", "intermediate", "advanced", "expert"]);
export const examTypeEnum = pgEnum("exam_type", ["initial", "renewal", "upgrade", "remedial"]);
export const examStatusEnum = pgEnum("exam_status", ["draft", "published", "archived"]);
export const attemptStatusEnum = pgEnum("attempt_status", ["in_progress", "submitted", "graded", "expired"]);
export const schoolTypeEnum = pgEnum("school_type", ["public", "private", "charter"]);
export const educationLevelEnum = pgEnum("education_level", ["kindergarten", "primary", "middle", "secondary", "all_levels"]);
export const schoolStatusEnum = pgEnum("school_status", ["active", "inactive", "under_construction"]);
export const placementTypeEnum = pgEnum("placement_type", ["new_hire", "transfer", "promotion", "lateral_move", "temporary", "redeployment"]);
export const placementStatusEnum = pgEnum("placement_status", ["active", "completed", "cancelled"]);
export const requestTypeEnum = pgEnum("request_type", ["transfer", "promotion", "position_change", "school_change"]);
export const requestStatusEnum = pgEnum("request_status", ["draft", "submitted", "under_review", "approved", "rejected", "cancelled"]);
export const transferTypeEnum = pgEnum("transfer_type", ["voluntary", "administrative", "promotional", "disciplinary"]);
export const approvalStatusEnum = pgEnum("approval_status", ["pending", "approved", "rejected", "deferred"]);
export const testCategoryEnum = pgEnum("test_category", ["personality", "cognitive", "emotional_intelligence", "behavioral", "teaching_style"]);
export const scoringMethodEnum = pgEnum("scoring_method", ["likert_scale", "multiple_choice", "true_false", "rating_scale"]);
export const testStatusEnum = pgEnum("test_status", ["active", "inactive", "draft"]);
export const psychQuestionTypeEnum = pgEnum("psych_question_type", ["likert", "multiple_choice", "true_false", "rating"]);
export const psychAssessmentStatusEnum = pgEnum("psych_assessment_status", ["in_progress", "completed", "abandoned"]);
export const badgeTierEnum = pgEnum("badge_tier", ["bronze", "silver", "gold", "platinum"]);
export const verificationStatusLogEnum = pgEnum("verification_status_log", ["valid", "invalid", "expired", "revoked"]);
export const integrationStatusEnum = pgEnum("integration_status", ["success", "failed", "pending"]);
export const aiInterviewQuestionTypeEnum = pgEnum("ai_interview_question_type", ["behavioral", "technical", "situational", "competency", "general"]);
export const aiSessionStatusEnum = pgEnum("ai_session_status", ["scheduled", "in_progress", "completed", "expired", "cancelled"]);
export const interviewModeEnum = pgEnum("interview_mode", ["text", "voice", "video"]);
export const aiRecommendationEnum = pgEnum("ai_recommendation", ["strong_hire", "hire", "maybe", "no_hire"]);
export const reportTypeEnum = pgEnum("report_type", ["summary", "detailed", "comparison"]);

// ============================================================================
// CORE: USERS & AUTHENTICATION
// ============================================================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("employee").notNull(),
  emiratesId: varchar("emiratesId", { length: 64 }),
  phone: varchar("phone", { length: 32 }),
  departmentId: integer("departmentId"),
  positionId: integer("positionId"),
  managerId: integer("managerId"),
  status: userStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  parentId: integer("parentId"),
  headId: integer("headId"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  departmentId: integer("departmentId"),
  level: integer("level"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 1: CAREER PROGRESSION AND MOBILITY
// ============================================================================

export const careerPaths = pgTable("career_paths", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  departmentId: integer("departmentId"),
  status: careerPathStatusEnum("status").default("draft").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const careerPathSteps = pgTable("career_path_steps", {
  id: serial("id").primaryKey(),
  careerPathId: integer("careerPathId").notNull(),
  position: integer("position").notNull(),
  roleName: varchar("roleName", { length: 255 }).notNull(),
  positionId: integer("positionId"),
  requiredExperience: integer("requiredExperience"),
  salaryRangeMin: integer("salaryRangeMin"),
  salaryRangeMax: integer("salaryRangeMax"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const roleSkills = pgTable("role_skills", {
  id: serial("id").primaryKey(),
  positionId: integer("positionId").notNull(),
  skillId: integer("skillId").notNull(),
  proficiencyLevel: proficiencyLevelEnum("proficiencyLevel").notNull(),
  isRequired: boolean("isRequired").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const employeeSkills = pgTable("employee_skills", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  skillId: integer("skillId").notNull(),
  proficiencyLevel: proficiencyLevelEnum("proficiencyLevel").notNull(),
  verifiedBy: integer("verifiedBy"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const skillGaps = pgTable("skill_gaps", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  skillId: integer("skillId").notNull(),
  currentLevel: skillGapLevelEnum("currentLevel").notNull(),
  requiredLevel: proficiencyLevelEnum("requiredLevel").notNull(),
  gapLevel: integer("gapLevel").notNull(),
  recommendedTraining: text("recommendedTraining"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const careerRecommendations = pgTable("career_recommendations", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  recommendedPathId: integer("recommendedPathId").notNull(),
  aiScore: integer("aiScore"),
  reasons: json("reasons"),
  estimatedTimeMonths: integer("estimatedTimeMonths"),
  requiredEffort: text("requiredEffort"),
  status: recommendationStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 2: SUCCESSION PLANNING
// ============================================================================

export const successionPlans = pgTable("succession_plans", {
  id: serial("id").primaryKey(),
  criticalPositionId: integer("criticalPositionId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: successionStatusEnum("status").default("active").notNull(),
  reviewDate: timestamp("reviewDate"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const talentPools = pgTable("talent_pools", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  criteria: json("criteria"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const talentPoolMembers = pgTable("talent_pool_members", {
  id: serial("id").primaryKey(),
  poolId: integer("poolId").notNull(),
  employeeId: integer("employeeId").notNull(),
  readinessLevel: readinessLevelEnum("readinessLevel").notNull(),
  developmentPlan: text("developmentPlan"),
  addedBy: integer("addedBy").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export const successors = pgTable("successors", {
  id: serial("id").primaryKey(),
  successionPlanId: integer("successionPlanId").notNull(),
  employeeId: integer("employeeId").notNull(),
  readinessScore: integer("readinessScore"),
  developmentProgress: integer("developmentProgress"),
  strengths: text("strengths"),
  developmentAreas: text("developmentAreas"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const leadershipAssessments = pgTable("leadership_assessments", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  assessmentType: varchar("assessmentType", { length: 100 }).notNull(),
  score: integer("score").notNull(),
  maxScore: integer("maxScore").notNull(),
  assessedBy: integer("assessedBy").notNull(),
  assessedAt: timestamp("assessedAt").defaultNow().notNull(),
  feedback: text("feedback"),
  recommendations: text("recommendations"),
});

// ============================================================================
// MODULE 3: WORKFORCE PLANNING
// ============================================================================

export const workforceScenarios = pgTable("workforce_scenarios", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  scenarioType: scenarioTypeEnum("scenarioType").notNull(),
  parameters: json("parameters"),
  status: workforceStatusEnum("status").default("draft").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const workforceProjections = pgTable("workforce_projections", {
  id: serial("id").primaryKey(),
  scenarioId: integer("scenarioId").notNull(),
  departmentId: integer("departmentId").notNull(),
  currentHeadcount: integer("currentHeadcount").notNull(),
  projectedHeadcount: integer("projectedHeadcount").notNull(),
  timeframeMonths: integer("timeframeMonths").notNull(),
  skillsRequired: json("skillsRequired"),
  gap: integer("gap").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const resourceAllocations = pgTable("resource_allocations", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  projectName: varchar("projectName", { length: 255 }).notNull(),
  allocationPercentage: integer("allocationPercentage").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  status: allocationStatusEnum("status").default("planned").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const workforceAlerts = pgTable("workforce_alerts", {
  id: serial("id").primaryKey(),
  alertType: alertTypeEnum("alertType").notNull(),
  severity: severityEnum("severity").notNull(),
  message: text("message").notNull(),
  affectedDepartmentId: integer("affectedDepartmentId"),
  affectedEmployeeId: integer("affectedEmployeeId"),
  resolved: boolean("resolved").default(false).notNull(),
  resolvedBy: integer("resolvedBy"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 4: EMPLOYEE ENGAGEMENT
// ============================================================================

export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  surveyType: surveyTypeEnum("surveyType").notNull(),
  targetAudience: json("targetAudience"),
  status: surveyStatusEnum("status").default("draft").notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const surveyQuestions = pgTable("survey_questions", {
  id: serial("id").primaryKey(),
  surveyId: integer("surveyId").notNull(),
  questionText: text("questionText").notNull(),
  questionType: questionTypeEnum("questionType").notNull(),
  options: json("options"),
  isRequired: boolean("isRequired").default(false).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const surveyResponses = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  surveyId: integer("surveyId").notNull(),
  employeeId: integer("employeeId"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export const surveyAnswers = pgTable("survey_answers", {
  id: serial("id").primaryKey(),
  responseId: integer("responseId").notNull(),
  questionId: integer("questionId").notNull(),
  answerText: text("answerText"),
  answerValue: integer("answerValue"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const engagementActivities = pgTable("engagement_activities", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  activityType: activityTypeEnum("activityType").notNull(),
  activityName: varchar("activityName", { length: 255 }).notNull(),
  points: integer("points").default(0).notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export const engagementScores = pgTable("engagement_scores", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  score: integer("score").notNull(),
  factors: json("factors"),
  sentiment: sentimentEnum("sentiment"),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 5: RECRUITMENT AND TALENT ACQUISITION
// ============================================================================

export const jobRequisitions = pgTable("job_requisitions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  departmentId: integer("departmentId").notNull(),
  positionId: integer("positionId"),
  numberOfPositions: integer("numberOfPositions").default(1).notNull(),
  salaryRangeMin: integer("salaryRangeMin"),
  salaryRangeMax: integer("salaryRangeMax"),
  budget: integer("budget"),
  requiredSkills: json("requiredSkills"),
  requiredQualifications: text("requiredQualifications"),
  status: requisitionStatusEnum("status").default("draft").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdBy: integer("createdBy").notNull(),
  approvedBy: integer("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  requisitionId: integer("requisitionId").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  externalUrl: text("externalUrl"),
  postedAt: timestamp("postedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  status: postingStatusEnum("status").default("active").notNull(),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  resumeUrl: text("resumeUrl"),
  linkedinUrl: text("linkedinUrl"),
  currentCompany: varchar("currentCompany", { length: 255 }),
  currentPosition: varchar("currentPosition", { length: 255 }),
  yearsOfExperience: integer("yearsOfExperience"),
  education: json("education"),
  parsedData: json("parsedData"),
  status: candidateStatusEnum("status").default("new").notNull(),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const candidateApplications = pgTable("candidate_applications", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidateId").notNull(),
  requisitionId: integer("requisitionId").notNull(),
  coverLetter: text("coverLetter"),
  status: applicationStatusEnum("status").default("applied").notNull(),
  currentStage: varchar("currentStage", { length: 100 }),
  matchScore: integer("matchScore"),
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const candidateSkills = pgTable("candidate_skills", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidateId").notNull(),
  skillId: integer("skillId").notNull(),
  proficiencyLevel: proficiencyLevelEnum("proficiencyLevel").notNull(),
  yearsOfExperience: integer("yearsOfExperience"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("applicationId").notNull(),
  interviewType: interviewTypeEnum("interviewType").notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  duration: integer("duration"),
  location: varchar("location", { length: 255 }),
  meetingLink: text("meetingLink"),
  interviewerId: integer("interviewerId").notNull(),
  status: interviewStatusEnum("status").default("scheduled").notNull(),
  feedback: text("feedback"),
  rating: integer("rating"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  applicationId: integer("applicationId").notNull(),
  assessmentType: assessmentTypeEnum("assessmentType").notNull(),
  assessmentName: varchar("assessmentName", { length: 255 }).notNull(),
  score: integer("score"),
  maxScore: integer("maxScore"),
  passed: boolean("passed"),
  completedAt: timestamp("completedAt"),
  results: json("results"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const recruitmentMetrics = pgTable("recruitment_metrics", {
  id: serial("id").primaryKey(),
  requisitionId: integer("requisitionId").notNull(),
  metricType: metricTypeEnum("metricType").notNull(),
  metricValue: integer("metricValue"),
  metricData: json("metricData"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 6: PERFORMANCE MANAGEMENT
// ============================================================================

export const performanceCycles = pgTable("performance_cycles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  cycleType: cycleTypeEnum("cycleType").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  status: cycleStatusEnum("status").default("planning").notNull(),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  cycleId: integer("cycleId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  goalType: goalTypeEnum("goalType").notNull(),
  kpi: varchar("kpi", { length: 255 }),
  targetValue: integer("targetValue"),
  currentValue: integer("currentValue"),
  unit: varchar("unit", { length: 50 }),
  deadline: timestamp("deadline"),
  status: goalStatusEnum("status").default("draft").notNull(),
  alignedWithGoalId: integer("alignedWithGoalId"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const goalProgress = pgTable("goal_progress", {
  id: serial("id").primaryKey(),
  goalId: integer("goalId").notNull(),
  progressPercentage: integer("progressPercentage").notNull(),
  notes: text("notes"),
  updatedBy: integer("updatedBy").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const selfAppraisals = pgTable("self_appraisals", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  cycleId: integer("cycleId").notNull(),
  content: json("content").notNull(),
  achievements: text("achievements"),
  challenges: text("challenges"),
  developmentNeeds: text("developmentNeeds"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export const managerReviews = pgTable("manager_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  cycleId: integer("cycleId").notNull(),
  managerId: integer("managerId").notNull(),
  overallRating: integer("overallRating").notNull(),
  strengths: text("strengths"),
  areasForImprovement: text("areasForImprovement"),
  feedback: text("feedback"),
  recommendations: text("recommendations"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export const feedback360 = pgTable("feedback_360", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  cycleId: integer("cycleId").notNull(),
  feedbackFrom: integer("feedbackFrom"),
  relationship: relationshipEnum("relationship").notNull(),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  rating: integer("rating"),
  comments: text("comments"),
  strengths: text("strengths"),
  developmentAreas: text("developmentAreas"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export const performanceRatings = pgTable("performance_ratings", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  cycleId: integer("cycleId").notNull(),
  dimension: varchar("dimension", { length: 100 }).notNull(),
  rating: integer("rating").notNull(),
  maxRating: integer("maxRating").default(5).notNull(),
  ratedBy: integer("ratedBy").notNull(),
  ratedAt: timestamp("ratedAt").defaultNow().notNull(),
  comments: text("comments"),
});

// ============================================================================
// MODULE 7: TEACHERS LICENSING
// ============================================================================

export const licenseTypes = pgTable("license_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  requirements: json("requirements"),
  status: licenseStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const licenseTiers = pgTable("license_tiers", {
  id: serial("id").primaryKey(),
  licenseTypeId: integer("licenseTypeId").notNull(),
  tierName: varchar("tierName", { length: 100 }).notNull(),
  tierLevel: integer("tierLevel").notNull(),
  experienceRequired: integer("experienceRequired"),
  cpdRequired: integer("cpdRequired"),
  requirements: json("requirements"),
  validityYears: integer("validityYears").default(3).notNull(),
  fee: integer("fee").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const licenseApplications = pgTable("license_applications", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicantId").notNull(),
  licenseTypeId: integer("licenseTypeId").notNull(),
  tierId: integer("tierId").notNull(),
  applicationNumber: varchar("applicationNumber", { length: 100 }).notNull().unique(),
  personalInfo: json("personalInfo"),
  educationInfo: json("educationInfo"),
  experienceInfo: json("experienceInfo"),
  status: applicationLicenseStatusEnum("status").default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  reviewedBy: integer("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const applicationDocuments = pgTable("application_documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("applicationId").notNull(),
  documentType: varchar("documentType", { length: 100 }).notNull(),
  documentName: varchar("documentName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: integer("fileSize"),
  verified: boolean("verified").default(false).notNull(),
  verifiedBy: integer("verifiedBy"),
  verifiedAt: timestamp("verifiedAt"),
  verificationNotes: text("verificationNotes"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  applicantId: integer("applicantId").notNull(),
  applicationId: integer("applicationId"),
  licenseNumber: varchar("licenseNumber", { length: 100 }).notNull().unique(),
  licenseTypeId: integer("licenseTypeId").notNull(),
  tierId: integer("tierId").notNull(),
  issueDate: timestamp("issueDate").notNull(),
  expiryDate: timestamp("expiryDate").notNull(),
  status: issuedLicenseStatusEnum("status").default("active").notNull(),
  qrCode: text("qrCode"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  issuedBy: integer("issuedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const licenseHistory = pgTable("license_history", {
  id: serial("id").primaryKey(),
  licenseId: integer("licenseId").notNull(),
  eventType: eventTypeEnum("eventType").notNull(),
  eventDate: timestamp("eventDate").defaultNow().notNull(),
  performedBy: integer("performedBy"),
  notes: text("notes"),
  blockchainHash: varchar("blockchainHash", { length: 255 }),
  previousStatus: varchar("previousStatus", { length: 50 }),
  newStatus: varchar("newStatus", { length: 50 }),
});

export const cpdRecords = pgTable("cpd_records", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacherId").notNull(),
  activityName: varchar("activityName", { length: 255 }).notNull(),
  activityType: varchar("activityType", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 255 }),
  hours: integer("hours").notNull(),
  completedAt: timestamp("completedAt").notNull(),
  certificateUrl: text("certificateUrl"),
  verified: boolean("verified").default(false).notNull(),
  verifiedBy: integer("verifiedBy"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const assessmentResults = pgTable("assessment_results", {
  id: serial("id").primaryKey(),
  applicationId: integer("applicationId").notNull(),
  assessmentType: licensingAssessmentTypeEnum("assessmentType").notNull(),
  assessmentName: varchar("assessmentName", { length: 255 }).notNull(),
  score: integer("score").notNull(),
  maxScore: integer("maxScore").notNull(),
  passingScore: integer("passingScore").notNull(),
  passed: boolean("passed").notNull(),
  takenAt: timestamp("takenAt").defaultNow().notNull(),
  results: json("results"),
});

// ============================================================================
// CROSS-CUTTING: NOTIFICATIONS, RATINGS, AUDIT LOGS
// ============================================================================

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  actionUrl: text("actionUrl"),
  isRead: boolean("isRead").default(false).notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  ratableType: varchar("ratableType", { length: 100 }).notNull(),
  ratableId: integer("ratableId").notNull(),
  userId: integer("userId").notNull(),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: integer("entityId"),
  changes: json("changes"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reportType: varchar("reportType", { length: 100 }).notNull(),
  reportName: varchar("reportName", { length: 255 }).notNull(),
  module: varchar("module", { length: 100 }).notNull(),
  parameters: json("parameters"),
  fileUrl: text("fileUrl"),
  fileKey: varchar("fileKey", { length: 255 }),
  status: reportStatusEnum("status").default("generating").notNull(),
  generatedBy: integer("generatedBy").notNull(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 8: EDUCATOR'S COMPETENCY ASSESSMENTS
// ============================================================================

export const competencyFrameworks = pgTable("competency_frameworks", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  version: varchar("version", { length: 50 }),
  status: frameworkStatusEnum("status").default("draft").notNull(),
  effectiveDate: timestamp("effectiveDate"),
  expiryDate: timestamp("expiryDate"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const competencyStandards = pgTable("competency_standards", {
  id: serial("id").primaryKey(),
  frameworkId: integer("frameworkId").notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  level: competencyLevelEnum("level").notNull(),
  weight: integer("weight").default(1),
  criteria: text("criteria"),
  evidenceRequirements: text("evidenceRequirements"),
  parentId: integer("parentId"),
  sortOrder: integer("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const educatorCompetencies = pgTable("educator_competencies", {
  id: serial("id").primaryKey(),
  educatorId: integer("educatorId").notNull(),
  standardId: integer("standardId").notNull(),
  currentLevel: educatorCompetencyLevelEnum("currentLevel").default("not_started").notNull(),
  targetLevel: targetLevelEnum("targetLevel"),
  status: competencyStatusEnum("status").default("in_progress").notNull(),
  achievedDate: timestamp("achievedDate"),
  expiryDate: timestamp("expiryDate"),
  lastAssessedDate: timestamp("lastAssessedDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const competencyAssessments = pgTable("competency_assessments", {
  id: serial("id").primaryKey(),
  educatorId: integer("educatorId").notNull(),
  standardId: integer("standardId").notNull(),
  assessmentType: assessmentSessionTypeEnum("assessmentType").notNull(),
  assessorId: integer("assessorId"),
  assessmentDate: timestamp("assessmentDate").notNull(),
  score: integer("score"),
  level: educatorCompetencyLevelEnum("level"),
  status: assessmentSessionStatusEnum("status").default("scheduled").notNull(),
  strengths: text("strengths"),
  areasForImprovement: text("areasForImprovement"),
  recommendations: text("recommendations"),
  verifiedBy: integer("verifiedBy"),
  verifiedDate: timestamp("verifiedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const assessmentRubrics = pgTable("assessment_rubrics", {
  id: serial("id").primaryKey(),
  standardId: integer("standardId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  criteria: text("criteria"),
  maxScore: integer("maxScore").default(100),
  passingScore: integer("passingScore").default(70),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const assessmentEvidence = pgTable("assessment_evidence", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessmentId").notNull(),
  evidenceType: evidenceTypeEnum("evidenceType").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileType: varchar("fileType", { length: 50 }),
  fileSize: integer("fileSize"),
  uploadedBy: integer("uploadedBy").notNull(),
  verificationStatus: verificationStatusEnum("verificationStatus").default("pending").notNull(),
  verifiedBy: integer("verifiedBy"),
  verifiedDate: timestamp("verifiedDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const competencyDevelopmentPlans = pgTable("competency_development_plans", {
  id: serial("id").primaryKey(),
  educatorId: integer("educatorId").notNull(),
  standardId: integer("standardId").notNull(),
  currentLevel: educatorCompetencyLevelEnum("currentLevel").notNull(),
  targetLevel: targetLevelEnum("targetLevel").notNull(),
  targetDate: timestamp("targetDate"),
  activities: text("activities"),
  resources: text("resources"),
  milestones: text("milestones"),
  status: devPlanStatusEnum("status").default("draft").notNull(),
  progress: integer("progress").default(0),
  supervisorId: integer("supervisorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 9: STAFF PLACEMENT & MOBILITY
// ============================================================================

export const staffPlacements = pgTable("staff_placements", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  schoolId: integer("schoolId").notNull(),
  positionId: integer("positionId").notNull(),
  placementType: placementTypeEnum("placementType").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  isTemporary: boolean("isTemporary").default(false).notNull(),
  isPrimary: boolean("isPrimary").default(true).notNull(),
  workloadPercentage: integer("workloadPercentage").default(100).notNull(),
  status: placementStatusEnum("status").default("active").notNull(),
  notes: text("notes"),
  createdBy: integer("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const placementRequests = pgTable("placement_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employeeId").notNull(),
  requestType: requestTypeEnum("requestType").notNull(),
  currentSchoolId: integer("currentSchoolId"),
  currentPositionId: integer("currentPositionId"),
  requestedSchoolId: integer("requestedSchoolId"),
  requestedPositionId: integer("requestedPositionId"),
  reason: text("reason").notNull(),
  preferredStartDate: timestamp("preferredStartDate"),
  priority: priorityEnum("priority").default("medium").notNull(),
  status: requestStatusEnum("status").default("draft").notNull(),
  submittedAt: timestamp("submittedAt"),
  reviewedBy: integer("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const placementApprovals = pgTable("placement_approvals", {
  id: serial("id").primaryKey(),
  placementRequestId: integer("placementRequestId").notNull(),
  approverId: integer("approverId").notNull(),
  approverRole: varchar("approverRole", { length: 100 }).notNull(),
  approvalLevel: integer("approvalLevel").notNull(),
  status: approvalStatusEnum("status").default("pending").notNull(),
  comments: text("comments"),
  decidedAt: timestamp("decidedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// MODULE 10: EDUCATOR PSYCHOMETRIC ASSESSMENTS
// ============================================================================

export const psychometricTestTypes = pgTable("psychometric_test_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: testCategoryEnum("category").notNull(),
  description: text("description"),
  purpose: text("purpose"),
  duration: integer("duration"),
  questionCount: integer("questionCount"),
  scoringMethod: scoringMethodEnum("scoringMethod").notNull(),
  status: testStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const psychometricQuestions = pgTable("psychometric_questions", {
  id: serial("id").primaryKey(),
  testTypeId: integer("testTypeId").notNull(),
  questionText: text("questionText").notNull(),
  questionType: psychQuestionTypeEnum("questionType").notNull(),
  traitMeasured: varchar("traitMeasured", { length: 100 }),
  dimension: varchar("dimension", { length: 100 }),
  isReverseCoded: boolean("isReverseCoded").default(false),
  orderIndex: integer("orderIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const psychometricOptions = pgTable("psychometric_options", {
  id: serial("id").primaryKey(),
  questionId: integer("questionId").notNull(),
  optionText: varchar("optionText", { length: 500 }).notNull(),
  scoreValue: integer("scoreValue").notNull(),
  orderIndex: integer("orderIndex").notNull(),
});

export const psychometricAssessments = pgTable("psychometric_assessments", {
  id: serial("id").primaryKey(),
  educatorId: integer("educatorId").notNull(),
  testTypeId: integer("testTypeId").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  status: psychAssessmentStatusEnum("status").default("in_progress").notNull(),
  timeSpent: integer("timeSpent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const psychometricResponses = pgTable("psychometric_responses", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessmentId").notNull(),
  questionId: integer("questionId").notNull(),
  selectedOptionId: integer("selectedOptionId"),
  responseValue: integer("responseValue"),
  responseTime: integer("responseTime"),
  answeredAt: timestamp("answeredAt").defaultNow().notNull(),
});

export const psychometricResults = pgTable("psychometric_results", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessmentId").notNull(),
  educatorId: integer("educatorId").notNull(),
  testTypeId: integer("testTypeId").notNull(),
  overallScore: integer("overallScore"),
  percentileRank: integer("percentileRank"),
  interpretation: text("interpretation"),
  strengths: text("strengths"),
  developmentAreas: text("developmentAreas"),
  recommendations: text("recommendations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// GAMIFICATION & ENGAGEMENT SYSTEM
// ============================================================================

export const gamificationBadgeCategoryEnum = pgEnum("gamification_badge_category", ["learning", "engagement", "performance", "leadership", "special"]);
export const gamificationBadgeRarityEnum = pgEnum("gamification_badge_rarity", ["common", "rare", "epic", "legendary"]);
export const gamificationPointTypeEnum = pgEnum("gamification_point_type", ["earned", "spent", "bonus", "penalty"]);

export const gamificationBadges = pgTable("gamification_badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 20 }),
  category: gamificationBadgeCategoryEnum("category").default("engagement").notNull(),
  points: integer("points").default(0).notNull(),
  criteriaType: varchar("criteriaType", { length: 50 }).notNull(), // count, streak, score, completion
  criteriaMetric: varchar("criteriaMetric", { length: 100 }).notNull(),
  criteriaThreshold: integer("criteriaThreshold").default(1).notNull(),
  criteriaTimeframe: varchar("criteriaTimeframe", { length: 20 }), // day, week, month, year, all_time
  rarity: gamificationBadgeRarityEnum("rarity").default("common").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const gamificationUserBadges = pgTable("gamification_user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  badgeId: integer("badgeId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  progress: integer("progress").default(0),
});

export const gamificationPoints = pgTable("gamification_points", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  points: integer("points").notNull(),
  type: gamificationPointTypeEnum("type").default("earned").notNull(),
  reason: text("reason"),
  category: varchar("category", { length: 50 }),
  referenceType: varchar("referenceType", { length: 50 }), // course, survey, goal, etc.
  referenceId: integer("referenceId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const gamificationLeaderboard = pgTable("gamification_leaderboard", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  totalPoints: integer("totalPoints").default(0).notNull(),
  badgeCount: integer("badgeCount").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastActivityAt: timestamp("lastActivityAt"),
  timeframe: varchar("timeframe", { length: 20 }).default("all_time").notNull(), // week, month, year, all_time
  rank: integer("rank"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const gamificationUserStats = pgTable("gamification_user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  totalPoints: integer("totalPoints").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  currentStreak: integer("currentStreak").default(0).notNull(),
  longestStreak: integer("longestStreak").default(0).notNull(),
  coursesCompleted: integer("coursesCompleted").default(0).notNull(),
  surveysCompleted: integer("surveysCompleted").default(0).notNull(),
  goalsAchieved: integer("goalsAchieved").default(0).notNull(),
  lastActivityDate: timestamp("lastActivityDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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

// Module 8: Competency Assessments
export type CompetencyFramework = typeof competencyFrameworks.$inferSelect;
export type CompetencyStandard = typeof competencyStandards.$inferSelect;
export type EducatorCompetency = typeof educatorCompetencies.$inferSelect;
export type CompetencyAssessment = typeof competencyAssessments.$inferSelect;
export type AssessmentRubric = typeof assessmentRubrics.$inferSelect;
export type AssessmentEvidence = typeof assessmentEvidence.$inferSelect;
export type CompetencyDevelopmentPlan = typeof competencyDevelopmentPlans.$inferSelect;

// Module 9: Staff Placement & Mobility
export type StaffPlacement = typeof staffPlacements.$inferSelect;
export type PlacementRequest = typeof placementRequests.$inferSelect;
export type PlacementApproval = typeof placementApprovals.$inferSelect;

// Module 10: Psychometric Assessments
export type PsychometricTestType = typeof psychometricTestTypes.$inferSelect;
export type PsychometricQuestion = typeof psychometricQuestions.$inferSelect;
export type PsychometricOption = typeof psychometricOptions.$inferSelect;
export type PsychometricAssessment = typeof psychometricAssessments.$inferSelect;
export type PsychometricResponse = typeof psychometricResponses.$inferSelect;
export type PsychometricResult = typeof psychometricResults.$inferSelect;

// Gamification
export type GamificationBadge = typeof gamificationBadges.$inferSelect;
export type GamificationUserBadge = typeof gamificationUserBadges.$inferSelect;
export type GamificationPoints = typeof gamificationPoints.$inferSelect;
export type GamificationLeaderboard = typeof gamificationLeaderboard.$inferSelect;
export type GamificationUserStats = typeof gamificationUserStats.$inferSelect;
