/**
 * Trial Expiration Service
 * 
 * Background service that monitors trial expirations and handles:
 * - Sending reminder emails (2 days before expiration)
 * - Marking expired trials
 * - Deactivating features for expired trials
 */

import { eq, lt, and, isNotNull } from "drizzle-orm";
import { getDb } from "../db";
import { tenants, type Tenant } from "../../drizzle/tenant-schema";
import { emailService } from "./email.service";
import { tenantService } from "./tenant.service";

// ============================================================================
// CONFIGURATION
// ============================================================================

const TRIAL_WARNING_DAYS = 2; // Send warning email X days before expiration
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour

// Base URL for email links
const getBaseUrl = () => process.env.APP_URL || process.env.VITE_APP_URL || "http://localhost:3000";

// ============================================================================
// TRIAL SERVICE CLASS
// ============================================================================

export class TrialService {
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the background trial check job
   */
  start(): void {
    console.log("[Trial] Starting trial expiration monitor...");
    
    // Run immediately on start
    this.checkTrials();

    // Then run periodically
    this.intervalId = setInterval(() => {
      this.checkTrials();
    }, CHECK_INTERVAL_MS);
  }

  /**
   * Stop the background job
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[Trial] Stopped trial expiration monitor");
    }
  }

  /**
   * Main check routine - finds and processes expiring/expired trials
   */
  async checkTrials(): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("[Trial] Database not available, skipping check");
        return;
      }

      console.log("[Trial] Checking for expiring trials...");
      
      const now = new Date();
      const warningDate = new Date(now.getTime() + TRIAL_WARNING_DAYS * 24 * 60 * 60 * 1000);

      // Get all trial tenants with their expiration dates
      const trialTenants = await db
        .select()
        .from(tenants)
        .where(
          and(
            eq(tenants.status, "trial"),
            isNotNull(tenants.trialEndsAt)
          )
        );

      for (const tenant of trialTenants) {
        if (!tenant.trialEndsAt) continue;

        const trialEnd = new Date(tenant.trialEndsAt);
        const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

        if (daysRemaining <= 0) {
          // Trial has expired
          await this.handleExpiredTrial(tenant);
        } else if (daysRemaining <= TRIAL_WARNING_DAYS) {
          // Trial ending soon - send reminder
          await this.handleExpiringTrial(tenant, daysRemaining);
        }
      }

      console.log(`[Trial] Checked ${trialTenants.length} trial tenants`);
    } catch (error) {
      console.error("[Trial] Error checking trials:", error);
    }
  }

  /**
   * Handle a trial that is about to expire
   */
  private async handleExpiringTrial(tenant: Tenant, daysRemaining: number): Promise<void> {
    console.log(`[Trial] Tenant ${tenant.name} trial expires in ${daysRemaining} days`);

    // Check if we already sent a reminder (using audit log or a flag)
    // For simplicity, we'll send reminders each check - in production, track sent emails
    
    try {
      await emailService.sendTrialEndingSoon(
        tenant.primaryEmail,
        tenant.name,
        daysRemaining,
        getBaseUrl()
      );

      // Log the notification
      await tenantService.logAuditEvent(tenant.id, null, {
        action: "trial.reminder_sent",
        resourceType: "tenant",
        resourceId: String(tenant.id),
        severity: "info",
        metadata: { daysRemaining },
      });
    } catch (error) {
      console.error(`[Trial] Failed to send reminder to ${tenant.primaryEmail}:`, error);
    }
  }

  /**
   * Handle an expired trial
   */
  private async handleExpiredTrial(tenant: Tenant): Promise<void> {
    console.log(`[Trial] Tenant ${tenant.name} trial has expired`);

    const db = await getDb();
    if (!db) return;

    try {
      // Update tenant status to grace_period (gives them a few more days to subscribe)
      await db
        .update(tenants)
        .set({
          status: "grace_period",
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenant.id));

      // Send expiration email
      await emailService.sendTrialExpired(
        tenant.primaryEmail,
        tenant.name,
        getBaseUrl()
      );

      // Log the event
      await tenantService.logAuditEvent(tenant.id, null, {
        action: "trial.expired",
        resourceType: "tenant",
        resourceId: String(tenant.id),
        severity: "warning",
        metadata: { previousStatus: "trial" },
      });

      console.log(`[Trial] Moved tenant ${tenant.name} to grace_period`);
    } catch (error) {
      console.error(`[Trial] Failed to handle expired trial for ${tenant.name}:`, error);
    }
  }

  /**
   * Check if a specific tenant's trial has expired
   */
  async isTrialExpired(tenantId: number): Promise<{ expired: boolean; daysRemaining: number }> {
    const tenant = await tenantService.getTenantById(tenantId);
    
    if (!tenant) {
      return { expired: true, daysRemaining: 0 };
    }

    // If not in trial status, check based on status
    if (tenant.status !== "trial") {
      if (tenant.status === "active") {
        return { expired: false, daysRemaining: -1 }; // Subscribed
      }
      return { expired: true, daysRemaining: 0 };
    }

    // Check trial end date
    if (!tenant.trialEndsAt) {
      return { expired: false, daysRemaining: 7 }; // No end date set, assume new
    }

    const now = new Date();
    const trialEnd = new Date(tenant.trialEndsAt);
    const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    return {
      expired: daysRemaining <= 0,
      daysRemaining: Math.max(0, daysRemaining),
    };
  }

  /**
   * Get trial status for display in UI
   */
  async getTrialStatus(tenantId: number): Promise<{
    status: "trial" | "active" | "expired" | "grace_period" | "suspended" | "cancelled";
    trialDaysRemaining: number | null;
    trialEndsAt: Date | null;
    canAccessFeatures: boolean;
    showUpgradePrompt: boolean;
  }> {
    const tenant = await tenantService.getTenantById(tenantId);

    if (!tenant) {
      return {
        status: "cancelled",
        trialDaysRemaining: null,
        trialEndsAt: null,
        canAccessFeatures: false,
        showUpgradePrompt: false,
      };
    }

    const trialEndsAt = tenant.trialEndsAt ? new Date(tenant.trialEndsAt) : null;
    let trialDaysRemaining: number | null = null;

    if (trialEndsAt && tenant.status === "trial") {
      const now = new Date();
      trialDaysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    }

    // Determine feature access
    const canAccessFeatures = ["trial", "active"].includes(tenant.status);
    
    // Show upgrade prompt for trial users and grace period
    const showUpgradePrompt = ["trial", "grace_period"].includes(tenant.status);

    return {
      status: tenant.status as any,
      trialDaysRemaining,
      trialEndsAt,
      canAccessFeatures,
      showUpgradePrompt,
    };
  }
}

// Singleton instance
export const trialService = new TrialService();
