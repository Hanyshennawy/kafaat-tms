import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { questionBankRouter } from "./routers/questionBank";
import { saasRouter } from "./routers/saas";
import { competencyRouter } from "./routers/competency";
import { placementRouter } from "./routers/placement";
import { psychometricRouter } from "./routers/psychometric";
import { servicesRouter } from "./routers/services";
import { catalogRouter } from "./catalog/catalog.service";
import { integrationsRouter } from "./routers/integrations";
import { aiInterviewRouter } from "./routers/aiInterview";
// import { qmsRouter } from "./routers/qms"; // Temporarily disabled due to TypeScript caching issue
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { getDb } from "./db";
import { 
  careerPaths, careerPathSteps, skills, employeeSkills, skillGaps, careerRecommendations,
  successionPlans, talentPools, talentPoolMembers, successors, leadershipAssessments,
  workforceScenarios, workforceProjections, resourceAllocations, workforceAlerts,
  surveys, surveyQuestions, surveyResponses, surveyAnswers, engagementActivities, engagementScores,
  jobRequisitions, jobPostings, candidates, candidateApplications, candidateSkills, interviews, assessments,
  performanceCycles, goals, goalProgress, selfAppraisals, managerReviews, feedback360, performanceRatings,
  licenseTypes, licenseTiers, licenseApplications, applicationDocuments, licenses, licenseHistory, cpdRecords, assessmentResults,
  notifications, ratings, auditLogs, reports, departments, positions
} from "../drizzle/schema-pg";
import { eq, desc } from "drizzle-orm";

// ============================================================================
// MODULE 1: CAREER PROGRESSION AND MOBILITY
// ============================================================================

const careerProgressionRouter = router({
  // Career Paths
  getAllPaths: protectedProcedure.query(async () => {
    return await db.getAllCareerPaths();
  }),
  
  getPathById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCareerPathById(input.id);
    }),
  
  createPath: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      departmentId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(careerPaths).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  updatePath: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await database.update(careerPaths).set(data).where(eq(careerPaths.id, id));
      return { success: true };
    }),
  
  getPathSteps: protectedProcedure
    .input(z.object({ careerPathId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCareerPathSteps(input.careerPathId);
    }),
  
  addPathStep: protectedProcedure
    .input(z.object({
      careerPathId: z.number(),
      position: z.number(),
      roleName: z.string(),
      positionId: z.number().optional(),
      requiredExperience: z.number().optional(),
      salaryRangeMin: z.number().optional(),
      salaryRangeMax: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(careerPathSteps).values(input);
      return { id: result.insertId };
    }),
  
  // Skills
  getAllSkills: protectedProcedure.query(async () => {
    return await db.getAllSkills();
  }),
  
  createSkill: protectedProcedure
    .input(z.object({
      name: z.string(),
      category: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(skills).values(input);
      return { id: result.insertId };
    }),
  
  getEmployeeSkills: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getEmployeeSkills(input.employeeId);
    }),
  
  addEmployeeSkill: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      skillId: z.number(),
      proficiencyLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(employeeSkills).values({
        ...input,
        verifiedBy: ctx.user.id,
        verifiedAt: new Date(),
      });
      return { id: result.insertId };
    }),
  
  getSkillGaps: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getSkillGaps(input.employeeId);
    }),
  
  getCareerRecommendations: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCareerRecommendations(input.employeeId);
    }),
  
  generateRecommendations: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      // Get employee data
      const employee = await db.getUserById(input.employeeId);
      if (!employee) throw new Error("Employee not found");
      
      const employeeSkillsData = await db.getEmployeeSkills(input.employeeId);
      const allSkills = await db.getAllSkills();
      const skillNames = employeeSkillsData.map(es => {
        const skill = allSkills.find(s => s.id === es.skillId);
        return skill?.name || "Unknown";
      });
      
      // Generate AI recommendations
      const { generateCareerRecommendations } = await import("./ai-services");
      const recommendations = await generateCareerRecommendations({
        currentPosition: employee.name || "Employee",
        skills: skillNames,
        experience: 5, // Would calculate from employment history
        careerGoals: "Career advancement",
      });
      
      // Store recommendations in database
      const careerPathsData = await db.getAllCareerPaths();
      if (careerPathsData.length > 0 && recommendations.recommendations) {
        for (const rec of recommendations.recommendations.slice(0, 3)) {
          await database.insert(careerRecommendations).values({
            employeeId: input.employeeId,
            recommendedPathId: careerPathsData[0].id,
            aiScore: Math.round(Math.random() * 30 + 70),
            reasons: rec,
            estimatedTimeMonths: 12,
            requiredEffort: rec.timeline || "6-12 months",
          });
        }
      }
      
      return { success: true, recommendations: recommendations.recommendations };
    }),
});

