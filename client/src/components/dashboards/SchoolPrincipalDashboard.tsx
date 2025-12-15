import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, School, Star, TrendingUp, ChevronRight, 
  FileCheck, Award, Target, Clock, AlertCircle, 
  BarChart3, GraduationCap, BookOpen, CheckCircle, Shield
} from "lucide-react";
import { Link } from "wouter";

interface SchoolPrincipalDashboardProps {
  userName: string;
  schoolName?: string;
}

export function SchoolPrincipalDashboard({ userName, schoolName = "Al Nahda School" }: SchoolPrincipalDashboardProps) {
  // School metrics
  const schoolStats = {
    totalStaff: 85,
    teachingStaff: 62,
    licensedTeachers: 58,
    averagePerformance: 4.2,
    pendingVerifications: 7,
    engagementScore: 84,
    cpdCompletion: 76,
    licensesExpiring: 4,
  };

  // Staff performance distribution
  const performanceDistribution = [
    { level: "Excellent (5)", count: 15, percent: 24 },
    { level: "Good (4)", count: 28, percent: 45 },
    { level: "Satisfactory (3)", count: 14, percent: 23 },
    { level: "Needs Improvement", count: 5, percent: 8 },
  ];

  // Staff needing attention
  const staffHighlights = [
    {
      name: "Ahmed Al-Rashid",
      role: "Math Teacher",
      status: "License Expiring",
      statusType: "warning",
      initials: "AR"
    },
    {
      name: "Sarah Mohammed",
      role: "Science Teacher",
      status: "High Performer",
      statusType: "success",
      initials: "SM"
    },
    {
      name: "Fatima Ali",
      role: "English Teacher",
      status: "CPD Overdue",
      statusType: "alert",
      initials: "FA"
    },
  ];

  // Pending tasks
  const pendingTasks = [
    {
      id: 1,
      icon: FileCheck,
      title: "License Verifications",
      description: "Staff licenses requiring your verification",
      link: "/licensing/verify",
      count: 7,
      priority: "high",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      id: 2,
      icon: Star,
      title: "Performance Reviews",
      description: "Annual reviews pending approval",
      link: "/performance/manager-review",
      count: 12,
      priority: "medium",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      id: 3,
      icon: AlertCircle,
      title: "Licenses Expiring",
      description: "Teachers with licenses expiring soon",
      link: "/licensing/my-licenses",
      count: 4,
      priority: "high",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      id: 4,
      icon: BookOpen,
      title: "CPD Tracking",
      description: "Staff members behind on CPD hours",
      link: "/licensing/cpd",
      count: 8,
      priority: "medium",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
  ];

  // Quick actions
  const quickActions = [
    { icon: Users, label: "My Staff", link: "/placement/directory", color: "text-blue-600" },
    { icon: BarChart3, label: "School Reports", link: "/reports", color: "text-purple-600" },
    { icon: Award, label: "Recognition", link: "/engagement/activities", color: "text-yellow-600" },
    { icon: Shield, label: "Compliance", link: "/licensing", color: "text-teal-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">School Dashboard</h1>
          <p className="text-muted-foreground">{schoolName} • {userName}</p>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <School className="h-3 w-3 mr-1" />
          School Principal
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolStats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">{schoolStats.teachingStaff} teaching staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licensed Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolStats.licensedTeachers}/{schoolStats.teachingStaff}</div>
            <Progress value={(schoolStats.licensedTeachers / schoolStats.teachingStaff) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolStats.averagePerformance}/5</div>
            <p className="text-xs text-green-600">Above district average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schoolStats.engagementScore}%</div>
            <p className="text-xs text-muted-foreground">+3% from last quarter</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Pending Tasks */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Action Items
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Staff Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceDistribution.map((level, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{level.level}</span>
                  <span className="text-sm font-bold">{level.count} ({level.percent}%)</span>
                </div>
                <Progress value={level.percent} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Staff Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Highlights
            </CardTitle>
            <CardDescription>Staff members needing attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {staffHighlights.map((staff, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar>
                  <AvatarFallback>{staff.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{staff.name}</p>
                  <p className="text-xs text-muted-foreground">{staff.role}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    staff.statusType === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                    staff.statusType === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {staff.status}
                </Badge>
              </div>
            ))}
            <Link href="/placement/directory">
              <Button variant="ghost" className="w-full">View All Staff</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPD Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={schoolStats.cpdCompletion} className="flex-1" />
              <span className="text-lg font-bold">{schoolStats.cpdCompletion}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{schoolStats.pendingVerifications}</span>
              <Link href="/licensing/verify">
                <Button size="sm" variant="outline">Review</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Licenses Expiring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600">{schoolStats.licensesExpiring}</span>
              <Link href="/licensing/my-licenses">
                <Button size="sm" variant="outline">View</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
