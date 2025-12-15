/**
 * tRPC Router for Marketplace & Tenant Management
 * 
 * Exposes APIs for tenant management, subscription handling,
 * compliance features, and marketplace integration.
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure, adminProcedure } from "../_core/trpc";
import { tenantService } from "../services/tenant.service";
import { trialService } from "../services/trial.service";
import { emailService } from "../services/email.service";
import { demoDataSeeder } from "../services/demo-data.service";
import { 
  generateComplianceReport,
  recordConsent,
  revokeConsent,
  hasRequiredConsents,
  createDataSubjectRequest,
  getOverdueDSARs,
  setRetentionPolicy,
  CONSENT_TYPES,
  DEFAULT_RETENTION_PERIODS,
  TDRA_COMPLIANCE_DISCLAIMER,
} from "../compliance/tdra-compliance";
import { trackUsage, METERING_DIMENSIONS } from "../marketplace/azure-marketplace";
import { TRPCError } from "@trpc/server";

// ============================================================================
// TENANT MANAGEMENT ROUTER
// ============================================================================

export const tenantRouter = router({
  /**
   * Get current tenant information
   */
  getCurrentTenant: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      return null;
    }
    return tenantService.getTenantById(ctx.tenantId);
  }),

  /**
   * Get tenant by code
   */
  getByCode: protectedProcedure
    .input(z.object({ tenantCode: z.string() }))
    .query(async ({ input }) => {
      return tenantService.getTenantByCode(input.tenantCode);
    }),

  /**
   * Update tenant settings
   */
  updateSettings: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      displayName: z.string().optional(),
      primaryEmail: z.string().email().optional(),
      billingEmail: z.string().email().optional(),
      phone: z.string().optional(),
      emirate: z.string().optional(),
      city: z.string().optional(),
      address: z.string().optional(),
      poBox: z.string().optional(),
      logoUrl: z.string().url().optional(),
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      defaultLanguage: z.enum(["en", "ar"]).optional(),
      timezone: z.string().optional(),
      dateFormat: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      // TODO: Implement tenant update
      // For now, log the audit event
      await tenantService.logAuditEvent(ctx.tenantId, ctx.user.id, {
        action: "tenant.settings_updated",
        resourceType: "tenant",
        resourceId: String(ctx.tenantId),
        newState: input,
        severity: "info",
      });

      return { success: true };
    }),

  /**
   * Get current subscription
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      return null;
    }
    return tenantService.getActiveSubscription(ctx.tenantId);
  }),

  /**
   * Get tenant usage statistics
   */
  getUsageStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      return null;
    }
    return tenantService.getTenantStats(ctx.tenantId);
  }),

  /**
   * Check if a feature/module is enabled
   */
  isFeatureEnabled: protectedProcedure
    .input(z.object({ featureCode: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        return false;
      }
      return tenantService.isFeatureEnabled(ctx.tenantId, input.featureCode);
    }),

  /**
   * Get audit log
   */
  getAuditLog: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      action: z.string().optional(),
      resourceType: z.string().optional(),
      severity: z.enum(["info", "warning", "critical"]).optional(),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        return { items: [], total: 0 };
      }

      // TODO: Implement audit log query
      return { items: [], total: 0 };
    }),
});

// ============================================================================
// COMPLIANCE ROUTER
// ============================================================================