// ============================================================================
// MODULE 2: SUCCESSION PLANNING
// ============================================================================

const successionPlanningRouter = router({
  getAllPlans: protectedProcedure.query(async () => {
    return await db.getAllSuccessionPlans();
  }),
  
  getPlanById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getSuccessionPlanById(input.id);
    }),
  
  createPlan: protectedProcedure
    .input(z.object({
      criticalPositionId: z.number(),
      name: z.string(),
      description: z.string().optional(),
      reviewDate: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(successionPlans).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  updatePlan: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["active", "inactive", "completed"]).optional(),
      reviewDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await database.update(successionPlans).set(data).where(eq(successionPlans.id, id));
      return { success: true };
    }),
  
  getAllTalentPools: protectedProcedure.query(async () => {
    return await db.getAllTalentPools();
  }),
  
  createTalentPool: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      criteria: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(talentPools).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  getTalentPoolMembers: protectedProcedure
    .input(z.object({ poolId: z.number() }))
    .query(async ({ input }) => {
      return await db.getTalentPoolMembers(input.poolId);
    }),
  
  addTalentPoolMember: protectedProcedure
    .input(z.object({
      poolId: z.number(),
      employeeId: z.number(),
      readinessLevel: z.enum(["not_ready", "developing", "ready_now", "ready_plus"]),
      developmentPlan: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(talentPoolMembers).values({
        ...input,
        addedBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  getSuccessors: protectedProcedure
    .input(z.object({ successionPlanId: z.number() }))
    .query(async ({ input }) => {
      return await db.getSuccessors(input.successionPlanId);
    }),
  
  addSuccessor: protectedProcedure
    .input(z.object({
      successionPlanId: z.number(),
      employeeId: z.number(),
      readinessScore: z.number().optional(),
      developmentProgress: z.number().optional(),
      strengths: z.string().optional(),
      developmentAreas: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(successors).values(input);
      return { id: result.insertId };
    }),
  
  getLeadershipAssessments: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getLeadershipAssessments(input.employeeId);
    }),
  
  createLeadershipAssessment: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      assessmentType: z.string(),
      score: z.number(),
      maxScore: z.number(),
      feedback: z.string().optional(),
      recommendations: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(leadershipAssessments).values({
        ...input,
        assessedBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
});

// ============================================================================
// MODULE 3: WORKFORCE PLANNING
// ============================================================================

const workforcePlanningRouter = router({
  getAllScenarios: protectedProcedure.query(async () => {
    return await db.getAllWorkforceScenarios();
  }),
  
  getScenarioById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getWorkforceScenarioById(input.id);
    }),
  
  createScenario: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      scenarioType: z.enum(["expansion", "downsizing", "merger", "restructuring", "custom"]),
      parameters: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(workforceScenarios).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  updateScenario: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["draft", "active", "completed", "archived"]).optional(),
      parameters: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await database.update(workforceScenarios).set(data).where(eq(workforceScenarios.id, id));
      return { success: true };
    }),
  
  simulateScenario: protectedProcedure
    .input(z.object({ scenarioId: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      // Get scenario details
      const scenario = await db.getWorkforceScenarioById(input.scenarioId);
      if (!scenario) throw new Error("Scenario not found");
      
      // Get department data for projections
      const depts = await db.getAllDepartments();
      
      // Generate projections based on scenario type
      const projections = [];
      for (const dept of depts.slice(0, 5)) {
        const baseHeadcount = Math.floor(Math.random() * 50) + 10;
        let projectedHeadcount = baseHeadcount;
        
        switch (scenario.scenarioType) {
          case "expansion":
            projectedHeadcount = Math.floor(baseHeadcount * 1.2);
            break;
          case "downsizing":
            projectedHeadcount = Math.floor(baseHeadcount * 0.85);
            break;
          case "merger":
            projectedHeadcount = Math.floor(baseHeadcount * 1.5);
            break;
          case "restructuring":
            projectedHeadcount = Math.floor(baseHeadcount * 0.95);
            break;
          default:
            projectedHeadcount = baseHeadcount;
        }
        
        await database.insert(workforceProjections).values({
          scenarioId: input.scenarioId,
          departmentId: dept.id,
          currentHeadcount: baseHeadcount,
          projectedHeadcount,
          timeframeMonths: 12,
          gap: projectedHeadcount - baseHeadcount,
          skillsRequired: JSON.stringify(["Leadership", "Communication", "Technical"]),
        });
        
        projections.push({
          department: dept.name,
          current: baseHeadcount,
          projected: projectedHeadcount,
          gap: projectedHeadcount - baseHeadcount,
        });
      }
      
      // Update scenario status
      await database.update(workforceScenarios)
        .set({ status: "active" })
        .where(eq(workforceScenarios.id, input.scenarioId));
      
      return { success: true, projections };
    }),
  
  getProjections: protectedProcedure
    .input(z.object({ scenarioId: z.number() }))
    .query(async ({ input }) => {
      return await db.getWorkforceProjections(input.scenarioId);
    }),
  
  getAllResourceAllocations: protectedProcedure.query(async () => {
    return await db.getAllResourceAllocations();
  }),
  
  createResourceAllocation: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      projectName: z.string(),
      allocationPercentage: z.number(),
      startDate: z.date(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(resourceAllocations).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  getWorkforceAlerts: protectedProcedure.query(async () => {
    return await db.getWorkforceAlerts();
  }),
  
  resolveAlert: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      await database.update(workforceAlerts).set({
        resolved: true,
        resolvedBy: ctx.user.id,
        resolvedAt: new Date(),
      }).where(eq(workforceAlerts.id, input.id));
      return { success: true };
    }),
});

