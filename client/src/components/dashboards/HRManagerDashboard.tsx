import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Briefcase, TrendingUp, Calendar, ChevronRight, 
  UserPlus, FileText, BarChart3, Building2, Target,
  Clock, AlertCircle, CheckCircle, ArrowUpRight, Shield
} from "lucide-react";
import { Link } from "wouter";

interface HRManagerDashboardProps {
  userName: string;
}

export function HRManagerDashboard({ userName }: HRManagerDashboardProps) {
  // HR-specific metrics
  const hrStats = {
    totalEmployees: 1248,
    newHires: 23,
    openPositions: 18,
    pendingApprovals: 12,
    turnoverRate: 8.5,
    successionCoverage: 72,
    engagementScore: 78,
    trainingCompletion: 85,
  };

  // Workforce overview
  const workforceData = [
    { department: "Education", headcount: 420, trend: "+12" },
    { department: "Administration", headcount: 180, trend: "+3" },
    { department: "Technical", headcount: 210, trend: "+8" },
    { department: "Support", headcount: 145, trend: "-2" },
  ];

  // Pending HR tasks
  const pendingTasks = [
    {
      id: 1,
      icon: UserPlus,
      title: "Onboarding Pending",
      description: "8 new hires awaiting onboarding",
      link: "/recruitment/candidates",
      count: 8,
      priority: "high",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 2,
      icon: FileText,
      title: "License Verifications",
      description: "15 licenses pending verification",
      link: "/licensing/verify",
      count: 15,
      priority: "medium",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      id: 3,
      icon: Target,
      title: "Performance Reviews",
      description: "32 reviews pending approval",
      link: "/performance/manager-review",
      count: 32,
      priority: "high",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      id: 4,
      icon: Building2,
      title: "Placement Requests",
      description: "6 staff placement requests",
      link: "/placement/requests",
      count: 6,
      priority: "medium",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
  ];

  // Quick access links
  const quickLinks = [
    { icon: Users, label: "Employee Directory", link: "/placement/directory", color: "text-blue-600" },
    { icon: Briefcase, label: "Active Jobs", link: "/recruitment/requisitions", color: "text-green-600" },
    { icon: BarChart3, label: "Workforce Analytics", link: "/analytics", color: "text-purple-600" },
    { icon: Shield, label: "Succession Plans", link: "/succession/plans", color: "text-orange-600" },
  ];

  // Recent activities
  const recentActivities = [
    { action: "New hire approved", detail: "Ahmed Al-Rashid - Science Teacher", time: "2 hours ago", type: "success" },
    { action: "License renewed", detail: "Fatima Hassan - Teaching License", time: "4 hours ago", type: "info" },
    { action: "Performance review", detail: "Q4 reviews started", time: "Yesterday", type: "warning" },
    { action: "Position filled", detail: "Senior Administrator", time: "2 days ago", type: "success" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HR Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Briefcase className="h-3 w-3 mr-1" />
          HR Manager
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrStats.totalEmployees.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{hrStats.newHires} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrStats.openPositions}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Succession Coverage</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrStats.successionCoverage}%</div>
            <Progress value={hrStats.successionCoverage} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrStats.engagementScore}%</div>
            <p className="text-xs text-muted-foreground">Based on latest survey</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Pending Tasks */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Tasks
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.map((task) => (
              <Link key={task.id} href={task.link}>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border">
                  <div className={`p-2 rounded-lg ${task.bgColor}`}>
                    <task.icon className={`h-5 w-5 ${task.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{task.title}</p>
                      <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                        {task.count}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickLinks.map((link, index) => (
              <Link key={index} href={link.link}>
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <link.icon className={`h-5 w-5 ${link.color}`} />
                  <span className="text-xs text-center">{link.label}</span>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Workforce Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Workforce by Department
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workforceData.map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{dept.department}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{dept.headcount}</span>
                      <Badge variant="outline" className={dept.trend.startsWith("+") ? "text-green-600" : "text-red-600"}>
                        {dept.trend}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(dept.headcount / 500) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`mt-0.5 p-1 rounded-full ${
                  activity.type === 'success' ? 'bg-green-100' : 
                  activity.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  {activity.type === 'success' ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : activity.type === 'warning' ? (
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                  ) : (
                    <FileText className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
