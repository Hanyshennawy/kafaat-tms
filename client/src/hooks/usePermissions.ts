import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Frontend RBAC Hook
 * Provides permission checking utilities for React components
 */

export type UserRole = 
  | "super_admin"
  | "hr_manager"
  | "department_manager"
  | "employee"
  | "licensing_officer"
  | "recruiter";

export type Permission =
  | "users:read" | "users:create" | "users:update" | "users:delete"
  | "career:read" | "career:manage"
  | "succession:read" | "succession:manage"
  | "workforce:read" | "workforce:manage"
  | "engagement:read" | "engagement:manage" | "surveys:create" | "surveys:respond"
  | "recruitment:read" | "recruitment:manage" | "candidates:view" | "candidates:manage"
  | "performance:read" | "performance:manage" | "performance:self_appraisal" 
  | "performance:manager_review" | "performance:360_feedback"
  | "licensing:read" | "licensing:manage" | "licensing:apply" | "licensing:verify"
  | "competency:read" | "competency:manage" | "competency:self_assess"
  | "placement:read" | "placement:manage" | "placement:request"
  | "psychometric:read" | "psychometric:manage" | "psychometric:take"
  | "reports:view" | "reports:generate" | "analytics:view"
  | "system:manage" | "audit:view";

const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
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
    "career:read",
    "surveys:respond",
    "performance:self_appraisal", "performance:360_feedback",
    "licensing:apply",
    "competency:self_assess",
    "placement:request",
    "psychometric:take",
  ],
  
  licensing_officer: [
    "users:read",
    "licensing:read", "licensing:manage", "licensing:verify",
    "reports:view",
  ],
  
  recruiter: [
    "users:read",
    "recruitment:read", "recruitment:manage", "candidates:view", "candidates:manage",
    "reports:view",
  ],
};

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    const userRole = user.role as UserRole;
    const permissions = rolePermissions[userRole] || [];
    
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    
    return permissions.every(permission => hasPermission(permission));
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role as UserRole);
  };

  const getUserPermissions = (): Permission[] => {
    if (!user) return [];
    
    const userRole = user.role as UserRole;
    return rolePermissions[userRole] || [];
  };

  const isAdmin = (): boolean => {
    return hasRole("super_admin");
  };

  const isHRManager = (): boolean => {
    return hasRole("hr_manager");
  };

  const isDepartmentManager = (): boolean => {
    return hasRole("department_manager");
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    getUserPermissions,
    isAdmin,
    isHRManager,
    isDepartmentManager,
    userRole: user?.role as UserRole | undefined,
  };
}
