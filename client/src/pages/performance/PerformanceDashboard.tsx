import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Target, TrendingUp, Users, Award, Calendar, ChevronRight, 
  Star, GraduationCap, Building, Clock, AlertCircle, CheckCircle,
  FileText, MessageSquare, BarChart3, Zap, Eye, Play, TrendingDown
} from "lucide-react";
import { Link } from "wouter";

// Demo data
const performanceTrends = [
  { month: "Jul", score: 72, target: 75 },
  { month: "Aug", score: 74, target: 75 },
  { month: "Sep", score: 78, target: 75 },
  { month: "Oct", score: 76, target: 80 },
  { month: "Nov", score: 82, target: 80 },
  { month: "Dec", score: 85, target: 80 },
];

const goalsByStatus = [
  { status: "Completed", count: 18, color: "bg-green-500", percent: 43 },
  { status: "On Track", count: 14, color: "bg-blue-500", percent: 33 },
  { status: "At Risk", count: 6, color: "bg-yellow-500", percent: 14 },
  { status: "Overdue", count: 4, color: "bg-red-500", percent: 10 },
];

const upcomingReviews = [
  { id: 1, employee: "Sarah Ahmed", position: "Mathematics Teacher", dueDate: "Dec 15", daysLeft: 3, reviewer: "Dr. Hassan", type: "Annual" },
  { id: 2, employee: "Mohammed Ali", position: "Science Coordinator", dueDate: "Dec 16", daysLeft: 4, reviewer: "Ms. Fatima", type: "Mid-Year" },
  { id: 3, employee: "Layla Khalid", position: "Elementary Teacher", dueDate: "Dec 18", daysLeft: 6, reviewer: "Mr. Omar", type: "Probation" },
  { id: 4, employee: "Ahmed Hassan", position: "Special Ed Teacher", dueDate: "Dec 20", daysLeft: 8, reviewer: "Dr. Aisha", type: "Annual" },
];

const topPerformers = [
  { id: 1, name: "Fatima Al-Rashid", department: "Mathematics", score: 98, badge: "🏆", trend: "+5" },
  { id: 2, name: "Omar Saeed", department: "Science", score: 96, badge: "🥈", trend: "+3" },
  { id: 3, name: "Noor Abdullah", department: "English", score: 95, badge: "🥉", trend: "+4" },
  { id: 4, name: "Khalid Mohammed", department: "Elementary", score: 94, badge: "⭐", trend: "+2" },
  { id: 5, name: "Aisha Al-Maktoum", department: "Special Ed", score: 93, badge: "⭐", trend: "+6" },
];

const departmentPerformance = [
  { dept: "Mathematics", score: 88, employees: 12, trend: "+3" },
  { dept: "Science", score: 85, employees: 10, trend: "+2" },
  { dept: "English", score: 82, employees: 14, trend: "+1" },
  { dept: "Elementary", score: 80, employees: 18, trend: "+4" },
  { dept: "Special Ed", score: 78, employees: 8, trend: "-1" },
  { dept: "Administration", score: 86, employees: 6, trend: "+2" },
];

const reviewCycleStages = [
  { stage: "Self Assessment", completed: 85, total: 100 },
  { stage: "Manager Review", completed: 62, total: 100 },
  { stage: "Calibration", completed: 45, total: 100 },
  { stage: "Final Approval", completed: 28, total: 100 },
];

const educatorMetrics = [
  { label: "Student Outcome Correlation", value: 0.82, description: "Performance vs Student Grades" },
  { label: "Classroom Observation Avg", value: 4.2, max: 5, description: "Based on 3 observations" },
  { label: "PD Hours Completed", value: 28, target: 40, description: "This academic year" },
  { label: "Peer Feedback Score", value: 4.5, max: 5, description: "From 8 colleagues" },
];

