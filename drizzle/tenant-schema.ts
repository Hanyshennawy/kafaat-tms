import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * MULTI-TENANT SAAS SCHEMA
 * Core tables for tenant management, subscriptions, and billing
 * Designed for Azure Marketplace SaaS transactable offers
 */

// ============================================================================
// TENANT & ORGANIZATION MANAGEMENT
// ============================================================================

/**
 * Tenants represent organizations subscribing to the SaaS.
 * Each tenant is isolated and has their own data scope.
 */
export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  
  // Unique identifier for the tenant (UUID format)
  tenantCode: varchar("tenant_code", { length: 64 }).notNull().unique(),
  
  // Organization details
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  legalName: varchar("legal_name", { length: 255 }),
  
  // Contact information
  primaryEmail: varchar("primary_email", { length: 320 }).notNull(),
  billingEmail: varchar("billing_email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  
  // Address (UAE-focused)
  country: varchar("country", { length: 2 }).default("AE").notNull(),
  emirate: varchar("emirate", { length: 100 }),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  poBox: varchar("po_box", { length: 32 }),
  
  // Azure Marketplace integration
  azureSubscriptionId: varchar("azure_subscription_id", { length: 64 }),
  azureTenantId: varchar("azure_tenant_id", { length: 64 }),
  marketplacePurchaseToken: varchar("marketplace_purchase_token", { length: 512 }),
  marketplacePlanId: varchar("marketplace_plan_id", { length: 64 }),
  marketplaceOfferId: varchar("marketplace_offer_id", { length: 64 }),
  
  // Branding
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 7 }),
  
  // Settings
  defaultLanguage: varchar("default_language", { length: 10 }).default("en"),
  timezone: varchar("timezone", { length: 64 }).default("Asia/Dubai"),
  dateFormat: varchar("date_format", { length: 32 }).default("DD/MM/YYYY"),
  
  // Status
  status: mysqlEnum("status", [
    "pending_setup",      // Initial signup, awaiting configuration
    "active",             // Fully operational
    "suspended",          // Temporarily disabled (e.g., payment issue)
    "cancelled",          // Subscription cancelled
    "trial",              // Trial period
    "grace_period"        // Past due but not yet suspended
  ]).default("pending_setup").notNull(),
  
  // Trial information
  trialEndsAt: timestamp("trial_ends_at"),
  
  // Data residency (TDRA compliance)
  dataRegion: varchar("data_region", { length: 32 }).default("uae-north"),
  
  // Compliance flags
  gdprConsent: boolean("gdpr_consent").default(false),
  tdraCompliance: boolean("tdra_compliance").default(false),
  dataProcessingAgreement: boolean("data_processing_agreement").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  activatedAt: timestamp("activated_at"),
  suspendedAt: timestamp("suspended_at"),
  cancelledAt: timestamp("cancelled_at"),
});

/**
 * Subscription plans define the pricing tiers
 */
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  
  // Plan identification
  planCode: varchar("plan_code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Azure Marketplace plan mapping
  marketplacePlanId: varchar("marketplace_plan_id", { length: 64 }),
  
  // Pricing (in AED)
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  billingCycle: mysqlEnum("billing_cycle", ["monthly", "quarterly", "annually"]).default("monthly").notNull(),
  currency: varchar("currency", { length: 3 }).default("AED").notNull(),
  
  // Feature limits
  maxUsers: int("max_users"),
  maxDepartments: int("max_departments"),
  maxStorageGb: int("max_storage_gb"),
  
  // Module access (JSON array of enabled module codes)
  enabledModules: json("enabled_modules"),
  
  // Features
  features: json("features"),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Tenant subscriptions track active plans
 */
export const tenantSubscriptions = mysqlTable("tenant_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  
  tenantId: int("tenant_id").notNull(),
  planId: int("plan_id").notNull(),
  
  // Subscription period
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  
  // Status
  status: mysqlEnum("status", [
    "active",
    "past_due",
    "cancelled",
    "expired",
    "suspended"
  ]).default("active").notNull(),
  
  // Azure Marketplace subscription details
  marketplaceSubscriptionId: varchar("marketplace_subscription_id", { length: 128 }),
  marketplaceSaasSubscriptionStatus: varchar("marketplace_saas_status", { length: 64 }),
  
  // Billing
  nextBillingDate: timestamp("next_billing_date"),
  lastBillingDate: timestamp("last_billing_date"),
  
  // Auto-renewal
  autoRenew: boolean("auto_renew").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  cancelledAt: timestamp("cancelled_at"),
});

