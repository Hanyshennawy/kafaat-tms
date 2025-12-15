import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import {
  tenants,
  tenantSubscriptions,
  subscriptionPlans,
  tenantFeatures,
  usageMetering,
  tenantAuditLogs,
  type Tenant,
  type InsertTenant,
  type TenantSubscription,
  type InsertTenantSubscription,
} from "../../drizzle/schema-pg";
import { nanoid } from "nanoid";

/**
 * Tenant Management Service
 * Handles all tenant lifecycle operations for multi-tenant SaaS
 */
export class TenantService {
  /**
   * Create a new tenant (typically from Marketplace webhook or self-signup)
   */
  async createTenant(data: {
    name: string;
    primaryEmail: string;
    azureSubscriptionId?: string;
    azureTenantId?: string;
    marketplacePurchaseToken?: string;
    marketplacePlanId?: string;
    marketplaceOfferId?: string;
    country?: string;
    emirate?: string;
  }): Promise<Tenant | null> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const tenantCode = `tenant_${nanoid(16)}`;

    const [result] = await db.insert(tenants).values({
      tenantCode,
      name: data.name,
      primaryEmail: data.primaryEmail,
      azureSubscriptionId: data.azureSubscriptionId,
      azureTenantId: data.azureTenantId,
      marketplacePurchaseToken: data.marketplacePurchaseToken,
      marketplacePlanId: data.marketplacePlanId,
      marketplaceOfferId: data.marketplaceOfferId,
      country: data.country || "AE",
      emirate: data.emirate,
      status: data.marketplacePurchaseToken ? "pending_setup" : "trial",
      trialEndsAt: data.marketplacePurchaseToken
        ? null
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
    }).returning({ id: tenants.id });

    return this.getTenantById(result.id);
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(id: number): Promise<Tenant | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get tenant by tenant code
   */
  async getTenantByCode(tenantCode: string): Promise<Tenant | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(tenants)
      .where(eq(tenants.tenantCode, tenantCode))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get tenant by Azure subscription ID (for Marketplace webhooks)
   */
  async getTenantByAzureSubscription(
    azureSubscriptionId: string
  ): Promise<Tenant | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(tenants)
      .where(eq(tenants.azureSubscriptionId, azureSubscriptionId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Activate a tenant (after Marketplace subscription activation)
   */
  async activateTenant(tenantId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(tenants)
      .set({
        status: "active",
        activatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    await this.logAuditEvent(tenantId, null, {
      action: "tenant.activated",
      resourceType: "tenant",
      resourceId: String(tenantId),
      severity: "info",
    });
  }

  /**
   * Suspend a tenant (e.g., payment failure)
   */
  async suspendTenant(tenantId: number, reason?: string): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(tenants)
      .set({
        status: "suspended",
        suspendedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    await this.logAuditEvent(tenantId, null, {
      action: "tenant.suspended",
      resourceType: "tenant",
      resourceId: String(tenantId),
      severity: "critical",
      metadata: { reason },
    });
  }

  /**
   * Cancel a tenant subscription
   */
  async cancelTenant(tenantId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(tenants)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    // Also cancel active subscriptions
    await db
      .update(tenantSubscriptions)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(
        and(
          eq(tenantSubscriptions.tenantId, tenantId),
          eq(tenantSubscriptions.status, "active")
        )
      );

    await this.logAuditEvent(tenantId, null, {
      action: "tenant.cancelled",
      resourceType: "tenant",
      resourceId: String(tenantId),
      severity: "critical",
    });
  }

  /**
   * Create a subscription for a tenant
   */
  async createSubscription(data: {
    tenantId: number;
    planId: number;
    marketplaceSubscriptionId?: string;
  }): Promise<TenantSubscription | null> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get plan details
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, data.planId))
      .limit(1);

    if (!plan[0]) throw new Error("Plan not found");

    const startDate = new Date();
    let endDate: Date | null = null;

    // Calculate end date based on billing cycle
    switch (plan[0].billingCycle) {
      case "monthly":
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "quarterly":
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "annually":
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    const [result] = await db.insert(tenantSubscriptions).values({
      tenantId: data.tenantId,
      planId: data.planId,
      startDate,
      endDate,
      marketplaceSubscriptionId: data.marketplaceSubscriptionId,
      nextBillingDate: endDate,
    }).returning({ id: tenantSubscriptions.id });

    await this.logAuditEvent(data.tenantId, null, {
      action: "subscription.created",
      resourceType: "subscription",
      resourceId: String(result.id),
      severity: "info",
      metadata: { planId: data.planId },
    });

    const subscription = await db
      .select()
      .from(tenantSubscriptions)
      .where(eq(tenantSubscriptions.id, result.id))
      .limit(1);

    return subscription[0] || null;
  }

  /**
   * Get active subscription for a tenant
   */
  async getActiveSubscription(
    tenantId: number
  ): Promise<TenantSubscription | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(tenantSubscriptions)
      .where(
        and(
          eq(tenantSubscriptions.tenantId, tenantId),
          eq(tenantSubscriptions.status, "active")
        )
      )
      .orderBy(desc(tenantSubscriptions.createdAt))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Check if a feature is enabled for a tenant
   */
  async isFeatureEnabled(
    tenantId: number,
    featureCode: string
  ): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    // First check tenant-specific override
    const tenantFeature = await db
      .select()
      .from(tenantFeatures)
      .where(
        and(
          eq(tenantFeatures.tenantId, tenantId),
          eq(tenantFeatures.featureCode, featureCode)
        )
      )
      .limit(1);

    if (tenantFeature[0]?.isOverride) {
      return tenantFeature[0].isEnabled;
    }

    // Otherwise check plan features
    const subscription = await this.getActiveSubscription(tenantId);
    if (!subscription) return false;

    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, subscription.planId))
      .limit(1);

    if (!plan[0]?.enabledModules) return false;

    const enabledModules = plan[0].enabledModules as string[];
    return enabledModules.includes(featureCode);
  }

  /**
   * Record usage for metering (Azure Marketplace)
   */
  async recordUsage(data: {
    tenantId: number;
    subscriptionId: number;
    dimensionId: string;
    quantity: number;
  }): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(usageMetering).values({
      tenantId: data.tenantId,
      subscriptionId: data.subscriptionId,
      dimensionId: data.dimensionId,
      quantity: String(data.quantity),
      effectiveStartTime: new Date(),
    });
  }

  /**
   * Log an audit event
   */
  async logAuditEvent(
    tenantId: number,
    userId: number | null,
    event: {
      action: string;
      resourceType: string;
      resourceId?: string;
      previousState?: Record<string, any>;
      newState?: Record<string, any>;
      metadata?: Record<string, any>;
      severity?: "info" | "warning" | "critical";
      ipAddress?: string;
      userAgent?: string;
      requestId?: string;
    }
  ): Promise<void> {
    const db = await getDb();
    if (!db) return;

    await db.insert(tenantAuditLogs).values({
      tenantId,
      userId,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      previousState: event.previousState,
      newState: event.newState,
      metadata: event.metadata,
      severity: event.severity || "info",
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      requestId: event.requestId,
    });
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantStats(tenantId: number): Promise<{
    activeUsers: number;
    storageUsedGb: number;
    apiCallsThisMonth: number;
  }> {
    // TODO: Implement actual usage tracking
    // This is a placeholder that should query actual usage tables
    return {
      activeUsers: 0,
      storageUsedGb: 0,
      apiCallsThisMonth: 0,
    };
  }
}

// Singleton instance
export const tenantService = new TenantService();
