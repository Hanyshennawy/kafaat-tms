/**
 * SaaS Catalog Service
 * 
 * Manages the unified marketplace catalog for all SaaS applications.
 * Each app is represented as a "card" with metadata, status, and actions.
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { saasApplications } from "../../drizzle/tenant-schema";
import { eq, desc } from "drizzle-orm";
import { tenantService } from "../services/tenant.service";

// ============================================================================
// TYPES
// ============================================================================

export interface SaasAppCard {
  id: number;
  appCode: string;
  name: string;
  displayName: string;
  shortDescription: string;
  category: string;
  tags: string[];
  iconUrl: string | null;
  primaryColor: string;
  status: "active" | "maintenance" | "coming_soon" | "deprecated";
  features: string[];
  isEnabled: boolean; // For current tenant
  actions: AppAction[];
}

export interface AppAction {
  id: string;
  label: string;
  icon: string;
  url: string;
  variant: "primary" | "secondary" | "outline";
}

// ============================================================================
// DEFAULT APPS CATALOG
// ============================================================================

/**
 * Built-in Talent Management System modules as catalog entries
 */
export const BUILT_IN_APPS: Omit<SaasAppCard, "id" | "isEnabled">[] = [
  {
    appCode: "career_progression",
    name: "Career Progression",
    displayName: "Career Progression & Mobility",
    shortDescription: "AI-driven career path recommendations and skill development tracking",
    category: "Talent Management",
    tags: ["AI", "Career", "Skills", "Development"],
    iconUrl: "/icons/career.svg",
    primaryColor: "#3B82F6",
    status: "active",
    features: [
      "AI-powered career recommendations",
      "Skill gap analysis",
      "Career path visualization",
      "Learning recommendations",
    ],
    actions: [
      { id: "open", label: "Open", icon: "ExternalLink", url: "/career/paths", variant: "primary" },
      { id: "settings", label: "Settings", icon: "Settings", url: "/admin/career", variant: "outline" },
    ],
  },
  {
    appCode: "succession_planning",
    name: "Succession Planning",
    displayName: "Succession Planning",
    shortDescription: "Leadership pipeline management and talent pool development",
    category: "Talent Management",
    tags: ["Leadership", "Pipeline", "Succession"],
    iconUrl: "/icons/succession.svg",
    primaryColor: "#8B5CF6",
    status: "active",
    features: [
      "Critical position mapping",
      "Successor readiness tracking",
      "Talent pool management",
      "Leadership assessments",
    ],
    actions: [
      { id: "open", label: "Open", icon: "ExternalLink", url: "/succession/plans", variant: "primary" },
    ],
  },
  {
    appCode: "workforce_planning",
    name: "Workforce Planning",
    displayName: "Workforce Planning",
    shortDescription: "Scenario modeling and dynamic resource allocation",
    category: "Workforce Management",
    tags: ["Planning", "Analytics", "Forecasting"],
    iconUrl: "/icons/workforce.svg",
    primaryColor: "#10B981",
    status: "active",
    features: [
      "Scenario modeling",
      "Headcount projections",
      "Resource allocation",
      "Workforce alerts",
    ],
    actions: [
      { id: "open", label: "Open", icon: "ExternalLink", url: "/workforce/scenarios", variant: "primary" },
    ],
  },
  {
    appCode: "employee_engagement",
    name: "Employee Engagement",
    displayName: "Employee Engagement",
    shortDescription: "Surveys, sentiment analysis, and engagement tracking",
    category: "Employee Experience",
    tags: ["Surveys", "Engagement", "Sentiment", "Pulse"],
    iconUrl: "/icons/engagement.svg",
    primaryColor: "#F59E0B",
    status: "active",
    features: [
      "Pulse surveys",
      "Sentiment analysis",
      "Engagement scoring",
      "Action planning",
    ],
    actions: [
      { id: "open", label: "Open", icon: "ExternalLink", url: "/engagement/surveys", variant: "primary" },
    ],
  },
  {
    appCode: "recruitment",
    name: "Recruitment",
    displayName: "Recruitment & Talent Acquisition",
    shortDescription: "AI-powered hiring with resume parsing and candidate matching",
    category: "Talent Acquisition",
    tags: ["Hiring", "AI", "Candidates", "ATS"],
    iconUrl: "/icons/recruitment.svg",
    primaryColor: "#EF4444",
    status: "active",
    features: [
      "AI resume parsing",
      "Candidate matching",
      "Interview scheduling",
      "Offer management",
    ],
    actions: [
      { id: "open", label: "Open", icon: "ExternalLink", url: "/recruitment/dashboard", variant: "primary" },
    ],
  },
  {
    appCode: "performance_management",
    name: "Performance Management",
    displayName: "Performance Management",
    shortDescription: "SMART goals, 360° feedback, and continuous performance tracking",
    category: "Performance",
    tags: ["Goals", "Feedback", "Reviews", "OKRs"],
    iconUrl: "/icons/performance.svg",
    primaryColor: "#06B6D4",
    status: "active",
    features: [
      "SMART goal setting",
      "360° feedback",
      "Self-appraisals",
      "Manager reviews",
    ],
    actions: [
      { id: "open", label: "Open", icon: "ExternalLink", url: "/performance/dashboard", variant: "primary" },
    ],
  },
  {
    appCode: "teachers_licensing",
    name: "Teachers Licensing",
    displayName: "Teachers Licensing",
    shortDescription: "Complete licensing lifecycle with blockchain verification",
    category: "Licensing & Compliance",
    tags: ["Licensing", "Blockchain", "Verification", "CPD"],
    iconUrl: "/icons/licensing.svg",
    primaryColor: "#84CC16",
    status: "active",
    features: [
      "License applications",
      "Blockchain verification",
      "CPD tracking",
      "Renewal management",
    ],
    actions: [
      { id: "open", label: "Open", icon: "ExternalLink", url: "/licensing/portal", variant: "primary" },
      { id: "verify", label: "Verify License", icon: "Shield", url: "/licensing/verification", variant: "secondary" },
    ],
  },
  {
    appCode: "competency_assessments",
    name: "Competency Assessments",
    displayName: "Educator Competency Assessments",
    shortDescription: "Framework-based competency evaluation and development",
    category: "Assessment",
    tags: ["Competency", "Assessment", "Standards", "Development"],
    iconUrl: "/icons/competency.svg",
    primaryColor: "#EC4899",
    status: "active",
    features: [
      "Competency frameworks",
      "Self-assessments",
      "Evidence upload",
      "Development plans",
    ],
    actions: [
      { id: "open", label: "Open", icon: "ExternalLink", url: "/competency/frameworks", variant: "primary" },
    ],
  },
  {
    appCode: "staff_placement",
    name: "Staff Placement",
    displayName: "Staff Placement & Mobility",
    shortDescription: "Manage staff placements, transfers, and school assignments",
    category: "Workforce Management",
    tags: ["Placement", "Transfer", "Mobility", "Schools"],
    iconUrl: "/icons/placement.svg",
    primaryColor: "#14B8A6",
    status: "active",
    features: [
      "Placement requests",
      "Transfer management",
      "Staff directory",
      "Analytics dashboard",
    ],
    actions: [
      { id: "open", label: "Open", icon: "ExternalLink", url: "/placement/dashboard", variant: "primary" },
    ],
  },
  {
    appCode: "psychometric_assessments",
    name: "Psychometric Assessments",
    displayName: "Psychometric Assessments",
    shortDescription: "Personality profiles, cognitive ability, and behavioral assessments",
    category: "Assessment",
    tags: ["Psychometric", "Personality", "Cognitive", "Behavioral"],
    iconUrl: "/icons/psychometric.svg",
    primaryColor: "#6366F1",
    status: "active",
    features: [
      "Personality profiling",
      "Cognitive ability tests",
      "Emotional intelligence",
      "Team compatibility",
    ],
    actions: [
      { id: "open", label: "Open", icon: "ExternalLink", url: "/psychometric/dashboard", variant: "primary" },
    ],
  },
];

