import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  History, ArrowRight, Search, Calendar, Building2, User,
  CheckCircle2, Clock, TrendingUp, TrendingDown, Filter,
  Download, ChevronRight, MapPin, ArrowRightLeft, BarChart3
} from "lucide-react";
import { useState } from "react";

export default function TransferHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState("2024");
  const [filterType, setFilterType] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");

  // Stats
  const stats = {
    totalTransfers: 267,
    thisYear: 65,
    avgDuration: 12,
    successRate: 94
  };

  // Monthly transfer data for chart
  const monthlyData = [
    { month: "Jan", count: 8 },
    { month: "Feb", count: 5 },
    { month: "Mar", count: 12 },
    { month: "Apr", count: 6 },
    { month: "May", count: 4 },
    { month: "Jun", count: 15 },
    { month: "Jul", count: 3 },
    { month: "Aug", count: 18 },
    { month: "Sep", count: 22 },
    { month: "Oct", count: 9 },
    { month: "Nov", count: 7 },
    { month: "Dec", count: 5 },
  ];
  const maxCount = Math.max(...monthlyData.map(d => d.count));

  // Transfer history records
  const transfers = [
    {
      id: 1,
      staffName: "Ahmad Al-Rashid",
      staffId: "EMP-2024-001",
      type: "transfer",
      fromSchool: "Al Noor International School",
      toSchool: "Emirates National School",
      fromRegion: "Dubai",
      toRegion: "Abu Dhabi",
      fromPosition: "Math Teacher",
      toPosition: "Senior Math Teacher",
      requestDate: "2024-08-01",
      completedDate: "2024-08-15",
      duration: 14,
      status: "completed",
      reason: "Career advancement"
    },
    {
      id: 2,
      staffName: "Sarah Johnson",
      staffId: "EMP-2024-015",
      type: "promotion",
      fromSchool: "Emirates National School",
      toSchool: "Emirates National School",
      fromRegion: "Abu Dhabi",
      toRegion: "Abu Dhabi",
      fromPosition: "Science Teacher",
      toPosition: "Department Head",
      requestDate: "2024-07-15",
      completedDate: "2024-09-01",
      duration: 48,
      status: "completed",
      reason: "Promotion to leadership"
    },
    {
      id: 3,
      staffName: "Fatima Hassan",
      staffId: "EMP-2024-033",
      type: "transfer",
      fromSchool: "GEMS Wellington Academy",
      toSchool: "Al Ain English School",
      fromRegion: "Dubai",
      toRegion: "Al Ain",
      fromPosition: "English Teacher",
      toPosition: "English Teacher",
      requestDate: "2024-06-10",
      completedDate: "2024-06-25",
      duration: 15,
      status: "completed",
      reason: "Closer to residence"
    },
    {
      id: 4,
      staffName: "Mohammed Ali",
      staffId: "EMP-2024-042",
      type: "transfer",
      fromSchool: "Sharjah American School",
      toSchool: "Dubai International School",
      fromRegion: "Sharjah",
      toRegion: "Dubai",
      fromPosition: "Arabic Teacher",
      toPosition: "Arabic Teacher",
      requestDate: "2024-05-20",
      completedDate: "2024-06-10",
      duration: 21,
      status: "completed",
      reason: "Personal request"
    },
    {
      id: 5,
      staffName: "Layla Ahmed",
      staffId: "EMP-2024-028",
      type: "new_placement",
      fromSchool: "—",
      toSchool: "Al Noor International School",
      fromRegion: "—",
      toRegion: "Dubai",
      fromPosition: "—",
      toPosition: "Art Teacher",
      requestDate: "2024-08-10",
      completedDate: "2024-08-20",
      duration: 10,
      status: "completed",
      reason: "New hire"
    },
    {
      id: 6,
      staffName: "Omar Khalid",
      staffId: "EMP-2024-055",
      type: "transfer",
      fromSchool: "Emirates National School",
      toSchool: "GEMS Wellington Academy",
      fromRegion: "Abu Dhabi",
      toRegion: "Dubai",
      fromPosition: "PE Teacher",
      toPosition: "PE Coordinator",
      requestDate: "2024-03-01",
      completedDate: "2024-03-20",
      duration: 19,
      status: "completed",
      reason: "Career development"
    },
    {
      id: 7,
      staffName: "Noor Al-Maktoum",
      staffId: "EMP-2024-019",
      type: "return",
      fromSchool: "Leave of Absence",
      toSchool: "Sharjah American School",
      fromRegion: "—",
      toRegion: "Sharjah",
      fromPosition: "—",
      toPosition: "School Counselor",
      requestDate: "2024-01-05",
      completedDate: "2024-01-15",
      duration: 10,
      status: "completed",
      reason: "Return from maternity leave"
    },
  ];

  // Region transfer summary
  const regionSummary = [
    { from: "Dubai", to: "Abu Dhabi", count: 18 },
    { from: "Abu Dhabi", to: "Dubai", count: 15 },
    { from: "Sharjah", to: "Dubai", count: 12 },
    { from: "Dubai", to: "Al Ain", count: 8 },
    { from: "Al Ain", to: "Dubai", count: 5 },
  ];

  // Filter transfers
  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = t.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.staffId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesRegion = filterRegion === "all" || t.toRegion === filterRegion || t.fromRegion === filterRegion;
    return matchesSearch && matchesType && matchesRegion;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "transfer": return <Badge className="bg-blue-100 text-blue-700">Transfer</Badge>;
      case "promotion": return <Badge className="bg-purple-100 text-purple-700">Promotion</Badge>;
      case "new_placement": return <Badge className="bg-green-100 text-green-700">New Placement</Badge>;
      case "return": return <Badge className="bg-amber-100 text-amber-700">Return</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Export function
  const handleExportReport = () => {
    // CSV Headers
    const headers = [
      "Employee ID",
      "Staff Name",
      "Type",
      "From School",
      "From Region",
      "From Position",
      "To School",
      "To Region",
      "To Position",
      "Request Date",
      "Completed Date",
      "Duration (Days)",
      "Status",
      "Reason"
    ];

    // CSV Rows
    const rows = filteredTransfers.map(t => [
      t.staffId,
      t.staffName,
      t.type.replace("_", " "),
      t.fromSchool,
      t.fromRegion,
      t.fromPosition,
      t.toSchool,
      t.toRegion,
      t.toPosition,
      t.requestDate,
      t.completedDate,
      t.duration.toString(),
      t.status,
      t.reason
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transfer_history_${filterYear}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transfer History</h1>
          <p className="text-muted-foreground">
            Complete history of staff transfers and movements
          </p>
        </div>
        <Button variant="outline" onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Total Transfers
            </CardDescription>
            <CardTitle className="text-3xl">{stats.totalTransfers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              This Year
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.thisYear}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg. Duration
            </CardDescription>
            <CardTitle className="text-3xl text-amber-600">{stats.avgDuration} days</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Success Rate
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.successRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Monthly Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Transfer Trends - 2024
            </CardTitle>
            <CardDescription>Monthly transfer activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-2">
              {monthlyData.map((item) => (
                <TooltipProvider key={item.month}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                          style={{ height: `${(item.count / maxCount) * 140}px`, minHeight: '8px' }}
                        />
                        <span className="text-xs text-muted-foreground">{item.month}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.month}: {item.count} transfers</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Peak in September (start of academic year)</span>
            </div>
          </CardContent>
        </Card>

        {/* Region Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top Transfer Routes
            </CardTitle>
            <CardDescription>Most common movements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {regionSummary.map((route, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="w-20 truncate">{route.from}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="w-20 truncate">{route.to}</span>
                <div className="flex-1">
                  <Progress value={(route.count / 20) * 100} className="h-2" />
                </div>
                <span className="font-medium w-8 text-right">{route.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or employee ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="new_placement">New Placement</SelectItem>
                <SelectItem value="return">Return</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="Dubai">Dubai</SelectItem>
                <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                <SelectItem value="Sharjah">Sharjah</SelectItem>
                <SelectItem value="Al Ain">Al Ain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTransfers.length} of {transfers.length} records
        </p>
      </div>

      {/* Transfer Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Records</CardTitle>
          <CardDescription>Complete history of staff movements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransfers.map((transfer, idx) => (
              <div key={transfer.id} className="relative pl-8 pb-4 border-l-2 border-muted last:border-0 last:pb-0">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />
                
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{transfer.staffName}</h4>
                      <Badge variant="outline" className="text-xs">{transfer.staffId}</Badge>
                      {getTypeBadge(transfer.type)}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{transfer.fromSchool}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">{transfer.toSchool}</span>
                      </div>
                    </div>
                    
                    {transfer.fromPosition !== transfer.toPosition && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>{transfer.fromPosition}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-medium text-foreground">{transfer.toPosition}</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {transfer.reason}
                    </p>
                  </div>
                  
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Completed</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(transfer.completedDate).toLocaleDateString()}
                    </p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {transfer.duration} days
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
