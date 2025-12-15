/**
 * Audit Logging Service
 * 
 * Comprehensive audit trail for compliance and security.
 * Tracks all important actions in the system.
 */

import { getDb } from "../db";

// ============================================================================
// TYPES
// ============================================================================

export type AuditAction =
  // Authentication
  | "auth.login"
  | "auth.logout"
  | "auth.login_failed"
  | "auth.password_reset"
  | "auth.mfa_enabled"
  // User Management
  | "user.created"
  | "user.updated"
  | "user.deleted"
  | "user.role_changed"
  | "user.suspended"
  | "user.activated"
  // Career
  | "career_path.created"
  | "career_path.updated"
  | "career_path.deleted"
  | "career_path.published"
  // Succession
  | "succession_plan.created"
  | "succession_plan.updated"
  | "succession_plan.deleted"
  // Performance
  | "performance_cycle.created"
  | "performance_cycle.started"
  | "performance_cycle.completed"
  | "goal.created"
  | "goal.updated"
  | "goal.completed"
  | "review.submitted"
  | "review.approved"
  // Licensing
  | "license.applied"
  | "license.approved"
  | "license.rejected"
  | "license.renewed"
  | "license.suspended"
  | "license.verified"
  // Recruitment
  | "job.created"
  | "job.published"
  | "job.closed"
  | "candidate.added"
  | "candidate.status_changed"
  | "interview.scheduled"
  | "offer.sent"
  | "offer.accepted"
  // Engagement
  | "survey.created"
  | "survey.published"
  | "survey.completed"
  | "survey.response_submitted"
  // Placement
  | "placement.requested"
  | "placement.approved"
  | "placement.rejected"
  | "transfer.completed"
  // Competency
  | "assessment.started"
  | "assessment.completed"
  | "evidence.submitted"
  | "competency.verified"
  // Data
  | "data.exported"
  | "data.imported"
  | "report.generated"
  | "file.uploaded"
  | "file.deleted"
  | "file.created"
  // AI
  | "ai.analysis"
  | "ai.resume_parsed"
  | "ai.recommendations"
  // System
  | "settings.updated"
  | "tenant.created"
  | "tenant.updated"
  | "subscription.changed"
  | "api.accessed";

