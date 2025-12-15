import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  MessageSquare, 
  Award,
  Heart,
  Star,
  ThumbsUp,
  Smile,
  Meh,
  Frown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Send,
  Calendar,
  BarChart3,
  PieChart,
  Sparkles,
  Target,
  Building2,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  BookOpen,
  Coffee,
  Briefcase,
  MessageCircle,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";

// Demo data for engagement metrics
const engagementTrends = [
  { month: "Jul", score: 7.5, satisfaction: 7.8, motivation: 7.2, culture: 7.6 },
  { month: "Aug", score: 7.8, satisfaction: 8.0, motivation: 7.5, culture: 7.8 },
  { month: "Sep", score: 7.6, satisfaction: 7.9, motivation: 7.4, culture: 7.5 },
  { month: "Oct", score: 8.0, satisfaction: 8.2, motivation: 7.8, culture: 8.0 },
  { month: "Nov", score: 7.9, satisfaction: 8.1, motivation: 7.7, culture: 7.9 },
  { month: "Dec", score: 8.2, satisfaction: 8.4, motivation: 8.0, culture: 8.2 },
];

const departmentEngagement = [
  { name: "Mathematics", score: 8.5, change: 0.3, employees: 45 },
  { name: "Science", score: 8.2, change: 0.2, employees: 38 },
  { name: "English", score: 7.9, change: -0.1, employees: 42 },
  { name: "Arabic", score: 8.1, change: 0.4, employees: 35 },
  { name: "Administration", score: 7.6, change: -0.2, employees: 28 },
  { name: "Student Services", score: 8.4, change: 0.5, employees: 22 },
];

const recentSurveys = [
  { 
    id: 1, 
    title: "Q4 2025 Engagement Pulse", 
    responses: 245, 
    total: 280, 
    status: "active",
    daysLeft: 5,
    avgScore: 8.2
  },
  { 
    id: 2, 
    title: "Professional Development Feedback", 
    responses: 189, 
    total: 200, 
    status: "active",
    daysLeft: 2,
    avgScore: 7.8
  },
  { 
    id: 3, 
    title: "Classroom Resources Survey", 
    responses: 156, 
    total: 156, 
    status: "completed",
    daysLeft: 0,
    avgScore: 7.5
  },
];

const recentRecognitions = [
  { 
    id: 1, 
    from: "Sarah Ahmed", 
    to: "Mohamed Hassan",
    message: "Amazing work on the Science Fair coordination! 🌟",
    category: "Teamwork",
    points: 50,
    time: "2 hours ago"
  },
  { 
    id: 2, 
    from: "Fatima Al-Rashid", 
    to: "Ali Mahmoud",
    message: "Thank you for mentoring our new teachers!",
    category: "Mentorship",
    points: 75,
    time: "5 hours ago"
  },
  { 
    id: 3, 
    from: "Ahmed Khan", 
    to: "Layla Hussein",
    message: "Outstanding student engagement in Math Olympics prep",
    category: "Innovation",
    points: 100,
    time: "Yesterday"
  },
  { 
    id: 4, 
    from: "Noor Abdulaziz", 
    to: "Omar Salem",
    message: "Excellent parent-teacher conference organization",
    category: "Leadership",
    points: 60,
    time: "Yesterday"
  },
];

const topRecognized = [
  { name: "Mohamed Hassan", points: 450, recognitions: 12 },
  { name: "Layla Hussein", points: 380, recognitions: 9 },
  { name: "Ali Mahmoud", points: 320, recognitions: 8 },
  { name: "Sarah Ahmed", points: 290, recognitions: 7 },
  { name: "Omar Salem", points: 275, recognitions: 6 },
];