// ============================================================================
// MODULE 4: EMPLOYEE ENGAGEMENT
// ============================================================================

const employeeEngagementRouter = router({
  getAllSurveys: protectedProcedure.query(async () => {
    return await db.getAllSurveys();
  }),
  
  getSurveyById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getSurveyById(input.id);
    }),
  
  createSurvey: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      surveyType: z.enum(["pulse", "quarterly", "annual", "exit", "custom"]),
      isAnonymous: z.boolean().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(surveys).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  updateSurvey: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["draft", "active", "closed", "archived"]).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await database.update(surveys).set(data).where(eq(surveys.id, id));
      return { success: true };
    }),
  
  getSurveyQuestions: protectedProcedure
    .input(z.object({ surveyId: z.number() }))
    .query(async ({ input }) => {
      return await db.getSurveyQuestions(input.surveyId);
    }),
  
  addSurveyQuestion: protectedProcedure
    .input(z.object({
      surveyId: z.number(),
      questionText: z.string(),
      questionType: z.enum(["multiple_choice", "likert_scale", "open_ended", "rating", "yes_no"]),
      options: z.any().optional(),
      isRequired: z.boolean().optional(),
      order: z.number(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(surveyQuestions).values(input);
      return { id: result.insertId };
    }),
  
  submitSurveyResponse: protectedProcedure
    .input(z.object({
      surveyId: z.number(),
      answers: z.array(z.object({
        questionId: z.number(),
        answerText: z.string().optional(),
        answerValue: z.number().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [responseResult] = await database.insert(surveyResponses).values({
        surveyId: input.surveyId,
        employeeId: ctx.user.id,
      });
      
      const responseId = responseResult.insertId;
      
      for (const answer of input.answers) {
        await database.insert(surveyAnswers).values({
          responseId,
          ...answer,
        });
      }
      
      return { id: responseId };
    }),
  
  getSurveyAnalytics: protectedProcedure
    .input(z.object({ surveyId: z.number() }))
    .query(async ({ input }) => {
      // TODO: Implement survey analytics with sentiment analysis
      return { surveyId: input.surveyId, analytics: {} };
    }),
  
  getEngagementActivities: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getEngagementActivities(input.employeeId);
    }),
  
  addEngagementActivity: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      activityType: z.enum(["course_completion", "survey_participation", "workshop", "event", "team_building"]),
      activityName: z.string(),
      points: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(engagementActivities).values(input);
      return { id: result.insertId };
    }),
  
  getEngagementScore: protectedProcedure
    .input(z.object({ employeeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getEngagementScore(input.employeeId);
    }),
  
  analyzeSentiment: protectedProcedure
    .input(z.object({ surveyId: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      // Get survey responses
      const surveyData = await db.getSurveyById(input.surveyId);
      if (!surveyData) throw new Error("Survey not found");
      
      const responses = await db.getSurveyResponses(input.surveyId);
      
      // If no responses, return empty analysis
      if (!responses || responses.length === 0) {
        return {
          success: true,
          analysis: {
            sentimentScore: 0,
            sentimentCategory: "No Data",
            keyThemes: [],
            recommendations: ["Collect more survey responses"],
          },
        };
      }
      
      // Format responses for AI analysis
      const questionsData = await db.getSurveyQuestions(input.surveyId);
      const formattedResponses = responses.slice(0, 10).map((r: any) => ({
        question: questionsData.find((q: any) => q.id === r.questionId)?.questionText || "Question",
        answer: r.answerText || String(r.answerValue || ""),
      }));
      
      // Call AI service for sentiment analysis
      const { analyzeSentiment: aiAnalyzeSentiment } = await import("./ai-services");
      const analysis = await aiAnalyzeSentiment(formattedResponses);
      
      // Store engagement score
      for (const response of responses.slice(0, 5)) {
        if (response.employeeId) {
          await database.insert(engagementScores).values({
            employeeId: response.employeeId,
            score: analysis.sentimentScore,
            factors: analysis,
            sentiment: analysis.sentimentCategory.toLowerCase().replace(" ", "_") as any,
          });
        }
      }
      
      return { success: true, analysis };
    }),
});

// ============================================================================
// MODULE 5: RECRUITMENT AND TALENT ACQUISITION
// ============================================================================

const recruitmentRouter = router({
  getAllRequisitions: protectedProcedure.query(async () => {
    return await db.getAllJobRequisitions();
  }),
  
  getRequisitionById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getJobRequisitionById(input.id);
    }),
  
  createRequisition: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      departmentId: z.number(),
      positionId: z.number().optional(),
      numberOfPositions: z.number().optional(),
      salaryRangeMin: z.number().optional(),
      salaryRangeMax: z.number().optional(),
      requiredSkills: z.any().optional(),
      requiredQualifications: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(jobRequisitions).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  updateRequisition: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["draft", "pending_approval", "approved", "posted", "filled", "cancelled"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await database.update(jobRequisitions).set(data).where(eq(jobRequisitions.id, id));
      return { success: true };
    }),
  
  getAllCandidates: protectedProcedure.query(async () => {
    return await db.getAllCandidates();
  }),
  
  getCandidateById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCandidateById(input.id);
    }),
  
  createCandidate: protectedProcedure
    .input(z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      resumeUrl: z.string().optional(),
      linkedinUrl: z.string().optional(),
      currentCompany: z.string().optional(),
      currentPosition: z.string().optional(),
      yearsOfExperience: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(candidates).values(input);
      return { id: result.insertId };
    }),
  
  parseResume: protectedProcedure
    .input(z.object({ resumeUrl: z.string(), resumeText: z.string().optional() }))
    .mutation(async ({ input }) => {
      // If resume text is provided, parse it directly
      // Otherwise, we would fetch and extract text from the URL
      const resumeText = input.resumeText || `
        Sample Resume Content
        Name: Candidate Name
        Email: candidate@example.com
        Experience: 5+ years in software development
        Skills: JavaScript, TypeScript, React, Node.js
      `;
      
      // Call AI service for resume parsing
      const { parseResume: aiParseResume } = await import("./ai-services");
      const parsedData = await aiParseResume(resumeText);
      
      return { success: true, parsedData };
    }),
  
  getCandidateApplications: protectedProcedure
    .input(z.object({ candidateId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCandidateApplications(input.candidateId);
    }),
  
  createApplication: protectedProcedure
    .input(z.object({
      candidateId: z.number(),
      requisitionId: z.number(),
      coverLetter: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(candidateApplications).values(input);
      return { id: result.insertId };
    }),
  
  getInterviews: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getInterviews(input.applicationId);
    }),
  
  scheduleInterview: protectedProcedure
    .input(z.object({
      applicationId: z.number(),
      interviewType: z.enum(["phone_screen", "technical", "behavioral", "panel", "final"]),
      scheduledAt: z.date(),
      duration: z.number().optional(),
      location: z.string().optional(),
      meetingLink: z.string().optional(),
      interviewerId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(interviews).values(input);
      return { id: result.insertId };
    }),
  
  getAssessments: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getAssessments(input.applicationId);
    }),
  
  createAssessment: protectedProcedure
    .input(z.object({
      applicationId: z.number(),
      assessmentType: z.enum(["skill_test", "personality", "culture_fit", "cognitive", "custom"]),
      assessmentName: z.string(),
      score: z.number().optional(),
      maxScore: z.number().optional(),
      passed: z.boolean().optional(),
      results: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(assessments).values(input);
      return { id: result.insertId };
    }),
  
  matchCandidates: protectedProcedure
    .input(z.object({ requisitionId: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      // Get requisition details
      const requisition = await db.getJobRequisitionById(input.requisitionId);
      if (!requisition) throw new Error("Requisition not found");
      
      // Get all candidates
      const allCandidates = await db.getAllCandidates();
      const matches = [];
      
      // Call AI service for each candidate
      const { matchCandidateToJob } = await import("./ai-services");
      
      for (const candidate of allCandidates.slice(0, 10)) {
        try {
          const candidateSkillsData = await db.getCandidateSkills(candidate.id);
          const allSkills = await db.getAllSkills();
          const skillNames = candidateSkillsData.map((cs: any) => {
            const skill = allSkills.find((s: any) => s.id === cs.skillId);
            return skill?.name || "Unknown";
          });
          
          const matchResult = await matchCandidateToJob({
            jobTitle: requisition.title,
            jobDescription: requisition.description,
            requiredSkills: (requisition.requiredSkills as string[]) || [],
            candidateProfile: {
              name: `${candidate.firstName} ${candidate.lastName}`,
              currentPosition: candidate.currentPosition || "Not specified",
              skills: skillNames.length > 0 ? skillNames : ["General"],
              experience: candidate.yearsOfExperience || 0,
              education: (candidate.education as string[]) || [],
            },
          });
          
          // Update candidate application with match score
          const existingApp = await db.getCandidateApplications(candidate.id);
          const appForReq = existingApp.find((a: any) => a.requisitionId === input.requisitionId);
          
          if (appForReq) {
            await database.update(candidateApplications)
              .set({ matchScore: matchResult.matchScore })
              .where(eq(candidateApplications.id, appForReq.id));
          }
          
          matches.push({
            candidateId: candidate.id,
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            ...matchResult,
          });
        } catch (error) {
          // Continue with next candidate if AI matching fails
          console.warn(`Failed to match candidate ${candidate.id}:`, error);
        }
      }
      
      // Sort by match score
      matches.sort((a, b) => b.matchScore - a.matchScore);
      
      return { success: true, matches };
    }),
});

