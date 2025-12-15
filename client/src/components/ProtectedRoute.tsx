import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePermissions, type Permission, type UserRole } from "@/hooks/usePermissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
  role?: UserRole;
  roles?: UserRole[];
}

/**
 * ProtectedRoute Component
 * Wraps routes that require specific permissions or roles
 * 
 * Usage:
 * <ProtectedRoute permission="users:manage">
 *   <UsersPage />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute permissions={["users:read", "users:update"]} requireAll>
 *   <UserEditPage />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute role="super_admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = usePermissions();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Redirect to="/" />;
  }

  // Check role-based access
  if (role && !hasRole(role)) {
    return <UnauthorizedAccess requiredRole={role} />;
  }

  if (roles && !hasAnyRole(roles)) {
    return <UnauthorizedAccess requiredRoles={roles} />;
  }

  // Check permission-based access
  if (permission && !hasPermission(permission)) {
    return <UnauthorizedAccess requiredPermission={permission} />;
  }

  if (permissions) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return <UnauthorizedAccess requiredPermissions={permissions} requireAll={requireAll} />;
    }
  }

  // User has access, render children
  return <>{children}</>;
}

interface UnauthorizedAccessProps {
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
}

function UnauthorizedAccess({
  requiredRole,
  requiredRoles,
  requiredPermission,
  requiredPermissions,
  requireAll,
}: UnauthorizedAccessProps) {
  const { user } = useAuth();

  let message = "You don't have permission to access this page.";

  if (requiredRole) {
    message = `This page requires ${requiredRole} role.`;
  } else if (requiredRoles) {
    message = `This page requires one of the following roles: ${requiredRoles.join(", ")}.`;
  } else if (requiredPermission) {
    message = `This page requires ${requiredPermission} permission.`;
  } else if (requiredPermissions) {
    const conjunction = requireAll ? "all of" : "one of";
    message = `This page requires ${conjunction} the following permissions: ${requiredPermissions.join(", ")}.`;
  }

  return (
    <div className="container mx-auto py-12">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          <p className="mb-2">{message}</p>
          <p className="text-sm">Your current role: <strong>{user?.role}</strong></p>
          <p className="text-sm mt-4">
            If you believe you should have access to this page, please contact your system administrator.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
