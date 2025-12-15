import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, Award, Target, BookOpen, FileCheck, Clock, 
  Calendar, ChevronRight, AlertCircle, CheckCircle, Star,
  Brain, TrendingUp, ClipboardList, RefreshCw, Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

interface TeacherDashboardProps {
  userName: string;
}

export function TeacherDashboard({ userName }: TeacherDashboardProps) {
  // Teacher-specific stats
  const teacherStats = {
    licenseStatus: "Active",
    licenseExpiry: "Mar 15, 2026",
    daysToExpiry: 92,
    cpdHoursCompleted: 45,
    cpdHoursRequired: 60,
    competencyScore: 85,
    performanceRating: 4.2,
    goalsCompleted: 3,
    totalGoals: 5,
  };

  // Pending tasks for teachers
  const pendingTasks = [
    {
      id: 1,
      icon: RefreshCw,
      title: "License Renewal Due",
      description: "Your teaching license expires in 92 days",
      link: "/licensing/renewal",
      priority: "medium",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      id: 2,
      icon: BookOpen,
      title: "Complete CPD Hours",
      description: "15 hours remaining for this cycle",
      link: "/licensing/cpd",
      priority: "high",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      id: 3,
      icon: Target,
      title: "Self-Appraisal Due",
      description: "Annual performance self-assessment",
      link: "/performance/self-appraisal",
      priority: "high",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      id: 4,
      icon: Brain,
      title: "Competency Assessment",
      description: "Complete your quarterly assessment",
      link: "/competency/assessments",
      priority: "medium",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
  ];

  // Quick actions for teachers
  const quickActions = [
    { icon: FileCheck, label: "View License", link: "/licensing/my-licenses", color: "text-teal-600" },
    { icon: BookOpen, label: "Log CPD", link: "/licensing/cpd", color: "text-blue-600" },
    { icon: Target, label: "My Goals", link: "/performance/goals", color: "text-indigo-600" },
    { icon: Brain, label: "Take Assessment", link: "/assessments/take", color: "text-purple-600" },
  ];

  // Recent achievements
  const achievements = [
    { title: "CPD Milestone", description: "Completed 45 CPD hours", icon: Award, date: "2 days ago" },
    { title: "Goal Achieved", description: "Completed Q3 teaching goals", icon: CheckCircle, date: "1 week ago" },
    { title: "Assessment Passed", description: "Scored 92% on competency test", icon: Star, date: "2 weeks ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Your educator development portal</p>
        </div>
        <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
          <GraduationCap className="h-3 w-3 mr-1" />
          Educator
        </Badge>
      </div>

      {/* License Status Card */}
      <Card className="border-l-4 border-l-teal-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-teal-600" />
              Teaching License Status
            </CardTitle>
            <Badge className="bg-green-100 text-green-700">
              {teacherStats.licenseStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Expires</p>
              <p className="font-semibold">{teacherStats.licenseExpiry}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Days Remaining</p>
              <p className="font-semibold text-orange-600">{teacherStats.daysToExpiry} days</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPD Progress</p>
              <div className="flex items-center gap-2">
                <Progress value={(teacherStats.cpdHoursCompleted / teacherStats.cpdHoursRequired) * 100} className="h-2 flex-1" />
                <span className="text-sm font-medium">{teacherStats.cpdHoursCompleted}/{teacherStats.cpdHoursRequired}h</span>
              </div>
            </div>
            <div className="flex items-end">
              <Link href="/licensing/my-licenses">
                <Button variant="outline" size="sm">
                  View Details <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Competency Score</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherStats.competencyScore}%</div>
            <p className="text-xs text-muted-foreground">+3% from last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherStats.performanceRating}/5</div>
            <p className="text-xs text-muted-foreground">Based on latest review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
            <Target className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherStats.goalsCompleted}/{teacherStats.totalGoals}</div>
            <Progress value={(teacherStats.goalsCompleted / teacherStats.totalGoals) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPD Hours</CardTitle>
            <BookOpen className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherStats.cpdHoursCompleted}h</div>
            <p className="text-xs text-muted-foreground">{teacherStats.cpdHoursRequired - teacherStats.cpdHoursCompleted}h remaining</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Pending Tasks */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
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
                      {task.priority === "high" && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
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

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="p-2 rounded-full bg-yellow-100">
                  <achievement.icon className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