export const complianceRouter = router({
  /**
   * Get TDRA compliance disclaimer
   */
  getDisclaimer: publicProcedure.query(() => {
    return { disclaimer: TDRA_COMPLIANCE_DISCLAIMER };
  }),

  /**
   * Get compliance report for current tenant
   */
  getComplianceReport: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
    }
    return generateComplianceReport(ctx.tenantId);
  }),

  /**
   * Record user consent
   */
  recordConsent: protectedProcedure
    .input(z.object({
      consentType: z.enum([
        "TERMS_OF_SERVICE",
        "PRIVACY_POLICY",
        "DATA_PROCESSING",
        "MARKETING_COMMUNICATIONS",
        "DATA_SHARING",
        "BIOMETRIC_DATA",
        "PERFORMANCE_TRACKING",
      ]),
      version: z.string(),
      consentGiven: z.boolean(),
      consentText: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      await recordConsent({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        consentType: input.consentType,
        version: input.version,
        consentGiven: input.consentGiven,
        consentText: input.consentText,
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.get("user-agent"),
      });

      return { success: true };
    }),

  /**
   * Revoke a consent
   */
  revokeConsent: protectedProcedure
    .input(z.object({
      consentType: z.enum([
        "TERMS_OF_SERVICE",
        "PRIVACY_POLICY",
        "DATA_PROCESSING",
        "MARKETING_COMMUNICATIONS",
        "DATA_SHARING",
        "BIOMETRIC_DATA",
        "PERFORMANCE_TRACKING",
      ]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      await revokeConsent({
        tenantId: ctx.tenantId,
        userId: ctx.user.id,
        consentType: input.consentType,
        ipAddress: ctx.req.ip,
        userAgent: ctx.req.get("user-agent"),
      });

      return { success: true };
    }),

  /**
   * Check if user has required consents
   */
  checkRequiredConsents: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      return { hasAll: false, missing: [] };
    }
    return hasRequiredConsents(ctx.tenantId, ctx.user.id);
  }),

  /**
   * Submit a data subject access request
   */
  submitDataRequest: protectedProcedure
    .input(z.object({
      requestType: z.enum([
        "access",
        "rectification",
        "erasure",
        "portability",
        "restriction",
        "objection",
      ]),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      const requestId = await createDataSubjectRequest({
        tenantId: ctx.tenantId,
        requesterId: ctx.user.id,
        requestType: input.requestType,
        description: input.description,
      });

      return { requestId };
    }),

  /**
   * Get overdue data subject requests (admin only)
   */
  getOverdueRequests: adminProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      return [];
    }
    return getOverdueDSARs(ctx.tenantId);
  }),

  /**
   * Set data retention policy (admin only)
   */
  setRetentionPolicy: adminProcedure
    .input(z.object({
      dataCategory: z.string(),
      retentionDays: z.number().min(1),
      autoDelete: z.boolean().default(false),
      archiveBeforeDelete: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      await setRetentionPolicy({
        tenantId: ctx.tenantId,
        ...input,
      });

      return { success: true };
    }),

  /**
   * Get default retention periods
   */
  getDefaultRetentionPeriods: publicProcedure.query(() => {
    return DEFAULT_RETENTION_PERIODS;
  }),
});

// ============================================================================
// BILLING & METERING ROUTER
// ============================================================================

export const billingRouter = router({
  /**
   * Get available metering dimensions
   */
  getMeteringDimensions: publicProcedure.query(() => {
    return METERING_DIMENSIONS;
  }),

  /**
   * Track usage event (internal use)
   */
  trackUsage: protectedProcedure
    .input(z.object({
      dimension: z.enum([
        "ACTIVE_USERS",
        "STORAGE_GB",
        "API_CALLS",
        "AI_REQUESTS",
        "LICENSE_VERIFICATIONS",
      ]),
      quantity: z.number().min(0),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      const subscription = await tenantService.getActiveSubscription(
        ctx.tenantId
      );

      if (!subscription) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No active subscription",
        });
      }

      await trackUsage(
        ctx.tenantId,
        subscription.id,
        input.dimension,
        input.quantity
      );

      return { success: true };
    }),
});

// ============================================================================
// COMBINED SAAS ROUTER
// ============================================================================

