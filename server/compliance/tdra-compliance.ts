/**
 * TDRA Compliance Service
 * 
 * Provides compliance features aligned with UAE Telecommunications and Digital
 * Government Regulatory Authority (TDRA) requirements for ICT services.
 * 
 * IMPORTANT DISCLAIMER:
 * This module is designed to SUPPORT TDRA-aligned operation. It does NOT
 * constitute legal certification or guarantee compliance. Organizations
 * must obtain formal legal advice and appropriate licensing approvals
 * from TDRA and relevant sector regulators before operating in the UAE.
 * 
 * Key TDRA Alignment Areas:
 * 1. Data Residency - UAE or GCC region data storage
 * 2. Privacy - Minimal data collection, clear consent
 * 3. Security - Encryption, access controls, audit logging
 * 4. Content - Appropriate content standards
 * 5. Accessibility - Government service accessibility
 */

import { z } from "zod";
import { getDb } from "../db";
import {
  dataConsentRecords,
  dataRetentionPolicies,
  dataSubjectRequests,
  tenantAuditLogs,
} from "../../drizzle/schema-pg";
import { eq, and, lte, desc } from "drizzle-orm";
import { tenantService } from "../services/tenant.service";

// ============================================================================
// DATA RESIDENCY
// ============================================================================

/**
 * Supported Azure regions for UAE data residency
 */
export const UAE_DATA_REGIONS = {
  "uae-north": {
    name: "UAE North",
    location: "Dubai",
    azureRegion: "uaenorth",
    isPreferred: true,
  },
  "uae-central": {
    name: "UAE Central",
    location: "Abu Dhabi",
    azureRegion: "uaecentral",
    isPreferred: false,
  },
} as const;

/**
 * GCC region fallbacks (for disaster recovery)
 */
export const GCC_BACKUP_REGIONS = {
  "saudi-central": {
    name: "Saudi Arabia Central",
    location: "Riyadh",
    azureRegion: "saudiarabiacentral",
  },
  qatar: {
    name: "Qatar",
    location: "Doha",
    azureRegion: "qatarcentral",
  },
} as const;

export type DataRegion = keyof typeof UAE_DATA_REGIONS;

/**
 * Validate that a tenant's data region is compliant
 */
export function isDataRegionCompliant(region: string): boolean {
  return region in UAE_DATA_REGIONS || region in GCC_BACKUP_REGIONS;
}

// ============================================================================
// PRIVACY & CONSENT
// ============================================================================

/**
 * Consent types required for TDRA compliance
 */
export const CONSENT_TYPES = {
  TERMS_OF_SERVICE: "terms_of_service",
  PRIVACY_POLICY: "privacy_policy",
  DATA_PROCESSING: "data_processing",
  MARKETING_COMMUNICATIONS: "marketing_communications",
  DATA_SHARING: "data_sharing",
  BIOMETRIC_DATA: "biometric_data",
  PERFORMANCE_TRACKING: "performance_tracking",
} as const;

/**
 * Required consents that must be obtained before using the service
 */
export const REQUIRED_CONSENTS = [
  CONSENT_TYPES.TERMS_OF_SERVICE,
  CONSENT_TYPES.PRIVACY_POLICY,
  CONSENT_TYPES.DATA_PROCESSING,
] as const;

/**
 * Record user consent
 */
