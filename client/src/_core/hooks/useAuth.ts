import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

// Demo user for testing without database
const DEMO_USER = {
  id: 1,
  name: "Sulaiman Alkaabi",
  email: "s.binkaab@gmail.com",
  role: "super_admin" as const,
  tenantId: 1,
  organizationName: "Professional Development",
};

// Check if demo mode is enabled (check both localStorage and cookie)
export const isDemoMode = () => {
  // Check localStorage
  if (localStorage.getItem("kafaat-demo-mode") === "true") {
    return true;
  }
  // Check cookie
  return document.cookie.includes("kafaat-demo-mode=true");
};

// Enable demo mode - set both localStorage and cookie for server-side detection
export const enableDemoMode = () => {
  localStorage.setItem("kafaat-demo-mode", "true");
  // Set cookie for server-side detection (expires in 24 hours)
  document.cookie = "kafaat-demo-mode=true; path=/; max-age=86400; SameSite=Lax";
  window.location.href = "/dashboard";
};

// Disable demo mode - clear both localStorage and cookie
export const disableDemoMode = () => {
  localStorage.removeItem("kafaat-demo-mode");
  // Clear cookie
  document.cookie = "kafaat-demo-mode=; path=/; max-age=0";
  window.location.href = "/";
};

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();
  const [demoMode] = useState(() => isDemoMode());

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !demoMode, // Don't query when in demo mode
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    // If in demo mode, just clear demo mode
    if (isDemoMode()) {
      disableDemoMode();
      return;
    }
    
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    // If in demo mode, return demo user
    if (demoMode) {
      return {
        user: DEMO_USER,
        loading: false,
        error: null,
        isAuthenticated: true,
      };
    }
    
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(meQuery.data)
    );
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    demoMode,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (demoMode) return; // Skip redirect in demo mode
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath
  }, [
    demoMode,
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
    isDemoMode: demoMode,
  };
}
