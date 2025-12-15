/**
 * Integrations Router
 * 
 * Provides endpoints for managing and monitoring system integrations.
 */

import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../_core/trpc';
import { integrationManager } from '../services/integration-manager';
import { qrCodeService } from '../services/qrcode.service';
import { gamificationService } from '../services/gamification.service';
import { predictiveAnalyticsService } from '../services/predictive-analytics.service';

export const integrationsRouter = router({
  // ============================================================
  // INTEGRATION MANAGEMENT
  // ============================================================

  /**
   * Get status of all integrations (admin only)
   */
  getIntegrationStatuses: adminProcedure.query(async () => {
    return {
      statuses: integrationManager.getAllIntegrationStatuses(),
      summary: integrationManager.getSummary(),
    };
  }),

  /**
   * Get status of a specific integration
   */
  getIntegrationStatus: protectedProcedure
    .input(z.object({
      integrationId: z.enum([
        'uaepass', 'examus', 'trustell', 'almanhal', 
        'bayanati', 'payment', 'email', 'sms', 'openai', 'azuread'
      ]),
    }))
    .query(async ({ input }) => {
      return integrationManager.getIntegrationStatus(input.integrationId);
    }),

  // ============================================================
  // QR CODE VERIFICATION
  // ============================================================

  /**
   * Generate QR code for a license
   */
  generateLicenseQR: protectedProcedure
    .input(z.object({
      id: z.number(),
      licenseNumber: z.string(),
      holderName: z.string(),
      issueDate: z.string(),
      expiryDate: z.string().optional(),
      blockchainHash: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return qrCodeService.generateLicenseQRData({
        id: input.id,
        licenseNumber: input.licenseNumber,
        holderName: input.holderName,
        issueDate: new Date(input.issueDate),
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
        blockchainHash: input.blockchainHash,
      });
    }),

  /**
   * Generate QR code for a certificate
   */
  generateCertificateQR: protectedProcedure
    .input(z.object({
      id: z.number(),
      certificateNumber: z.string(),
      holderName: z.string(),
      issueDate: z.string(),
      blockchainHash: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return qrCodeService.generateCertificateQRData({
        id: input.id,
        certificateNumber: input.certificateNumber,
        holderName: input.holderName,
        issueDate: new Date(input.issueDate),
        blockchainHash: input.blockchainHash,
      });
    }),

  /**
   * Verify a QR code
   */
  verifyQRCode: protectedProcedure
    .input(z.object({
      type: z.enum(['license', 'certificate', 'credential']),
      id: z.string(),
      verificationCode: z.string(),
    }))
    .query(async ({ input }) => {
      return qrCodeService.verifyQRCode(input);
    }),

  // ============================================================
  // GAMIFICATION
  // ============================================================

  /**
   * Get all available badges
   */
  getAllBadges: protectedProcedure.query(async () => {
    return gamificationService.getAllBadges();
  }),

  /**
   * Get badges by category
   */
  getBadgesByCategory: protectedProcedure
    .input(z.object({
      category: z.enum(['learning', 'engagement', 'performance', 'leadership', 'special']),
    }))
    .query(async ({ input }) => {
      return gamificationService.getBadgesByCategory(input.category);
    }),

  /**
   * Award points to a user
   */
  awardPoints: protectedProcedure
    .input(z.object({
      activity: z.enum([
        'course_completed', 'course_started', 'assessment_passed',
        'cpd_hour', 'learning_day', 'survey_completed', 'feedback_given',
        'feedback_received', 'team_activity', 'event_attended',
        'goal_set', 'goal_completed', 'goal_milestone', 'self_appraisal',
        'review_completed', 'license_obtained', 'certification_earned',
        'promotion', 'recognition_received'
      ]),
      multiplier: z.number().optional(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return gamificationService.awardPoints({
        userId: ctx.user.id,
        activity: input.activity,
        multiplier: input.multiplier,
        reason: input.reason,
      });
    }),

  /**
   * Get leaderboard
   */
  getLeaderboard: protectedProcedure
    .input(z.object({
      timeframe: z.enum(['week', 'month', 'year', 'all_time']).default('month'),
      department: z.string().optional(),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ input }) => {
      return gamificationService.getLeaderboard({
        timeframe: input.timeframe,
        department: input.department,
        limit: input.limit,
      });
    }),

  /**
   * Get user gamification stats
   */
  getUserStats: protectedProcedure
    .input(z.object({
      userId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = input.userId || ctx.user.id;
      return gamificationService.getUserStats(userId);
    }),

  /**
   * Check badge eligibility based on user metrics
   */
  checkBadgeEligibility: protectedProcedure
    .input(z.object({
      metrics: z.record(z.string(), z.number()),
    }))
    .query(async ({ ctx, input }) => {
      return gamificationService.checkBadgeEligibility(ctx.user.id, input.metrics);
    }),

  // ============================================================
  // PREDICTIVE ANALYTICS
  // ============================================================

  /**
   * Predict employee turnover risk
   */
  predictTurnover: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      tenure: z.number(),
      recentPerformanceRating: z.number(),
      engagementScore: z.number(),
      lastPromotion: z.string().optional(),
      salaryCompetitiveness: z.number(),
      managerRelationshipScore: z.number(),
      recentFeedbackSentiment: z.enum(['positive', 'neutral', 'negative']),
    }))
    .query(async ({ input }) => {
      return predictiveAnalyticsService.predictTurnover({
        ...input,
        lastPromotion: input.lastPromotion ? new Date(input.lastPromotion) : undefined,
      });
    }),

  /**
   * Forecast future performance
   */
  forecastPerformance: protectedProcedure
    .input(z.object({
      employeeId: z.number(),
      historicalRatings: z.array(z.object({
        period: z.string(),
        rating: z.number(),
      })),
      recentTrainingHours: z.number(),
      goalCompletionRate: z.number(),
      feedbackScores: z.array(z.number()),
    }))
    .query(async ({ input }) => {
      return predictiveAnalyticsService.forecastPerformance(input);
    }),

  /**
   * Analyze skills gaps
   */
  analyzeSkillsGap: protectedProcedure
    .input(z.object({
      currentSkills: z.array(z.object({
        skillId: z.number(),
        skillName: z.string(),
        level: z.number(),
      })),
      requiredSkills: z.array(z.object({
        skillId: z.number(),
        skillName: z.string(),
        requiredLevel: z.number(),
      })),
      departmentId: z.number().optional(),
      roleId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      return predictiveAnalyticsService.analyzeSkillsGap(input);
    }),

  /**
   * Forecast workforce demand
   */
  forecastWorkforceDemand: protectedProcedure
    .input(z.object({
      scenarioId: z.number(),
      scenarioType: z.enum(['growth', 'restructuring', 'reduction', 'baseline']),
      growthRate: z.number(),
      timeframeMonths: z.number(),
      departments: z.array(z.object({
        departmentId: z.number(),
        departmentName: z.string(),
        currentHeadcount: z.number(),
        attritionRate: z.number(),
      })),
    }))
    .query(async ({ input }) => {
      return predictiveAnalyticsService.forecastWorkforceDemand(input);
    }),

  /**
   * Assess engagement risk
   */
  assessEngagementRisk: protectedProcedure
    .input(z.object({
      scope: z.enum(['organization', 'department', 'team']),
      scopeId: z.number().optional(),
      engagementScores: z.array(z.object({
        employeeId: z.number(),
        score: z.number(),
      })),
      surveyParticipationRate: z.number(),
      recentTurnover: z.number(),
      averageTenure: z.number(),
    }))
    .query(async ({ input }) => {
      return predictiveAnalyticsService.assessEngagementRisk(input);
    }),

  /**
   * Get AI-powered insights
   */
  getAIInsights: protectedProcedure
    .input(z.object({
      context: z.string(),
      question: z.string(),
    }))
    .query(async ({ input }) => {
      return predictiveAnalyticsService.getAIInsights(input.context, input.question);
    }),
});
