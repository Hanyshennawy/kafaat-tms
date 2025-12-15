/**
 * Azure Marketplace Integration
 * 
 * Handles Azure Marketplace SaaS offer webhooks and metering.
 * Implements the Azure Marketplace SaaS Fulfillment API v2.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a SaaS offer in Partner Center
 * 2. Configure the landing page URL: https://your-domain.com/api/marketplace/landing
 * 3. Configure the webhook URL: https://your-domain.com/api/marketplace/webhook
 * 4. Add environment variables:
 *    - AZURE_MARKETPLACE_PUBLISHER_ID: Your Publisher ID
 *    - AZURE_MARKETPLACE_OFFER_ID: Your Offer ID
 *    - AZURE_MARKETPLACE_TENANT_ID: Your Azure AD tenant ID
 *    - AZURE_MARKETPLACE_CLIENT_ID: SaaS app client ID
 *    - AZURE_MARKETPLACE_CLIENT_SECRET: SaaS app client secret
 */

import { Express, Request, Response } from "express";
import axios from "axios";
import { tenantService } from "../services/tenant.service";
import { getDb } from "../db";
import { usageMetering } from "../../drizzle/tenant-schema";
import { eq, and } from "drizzle-orm";

// Azure Marketplace API endpoints
const MARKETPLACE_API_BASE = "https://marketplaceapi.microsoft.com/api";
const MARKETPLACE_API_VERSION = "2018-08-31";

interface MarketplaceConfig {
  publisherId: string;
  offerId: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

interface MarketplaceToken {
  accessToken: string;
  expiresAt: Date;
}

interface ResolvedSubscription {
  id: string;
  subscriptionName: string;
  offerId: string;
  planId: string;
  quantity?: number;
  subscription: {
    id: string;
    publisherId: string;
    offerId: string;
    name: string;
    saasSubscriptionStatus: string;
    beneficiary: {
      emailId: string;
      objectId: string;
      tenantId: string;
    };
    purchaser: {
      emailId: string;
      objectId: string;
      tenantId: string;
    };
    planId: string;
    term: {
      startDate: string;
      endDate: string;
      termUnit: string;
    };
    autoRenew: boolean;
    isTest: boolean;
    isFreeTrial: boolean;
  };
}

interface WebhookPayload {
  id: string;
  activityId: string;
  publisherId: string;
  offerId: string;
  planId: string;
  quantity?: number;
  subscriptionId: string;
  timeStamp: string;
  action:
    | "ChangePlan"
    | "ChangeQuantity"
    | "Suspend"
    | "Unsubscribe"
    | "Reinstate"
    | "Renew";
  status: "InProgress" | "Success" | "Failure";
}

interface UsageEvent {
  resourceId: string; // Subscription ID
  quantity: number;
  dimension: string;
  effectiveStartTime: string;
  planId: string;
}

/**
 * Azure Marketplace Service
 */
export class AzureMarketplaceService {
  private config: MarketplaceConfig;
  private tokenCache: MarketplaceToken | null = null;

  constructor() {
    this.config = {
      publisherId: process.env.AZURE_MARKETPLACE_PUBLISHER_ID || "",
      offerId: process.env.AZURE_MARKETPLACE_OFFER_ID || "",
      tenantId: process.env.AZURE_MARKETPLACE_TENANT_ID || "",
      clientId: process.env.AZURE_MARKETPLACE_CLIENT_ID || "",
      clientSecret: process.env.AZURE_MARKETPLACE_CLIENT_SECRET || "",
    };

    if (!this.config.publisherId || !this.config.clientId) {
      console.warn(
        "[Marketplace] Azure Marketplace not configured. Set AZURE_MARKETPLACE_* environment variables."
      );
    }
  }

  /**
   * Check if Marketplace integration is configured
   */
  isConfigured(): boolean {
    return !!(
      this.config.publisherId &&
      this.config.clientId &&
      this.config.clientSecret
    );
  }