export interface AuditLogEntry {
  id?: number;
  tenantId?: number;
  userId?: number;
  userEmail?: string;
  userName?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export interface AuditQueryOptions {
  tenantId?: number;
  userId?: number;
  action?: AuditAction | AuditAction[];
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// IN-MEMORY STORE (Replace with database in production)
// ============================================================================

const auditLogs: AuditLogEntry[] = [];
let auditLogIdCounter = 1;

// ============================================================================
// AUDIT SERVICE
// ============================================================================

class AuditService {
  /**
   * Log an audit event
   */
  async log(entry: Omit<AuditLogEntry, "id" | "timestamp">): Promise<void> {
    const logEntry: AuditLogEntry = {
      ...entry,
      id: auditLogIdCounter++,
      timestamp: new Date(),
    };

    // Store in memory (in production, write to database)
    auditLogs.push(logEntry);

    // Also log to console for debugging
    const icon = entry.success ? "✅" : "❌";
    console.log(
      `[Audit] ${icon} ${entry.action} | User: ${entry.userEmail || "anonymous"} | Entity: ${entry.entityType}:${entry.entityId || "N/A"}`
    );

    // In production, also write to database
    try {
      const db = await getDb();
      if (db) {
        // Write to audit_logs table if it exists
        // await db.insert(auditLogs).values(logEntry);
      }
    } catch (error) {
      // Silently fail - don't break the app if audit logging fails
      console.error("[Audit] Failed to write to database:", error);
    }
  }

  /**
   * Quick log helper for successful actions
   */
  async success(
    action: AuditAction,
    context: {
      userId?: number;
      userEmail?: string;
      userName?: string;
      tenantId?: number;
      entityType?: string;
      entityId?: string;
      entityName?: string;
      details?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    await this.log({
      ...context,
      action,
      success: true,
    });
  }

  /**
   * Quick log helper for failed actions
   */
  async failure(
    action: AuditAction,
    errorMessage: string,
    context: {
      userId?: number;
      userEmail?: string;
      userName?: string;
      tenantId?: number;
      entityType?: string;
      entityId?: string;
      entityName?: string;
      details?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    await this.log({
      ...context,
      action,
      success: false,
      errorMessage,
    });
  }

  /**
   * Query audit logs
   */
  async query(options: AuditQueryOptions): Promise<{
    logs: AuditLogEntry[];
    total: number;
  }> {
    let filtered = [...auditLogs];

    if (options.tenantId !== undefined) {
      filtered = filtered.filter((l) => l.tenantId === options.tenantId);
    }

    if (options.userId !== undefined) {
      filtered = filtered.filter((l) => l.userId === options.userId);
    }

    if (options.action) {
      const actions = Array.isArray(options.action)
        ? options.action
        : [options.action];
      filtered = filtered.filter((l) => actions.includes(l.action));
    }

    if (options.entityType) {
      filtered = filtered.filter((l) => l.entityType === options.entityType);
    }

    if (options.entityId) {
      filtered = filtered.filter((l) => l.entityId === options.entityId);
    }

    if (options.startDate) {
      filtered = filtered.filter((l) => l.timestamp >= options.startDate!);
    }

    if (options.endDate) {
      filtered = filtered.filter((l) => l.timestamp <= options.endDate!);
    }

    if (options.success !== undefined) {
      filtered = filtered.filter((l) => l.success === options.success);
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = filtered.length;

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    filtered = filtered.slice(offset, offset + limit);

    return { logs: filtered, total };
  }

  /**
   * Get recent activity for a user
   */
  async getUserActivity(
    userId: number,
    limit = 20
  ): Promise<AuditLogEntry[]> {
    const result = await this.query({ userId, limit });
    return result.logs;
  }

  /**
   * Get recent activity for an entity
   */
  async getEntityHistory(
    entityType: string,
    entityId: string,
    limit = 50
  ): Promise<AuditLogEntry[]> {
    const result = await this.query({ entityType, entityId, limit });
    return result.logs;
  }

  /**
   * Get security events (login attempts, etc.)
   */
  async getSecurityEvents(
    tenantId?: number,
    limit = 100
  ): Promise<AuditLogEntry[]> {
    const securityActions: AuditAction[] = [
      "auth.login",
      "auth.logout",
      "auth.login_failed",
      "auth.password_reset",
      "auth.mfa_enabled",
      "user.role_changed",
      "user.suspended",
    ];

    const result = await this.query({
      tenantId,
      action: securityActions,
      limit,
    });
    return result.logs;
  }

  /**
   * Get compliance report data
   */
  async getComplianceReport(
    tenantId: number,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    successRate: number;
    topUsers: { userId: number; userName: string; actionCount: number }[];
    sensitiveActions: AuditLogEntry[];
  }> {
    const result = await this.query({
      tenantId,
      startDate,
      endDate,
      limit: 10000,
    });

    const actionsByType: Record<string, number> = {};
    const userActions: Record<number, { name: string; count: number }> = {};
    let successCount = 0;

    const sensitiveActionTypes: AuditAction[] = [
      "user.deleted",
      "user.role_changed",
      "data.exported",
      "license.approved",
      "license.suspended",
    ];
    const sensitiveActions: AuditLogEntry[] = [];

    for (const log of result.logs) {
      // Count by action type
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;

      // Count successes
      if (log.success) successCount++;

      // Count by user
      if (log.userId) {
        if (!userActions[log.userId]) {
          userActions[log.userId] = { name: log.userName || "Unknown", count: 0 };
        }
        userActions[log.userId].count++;
      }

      // Collect sensitive actions
      if (sensitiveActionTypes.includes(log.action)) {
        sensitiveActions.push(log);
      }
    }

    const topUsers = Object.entries(userActions)
      .map(([userId, data]) => ({
        userId: parseInt(userId),
        userName: data.name,
        actionCount: data.count,
      }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 10);

    return {
      totalActions: result.total,
      actionsByType,
      successRate: result.total > 0 ? successCount / result.total : 1,
      topUsers,
      sensitiveActions: sensitiveActions.slice(0, 50),
    };
  }

  /**
   * Export audit logs for compliance
   */
  async exportLogs(
    options: AuditQueryOptions
  ): Promise<AuditLogEntry[]> {
    const result = await this.query({ ...options, limit: 100000 });
    return result.logs;
  }
}

// Singleton instance
export const auditService = new AuditService();

// ============================================================================
// HELPER MIDDLEWARE
// ============================================================================

/**
 * Extract audit context from request
 */
export function getAuditContext(req: any): {
  ipAddress?: string;
  userAgent?: string;
  userId?: number;
  userEmail?: string;
  userName?: string;
  tenantId?: number;
} {
  return {
    ipAddress: req.ip || req.headers?.["x-forwarded-for"] || req.connection?.remoteAddress,
    userAgent: req.headers?.["user-agent"],
    userId: req.user?.id,
    userEmail: req.user?.email,
    userName: req.user?.name,
    tenantId: req.tenantId,
  };
}
