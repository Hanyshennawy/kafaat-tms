/**
 * Services Router
 * 
 * Exposes all the new infrastructure services via tRPC:
 * - Storage (file uploads)
 * - Audit (logging)
 * - Notifications
 * - AI (resume parsing, recommendations) - NOW USING AI ROUTER
 * - Payments (Stripe subscriptions)
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { storageService } from "../services/storage.service";
import { auditService, AuditAction } from "../services/audit.service";
import { notificationService } from "../services/notification.service";
import { aiService } from "../services/ai.service"; // Keep for backward compatibility
import { aiRouterService } from "../services/ai-router.service"; // NEW: Smart routing
import { paymentService } from "../services/payment.service";

export const servicesRouter = router({
  // ============================================================================
  // STORAGE ENDPOINTS
  // ============================================================================
  
  storage: router({
    /**
     * Upload a file (base64 encoded)
     */
    upload: protectedProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        mimeType: z.string(),
        category: z.enum(["resume", "certificate", "license_document", "profile_photo", "evidence", "report", "import", "export", "attachment"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await storageService.uploadBase64(
          input.base64,
          input.filename,
          input.mimeType,
          {
            category: input.category,
            userId: ctx.user?.id || 0,
            tenantId: ctx.tenantId,
          }
        );
        
        await auditService.success("file.created", {
          tenantId: ctx.tenantId,
          userId: ctx.user?.id,
          entityType: "file",
          entityId: result.key,
          details: { category: input.category, filename: input.filename },
        });
        
        return result;
      }),
    
    /**
     * Get download URL for a file
     */
    getDownloadUrl: protectedProcedure
      .input(z.object({
        key: z.string(),
      }))
      .query(async ({ input }) => {
        return await storageService.getDownloadUrl(input.key);
      }),
    
    /**
     * Delete a file
     */
    delete: protectedProcedure
      .input(z.object({
        key: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await storageService.delete(input.key);
        
        await auditService.success("file.deleted", {
          tenantId: ctx.tenantId,
          userId: ctx.user?.id,
          entityType: "file",
          entityId: input.key,
        });
        
        return { success: true };
      }),
  }),
  
  // ============================================================================
  // AUDIT ENDPOINTS
  // ============================================================================
  
  audit: router({
    /**
     * Query audit logs
     */
    query: protectedProcedure
      .input(z.object({
        tenantId: z.number().optional(),
        userId: z.number().optional(),
        action: z.string().optional(),
        entityType: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        return await auditService.query({
          tenantId: input.tenantId || ctx.tenantId,
          userId: input.userId,
          action: input.action as AuditAction | undefined,
          entityType: input.entityType,
          startDate: input.startDate,
          endDate: input.endDate,
          limit: input.limit,
          offset: input.offset,
        });
      }),
    
    /**
     * Get security events
     */
    getSecurityEvents: protectedProcedure
      .input(z.object({
        days: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        return await auditService.getSecurityEvents(ctx.tenantId, input.days);
      }),
    
    /**
     * Get compliance report
     */
    getComplianceReport: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input, ctx }) => {
        return await auditService.getComplianceReport(
          ctx.tenantId,
          input.startDate,
          input.endDate
        );
      }),
  }),
  
  // ============================================================================
  // NOTIFICATIONS ENDPOINTS
  // ============================================================================
  
  notifications: router({
    /**
     * Get notifications for current user
     */
    list: protectedProcedure
      .input(z.object({
        unreadOnly: z.boolean().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        return notificationService.getNotifications(
          ctx.user?.id || 0,
          { unreadOnly: input.unreadOnly, limit: input.limit }
        );
      }),
    
    /**
     * Get unread count
     */
    unreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        const result = notificationService.getNotifications(ctx.user?.id || 0, {});
        return result.unreadCount;
      }),
    
    /**
     * Mark notification as read
     */
    markAsRead: protectedProcedure
      .input(z.object({
        id: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        return notificationService.markAsRead(ctx.user?.id || 0, input.id);
      }),
    
    /**
     * Mark all as read
     */
    markAllAsRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        return notificationService.markAllAsRead(ctx.user?.id || 0);
      }),
    
    /**
     * Get notification preferences
     */
    getPreferences: protectedProcedure
      .query(async ({ ctx }) => {
        return notificationService.getPreferences(ctx.user?.id || 0);
      }),
    
    /**
     * Update notification preferences
     */
    updatePreferences: protectedProcedure
      .input(z.object({
        email: z.record(z.string(), z.boolean()).optional(),
        inApp: z.record(z.string(), z.boolean()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return notificationService.setPreferences(ctx.user?.id || 0, input as any);
      }),
  }),
  
  // ============================================================================
  // AI ENDPOINTS (Using Smart Router for Cost Optimization)
  // ============================================================================
  
  ai: router({
    /**
     * Parse a resume (Now uses Together.ai via router)
     */
    parseResume: protectedProcedure
      .input(z.object({
        resumeText: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await aiRouterService.parseResume(input.resumeText, ctx.tenantId);
      }),
    
    /**
     * Get career recommendations (Now uses template service via router)
     */
    getCareerRecommendations: protectedProcedure
      .input(z.object({
        currentRole: z.string(),
        skills: z.array(z.string()),
        experience: z.number(),
        interests: z.array(z.string()),
        performanceRating: z.number(),
        availableRoles: z.array(z.string()),
      }))
      .mutation(async ({ input, ctx }) => {
        return await aiRouterService.getCareerRecommendations(
          input.currentRole,
          input.experience,
          input.skills,
          input.interests,
          ctx.tenantId
        );
      }),
    
    /**
     * Analyze sentiment in survey responses (Now uses template service via router)
     */
    analyzeSentiment: protectedProcedure
      .input(z.object({
        responses: z.array(z.string()),
        context: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await aiRouterService.analyzeSentiment(
          input.responses,
          input.context,
          ctx.tenantId
        );
      }),
    
    /**
     * Predict performance (Now uses template service via router)
     */
    predictPerformance: protectedProcedure
      .input(z.object({
        historicalRatings: z.array(z.number()),
        attendanceRate: z.number(),
        trainingCompleted: z.number(),
        projectsCompleted: z.number(),
        peersAverageRating: z.number(),
        tenure: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const data = {
          previousRatings: input.historicalRatings,
          trainingCompleted: input.trainingCompleted,
          attendanceRate: input.attendanceRate,
          projectsCompleted: input.projectsCompleted,
          yearsExperience: input.tenure,
        };
        return await aiRouterService.predictPerformance(data, ctx.tenantId);
      }),
    
    /**
     * Analyze skills gap (Now uses Together.ai via router)
     */
    analyzeSkillsGap: protectedProcedure
      .input(z.object({
        currentSkills: z.array(z.object({
          name: z.string(),
          level: z.number(),
        })),
        targetRole: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await aiRouterService.analyzeSkillsGap(
          input.currentSkills,
          input.targetRole,
          ctx.tenantId
        );
      }),
    
    /**
     * Generate interview questions (Now uses Together.ai via router)
     */
    generateInterviewQuestions: protectedProcedure
      .input(z.object({
        role: z.string(),
        competencies: z.array(z.string()),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        count: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await aiRouterService.generateInterviewQuestions(
          input.role,
          input.competencies,
          input.difficulty,
          input.count,
          ctx.tenantId
        );
      }),
    
    /**
     * Generate job description (Now uses Together.ai via router)
     */
    generateJobDescription: protectedProcedure
      .input(z.object({
        role: z.string(),
        department: z.string(),
        requirements: z.array(z.string()),
        responsibilities: z.array(z.string()),
      }))
      .mutation(async ({ input, ctx }) => {
        return await aiRouterService.generateJobDescription(
          input.role,
          input.department,
          input.requirements,
          input.responsibilities,
          ctx.tenantId
        );
      }),
    
    /**
     * Generate AI-powered psychometric assessment questions
     * Uses Together.ai for intelligent, scientifically valid assessment items
     */
    generatePsychometricQuestions: protectedProcedure
      .input(z.object({
        testType: z.enum(["personality", "eq", "teaching-style", "leadership", "cognitive", "big5", "emotional_intelligence"]),
        dimension: z.string(),
        count: z.number().min(5).max(50).default(10),
      }))
      .mutation(async ({ input }) => {
        return await aiRouterService.generatePsychometricQuestions(
          input.testType,
          input.dimension,
          input.count
        );
      }),
    
    /**
     * Generate AI-powered competency assessment questions
     * Generates questions aligned with UAE MOE competency frameworks
     */
    generateCompetencyQuestions: protectedProcedure
      .input(z.object({
        competencyArea: z.string(),
        level: z.enum(["foundation", "intermediate", "advanced", "expert"]),
        jobRole: z.string().optional(),
        count: z.number().min(5).max(30).default(10),
      }))
      .mutation(async ({ input }) => {
        // Use the licensing questions generator adapted for competency assessments
        return await aiRouterService.generateLicensingQuestions(
          input.jobRole || "Educator",
          input.level,
          input.competencyArea,
          input.level,
          "scenario", // Use scenario-based questions for competency
          input.count
        );
      }),
    
    /**
     * Test AI connection and get provider status
     */
    testConnection: protectedProcedure
      .query(async () => {
        return await aiRouterService.testConnection();
      }),
  }),
  
  // ============================================================================
  // PAYMENTS ENDPOINTS
  // ============================================================================
  
  payments: router({
    /**
     * Get pricing plans
     */
    getPricingPlans: publicProcedure
      .query(async () => {
        return paymentService.getPricingPlans();
      }),
    
    /**
     * Get current subscription
     */
    getSubscription: protectedProcedure
      .query(async ({ ctx }) => {
        return paymentService.getSubscription(ctx.tenantId);
      }),
    
    /**
     * Create checkout session
     */
    createCheckoutSession: protectedProcedure
      .input(z.object({
        planId: z.string(),
        billingPeriod: z.enum(["monthly", "annual"]),
        successUrl: z.string(),
        cancelUrl: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await paymentService.createCheckoutSession({
          tenantId: ctx.tenantId,
          planId: input.planId,
          billingPeriod: input.billingPeriod,
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
          customerEmail: ctx.user?.email || undefined,
        });
      }),
    
    /**
     * Create customer portal session
     */
    createPortalSession: protectedProcedure
      .input(z.object({
        returnUrl: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await paymentService.createPortalSession({
          tenantId: ctx.tenantId,
          returnUrl: input.returnUrl,
        });
      }),
    
    /**
     * Get invoices
     */
    getInvoices: protectedProcedure
      .query(async ({ ctx }) => {
        return paymentService.getInvoices(ctx.tenantId);
      }),
    
    /**
     * Check feature access
     */
    hasFeatureAccess: protectedProcedure
      .input(z.object({
        feature: z.string(),
      }))
      .query(async ({ input, ctx }) => {
        return paymentService.hasFeatureAccess(ctx.tenantId, input.feature);
      }),
    
    /**
     * Check usage limit
     */
    checkUsageLimit: protectedProcedure
      .input(z.object({
        metric: z.enum(["users", "departments", "storage", "apiCalls"]),
        currentUsage: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        return paymentService.checkUsageLimit(
          ctx.tenantId,
          input.metric,
          input.currentUsage
        );
      }),
    
    /**
     * Cancel subscription
     */
    cancelSubscription: protectedProcedure
      .input(z.object({
        immediately: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await paymentService.cancelSubscription(
          ctx.tenantId,
          input.immediately
        );
      }),
    
    /**
     * Reactivate subscription
     */
    reactivateSubscription: protectedProcedure
      .mutation(async ({ ctx }) => {
        return await paymentService.reactivateSubscription(ctx.tenantId);
      }),
    
    /**
     * Get Stripe publishable key
     */
    getPublishableKey: publicProcedure
      .query(async () => {
        return paymentService.getPublishableKey();
      }),
  }),
});
