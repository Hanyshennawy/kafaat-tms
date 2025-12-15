/**
 * Real-time Notification Service
 * 
 * Handles in-app notifications, email notifications, and push notifications.
 * Supports real-time updates via WebSocket/SSE.
 */

import { getDb } from "../db";
import { emailService } from "./email.service";

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "action_required";

export type NotificationCategory =
  | "system"
  | "career"
  | "performance"
  | "licensing"
  | "recruitment"
  | "engagement"
  | "placement"
  | "competency"
  | "approval";

export interface Notification {
  id: string;
  userId: number;
  tenantId?: number;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  link?: string;
  icon?: string;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  userId: number;
  emailEnabled: boolean;
  pushEnabled: boolean;
  categories: Record<NotificationCategory, {
    inApp: boolean;
    email: boolean;
    push: boolean;
  }>;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "08:00"
  timezone: string;
}

export interface NotificationTemplate {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  emailSubject?: string;
  emailBody?: string;
}

// ============================================================================
// IN-MEMORY STORE (Replace with database in production)
// ============================================================================

const notifications: Map<number, Notification[]> = new Map();
const preferences: Map<number, NotificationPreferences> = new Map();
const subscribers: Map<number, ((notification: Notification) => void)[]> = new Map();

let notificationIdCounter = 1;

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

const templates: Record<string, NotificationTemplate> = {
  // Performance
  "performance.goal_assigned": {
    id: "performance.goal_assigned",
    category: "performance",
    title: "New Goal Assigned",
    message: "You have been assigned a new goal: {{goalName}}",
    emailSubject: "New Goal Assigned - Kafaat TMS",
    emailBody: "Dear {{userName}},\n\nA new goal has been assigned to you:\n\n{{goalName}}\n\nDeadline: {{deadline}}\n\nPlease log in to view the details.",
  },
  "performance.review_due": {
    id: "performance.review_due",
    category: "performance",
    title: "Performance Review Due",
    message: "Your performance review for {{cycleName}} is due in {{daysRemaining}} days",
    emailSubject: "Performance Review Due - Action Required",
  },
  "performance.feedback_received": {
    id: "performance.feedback_received",
    category: "performance",
    title: "New Feedback Received",
    message: "You have received 360° feedback from {{feedbackCount}} colleagues",
  },

  // Licensing
  "licensing.application_submitted": {
    id: "licensing.application_submitted",
    category: "licensing",
    title: "License Application Submitted",
    message: "Your license application #{{applicationId}} has been submitted successfully",
    emailSubject: "License Application Submitted - Kafaat TMS",
  },
  "licensing.application_approved": {
    id: "licensing.application_approved",
    category: "licensing",
    title: "License Approved! 🎉",
    message: "Congratulations! Your teaching license has been approved",
    emailSubject: "Your Teaching License Has Been Approved!",
  },
  "licensing.application_rejected": {
    id: "licensing.application_rejected",
    category: "licensing",
    title: "License Application Update",
    message: "Your license application requires attention. Reason: {{reason}}",
  },
  "licensing.renewal_reminder": {
    id: "licensing.renewal_reminder",
    category: "licensing",
    title: "License Renewal Reminder",
    message: "Your teaching license expires in {{daysRemaining}} days. Please renew.",
    emailSubject: "Teaching License Renewal Reminder",
  },

  // Recruitment
  "recruitment.application_received": {
    id: "recruitment.application_received",
    category: "recruitment",
    title: "New Application Received",
    message: "{{candidateName}} applied for {{jobTitle}}",
  },
  "recruitment.interview_scheduled": {
    id: "recruitment.interview_scheduled",
    category: "recruitment",
    title: "Interview Scheduled",
    message: "Interview with {{candidateName}} scheduled for {{dateTime}}",
    emailSubject: "Interview Scheduled - {{jobTitle}}",
  },

  // Engagement
  "engagement.survey_assigned": {
    id: "engagement.survey_assigned",
    category: "engagement",
    title: "New Survey Available",
    message: "Please complete the {{surveyName}} by {{deadline}}",
    emailSubject: "Survey: {{surveyName}} - Your Feedback Needed",
  },
  "engagement.survey_reminder": {
    id: "engagement.survey_reminder",
    category: "engagement",
    title: "Survey Reminder",
    message: "Don't forget to complete {{surveyName}}. Deadline: {{deadline}}",
  },

  // Approval Workflows
  "approval.request_pending": {
    id: "approval.request_pending",
    category: "approval",
    title: "Approval Required",
    message: "{{requestType}} from {{requesterName}} requires your approval",
    emailSubject: "Approval Required: {{requestType}}",
  },
  "approval.request_approved": {
    id: "approval.request_approved",
    category: "approval",
    title: "Request Approved ✓",
    message: "Your {{requestType}} has been approved by {{approverName}}",
  },
  "approval.request_rejected": {
    id: "approval.request_rejected",
    category: "approval",
    title: "Request Not Approved",
    message: "Your {{requestType}} was not approved. Reason: {{reason}}",
  },

  // Career
  "career.path_recommended": {
    id: "career.path_recommended",
    category: "career",
    title: "Career Path Recommendation",
    message: "Based on your profile, we recommend exploring: {{pathName}}",
  },
  "career.skill_gap_identified": {
    id: "career.skill_gap_identified",
    category: "career",
    title: "Skill Development Opportunity",
    message: "Developing {{skillName}} could help advance your career",
  },

  // Placement
  "placement.transfer_approved": {
    id: "placement.transfer_approved",
    category: "placement",
    title: "Transfer Approved",
    message: "Your transfer to {{departmentName}} has been approved",
    emailSubject: "Transfer Request Approved",
  },

  // Competency
  "competency.assessment_due": {
    id: "competency.assessment_due",
    category: "competency",
    title: "Competency Assessment Due",
    message: "Complete your {{competencyName}} assessment by {{deadline}}",
  },
  "competency.level_achieved": {
    id: "competency.level_achieved",
    category: "competency",
    title: "Competency Level Achieved! 🏆",
    message: "Congratulations! You've achieved {{level}} in {{competencyName}}",
  },

  // System
  "system.trial_expiring": {
    id: "system.trial_expiring",
    category: "system",
    title: "Trial Expiring Soon",
    message: "Your trial expires in {{daysRemaining}} days. Upgrade to continue.",
  },
  "system.maintenance": {
    id: "system.maintenance",
    category: "system",
    title: "Scheduled Maintenance",
    message: "System maintenance scheduled for {{dateTime}}. Duration: {{duration}}",
  },
};

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

