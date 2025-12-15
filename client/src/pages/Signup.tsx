/**
 * Self-Signup Page
 * 
 * Allows customers to register for a 7-day free trial without going through
 * Azure Marketplace. Collects organization info and creates a trial tenant.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  CheckCircle2,
  Building2,
  Mail,
  User,
  Phone,
  MapPin,
  Loader2,
  ArrowRight,
  Shield,
  Sparkles,
  Clock,
} from "lucide-react";

// UAE Emirates list
const UAE_EMIRATES = [
  { value: "abu_dhabi", label: "Abu Dhabi" },
  { value: "dubai", label: "Dubai" },
  { value: "sharjah", label: "Sharjah" },
  { value: "ajman", label: "Ajman" },
  { value: "umm_al_quwain", label: "Umm Al Quwain" },
  { value: "ras_al_khaimah", label: "Ras Al Khaimah" },
  { value: "fujairah", label: "Fujairah" },
];

// Form data interface
interface SignupFormData {
  organizationName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emirate: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

export default function Signup() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SignupFormData>({
    organizationName: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emirate: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    agreeToMarketing: false,
  });

  // Signup mutation
  const signupMutation = trpc.saas.selfSignup.useMutation({
    onSuccess: (data) => {
      setStep("success");
    },
    onError: (error) => {
      // Show user-friendly error instead of technical SQL details
      const userMessage = error.message.includes("query") || error.message.includes("SQL") || error.message.includes("database")
        ? "Unable to create your account at this time. Please try again later or contact support."
        : error.message;
      setError(userMessage);
      setStep("form");
    },
  });

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.organizationName.trim()) {
      setError("Organization name is required");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Valid email is required");
      return false;
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First and last name are required");
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms of Service");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setStep("processing");
    setError(null);

    signupMutation.mutate({
      organizationName: formData.organizationName,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber || undefined,
      emirate: formData.emirate || undefined,
      password: formData.password,
      agreeToMarketing: formData.agreeToMarketing,
    });
  };

  // Success screen
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to Kafaat!</CardTitle>
            <CardDescription className="text-base">
              Your 7-day free trial has started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-2">What's next?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Check your email for login instructions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Set up your organization profile
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Explore all 10 modules with demo data
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Trial expires in 7 days</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full gap-2" onClick={() => setLocation("/dashboard")}>
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setLocation("/pricing")}>
              View Pricing Plans
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Processing screen
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Creating your account...</h2>
            <p className="text-muted-foreground">Setting up your organization and demo data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Signup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-3 mb-4">
              {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-12 w-12" />}
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {APP_TITLE}
              </h1>
            </div>
          </Link>
          <p className="text-lg text-muted-foreground">
            Start your 7-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Benefits sidebar */}
          <div className="lg:order-2 space-y-6">
            <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  What's Included in Your Trial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-300 mt-0.5" />
                    <div>
                      <p className="font-medium">Full Access to All 10 Modules</p>
                      <p className="text-sm text-blue-100">Career, Performance, Recruitment & more</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-300 mt-0.5" />
                    <div>
                      <p className="font-medium">Pre-loaded Demo Data</p>
                      <p className="text-sm text-blue-100">Explore features with realistic sample data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-300 mt-0.5" />
                    <div>
                      <p className="font-medium">AI-Powered Features</p>
                      <p className="text-sm text-blue-100">Career recommendations & insights</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-300 mt-0.5" />
                    <div>
                      <p className="font-medium">Blockchain Verification</p>
                      <p className="text-sm text-blue-100">Secure license verification with TrusTell</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-300 mt-0.5" />
                    <div>
                      <p className="font-medium">No Credit Card Required</p>
                      <p className="text-sm text-blue-100">Try everything risk-free for 7 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <Shield className="h-10 w-10 text-green-600" />
                  <div>
                    <p className="font-semibold">TDRA Compliant</p>
                    <p className="text-sm text-muted-foreground">UAE data residency guaranteed</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Building2 className="h-10 w-10 text-blue-600" />
                  <div>
                    <p className="font-semibold">Enterprise Ready</p>
                    <p className="text-sm text-muted-foreground">Built for UAE government & education</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Signup form */}
          <div className="lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle>Create Your Account</CardTitle>
                <CardDescription>
                  Start your free 7-day trial today
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Organization */}
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">
                      <Building2 className="h-4 w-4 inline mr-2" />
                      Organization Name *
                    </Label>
                    <Input
                      id="organizationName"
                      placeholder="e.g., Dubai Education Authority"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange("organizationName", e.target.value)}
                    />
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        <User className="h-4 w-4 inline mr-2" />
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Ahmed"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Al-Rashid"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Work Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ahmed@organization.ae"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>

                  {/* Phone & Emirate */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Phone (Optional)
                      </Label>
                      <Input
                        id="phoneNumber"
                        placeholder="+971 50 123 4567"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        <MapPin className="h-4 w-4 inline mr-2" />
                        Emirate (Optional)
                      </Label>
                      <Select
                        value={formData.emirate}
                        onValueChange={(value) => handleInputChange("emirate", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select emirate" />
                        </SelectTrigger>
                        <SelectContent>
                          {UAE_EMIRATES.map((emirate) => (
                            <SelectItem key={emirate.value} value={emirate.value}>
                              {emirate.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Password fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Agreements */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", !!checked)}
                      />
                      <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                        I agree to the{" "}
                        <a href="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </a>{" "}
                        *
                      </label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="marketing"
                        checked={formData.agreeToMarketing}
                        onCheckedChange={(checked) => handleInputChange("agreeToMarketing", !!checked)}
                      />
                      <label htmlFor="marketing" className="text-sm leading-tight cursor-pointer">
                        Send me product updates and tips (optional)
                      </label>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full gap-2" size="lg">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <a href={getLoginUrl()} className="text-primary hover:underline">
                      Sign in
                    </a>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