// ============================================================================
// CATALOG SERVICE
// ============================================================================

class CatalogService {
  /**
   * Get all apps for a tenant with enabled status
   */
  async getAppsForTenant(tenantId: number | null): Promise<SaasAppCard[]> {
    const apps: SaasAppCard[] = [];

    for (const app of BUILT_IN_APPS) {
      let isEnabled = true;

      if (tenantId) {
        isEnabled = await tenantService.isFeatureEnabled(tenantId, app.appCode);
      }

      apps.push({
        ...app,
        id: BUILT_IN_APPS.indexOf(app) + 1,
        isEnabled,
      });
    }

    return apps;
  }

  /**
   * Get a single app by code
   */
  async getAppByCode(
    appCode: string,
    tenantId: number | null
  ): Promise<SaasAppCard | null> {
    const app = BUILT_IN_APPS.find((a) => a.appCode === appCode);
    if (!app) return null;

    let isEnabled = true;
    if (tenantId) {
      isEnabled = await tenantService.isFeatureEnabled(tenantId, appCode);
    }

    return {
      ...app,
      id: BUILT_IN_APPS.indexOf(app) + 1,
      isEnabled,
    };
  }

  /**
   * Get apps grouped by category
   */
  async getAppsByCategory(tenantId: number | null): Promise<
    Record<string, SaasAppCard[]>
  > {
    const apps = await this.getAppsForTenant(tenantId);
    const byCategory: Record<string, SaasAppCard[]> = {};

    for (const app of apps) {
      if (!byCategory[app.category]) {
        byCategory[app.category] = [];
      }
      byCategory[app.category].push(app);
    }

    return byCategory;
  }