class NotificationService {
  /**
   * Create and send a notification
   */
  async notify(
    userId: number,
    options: {
      type: NotificationType;
      category: NotificationCategory;
      title: string;
      message: string;
      link?: string;
      icon?: string;
      tenantId?: number;
      metadata?: Record<string, any>;
      sendEmail?: boolean;
      emailSubject?: string;
      emailBody?: string;
      expiresInDays?: number;
    }
  ): Promise<Notification> {
    const notification: Notification = {
      id: `notif_${notificationIdCounter++}`,
      userId,
      tenantId: options.tenantId,
      type: options.type,
      category: options.category,
      title: options.title,
      message: options.message,
      link: options.link,
      icon: options.icon,
      read: false,
      createdAt: new Date(),
      expiresAt: options.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined,
      metadata: options.metadata,
    };

    // Store notification
    if (!notifications.has(userId)) {
      notifications.set(userId, []);
    }
    notifications.get(userId)!.unshift(notification);

    // Limit stored notifications per user
    const userNotifications = notifications.get(userId)!;
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }

    // Real-time push to subscribers
    const userSubscribers = subscribers.get(userId);
    if (userSubscribers) {
      for (const callback of userSubscribers) {
        try {
          callback(notification);
        } catch (error) {
          console.error("[Notification] Subscriber callback failed:", error);
        }
      }
    }

    // Send email if requested
    if (options.sendEmail) {
      await this.sendEmailNotification(userId, notification, options.emailSubject, options.emailBody);
    }

    console.log(`[Notification] Sent to user ${userId}: ${options.title}`);

