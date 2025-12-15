import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, TrendingUp, Award, BookOpen, ChevronRight, 
  Star, Calendar, ClipboardList, MessageSquare, Sparkles,
  GraduationCap, Heart, Briefcase, CheckCircle
} from "lucide-react";
import { Link } from "wouter";

interface EmployeeDashboardProps {
  userName: string;
}

export function EmployeeDashboard({ userName }: EmployeeDashboardProps) {
  // Employee metrics
  const employeeStats = {
    performanceRating: 4.0,
    goalsCompleted: 4,
    totalGoals: 6,
    trainingHours: 24,
    yearsOfService: 3,
    wellbeingScore: 82,
    lastReviewDate: "Oct 15, 2024",
    nextReviewDate: "Apr 15, 2025",
  };

  // Career path progress
  const careerProgress = {
    currentRole: "Senior Analyst",
    nextRole: "Team Lead",
    progressPercent: 65,
    competenciesCompleted: 7,
    competenciesRequired: 10,
  };

  // Pending items for employee
  const pendingItems = [
    {
      id: 1,
      icon: Target,
      title: "Update Goal Progress",
      description: "Q4 goal deadline approaching",
      link: "/performance/goals",
      priority: "high",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      id: 2,
      icon: MessageSquare,
      title: "Complete Survey",
      description: "Annual engagement survey",
      link: "/engagement/surveys",
      priority: "medium",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      id: 3,
      icon: BookOpen,
      title: "Required Training",
      description: "2 courses pending completion",
      link: "/catalog/training",
      priority: "medium",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 4,
      icon: ClipboardList,
      title: "Self-Appraisal",
      description: "Annual self-appraisal due soon",
      link: "/performance/self-appraisal",
      priority: "low",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
  ];

  // Quick actions
  const quickActions = [
    { icon: Target, label: "My Goals", link: "/performance/goals", color: "text-indigo-600" },
    { icon: TrendingUp, label: "Career Path", link: "/career/paths", color: "text-green-600" },
    { icon: Award, label: "Achievements", link: "/gamification", color: "text-yellow-600" },
    { icon: Heart, label: "Wellbeing", link: "/engagement/surveys", color: "text-pink-600" },
  ];

  // Recent achievements
  const achievements = [
    { title: "Goal Achieved", description: "Completed project milestone", date: "1 week ago" },
    { title: "Training Completed", description: "Leadership essentials", date: "2 weeks ago" },
    { title: "Recognition", description: "Team player award", date: "1 month ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Your personal development hub</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Briefcase className="h-3 w-3 mr-1" />
          Employee
        </Badge>
      </div>

      {/* Career Progress Card */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-600" />
            Career Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <p className="text-sm text-muted-foreground">Current Role</p>
              <p className="font-semibold">{careerProgress.currentRole}</p>
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-muted-foreground">Progress to {careerProgress.nextRole}</p>
                <span className="text-sm font-medium">{careerProgress.progressPercent}%</span>
              </div>
              <Progress value={careerProgress.progressPercent} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">
                {careerProgress.competenciesCompleted}/{careerProgress.competenciesRequired} competencies completed
              </p>
            </div>
            <div className="flex justify-end">
              <Link href="/career/path">
                <Button variant="outline" size="sm">
                  View Path <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeStats.performanceRating}/5</div>
            <p className="text-xs text-muted-foreground">Last review: {employeeStats.lastReviewDate}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
            <Target className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeStats.goalsCompleted}/{employeeStats.totalGoals}</div>
            <Progress value={(employeeStats.goalsCompleted / employeeStats.totalGoals) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Hours</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeStats.trainingHours}h</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wellbeing Score</CardTitle>
            <Heart className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeStats.wellbeingScore}%</div>
            <p className="text-xs text-green-600">Good</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* To-Do Items */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Action Items
            </CardTitle>
            <CardDescription>Tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingItems.map((item) => (
              <Link key={item.id} href={item.link}>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      {item.priority === "high" && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
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

      {/* Achievements & Upcoming */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-yellow-100">
                  <CheckCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">{achievement.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Star className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Next Performance Review</p>
                <p className="text-xs text-muted-foreground">{employeeStats.nextReviewDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <div className="p-2 rounded-lg bg-green-50">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Years of Service</p>
                <p className="text-xs text-muted-foreground">{employeeStats.yearsOfService} years completed</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <div className="p-2 rounded-lg bg-blue-50">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Training Goal</p>
                <p className="text-xs text-muted-foreground">6 hours remaining this quarter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