// ============================================================================
// MODULE 6: PERFORMANCE MANAGEMENT
// ============================================================================

const performanceManagementRouter = router({
  getAllCycles: protectedProcedure.query(async () => {
    return await db.getAllPerformanceCycles();
  }),
  
  getCycleById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getPerformanceCycleById(input.id);
    }),
  
  createCycle: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      cycleType: z.enum(["annual", "semi_annual", "quarterly", "continuous"]),
      startDate: z.date(),
      endDate: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(performanceCycles).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  updateCycle: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["planning", "active", "review", "completed", "archived"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await database.update(performanceCycles).set(data).where(eq(performanceCycles.id, id));
      return { success: true };
    }),
  
  getGoals: protectedProcedure
    .input(z.object({ 
      employeeId: z.number(),
      cycleId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return await db.getGoals(input.employeeId, input.cycleId);
    }),
  
  createGoal: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      cycleId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      goalType: z.enum(["individual", "team", "departmental", "organizational"]),
      kpi: z.string().optional(),
      targetValue: z.number().optional(),
      deadline: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(goals).values({
        ...input,
        createdBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  updateGoalProgress: protectedProcedure
    .input(z.object({
      goalId: z.number(),
      progressPercentage: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(goalProgress).values({
        ...input,
        updatedBy: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  submitSelfAppraisal: protectedProcedure
    .input(z.object({
      cycleId: z.number(),
      content: z.any(),
      achievements: z.string().optional(),
      challenges: z.string().optional(),
      developmentNeeds: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(selfAppraisals).values({
        ...input,
        employeeId: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  submitManagerReview: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      cycleId: z.number(),
      overallRating: z.number(),
      strengths: z.string().optional(),
      areasForImprovement: z.string().optional(),
      feedback: z.string().optional(),
      recommendations: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(managerReviews).values({
        ...input,
        managerId: ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  submit360Feedback: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      cycleId: z.number(),
      relationship: z.enum(["peer", "subordinate", "manager", "self", "other"]),
      isAnonymous: z.boolean().optional(),
      rating: z.number().optional(),
      comments: z.string().optional(),
      strengths: z.string().optional(),
      developmentAreas: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(feedback360).values({
        ...input,
        feedbackFrom: input.isAnonymous ? null : ctx.user.id,
      });
      return { id: result.insertId };
    }),
  
  get360Feedback: protectedProcedure
    .input(z.object({ 
      employeeId: z.number(),
      cycleId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.get360Feedback(input.employeeId, input.cycleId);
    }),
  
  getPerformanceSummary: protectedProcedure
    .input(z.object({ 
      employeeId: z.number(),
      cycleId: z.number(),
    }))
    .query(async ({ input }) => {
      const [goalsData, selfAppraisal, managerReview, feedback360Data, ratings] = await Promise.all([
        db.getGoals(input.employeeId, input.cycleId),
        db.getSelfAppraisal(input.employeeId, input.cycleId),
        db.getManagerReview(input.employeeId, input.cycleId),
        db.get360Feedback(input.employeeId, input.cycleId),
        db.getPerformanceRatings(input.employeeId, input.cycleId),
      ]);
      
      return {
        goals: goalsData,
        selfAppraisal,
        managerReview,
        feedback360: feedback360Data,
        ratings,
      };
    }),
});

// ============================================================================
// MODULE 7: TEACHERS LICENSING
// ============================================================================

const teachersLicensingRouter = router({
  getAllLicenseTypes: publicProcedure.query(async () => {
    return await db.getAllLicenseTypes();
  }),
  
  getLicenseTypeById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getLicenseTypeById(input.id);
    }),
  
  getLicenseTiers: publicProcedure
    .input(z.object({ licenseTypeId: z.number() }))
    .query(async ({ input }) => {
      return await db.getLicenseTiers(input.licenseTypeId);
    }),
  
  getAllApplications: protectedProcedure.query(async () => {
    return await db.getAllLicenseApplications();
  }),
  
  getApplicationById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getLicenseApplicationById(input.id);
    }),
  
  createApplication: protectedProcedure
    .input(z.object({
      licenseTypeId: z.number(),
      tierId: z.number(),
      personalInfo: z.any(),
      educationInfo: z.any().optional(),
      experienceInfo: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const applicationNumber = `APP-${Date.now()}-${ctx.user.id}`;
      
      const [result] = await database.insert(licenseApplications).values({
        ...input,
        applicantId: ctx.user.id,
        applicationNumber,
      });
      return { id: result.insertId, applicationNumber };
    }),
  
  updateApplication: protectedProcedure
    .input(z.object({
      id: z.number(),
      personalInfo: z.any().optional(),
      educationInfo: z.any().optional(),
      experienceInfo: z.any().optional(),
      status: z.enum(["draft", "submitted", "under_review", "documents_pending", "approved", "rejected", "withdrawn"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await database.update(licenseApplications).set(data).where(eq(licenseApplications.id, id));
      return { success: true };
    }),
  
  submitApplication: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      await database.update(licenseApplications).set({
        status: "submitted",
        submittedAt: new Date(),
      }).where(eq(licenseApplications.id, input.id));
      return { success: true };
    }),
  
  getApplicationDocuments: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getApplicationDocuments(input.applicationId);
    }),
  
  uploadDocument: protectedProcedure
    .input(z.object({
      applicationId: z.number(),
      documentType: z.string(),
      documentName: z.string(),
      fileUrl: z.string(),
      fileKey: z.string(),
      mimeType: z.string().optional(),
      fileSize: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(applicationDocuments).values(input);
      return { id: result.insertId };
    }),
  
  verifyDocument: protectedProcedure
    .input(z.object({
      id: z.number(),
      verified: z.boolean(),
      verificationNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const { id, ...data } = input;
      await database.update(applicationDocuments).set({
        ...data,
        verifiedBy: ctx.user.id,
        verifiedAt: new Date(),
      }).where(eq(applicationDocuments.id, id));
      return { success: true };
    }),
  
  approveApplication: protectedProcedure
    .input(z.object({ 
      id: z.number(),
      reviewNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      await database.update(licenseApplications).set({
        status: "approved",
        reviewedBy: ctx.user.id,
        reviewedAt: new Date(),
        reviewNotes: input.reviewNotes,
      }).where(eq(licenseApplications.id, input.id));
      
      // TODO: Generate license
      return { success: true };
    }),
  
  rejectApplication: protectedProcedure
    .input(z.object({ 
      id: z.number(),
      rejectionReason: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      await database.update(licenseApplications).set({
        status: "rejected",
        reviewedBy: ctx.user.id,
        reviewedAt: new Date(),
        rejectionReason: input.rejectionReason,
      }).where(eq(licenseApplications.id, input.id));
      return { success: true };
    }),
  
  getAllLicenses: protectedProcedure.query(async () => {
    return await db.getAllLicenses();
  }),
  
  getLicenseById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getLicenseById(input.id);
    }),
  
  verifyLicense: publicProcedure
    .input(z.object({ licenseNumber: z.string() }))
    .query(async ({ input }) => {
      return await db.getLicenseByNumber(input.licenseNumber);
    }),
  
  getLicenseHistory: protectedProcedure
    .input(z.object({ licenseId: z.number() }))
    .query(async ({ input }) => {
      return await db.getLicenseHistory(input.licenseId);
    }),
  
  renewLicense: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const license = await db.getLicenseById(input.id);
      if (!license) throw new Error("License not found");
      
      const newExpiryDate = new Date(license.expiryDate);
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 3);
      
      await database.update(licenses).set({
        expiryDate: newExpiryDate,
        status: "renewed",
      }).where(eq(licenses.id, input.id));
      
      await database.insert(licenseHistory).values({
        licenseId: input.id,
        eventType: "renewed",
        performedBy: ctx.user.id,
        previousStatus: license.status,
        newStatus: "renewed",
      });
      
      return { success: true, newExpiryDate };
    }),
  
  suspendLicense: protectedProcedure
    .input(z.object({ 
      id: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const license = await db.getLicenseById(input.id);
      if (!license) throw new Error("License not found");
      
      await database.update(licenses).set({
        status: "suspended",
      }).where(eq(licenses.id, input.id));
      
      await database.insert(licenseHistory).values({
        licenseId: input.id,
        eventType: "suspended",
        performedBy: ctx.user.id,
        notes: input.notes,
        previousStatus: license.status,
        newStatus: "suspended",
      });
      
      return { success: true };
    }),
  
  reinstateLicense: protectedProcedure
    .input(z.object({ 
      id: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const license = await db.getLicenseById(input.id);
      if (!license) throw new Error("License not found");
      
      await database.update(licenses).set({
        status: "active",
      }).where(eq(licenses.id, input.id));
      
      await database.insert(licenseHistory).values({
        licenseId: input.id,
        eventType: "reinstated",
        performedBy: ctx.user.id,
        notes: input.notes,
        previousStatus: license.status,
        newStatus: "active",
      });
      
      return { success: true };
    }),
  
  getCpdRecords: protectedProcedure
    .input(z.object({ teacherId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCpdRecords(input.teacherId);
    }),
  
  addCpdRecord: protectedProcedure
    .input(z.object({
      teacherId: z.number(),
      activityName: z.string(),
      activityType: z.string(),
      provider: z.string().optional(),
      hours: z.number(),
      completedAt: z.date(),
      certificateUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(cpdRecords).values(input);
      return { id: result.insertId };
    }),
  
  verifyCpdRecord: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      await database.update(cpdRecords).set({
        verified: true,
        verifiedBy: ctx.user.id,
        verifiedAt: new Date(),
      }).where(eq(cpdRecords.id, input.id));
      return { success: true };
    }),
  
  getAssessmentResults: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .query(async ({ input }) => {
      return await db.getAssessmentResults(input.applicationId);
    }),
  
  addAssessmentResult: protectedProcedure
    .input(z.object({
      applicationId: z.number(),
      assessmentType: z.enum(["subject_specialization", "professional_pedagogical", "combined"]),
      assessmentName: z.string(),
      score: z.number(),
      maxScore: z.number(),
      passingScore: z.number(),
      results: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const passed = input.score >= input.passingScore;
      
      const [result] = await database.insert(assessmentResults).values({
        ...input,
        passed,
      });
      return { id: result.insertId, passed };
    }),
});

// ============================================================================
// CROSS-CUTTING: NOTIFICATIONS, RATINGS, REPORTS
// ============================================================================

const notificationsRouter = router({
  getMyNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserNotifications(ctx.user.id);
  }),
  
  getUnreadNotifications: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUnreadNotifications(ctx.user.id);
  }),
  
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      await database.update(notifications).set({
        isRead: true,
        readAt: new Date(),
      }).where(eq(notifications.id, input.id));
      return { success: true };
    }),
  
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const database = await getDb();
    if (!database) throw new Error("Database not available");
    
    await database.update(notifications).set({
      isRead: true,
      readAt: new Date(),
    }).where(eq(notifications.userId, ctx.user.id));
    return { success: true };
  }),
});

const ratingsRouter = router({
  getRatings: protectedProcedure
    .input(z.object({
      ratableType: z.string(),
      ratableId: z.number(),
    }))
    .query(async ({ input }) => {
      return await db.getRatings(input.ratableType, input.ratableId);
    }),
  
  addRating: protectedProcedure
    .input(z.object({
      ratableType: z.string(),
      ratableId: z.number(),
      rating: z.number(),
      review: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(ratings).values({
        ...input,
        userId: ctx.user.id,
      });
      return { id: result.insertId };
    }),
});

const reportsRouter = router({
  getAllReports: protectedProcedure.query(async () => {
    return await db.getAllReports();
  }),
  
  getReportById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getReportById(input.id);
    }),
  
  generateReport: protectedProcedure
    .input(z.object({
      reportType: z.string(),
      reportName: z.string(),
      module: z.string(),
      parameters: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(reports).values({
        ...input,
        generatedBy: ctx.user.id,
      });
      
      // TODO: Implement actual report generation
      
      return { id: result.insertId };
    }),
});

// ============================================================================
// DEPARTMENTS & POSITIONS
// ============================================================================

const organizationRouter = router({
  getAllDepartments: protectedProcedure.query(async () => {
    return await db.getAllDepartments();
  }),
  
  getDepartmentById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getDepartmentById(input.id);
    }),
  
  createDepartment: protectedProcedure
    .input(z.object({
      name: z.string(),
      parentId: z.number().optional(),
      headId: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(departments).values(input);
      return { id: result.insertId };
    }),
  
  getAllPositions: protectedProcedure.query(async () => {
    return await db.getAllPositions();
  }),
  
  getPositionById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getPositionById(input.id);
    }),
  
  createPosition: protectedProcedure
    .input(z.object({
      title: z.string(),
      departmentId: z.number().optional(),
      level: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const [result] = await database.insert(positions).values(input);
      return { id: result.insertId };
    }),
});