    return notification;
  }

  /**
   * Send notification using a template
   */
  async notifyFromTemplate(
    userId: number,
    templateId: string,
    variables: Record<string, string>,
    options: {
      tenantId?: number;
      link?: string;
      sendEmail?: boolean;
      type?: NotificationType;
    } = {}
  ): Promise<Notification | null> {
    const template = templates[templateId];
    if (!template) {
      console.error(`[Notification] Template not found: ${templateId}`);
      return null;
    }

    const title = this.interpolate(template.title, variables);
    const message = this.interpolate(template.message, variables);
    const emailSubject = template.emailSubject
      ? this.interpolate(template.emailSubject, variables)
      : undefined;
    const emailBody = template.emailBody
      ? this.interpolate(template.emailBody, variables)
      : undefined;

    return this.notify(userId, {
      type: options.type || "info",
      category: template.category,
      title,
      message,
      link: options.link,
      tenantId: options.tenantId,
      sendEmail: options.sendEmail,
      emailSubject,
      emailBody,
    });
  }

  /**
   * Send bulk notifications
   */
  async notifyMany(
    userIds: number[],
    options: {
      type: NotificationType;
      category: NotificationCategory;
      title: string;
      message: string;
      link?: string;
      tenantId?: number;
      sendEmail?: boolean;
    }
  ): Promise<number> {
    let sentCount = 0;
    for (const userId of userIds) {
      await this.notify(userId, options);
      sentCount++;
    }
    return sentCount;
  }

  /**
   * Get notifications for a user
   */
  getNotifications(
    userId: number,
    options: {
      unreadOnly?: boolean;
      category?: NotificationCategory;
      limit?: number;
      offset?: number;
    } = {}
  ): { notifications: Notification[]; total: number; unreadCount: number } {
    let userNotifications = notifications.get(userId) || [];

    // Filter expired
    const now = new Date();
    userNotifications = userNotifications.filter(
      (n) => !n.expiresAt || n.expiresAt > now
    );

    const unreadCount = userNotifications.filter((n) => !n.read).length;

    if (options.unreadOnly) {
      userNotifications = userNotifications.filter((n) => !n.read);
    }

    if (options.category) {
      userNotifications = userNotifications.filter(
        (n) => n.category === options.category
      );
    }

    const total = userNotifications.length;

    // Pagination
    const offset = options.offset || 0;
    const limit = options.limit || 20;
    userNotifications = userNotifications.slice(offset, offset + limit);

    return { notifications: userNotifications, total, unreadCount };
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId: number, notificationId: string): boolean {
    const userNotifications = notifications.get(userId);
    if (!userNotifications) return false;

    const notification = userNotifications.find((n) => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      notification.readAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(userId: number, category?: NotificationCategory): number {
    const userNotifications = notifications.get(userId);
    if (!userNotifications) return 0;

    let count = 0;
    for (const notification of userNotifications) {
      if (!notification.read) {
        if (!category || notification.category === category) {
          notification.read = true;
          notification.readAt = new Date();
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Delete a notification
   */
  delete(userId: number, notificationId: string): boolean {
    const userNotifications = notifications.get(userId);
    if (!userNotifications) return false;

    const index = userNotifications.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      userNotifications.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Subscribe to real-time notifications
   */
  subscribe(userId: number, callback: (notification: Notification) => void): () => void {
    if (!subscribers.has(userId)) {
      subscribers.set(userId, []);
    }
    subscribers.get(userId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const userSubscribers = subscribers.get(userId);
      if (userSubscribers) {
        const index = userSubscribers.indexOf(callback);
        if (index !== -1) {
          userSubscribers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Get/set user notification preferences
   */
  getPreferences(userId: number): NotificationPreferences {
    return preferences.get(userId) || this.getDefaultPreferences(userId);
  }

  setPreferences(userId: number, prefs: Partial<NotificationPreferences>): NotificationPreferences {
    const current = this.getPreferences(userId);
    const updated = { ...current, ...prefs };
    preferences.set(userId, updated);
    return updated;
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private async sendEmailNotification(
    userId: number,
    notification: Notification,
    subject?: string,
    body?: string
  ): Promise<void> {
    // In production, fetch user email from database
    // For now, just log
    console.log(`[Notification] Email queued for user ${userId}: ${subject || notification.title}`);
    
    // await emailService.send({
    //   to: userEmail,
    //   subject: subject || notification.title,
    //   text: body || notification.message,
    // });
  }

  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  private getDefaultPreferences(userId: number): NotificationPreferences {
    return {
      userId,
      emailEnabled: true,
      pushEnabled: true,
      categories: {
        system: { inApp: true, email: true, push: true },
        career: { inApp: true, email: false, push: false },
        performance: { inApp: true, email: true, push: true },
        licensing: { inApp: true, email: true, push: true },
        recruitment: { inApp: true, email: true, push: false },
        engagement: { inApp: true, email: true, push: false },
        placement: { inApp: true, email: true, push: false },
        competency: { inApp: true, email: false, push: false },
        approval: { inApp: true, email: true, push: true },
      },
      timezone: "Asia/Dubai",
    };
  }
}

// Singleton instance
export const notificationService = new NotificationService();
