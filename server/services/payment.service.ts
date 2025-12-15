/**
 * Stripe Payment Integration Service
 * 
 * Handles subscription management, billing, and payment processing.
 * Supports multiple pricing plans and usage-based billing.
 */

import Stripe from "stripe";
import { auditService } from "./audit.service";
import { emailService } from "./email.service";

// ============================================================================
// CONFIGURATION
// ============================================================================

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

const stripe = STRIPE_SECRET_KEY 
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-11-17.clover" as any })
  : null;

// ============================================================================
// TYPES
// ============================================================================

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  features: string[];
  limits: {
    users: number;
    departments: number;
    storage: number; // GB
    apiCalls: number;
  };
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  popular?: boolean;
}

export interface Subscription {
  id: string;
  tenantId: number;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  planId: string;
  status: "active" | "past_due" | "canceled" | "trialing" | "incomplete";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  tenantId: number;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  dueDate: Date;
  paidAt?: Date;
  invoiceUrl?: string;
  pdfUrl?: string;
}

export interface UsageRecord {
  tenantId: number;
  metric: "users" | "api_calls" | "storage" | "assessments";
  quantity: number;
  timestamp: Date;
}

// ============================================================================
// PRICING PLANS (In AED)
// ============================================================================

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small schools and departments",
    priceMonthly: 499, // ~$136 USD
    priceAnnual: 4990, // ~$1,360 USD (2 months free)
    currency: "AED",
    features: [
      "Up to 50 users",
      "5 departments",
      "Career Progression",
      "Performance Management",
      "Employee Engagement",
      "Basic Analytics",
      "Email Support",
    ],
    limits: {
      users: 50,
      departments: 5,
      storage: 10,
      apiCalls: 10000,
    },
    stripePriceIdMonthly: "price_starter_monthly",
    stripePriceIdAnnual: "price_starter_annual",
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing educational institutions",
    priceMonthly: 1499, // ~$408 USD
    priceAnnual: 14990, // ~$4,080 USD
    currency: "AED",
    features: [
      "Up to 200 users",
      "20 departments",
      "All Starter Features",
      "Teachers Licensing",
      "Workforce Planning",
      "Succession Planning",
      "Recruitment Module",
      "Advanced Analytics",
      "AI Recommendations",
      "Priority Support",
    ],
    limits: {
      users: 200,
      departments: 20,
      storage: 50,
      apiCalls: 50000,
    },
    stripePriceIdMonthly: "price_professional_monthly",
    stripePriceIdAnnual: "price_professional_annual",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For ministries and large organizations",
    priceMonthly: 4999, // ~$1,360 USD
    priceAnnual: 49990, // ~$13,600 USD
    currency: "AED",
    features: [
      "Unlimited users",
      "Unlimited departments",
      "All Professional Features",
      "Competency Assessments",
      "Psychometric Testing",
      "Staff Placement & Mobility",
      "Blockchain Verification",
      "Custom Integrations",
      "API Access",
      "Dedicated Account Manager",
      "On-premise Option",
      "24/7 Phone Support",
    ],
    limits: {
      users: -1, // Unlimited
      departments: -1,
      storage: 500,
      apiCalls: -1,
    },
    stripePriceIdMonthly: "price_enterprise_monthly",
    stripePriceIdAnnual: "price_enterprise_annual",
  },
];

// ============================================================================
// IN-MEMORY STORE (Replace with database in production)
// ============================================================================

const subscriptions: Map<number, Subscription> = new Map();
const invoices: Map<number, Invoice[]> = new Map();
const usageRecords: UsageRecord[] = [];

// ============================================================================
// PAYMENT SERVICE
// ============================================================================

