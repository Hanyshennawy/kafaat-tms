import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Target,
  Calendar,
  Users,
  Star,
  GraduationCap,
  Sparkles,
  Lightbulb,
  Brain,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

// Mock employees data
const employees = [
  { id: 1, name: "Sarah Al-Mansouri", position: "Senior Mathematics Teacher", department: "Mathematics" },
  { id: 2, name: "Ahmed Hassan", position: "Physics Department Head", department: "Science" },
  { id: 3, name: "Fatima Al-Zaabi", position: "English Language Specialist", department: "Languages" },
  { id: 4, name: "Mohammed Al-Kaabi", position: "Chemistry Teacher", department: "Science" },
  { id: 5, name: "Noura Al-Suwaidi", position: "Arabic Language Teacher", department: "Languages" },
];

// Mock performance data over time
const performanceData = [
  { month: "Jan", performance: 85, careerGrowth: 78, examScore: 88, satisfaction: 82, peerAvg: 80 },
  { month: "Feb", performance: 87, careerGrowth: 80, examScore: 90, satisfaction: 84, peerAvg: 81 },
  { month: "Mar", performance: 89, careerGrowth: 83, examScore: 92, satisfaction: 86, peerAvg: 82 },
  { month: "Apr", performance: 91, careerGrowth: 85, examScore: 93, satisfaction: 88, peerAvg: 83 },
  { month: "May", performance: 93, careerGrowth: 88, examScore: 95, satisfaction: 90, peerAvg: 84 },
  { month: "Jun", performance: 95, careerGrowth: 90, examScore: 96, satisfaction: 92, peerAvg: 85 },
  { month: "Jul", performance: 96, careerGrowth: 92, examScore: 97, satisfaction: 93, peerAvg: 86 },
  { month: "Aug", performance: 97, careerGrowth: 93, examScore: 98, satisfaction: 94, peerAvg: 87 },
  { month: "Sep", performance: 98, careerGrowth: 95, examScore: 99, satisfaction: 95, peerAvg: 88 },
  { month: "Oct", performance: 98, careerGrowth: 96, examScore: 100, satisfaction: 96, peerAvg: 89 },
  { month: "Nov", performance: 98, careerGrowth: 97, examScore: 100, satisfaction: 97, peerAvg: 90 },
  { month: "Dec", performance: 98, careerGrowth: 98, examScore: 100, satisfaction: 98, peerAvg: 91 },
];

// Mock milestones
const milestones = [
  { month: "Mar", event: "Completed Advanced Pedagogy Course", type: "training" },
  { month: "Jun", event: "Promoted to Senior Teacher", type: "promotion" },
  { month: "Sep", event: "Won Innovation Award", type: "award" },
  { month: "Nov", event: "Achieved 100% Exam Pass Rate", type: "achievement" },
];

// Mock goals
const goals = [
  { title: "Achieve 95% Performance Score", target: 95, current: 98, status: "completed" },
  { title: "Complete Leadership Training", target: 100, current: 100, status: "completed" },
  { title: "Mentor 5 New Teachers", target: 5, current: 7, status: "exceeded" },
  { title: "Publish Research Paper", target: 1, current: 0, status: "in-progress" },
];

const timeRanges = [
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
  { value: "2y", label: "Last 2 Years" },
  { value: "all", label: "All Time" },
];

function getTrendIcon(trend: "up" | "down" | "stable") {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-600" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-600" />;
  return <Minus className="h-4 w-4 text-gray-500" />;
}

function getTrendColor(trend: "up" | "down" | "stable") {
  if (trend === "up") return "text-green-600";
  if (trend === "down") return "text-red-600";
  return "text-gray-500";
}

function calculateTrend(data: number[]): "up" | "down" | "stable" {
  const recent = data.slice(-3);
  const earlier = data.slice(-6, -3);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  
  if (recentAvg > earlierAvg + 2) return "up";
  if (recentAvg < earlierAvg - 2) return "down";
  return "stable";
}

