import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Brain, Target, AlertTriangle,
  CheckCircle, Clock, ArrowRight, Lightbulb, GraduationCap, Briefcase,
  Heart, Activity, PieChart, LineChart
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

// Sample analytics data
const workforceMetrics = {
  totalEmployees: 1247,
  activeEmployees: 1189,
  newHires: 45,
  turnoverRate: 8.2,
  averageTenure: 4.3,
  genderRatio: { male: 52, female: 48 },
  departmentDistribution: [
    { name: "Teaching Staff", count: 856, percentage: 68.6 },
    { name: "Administration", count: 187, percentage: 15.0 },
    { name: "Support Services", count: 124, percentage: 10.0 },
    { name: "Leadership", count: 80, percentage: 6.4 },
  ],
};

const predictiveInsights = {
  turnoverRisk: [
    { department: "Mathematics", risk: 15, trend: "up", employees: 12 },
    { department: "Science", risk: 8, trend: "down", employees: 6 },
    { department: "English", risk: 22, trend: "up", employees: 18 },
    { department: "Arabic", risk: 5, trend: "stable", employees: 4 },
  ],
  highPerformers: {
    total: 156,
    atRisk: 23,
    recentlyPromoted: 12,
  },
  skillGaps: [
    { skill: "Digital Literacy", gap: 35, priority: "high" },
    { skill: "Data Analysis", gap: 42, priority: "high" },
    { skill: "Leadership", gap: 28, priority: "medium" },
    { skill: "Innovation Methods", gap: 45, priority: "high" },
    { skill: "Student Assessment", gap: 15, priority: "low" },
  ],
};

const engagementData = {
  overallScore: 78,
  trend: "+3%",
  dimensions: [
    { name: "Job Satisfaction", score: 82, benchmark: 75 },
    { name: "Work-Life Balance", score: 71, benchmark: 70 },
    { name: "Career Development", score: 68, benchmark: 72 },
    { name: "Management", score: 79, benchmark: 74 },
    { name: "Recognition", score: 75, benchmark: 71 },
    { name: "Team Collaboration", score: 84, benchmark: 76 },
  ],
};

const trainingMetrics = {
  completionRate: 73,
  averageScore: 85,
  hoursPerEmployee: 24,
  topCourses: [
    { name: "Digital Teaching Tools", completions: 892, rating: 4.7 },
    { name: "Student Assessment Methods", completions: 756, rating: 4.5 },
    { name: "Classroom Management", completions: 645, rating: 4.6 },
    { name: "Inclusive Education", completions: 523, rating: 4.8 },
  ],
};

