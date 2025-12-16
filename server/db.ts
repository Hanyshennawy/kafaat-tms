import { eq, desc, and, or, gte, lte, like, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  InsertUser, 
  users,
  departments,
  positions,
  careerPaths,
  careerPathSteps,
  skills,
  employeeSkills,
  skillGaps,
  careerRecommendations,
  successionPlans,
  talentPools,
  talentPoolMembers,
  successors,
  leadershipAssessments,
  workforceScenarios,
  workforceProjections,
  resourceAllocations,
  workforceAlerts,
  surveys,
  surveyQuestions,
  surveyResponses,
  surveyAnswers,
  engagementActivities,
  engagementScores,
  jobRequisitions,
  jobPostings,
  candidates,
  candidateApplications,
  candidateSkills,
  interviews,
  assessments,
  recruitmentMetrics,
  performanceCycles,
  goals,
  goalProgress,
  selfAppraisals,
  managerReviews,
  feedback360,
  performanceRatings,
  licenseTypes,
  licenseTiers,
  licenseApplications,
  applicationDocuments,
  licenses,
  licenseHistory,
  cpdRecords,
  assessmentResults,
  licensingCourses,
  userCourseProgress,
  notifications,
  ratings,
  auditLogs,
  reports,
  roleSkills,
} from "../drizzle/schema-pg";
import { ENV } from './_core/env';
import * as demoData from './demo-data';

let _db: ReturnType<typeof drizzle> | null = null;
let _dbConnected = true; // Track if database is actually working

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_dbConnected) return null; // Skip if we know DB isn't working
  
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _dbConnected = false;
    }
  }
  return _db;
}

// Mark database as not connected (called when queries fail)
export function markDbDisconnected() {
  _dbConnected = false;
  _db = null;
}

// Check if we're in demo mode (no database)
export function isDemoMode() {
  return !_dbConnected || (!_db && !process.env.DATABASE_URL);
}

// ============================================================================
// CORE: USERS & AUTHENTICATION
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'super_admin';
      updateSet.role = 'super_admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

// ============================================================================
// DEPARTMENTS & POSITIONS
// ============================================================================

export async function getAllDepartments() {
  const db = await getDb();
  if (!db) return demoData.demoDepartments;
  return db.select().from(departments).orderBy(departments.name);
}