  /**
   * Search apps by name, description, or tags
   */
  async searchApps(
    query: string,
    tenantId: number | null
  ): Promise<SaasAppCard[]> {
    const apps = await this.getAppsForTenant(tenantId);
    const lowerQuery = query.toLowerCase();

    return apps.filter(
      (app) =>
        app.name.toLowerCase().includes(lowerQuery) ||
        app.displayName.toLowerCase().includes(lowerQuery) ||
        app.shortDescription.toLowerCase().includes(lowerQuery) ||
        app.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get featured/recommended apps for onboarding
   */
  async getFeaturedApps(tenantId: number | null): Promise<SaasAppCard[]> {
    const apps = await this.getAppsForTenant(tenantId);
    // Return first 4 apps as featured
    return apps.slice(0, 4);
  }
}

export const catalogService = new CatalogService();

// ============================================================================
// CATALOG ROUTER
// ============================================================================

export const catalogRouter = router({
  /**
   * Get all available apps
   */
  getAllApps: publicProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId ?? null;
    return catalogService.getAppsForTenant(tenantId);
  }),

  /**
   * Get app by code
   */
  getApp: publicProcedure
    .input(z.object({ appCode: z.string() }))
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId ?? null;
      return catalogService.getAppByCode(input.appCode, tenantId);
    }),

  /**
   * Get apps grouped by category
   */
  getByCategory: publicProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId ?? null;
    return catalogService.getAppsByCategory(tenantId);
  }),

  /**
   * Search apps
   */
  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input, ctx }) => {
      const tenantId = ctx.tenantId ?? null;
      return catalogService.searchApps(input.query, tenantId);
    }),

  /**
   * Get featured apps
   */
  getFeatured: publicProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId ?? null;
    return catalogService.getFeaturedApps(tenantId);
  }),

  /**
   * Get categories list
   */
  getCategories: publicProcedure.query(() => {
    const categories = new Set(BUILT_IN_APPS.map((app) => app.category));
    return Array.from(categories);
  }),

  /**
   * Get all tags
   */
  getTags: publicProcedure.query(() => {
    const tags = new Set<string>();
    for (const app of BUILT_IN_APPS) {
      app.tags.forEach((tag) => tags.add(tag));
    }
    return Array.from(tags).sort();
  }),
});

export type CatalogRouter = typeof catalogRouter;
