/**
 * Subscription Gate Component
 * 
 * Displays a modal/overlay when the user's trial has expired or subscription is inactive.
 * Prevents access to premium features until they subscribe.
 */

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  AlertTriangle, 
  CreditCard, 
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface SubscriptionStatus {
  status: "trial" | "active" | "expired" | "grace_period" | "suspended" | "cancelled";
  trialDaysRemaining: number | null;
  trialEndsAt: Date | string | null;
  canAccessFeatures: boolean;
  showUpgradePrompt: boolean;
}

interface SubscriptionContextValue {
  status: SubscriptionStatus | null;
  isLoading: boolean;
  refetch: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { data: status, isLoading, refetch } = trpc.saas.getTrialStatus.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 60 * 1000, // Consider data stale after 1 minute
  });

  return (
    <SubscriptionContext.Provider value={{ status: status || null, isLoading, refetch }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// ============================================================================
// TRIAL BANNER COMPONENT
// ============================================================================

export function TrialBanner() {
  const { status, isLoading } = useSubscription();
  const [, setLocation] = useLocation();

  if (isLoading || !status) return null;

  // Don't show for active subscriptions
  if (status.status === "active") return null;

  // Trial active - show countdown
  if (status.status === "trial" && status.trialDaysRemaining !== null) {
    const urgency = status.trialDaysRemaining <= 2 ? "destructive" : "default";
    const progressPercent = ((7 - status.trialDaysRemaining) / 7) * 100;

    return (
      <div className={`w-full px-4 py-2 ${status.trialDaysRemaining <= 2 ? 'bg-red-50 border-b border-red-200' : 'bg-blue-50 border-b border-blue-200'}`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className={`h-4 w-4 ${status.trialDaysRemaining <= 2 ? 'text-red-600' : 'text-blue-600'}`} />
            <span className={`text-sm font-medium ${status.trialDaysRemaining <= 2 ? 'text-red-900' : 'text-blue-900'}`}>
              {status.trialDaysRemaining === 0 
                ? "Your trial ends today!" 
                : status.trialDaysRemaining === 1 
                  ? "Your trial ends tomorrow!" 
                  : `${status.trialDaysRemaining} days left in your trial`}
            </span>
            <div className="w-24 hidden sm:block">
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>
          <Button size="sm" onClick={() => setLocation("/pricing")} className="gap-1">
            <Sparkles className="h-3 w-3" />
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  // Grace period - more urgent
  if (status.status === "grace_period") {
    return (
      <div className="w-full px-4 py-2 bg-amber-50 border-b border-amber-200">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">
              Your trial has expired. Subscribe now to keep access to all features.
            </span>
          </div>
          <Button size="sm" variant="destructive" onClick={() => setLocation("/pricing")} className="gap-1">
            <CreditCard className="h-3 w-3" />
            Subscribe Now
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================================
// SUBSCRIPTION GATE MODAL
// ============================================================================

interface SubscriptionGateProps {
  children: ReactNode;
  requiredStatus?: ("trial" | "active")[];
}

export function SubscriptionGate({ children, requiredStatus = ["trial", "active"] }: SubscriptionGateProps) {
  const { status, isLoading } = useSubscription();
  const [showModal, setShowModal] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && status) {
      const hasAccess = requiredStatus.includes(status.status as any);
      setShowModal(!hasAccess);
    }
  }, [status, isLoading, requiredStatus]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show blocked modal
  if (showModal && status) {
    return (
      <>
        <div className="relative">
          <div className="filter blur-sm pointer-events-none select-none opacity-50">
            {children}
          </div>
        </div>
        
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <div className="mx-auto mb-4 p-4 bg-red-100 rounded-full">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <DialogTitle className="text-center text-2xl">
                {status.status === "suspended" 
                  ? "Account Suspended" 
                  : status.status === "cancelled"
                    ? "Subscription Cancelled"
                    : "Trial Period Ended"}
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                {status.status === "suspended" 
                  ? "Your account has been suspended. Please contact support or update your payment method."
                  : status.status === "cancelled"
                    ? "Your subscription has been cancelled. Reactivate to continue using all features."
                    : "Your 7-day free trial has ended. Subscribe now to continue enjoying all features."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">What you'll get with a subscription:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    AI-Powered Career Recommendations
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Complete Performance Management Suite
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Teachers Licensing with Blockchain Verification
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Workforce Planning & Analytics
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Priority Support
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setLocation("/")}>
                Back to Home
              </Button>
              <Button onClick={() => setLocation("/pricing")} className="gap-2">
                View Pricing <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return <>{children}</>;
}

// ============================================================================
// FEATURE LOCK COMPONENT
// ============================================================================

interface FeatureLockProps {
  children: ReactNode;
  featureName: string;
  requiredPlan?: string;
}

export function FeatureLock({ children, featureName, requiredPlan = "Professional" }: FeatureLockProps) {
  const { status } = useSubscription();
  const [, setLocation] = useLocation();

  // If status allows access, show children
  if (status?.canAccessFeatures) {
    return <>{children}</>;
  }

  // Otherwise show locked state
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/90 z-10 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg border max-w-sm">
          <div className="mx-auto mb-3 p-3 bg-amber-100 rounded-full w-fit">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="font-semibold text-lg mb-1">Feature Locked</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {featureName} requires {requiredPlan} plan or higher.
          </p>
          <Button size="sm" onClick={() => setLocation("/pricing")} className="gap-1">
            <Sparkles className="h-3 w-3" />
            Upgrade to Unlock
          </Button>
        </div>
      </div>
      <div className="filter blur-sm pointer-events-none">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// UPGRADE PROMPT CARD
// ============================================================================

export function UpgradePromptCard() {
  const { status } = useSubscription();
  const [, setLocation] = useLocation();

  if (!status?.showUpgradePrompt) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg mb-1">
            {status.status === "trial" ? "Enjoying your trial?" : "Reactivate your account"}
          </h3>
          <p className="text-blue-100 text-sm mb-4">
            {status.status === "trial" 
              ? `${status.trialDaysRemaining} days remaining. Upgrade now to unlock all features forever.`
              : "Your trial has ended. Subscribe to continue using all features."}
          </p>
          <Button 
            variant="secondary" 
            onClick={() => setLocation("/pricing")}
            className="gap-2"
          >
            View Plans <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <Sparkles className="h-10 w-10 text-white/30" />
      </div>
    </div>
  );
}