export async function getDepartmentById(id: number) {
  const db = await getDb();
  if (!db) return demoData.demoDepartments.find(d => d.id === id);
  const result = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPositions() {
  const db = await getDb();
  if (!db) return demoData.demoPositions;
  return db.select().from(positions).orderBy(positions.title);
}

export async function getPositionById(id: number) {
  const db = await getDb();
  if (!db) return demoData.demoPositions.find(p => p.id === id);
  const result = await db.select().from(positions).where(eq(positions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// MODULE 1: CAREER PROGRESSION
// ============================================================================

export async function getAllCareerPaths() {
  const db = await getDb();
  if (!db) return demoData.demoCareerPaths;
  try {
    return await db.select().from(careerPaths).orderBy(desc(careerPaths.createdAt));
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data:", error);
    return demoData.demoCareerPaths;
  }
}

export async function getCareerPathById(id: number) {
  const db = await getDb();
  if (!db) return demoData.demoCareerPaths.find(p => p.id === id);
  const result = await db.select().from(careerPaths).where(eq(careerPaths.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCareerPathSteps(careerPathId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(careerPathSteps)
    .where(eq(careerPathSteps.careerPathId, careerPathId))
    .orderBy(careerPathSteps.position);
}

export async function getAllSkills() {
  const db = await getDb();
  if (!db) return demoData.demoSkills;
  return db.select().from(skills).orderBy(skills.name);
}

export async function getEmployeeSkills(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeSkills).where(eq(employeeSkills.employeeId, employeeId));
}

export async function getSkillGaps(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skillGaps).where(eq(skillGaps.employeeId, employeeId));
}

export async function getCareerRecommendations(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(careerRecommendations)
    .where(eq(careerRecommendations.employeeId, employeeId))
    .orderBy(desc(careerRecommendations.aiScore));
}

// ============================================================================
// MODULE 2: SUCCESSION PLANNING
// ============================================================================

export async function getAllSuccessionPlans() {
  const db = await getDb();
  if (!db) return demoData.demoSuccessionPlans;
  try {
    return await db.select().from(successionPlans).orderBy(desc(successionPlans.createdAt));
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data:", error);
    markDbDisconnected();
    return demoData.demoSuccessionPlans;
  }
}

export async function getSuccessionPlanById(id: number) {
  const db = await getDb();
  if (!db) return demoData.demoSuccessionPlans.find(p => p.id === id);
  const result = await db.select().from(successionPlans).where(eq(successionPlans.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTalentPools() {
  const db = await getDb();
  if (!db) return demoData.demoTalentPools;
  return db.select().from(talentPools).orderBy(desc(talentPools.createdAt));
}

export async function getTalentPoolMembers(poolId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(talentPoolMembers).where(eq(talentPoolMembers.poolId, poolId));
}

export async function getSuccessors(successionPlanId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(successors)
    .where(eq(successors.successionPlanId, successionPlanId))
    .orderBy(desc(successors.readinessScore));
}

export async function getLeadershipAssessments(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leadershipAssessments)
    .where(eq(leadershipAssessments.employeeId, employeeId))
    .orderBy(desc(leadershipAssessments.assessedAt));
}

// ============================================================================
// MODULE 3: WORKFORCE PLANNING
// ============================================================================

export async function getAllWorkforceScenarios() {
  const db = await getDb();
  if (!db) return demoData.demoWorkforceScenarios;
  try {
    return await db.select().from(workforceScenarios).orderBy(desc(workforceScenarios.createdAt));
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data");
    markDbDisconnected();
    return demoData.demoWorkforceScenarios;
  }
}

export async function getWorkforceScenarioById(id: number) {
  const db = await getDb();
  if (!db) return demoData.demoWorkforceScenarios.find(s => s.id === id);
  const result = await db.select().from(workforceScenarios).where(eq(workforceScenarios.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWorkforceProjections(scenarioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workforceProjections).where(eq(workforceProjections.scenarioId, scenarioId));
}

export async function getAllResourceAllocations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resourceAllocations).orderBy(desc(resourceAllocations.createdAt));
}

export async function getWorkforceAlerts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workforceAlerts)
    .where(eq(workforceAlerts.resolved, false))
    .orderBy(desc(workforceAlerts.createdAt));
}

// ============================================================================
// MODULE 4: EMPLOYEE ENGAGEMENT
// ============================================================================

export async function getAllSurveys() {
  const db = await getDb();
  if (!db) return demoData.demoSurveys;
  try {
    return await db.select().from(surveys).orderBy(desc(surveys.createdAt));
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data");
    markDbDisconnected();
    return demoData.demoSurveys;
  }
}

export async function getSurveyById(id: number) {
  const db = await getDb();
  if (!db) return demoData.demoSurveys.find(s => s.id === id);
  const result = await db.select().from(surveys).where(eq(surveys.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSurveyQuestions(surveyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(surveyQuestions)
    .where(eq(surveyQuestions.surveyId, surveyId))
    .orderBy(surveyQuestions.order);
}

export async function getSurveyResponses(surveyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(surveyResponses).where(eq(surveyResponses.surveyId, surveyId));
}

export async function getEngagementActivities(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(engagementActivities)
    .where(eq(engagementActivities.employeeId, employeeId))
    .orderBy(desc(engagementActivities.completedAt));
}

export async function getEngagementScore(employeeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(engagementScores)
    .where(eq(engagementScores.employeeId, employeeId))
    .orderBy(desc(engagementScores.calculatedAt))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// MODULE 5: RECRUITMENT
// ============================================================================

export async function getAllJobRequisitions() {
  const db = await getDb();
  if (!db) return demoData.demoRequisitions;
  try {
    return await db.select().from(jobRequisitions).orderBy(desc(jobRequisitions.createdAt));
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data");
    markDbDisconnected();
    return demoData.demoRequisitions;
  }
}

export async function getJobRequisitionById(id: number) {
  const db = await getDb();
  if (!db) return demoData.demoRequisitions.find(r => r.id === id);
  const result = await db.select().from(jobRequisitions).where(eq(jobRequisitions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCandidates() {
  const db = await getDb();
  if (!db) return demoData.demoCandidates;
  try {
    return await db.select().from(candidates).orderBy(desc(candidates.appliedAt));
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data");
    markDbDisconnected();
    return demoData.demoCandidates;
  }
}

export async function getCandidateById(id: number) {
  const db = await getDb();
  if (!db) return demoData.demoCandidates.find(c => c.id === id);
  const result = await db.select().from(candidates).where(eq(candidates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCandidateSkills(candidateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(candidateSkills)
    .where(eq(candidateSkills.candidateId, candidateId));
}

export async function getCandidateApplications(candidateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(candidateApplications)
    .where(eq(candidateApplications.candidateId, candidateId))
    .orderBy(desc(candidateApplications.appliedAt));
}

export async function getInterviews(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(interviews)
    .where(eq(interviews.applicationId, applicationId))
    .orderBy(interviews.scheduledAt);
}

export async function getAssessments(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessments).where(eq(assessments.applicationId, applicationId));
}

// ============================================================================
// MODULE 6: PERFORMANCE MANAGEMENT
// ============================================================================

export async function getAllPerformanceCycles() {
  const db = await getDb();
  if (!db) return demoData.demoPerformanceCycles;
  try {
    return await db.select().from(performanceCycles).orderBy(desc(performanceCycles.startDate));
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data");
    markDbDisconnected();
    return demoData.demoPerformanceCycles;
  }
}

export async function getPerformanceCycleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(performanceCycles).where(eq(performanceCycles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getGoals(employeeId: number, cycleId?: number) {
  const db = await getDb();
  if (!db) return [];
  const conditions = cycleId 
    ? and(eq(goals.employeeId, employeeId), eq(goals.cycleId, cycleId))
    : eq(goals.employeeId, employeeId);
  return db.select().from(goals).where(conditions).orderBy(desc(goals.createdAt));
}

export async function getGoalProgress(goalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(goalProgress)
    .where(eq(goalProgress.goalId, goalId))
    .orderBy(desc(goalProgress.updatedAt));
}

export async function getSelfAppraisal(employeeId: number, cycleId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(selfAppraisals)
    .where(and(eq(selfAppraisals.employeeId, employeeId), eq(selfAppraisals.cycleId, cycleId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getManagerReview(employeeId: number, cycleId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(managerReviews)
    .where(and(eq(managerReviews.employeeId, employeeId), eq(managerReviews.cycleId, cycleId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function get360Feedback(employeeId: number, cycleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedback360)
    .where(and(eq(feedback360.employeeId, employeeId), eq(feedback360.cycleId, cycleId)))
    .orderBy(desc(feedback360.submittedAt));
}

export async function getPerformanceRatings(employeeId: number, cycleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(performanceRatings)
    .where(and(eq(performanceRatings.employeeId, employeeId), eq(performanceRatings.cycleId, cycleId)))
    .orderBy(desc(performanceRatings.ratedAt));
}

// ============================================================================
// MODULE 7: TEACHERS LICENSING
// ============================================================================

export async function getAllLicenseTypes() {
  const db = await getDb();
  if (!db) {
    // Return comprehensive demo license types
    return demoData.demoLicenseTypes;
  }
  try {
    const result = await db.select().from(licenseTypes).orderBy(licenseTypes.name);
    // If no license types in DB, return demo data
    if (result.length === 0) {
      return demoData.demoLicenseTypes;
    }
    return result;
  } catch (error) {
    console.warn("[Database] Query failed for license types, returning demo data");
    markDbDisconnected();
    return demoData.demoLicenseTypes;
  }
}

export async function getLicenseTypeById(id: number) {
  const db = await getDb();
  if (!db) {
    // Return from demo data
    return demoData.demoLicenseTypes.find((lt: any) => lt.id === id);
  }
  try {
    const result = await db.select().from(licenseTypes).where(eq(licenseTypes.id, id)).limit(1);
    if (result.length > 0) return result[0];
    // Fallback to demo data if not found in DB
    return demoData.demoLicenseTypes.find((lt: any) => lt.id === id);
  } catch (error) {
    console.warn("[Database] Query failed for license type by ID, returning demo data");
    markDbDisconnected();
    return demoData.demoLicenseTypes.find((lt: any) => lt.id === id);
  }
}

export async function getLicenseTiers(licenseTypeId: number) {
  const db = await getDb();
  if (!db) {
    // Return demo license tiers for the given license type
    return demoData.demoLicenseTiers
      .filter((t: any) => t.licenseTypeId === licenseTypeId)
      .sort((a: any, b: any) => a.tierLevel - b.tierLevel);
  }
  try {
    const result = await db.select().from(licenseTiers)
      .where(eq(licenseTiers.licenseTypeId, licenseTypeId))
      .orderBy(licenseTiers.tierLevel);
    // If no tiers found in DB, return demo data
    if (result.length === 0) {
      return demoData.demoLicenseTiers
        .filter((t: any) => t.licenseTypeId === licenseTypeId)
        .sort((a: any, b: any) => a.tierLevel - b.tierLevel);
    }
    return result;
  } catch (error) {
    console.warn("[Database] Query failed for license tiers, returning demo data");
    markDbDisconnected();
    return demoData.demoLicenseTiers
      .filter((t: any) => t.licenseTypeId === licenseTypeId)
      .sort((a: any, b: any) => a.tierLevel - b.tierLevel);
  }
}

export async function getAllLicenseApplications() {
  const db = await getDb();
  if (!db) return demoData.demoLicenseApplications;
  try {
    return await db.select().from(licenseApplications).orderBy(desc(licenseApplications.createdAt));
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data");
    markDbDisconnected();
    return demoData.demoLicenseApplications;
  }
}

export async function getLicenseApplicationById(id: number) {
  const db = await getDb();
  if (!db) return demoData.demoLicenseApplications.find(a => a.id === id);
  const result = await db.select().from(licenseApplications).where(eq(licenseApplications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getApplicationDocuments(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applicationDocuments)
    .where(eq(applicationDocuments.applicationId, applicationId))
    .orderBy(desc(applicationDocuments.uploadedAt));
}

export async function getAllLicenses() {
  const db = await getDb();
  if (!db) return demoData.demoLicenses;
  try {
    return await db.select().from(licenses).orderBy(desc(licenses.issueDate));
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data");
    markDbDisconnected();
    return demoData.demoLicenses;
  }
}

export async function getLicenseById(id: number) {
  const db = await getDb();
  if (!db) return demoData.demoLicenses.find(l => l.id === id);
  const result = await db.select().from(licenses).where(eq(licenses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLicenseByNumber(licenseNumber: string) {
  const db = await getDb();
  if (!db) return demoData.demoLicenses.find(l => l.licenseNumber === licenseNumber);
  const result = await db.select().from(licenses).where(eq(licenses.licenseNumber, licenseNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLicenseHistory(licenseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(licenseHistory)
    .where(eq(licenseHistory.licenseId, licenseId))
    .orderBy(desc(licenseHistory.eventDate));
}

export async function getCpdRecords(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cpdRecords)
    .where(eq(cpdRecords.teacherId, teacherId))
    .orderBy(desc(cpdRecords.completedAt));
}

export async function getAssessmentResults(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessmentResults)
    .where(eq(assessmentResults.applicationId, applicationId))
    .orderBy(desc(assessmentResults.takenAt));
}

// Get licenses for a specific user
export async function getUserLicenses(userId: number) {
  const db = await getDb();
  if (!db) return demoData.demoLicenses.filter(l => l.applicantId === userId);
  try {
    return await db.select().from(licenses)
      .where(eq(licenses.applicantId, userId))
      .orderBy(desc(licenses.issueDate));
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data");
    markDbDisconnected();
    return demoData.demoLicenses;
  }
}

// Get applications for a specific user
export async function getUserApplications(userId: number) {
  const db = await getDb();
  if (!db) return demoData.demoLicenseApplications.filter(a => a.applicantId === userId);
  try {
    return await db.select().from(licenseApplications)
      .where(eq(licenseApplications.applicantId, userId))
      .orderBy(desc(licenseApplications.createdAt));
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data");
    markDbDisconnected();
    return demoData.demoLicenseApplications;
  }
}

// Get CPD records for a specific user
export async function getUserCpdRecords(userId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(cpdRecords)
      .where(eq(cpdRecords.teacherId, userId))
      .orderBy(desc(cpdRecords.completedAt));
  } catch (error) {
    console.warn("[Database] Query failed");
    markDbDisconnected();
    return [];
  }
}

// Get dashboard statistics for licensing
export async function getLicensingDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) {
    // Return demo stats
    return {
      activeLicenses: 1,
      pendingApplications: 1,
      cpdHoursCompleted: 85,
      cpdHoursRequired: 100,
      daysToRenewal: 456,
    };
  }
  
  try {
    // Get active licenses count
    const activeLicensesResult = await db.select({ count: sql<number>`count(*)` })
      .from(licenses)
      .where(and(eq(licenses.applicantId, userId), eq(licenses.status, 'active')));
    
    // Get pending applications count
    const pendingAppsResult = await db.select({ count: sql<number>`count(*)` })
      .from(licenseApplications)
      .where(and(
        eq(licenseApplications.applicantId, userId),
        inArray(licenseApplications.status, ['draft', 'submitted', 'under_review'])
      ));
    
    // Get CPD hours
    const cpdResult = await db.select({ totalHours: sql<number>`COALESCE(SUM(hours), 0)` })
      .from(cpdRecords)
      .where(eq(cpdRecords.teacherId, userId));
    
    // Get nearest expiring license
    const nearestExpiry = await db.select()
      .from(licenses)
      .where(and(eq(licenses.applicantId, userId), eq(licenses.status, 'active')))
      .orderBy(licenses.expiryDate)
      .limit(1);
    
    let daysToRenewal = 999;
    if (nearestExpiry.length > 0 && nearestExpiry[0].expiryDate) {
      const expiryDate = new Date(nearestExpiry[0].expiryDate);
      const today = new Date();
      daysToRenewal = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    return {
      activeLicenses: Number(activeLicensesResult[0]?.count) || 0,
      pendingApplications: Number(pendingAppsResult[0]?.count) || 0,
      cpdHoursCompleted: Number(cpdResult[0]?.totalHours) || 0,
      cpdHoursRequired: 100, // This could come from config
      daysToRenewal,
    };
  } catch (error) {
    console.warn("[Database] Query failed, returning demo stats");
    markDbDisconnected();
    return {
      activeLicenses: 1,
      pendingApplications: 1,
      cpdHoursCompleted: 85,
      cpdHoursRequired: 100,
      daysToRenewal: 456,
    };
  }
}

// ============================================================================
// LICENSING COURSES & PROGRESS
// ============================================================================

export async function getLicensingCourses(licenseTypeId: number) {
  const db = await getDb();
  if (!db) {
    // Return demo courses for any license type
    return [
      { id: 1, licenseTypeId, name: "UAE Educational Standards & Curriculum", duration: "4 hours", status: "completed", orderIndex: 1, passingScore: 70 },
      { id: 2, licenseTypeId, name: "Classroom Management Best Practices", duration: "6 hours", status: "completed", orderIndex: 2, passingScore: 70 },
      { id: 3, licenseTypeId, name: "Student Assessment Methods", duration: "5 hours", status: "in_progress", orderIndex: 3, passingScore: 70 },
      { id: 4, licenseTypeId, name: "Special Education Awareness", duration: "3 hours", status: "not_started", orderIndex: 4, passingScore: 70 },
      { id: 5, licenseTypeId, name: "Professional Ethics for Educators", duration: "2 hours", status: "not_started", orderIndex: 5, passingScore: 70 },
    ];
  }
  try {
    return await db.select().from(licensingCourses)
      .where(eq(licensingCourses.licenseTypeId, licenseTypeId))
      .orderBy(licensingCourses.orderIndex);
  } catch (error) {
    console.warn("[Database] Query failed, returning demo courses");
    markDbDisconnected();
    return [
      { id: 1, licenseTypeId, name: "UAE Educational Standards & Curriculum", duration: "4 hours", status: "completed", orderIndex: 1, passingScore: 70 },
      { id: 2, licenseTypeId, name: "Classroom Management Best Practices", duration: "6 hours", status: "completed", orderIndex: 2, passingScore: 70 },
      { id: 3, licenseTypeId, name: "Student Assessment Methods", duration: "5 hours", status: "in_progress", orderIndex: 3, passingScore: 70 },
      { id: 4, licenseTypeId, name: "Special Education Awareness", duration: "3 hours", status: "not_started", orderIndex: 4, passingScore: 70 },
      { id: 5, licenseTypeId, name: "Professional Ethics for Educators", duration: "2 hours", status: "not_started", orderIndex: 5, passingScore: 70 },
    ];
  }
}

export async function getUserCourseProgressByLicenseType(userId: number, licenseTypeId: number) {
  const db = await getDb();
  if (!db) {
    // Return demo progress
    return [
      { courseId: 1, status: "completed", progress: 100, score: 92 },
      { courseId: 2, status: "completed", progress: 100, score: 88 },
      { courseId: 3, status: "in_progress", progress: 45, score: null },
      { courseId: 4, status: "not_started", progress: 0, score: null },
      { courseId: 5, status: "not_started", progress: 0, score: null },
    ];
  }
  try {
    // Get courses for this license type and join with user progress
    const courses = await db.select().from(licensingCourses)
      .where(eq(licensingCourses.licenseTypeId, licenseTypeId))
      .orderBy(licensingCourses.orderIndex);
    
    const progressRecords = await db.select().from(userCourseProgress)
      .where(eq(userCourseProgress.userId, userId));
    
    // Merge course data with progress
    return courses.map(course => {
      const progress = progressRecords.find(p => p.courseId === course.id);
      return {
        ...course,
        userStatus: progress?.status || "not_started",
        userProgress: progress?.progress || 0,
        userScore: progress?.score || null,
      };
    });
  } catch (error) {
    console.warn("[Database] Query failed, returning demo progress");
    markDbDisconnected();
    return [];
  }
}

export async function getCoursesWithProgress(userId: number, licenseTypeId: number) {
  const courses = await getLicensingCourses(licenseTypeId);
  const db = await getDb();
  
  if (!db) {
    // Return demo data with progress
    return [
      { id: 1, name: "UAE Educational Standards & Curriculum", duration: "4 hours", status: "completed", progress: 100, score: 92 },
      { id: 2, name: "Classroom Management Best Practices", duration: "6 hours", status: "completed", progress: 100, score: 88 },
      { id: 3, name: "Student Assessment Methods", duration: "5 hours", status: "in_progress", progress: 45, score: null },
      { id: 4, name: "Special Education Awareness", duration: "3 hours", status: "not_started", progress: 0, score: null },
      { id: 5, name: "Professional Ethics for Educators", duration: "2 hours", status: "not_started", progress: 0, score: null },
    ];
  }
  
  try {
    const progressRecords = await db.select().from(userCourseProgress)
      .where(eq(userCourseProgress.userId, userId));
    
    return courses.map((course: any) => {
      const progress = progressRecords.find(p => p.courseId === course.id);
      return {
        ...course,
        status: progress?.status || "not_started",
        progress: progress?.progress || 0,
        score: progress?.score || null,
      };
    });
  } catch (error) {
    console.warn("[Database] Query failed, returning demo progress");
    markDbDisconnected();
    return [
      { id: 1, name: "UAE Educational Standards & Curriculum", duration: "4 hours", status: "completed", progress: 100, score: 92 },
      { id: 2, name: "Classroom Management Best Practices", duration: "6 hours", status: "completed", progress: 100, score: 88 },
      { id: 3, name: "Student Assessment Methods", duration: "5 hours", status: "in_progress", progress: 45, score: null },
      { id: 4, name: "Special Education Awareness", duration: "3 hours", status: "not_started", progress: 0, score: null },
      { id: 5, name: "Professional Ethics for Educators", duration: "2 hours", status: "not_started", progress: 0, score: null },
    ];
  }
}

// ============================================================================
// CROSS-CUTTING: NOTIFICATIONS, RATINGS, AUDIT LOGS
// ============================================================================

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return demoData.demoNotifications;
  try {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data");
    markDbDisconnected();
    return demoData.demoNotifications;
  }
}

export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return demoData.demoNotifications.filter(n => !n.isRead);
  try {
    return await db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt));
  } catch (error) {
    console.warn("[Database] Query failed, returning demo data");
    markDbDisconnected();
    return demoData.demoNotifications.filter(n => !n.isRead);
  }
}

export async function getRatings(ratableType: string, ratableId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ratings)
    .where(and(eq(ratings.ratableType, ratableType), eq(ratings.ratableId, ratableId)))
    .orderBy(desc(ratings.createdAt));
}

export async function getAuditLogs(entityType?: string, entityId?: number) {
  const db = await getDb();
  if (!db) return [];
  let conditions = undefined;
  if (entityType && entityId) {
    conditions = and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId));
  } else if (entityType) {
    conditions = eq(auditLogs.entityType, entityType);
  }
  return db.select().from(auditLogs)
    .where(conditions)
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);
}

export async function getAllReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).orderBy(desc(reports.generatedAt));
}

export async function getReportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
