import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { FileText, Download, Calendar, TrendingUp, Users, Award, GraduationCap, BarChart3, PieChart, Clock, FileSpreadsheet } from "lucide-react";

const REPORT_CATEGORIES = [
  {
    id: "performance",
    name: "Performance Reports",
    icon: TrendingUp,
    reports: [
      { id: 1, name: "Staff Performance Summary", description: "Overall performance metrics for all educators", lastGenerated: "2024-01-15", format: "PDF" },
      { id: 2, name: "Teacher Evaluation Report", description: "Detailed evaluation scores by department", lastGenerated: "2024-01-14", format: "Excel" },
      { id: 3, name: "360° Feedback Analysis", description: "Comprehensive feedback analysis for staff", lastGenerated: "2024-01-10", format: "PDF" },
      { id: 4, name: "Goals Achievement Report", description: "Progress on individual and team goals", lastGenerated: "2024-01-12", format: "PDF" },
    ]
  },
  {
    id: "licensing",
    name: "Licensing Reports",
    icon: Award,
    reports: [
      { id: 5, name: "License Status Overview", description: "Current licensing status across all staff", lastGenerated: "2024-01-15", format: "PDF" },
      { id: 6, name: "License Expiry Report", description: "Upcoming license renewals and expirations", lastGenerated: "2024-01-13", format: "Excel" },
      { id: 7, name: "CPD Hours Summary", description: "CPD hours completed by each educator", lastGenerated: "2024-01-11", format: "PDF" },
      { id: 8, name: "License Application Status", description: "Pending and approved license applications", lastGenerated: "2024-01-14", format: "PDF" },
    ]
  },
  {
    id: "recruitment",
    name: "Recruitment Reports",
    icon: Users,
    reports: [
      { id: 9, name: "Hiring Pipeline Report", description: "Current recruitment pipeline status", lastGenerated: "2024-01-15", format: "PDF" },
      { id: 10, name: "Candidate Quality Analysis", description: "Assessment scores and candidate rankings", lastGenerated: "2024-01-12", format: "Excel" },
      { id: 11, name: "Time-to-Hire Report", description: "Recruitment efficiency metrics", lastGenerated: "2024-01-10", format: "PDF" },
    ]
  },
  {
    id: "training",
    name: "Training Reports",
    icon: GraduationCap,
    reports: [
      { id: 12, name: "Training Completion Report", description: "Course completion rates by department", lastGenerated: "2024-01-14", format: "PDF" },
      { id: 13, name: "Skills Gap Analysis", description: "Identified skill gaps and training needs", lastGenerated: "2024-01-11", format: "Excel" },
      { id: 14, name: "Professional Development Summary", description: "PD activities and certifications earned", lastGenerated: "2024-01-13", format: "PDF" },
    ]
  }
];

const QUICK_STATS = [
  { label: "Reports Generated", value: "124", change: "+12%", icon: FileText },
  { label: "Active Educators", value: "248", change: "+5%", icon: Users },
  { label: "Avg Performance Score", value: "4.2/5", change: "+0.3", icon: TrendingUp },
  { label: "License Compliance", value: "94%", change: "+2%", icon: Award },
];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");
  const [activeCategory, setActiveCategory] = useState("performance");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and download comprehensive education workforce reports</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button><FileSpreadsheet className="h-4 w-4 mr-2" />Custom Report</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {QUICK_STATS.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600">{stat.change} from last period</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Categories */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          {REPORT_CATEGORIES.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2">
              <cat.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{cat.name.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {REPORT_CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid gap-4">
              {category.reports.map(report => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{report.name}</h3>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />Last generated: {report.lastGenerated}
                            </span>
                            <Badge variant="outline">{report.format}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Preview</Button>
                        <Button size="sm"><Download className="h-4 w-4 mr-2" />Download</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Performance Distribution</CardTitle>
            <CardDescription>Staff performance ratings across the organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { rating: "Exceptional (5)", count: 24, percentage: 15 },
              { rating: "Exceeds Expectations (4)", count: 68, percentage: 42 },
              { rating: "Meets Expectations (3)", count: 52, percentage: 32 },
              { rating: "Needs Improvement (2)", count: 14, percentage: 9 },
              { rating: "Unsatisfactory (1)", count: 4, percentage: 2 },
            ].map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.rating}</span>
                  <span className="text-muted-foreground">{item.count} staff ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />Licensing Overview</CardTitle>
            <CardDescription>Current teaching license status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { status: "Valid License", count: 186, percentage: 75, color: "bg-green-500" },
              { status: "Renewal Required (30 days)", count: 32, percentage: 13, color: "bg-yellow-500" },
              { status: "In Processing", count: 18, percentage: 7, color: "bg-blue-500" },
              { status: "Expired", count: 12, percentage: 5, color: "bg-red-500" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm">{item.status}</span>
                </div>
                <span className="text-sm font-medium">{item.count} ({item.percentage}%)</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>Automatically generated and delivered reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Weekly Performance Summary", schedule: "Every Monday, 8:00 AM", recipients: "Leadership Team", status: "active" },
              { name: "Monthly License Status", schedule: "1st of each month", recipients: "HR Department", status: "active" },
              { name: "Quarterly CPD Report", schedule: "End of quarter", recipients: "All Department Heads", status: "active" },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-muted-foreground">{report.schedule} • {report.recipients}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={report.status === "active" ? "default" : "secondary"}>{report.status}</Badge>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
