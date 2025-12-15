/**
 * Email Service
 * 
 * Handles all email communications for the SaaS platform.
 * Uses nodemailer with SMTP (SendGrid, AWS SES, or other providers).
 */

import nodemailer from "nodemailer";

// ============================================================================
// CONFIGURATION
// ============================================================================

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

const config: EmailConfig = {
  host: process.env.SMTP_HOST || "smtp.sendgrid.net",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER || "apikey",
  password: process.env.SMTP_PASSWORD || "",
  from: process.env.EMAIL_FROM || "noreply@kafaat.ae",
};

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export const EmailTemplates = {
  // Trial ending soon (2 days before)
  trialEndingSoon: (data: { tenantName: string; daysRemaining: number; upgradeUrl: string }) => ({
    subject: `Your ${data.tenantName} trial ends in ${data.daysRemaining} days`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Your Trial is Ending Soon</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Your <strong>${data.tenantName}</strong> trial will expire in <strong>${data.daysRemaining} days</strong>.</p>
              <p>Don't lose access to these powerful features:</p>
              <div class="features">
                <div class="feature-item">✅ AI-Powered Career Recommendations</div>
                <div class="feature-item">✅ Comprehensive Performance Management</div>
                <div class="feature-item">✅ Teachers Licensing with Blockchain Verification</div>
                <div class="feature-item">✅ Workforce Planning & Analytics</div>
                <div class="feature-item">✅ Employee Engagement Surveys</div>
              </div>
              <p style="text-align: center;">
                <a href="${data.upgradeUrl}" class="button">Subscribe Now →</a>
              </p>
              <p>Questions? Reply to this email and our team will help you choose the right plan.</p>
            </div>
            <div class="footer">
              <p>Kafaat Talent Management System</p>
              <p>© ${new Date().getFullYear()} All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your ${data.tenantName} trial ends in ${data.daysRemaining} days. Subscribe now to continue using all features: ${data.upgradeUrl}`,
  }),

  // Trial expired
  trialExpired: (data: { tenantName: string; upgradeUrl: string }) => ({
    subject: `Your ${data.tenantName} trial has expired`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #EF4444, #F97316); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .offer { background: #FEF3C7; border: 2px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>😢 Your Trial Has Expired</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Your <strong>${data.tenantName}</strong> free trial has ended. Your account features are now limited.</p>
              <div class="offer">
                <h3>🎁 Special Offer</h3>
                <p>Subscribe within the next 48 hours and get <strong>20% off</strong> your first 3 months!</p>
              </div>
              <p style="text-align: center;">
                <a href="${data.upgradeUrl}" class="button">Reactivate My Account →</a>
              </p>
              <p>Your data is safe and will remain available once you subscribe. No setup needed!</p>
            </div>
            <div class="footer">
              <p>Kafaat Talent Management System</p>
              <p>© ${new Date().getFullYear()} All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your ${data.tenantName} trial has expired. Reactivate your account now: ${data.upgradeUrl}`,
  }),

  // Welcome email after signup
  welcome: (data: { tenantName: string; userName: string; loginUrl: string }) => ({
    subject: `Welcome to Kafaat - Your 7-day trial starts now!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981, #3B82F6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .step { display: flex; padding: 15px 0; border-bottom: 1px solid #e5e7eb; }
            .step-number { background: #3B82F6; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Kafaat!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Welcome to <strong>${data.tenantName}</strong>! Your 7-day free trial has started.</p>
              <h3>Getting Started:</h3>
              <div class="steps">
                <div class="step">
                  <div class="step-number">1</div>
                  <div><strong>Explore the Dashboard</strong><br>Get an overview of all modules</div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div><strong>Set Up Your Organization</strong><br>Add departments and employees</div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div><strong>Try Key Features</strong><br>Career paths, performance reviews, licensing</div>
                </div>
              </div>
              <p style="text-align: center;">
                <a href="${data.loginUrl}" class="button">Go to Dashboard →</a>
              </p>
            </div>
            <div class="footer">
              <p>Kafaat Talent Management System</p>
              <p>© ${new Date().getFullYear()} All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to Kafaat, ${data.userName}! Your 7-day free trial for ${data.tenantName} has started. Login here: ${data.loginUrl}`,
  }),

  // Subscription confirmed
  subscriptionConfirmed: (data: { tenantName: string; planName: string; dashboardUrl: string }) => ({
    subject: `🎉 Subscription Confirmed - ${data.planName} Plan`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .plan-badge { background: #ECFDF5; border: 2px solid #10B981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Subscription Confirmed!</h1>
            </div>
            <div class="content">
              <p>Great news!</p>
              <p>Your <strong>${data.tenantName}</strong> subscription has been activated.</p>
              <div class="plan-badge">
                <h2 style="margin: 0; color: #10B981;">${data.planName} Plan</h2>
                <p style="margin: 10px 0 0 0;">Full access to all features</p>
              </div>
              <p style="text-align: center;">
                <a href="${data.dashboardUrl}" class="button">Go to Dashboard →</a>
              </p>
              <p>Thank you for choosing Kafaat. We're here to help you succeed!</p>
            </div>
            <div class="footer">
              <p>Kafaat Talent Management System</p>
              <p>© ${new Date().getFullYear()} All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your ${data.tenantName} subscription (${data.planName} Plan) has been activated. Go to your dashboard: ${data.dashboardUrl}`,
  }),
};

// ============================================================================
// EMAIL SERVICE CLASS
// ============================================================================

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (config.password) {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
      });
    } else {
      console.warn("[Email] SMTP not configured. Emails will be logged only.");
    }
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return this.transporter !== null;
  }

  /**
   * Send an email
   */
  async send(to: string, template: { subject: string; html: string; text: string }): Promise<boolean> {
    console.log(`[Email] Sending to ${to}: ${template.subject}`);

    if (!this.transporter) {
      console.log("[Email] Would send:", { to, subject: template.subject });
      return true; // Pretend success in development
    }

    try {
      await this.transporter.sendMail({
        from: config.from,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
      console.log(`[Email] Sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error(`[Email] Failed to send to ${to}:`, error);
      return false;
    }
  }

  /**
   * Send trial ending soon notification
   */
  async sendTrialEndingSoon(
    email: string,
    tenantName: string,
    daysRemaining: number,
    baseUrl: string
  ): Promise<boolean> {
    const template = EmailTemplates.trialEndingSoon({
      tenantName,
      daysRemaining,
      upgradeUrl: `${baseUrl}/pricing`,
    });
    return this.send(email, template);
  }

  /**
   * Send trial expired notification
   */
  async sendTrialExpired(email: string, tenantName: string, baseUrl: string): Promise<boolean> {
    const template = EmailTemplates.trialExpired({
      tenantName,
      upgradeUrl: `${baseUrl}/pricing`,
    });
    return this.send(email, template);
  }

  /**
   * Send welcome email
   */
  async sendWelcome(
    email: string,
    userName: string,
    tenantName: string,
    baseUrl: string
  ): Promise<boolean> {
    const template = EmailTemplates.welcome({
      tenantName,
      userName,
      loginUrl: `${baseUrl}/dashboard`,
    });
    return this.send(email, template);
  }

  /**
   * Send subscription confirmed email
   */
  async sendSubscriptionConfirmed(
    email: string,
    tenantName: string,
    planName: string,
    baseUrl: string
  ): Promise<boolean> {
    const template = EmailTemplates.subscriptionConfirmed({
      tenantName,
      planName,
      dashboardUrl: `${baseUrl}/dashboard`,
    });
    return this.send(email, template);
  }
}

// Singleton instance
export const emailService = new EmailService();