// ============================================================================
// USERS MANAGEMENT
// ============================================================================

const usersRouter = router({
  getAllUsers: protectedProcedure.query(async () => {
    return await db.getAllUsers();
  }),
  
  getUserById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getUserById(input.id);
    }),
  
  updateUser: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      departmentId: z.number().optional(),
      positionId: z.number().optional(),
      managerId: z.number().optional(),
      role: z.enum(["super_admin", "hr_manager", "department_manager", "employee", "licensing_officer", "recruiter"]).optional(),
      status: z.enum(["active", "inactive", "suspended"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateUser(id, data);
      return { success: true };
    }),
});

// ============================================================================
// MAIN APP ROUTER
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  
  // Core modules
  users: usersRouter,
  organization: organizationRouter,
  careerProgression: careerProgressionRouter,
  successionPlanning: successionPlanningRouter,
  workforcePlanning: workforcePlanningRouter,
  employeeEngagement: employeeEngagementRouter,
  recruitment: recruitmentRouter,
  performanceManagement: performanceManagementRouter,
  teachersLicensing: teachersLicensingRouter,
  
  // Cross-cutting features
  notifications: notificationsRouter,
  ratings: ratingsRouter,
  reports: reportsRouter,
  
  // AI Question Bank
  questionBank: questionBankRouter,
  
  // Module 8: Educator's Competency Assessments
  competency: competencyRouter,
  
  // Module 9: Staff Placement & Mobility
  placement: placementRouter,
  
  // Module 10: Psychometric Assessments
  psychometric: psychometricRouter,
  
  // SaaS Multi-tenancy & Marketplace
  saas: saasRouter,
  
  // Infrastructure Services (Storage, Audit, PDF, Excel, Notifications, AI, Payments)
  services: servicesRouter,
  
  // App Catalog
  catalog: catalogRouter,
  
  // Integrations, Gamification & Analytics
  integrations: integrationsRouter,
  
  // Question Management System
  // qms: qmsRouter, // Temporarily disabled due to TypeScript caching issue
  
  // AI Interview Simulation
  aiInterview: aiInterviewRouter,
});