/**
 * Usage metering for billing purposes
 * Tracks consumption-based metrics for Azure Marketplace metering API
 */
export const usageMetering = mysqlTable("usage_metering", {
  id: int("id").autoincrement().primaryKey(),
  
  tenantId: int("tenant_id").notNull(),
  subscriptionId: int("subscription_id").notNull(),
  
  // Metering dimension (e.g., "active_users", "storage_gb", "api_calls")
  dimensionId: varchar("dimension_id", { length: 64 }).notNull(),
  
  // Usage data
  quantity: decimal("quantity", { precision: 18, scale: 6 }).notNull(),
  effectiveStartTime: timestamp("effective_start_time").notNull(),
  
  // Azure Marketplace metering
  marketplaceUsageEventId: varchar("marketplace_usage_event_id", { length: 128 }),
  reportedToMarketplace: boolean("reported_to_marketplace").default(false).notNull(),
  reportedAt: timestamp("reported_at"),
  
  // Status
  status: mysqlEnum("status", ["pending", "reported", "accepted", "rejected", "duplicate"]).default("pending").notNull(),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Tenant-level feature flags and configuration
 */
export const tenantFeatures = mysqlTable("tenant_features", {
  id: int("id").autoincrement().primaryKey(),
  
  tenantId: int("tenant_id").notNull(),
  featureCode: varchar("feature_code", { length: 64 }).notNull(),
  
  isEnabled: boolean("is_enabled").default(false).notNull(),
  configuration: json("configuration"),
  
  // Override from plan default
  isOverride: boolean("is_override").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// AZURE AD / ENTRA ID SSO INTEGRATION
// ============================================================================

/**
 * Azure AD tenant connections for SSO
 */
export const azureAdConnections = mysqlTable("azure_ad_connections", {
  id: int("id").autoincrement().primaryKey(),
  
  tenantId: int("tenant_id").notNull(),
  
  // Azure AD tenant info
  azureAdTenantId: varchar("azure_ad_tenant_id", { length: 64 }).notNull(),
  azureAdTenantName: varchar("azure_ad_tenant_name", { length: 255 }),
  
  // Application registration
  clientId: varchar("client_id", { length: 64 }),
  // Note: Client secret should be stored in Azure Key Vault, referenced here
  clientSecretKeyVaultRef: varchar("client_secret_kv_ref", { length: 255 }),
  
  // SCIM provisioning
  scimEndpoint: text("scim_endpoint"),
  scimToken: varchar("scim_token", { length: 512 }),
  scimEnabled: boolean("scim_enabled").default(false).notNull(),
  
  // Configuration
  allowedDomains: json("allowed_domains"), // e.g., ["ministry.gov.ae"]
  autoProvisionUsers: boolean("auto_provision_users").default(true).notNull(),
  defaultRole: varchar("default_role", { length: 64 }).default("employee"),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  lastSyncAt: timestamp("last_sync_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// TENANT-SCOPED AUDIT LOG
// ============================================================================

/**
 * Enhanced audit log with tenant isolation
 */
export const tenantAuditLogs = mysqlTable("tenant_audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  tenantId: int("tenant_id").notNull(),
  userId: int("user_id"),
  
  // Action details
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(),
  resourceId: varchar("resource_id", { length: 64 }),
  
  // Change tracking
  previousState: json("previous_state"),
  newState: json("new_state"),
  
  // Request context
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  requestId: varchar("request_id", { length: 64 }),
  
  // Additional metadata
  metadata: json("metadata"),
  
  // Severity for compliance/security events
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// TDRA COMPLIANCE
// ============================================================================

/**
 * Data consent records for TDRA/privacy compliance
 */
export const dataConsentRecords = mysqlTable("data_consent_records", {
  id: int("id").autoincrement().primaryKey(),
  
  tenantId: int("tenant_id").notNull(),
  userId: int("user_id").notNull(),
  
  // Consent type
  consentType: mysqlEnum("consent_type", [
    "terms_of_service",
    "privacy_policy",
    "data_processing",
    "marketing_communications",
    "data_sharing",
    "biometric_data",
    "performance_tracking"
  ]).notNull(),
  
  // Consent details
  version: varchar("version", { length: 32 }).notNull(),
  consentGiven: boolean("consent_given").notNull(),
  consentText: text("consent_text"),
  
  // Audit trail
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
});

/**
 * Data retention policies per tenant
 */
export const dataRetentionPolicies = mysqlTable("data_retention_policies", {
  id: int("id").autoincrement().primaryKey(),
  
  tenantId: int("tenant_id").notNull(),
  
  // Policy configuration
  dataCategory: varchar("data_category", { length: 64 }).notNull(),
  retentionDays: int("retention_days").notNull(),
  
  // Deletion settings
  autoDelete: boolean("auto_delete").default(false).notNull(),
  archiveBeforeDelete: boolean("archive_before_delete").default(true).notNull(),
  
  // Legal hold
  legalHold: boolean("legal_hold").default(false).notNull(),
  legalHoldReason: text("legal_hold_reason"),
  legalHoldUntil: timestamp("legal_hold_until"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Data subject access requests (DSAR) for TDRA compliance
 */
export const dataSubjectRequests = mysqlTable("data_subject_requests", {
  id: int("id").autoincrement().primaryKey(),
  
  tenantId: int("tenant_id").notNull(),
  requesterId: int("requester_id").notNull(),
  subjectUserId: int("subject_user_id"),
  
  // Request type
  requestType: mysqlEnum("request_type", [
    "access",           // Right to access data
    "rectification",    // Right to correct data
    "erasure",          // Right to be forgotten
    "portability",      // Right to data portability
    "restriction",      // Right to restrict processing
    "objection"         // Right to object
  ]).notNull(),
  
  // Request details
  description: text("description"),
  
  // Status tracking
  status: mysqlEnum("status", [
    "submitted",
    "in_review",
    "processing",
    "completed",
    "rejected",
    "withdrawn"
  ]).default("submitted").notNull(),
  
  // Response
  responseNotes: text("response_notes"),
  dataExportUrl: text("data_export_url"),
  
  // Compliance tracking
  dueDate: timestamp("due_date").notNull(), // Must respond within 30 days per TDRA
  completedAt: timestamp("completed_at"),
  completedBy: int("completed_by"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// MARKETPLACE CATALOG INTEGRATION
// ============================================================================

/**
 * SaaS application catalog entry for unified marketplace UI
 */
export const saasApplications = mysqlTable("saas_applications", {
  id: int("id").autoincrement().primaryKey(),
  
  // Application identification
  appCode: varchar("app_code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  
  // Description
  shortDescription: varchar("short_description", { length: 500 }),
  longDescription: text("long_description"),
  
  // Branding
  iconUrl: text("icon_url"),
  bannerUrl: text("banner_url"),
  primaryColor: varchar("primary_color", { length: 7 }),
  
  // Categorization
  category: varchar("category", { length: 100 }).notNull(),
  tags: json("tags"),
  
  // Technical
  baseUrl: text("base_url").notNull(),
  healthCheckUrl: text("health_check_url"),
  apiVersion: varchar("api_version", { length: 32 }),
  
  // Azure Marketplace
  marketplaceOfferId: varchar("marketplace_offer_id", { length: 64 }),
  marketplacePublisherId: varchar("marketplace_publisher_id", { length: 64 }),
  
  // Status
  status: mysqlEnum("status", ["draft", "active", "maintenance", "deprecated"]).default("draft").notNull(),
  
  // Metadata
  features: json("features"),
  supportedLanguages: json("supported_languages"),
  documentationUrl: text("documentation_url"),
  supportUrl: text("support_url"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const tenantsRelations = relations(tenants, ({ many }) => ({
  subscriptions: many(tenantSubscriptions),
  features: many(tenantFeatures),
  azureAdConnections: many(azureAdConnections),
  auditLogs: many(tenantAuditLogs),
  consentRecords: many(dataConsentRecords),
  retentionPolicies: many(dataRetentionPolicies),
  dataSubjectRequests: many(dataSubjectRequests),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(tenantSubscriptions),
}));

export const tenantSubscriptionsRelations = relations(tenantSubscriptions, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [tenantSubscriptions.tenantId],
    references: [tenants.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [tenantSubscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  usageMetering: many(usageMetering),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type TenantSubscription = typeof tenantSubscriptions.$inferSelect;
export type InsertTenantSubscription = typeof tenantSubscriptions.$inferInsert;
export type UsageMetering = typeof usageMetering.$inferSelect;
export type InsertUsageMetering = typeof usageMetering.$inferInsert;
export type TenantFeature = typeof tenantFeatures.$inferSelect;
export type AzureAdConnection = typeof azureAdConnections.$inferSelect;
export type TenantAuditLog = typeof tenantAuditLogs.$inferSelect;
export type DataConsentRecord = typeof dataConsentRecords.$inferSelect;
export type DataRetentionPolicy = typeof dataRetentionPolicies.$inferSelect;
export type DataSubjectRequest = typeof dataSubjectRequests.$inferSelect;
export type SaasApplication = typeof saasApplications.$inferSelect;