const recruitmentMetrics = {
  openPositions: 23,
  applicationsReceived: 456,
  averageTimeToHire: 32,
  offerAcceptanceRate: 87,
  sourceEffectiveness: [
    { source: "Job Portal", applications: 234, hires: 18, quality: 4.2 },
    { source: "Referrals", applications: 89, hires: 12, quality: 4.6 },
    { source: "University", applications: 78, hires: 8, quality: 4.4 },
    { source: "Direct", applications: 55, hires: 5, quality: 4.1 },
  ],
};

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("quarter");

  const getRiskColor = (risk: number) => {
    if (risk >= 20) return "text-red-600 bg-red-50";
    if (risk >= 10) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down": return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <ArrowRight className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return <Badge className="bg-red-100 text-red-700">High</Badge>;
      case "medium": return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>;
      default: return <Badge className="bg-green-100 text-green-700">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered insights and predictive analytics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-3xl font-bold">{workforceMetrics.totalEmployees.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              +{workforceMetrics.newHires} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement Score</p>
                <p className="text-3xl font-bold">{engagementData.overallScore}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {engagementData.trend} vs last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Turnover Rate</p>
                <p className="text-3xl font-bold">{workforceMetrics.turnoverRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Industry avg: 12%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Training Completion</p>
                <p className="text-3xl font-bold">{trainingMetrics.completionRate}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {trainingMetrics.hoursPerEmployee}h avg per employee
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="predictive" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Predictive Insights
          </TabsTrigger>
          <TabsTrigger value="workforce" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Workforce
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="recruitment" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Recruitment
          </TabsTrigger>
        </TabsList>

        {/* Predictive Insights Tab */}
        <TabsContent value="predictive" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Turnover Risk Analysis
                </CardTitle>
                <CardDescription>
                  AI-predicted turnover risk by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveInsights.turnoverRisk.map((dept) => (
                    <div key={dept.department} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{dept.department}</span>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(dept.trend)}
                            <span className={`px-2 py-0.5 rounded text-sm font-medium ${getRiskColor(dept.risk)}`}>
                              {dept.risk}% risk
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={dept.risk} 
                          className={`h-2 ${dept.risk >= 20 ? '[&>div]:bg-red-500' : dept.risk >= 10 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {dept.employees} employees at risk
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Detailed Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Skills Gap Analysis
                </CardTitle>
                <CardDescription>
                  Critical skill gaps across the organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveInsights.skillGaps.map((skill) => (
                    <div key={skill.skill} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{skill.skill}</span>
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(skill.priority)}
                          </div>
                        </div>
                        <Progress value={skill.gap} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {skill.gap}% of workforce needs training
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Generate Training Plan
                  <Lightbulb className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                Smart suggestions based on predictive analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-900">High Priority</h4>
                  </div>
                  <p className="text-sm text-red-700">
                    18 employees in English department show high turnover risk. 
                    Consider conducting stay interviews and reviewing compensation.
                  </p>
                  <Button size="sm" variant="outline" className="mt-3 border-red-300 text-red-700">
                    Take Action
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900">Upcoming</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    45% gap in Digital Literacy skills. Launch targeted training 
                    program within next quarter to maintain competitiveness.
                  </p>
                  <Button size="sm" variant="outline" className="mt-3 border-yellow-300 text-yellow-700">
                    Schedule Training
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Positive Trend</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Engagement scores up 3% this quarter. Team collaboration 
                    initiatives showing strong ROI. Consider expanding program.
                  </p>
                  <Button size="sm" variant="outline" className="mt-3 border-green-300 text-green-700">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workforce Tab */}
        <TabsContent value="workforce" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-500" />
                  Department Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workforceMetrics.departmentDistribution.map((dept) => (
                    <div key={dept.name}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{dept.name}</span>
                        <span>{dept.count} ({dept.percentage}%)</span>
                      </div>
                      <Progress value={dept.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-green-500" />
                  Workforce Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="text-sm text-muted-foreground">Average Tenure</p>
                    <p className="text-2xl font-bold">{workforceMetrics.averageTenure} years</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="text-sm text-muted-foreground">Active Employees</p>
                    <p className="text-2xl font-bold">{workforceMetrics.activeEmployees}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="text-sm text-muted-foreground">Gender Ratio</p>
                    <p className="text-lg font-bold">
                      {workforceMetrics.genderRatio.male}% / {workforceMetrics.genderRatio.female}%
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <p className="text-sm text-muted-foreground">New This Month</p>
                    <p className="text-2xl font-bold text-green-600">+{workforceMetrics.newHires}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Engagement Dimensions
              </CardTitle>
              <CardDescription>
                Compared against industry benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {engagementData.dimensions.map((dim) => (
                  <div key={dim.name} className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">{dim.name}</h4>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-3xl font-bold">{dim.score}%</span>
                      <span className={`text-sm mb-1 ${dim.score >= dim.benchmark ? 'text-green-600' : 'text-red-600'}`}>
                        {dim.score >= dim.benchmark ? '↑' : '↓'} vs {dim.benchmark}% benchmark
                      </span>
                    </div>
                    <Progress 
                      value={dim.score} 
                      className={`h-2 ${dim.score >= dim.benchmark ? '[&>div]:bg-green-500' : '[&>div]:bg-yellow-500'}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recruitment Tab */}
        <TabsContent value="recruitment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-3xl font-bold">{recruitmentMetrics.openPositions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-3xl font-bold">{recruitmentMetrics.applicationsReceived}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Avg Time to Hire</p>
                <p className="text-3xl font-bold">{recruitmentMetrics.averageTimeToHire} days</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Offer Acceptance</p>
                <p className="text-3xl font-bold text-green-600">{recruitmentMetrics.offerAcceptanceRate}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Source Effectiveness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recruitmentMetrics.sourceEffectiveness.map((source) => (
                  <div key={source.source} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium">{source.source}</p>
                      <p className="text-sm text-muted-foreground">
                        {source.applications} applications, {source.hires} hires
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Quality: {source.quality}/5</p>
                      <p className="text-sm text-muted-foreground">
                        {((source.hires / source.applications) * 100).toFixed(1)}% conversion
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
