import { TRPCError } from "@trpc/server";
import type { User } from "../../drizzle/schema-pg";

/**
 * Role-Based Access Control (RBAC) System
 * Defines roles, permissions, and access control logic
 */

// Define all roles in the system
export type UserRole = 
  | "super_admin"
  | "hr_manager"
  | "department_manager"
  | "employee"
  | "teacher"
  | "licensing_officer"
  | "recruiter"
  | "school_principal";

// Define all permissions in the system
export type Permission =
  // User Management
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  
  // Career Progression
  | "career:read"
  | "career:manage"
  
  // Succession Planning
  | "succession:read"
  | "succession:manage"
  
  // Workforce Planning
  | "workforce:read"
  | "workforce:manage"
  
  // Employee Engagement
  | "engagement:read"
  | "engagement:manage"
  | "surveys:create"
  | "surveys:respond"
  
  // Recruitment
  | "recruitment:read"
  | "recruitment:manage"
  | "candidates:view"
  | "candidates:manage"
  
  // Performance Management
  | "performance:read"
  | "performance:manage"
  | "performance:self_appraisal"
  | "performance:manager_review"
  | "performance:360_feedback"
  
  // Teachers Licensing
  | "licensing:read"
  | "licensing:manage"
  | "licensing:apply"
  | "licensing:verify"
  
  // Competency Assessments
  | "competency:read"
  | "competency:manage"
  | "competency:self_assess"
  
  // Staff Placement
  | "placement:read"
  | "placement:manage"
  | "placement:request"
  
  // Psychometric Assessments
  | "psychometric:read"
  | "psychometric:manage"
  | "psychometric:take"
  
  // Reports & Analytics
  | "reports:view"
  | "reports:generate"
  | "analytics:view"
  
  // System Administration
  | "system:manage"
  | "audit:view";

// Role-Permission mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    // Full system access
    "users:read", "users:create", "users:update", "users:delete",
    "career:read", "career:manage",
    "succession:read", "succession:manage",
    "workforce:read", "workforce:manage",
    "engagement:read", "engagement:manage", "surveys:create", "surveys:respond",
    "recruitment:read", "recruitment:manage", "candidates:view", "candidates:manage",
    "performance:read", "performance:manage", "performance:self_appraisal", 
    "performance:manager_review", "performance:360_feedback",
    "licensing:read", "licensing:manage", "licensing:apply", "licensing:verify",
    "competency:read", "competency:manage", "competency:self_assess",
    "placement:read", "placement:manage", "placement:request",
    "psychometric:read", "psychometric:manage", "psychometric:take",
    "reports:view", "reports:generate", "analytics:view",
    "system:manage", "audit:view",
  ],
  
  hr_manager: [
    // HR operations
    "users:read", "users:create", "users:update",
    "career:read", "career:manage",
    "succession:read", "succession:manage",
    "workforce:read", "workforce:manage",
    "engagement:read", "engagement:manage", "surveys:create",
    "recruitment:read", "recruitment:manage", "candidates:view", "candidates:manage",
    "performance:read", "performance:manage",
    "competency:read", "competency:manage",
    "placement:read", "placement:manage",
    "psychometric:read", "psychometric:manage",
    "reports:view", "reports:generate", "analytics:view",
  ],
  
  department_manager: [
    // Department management
    "users:read",
    "career:read",
    "succession:read",
    "workforce:read",
    "engagement:read", "surveys:create", "surveys:respond",
    "recruitment:read", "candidates:view",
    "performance:read", "performance:manager_review", "performance:360_feedback",
    "competency:read",
    "placement:read",
    "psychometric:read",
    "reports:view", "analytics:view",
  ],
  
  employee: [
    // Employee self-service
    "career:read",
    "surveys:respond",
    "performance:self_appraisal", "performance:360_feedback",
    "licensing:apply",
    "competency:self_assess",
    "placement:request",
    "psychometric:take",
  ],
  
  licensing_officer: [
    // Licensing operations
    "users:read",
    "licensing:read", "licensing:manage", "licensing:verify",
    "reports:view",
  ],
  
  recruiter: [
    // Recruitment operations
    "users:read",
    "recruitment:read", "recruitment:manage", "candidates:view", "candidates:manage",
    "reports:view",
  ],

  teacher: [
    // Teacher/Educator self-service
    "career:read",
    "surveys:respond",
    "performance:self_appraisal", "performance:360_feedback",
    "licensing:read", "licensing:apply",
    "competency:read", "competency:self_assess",
    "placement:request",
    "psychometric:take",
  ],

  school_principal: [
    // School leadership
    "users:read",
    "career:read",
    "succession:read",
    "workforce:read",
    "engagement:read", "surveys:create", "surveys:respond",
    "recruitment:read", "candidates:view",
    "performance:read", "performance:manager_review", "performance:360_feedback",
    "licensing:read", "licensing:verify",
    "competency:read",
    "placement:read", "placement:request",
    "psychometric:read",
    "reports:view", "analytics:view",
  ],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | undefined, permission: Permission): boolean {
  if (!user) return false;
  
  const userRole = user.role as UserRole;
  const permissions = rolePermissions[userRole] || [];
  
  return permissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User | undefined, permissions: Permission[]): boolean {
  if (!user) return false;
  
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User | undefined, permissions: Permission[]): boolean {
  if (!user) return false;
  
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Require specific permission - throws error if not authorized
 */
export function requirePermission(user: User | undefined, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You don't have permission to perform this action. Required permission: ${permission}`,
    });
  }
}

/**
 * Require any of the specified permissions - throws error if not authorized
 */
export function requireAnyPermission(user: User | undefined, permissions: Permission[]): void {
  if (!hasAnyPermission(user, permissions)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You don't have permission to perform this action. Required permissions: ${permissions.join(" or ")}`,
    });
  }
}

/**
 * Require all of the specified permissions - throws error if not authorized
 */
export function requireAllPermissions(user: User | undefined, permissions: Permission[]): void {
  if (!hasAllPermissions(user, permissions)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You don't have all required permissions. Required: ${permissions.join(", ")}`,
    });
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | undefined, role: UserRole): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | undefined, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role as UserRole);
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: User | undefined): Permission[] {
  if (!user) return [];
  
  const userRole = user.role as UserRole;
  return rolePermissions[userRole] || [];
}