const engagementDrivers = [
  { driver: "Professional Growth Opportunities", score: 8.6, impact: "high", trend: "up" },
  { driver: "Leadership Support", score: 8.4, impact: "high", trend: "up" },
  { driver: "Work-Life Balance", score: 7.8, impact: "high", trend: "stable" },
  { driver: "Classroom Resources", score: 7.2, impact: "medium", trend: "down" },
  { driver: "Compensation & Benefits", score: 7.0, impact: "medium", trend: "stable" },
  { driver: "Collegial Relationships", score: 8.5, impact: "medium", trend: "up" },
];

const educatorMetrics = [
  { label: "Work-Life Balance", score: 7.8, icon: Coffee, color: "text-amber-500" },
  { label: "PD Satisfaction", score: 8.4, icon: GraduationCap, color: "text-blue-500" },
  { label: "Resource Adequacy", score: 7.2, icon: BookOpen, color: "text-green-500" },
  { label: "Leadership Support", score: 8.1, icon: Briefcase, color: "text-purple-500" },
];

export default function EngagementDashboard() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [pulseSubmitted, setPulseSubmitted] = useState(false);

  const handlePulseSubmit = (mood: string) => {
    setSelectedMood(mood);
    setPulseSubmitted(true);
    setTimeout(() => setPulseSubmitted(false), 3000);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Teamwork": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      "Mentorship": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      "Innovation": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
      "Leadership": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-pink-500" />
            Engagement Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Monitor educator engagement, satisfaction, and recognition</p>
        </div>
        <div className="flex gap-2">
          <Link href="/engagement/surveys">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              View Surveys
            </Button>
          </Link>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Survey
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">8.2</span>
              <span className="text-lg text-muted-foreground">/10</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+0.5</span>
              <span className="text-xs text-muted-foreground">vs last quarter</span>
            </div>
            <div className="mt-3 flex gap-1">
              {engagementTrends.map((t, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-green-500/20 rounded-sm" 
                  style={{ height: `${t.score * 4}px` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Participation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">85%</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+5%</span>
              <span className="text-xs text-muted-foreground">1,045 responses</span>
            </div>
            <Progress value={85} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-1">Target: 90%</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              Active Surveys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">3</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-600">2 closing soon</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Badge variant="secondary" className="text-xs">2 Pulse</Badge>
              <Badge variant="secondary" className="text-xs">1 Feedback</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Recognition Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">12,450</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+18%</span>
              <span className="text-xs text-muted-foreground">this month</span>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pulse Check Widget */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Quick Pulse Check
              </h3>
              <p className="text-sm text-muted-foreground">How are you feeling today?</p>
            </div>
            {pulseSubmitted ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Thanks for sharing!</span>
              </div>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => handlePulseSubmit("great")}
                  className={`p-3 rounded-full transition-all hover:scale-110 ${selectedMood === 'great' ? 'bg-green-100 ring-2 ring-green-500' : 'bg-muted hover:bg-green-50'}`}
                >
                  <Smile className="h-8 w-8 text-green-500" />
                </button>
                <button 
                  onClick={() => handlePulseSubmit("okay")}
                  className={`p-3 rounded-full transition-all hover:scale-110 ${selectedMood === 'okay' ? 'bg-amber-100 ring-2 ring-amber-500' : 'bg-muted hover:bg-amber-50'}`}
                >
                  <Meh className="h-8 w-8 text-amber-500" />
                </button>
                <button 
                  onClick={() => handlePulseSubmit("struggling")}
                  className={`p-3 rounded-full transition-all hover:scale-110 ${selectedMood === 'struggling' ? 'bg-red-100 ring-2 ring-red-500' : 'bg-muted hover:bg-red-50'}`}
                >
                  <Frown className="h-8 w-8 text-red-500" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Engagement Trends Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Engagement Trends
                  </CardTitle>
                  <CardDescription>6-month engagement score breakdown</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary" /> Overall
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Satisfaction
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Motivation
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-muted-foreground">
                  <span>10</span>
                  <span>8</span>
                  <span>6</span>
                  <span>4</span>
                </div>
                {/* Chart area */}
                <div className="ml-10 h-56 flex items-end justify-around gap-4 border-l border-b">
                  {engagementTrends.map((month, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex justify-center gap-1">
                        <div 
                          className="w-3 bg-primary rounded-t transition-all hover:opacity-80"
                          style={{ height: `${month.score * 20}px` }}
                          title={`Overall: ${month.score}`}
                        />
                        <div 
                          className="w-3 bg-blue-500 rounded-t transition-all hover:opacity-80"
                          style={{ height: `${month.satisfaction * 20}px` }}
                          title={`Satisfaction: ${month.satisfaction}`}
                        />
                        <div 
                          className="w-3 bg-green-500 rounded-t transition-all hover:opacity-80"
                          style={{ height: `${month.motivation * 20}px` }}
                          title={`Motivation: ${month.motivation}`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{month.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engagement by Department */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Engagement by Department
                  </CardTitle>
                  <CardDescription>Compare engagement across departments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentEngagement.map((dept, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{dept.name}</span>
                        <Badge variant="secondary" className="text-xs">{dept.employees} staff</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{dept.score}</span>
                        {dept.change >= 0 ? (
                          <span className="text-xs text-green-600 flex items-center">
                            <ArrowUpRight className="h-3 w-3" />+{dept.change}
                          </span>
                        ) : (
                          <span className="text-xs text-red-600 flex items-center">
                            <ArrowDownRight className="h-3 w-3" />{dept.change}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={dept.score * 10} className="h-2" />
                      <div 
                        className="absolute top-0 h-2 w-0.5 bg-red-500"
                        style={{ left: '80%' }}
                        title="Target: 8.0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Drivers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Engagement Drivers
                  </CardTitle>
                  <CardDescription>What's driving engagement in your organization</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {engagementDrivers.map((driver, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-lg border ${
                      driver.score >= 8 ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' :
                      driver.score >= 7 ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800' :
                      'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{driver.driver}</span>
                      <div className="flex items-center gap-1">
                        {driver.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {driver.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                        <span className="font-bold">{driver.score}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {driver.impact} impact
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recognition & Surveys */}
        <div className="space-y-6">
          {/* Educator-Specific Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Educator Wellness
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {educatorMetrics.map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${metric.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span>{metric.label}</span>
                        <span className="font-bold">{metric.score}</span>
                      </div>
                      <Progress value={metric.score * 10} className="h-1.5 mt-1" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Surveys */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                  Recent Surveys
                </CardTitle>
                <Link href="/engagement/surveys">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentSurveys.map((survey) => (
                <div key={survey.id} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{survey.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={(survey.responses / survey.total) * 100} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {survey.responses}/{survey.total}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {survey.status === 'active' ? (
                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                        <Clock className="h-3 w-3 mr-1" />
                        {survey.daysLeft} days left
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    <span className="text-xs font-medium">Score: {survey.avgScore}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recognition Wall */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Recognition Wall
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Send className="h-4 w-4 mr-1" />
                  Give
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRecognitions.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-3 rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/50 border">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {rec.from.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{rec.from}</span>
                        <span className="text-muted-foreground"> recognized </span>
                        <span className="font-medium">{rec.to}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">"{rec.message}"</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={getCategoryColor(rec.category)}>{rec.category}</Badge>
                        <span className="text-xs text-muted-foreground">{rec.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Recognized */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Top Recognized This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topRecognized.map((person, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-400 text-white' :
                      idx === 1 ? 'bg-gray-300 text-gray-700' :
                      idx === 2 ? 'bg-amber-600 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {idx + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.recognitions} recognitions</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600">
                      <Star className="h-4 w-4 fill-amber-400" />
                      <span className="font-bold text-sm">{person.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <Plus className="h-4 w-4 mr-2" />
                New Survey
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Send className="h-4 w-4 mr-2" />
                Recognition
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Feedback
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule 1:1
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