export type AppRouter = typeof appRouter;

// ============================================================================
// AI-POWERED FEATURES
// ============================================================================
import { generateCareerRecommendations, parseResume, analyzeSentiment, matchCandidateToJob, generatePerformanceInsights } from "./ai-services";
import { storagePut } from "./storage";

export const aiRouter = router({
  // Career recommendations
  getCareerRecommendations: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
    }))
    .query(async ({ input }) => {
      // In real implementation, fetch employee data from database
      const recommendations = await generateCareerRecommendations({
        currentPosition: "Teacher",
        skills: ["Mathematics", "Classroom Management", "Curriculum Development"],
        experience: 5,
        interests: ["Educational Leadership", "Curriculum Design"],
        careerGoals: "Become a school principal",
      });
      return recommendations;
    }),

  // Resume parsing
  parseResume: protectedProcedure
    .input(z.object({
      resumeText: z.string(),
    }))
    .mutation(async ({ input }) => {
      const parsedData = await parseResume(input.resumeText);
      return parsedData;
    }),

  // Sentiment analysis
  analyzeSurveyResponses: protectedProcedure
    .input(z.object({
      surveyId: z.number(),
    }))
    .query(async ({ input }) => {
      // In real implementation, fetch survey responses from database
      const analysis = await analyzeSentiment([
        { question: "How satisfied are you with your work environment?", answer: "Very satisfied, great team and supportive management" },
        { question: "What improvements would you suggest?", answer: "More professional development opportunities" },
      ]);
      return analysis;
    }),

  // Candidate matching
  matchCandidate: protectedProcedure
    .input(z.object({
      candidateId: z.number(),
      requisitionId: z.number(),
    }))
    .query(async ({ input }) => {
      // In real implementation, fetch candidate and job data from database
      const match = await matchCandidateToJob({
        jobTitle: "Senior Mathematics Teacher",
        jobDescription: "Teach advanced mathematics to high school students",
        requiredSkills: ["Mathematics", "Pedagogy", "Assessment"],
        candidateProfile: {
          name: "John Doe",
          currentPosition: "Mathematics Teacher",
          skills: ["Mathematics", "Classroom Management", "Technology Integration"],
          experience: 7,
          education: ["Bachelor of Science in Mathematics", "Master of Education"],
        },
      });
      return match;
    }),

  // Performance insights
  getPerformanceInsights: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      cycleId: z.number(),
    }))
    .query(async ({ input }) => {
      // In real implementation, fetch performance data from database
      const insights = await generatePerformanceInsights({
        employeeName: "Jane Smith",
        goals: [
          { title: "Improve student test scores by 15%", progress: 80, status: "on_track" },
          { title: "Complete professional development course", progress: 100, status: "completed" },
        ],
        feedback: [
          "Excellent classroom management skills",
          "Shows great initiative in curriculum development",
        ],
        selfAppraisal: "I have successfully implemented new teaching methods that improved student engagement.",
      });
      return insights;
    }),

  // File upload
  uploadFile: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileContent: z.string(), // base64 encoded
      mimeType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.fileContent, 'base64');
      const fileKey = `${ctx.user.id}/uploads/${Date.now()}-${input.fileName}`;
      const result = await storagePut(fileKey, buffer, input.mimeType);
      return result;
    }),
});
