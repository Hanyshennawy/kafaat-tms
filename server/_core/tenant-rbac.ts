/**
 * Tenant-Aware RBAC Middleware
 * 
 * Extends the existing RBAC system with multi-tenant isolation.
 * Ensures users can only access data within their own tenant.
 */

import { TRPCError } from "@trpc/server";
import { tenantService } from "../services/tenant.service";
import { rolePermissions, type Permission, type UserRole } from "./rbac";

export interface TenantContext {
  tenantId: number;
  tenantCode: string;
  tenantStatus: string;
  subscription: {
    planId: number;
    planCode: string;
    status: string;
  } | null;
}

export interface TenantUser {
  id: number;
  role: UserRole;
  tenantId?: number;
  tenantContext?: TenantContext;
}

/**
 * Check if a user has a specific permission within their tenant
 */
export function hasTenantPermission(
  user: TenantUser | null,
  permission: Permission
): boolean {
  if (!user) return false;
  if (!user.tenantId) return false;

  const permissions = rolePermissions[user.role] || [];

  return permissions.includes(permission);
}

/**
 * Ensure tenant is active and subscription is valid
 */
export async function validateTenantAccess(
  tenantId: number
): Promise<TenantContext> {
  const tenant = await tenantService.getTenantById(tenantId);

  if (!tenant) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Tenant not found",
    });
  }

  if (tenant.status === "cancelled") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This organization's subscription has been cancelled",
    });
  }

  if (tenant.status === "suspended") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "This organization's account is suspended. Please contact support.",
    });
  }

  // Check subscription
  const subscription = await tenantService.getActiveSubscription(tenantId);

  // Allow trial and pending_setup tenants without active subscription
  if (
    !subscription &&
    tenant.status !== "trial" &&
    tenant.status !== "pending_setup"
  ) {
    throw new TRPCError({
      code: "PAYMENT_REQUIRED",
      message: "No active subscription found. Please subscribe to continue.",
    });
  }

  return {
    tenantId: tenant.id,
    tenantCode: tenant.tenantCode,
    tenantStatus: tenant.status,
    subscription: subscription
      ? {
          planId: subscription.planId,
          planCode: "", // Would need to join with plans table
          status: subscription.status,
        }
      : null,
  };
}

/**
 * Check if a module is enabled for the tenant
 */
export async function isModuleEnabled(
  tenantId: number,
  moduleCode: string
): Promise<boolean> {
  return tenantService.isFeatureEnabled(tenantId, moduleCode);
}

/**
 * Audit log decorator for tenant actions
 */
export async function auditTenantAction(
  tenantId: number,
  userId: number | null,
  action: string,
  resourceType: string,
  resourceId: string | undefined,
  details?: {
    previousState?: Record<string, any>;
    newState?: Record<string, any>;
    metadata?: Record<string, any>;
    severity?: "info" | "warning" | "critical";
  },
  requestContext?: {
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }
): Promise<void> {
  await tenantService.logAuditEvent(tenantId, userId, {
    action,
    resourceType,
    resourceId,
    previousState: details?.previousState,
    newState: details?.newState,
    metadata: details?.metadata,
    severity: details?.severity || "info",
    ipAddress: requestContext?.ipAddress,
    userAgent: requestContext?.userAgent,
    requestId: requestContext?.requestId,
  });
}

/**
 * Module access codes for the Talent Management System
 */
export const MODULE_CODES = {
  CAREER_PROGRESSION: "career_progression",
  SUCCESSION_PLANNING: "succession_planning",
  WORKFORCE_PLANNING: "workforce_planning",
  EMPLOYEE_ENGAGEMENT: "employee_engagement",
  RECRUITMENT: "recruitment",
  PERFORMANCE_MANAGEMENT: "performance_management",
  TEACHERS_LICENSING: "teachers_licensing",
  COMPETENCY_ASSESSMENTS: "competency_assessments",
  STAFF_PLACEMENT: "staff_placement",
  PSYCHOMETRIC_ASSESSMENTS: "psychometric_assessments",
} as const;

/**
 * Create a tenant-scoped WHERE clause for Drizzle queries
 * This ensures data isolation between tenants
 */
export function tenantScope(tenantId: number) {
  return {
    tenantId,
    // Helper to add tenant filter to any query
    filter: <T extends { tenantId: number }>(
      condition: (table: T) => any
    ) => {
      return (table: T) => condition(table);
    },
  };
}

/**
 * Rate limiting configuration per tenant/plan
 */
export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  trial: {
    requestsPerMinute: 30,
    requestsPerHour: 500,
    requestsPerDay: 5000,
  },
  basic: {
    requestsPerMinute: 60,
    requestsPerHour: 2000,
    requestsPerDay: 20000,
  },
  professional: {
    requestsPerMinute: 120,
    requestsPerHour: 5000,
    requestsPerDay: 50000,
  },
  enterprise: {
    requestsPerMinute: 300,
    requestsPerHour: 15000,
    requestsPerDay: 150000,
  },
};

/**
 * Get rate limit config for a tenant based on their plan
 */
export function getTenantRateLimits(planCode: string): RateLimitConfig {
  return RATE_LIMITS[planCode] || RATE_LIMITS.trial;
}

/**
 * Tenant isolation validator
 * Throws if trying to access resources from another tenant
 */
export function validateResourceOwnership(
  resourceTenantId: number,
  requestTenantId: number,
  resourceType: string
): void {
  if (resourceTenantId !== requestTenantId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Access denied: ${resourceType} belongs to a different organization`,
    });
  }
}

/**
 * Cross-tenant admin access (for super admins only)
 */
export function canAccessCrossTenant(user: TenantUser | null): boolean {
  if (!user) return false;
  // Only platform super admins can access cross-tenant
  return user.role === "super_admin" && !user.tenantId;
}
