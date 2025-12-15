import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRightLeft, Clock, CheckCircle, XCircle, Search, Filter,
  AlertCircle, Eye, ThumbsUp, ThumbsDown, MessageSquare, Calendar,
  User, Building2, FileText, ChevronRight, MoreHorizontal, Send,
  TrendingUp, Plus, ArrowRight
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function PlacementRequests() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState("");

  // Stats
  const stats = {
    total: 47,
    pending: 23,
    inReview: 8,
    approved: 12,
    rejected: 4
  };

  const requests = [
    {
      id: 1,
      employeeName: "Ahmed Al Mansoori",
      employeeId: "EMP-2024-001",
      requestType: "transfer",
      currentSchool: "Dubai International School",
      requestedSchool: "Abu Dhabi Academy",
      currentPosition: "Math Teacher",
      requestedPosition: "Math Teacher",
      status: "under_review",
      submittedAt: "2024-12-01",
      priority: "high",
      reason: "Closer to residence",
      submittedBy: "Ahmed Al Mansoori",
      reviewer: "Sarah Johnson",
      timeline: [
        { date: "Dec 1", action: "Request Submitted", by: "Ahmed Al Mansoori" },
        { date: "Dec 2", action: "Assigned to HR", by: "System" },
        { date: "Dec 3", action: "Under Review", by: "Sarah Johnson" },
      ]
    },
    {
      id: 2,
      employeeName: "Fatima Hassan",
      employeeId: "EMP-2024-015",
      requestType: "promotion",
      currentSchool: "Emirates National School",
      requestedSchool: "Emirates National School",
      currentPosition: "Teacher",
      requestedPosition: "Senior Teacher",
      status: "approved",
      submittedAt: "2024-11-28",
      priority: "medium",
      reason: "Career development",
      submittedBy: "Mohammed Ali",
      reviewer: "Sarah Johnson",
      approvedAt: "2024-12-05",
      timeline: [
        { date: "Nov 28", action: "Request Submitted", by: "Mohammed Ali" },
        { date: "Nov 30", action: "HR Review Complete", by: "Sarah Johnson" },
        { date: "Dec 5", action: "Approved", by: "Director" },
      ]
    },
    {
      id: 3,
      employeeName: "Omar Khalid",
      employeeId: "EMP-2024-042",
      requestType: "transfer",
      currentSchool: "GEMS Wellington Academy",
      requestedSchool: "Al Noor International School",
      currentPosition: "Science Teacher",
      requestedPosition: "Science Teacher",
      status: "pending",
      submittedAt: "2024-12-10",
      priority: "normal",
      reason: "Personal request",
      submittedBy: "Omar Khalid",
      timeline: [
        { date: "Dec 10", action: "Request Submitted", by: "Omar Khalid" },
      ]
    },
    {
      id: 4,
      employeeName: "Layla Ahmed",
      employeeId: "EMP-2024-033",
      requestType: "emergency",
      currentSchool: "Al Ain English School",
      requestedSchool: "Sharjah American School",
      currentPosition: "Art Teacher",
      requestedPosition: "Substitute Teacher",
      status: "urgent",
      submittedAt: "2024-12-12",
      priority: "critical",
      reason: "Emergency coverage needed",
      submittedBy: "HR Manager",
      timeline: [
        { date: "Dec 12", action: "Urgent Request Created", by: "HR Manager" },
      ]
    },
    {
      id: 5,
      employeeName: "Khalid Al-Farsi",
      employeeId: "EMP-2024-028",
      requestType: "new_hire",
      currentSchool: "—",
      requestedSchool: "Emirates National School",
      currentPosition: "—",
      requestedPosition: "Music Teacher",
      status: "under_review",
      submittedAt: "2024-12-08",
      priority: "normal",
      reason: "New hire placement",
      submittedBy: "HR Manager",
      reviewer: "Department Head",
      timeline: [
        { date: "Dec 8", action: "Placement Request Created", by: "HR Manager" },
        { date: "Dec 9", action: "Assigned to Department Head", by: "System" },
      ]
    },
    {
      id: 6,
      employeeName: "Noor Al-Maktoum",
      employeeId: "EMP-2024-019",
      requestType: "transfer",
      currentSchool: "Sharjah American School",
      requestedSchool: "Dubai International School",
      currentPosition: "Counselor",
      requestedPosition: "Senior Counselor",
      status: "rejected",
      submittedAt: "2024-11-20",
      priority: "medium",
      reason: "Career advancement",
      submittedBy: "Noor Al-Maktoum",
      rejectedAt: "2024-11-25",
      rejectionReason: "Position not available at requested school",
      timeline: [
        { date: "Nov 20", action: "Request Submitted", by: "Noor Al-Maktoum" },
        { date: "Nov 22", action: "HR Review", by: "Sarah Johnson" },
        { date: "Nov 25", action: "Rejected - Position unavailable", by: "HR Manager" },
      ]
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      case "under_review": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "under_review": return <Clock className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "urgent": return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-blue-100 text-blue-800";
      case "normal": return "bg-gray-100 text-gray-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "transfer": return <ArrowRightLeft className="h-4 w-4" />;
      case "promotion": return <TrendingUp className="h-4 w-4" />;
      case "new_hire": return <User className="h-4 w-4" />;
      case "emergency": return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesPriority = filterPriority === "all" || req.priority === filterPriority;
    const matchesType = filterType === "all" || req.requestType === filterType;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Placement Requests</h1>
          <p className="text-muted-foreground">
            View and manage staff placement and transfer requests
          </p>
        </div>
        <Link href="/placement">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setFilterStatus("all")}>
          <CardHeader className="pb-3">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setFilterStatus("pending")}>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              Pending
            </CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setFilterStatus("under_review")}>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              In Review
            </CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.inReview}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setFilterStatus("approved")}>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Approved
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setFilterStatus("rejected")}>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Rejected
            </CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats.rejected}</CardTitle>
          </CardHeader>
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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
                <SelectItem value="new_hire">New Hire</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredRequests.length} of {requests.length} requests
        </p>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className={`hover:shadow-md transition-shadow ${request.status === 'urgent' ? 'border-red-300' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  request.requestType === 'emergency' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {getTypeIcon(request.requestType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium">{request.employeeName}</h4>
                    <Badge variant="outline" className="text-xs">{request.employeeId}</Badge>
                    <Badge className={getStatusColor(request.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(request.status)}
                        {request.status.replace("_", " ")}
                      </span>
                    </Badge>
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <span className="capitalize">{request.requestType.replace("_", " ")}</span>
                    <span>•</span>
                    <span>{request.currentSchool}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>{request.requestedSchool}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                    </span>
                    {request.reviewer && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Reviewer: {request.reviewer}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Request Details</DialogTitle>
                        <DialogDescription>
                          {request.requestType.replace("_", " ").toUpperCase()} - {request.employeeId}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Status & Priority */}
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status.replace("_", " ")}</span>
                          </Badge>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority} priority
                          </Badge>
                        </div>

                        {/* Staff Info */}
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Staff Information</CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Name:</span>
                              <p className="font-medium">{request.employeeName}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Employee ID:</span>
                              <p className="font-medium">{request.employeeId}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Transfer Details */}
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                          <div className="text-center flex-1">
                            <Building2 className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">From</p>
                            <p className="font-medium text-sm">{request.currentSchool}</p>
                            <p className="text-xs text-muted-foreground">{request.currentPosition}</p>
                          </div>
                          <ArrowRight className="h-6 w-6 text-primary" />
                          <div className="text-center flex-1">
                            <Building2 className="h-8 w-8 mx-auto mb-1 text-primary" />
                            <p className="text-xs text-muted-foreground">To</p>
                            <p className="font-medium text-sm">{request.requestedSchool}</p>
                            <p className="text-xs text-muted-foreground">{request.requestedPosition}</p>
                          </div>
                        </div>

                        {/* Reason */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Reason</h4>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            {request.reason}
                          </p>
                        </div>

                        {/* Timeline */}
                        <div>
                          <h4 className="text-sm font-medium mb-3">Activity Timeline</h4>
                          <div className="space-y-3">
                            {request.timeline.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                <div>
                                  <p className="text-sm font-medium">{item.action}</p>
                                  <p className="text-xs text-muted-foreground">{item.date} • {item.by}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Review Actions */}
                        {(request.status === 'pending' || request.status === 'under_review') && (
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium mb-3">Review Actions</h4>
                            <Textarea 
                              placeholder="Add review comments..."
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="mb-3"
                            />
                            <div className="flex gap-2">
                              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button variant="destructive" className="flex-1">
                                <ThumbsDown className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                              <Button variant="outline">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Request Info
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {(request.status === 'pending' || request.status === 'under_review' || request.status === 'urgent') && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