export default function PerformanceTrends() {
  const [selectedEmployee, setSelectedEmployee] = useState("1");
  const [timeRange, setTimeRange] = useState("1y");
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // AI Customization Settings
  const [aiSettings, setAiSettings] = useState({
    priorityThreshold: 70,
    suggestionCount: 4,
    minPerformanceGap: 5,
    categories: {
      professionalDevelopment: true,
      collaboration: true,
      innovation: true,
      leadership: true,
    },
    focusAreas: {
      skills: true,
      training: true,
      goals: true,
      teamwork: true,
    },
    tone: "balanced" as "encouraging" | "direct" | "balanced",
  });
  
  const resetSettings = () => {
    setAiSettings({
      priorityThreshold: 70,
      suggestionCount: 4,
      minPerformanceGap: 5,
      categories: {
        professionalDevelopment: true,
        collaboration: true,
        innovation: true,
        leadership: true,
      },
      focusAreas: {
        skills: true,
        training: true,
        goals: true,
        teamwork: true,
      },
      tone: "balanced",
    });
  };

  const employee = employees.find((e) => e.id.toString() === selectedEmployee) || employees[0];

  const performanceTrend = calculateTrend(performanceData.map((d) => d.performance));
  const careerGrowthTrend = calculateTrend(performanceData.map((d) => d.careerGrowth));
  const examScoreTrend = calculateTrend(performanceData.map((d) => d.examScore));
  const satisfactionTrend = calculateTrend(performanceData.map((d) => d.satisfaction));

  const currentPerformance = performanceData[performanceData.length - 1];
  const previousPerformance = performanceData[performanceData.length - 2];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            Employee Performance Trends
          </h1>
          <p className="text-muted-foreground">Track individual performance metrics over time</p>
        </div>
      </div>

      {/* Employee Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg font-bold">
                  {employee.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Employee</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-full md:w-[400px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.name} - {emp.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="w-full md:w-[200px]">
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Viewing performance trends for: <strong>{employee.name}</strong> ({employee.position})
              </span>
            </div>
            <Badge className="bg-blue-600">{employee.department}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{currentPerformance.performance}%</div>
              <div className="flex items-center gap-1">
                {getTrendIcon(performanceTrend)}
                <span className={cn("text-sm font-medium", getTrendColor(performanceTrend))}>
                  {performanceTrend === "up" ? "Improving" : performanceTrend === "down" ? "Declining" : "Stable"}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentPerformance.performance > previousPerformance.performance ? "+" : ""}
              {(currentPerformance.performance - previousPerformance.performance).toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Career Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{currentPerformance.careerGrowth}%</div>
              <div className="flex items-center gap-1">
                {getTrendIcon(careerGrowthTrend)}
                <span className={cn("text-sm font-medium", getTrendColor(careerGrowthTrend))}>
                  {careerGrowthTrend === "up" ? "Improving" : careerGrowthTrend === "down" ? "Declining" : "Stable"}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentPerformance.careerGrowth > previousPerformance.careerGrowth ? "+" : ""}
              {(currentPerformance.careerGrowth - previousPerformance.careerGrowth).toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Exam Scores</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{currentPerformance.examScore}%</div>
              <div className="flex items-center gap-1">
                {getTrendIcon(examScoreTrend)}
                <span className={cn("text-sm font-medium", getTrendColor(examScoreTrend))}>
                  {examScoreTrend === "up" ? "Improving" : examScoreTrend === "down" ? "Declining" : "Stable"}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentPerformance.examScore > previousPerformance.examScore ? "+" : ""}
              {(currentPerformance.examScore - previousPerformance.examScore).toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Student Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{currentPerformance.satisfaction}%</div>
              <div className="flex items-center gap-1">
                {getTrendIcon(satisfactionTrend)}
                <span className={cn("text-sm font-medium", getTrendColor(satisfactionTrend))}>
                  {satisfactionTrend === "up" ? "Improving" : satisfactionTrend === "down" ? "Declining" : "Stable"}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentPerformance.satisfaction > previousPerformance.satisfaction ? "+" : ""}
              {(currentPerformance.satisfaction - previousPerformance.satisfaction).toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance Trend</CardTitle>
          <CardDescription>Performance score over time with peer comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[70, 100]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="performance"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPerformance)"
                name="Performance Score"
              />
              <Line
                type="monotone"
                dataKey="peerAvg"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Peer Average"
                dot={false}
              />
              {milestones.map((milestone, idx) => (
                <ReferenceLine
                  key={idx}
                  x={milestone.month}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label={{ value: "🎯", position: "top" }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Multi-Metric Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics Comparison</CardTitle>
          <CardDescription>Track multiple performance indicators simultaneously</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[70, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="performance"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Performance Score"
              />
              <Line
                type="monotone"
                dataKey="careerGrowth"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Career Growth"
              />
              <Line
                type="monotone"
                dataKey="examScore"
                stroke="#10b981"
                strokeWidth={2}
                name="Exam Scores"
              />
              <Line
                type="monotone"
                dataKey="satisfaction"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Student Satisfaction"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Milestones & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Milestones & Achievements
            </CardTitle>
            <CardDescription>Key events and accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                    {milestone.type === "award" && <Award className="h-5 w-5 text-green-600" />}
                    {milestone.type === "promotion" && <TrendingUp className="h-5 w-5 text-green-600" />}
                    {milestone.type === "training" && <GraduationCap className="h-5 w-5 text-green-600" />}
                    {milestone.type === "achievement" && <Sparkles className="h-5 w-5 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{milestone.event}</p>
                    <p className="text-sm text-muted-foreground">{milestone.month} 2024</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {milestone.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Goals
            </CardTitle>
            <CardDescription>Current goals and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{goal.title}</span>
                    <Badge
                      className={cn(
                        goal.status === "completed" && "bg-green-100 text-green-800",
                        goal.status === "exceeded" && "bg-blue-100 text-blue-800",
                        goal.status === "in-progress" && "bg-yellow-100 text-yellow-800"
                      )}
                    >
                      {goal.status === "completed" && "✓ Completed"}
                      {goal.status === "exceeded" && "★ Exceeded"}
                      {goal.status === "in-progress" && "In Progress"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          goal.status === "completed" && "bg-green-500",
                          goal.status === "exceeded" && "bg-blue-500",
                          goal.status === "in-progress" && "bg-yellow-500"
                        )}
                        style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Overall performance analysis for {employee.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">13%</div>
              <p className="text-sm text-muted-foreground mt-1">Performance Improvement</p>
              <p className="text-xs text-muted-foreground">Over the past year</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">8%</div>
              <p className="text-sm text-muted-foreground mt-1">Above Peer Average</p>
              <p className="text-xs text-muted-foreground">Consistently outperforming</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">4</div>
              <p className="text-sm text-muted-foreground mt-1">Major Milestones</p>
              <p className="text-xs text-muted-foreground">Achieved this year</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-Driven Suggestions */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <div>
                <CardTitle>AI-Driven Performance Suggestions</CardTitle>
                <CardDescription>Personalized recommendations based on performance analysis</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Customize AI
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      AI Suggestion Settings
                    </DialogTitle>
                    <DialogDescription>
                      Customize how AI analyzes performance and generates suggestions
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    {/* Priority Threshold */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Priority Threshold</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimum performance score to trigger high-priority suggestions
                      </p>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[aiSettings.priorityThreshold]}
                          onValueChange={(value) => setAiSettings({ ...aiSettings, priorityThreshold: value[0] })}
                          min={50}
                          max={95}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12 text-right">{aiSettings.priorityThreshold}%</span>
                      </div>
                    </div>

                    {/* Suggestion Count */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Number of Suggestions</Label>
                      <p className="text-sm text-muted-foreground">
                        Maximum suggestions to display per employee
                      </p>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[aiSettings.suggestionCount]}
                          onValueChange={(value) => setAiSettings({ ...aiSettings, suggestionCount: value[0] })}
                          min={2}
                          max={8}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12 text-right">{aiSettings.suggestionCount}</span>
                      </div>
                    </div>

                    {/* Performance Gap */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Minimum Performance Gap</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimum percentage difference to identify improvement areas
                      </p>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[aiSettings.minPerformanceGap]}
                          onValueChange={(value) => setAiSettings({ ...aiSettings, minPerformanceGap: value[0] })}
                          min={1}
                          max={20}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12 text-right">{aiSettings.minPerformanceGap}%</span>
                      </div>
                    </div>

                    {/* Suggestion Categories */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Suggestion Categories</Label>
                      <p className="text-sm text-muted-foreground">
                        Select which types of suggestions to include
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <Label htmlFor="cat-prof" className="cursor-pointer">Professional Development</Label>
                          <Switch
                            id="cat-prof"
                            checked={aiSettings.categories.professionalDevelopment}
                            onCheckedChange={(checked) =>
                              setAiSettings({
                                ...aiSettings,
                                categories: { ...aiSettings.categories, professionalDevelopment: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <Label htmlFor="cat-collab" className="cursor-pointer">Collaboration</Label>
                          <Switch
                            id="cat-collab"
                            checked={aiSettings.categories.collaboration}
                            onCheckedChange={(checked) =>
                              setAiSettings({
                                ...aiSettings,
                                categories: { ...aiSettings.categories, collaboration: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <Label htmlFor="cat-innov" className="cursor-pointer">Innovation</Label>
                          <Switch
                            id="cat-innov"
                            checked={aiSettings.categories.innovation}
                            onCheckedChange={(checked) =>
                              setAiSettings({
                                ...aiSettings,
                                categories: { ...aiSettings.categories, innovation: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <Label htmlFor="cat-lead" className="cursor-pointer">Leadership</Label>
                          <Switch
                            id="cat-lead"
                            checked={aiSettings.categories.leadership}
                            onCheckedChange={(checked) =>
                              setAiSettings({
                                ...aiSettings,
                                categories: { ...aiSettings.categories, leadership: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Focus Areas */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Focus Areas</Label>
                      <p className="text-sm text-muted-foreground">
                        Prioritize specific areas for improvement suggestions
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <Label htmlFor="focus-skills" className="cursor-pointer">Skills Development</Label>
                          <Switch
                            id="focus-skills"
                            checked={aiSettings.focusAreas.skills}
                            onCheckedChange={(checked) =>
                              setAiSettings({
                                ...aiSettings,
                                focusAreas: { ...aiSettings.focusAreas, skills: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <Label htmlFor="focus-training" className="cursor-pointer">Training Programs</Label>
                          <Switch
                            id="focus-training"
                            checked={aiSettings.focusAreas.training}
                            onCheckedChange={(checked) =>
                              setAiSettings({
                                ...aiSettings,
                                focusAreas: { ...aiSettings.focusAreas, training: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <Label htmlFor="focus-goals" className="cursor-pointer">Goal Achievement</Label>
                          <Switch
                            id="focus-goals"
                            checked={aiSettings.focusAreas.goals}
                            onCheckedChange={(checked) =>
                              setAiSettings({
                                ...aiSettings,
                                focusAreas: { ...aiSettings.focusAreas, goals: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <Label htmlFor="focus-team" className="cursor-pointer">Teamwork</Label>
                          <Switch
                            id="focus-team"
                            checked={aiSettings.focusAreas.teamwork}
                            onCheckedChange={(checked) =>
                              setAiSettings({
                                ...aiSettings,
                                focusAreas: { ...aiSettings.focusAreas, teamwork: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tone/Style */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Suggestion Tone</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose the communication style for AI suggestions
                      </p>
                      <RadioGroup
                        value={aiSettings.tone}
                        onValueChange={(value: any) => setAiSettings({ ...aiSettings, tone: value })}
                      >
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value="encouraging" id="tone-enc" />
                          <Label htmlFor="tone-enc" className="cursor-pointer flex-1">
                            <div>
                              <p className="font-medium">Encouraging</p>
                              <p className="text-xs text-muted-foreground">Positive, motivational language</p>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value="balanced" id="tone-bal" />
                          <Label htmlFor="tone-bal" className="cursor-pointer flex-1">
                            <div>
                              <p className="font-medium">Balanced</p>
                              <p className="text-xs text-muted-foreground">Professional, objective feedback</p>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value="direct" id="tone-dir" />
                          <Label htmlFor="tone-dir" className="cursor-pointer flex-1">
                            <div>
                              <p className="font-medium">Direct</p>
                              <p className="text-xs text-muted-foreground">Straightforward, action-focused</p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline" onClick={resetSettings}>
                      Reset to Defaults
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setSettingsOpen(false);
                          setGeneratingSuggestions(true);
                          setTimeout(() => setGeneratingSuggestions(false), 1500);
                        }}
                      >
                        Apply & Regenerate
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <button
                onClick={() => {
                  setGeneratingSuggestions(true);
                  setTimeout(() => setGeneratingSuggestions(false), 1500);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={generatingSuggestions}
              >
                <RefreshCw className={cn("h-4 w-4", generatingSuggestions && "animate-spin")} />
                {generatingSuggestions ? "Generating..." : "Refresh Suggestions"}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* High Priority Suggestion */}
            <div className="p-4 bg-white border-2 border-red-200 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                </div>
                <Lightbulb className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Enhance Research Publication Output</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Analysis shows research publication is the only incomplete goal. Focus on this area to achieve comprehensive excellence.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Recommended Actions:</p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Allocate 2 hours weekly for research writing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Join the MOE Research Collaboration Network</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Submit to UAE Education Journal by Q2 2025</span>
                  </li>
                </ul>
              </div>
              <Badge variant="outline" className="text-xs">Category: Professional Development</Badge>
            </div>

            {/* Medium Priority Suggestion */}
            <div className="p-4 bg-white border-2 border-yellow-200 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-yellow-600" />
                  <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
                </div>
                <Lightbulb className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Expand Cross-Department Collaboration</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your performance is excellent within Mathematics. Consider leading interdisciplinary projects to broaden impact.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Recommended Actions:</p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Initiate STEM integration project with Science dept</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Mentor teachers from other departments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Present at next all-staff professional development day</span>
                  </li>
                </ul>
              </div>
              <Badge variant="outline" className="text-xs">Category: Collaboration</Badge>
            </div>

            {/* Low Priority Suggestion */}
            <div className="p-4 bg-white border-2 border-blue-200 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <Badge className="bg-blue-100 text-blue-800">Growth Opportunity</Badge>
                </div>
                <Lightbulb className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Advanced Technology Integration</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  With your strong performance baseline, explore emerging educational technologies to stay ahead of the curve.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Recommended Actions:</p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Complete AI in Education certification course</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Pilot adaptive learning platform in one class</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Share findings at regional education conference</span>
                  </li>
                </ul>
              </div>
              <Badge variant="outline" className="text-xs">Category: Innovation</Badge>
            </div>

            {/* Strength Recognition */}
            <div className="p-4 bg-white border-2 border-green-200 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">Strength</Badge>
                </div>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Exceptional Student Satisfaction</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your student satisfaction scores (98%) are outstanding. Consider sharing your engagement strategies with colleagues.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Leverage This Strength:</p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Lead workshop on student engagement techniques</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Document best practices for MOE knowledge base</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Mentor new teachers on classroom management</span>
                  </li>
                </ul>
              </div>
              <Badge variant="outline" className="text-xs">Category: Leadership</Badge>
            </div>
          </div>

          {/* AI Insights Footer */}
          <div className="mt-6 p-4 bg-purple-100 rounded-lg">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900">AI Analysis Insights</p>
                <p className="text-xs text-purple-700 mt-1">
                  These suggestions are generated by analyzing {employee.name}'s performance trends, goal progress, peer comparisons, and milestone achievements. 
                  The AI identifies both areas for improvement and strengths to leverage for continued growth. Recommendations are personalized based on individual career trajectory and departmental context.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