export default function PerformanceDashboard() {
  const maxDeptScore = Math.max(...departmentPerformance.map(d => d.score));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            Performance Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Monitor performance metrics and trends</p>
        </div>
        <div className="flex gap-2">
          <Link href="/performance/cycles">
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              View All Reviews
            </Button>
          </Link>
          <Link href="/performance/goals">
            <Button className="gap-2">
              <Target className="h-4 w-4" />
              Manage Goals
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">Across all employees</p>
              </div>
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8
              </div>
            </div>
            <Progress value={67} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-1">67% on track</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Avg. Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">67%</div>
                <p className="text-xs text-muted-foreground">Goal completion</p>
              </div>
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12%
              </div>
            </div>
            <div className="flex gap-1 mt-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded ${i < 7 ? 'bg-green-500' : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs 55% last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-yellow-600" />
              Reviews Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">Due this week</p>
              </div>
              <div className="flex items-center text-yellow-600 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                3 urgent
              </div>
            </div>
            <Progress value={45} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-1">15 of 33 completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">28</div>
                <p className="text-xs text-muted-foreground">Above 90% rating</p>
              </div>
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                +5
              </div>
            </div>
            <div className="flex -space-x-2 mt-3">
              {topPerformers.slice(0, 5).map((p, i) => (
                <Avatar key={i} className="h-7 w-7 border-2 border-background">
                  <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                +23
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends and Goal Status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-48 gap-3">
              {performanceTrends.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{month.score}%</span>
                  <div className="w-full flex flex-col gap-1" style={{ height: '140px' }}>
                    <div 
                      className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                      style={{ height: `${(month.score / 100) * 100}%`, marginTop: 'auto' }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500" />
                  <span>Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border-2 border-dashed border-gray-400" />
                  <span>Target</span>
                </div>
              </div>
              <span className="text-green-600 font-medium">+13% YTD</span>
            </div>
          </CardContent>
        </Card>

        {/* Goal Completion Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goal Completion Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                  <circle cx="64" cy="64" r="56" stroke="#22c55e" strokeWidth="12" fill="none" 
                    strokeDasharray={`${43 * 3.51} ${100 * 3.51}`} />
                  <circle cx="64" cy="64" r="56" stroke="#3b82f6" strokeWidth="12" fill="none" 
                    strokeDasharray={`${33 * 3.51} ${100 * 3.51}`} strokeDashoffset={`${-43 * 3.51}`} />
                  <circle cx="64" cy="64" r="56" stroke="#eab308" strokeWidth="12" fill="none" 
                    strokeDasharray={`${14 * 3.51} ${100 * 3.51}`} strokeDashoffset={`${-76 * 3.51}`} />
                  <circle cx="64" cy="64" r="56" stroke="#ef4444" strokeWidth="12" fill="none" 
                    strokeDasharray={`${10 * 3.51} ${100 * 3.51}`} strokeDashoffset={`${-90 * 3.51}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">42</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {goalsByStatus.map((status) => (
                <div key={status.status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${status.color}`} />
                  <span className="text-sm">{status.status}</span>
                  <span className="text-sm font-bold ml-auto">{status.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reviews and Top Performers */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Reviews
            </CardTitle>
            <Link href="/performance/cycles">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingReviews.map((review) => (
                <div key={review.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {review.employee.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{review.employee}</div>
                    <div className="text-xs text-muted-foreground">{review.position}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={review.daysLeft <= 3 ? "destructive" : review.daysLeft <= 5 ? "default" : "secondary"}>
                      {review.daysLeft} days
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">{review.type}</div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Play className="h-3 w-3" />
                    Start
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers Leaderboard */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <Badge variant="outline">Q4 2025</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((performer, idx) => (
                <div key={performer.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="text-2xl w-8 text-center">{performer.badge}</div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {performer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{performer.name}</div>
                    <div className="text-xs text-muted-foreground">{performer.department}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{performer.score}%</div>
                    <div className="text-xs text-green-600">↑ {performer.trend}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance and Review Cycle */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Performance by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentPerformance.map((dept) => (
                <div key={dept.dept} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dept.dept}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{dept.score}%</span>
                      <span className={`text-xs ${dept.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {dept.trend}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={dept.score} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground w-16">{dept.employees} staff</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Review Cycle Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Review Cycle Progress
            </CardTitle>
            <p className="text-sm text-muted-foreground">Q4 2025 Annual Review</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviewCycleStages.map((stage, idx) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      stage.completed === stage.total ? 'bg-green-500 text-white' : 
                      stage.completed > 0 ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {stage.completed === stage.total ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{stage.stage}</span>
                        <span className="text-sm">{stage.completed}%</span>
                      </div>
                      <Progress value={stage.completed} className="mt-1 h-2" />
                    </div>
                  </div>
                  {idx < reviewCycleStages.length - 1 && (
                    <div className="absolute left-5 top-10 w-0.5 h-6 bg-muted" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Deadline</span>
                <span className="font-medium">December 31, 2025</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Educator Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Actions */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link href="/performance/cycles">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                <span className="text-xs">Start Review</span>
              </Button>
            </Link>
            <Link href="/performance/goals">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <span className="text-xs">Set Goals</span>
              </Button>
            </Link>
            <Link href="/performance/360-feedback">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span className="text-xs">Give Feedback</span>
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
              <FileText className="h-5 w-5 text-yellow-600" />
              <span className="text-xs">View Reports</span>
            </Button>
          </CardContent>
        </Card>

        {/* Educator-Specific Metrics */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Educator Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {educatorMetrics.map((metric) => (
                <div key={metric.label} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.label}</span>
                    {metric.max ? (
                      <span className="text-lg font-bold">{metric.value}/{metric.max}</span>
                    ) : metric.target ? (
                      <span className="text-lg font-bold">{metric.value}/{metric.target}</span>
                    ) : (
                      <span className="text-lg font-bold">{metric.value}</span>
                    )}
                  </div>
                  <Progress 
                    value={metric.max ? (metric.value / metric.max) * 100 : 
                           metric.target ? (metric.value / metric.target) * 100 : 
                           metric.value * 100} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Insight:</span>
                <span>Educators with 30+ PD hours show 15% higher student outcomes on average</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
