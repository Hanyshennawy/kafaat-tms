/**
 * Pricing Page
 * 
 * Displays subscription plans with features, pricing, and subscription CTAs.
 * Supports both self-service checkout and Azure Marketplace redirect.
 */

import { useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Building2,
  Users,
  Shield,
  Zap,
  Phone,
  ArrowRight,
  ArrowLeft,
  Crown,
  Star,
} from "lucide-react";

// ============================================================================
// PRICING DATA
// ============================================================================

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  popular?: boolean;
  features: {
    name: string;
    included: boolean;
    limit?: string;
  }[];
  maxUsers: number | "Unlimited";
  maxDepartments: number | "Unlimited";
  modules: string[];
  support: string;
  cta: string;
  ctaVariant: "default" | "outline";
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small schools and departments",
    monthlyPrice: 499,
    annualPrice: 4990,
    currency: "AED",
    features: [
      { name: "Career Progression", included: true },
      { name: "Performance Management", included: true },
      { name: "Employee Engagement", included: true },
      { name: "Basic Analytics", included: true },
      { name: "Email Support", included: true },
      { name: "Teachers Licensing", included: false },
      { name: "Workforce Planning", included: false },
      { name: "AI Recommendations", included: false },
      { name: "Blockchain Verification", included: false },
      { name: "API Access", included: false },
    ],
    maxUsers: 50,
    maxDepartments: 5,
    modules: ["career_progression", "performance_management", "employee_engagement"],
    support: "Email",
    cta: "Start Free Trial",
    ctaVariant: "outline",
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing educational institutions",
    monthlyPrice: 1499,
    annualPrice: 14990,
    currency: "AED",
    popular: true,
    features: [
      { name: "All Starter Features", included: true },
      { name: "Teachers Licensing", included: true },
      { name: "Workforce Planning", included: true },
      { name: "Succession Planning", included: true },
      { name: "Recruitment Module", included: true },
      { name: "Advanced Analytics", included: true },
      { name: "AI Recommendations", included: true },
      { name: "Priority Support", included: true },
      { name: "Blockchain Verification", included: false },
      { name: "API Access", included: false },
    ],
    maxUsers: 200,
    maxDepartments: 20,
    modules: [
      "career_progression",
      "performance_management",
      "employee_engagement",
      "teachers_licensing",
      "workforce_planning",
      "succession_planning",
      "recruitment",
    ],
    support: "Priority Email & Chat",
    cta: "Start Free Trial",
    ctaVariant: "default",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For ministries and large organizations",
    monthlyPrice: 4999,
    annualPrice: 49990,
    currency: "AED",
    features: [
      { name: "All Professional Features", included: true },
      { name: "Competency Assessments", included: true },
      { name: "Psychometric Testing", included: true },
      { name: "Staff Placement & Mobility", included: true },
      { name: "Blockchain Verification", included: true },
      { name: "Custom Integrations", included: true },
      { name: "API Access", included: true },
      { name: "Dedicated Account Manager", included: true },
      { name: "On-premise Option", included: true },
      { name: "24/7 Phone Support", included: true },
    ],
    maxUsers: "Unlimited",
    maxDepartments: "Unlimited",
    modules: [
      "career_progression",
      "performance_management",
      "employee_engagement",
      "teachers_licensing",
      "workforce_planning",
      "succession_planning",
      "recruitment",
      "competency_assessments",
      "psychometric_testing",
      "staff_placement",
    ],
    support: "24/7 Dedicated",
    cta: "Contact Sales",
    ctaVariant: "outline",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [, setLocation] = useLocation();

  // Subscribe mutation
  const subscribeMutation = trpc.saas.initiateSubscription.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        // Redirect to checkout (could be Stripe, Azure, etc.)
        window.location.href = data.checkoutUrl;
      } else {
        setLocation("/dashboard");
      }
    },
  });

  const handleSubscribe = (plan: PricingPlan) => {
    if (plan.id === "enterprise") {
      // Contact sales
      window.location.href = "mailto:sales@kafaat.ae?subject=Enterprise%20Plan%20Inquiry";
      return;
    }

    // Start trial or subscription
    subscribeMutation.mutate({
      planId: plan.id,
      billingCycle,
    });
  };

  const getPrice = (plan: PricingPlan) => {
    const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
    const perMonth = billingCycle === "annual" ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
    return { total: price, perMonth };
  };

  const annualSavings = (plan: PricingPlan) => {
    const annualMonthly = plan.annualPrice;
    const monthlyTotal = plan.monthlyPrice * 12;
    return Math.round(((monthlyTotal - annualMonthly) / monthlyTotal) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10" />}
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {APP_TITLE}
              </h1>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto py-16 px-4 text-center">
        <Badge className="mb-4" variant="secondary">
          <Sparkles className="h-3 w-3 mr-1" /> 7-Day Free Trial on All Plans
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Choose the plan that fits your organization. All plans include a 7-day free trial.
          No credit card required to start.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Label
            htmlFor="billing-toggle"
            className={billingCycle === "monthly" ? "font-semibold" : "text-muted-foreground"}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingCycle === "annual"}
            onCheckedChange={(checked) => setBillingCycle(checked ? "annual" : "monthly")}
          />
          <Label
            htmlFor="billing-toggle"
            className={billingCycle === "annual" ? "font-semibold" : "text-muted-foreground"}
          >
            Annual
          </Label>
          {billingCycle === "annual" && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Save up to 17%
            </Badge>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan) => {
            const { total, perMonth } = getPrice(plan);
            const savings = annualSavings(plan);

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.popular
                    ? "border-2 border-primary shadow-lg scale-105"
                    : "border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1 gap-1">
                      <Star className="h-3 w-3" /> Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                    {plan.id === "starter" && <Users className="h-6 w-6 text-primary" />}
                    {plan.id === "professional" && <Building2 className="h-6 w-6 text-primary" />}
                    {plan.id === "enterprise" && <Crown className="h-6 w-6 text-primary" />}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">{plan.currency}</span>
                      <span className="text-5xl font-bold">{perMonth.toLocaleString()}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </div>
                    {billingCycle === "annual" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed {plan.currency} {total.toLocaleString()} annually
                        <span className="text-green-600 ml-2">(Save {savings}%)</span>
                      </p>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {plan.maxUsers === "Unlimited" ? "∞" : plan.maxUsers}
                      </p>
                      <p className="text-xs text-muted-foreground">Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {plan.maxDepartments === "Unlimited" ? "∞" : plan.maxDepartments}
                      </p>
                      <p className="text-xs text-muted-foreground">Departments</p>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        {feature.included ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground"}>
                          {feature.name}
                          {feature.limit && (
                            <span className="text-muted-foreground"> ({feature.limit})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Support */}
                  <div className="mt-6 pt-4 border-t flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>{plan.support} Support</span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full gap-2"
                    variant={plan.ctaVariant}
                    size="lg"
                    onClick={() => handleSubscribe(plan)}
                    disabled={subscribeMutation.isPending}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ / Trust Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="py-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <Zap className="h-10 w-10 mx-auto mb-3 text-yellow-300" />
                  <h3 className="font-semibold text-lg mb-1">Instant Setup</h3>
                  <p className="text-sm text-blue-100">
                    Get started in minutes with pre-loaded demo data
                  </p>
                </div>
                <div>
                  <Shield className="h-10 w-10 mx-auto mb-3 text-green-300" />
                  <h3 className="font-semibold text-lg mb-1">TDRA Compliant</h3>
                  <p className="text-sm text-blue-100">
                    Data stored securely in UAE data centers
                  </p>
                </div>
                <div>
                  <Phone className="h-10 w-10 mx-auto mb-3 text-purple-300" />
                  <h3 className="font-semibold text-lg mb-1">Expert Support</h3>
                  <p className="text-sm text-blue-100">
                    Our team helps you succeed at every step
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Azure Marketplace Option */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-4">Prefer Azure Marketplace?</h3>
          <p className="text-muted-foreground mb-6">
            Kafaat is also available on Microsoft Azure Marketplace for easy procurement
            and billing through your existing Azure subscription.
          </p>
          <Button variant="outline" className="gap-2" asChild>
            <a
              href="https://azuremarketplace.microsoft.com/en-us/marketplace/apps"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg"
                alt="Azure"
                className="h-5 w-auto"
              />
              View on Azure Marketplace
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Kafaat. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-2">
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>
            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>
            <a href="mailto:support@kafaat.ae" className="hover:underline">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
