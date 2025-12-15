import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Target, TrendingUp, Calendar, ChevronRight, 
  Star, Award, Clock, AlertCircle, CheckCircle, 
  BarChart3, Building2, UserCheck, ClipboardList, MessageSquare
} from "lucide-react";
import { Link } from "wouter";

interface DepartmentManagerDashboardProps {
  userName: string;
  departmentName?: string;
}

export function DepartmentManagerDashboard({ userName, departmentName = "Education Department" }: DepartmentManagerDashboardProps) {
  // Department metrics
  const deptStats = {
    teamSize: 45,
    averagePerformance: 4.1,
    goalsOnTrack: 82,
    pendingReviews: 8,
    engagementScore: 81,
    trainingCompletion: 78,
    openPositions: 3,
    successorsIdentified: 12,
  };

  // Team members needing attention
  const teamHighlights = [
    { 
      name: "Sarah Ahmed", 
      role: "Senior Teacher", 
      status: "Review Due",
      statusType: "warning",
      avatar: null,
      initials: "SA"
    },
    { 
      name: "Mohammed Ali", 
      role: "Teacher", 
      status: "High Performer",
      statusType: "success",
      avatar: null,
      initials: "MA"
    },
    { 
      name: "Fatima Hassan", 
      role: "Junior Teacher", 
      status: "Needs Support",
      statusType: "alert",
      avatar: null,
      initials: "FH"
    },
    { 
      name: "Omar Khalid", 
      role: "Teacher", 
      status: "License Expiring",
      statusType: "warning",
      avatar: null,
      initials: "OK"
    },
  ];

  // Pending manager tasks
  const pendingTasks = [
    {
      id: 1,
      icon: Star,
      title: "Performance Reviews",
      description: "8 team reviews pending your approval",
      link: "/performance/manager-review",
      count: 8,
      priority: "high",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      id: 2,
      icon: Target,
      title: "Goal Approvals",
      description: "5 goal submissions awaiting review",
      link: "/performance/goals",
      count: 5,
      priority: "medium",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      icon: UserCheck,
      title: "License Verifications",
      description: "3 licenses need your verification",
      link: "/licensing/verify",
      count: 3,
      priority: "medium",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      id: 4,
      icon: MessageSquare,
      title: "Survey Responses",
      description: "Team engagement survey results ready",
      link: "/engagement/dashboard",
      count: 1,
      priority: "low",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
  ];

  // Quick actions
  const quickActions = [
    { icon: Users, label: "My Team", link: "/placement/directory", color: "text-blue-600" },
    { icon: Star, label: "Reviews", link: "/performance/manager-review", color: "text-indigo-600" },
    { icon: BarChart3, label: "Team Analytics", link: "/analytics", color: "text-purple-600" },
    { icon: Award, label: "Recognition", link: "/engagement/activities", color: "text-yellow-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Department Dashboard</h1>
          <p className="text-muted-foreground">{departmentName} • {userName}</p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Building2 className="h-3 w-3 mr-1" />
          Department Manager
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deptStats.teamSize}</div>
            <p className="text-xs text-muted-foreground">{deptStats.openPositions} open positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deptStats.averagePerformance}/5</div>
            <p className="text-xs text-green-600">Above average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals On Track</CardTitle>
            <Target className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deptStats.goalsOnTrack}%</div>
            <Progress value={deptStats.goalsOnTrack} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deptStats.engagementScore}%</div>
            <p className="text-xs text-muted-foreground">+5% from last quarter</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Pending Tasks */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Manager Tasks
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

      {/* Team Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Highlights
          </CardTitle>
          <CardDescription>Team members requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {teamHighlights.map((member, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                <Avatar>
                  <AvatarImage src={member.avatar || undefined} />
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs mt-1 ${
                      member.statusType === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                      member.statusType === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {member.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Training Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={deptStats.trainingCompletion} className="flex-1" />
              <span className="text-lg font-bold">{deptStats.trainingCompletion}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{deptStats.pendingReviews}</span>
              <Link href="/performance/manager-review">
                <Button size="sm" variant="outline">View All</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successors Identified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{deptStats.successorsIdentified}</span>
              <Link href="/succession/plans">
                <Button size="sm" variant="outline">View Plans</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
