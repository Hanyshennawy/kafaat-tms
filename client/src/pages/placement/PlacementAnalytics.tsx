import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  BarChart3, TrendingUp, TrendingDown, Clock, Users, Building2,
  MapPin, Target, Award, Calendar, ArrowUpRight, ArrowDownRight,
  CheckCircle2, XCircle, Timer, School, Download, RefreshCw
} from "lucide-react";
import { useState } from "react";

export default function PlacementAnalytics() {
  const [timeRange, setTimeRange] = useState("year");
  const [selectedRegion, setSelectedRegion] = useState("all");

  // KPI Stats
  const kpis = {
    avgTimeToPlace: { value: 12, change: -15, unit: "days" },
    vacancyFillRate: { value: 87, change: 5, unit: "%" },
    staffRetention: { value: 92, change: 3, unit: "%" },
    transferSuccess: { value: 94, change: 2, unit: "%" },
  };

  // Monthly placement trends
  const monthlyTrends = [
    { month: "Jan", placements: 18, transfers: 12, newHires: 6 },
    { month: "Feb", placements: 15, transfers: 8, newHires: 7 },
    { month: "Mar", placements: 22, transfers: 14, newHires: 8 },
    { month: "Apr", placements: 12, transfers: 7, newHires: 5 },
    { month: "May", placements: 10, transfers: 5, newHires: 5 },
    { month: "Jun", placements: 25, transfers: 18, newHires: 7 },
    { month: "Jul", placements: 8, transfers: 3, newHires: 5 },
    { month: "Aug", placements: 45, transfers: 20, newHires: 25 },
    { month: "Sep", placements: 38, transfers: 22, newHires: 16 },
    { month: "Oct", placements: 20, transfers: 12, newHires: 8 },
    { month: "Nov", placements: 15, transfers: 9, newHires: 6 },
    { month: "Dec", placements: 10, transfers: 5, newHires: 5 },
  ];
  const maxPlacements = Math.max(...monthlyTrends.map(d => d.placements));

  // Region distribution
  const regionData = [
    { region: "Dubai", staff: 485, schools: 12, vacancies: 15, fillRate: 89 },
    { region: "Abu Dhabi", staff: 372, schools: 8, vacancies: 8, fillRate: 92 },
    { region: "Sharjah", staff: 198, schools: 5, vacancies: 12, fillRate: 78 },
    { region: "Al Ain", staff: 124, schools: 3, vacancies: 6, fillRate: 85 },
  ];
  const totalStaff = regionData.reduce((sum, r) => sum + r.staff, 0);

  // School performance
  const schoolPerformance = [
    { name: "Emirates National School", retention: 96, fillTime: 8, rating: 4.8 },
    { name: "Al Noor International School", retention: 94, fillTime: 10, rating: 4.7 },
    { name: "GEMS Wellington Academy", retention: 92, fillTime: 12, rating: 4.6 },
    { name: "Dubai International School", retention: 90, fillTime: 14, rating: 4.5 },
    { name: "Sharjah American School", retention: 88, fillTime: 15, rating: 4.4 },
  ];

  // Department placement stats
  const departmentStats = [
    { dept: "Mathematics", demand: 85, filled: 78 },
    { dept: "Science", demand: 72, filled: 68 },
    { dept: "English", demand: 65, filled: 62 },
    { dept: "Arabic", demand: 55, filled: 50 },
    { dept: "Special Education", demand: 45, filled: 35 },
    { dept: "Physical Education", demand: 30, filled: 28 },
  ];

  // Request processing stats
  const processingStats = {
    avgApprovalTime: 5.2,
    pendingRequests: 23,
    processedThisMonth: 47,
    rejectionRate: 8
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Placement Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics on staff placement and mobility trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Avg. Time to Place
            </CardDescription>
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-3xl">{kpis.avgTimeToPlace.value}</CardTitle>
              <span className="text-muted-foreground">days</span>
              <Badge className={`ml-auto ${kpis.avgTimeToPlace.change < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {kpis.avgTimeToPlace.change < 0 ? <ArrowDownRight className="h-3 w-3 mr-1" /> : <ArrowUpRight className="h-3 w-3 mr-1" />}
                {Math.abs(kpis.avgTimeToPlace.change)}%
              </Badge>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Vacancy Fill Rate
            </CardDescription>
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-3xl text-green-600">{kpis.vacancyFillRate.value}%</CardTitle>
              <Badge className="ml-auto bg-green-100 text-green-700">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {kpis.vacancyFillRate.change}%
              </Badge>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staff Retention
            </CardDescription>
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-3xl text-blue-600">{kpis.staffRetention.value}%</CardTitle>
              <Badge className="ml-auto bg-green-100 text-green-700">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {kpis.staffRetention.change}%
              </Badge>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Transfer Success
            </CardDescription>
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-3xl text-purple-600">{kpis.transferSuccess.value}%</CardTitle>
              <Badge className="ml-auto bg-green-100 text-green-700">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {kpis.transferSuccess.change}%
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Monthly Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Placement Trends
            </CardTitle>
            <CardDescription>Monthly placements breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 flex items-end gap-2">
              {monthlyTrends.map((item) => (
                <TooltipProvider key={item.month}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex flex-col gap-0.5">
                          <div 
                            className="w-full bg-blue-500 rounded-t transition-all"
                            style={{ height: `${(item.transfers / maxPlacements) * 160}px` }}
                          />
                          <div 
                            className="w-full bg-green-500 rounded-b transition-all"
                            style={{ height: `${(item.newHires / maxPlacements) * 160}px` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.month}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{item.month}</p>
                      <p className="text-xs">Transfers: {item.transfers}</p>
                      <p className="text-xs">New Hires: {item.newHires}</p>
                      <p className="text-xs font-medium">Total: {item.placements}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-muted-foreground">Transfers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-muted-foreground">New Hires</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Region Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Distribution by Region
            </CardTitle>
            <CardDescription>Staff allocation across UAE</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionData.map((region) => (
                <div key={region.region} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{region.region}</span>
                    <span>{region.staff} staff ({Math.round((region.staff / totalStaff) * 100)}%)</span>
                  </div>
                  <Progress value={(region.staff / totalStaff) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{region.schools} schools</span>
                    <span className={region.fillRate >= 85 ? 'text-green-600' : 'text-amber-600'}>
                      {region.fillRate}% fill rate
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Department Demand */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Department Demand
            </CardTitle>
            <CardDescription>Positions vs. filled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {departmentStats.map((dept) => (
              <div key={dept.dept} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{dept.dept}</span>
                  <span className="font-medium">{dept.filled}/{dept.demand}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      (dept.filled / dept.demand) >= 0.9 ? 'bg-green-500' :
                      (dept.filled / dept.demand) >= 0.75 ? 'bg-blue-500' :
                      'bg-amber-500'
                    }`}
                    style={{ width: `${(dept.filled / dept.demand) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* School Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performing Schools
            </CardTitle>
            <CardDescription>By retention and fill time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schoolPerformance.map((school, idx) => (
                <div key={school.name} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-700' : 'bg-blue-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{school.name}</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <p className="text-lg font-bold text-green-600">{school.retention}%</p>
                      <p className="text-xs text-muted-foreground">Retention</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{school.fillTime}d</p>
                      <p className="text-xs text-muted-foreground">Avg Fill Time</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-600">{school.rating}</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Request Processing Metrics
          </CardTitle>
          <CardDescription>Efficiency of placement request handling</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{processingStats.avgApprovalTime}</p>
              <p className="text-sm text-muted-foreground">Avg. Approval Time (days)</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Timer className="h-8 w-8 mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold">{processingStats.pendingRequests}</p>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{processingStats.processedThisMonth}</p>
              <p className="text-sm text-muted-foreground">Processed This Month</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold">{processingStats.rejectionRate}%</p>
              <p className="text-sm text-muted-foreground">Rejection Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