  /**
   * Get access token for Marketplace API
   */
  private async getAccessToken(): Promise<string> {
    // Check cache
    if (this.tokenCache && this.tokenCache.expiresAt > new Date()) {
      return this.tokenCache.accessToken;
    }

    const tokenEndpoint = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/token`;

    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      resource: "20e940b3-4c77-4b0b-9a53-9e16a1b010a7", // Azure Marketplace resource ID
    });

    const response = await axios.post(tokenEndpoint, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    this.tokenCache = {
      accessToken: response.data.access_token,
      expiresAt: new Date(Date.now() + (response.data.expires_in - 60) * 1000),
    };

    return this.tokenCache.accessToken;
  }

  /**
   * Resolve a marketplace purchase token to get subscription details
   */
  async resolveSubscription(
    marketplaceToken: string
  ): Promise<ResolvedSubscription> {
    const accessToken = await this.getAccessToken();

    const response = await axios.post(
      `${MARKETPLACE_API_BASE}/saas/subscriptions/resolve?api-version=${MARKETPLACE_API_VERSION}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-ms-marketplace-token": marketplaceToken,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  }

  /**
   * Activate a subscription after provisioning
   */
  async activateSubscription(
    subscriptionId: string,
    planId: string,
    quantity?: number
  ): Promise<void> {
    const accessToken = await this.getAccessToken();

    await axios.post(
      `${MARKETPLACE_API_BASE}/saas/subscriptions/${subscriptionId}/activate?api-version=${MARKETPLACE_API_VERSION}`,
      {
        planId,
        quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    const accessToken = await this.getAccessToken();

    const response = await axios.get(
      `${MARKETPLACE_API_BASE}/saas/subscriptions/${subscriptionId}?api-version=${MARKETPLACE_API_VERSION}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  }

  /**
   * Update subscription operation status (for webhook acknowledgment)
   */
  async updateOperationStatus(
    subscriptionId: string,
    operationId: string,
    status: "Success" | "Failure"
  ): Promise<void> {
    const accessToken = await this.getAccessToken();

    await axios.patch(
      `${MARKETPLACE_API_BASE}/saas/subscriptions/${subscriptionId}/operations/${operationId}?api-version=${MARKETPLACE_API_VERSION}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  }

  /**
   * Report usage to Azure Marketplace Metering API
   */
  async reportUsage(events: UsageEvent[]): Promise<void> {
    const accessToken = await this.getAccessToken();

    // Batch usage events (max 25 per request)
    const batches = [];
    for (let i = 0; i < events.length; i += 25) {
      batches.push(events.slice(i, i + 25));
    }

    for (const batch of batches) {
      await axios.post(
        `${MARKETPLACE_API_BASE}/usageEvents?api-version=2018-08-31`,
        batch.length === 1 ? batch[0] : batch,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }
  }

  /**
   * Process pending usage metering records
   */
  async processPendingUsage(): Promise<void> {
    const db = await getDb();
    if (!db) return;

    // Get pending usage records
    const pendingRecords = await db
      .select()
      .from(usageMetering)
      .where(eq(usageMetering.status, "pending"))
      .limit(100);

    if (pendingRecords.length === 0) return;

    // Group by subscription
    const bySubscription = new Map<string, typeof pendingRecords>();
    for (const record of pendingRecords) {
      const key = String(record.subscriptionId);
      if (!bySubscription.has(key)) {
        bySubscription.set(key, []);
      }
      bySubscription.get(key)!.push(record);
    }

    // Report to Marketplace
    for (const [subscriptionId, records] of Array.from(bySubscription.entries())) {
      try {
        // Get tenant subscription to get marketplace subscription ID
        // This would need to be joined with tenant_subscriptions table
        // For now, we'll assume the marketplaceSubscriptionId is stored

        const events: UsageEvent[] = records.map((r: typeof pendingRecords[0]) => ({
          resourceId: subscriptionId, // Should be marketplace subscription ID
          quantity: Number(r.quantity),
          dimension: r.dimensionId,
          effectiveStartTime: r.effectiveStartTime.toISOString(),
          planId: "", // Would need to get from subscription
        }));

        await this.reportUsage(events);

        // Mark as reported
        for (const record of records) {
          await db
            .update(usageMetering)
            .set({
              status: "reported",
              reportedToMarketplace: true,
              reportedAt: new Date(),
            })
            .where(eq(usageMetering.id, record.id));
        }
      } catch (error: any) {
        // Mark as failed
        for (const record of records) {
          await db
            .update(usageMetering)
            .set({
              status: "rejected",
              errorMessage: error.message,
            })
            .where(eq(usageMetering.id, record.id));
        }
      }
    }
  }
}

// Singleton instance
export const marketplaceService = new AzureMarketplaceService();

/**
 * Register Azure Marketplace routes
 */
export function registerMarketplaceRoutes(app: Express) {
  /**
   * Landing Page - Where customers are redirected after purchasing
   * This page should:
   * 1. Resolve the marketplace token
   * 2. Create/update the tenant
   * 3. Activate the subscription
   * 4. Redirect to the application
   */
  app.get("/api/marketplace/landing", async (req: Request, res: Response) => {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({ error: "Missing marketplace token" });
      return;
    }

    try {
      // Resolve the subscription from the token
      const resolved = await marketplaceService.resolveSubscription(token);

      // Check if tenant already exists
      let tenant = await tenantService.getTenantByAzureSubscription(
        resolved.subscription.id
      );

      if (!tenant) {
        // Create new tenant
        tenant = await tenantService.createTenant({
          name: resolved.subscription.name || "New Organization",
          primaryEmail:
            resolved.subscription.purchaser.emailId ||
            resolved.subscription.beneficiary.emailId,
          azureSubscriptionId: resolved.subscription.id,
          azureTenantId: resolved.subscription.purchaser.tenantId,
          marketplacePurchaseToken: token,
          marketplacePlanId: resolved.planId,
          marketplaceOfferId: resolved.offerId,
        });
      }

      if (!tenant) {
        throw new Error("Failed to create tenant");
      }

      // Activate the subscription in Marketplace
      await marketplaceService.activateSubscription(
        resolved.subscription.id,
        resolved.planId,
        resolved.quantity
      );

      // Activate the tenant
      await tenantService.activateTenant(tenant.id);

      // Redirect to onboarding
      res.redirect(`/onboarding?tenant=${tenant.tenantCode}&activated=true`);
    } catch (error: any) {
      console.error("[Marketplace] Landing page error:", error);
      res.redirect(`/error?message=${encodeURIComponent(error.message)}`);
    }
  });

  /**
   * Webhook endpoint - Receives notifications from Azure Marketplace
   */
  app.post("/api/marketplace/webhook", async (req: Request, res: Response) => {
    const payload = req.body as WebhookPayload;

    console.log("[Marketplace] Webhook received:", payload.action, payload);

    try {
      // Find the tenant
      const tenant = await tenantService.getTenantByAzureSubscription(
        payload.subscriptionId
      );

      if (!tenant) {
        console.error(
          "[Marketplace] Tenant not found for subscription:",
          payload.subscriptionId
        );
        res.status(200).json({ status: "ok" });
        return;
      }

      switch (payload.action) {
        case "ChangePlan":
          // Customer changed their subscription plan
          // TODO: Update tenant plan
          await tenantService.logAuditEvent(tenant.id, null, {
            action: "marketplace.plan_changed",
            resourceType: "subscription",
            resourceId: payload.subscriptionId,
            metadata: { newPlanId: payload.planId },
            severity: "info",
          });
          break;

        case "ChangeQuantity":
          // Customer changed seat count
          // TODO: Update tenant seat limit
          await tenantService.logAuditEvent(tenant.id, null, {
            action: "marketplace.quantity_changed",
            resourceType: "subscription",
            resourceId: payload.subscriptionId,
            metadata: { newQuantity: payload.quantity },
            severity: "info",
          });
          break;

        case "Suspend":
          // Subscription suspended (e.g., payment failure)
          await tenantService.suspendTenant(
            tenant.id,
            "Azure Marketplace suspension"
          );
          break;

        case "Reinstate":
          // Subscription reinstated after suspension
          await tenantService.activateTenant(tenant.id);
          break;

        case "Unsubscribe":
          // Customer cancelled subscription
          await tenantService.cancelTenant(tenant.id);
          break;

        case "Renew":
          // Subscription renewed
          await tenantService.logAuditEvent(tenant.id, null, {
            action: "marketplace.subscription_renewed",
            resourceType: "subscription",
            resourceId: payload.subscriptionId,
            severity: "info",
          });
          break;
      }

      // Acknowledge the webhook
      if (payload.status === "InProgress") {
        await marketplaceService.updateOperationStatus(
          payload.subscriptionId,
          payload.id,
          "Success"
        );
      }

      res.status(200).json({ status: "ok" });
    } catch (error: any) {
      console.error("[Marketplace] Webhook error:", error);
      // Still return 200 to avoid retries for errors we can't handle
      res.status(200).json({ status: "error", message: error.message });
    }
  });

  /**
   * Health check endpoint (required for Marketplace)
   */
  app.get("/api/marketplace/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
    });
  });
}

/**
 * Metering dimensions for usage-based billing
 */
export const METERING_DIMENSIONS = {
  ACTIVE_USERS: "active_users",
  STORAGE_GB: "storage_gb",
  API_CALLS: "api_calls",
  AI_REQUESTS: "ai_requests",
  LICENSE_VERIFICATIONS: "license_verifications",
} as const;

/**
 * Track a usage event for metering
 */
export async function trackUsage(
  tenantId: number,
  subscriptionId: number,
  dimension: keyof typeof METERING_DIMENSIONS,
  quantity: number
): Promise<void> {
  await tenantService.recordUsage({
    tenantId,
    subscriptionId,
    dimensionId: METERING_DIMENSIONS[dimension],
    quantity,
  });
}
