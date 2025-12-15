/**
 * Onboarding Wizard Component
 * 
 * Guides new users through initial setup and feature discovery.
 * Shows after first login and can be reopened from settings.
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Users,
  Target,
  GraduationCap,
  Briefcase,
  MessageSquare,
  BarChart2,
  Settings,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Building2,
  User,
  Bell,
  Palette,
  Globe,
  CheckCircle2,
  Circle,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

interface SetupTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  path: string;
  priority: "high" | "medium" | "low";
}

// ============================================================================
// COMPONENT
// ============================================================================

export function OnboardingWizard() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [setupTasks, setSetupTasks] = useState<SetupTask[]>([]);
  const [preferences, setPreferences] = useState({
    language: "en",
    theme: "light",
    emailNotifications: true,
    role: "",
  });
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

  // Check if user needs onboarding - ONLY for authenticated users
  useEffect(() => {
    // Don't show if not authenticated or still loading
    if (loading || !user) {
      return;
    }
    
    const hasCompletedOnboarding = localStorage.getItem("kafaat-onboarding-complete");
    const isNewUser = !hasCompletedOnboarding;
    
    if (isNewUser) {
      // Delay to let the dashboard load first
      setTimeout(() => setOpen(true), 1000);
    }

    // Initialize setup tasks
    setSetupTasks([
      { id: "profile", title: "Complete your profile", description: "Add your photo and contact details", completed: false, path: "/profile", priority: "high" },
      { id: "department", title: "Set up departments", description: "Create organizational structure", completed: false, path: "/organization-settings", priority: "high" },
      { id: "employees", title: "Add employees", description: "Import or add team members", completed: false, path: "/users", priority: "high" },
      { id: "career", title: "Create career paths", description: "Define progression tracks", completed: false, path: "/career/paths", priority: "medium" },
      { id: "goals", title: "Set performance goals", description: "Create first goal cycle", completed: false, path: "/performance/cycles", priority: "medium" },
      { id: "survey", title: "Launch engagement survey", description: "Get employee feedback", completed: false, path: "/engagement/surveys", priority: "low" },
    ]);
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Kafaat TMS! 👋",
      description: "Let's get you set up in just a few minutes",
      icon: Sparkles,
      content: (
        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Welcome to Kafaat</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The comprehensive talent management system built for the UAE Ministry of Education. 
              Let's personalize your experience.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { icon: TrendingUp, label: "Career Growth", color: "text-blue-600" },
              { icon: Target, label: "Performance", color: "text-green-600" },
              { icon: GraduationCap, label: "Licensing", color: "text-purple-600" },
              { icon: Users, label: "Team Management", color: "text-orange-600" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg"
              >
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
                <span className="font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "role",
      title: "What's your role?",
      description: "This helps us customize your experience",
      icon: User,
      content: (
        <div className="space-y-4 py-4">
          {[
            { id: "hr_manager", label: "HR Manager", description: "Manage talent across the organization", icon: Users },
            { id: "department_manager", label: "Department Manager", description: "Lead a team or department", icon: Building2 },
            { id: "employee", label: "Employee", description: "Track my career and performance", icon: User },
            { id: "licensing_officer", label: "Licensing Officer", description: "Process teaching licenses", icon: GraduationCap },
            { id: "recruiter", label: "Recruiter", description: "Hire and onboard talent", icon: Briefcase },
          ].map((role) => (
            <button
              key={role.id}
              onClick={() => setPreferences((p) => ({ ...p, role: role.id }))}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                preferences.role === role.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  preferences.role === role.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <role.icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">{role.label}</div>
                <div className="text-sm text-muted-foreground">
                  {role.description}
                </div>
              </div>
              {preferences.role === role.id && (
                <Check className="h-5 w-5 text-primary ml-auto" />
              )}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: "preferences",
      title: "Your Preferences",
      description: "Customize your Kafaat experience",
      icon: Settings,
      content: (
        <div className="space-y-6 py-4">
          {/* Language */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Language
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "en", label: "English", flag: "🇬🇧" },
                { id: "ar", label: "العربية", flag: "🇦🇪" },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setPreferences((p) => ({ ...p, language: lang.id }))}
                  className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                    preferences.language === lang.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "light", label: "Light", icon: "☀️" },
                { id: "dark", label: "Dark", icon: "🌙" },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setPreferences((p) => ({ ...p, theme: theme.id }))}
                  className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 ${
                    preferences.theme === theme.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <span className="text-2xl">{theme.icon}</span>
                  <span className="font-medium">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Receive updates about important activities
                </div>
              </div>
            </div>
            <Checkbox
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                setPreferences((p) => ({ ...p, emailNotifications: !!checked }))
              }
            />
          </div>
        </div>
      ),
    },
    {
      id: "modules",
      title: "Discover Your Modules",
      description: "Here's what you can do with Kafaat",
      icon: BarChart2,
      content: (
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: TrendingUp, label: "Career Progression", description: "Track career paths", color: "bg-blue-500" },
              { icon: Users, label: "Succession Planning", description: "Build leadership pipeline", color: "bg-green-500" },
              { icon: BarChart2, label: "Workforce Planning", description: "Forecast and allocate", color: "bg-purple-500" },
              { icon: MessageSquare, label: "Engagement", description: "Measure satisfaction", color: "bg-orange-500" },
              { icon: Briefcase, label: "Recruitment", description: "Hire top talent", color: "bg-red-500" },
              { icon: Target, label: "Performance", description: "Goals and reviews", color: "bg-cyan-500" },
              { icon: GraduationCap, label: "Licensing", description: "Teacher credentials", color: "bg-teal-500" },
              { icon: Settings, label: "Competency", description: "Skills assessment", color: "bg-indigo-500" },
            ].map((module) => (
              <div
                key={module.label}
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center mb-3`}>
                  <module.icon className="h-5 w-5 text-white" />
                </div>
                <div className="font-semibold text-sm">{module.label}</div>
                <div className="text-xs text-muted-foreground">{module.description}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "setup",
      title: "Quick Setup Checklist",
      description: "Complete these tasks to get the most from Kafaat",
      icon: CheckCircle2,
      content: (
        <div className="space-y-3 py-4">
          {setupTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-muted rounded-lg"
            >
              <div className={`p-1 rounded-full ${task.completed ? "bg-green-500" : "bg-border"}`}>
                {task.completed ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  {task.title}
                  {task.priority === "high" && (
                    <Badge variant="destructive" className="text-xs">Important</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{task.description}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocation(task.path);
                  setOpen(false);
                }}
              >
                Start <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleComplete = () => {
    localStorage.setItem("kafaat-onboarding-complete", "true");
    localStorage.setItem("kafaat-user-preferences", JSON.stringify(preferences));
    setOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem("kafaat-onboarding-complete", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip
            </Button>
          </div>
          <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
          <DialogDescription>{currentStepData.description}</DialogDescription>
        </DialogHeader>

        <div className="px-6">{currentStepData.content}</div>

        <DialogFooter className="p-6 pt-2">
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext}>
              {isLastStep ? (
                <>
                  Get Started
                  <Check className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Setup checklist component for dashboard
export function SetupChecklist() {
  const [tasks, setTasks] = useState<SetupTask[]>([
    { id: "profile", title: "Complete your profile", description: "Add photo and details", completed: false, path: "/profile", priority: "high" },
    { id: "department", title: "Set up departments", description: "Create org structure", completed: false, path: "/organization-settings", priority: "high" },
    { id: "employees", title: "Add team members", description: "Import or add employees", completed: false, path: "/users", priority: "high" },
    { id: "goals", title: "Create first goal", description: "Set a performance goal", completed: false, path: "/performance/goals", priority: "medium" },
  ]);
  const [, setLocation] = useLocation();

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  if (completedCount === tasks.length) {
    return null; // Hide when all complete
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6 border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Getting Started
          </h3>
          <p className="text-sm text-muted-foreground">
            Complete these steps to set up Kafaat
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{completedCount}/{tasks.length}</div>
          <div className="text-xs text-muted-foreground">tasks done</div>
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-4" />

      <div className="space-y-2">
        {tasks.filter((t) => !t.completed).slice(0, 2).map((task) => (
          <button
            key={task.id}
            onClick={() => setLocation(task.path)}
            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <Circle className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-medium text-sm">{task.title}</div>
              <div className="text-xs text-muted-foreground">{task.description}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default OnboardingWizard;