export const saasRouter = router({
  tenant: tenantRouter,
  compliance: complianceRouter,
  billing: billingRouter,

  /**
   * Get trial status for current user/tenant
   */
  getTrialStatus: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      return {
        status: "cancelled" as const,
        trialDaysRemaining: null,
        trialEndsAt: null,
        canAccessFeatures: false,
        showUpgradePrompt: false,
      };
    }
    return trialService.getTrialStatus(ctx.tenantId);
  }),

  /**
   * Self-signup for new trial accounts
   */
  selfSignup: publicProcedure
    .input(z.object({
      organizationName: z.string().min(2).max(200),
      email: z.string().email(),
      firstName: z.string().min(1).max(100),
      lastName: z.string().min(1).max(100),
      phoneNumber: z.string().optional(),
      emirate: z.string().optional(),
      password: z.string().min(8),
      agreeToMarketing: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      // Check if email already exists
      // For now, we'll create the tenant and user

      // Create tenant
      const tenant = await tenantService.createTenant({
        name: input.organizationName,
        primaryEmail: input.email,
        emirate: input.emirate,
        country: "AE",
      });

      if (!tenant) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organization",
        });
      }

      // Seed demo data
      const seedResult = await demoDataSeeder.seedTenantData(tenant.id);
      
      // Send welcome email
      const baseUrl = process.env.APP_URL || process.env.VITE_APP_URL || "http://localhost:3000";
      await emailService.sendWelcome(
        input.email,
        `${input.firstName} ${input.lastName}`,
        input.organizationName,
        baseUrl
      );

      // Log the signup
      await tenantService.logAuditEvent(tenant.id, null, {
        action: "tenant.self_signup",
        resourceType: "tenant",
        resourceId: String(tenant.id),
        severity: "info",
        metadata: {
          email: input.email,
          demoDataSeeded: seedResult.success,
        },
      });

      return {
        success: true,
        tenantCode: tenant.tenantCode,
        tenantId: tenant.id,
        trialEndsAt: tenant.trialEndsAt,
      };
    }),

  /**
   * Initiate a subscription (redirects to checkout)
   */
  initiateSubscription: protectedProcedure
    .input(z.object({
      planId: z.string(),
      billingCycle: z.enum(["monthly", "annual"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tenant context" });
      }

      // Log the intent
      await tenantService.logAuditEvent(ctx.tenantId, ctx.user.id, {
        action: "subscription.initiated",
        resourceType: "subscription",
        severity: "info",
        metadata: {
          planId: input.planId,
          billingCycle: input.billingCycle,
        },
      });

      // In production, this would:
      // 1. Create a Stripe checkout session, or
      // 2. Redirect to Azure Marketplace purchase flow
      
      // For now, return a placeholder
      const baseUrl = process.env.APP_URL || process.env.VITE_APP_URL || "http://localhost:3000";
      
      // If Azure Marketplace is configured, redirect there
      if (process.env.AZURE_MARKETPLACE_OFFER_ID) {
        return {
          checkoutUrl: `https://azuremarketplace.microsoft.com/en-us/marketplace/apps/${process.env.AZURE_MARKETPLACE_OFFER_ID}`,
          provider: "azure",
        };
      }

      // Otherwise, this would be Stripe or custom checkout
      return {
        checkoutUrl: `${baseUrl}/checkout?plan=${input.planId}&cycle=${input.billingCycle}`,
        provider: "stripe",
      };
    }),

  /**
   * Get available subscription plans
   */
  getPlans: publicProcedure.query(async () => {
    // Return hardcoded plans for now
    // In production, these would come from database
    return [
      {
        id: "starter",
        name: "Starter",
        monthlyPrice: 499,
        annualPrice: 4990,
        currency: "AED",
        maxUsers: 50,
        maxDepartments: 5,
        modules: ["career_progression", "performance_management", "employee_engagement"],
      },
      {
        id: "professional",
        name: "Professional",
        monthlyPrice: 1499,
        annualPrice: 14990,
        currency: "AED",
        maxUsers: 200,
        maxDepartments: 20,
        modules: ["career_progression", "performance_management", "employee_engagement", "teachers_licensing", "workforce_planning", "succession_planning", "recruitment"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyPrice: 4999,
        annualPrice: 49990,
        currency: "AED",
        maxUsers: -1, // Unlimited
        maxDepartments: -1, // Unlimited
        modules: ["all"],
      },
    ];
  }),
});

export type SaasRouter = typeof saasRouter;