export async function recordConsent(data: {
  tenantId: number;
  userId: number;
  consentType: keyof typeof CONSENT_TYPES;
  version: string;
  consentGiven: boolean;
  consentText?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(dataConsentRecords).values({
    tenantId: data.tenantId,
    userId: data.userId,
    consentType: CONSENT_TYPES[data.consentType],
    version: data.version,
    consentGiven: data.consentGiven,
    consentText: data.consentText,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  });

  // Audit log
  await tenantService.logAuditEvent(data.tenantId, data.userId, {
    action: data.consentGiven ? "consent.granted" : "consent.denied",
    resourceType: "consent",
    resourceId: CONSENT_TYPES[data.consentType],
    metadata: { version: data.version },
    severity: "info",
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  });
}

/**
 * Revoke a previously given consent
 */
export async function revokeConsent(data: {
  tenantId: number;
  userId: number;
  consentType: keyof typeof CONSENT_TYPES;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find the most recent consent record
  const existing = await db
    .select()
    .from(dataConsentRecords)
    .where(
      and(
        eq(dataConsentRecords.tenantId, data.tenantId),
        eq(dataConsentRecords.userId, data.userId),
        eq(dataConsentRecords.consentType, CONSENT_TYPES[data.consentType])
      )
    )
    .orderBy(desc(dataConsentRecords.createdAt))
    .limit(1);

  if (existing[0] && !existing[0].revokedAt) {
    await db
      .update(dataConsentRecords)
      .set({ revokedAt: new Date() })
      .where(eq(dataConsentRecords.id, existing[0].id));
  }

  await tenantService.logAuditEvent(data.tenantId, data.userId, {
    action: "consent.revoked",
    resourceType: "consent",
    resourceId: CONSENT_TYPES[data.consentType],
    severity: "warning",
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  });
}

/**
 * Check if user has valid consent for all required types
 */
export async function hasRequiredConsents(
  tenantId: number,
  userId: number
): Promise<{ hasAll: boolean; missing: string[] }> {
  const db = await getDb();
  if (!db) return { hasAll: false, missing: [...REQUIRED_CONSENTS] };

  const consents = await db
    .select()
    .from(dataConsentRecords)
    .where(
      and(
        eq(dataConsentRecords.tenantId, tenantId),
        eq(dataConsentRecords.userId, userId),
        eq(dataConsentRecords.consentGiven, true)
      )
    );

  const grantedTypes = new Set(
    consents
      .filter((c) => !c.revokedAt)
      .map((c) => c.consentType)
  );

  const missing = REQUIRED_CONSENTS.filter(
    (type) => !grantedTypes.has(type)
  );

  return {
    hasAll: missing.length === 0,
    missing,
  };
}

// ============================================================================
// DATA SUBJECT ACCESS REQUESTS (DSAR)
// ============================================================================

/**
 * Create a Data Subject Access Request
 * Per TDRA guidelines, organizations must respond within 30 days
 */
export async function createDataSubjectRequest(data: {
  tenantId: number;
  requesterId: number;
  subjectUserId?: number;
  requestType: "access" | "rectification" | "erasure" | "portability" | "restriction" | "objection";
  description?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Due date is 30 days from now per TDRA
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const [result] = await db.insert(dataSubjectRequests).values({
    tenantId: data.tenantId,
    requesterId: data.requesterId,
    subjectUserId: data.subjectUserId || data.requesterId,
    requestType: data.requestType,
    description: data.description,
    dueDate,
  }).returning({ id: dataSubjectRequests.id });

  await tenantService.logAuditEvent(data.tenantId, data.requesterId, {
    action: "dsar.created",
    resourceType: "data_subject_request",
    resourceId: String(result.id),
    metadata: { requestType: data.requestType },
    severity: "warning",
  });

  return result.id;
}

/**
 * Get overdue DSARs that need attention
 */
export async function getOverdueDSARs(tenantId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(dataSubjectRequests)
    .where(
      and(
        eq(dataSubjectRequests.tenantId, tenantId),
        eq(dataSubjectRequests.status, "submitted"),
        lte(dataSubjectRequests.dueDate, new Date())
      )
    );
}

// ============================================================================
// DATA RETENTION
// ============================================================================

/**
 * Default retention periods aligned with UAE regulations
 */
export const DEFAULT_RETENTION_PERIODS = {
  audit_logs: 365 * 7, // 7 years for audit logs
  user_data: 365 * 5, // 5 years for user data
  employment_records: 365 * 7, // 7 years for employment records
  license_records: 365 * 10, // 10 years for professional licenses
  financial_records: 365 * 7, // 7 years for financial records
  performance_reviews: 365 * 5, // 5 years for performance data
  training_records: 365 * 5, // 5 years for training records
  session_logs: 90, // 90 days for session logs
  temporary_data: 30, // 30 days for temporary data
};

/**
 * Set data retention policy for a tenant
 */
export async function setRetentionPolicy(data: {
  tenantId: number;
  dataCategory: string;
  retentionDays: number;
  autoDelete: boolean;
  archiveBeforeDelete: boolean;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(dataRetentionPolicies)
    .values({
      tenantId: data.tenantId,
      dataCategory: data.dataCategory,
      retentionDays: data.retentionDays,
      autoDelete: data.autoDelete,
      archiveBeforeDelete: data.archiveBeforeDelete,
    })
    .onConflictDoUpdate({
      target: [dataRetentionPolicies.tenantId, dataRetentionPolicies.dataCategory],
      set: {
        retentionDays: data.retentionDays,
        autoDelete: data.autoDelete,
        archiveBeforeDelete: data.archiveBeforeDelete,
      },
    });
}

// ============================================================================
// SECURITY REQUIREMENTS
// ============================================================================

/**
 * Security configuration requirements for TDRA alignment
 */
export const SECURITY_REQUIREMENTS = {
  // Transport security
  minTlsVersion: "1.2",
  requireHttps: true,

  // Password policy
  minPasswordLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxPasswordAge: 90, // days
  passwordHistoryCount: 12,

  // Session management
  sessionTimeout: 30, // minutes of inactivity
  maxConcurrentSessions: 3,
  requireMfa: true,

  // Encryption
  dataEncryptionAtRest: true,
  encryptionAlgorithm: "AES-256",

  // Access control
  maxLoginAttempts: 5,
  lockoutDuration: 30, // minutes
  requireIpWhitelist: false,
};

/**
 * Validate password meets TDRA security requirements
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < SECURITY_REQUIREMENTS.minPasswordLength) {
    errors.push(
      `Password must be at least ${SECURITY_REQUIREMENTS.minPasswordLength} characters`
    );
  }

  if (SECURITY_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (SECURITY_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (SECURITY_REQUIREMENTS.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (
    SECURITY_REQUIREMENTS.requireSpecialChars &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    errors.push("Password must contain at least one special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// CONTENT STANDARDS
// ============================================================================

/**
 * Content categories that may require additional review
 * These align with UAE content regulations
 */
export const CONTENT_CATEGORIES = {
  GENERAL: "general",
  EDUCATIONAL: "educational",
  GOVERNMENT: "government",
  SENSITIVE: "sensitive",
  PERSONAL_DATA: "personal_data",
} as const;

/**
 * Prohibited content types per UAE regulations
 */
export const PROHIBITED_CONTENT = [
  "content_threatening_national_security",
  "content_violating_public_morals",
  "content_promoting_discrimination",
  "content_infringing_privacy",
  "content_defamatory",
  "content_promoting_illegal_activities",
] as const;

// ============================================================================
// COMPLIANCE REPORTING
// ============================================================================

/**
 * Generate TDRA compliance report for a tenant
 */
export async function generateComplianceReport(tenantId: number): Promise<{
  tenantId: number;
  generatedAt: Date;
  dataResidency: { compliant: boolean; region: string };
  consentManagement: { totalConsents: number; activeConsents: number };
  dataRetention: { policiesConfigured: number };
  accessRequests: { total: number; pending: number; overdue: number };
  securityScore: number;
  recommendations: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tenant = await tenantService.getTenantById(tenantId);
  if (!tenant) throw new Error("Tenant not found");

  // Check data residency
  const dataResidency = {
    compliant: isDataRegionCompliant(tenant.dataRegion || "uae-north"),
    region: tenant.dataRegion || "uae-north",
  };

  // Count consents
  const consents = await db
    .select()
    .from(dataConsentRecords)
    .where(eq(dataConsentRecords.tenantId, tenantId));

  const activeConsents = consents.filter((c) => c.consentGiven && !c.revokedAt);

  // Count retention policies
  const policies = await db
    .select()
    .from(dataRetentionPolicies)
    .where(eq(dataRetentionPolicies.tenantId, tenantId));

  // Count access requests
  const requests = await db
    .select()
    .from(dataSubjectRequests)
    .where(eq(dataSubjectRequests.tenantId, tenantId));

  const pendingRequests = requests.filter(
    (r) => r.status === "submitted" || r.status === "in_review"
  );
  const overdueRequests = pendingRequests.filter(
    (r) => r.dueDate < new Date()
  );

  // Calculate security score (simplified)
  let securityScore = 100;
  const recommendations: string[] = [];

  if (!dataResidency.compliant) {
    securityScore -= 20;
    recommendations.push(
      "Configure data storage in UAE or GCC region for compliance"
    );
  }

  if (overdueRequests.length > 0) {
    securityScore -= 15;
    recommendations.push(
      `${overdueRequests.length} data subject request(s) are overdue - respond within 30 days`
    );
  }

  if (policies.length < 5) {
    securityScore -= 10;
    recommendations.push("Configure data retention policies for all data categories");
  }

  if (!tenant.tdraCompliance) {
    securityScore -= 10;
    recommendations.push(
      "Complete TDRA compliance self-assessment and enable compliance flag"
    );
  }

  if (!tenant.dataProcessingAgreement) {
    securityScore -= 10;
    recommendations.push("Sign and upload Data Processing Agreement");
  }

  return {
    tenantId,
    generatedAt: new Date(),
    dataResidency,
    consentManagement: {
      totalConsents: consents.length,
      activeConsents: activeConsents.length,
    },
    dataRetention: {
      policiesConfigured: policies.length,
    },
    accessRequests: {
      total: requests.length,
      pending: pendingRequests.length,
      overdue: overdueRequests.length,
    },
    securityScore: Math.max(0, securityScore),
    recommendations,
  };
}

// ============================================================================
// DISCLAIMER
// ============================================================================

/**
 * Legal disclaimer to display to users
 */
export const TDRA_COMPLIANCE_DISCLAIMER = `
COMPLIANCE NOTICE

This system is designed to support TDRA-aligned operation for UAE-based 
organizations. However, this does not constitute legal certification or 
guarantee of regulatory compliance.

Organizations using this system must:
1. Obtain appropriate legal advice regarding TDRA and sector regulations
2. Apply for and maintain necessary licenses from TDRA
3. Conduct their own compliance assessments
4. Maintain responsibility for their use of the system

The system provides tools and features to support compliance, but ultimate 
responsibility for regulatory compliance rests with the organization.

For licensing and regulatory guidance, contact TDRA at:
- Website: https://tdra.gov.ae
- Email: info@tdra.gov.ae
`;
