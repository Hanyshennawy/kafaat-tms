import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { FileQuestion, TrendingUp, Users, Target, CalendarIcon, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Date range presets
const DATE_RANGES = {
  "7d": { label: "Last 7 days", days: 7 },
  "30d": { label: "Last 30 days", days: 30 },
  "3m": { label: "Last 3 months", days: 90 },
  "6m": { label: "Last 6 months", days: 180 },
  "1y": { label: "Last year", days: 365 },
  all: { label: "All time", days: null },
};

// Mock data for demonstration
const difficultyData = [
  { name: "Basic", count: 45, compareCount: 38, percentage: 30 },
  { name: "Intermediate", count: 60, compareCount: 55, percentage: 40 },
  { name: "Advanced", count: 35, compareCount: 30, percentage: 23 },
  { name: "Expert", count: 10, compareCount: 8, percentage: 7 },
];

const typeData = [
  { name: "Multiple Choice", value: 85, compareValue: 78 },
  { name: "True/False", value: 30, compareValue: 28 },
  { name: "Essay", value: 20, compareValue: 18 },
  { name: "Scenario", value: 15, compareValue: 12 },
];

const subjectData = [
  { name: "Pedagogy", count: 40, compareCount: 35 },
  { name: "Assessment", count: 35, compareCount: 32 },
  { name: "Educational Theory", count: 30, compareCount: 28 },
  { name: "Classroom Management", count: 25, compareCount: 22 },
  { name: "Curriculum Design", count: 20, compareCount: 18 },
];

const usageData = [
  { month: "Jan", exams: 12, questions: 120, compareExams: 10, compareQuestions: 100 },
  { month: "Feb", exams: 18, questions: 180, compareExams: 15, compareQuestions: 150 },
  { month: "Mar", exams: 22, questions: 220, compareExams: 18, compareQuestions: 180 },
  { month: "Apr", exams: 28, questions: 280, compareExams: 22, compareQuestions: 220 },
  { month: "May", exams: 35, questions: 350, compareExams: 28, compareQuestions: 280 },
  { month: "Jun", exams: 42, questions: 420, compareExams: 35, compareQuestions: 350 },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

interface MetricCardProps {
  title: string;
  icon: React.ElementType;
  currentValue: number;
  compareValue?: number;
  format?: "number" | "percentage";
  comparisonMode: boolean;
}

function MetricCard({ title, icon: Icon, currentValue, compareValue, format = "number", comparisonMode }: MetricCardProps) {
  const formatValue = (val: number) => {
    if (format === "percentage") return `${val}%`;
    return val.toLocaleString();
  };

  const calculateChange = () => {
    if (!compareValue || compareValue === 0) return 0;
    return ((currentValue - compareValue) / compareValue) * 100;
  };

  const change = calculateChange();
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(currentValue)}</div>
        {comparisonMode && compareValue !== undefined ? (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground">
              Previous: {formatValue(compareValue)}
            </p>
            <div className="flex items-center gap-1">
              {isNeutral ? (
                <Minus className="h-3 w-3 text-gray-500" />
              ) : isPositive ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <span className={cn(
                "text-xs font-medium",
                isNeutral ? "text-gray-500" : isPositive ? "text-green-600" : "text-red-600"
              )}>
                {isNeutral ? "No change" : `${Math.abs(change).toFixed(1)}% ${isPositive ? "increase" : "decrease"}`}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-green-600">+12%</span> from previous period
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function QMSAnalytics() {
  const [comparisonMode, setComparisonMode] = useState(false);
  const [dateRange, setDateRange] = useState<string>("30d");
  const [compareDateRange, setCompareDateRange] = useState<string>("30d");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [compareCustomStartDate, setCompareCustomStartDate] = useState<Date>();
  const [compareCustomEndDate, setCompareCustomEndDate] = useState<Date>();
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [showCompareCustomDatePicker, setShowCompareCustomDatePicker] = useState(false);

  const getDateRangeLabel = (range: string, startDate?: Date, endDate?: Date) => {
    if (range === "custom" && startDate && endDate) {
      return `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`;
    }
    return DATE_RANGES[range as keyof typeof DATE_RANGES]?.label || "Select range";
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    if (value === "custom") {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
    }
  };

  const handleCompareDateRangeChange = (value: string) => {
    setCompareDateRange(value);
    if (value === "custom") {
      setShowCompareCustomDatePicker(true);
    } else {
      setShowCompareCustomDatePicker(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Comparison Toggle and Date Range Filters */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Question Bank Analytics</h1>
          <p className="text-muted-foreground">Comprehensive statistics and insights</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          {/* Comparison Mode Toggle */}
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg">
            <Switch
              id="comparison-mode"
              checked={comparisonMode}
              onCheckedChange={setComparisonMode}
            />
            <Label htmlFor="comparison-mode" className="cursor-pointer font-medium">
              Comparison Mode
            </Label>
          </div>

          {/* Date Range Selectors */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">
                {comparisonMode ? "Period 1 (Current)" : "Date Range"}
              </Label>
              <div className="flex gap-2">
                <Select value={dateRange} onValueChange={handleDateRangeChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="3m">Last 3 months</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>

                {dateRange === "custom" && (
                  <Popover open={showCustomDatePicker} onOpenChange={setShowCustomDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !customStartDate && !customEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customStartDate && customEndDate ? (
                          `${format(customStartDate, "MMM dd")} - ${format(customEndDate, "MMM dd, yyyy")}`
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <div className="flex">
                        <div className="border-r p-3">
                          <p className="text-sm font-medium mb-2">Start Date</p>
                          <Calendar
                            mode="single"
                            selected={customStartDate}
                            onSelect={setCustomStartDate}
                            disabled={(date) =>
                              date > new Date() || (customEndDate ? date > customEndDate : false)
                            }
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium mb-2">End Date</p>
                          <Calendar
                            mode="single"
                            selected={customEndDate}
                            onSelect={setCustomEndDate}
                            disabled={(date) =>
                              date > new Date() || (customStartDate ? date < customStartDate : false)
                            }
                          />
                        </div>
                      </div>
                      <div className="border-t p-3 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCustomStartDate(undefined);
                            setCustomEndDate(undefined);
                          }}
                        >
                          Clear
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setShowCustomDatePicker(false)}
                          disabled={!customStartDate || !customEndDate}
                        >
                          Apply
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            {comparisonMode && (
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Period 2 (Compare)</Label>
                <div className="flex gap-2">
                  <Select value={compareDateRange} onValueChange={handleCompareDateRangeChange}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="3m">Last 3 months</SelectItem>
                      <SelectItem value="6m">Last 6 months</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>

                  {compareDateRange === "custom" && (
                    <Popover open={showCompareCustomDatePicker} onOpenChange={setShowCompareCustomDatePicker}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !compareCustomStartDate && !compareCustomEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {compareCustomStartDate && compareCustomEndDate ? (
                            `${format(compareCustomStartDate, "MMM dd")} - ${format(compareCustomEndDate, "MMM dd, yyyy")}`
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <div className="flex">
                          <div className="border-r p-3">
                            <p className="text-sm font-medium mb-2">Start Date</p>
                            <Calendar
                              mode="single"
                              selected={compareCustomStartDate}
                              onSelect={setCompareCustomStartDate}
                              disabled={(date) =>
                                date > new Date() || (compareCustomEndDate ? date > compareCustomEndDate : false)
                              }
                            />
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium mb-2">End Date</p>
                            <Calendar
                              mode="single"
                              selected={compareCustomEndDate}
                              onSelect={setCompareCustomEndDate}
                              disabled={(date) =>
                                date > new Date() || (compareCustomStartDate ? date < compareCustomStartDate : false)
                              }
                            />
                          </div>
                        </div>
                        <div className="border-t p-3 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCompareCustomStartDate(undefined);
                              setCompareCustomEndDate(undefined);
                            }}
                          >
                            Clear
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setShowCompareCustomDatePicker(false)}
                            disabled={!compareCustomStartDate || !compareCustomEndDate}
                          >
                            Apply
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Date Range Indicator */}
      <Card className={cn(
        "border-2",
        comparisonMode ? "border-purple-200 bg-purple-50" : "border-blue-200 bg-blue-50"
      )}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className={cn(
                "h-4 w-4",
                comparisonMode ? "text-purple-600" : "text-blue-600"
              )} />
              <span className={cn(
                "text-sm font-medium",
                comparisonMode ? "text-purple-900" : "text-blue-900"
              )}>
                {comparisonMode ? (
                  <>
                    Comparing: <strong>{getDateRangeLabel(dateRange, customStartDate, customEndDate)}</strong>
                    {" vs "}
                    <strong>{getDateRangeLabel(compareDateRange, compareCustomStartDate, compareCustomEndDate)}</strong>
                  </>
                ) : (
                  <>
                    Showing data for: <strong>{getDateRangeLabel(dateRange, customStartDate, customEndDate)}</strong>
                  </>
                )}
              </span>
            </div>
            <Badge className={comparisonMode ? "bg-purple-600" : "bg-blue-600"}>
              {comparisonMode ? "Comparison Mode" : (dateRange === "custom" ? "Custom Range" : DATE_RANGES[dateRange as keyof typeof DATE_RANGES]?.label)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Summary (only in comparison mode) */}
      {comparisonMode && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle>Comparison Summary</CardTitle>
            <CardDescription>Key differences between the two periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">18.4%</span>
                </div>
                <p className="text-sm text-muted-foreground">Questions Growth</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">20.0%</span>
                </div>
                <p className="text-sm text-muted-foreground">Exams Growth</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">23.0%</span>
                </div>
                <p className="text-sm text-muted-foreground">Attempts Growth</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">3.8%</span>
                </div>
                <p className="text-sm text-muted-foreground">Pass Rate Improvement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Questions"
          icon={FileQuestion}
          currentValue={150}
          compareValue={comparisonMode ? 127 : undefined}
          comparisonMode={comparisonMode}
        />
        <MetricCard
          title="Active Exams"
          icon={Target}
          currentValue={42}
          compareValue={comparisonMode ? 35 : undefined}
          comparisonMode={comparisonMode}
        />
        <MetricCard
          title="Total Attempts"
          icon={Users}
          currentValue={1284}
          compareValue={comparisonMode ? 1044 : undefined}
          comparisonMode={comparisonMode}
        />
        <MetricCard
          title="Avg Pass Rate"
          icon={TrendingUp}
          currentValue={78}
          compareValue={comparisonMode ? 75 : undefined}
          format="percentage"
          comparisonMode={comparisonMode}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Questions by Difficulty Level</CardTitle>
            <CardDescription>
              {comparisonMode ? "Comparison across difficulty tiers" : "Distribution across difficulty tiers"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Period 1" />
                {comparisonMode && <Bar dataKey="compareCount" fill="#8b5cf6" name="Period 2" />}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Question Types */}
        <Card>
          <CardHeader>
            <CardTitle>Questions by Type</CardTitle>
            <CardDescription>
              {comparisonMode ? "Comparison of question formats" : "Breakdown of question formats"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {comparisonMode ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" name="Period 1" />
                  <Bar dataKey="compareValue" fill="#8b5cf6" name="Period 2" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Questions by Subject Area</CardTitle>
            <CardDescription>
              {comparisonMode ? "Comparison across subjects" : "Coverage across different subjects"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                {comparisonMode && <Legend />}
                <Bar dataKey="count" fill="#8b5cf6" name="Period 1" />
                {comparisonMode && <Bar dataKey="compareCount" fill="#10b981" name="Period 2" />}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>
              {comparisonMode ? "Comparison of usage over time" : "Exams and questions over time"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="exams" stroke="#3b82f6" strokeWidth={2} name="Period 1 Exams" />
                <Line type="monotone" dataKey="questions" stroke="#10b981" strokeWidth={2} name="Period 1 Questions" />
                {comparisonMode && (
                  <>
                    <Line type="monotone" dataKey="compareExams" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="Period 2 Exams" />
                    <Line type="monotone" dataKey="compareQuestions" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Period 2 Questions" />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Questions</CardTitle>
          <CardDescription>
            {comparisonMode ? "Questions with highest success rates in Period 1" : "Questions with highest success rates in selected period"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 1, text: "What is the primary goal of differentiated instruction?", successRate: 92, attempts: 245, compareSuccessRate: 88, compareAttempts: 210 },
              { id: 2, text: "Bloom's Taxonomy includes six levels of cognitive skills.", successRate: 88, attempts: 198, compareSuccessRate: 85, compareAttempts: 180 },
              { id: 3, text: "Explain formative assessment and its importance.", successRate: 85, attempts: 167, compareSuccessRate: 82, compareAttempts: 150 },
              { id: 4, text: "What are the key principles of constructivist learning?", successRate: 82, attempts: 203, compareSuccessRate: 79, compareAttempts: 185 },
              { id: 5, text: "Describe effective classroom management strategies.", successRate: 79, attempts: 189, compareSuccessRate: 76, compareAttempts: 170 },
            ].map((question) => (
              <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{question.text}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-muted-foreground">{question.attempts} attempts</p>
                    {comparisonMode && (
                      <p className="text-sm text-muted-foreground">
                        vs {question.compareAttempts} attempts in Period 2
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    {question.successRate}% success
                  </Badge>
                  {comparisonMode && (
                    <>
                      <span className="text-muted-foreground">vs</span>
                      <Badge variant="outline">
                        {question.compareSuccessRate}%
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {comparisonMode ? "Latest updates in Period 1" : "Latest question bank updates in selected period"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Created", item: "15 new questions", user: "Admin", time: "2 hours ago" },
              { action: "Updated", item: "Pedagogy exam configuration", user: "Admin", time: "5 hours ago" },
              { action: "Deleted", item: "3 outdated questions", user: "Admin", time: "1 day ago" },
              { action: "Generated", item: "AI-generated question set", user: "System", time: "2 days ago" },
              { action: "Imported", item: "25 questions from CSV", user: "Admin", time: "3 days ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{activity.action}</Badge>
                  <span className="text-sm">{activity.item}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {activity.user} • {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