class PaymentService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!stripe;
    if (this.isConfigured) {
      console.log("[Payment] Stripe configured");
    } else {
      console.log("[Payment] Stripe not configured. Set STRIPE_SECRET_KEY.");
    }
  }

  /**
   * Get pricing plans
   */
  getPricingPlans(): PricingPlan[] {
    return PRICING_PLANS;
  }

  /**
   * Get plan by ID
   */
  getPlan(planId: string): PricingPlan | undefined {
    return PRICING_PLANS.find((p) => p.id === planId);
  }

  /**
   * Create a Stripe checkout session
   */
  async createCheckoutSession(options: {
    tenantId: number;
    planId: string;
    billingPeriod: "monthly" | "annual";
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
  }): Promise<{ sessionId: string; url: string } | null> {
    if (!stripe) {
      console.error("[Payment] Stripe not configured");
      return null;
    }

    const plan = this.getPlan(options.planId);
    if (!plan) {
      throw new Error(`Plan not found: ${options.planId}`);
    }

    const priceId = options.billingPeriod === "annual"
      ? plan.stripePriceIdAnnual
      : plan.stripePriceIdMonthly;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
        customer_email: options.customerEmail,
        metadata: {
          tenantId: options.tenantId.toString(),
          planId: options.planId,
        },
        subscription_data: {
          metadata: {
            tenantId: options.tenantId.toString(),
            planId: options.planId,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: "required",
      });

      await auditService.success("subscription.changed", {
        tenantId: options.tenantId,
        entityType: "checkout",
        details: {
          planId: options.planId,
          billingPeriod: options.billingPeriod,
          sessionId: session.id,
        },
      });

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error("[Payment] Checkout session creation failed:", error);
      throw error;
    }
  }

  /**
   * Create a customer portal session for managing subscription
   */
  async createPortalSession(options: {
    tenantId: number;
    returnUrl: string;
  }): Promise<{ url: string } | null> {
    if (!stripe) {
      return null;
    }

    const subscription = this.getSubscription(options.tenantId);
    if (!subscription) {
      throw new Error("No subscription found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: options.returnUrl,
    });

    return { url: session.url };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe not configured");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err}`);
    }

    console.log(`[Payment] Webhook received: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.paid":
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Payment] Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Get subscription for tenant
   */
  getSubscription(tenantId: number): Subscription | undefined {
    return subscriptions.get(tenantId);
  }

  /**
   * Get invoices for tenant
   */
  getInvoices(tenantId: number): Invoice[] {
    return invoices.get(tenantId) || [];
  }

  /**
   * Check if tenant has access to a feature based on their plan
   */
  hasFeatureAccess(tenantId: number, feature: string): boolean {
    const subscription = this.getSubscription(tenantId);
    if (!subscription || subscription.status !== "active") {
      return false;
    }

    const plan = this.getPlan(subscription.planId);
    if (!plan) {
      return false;
    }

    return plan.features.some((f) =>
      f.toLowerCase().includes(feature.toLowerCase())
    );
  }

  /**
   * Check if tenant is within usage limits
   */
  checkUsageLimit(
    tenantId: number,
    metric: "users" | "departments" | "storage" | "apiCalls",
    currentUsage: number
  ): { allowed: boolean; limit: number; usage: number; percentage: number } {
    const subscription = this.getSubscription(tenantId);
    const plan = subscription
      ? this.getPlan(subscription.planId)
      : PRICING_PLANS[0]; // Default to starter

    const limit = plan?.limits[metric] ?? 0;
    const allowed = limit === -1 || currentUsage < limit;
    const percentage = limit === -1 ? 0 : (currentUsage / limit) * 100;

    return { allowed, limit, usage: currentUsage, percentage };
  }

  /**
   * Record usage for metered billing
   */
  async recordUsage(
    tenantId: number,
    metric: "users" | "api_calls" | "storage" | "assessments",
    quantity: number
  ): Promise<void> {
    usageRecords.push({
      tenantId,
      metric,
      quantity,
      timestamp: new Date(),
    });

    // In production, report to Stripe for metered billing
    // await stripe.subscriptionItems.createUsageRecord(...)
  }

  /**
   * Get usage summary for tenant
   */
  getUsageSummary(tenantId: number): Record<string, number> {
    const tenantRecords = usageRecords.filter((r) => r.tenantId === tenantId);
    return tenantRecords.reduce((acc, record) => {
      acc[record.metric] = (acc[record.metric] || 0) + record.quantity;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    tenantId: number,
    immediately = false
  ): Promise<boolean> {
    if (!stripe) {
      return false;
    }

    const subscription = this.getSubscription(tenantId);
    if (!subscription) {
      return false;
    }

    try {
      if (immediately) {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        subscription.status = "canceled";
      } else {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        subscription.cancelAtPeriodEnd = true;
      }

      subscriptions.set(tenantId, subscription);

      await auditService.success("subscription.changed", {
        tenantId,
        entityType: "subscription",
        details: {
          action: "canceled",
          immediately,
        },
      });

      return true;
    } catch (error) {
      console.error("[Payment] Cancel subscription failed:", error);
      return false;
    }
  }

  /**
   * Reactivate subscription (undo cancel at period end)
   */
  async reactivateSubscription(tenantId: number): Promise<boolean> {
    if (!stripe) {
      return false;
    }

    const subscription = this.getSubscription(tenantId);
    if (!subscription || !subscription.cancelAtPeriodEnd) {
      return false;
    }

    try {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      subscription.cancelAtPeriodEnd = false;
      subscriptions.set(tenantId, subscription);

      return true;
    } catch (error) {
      console.error("[Payment] Reactivate subscription failed:", error);
      return false;
    }
  }

  // ============================================================================
  // WEBHOOK HANDLERS
  // ============================================================================

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const tenantId = parseInt(session.metadata?.tenantId || "0");
    const planId = session.metadata?.planId || "starter";

    if (!tenantId) {
      console.error("[Payment] No tenantId in checkout session");
      return;
    }

    console.log(`[Payment] Checkout completed for tenant ${tenantId}`);
  }

  private async handleSubscriptionUpdated(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    const tenantId = parseInt(stripeSubscription.metadata?.tenantId || "0");
    const planId = stripeSubscription.metadata?.planId || "starter";

    if (!tenantId) {
      return;
    }

    // Cast to any to handle Stripe API version differences
    const sub: any = stripeSubscription;
    const subscription: Subscription = {
      id: stripeSubscription.id,
      tenantId,
      stripeCustomerId: stripeSubscription.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      planId,
      status: stripeSubscription.status as Subscription["status"],
      currentPeriodStart: new Date((sub.current_period_start || Date.now() / 1000) * 1000),
      currentPeriodEnd: new Date((sub.current_period_end || Date.now() / 1000) * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      createdAt: new Date(stripeSubscription.created * 1000),
      updatedAt: new Date(),
    };

    subscriptions.set(tenantId, subscription);
    console.log(`[Payment] Subscription updated for tenant ${tenantId}: ${stripeSubscription.status}`);
  }

  private async handleSubscriptionDeleted(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    const tenantId = parseInt(stripeSubscription.metadata?.tenantId || "0");

    if (!tenantId) {
      return;
    }

    const subscription = subscriptions.get(tenantId);
    if (subscription) {
      subscription.status = "canceled";
      subscriptions.set(tenantId, subscription);
    }

    console.log(`[Payment] Subscription canceled for tenant ${tenantId}`);
  }

  private async handleInvoicePaid(stripeInvoice: Stripe.Invoice): Promise<void> {
    // Cast to any to handle Stripe API version differences
    const inv: any = stripeInvoice;
    const tenantId = parseInt(inv.subscription_details?.metadata?.tenantId || stripeInvoice.metadata?.tenantId || "0");

    if (!tenantId) {
      return;
    }

    const invoice: Invoice = {
      id: stripeInvoice.id,
      tenantId,
      stripeInvoiceId: stripeInvoice.id,
      amount: stripeInvoice.amount_paid / 100,
      currency: stripeInvoice.currency.toUpperCase(),
      status: "paid",
      dueDate: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000) : new Date(),
      paidAt: new Date(),
      invoiceUrl: stripeInvoice.hosted_invoice_url || undefined,
      pdfUrl: stripeInvoice.invoice_pdf || undefined,
    };

    const tenantInvoices = invoices.get(tenantId) || [];
    tenantInvoices.push(invoice);
    invoices.set(tenantId, tenantInvoices);

    console.log(`[Payment] Invoice paid for tenant ${tenantId}: ${invoice.amount} ${invoice.currency}`);
  }

  private async handleInvoicePaymentFailed(
    stripeInvoice: Stripe.Invoice
  ): Promise<void> {
    // Cast to any to handle Stripe API version differences
    const inv: any = stripeInvoice;
    const tenantId = parseInt(inv.subscription_details?.metadata?.tenantId || stripeInvoice.metadata?.tenantId || "0");

    if (!tenantId) {
      return;
    }

    console.log(`[Payment] Invoice payment failed for tenant ${tenantId}`);

    // Send notification email
    // await emailService.sendPaymentFailedEmail(...)
  }

  /**
   * Get Stripe publishable key for frontend
   */
  getPublishableKey(): string | null {
    return STRIPE_PUBLISHABLE_KEY || null;
  }
}

// Singleton instance
export const paymentService = new PaymentService();
