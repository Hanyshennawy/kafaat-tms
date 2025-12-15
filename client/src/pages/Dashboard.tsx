import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, Users, BarChart3, MessageSquare, Briefcase, Target, GraduationCap,
  ArrowRight, Bell, FileText, AlertCircle, CheckCircle, Clock, Award, Brain, MapPin,
  PlayCircle, Eye, UserCheck, CalendarClock, FileCheck, AlertTriangle, ChevronRight,
  Sparkles, Calendar, ClipboardList, UserPlus, Building2, Star, Zap, Shield, School
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { SetupChecklist } from "@/components/OnboardingWizard";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import role-specific dashboards
import {
  TeacherDashboard,
  HRManagerDashboard,
  DepartmentManagerDashboard,
  EmployeeDashboard,
  LicensingOfficerDashboard,
  RecruiterDashboard,
  SchoolPrincipalDashboard,
  SuperAdminDashboard,
} from "@/components/dashboards";

// Available roles for role switcher
const availableRoles = [
  { value: "super_admin", label: "Super Admin", icon: Shield, color: "text-red-600" },
  { value: "hr_manager", label: "HR Manager", icon: Briefcase, color: "text-blue-600" },
  { value: "department_manager", label: "Department Manager", icon: Building2, color: "text-purple-600" },
  { value: "school_principal", label: "School Principal", icon: School, color: "text-amber-600" },
  { value: "licensing_officer", label: "Licensing Officer", icon: FileCheck, color: "text-teal-600" },
  { value: "recruiter", label: "Recruiter", icon: UserPlus, color: "text-indigo-600" },
  { value: "teacher", label: "Teacher", icon: GraduationCap, color: "text-green-600" },
  { value: "employee", label: "Employee", icon: Users, color: "text-gray-600" },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  // State for role preview/switcher (for demo purposes)
  const [previewRole, setPreviewRole] = useState<string | null>(null);
  
  // Get user role - use preview role if set, otherwise use actual role
  const actualRole = (user as any)?.role || "employee";
  const userRole = previewRole || actualRole;
  const userName = user?.name || "User";
  
  // Role-specific dashboard rendering
  const renderRoleDashboard = () => {
    switch (userRole) {
      case "teacher":
        return <TeacherDashboard userName={userName} />;
      case "hr_manager":
        return <HRManagerDashboard userName={userName} />;
      case "department_manager":
        return <DepartmentManagerDashboard userName={userName} />;
      case "licensing_officer":
        return <LicensingOfficerDashboard userName={userName} />;
      case "recruiter":
        return <RecruiterDashboard userName={userName} />;
      case "school_principal":
        return <SchoolPrincipalDashboard userName={userName} />;
      case "super_admin":
        return <SuperAdminDashboard userName={userName} />;
      case "employee":
        return <EmployeeDashboard userName={userName} />;
      default:
        // For admins and unspecified roles, show the full admin dashboard below
        return null;
    }
  };

  // Role Switcher Component for previewing different dashboards
  const RoleSwitcher = () => (
    <Card className="mb-6 border-dashed border-2 border-primary/30 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <span className="font-medium">Dashboard Preview</span>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm text-muted-foreground">View as:</span>
            <Select value={userRole} onValueChange={(value) => setPreviewRole(value)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${role.color}`} />
                        <span>{role.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {previewRole && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPreviewRole(null)}
                className="text-muted-foreground"
              >
                Reset to my role
              </Button>
            )}
          </div>
          {previewRole && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Preview Mode
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  // Check if we should show role-specific dashboard
  const roleDashboard = renderRoleDashboard();
  if (roleDashboard) {
    return (
      <div>
        <RoleSwitcher />
        {roleDashboard}
      </div>
    );
  }
  
  // Fetch dashboard data
  const { data: notifications } = trpc.notifications.getUnreadNotifications.useQuery();
  const { data: careerPaths } = trpc.careerProgression.getAllPaths.useQuery();
  const { data: successionPlans } = trpc.successionPlanning.getAllPlans.useQuery();
  const { data: workforceScenarios } = trpc.workforcePlanning.getAllScenarios.useQuery();
  const { data: surveys } = trpc.employeeEngagement.getAllSurveys.useQuery();
  const { data: requisitions } = trpc.recruitment.getAllRequisitions.useQuery();
  const { data: performanceCycles } = trpc.performanceManagement.getAllCycles.useQuery();
  const { data: licenseApplications } = trpc.teachersLicensing.getAllApplications.useQuery();

  // Pending Actions - items requiring attention
  const pendingActions = [
    { 
      id: 1,
      icon: FileCheck, 
      title: "3 License Applications", 
      description: "Pending review and approval",
      link: "/licensing/my-applications",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      priority: "high",
      count: 3
    },
    { 
      id: 2,
      icon: ClipboardList, 
      title: "5 Performance Reviews", 
      description: "Awaiting manager feedback",
      link: "/performance/manager-review",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      priority: "high",
      count: 5
    },
    { 
      id: 3,
      icon: UserCheck, 
      title: "8 Candidates to Screen", 
      description: "New applications for open positions",
      link: "/recruitment/candidates",
      color: "text-red-600",
      bgColor: "bg-red-50",
      priority: "medium",
      count: 8
    },
    { 
      id: 4,
      icon: MessageSquare, 
      title: "2 Surveys to Complete", 
      description: "Employee engagement surveys",
      link: "/engagement/surveys",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      priority: "medium",
      count: 2
    },
    { 
      id: 5,
      icon: Target, 
      title: "Update Q4 Goals", 
      description: "Goal setting deadline approaching",
      link: "/performance/goals",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      priority: "low",
      count: 1
    },
  ];

  // Quick Actions with context
  const quickActions = [
    { icon: UserPlus, label: "New Requisition", link: "/recruitment/requisitions", color: "text-red-600" },
    { icon: FileCheck, label: "Review Application", link: "/licensing/my-applications", color: "text-teal-600" },
    { icon: Target, label: "Start Review", link: "/performance/self-appraisal", color: "text-indigo-600" },
    { icon: MessageSquare, label: "Create Survey", link: "/engagement/surveys", color: "text-yellow-600" },
    { icon: Calendar, label: "Schedule Interview", link: "/recruitment/interviews", color: "text-purple-600" },
    { icon: Building2, label: "Transfer Request", link: "/placement/requests", color: "text-orange-600" },
  ];

  // Recent Activity Feed
  const recentActivities = [
    { 
      icon: CheckCircle, 
      text: "Ahmed Al-Rashid completed teaching license renewal", 
      time: "10 minutes ago", 
      color: "text-green-600",
      module: "Licensing"
    },
    { 
      icon: UserPlus, 
      text: "New candidate applied for Math Teacher position", 
      time: "25 minutes ago", 
      color: "text-red-600",
      module: "Recruitment"
    },
    { 
      icon: Star, 
      text: "Fatima Hassan received 5-star performance rating", 
      time: "1 hour ago", 
      color: "text-yellow-600",
      module: "Performance"
    },
    { 
      icon: Award, 
      text: "3 educators completed CPD requirements", 
      time: "2 hours ago", 
      color: "text-purple-600",
      module: "Licensing"
    },
    { 
      icon: AlertTriangle, 
      text: "Workforce alert: 2 positions understaffed", 
      time: "3 hours ago", 
      color: "text-orange-600",
      module: "Workforce"
    },
    { 
      icon: Users, 
      text: "Succession plan updated for Principal role", 
      time: "4 hours ago", 
      color: "text-blue-600",
      module: "Succession"
    },
  ];

  // Upcoming Events/Deadlines
  const upcomingEvents = [
    { 
      title: "Performance Review Deadline", 
      date: "Dec 15, 2025", 
      daysLeft: 3,
      type: "deadline",
      link: "/performance/cycles"
    },
    { 
      title: "License Renewal - 5 Educators", 
      date: "Dec 20, 2025", 
      daysLeft: 8,
      type: "renewal",
      link: "/licensing/licenses"
    },
    { 
      title: "Engagement Survey Closes", 
      date: "Dec 18, 2025", 
      daysLeft: 6,
      type: "survey",
      link: "/engagement/surveys"
    },
    { 
      title: "Q1 Goal Setting Opens", 
      date: "Jan 1, 2026", 
      daysLeft: 20,
      type: "event",
      link: "/performance/goals"
    },
  ];

  // Module Stats for quick overview
  const moduleStats = [
    { label: "Active Educators", value: "1,234", change: "+12", trend: "up", icon: Users },
    { label: "Open Positions", value: requisitions?.length || 0, change: "+3", trend: "up", icon: Briefcase },
    { label: "Pending Reviews", value: "42", change: "-8", trend: "down", icon: Target },
    { label: "Active Licenses", value: "892", change: "+15", trend: "up", icon: GraduationCap },
    { label: "Engagement Score", value: "87%", change: "+5%", trend: "up", icon: MessageSquare },
    { label: "Succession Ready", value: "78%", change: "+3%", trend: "up", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Welcome Message */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground mt-1">
            Your command center for educator talent management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <Sparkles className="h-3 w-3 mr-1" />
            System Healthy
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
            <Clock className="h-3 w-3 mr-1" />
            Last sync: 5 min ago
          </Badge>
        </div>
      </div>

      {/* Quick Stats Row - Key Numbers Across All Modules */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {moduleStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-1.5 py-0 ${
                      stat.trend === 'up' ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'
                    }`}
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Notifications Banner */}
      {notifications && notifications.length > 0 && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">You have {notifications.length} unread notifications</p>
                  <p className="text-sm text-muted-foreground">Stay updated on important changes</p>
                </div>
              </div>
              <Link href="/notifications">
                <Button variant="outline" size="sm" className="border-amber-300 hover:bg-amber-100">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid - Pending Actions & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Actions - Items Requiring Attention */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Pending Actions
                </CardTitle>
                <CardDescription>Items requiring your attention</CardDescription>
              </div>
              <Badge variant="secondary" className="text-orange-600 bg-orange-50">
                {pendingActions.reduce((acc, item) => acc + item.count, 0)} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.id} href={action.link}>
                  <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer group">
                    <div className={`h-10 w-10 rounded-lg ${action.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{action.title}</p>
                        {action.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{action.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} href={action.link}>
                  <Button 
                    variant="outline" 
                    className="w-full h-auto py-3 flex-col gap-2 hover:bg-accent/50"
                  >
                    <Icon className={`h-5 w-5 ${action.color}`} />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Setup Checklist for New Users - Only show if not complete */}
      <SetupChecklist />

      {/* Bottom Row - Activity Feed & Upcoming Events */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Feed */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-green-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>What's happening across your organization</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {activity.module}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events & Deadlines */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-purple-500" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription>Important dates to remember</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Calendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <Link key={index} href={event.link}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        event.daysLeft <= 3 ? 'bg-red-50' : 
                        event.daysLeft <= 7 ? 'bg-amber-50' : 'bg-blue-50'
                      }`}>
                        <span className={`text-lg font-bold ${
                          event.daysLeft <= 3 ? 'text-red-600' : 
                          event.daysLeft <= 7 ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          {event.daysLeft}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        event.daysLeft <= 3 ? 'text-red-600 border-red-200' : 
                        event.daysLeft <= 7 ? 'text-amber-600 border-amber-200' : 'text-blue-600 border-blue-200'
                      }`}
                    >
                      {event.daysLeft === 1 ? 'Tomorrow' : `${event.daysLeft} days`}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
