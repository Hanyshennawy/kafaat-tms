import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileCheck, Users, Clock, CheckCircle, AlertCircle, ChevronRight, 
  Shield, GraduationCap, BookOpen, RefreshCw, XCircle,
  BarChart3, Calendar, Filter, Search, Sparkles
} from "lucide-react";
import { Link } from "wouter";

interface LicensingOfficerDashboardProps {
  userName: string;
}

export function LicensingOfficerDashboard({ userName }: LicensingOfficerDashboardProps) {
  // Licensing metrics
  const licensingStats = {
    pendingApplications: 45,
    pendingRenewals: 28,
    approvedToday: 12,
    rejectedToday: 3,
    averageProcessingTime: 2.3,
    complianceRate: 94,
    expiringThisMonth: 67,
    totalActiveTeachers: 1420,
  };

  // Application queue
  const applicationQueue = [
    {
      id: 1,
      type: "New Application",
      applicant: "Sarah Al-Mahmoud",
      subject: "Mathematics",
      submitted: "2 hours ago",
      priority: "normal",
      status: "pending"
    },
    {
      id: 2,
      type: "License Renewal",
      applicant: "Ahmed Hassan",
      subject: "Science",
      submitted: "4 hours ago",
      priority: "urgent",
      status: "pending"
    },
    {
      id: 3,
      type: "New Application",
      applicant: "Fatima Al-Ali",
      subject: "English",
      submitted: "Yesterday",
      priority: "normal",
      status: "pending"
    },
    {
      id: 4,
      type: "Upgrade Request",
      applicant: "Mohammed Khalid",
      subject: "Physics",
      submitted: "Yesterday",
      priority: "normal",
      status: "pending"
    },
  ];

  // Pending tasks
  const pendingTasks = [
    {
      id: 1,
      icon: FileCheck,
      title: "New Applications",
      description: "Review pending license applications",
      link: "/licensing",
      count: 45,
      priority: "high",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      id: 2,
      icon: RefreshCw,
      title: "Renewal Requests",
      description: "Process license renewals",
      link: "/licensing/renewal",
      count: 28,
      priority: "medium",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      icon: AlertCircle,
      title: "Expiring Soon",
      description: "Licenses expiring this month",
      link: "/licensing/my-licenses",
      count: 67,
      priority: "high",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      id: 4,
      icon: BookOpen,
      title: "CPD Verifications",
      description: "Verify CPD hour submissions",
      link: "/licensing/cpd",
      count: 34,
      priority: "medium",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
  ];

  // Quick actions
  const quickActions = [
    { icon: Search, label: "Search Licenses", link: "/licensing/my-licenses", color: "text-blue-600" },
    { icon: FileCheck, label: "Issue License", link: "/licensing/new-license", color: "text-teal-600" },
    { icon: BarChart3, label: "Reports", link: "/reports", color: "text-purple-600" },
    { icon: Filter, label: "Verification", link: "/licensing/verify", color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Licensing Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}</p>
        </div>
        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
          <Shield className="h-3 w-3 mr-1" />
          Licensing Officer
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <FileCheck className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licensingStats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Renewals</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licensingStats.pendingRenewals}</div>
            <p className="text-xs text-muted-foreground">To process</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licensingStats.expiringThisMonth}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licensingStats.complianceRate}%</div>
            <Progress value={licensingStats.complianceRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Pending Tasks */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Work Queue
            </CardTitle>
            <CardDescription>Items requiring your action</CardDescription>
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Application Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Recent Applications
            </CardTitle>
            <CardDescription>Latest submissions requiring review</CardDescription>
          </div>
          <Link href="/licensing">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {applicationQueue.map((app) => (
              <div key={app.id} className="flex items-center gap-4 p-3 rounded-lg border">
                <div className="p-2 rounded-full bg-teal-50">
                  <GraduationCap className="h-4 w-4 text-teal-600" />
                </div>
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div>
                    <p className="font-medium text-sm">{app.applicant}</p>
                    <p className="text-xs text-muted-foreground">{app.subject}</p>
                  </div>
                  <div>
                    <Badge variant="outline" className={
                      app.type === "New Application" ? "bg-blue-50 text-blue-700" :
                      app.type === "License Renewal" ? "bg-green-50 text-green-700" :
                      "bg-purple-50 text-purple-700"
                    }>
                      {app.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {app.submitted}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {app.priority === "urgent" && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Approved Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{licensingStats.approvedToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Rejected Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{licensingStats.rejectedToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Avg Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licensingStats.averageProcessingTime} days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Active Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licensingStats.totalActiveTeachers.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
