import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Users, Building2, ArrowRightLeft, TrendingUp, Plus, MapPin, Calendar,
  Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, Search,
  FileText, Send, User, School, Briefcase, ArrowRight, BarChart3,
  Timer, Star, Filter, Eye, Edit, MoreHorizontal, GraduationCap
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

// Placement request templates
const requestTemplates = [
  { 
    id: "transfer", 
    name: "Transfer Request", 
    icon: ArrowRightLeft,
    description: "Move educator to a different school",
    fields: { type: "transfer", urgency: "normal" }
  },
  { 
    id: "new-hire", 
    name: "New Hire Placement", 
    icon: User,
    description: "Place newly hired educator",
    fields: { type: "new-hire", urgency: "normal" }
  },
  { 
    id: "temporary", 
    name: "Temporary Assignment", 
    icon: Clock,
    description: "Short-term placement or coverage",
    fields: { type: "temporary", urgency: "high" }
  },
  { 
    id: "promotion", 
    name: "Promotion Placement", 
    icon: TrendingUp,
    description: "Placement due to role advancement",
    fields: { type: "promotion", urgency: "normal" }
  },
  { 
    id: "emergency", 
    name: "Emergency Coverage", 
    icon: AlertCircle,
    description: "Urgent staffing need",
    fields: { type: "emergency", urgency: "critical" }
  },
  { 
    id: "return", 
    name: "Return from Leave", 
    icon: Calendar,
    description: "Reintegration after leave of absence",
    fields: { type: "return", urgency: "low" }
  },
];

export default function PlacementDashboard() {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("staff");
  const [requestData, setRequestData] = useState({
    staffId: "",
    staffName: "",
    currentSchool: "",
    currentPosition: "",
    destinationSchool: "",
    destinationPosition: "",
    effectiveDate: "",
    endDate: "",
    requestType: "",
    urgency: "normal",
    reason: "",
    notes: "",
    requiresHousing: false,
    requiresTraining: false,
    notifyStaff: true,
    notifyUnion: false,
  });

  const stats = {
    totalPlacements: 1245,
    activePlacements: 1180,
    pendingRequests: 23,
    completedTransfers: 65,
  };

  // Schools data
  const schools = [
    { id: "s1", name: "Al Noor International School", region: "Dubai", vacancies: 3, staff: 45 },
    { id: "s2", name: "Emirates National School", region: "Abu Dhabi", vacancies: 5, staff: 62 },
    { id: "s3", name: "GEMS Wellington Academy", region: "Dubai", vacancies: 2, staff: 78 },
    { id: "s4", name: "Sharjah American School", region: "Sharjah", vacancies: 4, staff: 55 },
    { id: "s5", name: "Al Ain English School", region: "Al Ain", vacancies: 6, staff: 41 },
  ];

  // Pending requests
  const pendingRequests = [
    { 
      id: 1, 
      staffName: "Ahmad Al-Rashid", 
      type: "Transfer",
      from: "Al Noor School",
      to: "Emirates National",
      position: "Math Teacher",
      status: "pending",
      date: "Dec 10, 2025",
      urgency: "normal"
    },
    { 
      id: 2, 
      staffName: "Sarah Johnson", 
      type: "New Hire",
      from: "—",
      to: "GEMS Wellington",
      position: "Science Teacher",
      status: "review",
      date: "Dec 9, 2025",
      urgency: "normal"
    },
    { 
      id: 3, 
      staffName: "Fatima Hassan", 
      type: "Emergency",
      from: "Al Ain School",
      to: "Sharjah American",
      position: "Substitute Teacher",
      status: "urgent",
      date: "Dec 11, 2025",
      urgency: "critical"
    },
    { 
      id: 4, 
      staffName: "Mohammed Ali", 
      type: "Promotion",
      from: "Emirates National",
      to: "Emirates National",
      position: "Dept. Head",
      status: "approved",
      date: "Dec 8, 2025",
      urgency: "normal"
    },
  ];

  // Recent activities
  const recentActivities = [
    { id: 1, action: "Transfer Completed", staff: "Layla Ahmed", details: "Moved to Al Noor School", time: "2 hours ago", icon: CheckCircle2, color: "text-green-600" },
    { id: 2, action: "Request Submitted", staff: "Omar Khalid", details: "Transfer request to Dubai", time: "4 hours ago", icon: FileText, color: "text-blue-600" },
    { id: 3, action: "Approval Pending", staff: "Noor Al-Maktoum", details: "Awaiting HR review", time: "6 hours ago", icon: Clock, color: "text-amber-600" },
    { id: 4, action: "Placement Confirmed", staff: "Ali Hassan", details: "New hire at GEMS", time: "1 day ago", icon: User, color: "text-purple-600" },
    { id: 5, action: "Request Rejected", staff: "Samira Khan", details: "Position filled", time: "1 day ago", icon: XCircle, color: "text-red-600" },
  ];

  // Placement distribution by region
  const regionData = [
    { region: "Dubai", count: 485, percentage: 39, color: "bg-blue-500" },
    { region: "Abu Dhabi", count: 372, percentage: 30, color: "bg-green-500" },
    { region: "Sharjah", count: 198, percentage: 16, color: "bg-purple-500" },
    { region: "Al Ain", count: 124, percentage: 10, color: "bg-amber-500" },
    { region: "Other", count: 66, percentage: 5, color: "bg-gray-500" },
  ];

  // Staff awaiting placement
  const awaitingPlacement = [
    { id: 1, name: "Khalid Al-Farsi", position: "Physics Teacher", days: 5, status: "matching" },
    { id: 2, name: "Aisha Mohammed", position: "English Teacher", days: 3, status: "interviewing" },
    { id: 3, name: "David Chen", position: "IT Coordinator", days: 8, status: "pending" },
  ];

  const handleTemplateSelect = (templateId: string) => {
    const template = requestTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setRequestData(prev => ({
        ...prev,
        requestType: template.fields.type,
        urgency: template.fields.urgency
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "review": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Review</Badge>;
      case "approved": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "urgent": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Urgent</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Staff Placement & Mobility</h1>
          <p className="text-muted-foreground">
            Manage staff placements, transfers, and movements across schools
          </p>
        </div>
        <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Placement Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Placement Request</DialogTitle>
              <DialogDescription>
                Create a staff placement or transfer request
              </DialogDescription>
            </DialogHeader>

            {!selectedTemplate ? (
              <div className="grid gap-4 md:grid-cols-3 py-4">
                {requestTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        template.id === 'emergency' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <template.icon className={`h-6 w-6 ${
                          template.id === 'emergency' ? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="staff">Staff Details</TabsTrigger>
                  <TabsTrigger value="destination">Destination</TabsTrigger>
                  <TabsTrigger value="justification">Justification</TabsTrigger>
                  <TabsTrigger value="review">Review</TabsTrigger>
                </TabsList>

                <TabsContent value="staff" className="space-y-4 mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">
                      {requestTemplates.find(t => t.id === selectedTemplate)?.name}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}>
                      Change
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Staff Member *</Label>
                      <Select value={requestData.staffId} onValueChange={(v) => setRequestData(prev => ({ ...prev, staffId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Search or select staff..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="emp1">Ahmad Al-Rashid - Math Teacher</SelectItem>
                          <SelectItem value="emp2">Sarah Johnson - Science Teacher</SelectItem>
                          <SelectItem value="emp3">Fatima Hassan - English Teacher</SelectItem>
                          <SelectItem value="emp4">Mohammed Ali - Arabic Teacher</SelectItem>
                          <SelectItem value="emp5">Layla Ahmed - Art Teacher</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Employee ID</Label>
                      <Input placeholder="Auto-filled from selection" disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Current School</Label>
                      <Select value={requestData.currentSchool} onValueChange={(v) => setRequestData(prev => ({ ...prev, currentSchool: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select current school..." />
                        </SelectTrigger>
                        <SelectContent>
                          {schools.map(school => (
                            <SelectItem key={school.id} value={school.id}>{school.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Current Position</Label>
                      <Select value={requestData.currentPosition} onValueChange={(v) => setRequestData(prev => ({ ...prev, currentPosition: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teacher">Classroom Teacher</SelectItem>
                          <SelectItem value="senior">Senior Teacher</SelectItem>
                          <SelectItem value="head">Department Head</SelectItem>
                          <SelectItem value="coordinator">Curriculum Coordinator</SelectItem>
                          <SelectItem value="counselor">School Counselor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        Staff Profile Summary
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Experience:</span>
                          <span className="ml-2 font-medium">8 years</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rating:</span>
                          <span className="ml-2 font-medium flex items-center gap-1">
                            4.8 <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Certifications:</span>
                          <span className="ml-2 font-medium">3 active</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="destination" className="space-y-4 mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Destination School *</Label>
                      <Select value={requestData.destinationSchool} onValueChange={(v) => setRequestData(prev => ({ ...prev, destinationSchool: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination school..." />
                        </SelectTrigger>
                        <SelectContent>
                          {schools.map(school => (
                            <SelectItem key={school.id} value={school.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{school.name}</span>
                                <Badge variant="outline" className="ml-2 text-xs">{school.vacancies} vacancies</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>New Position *</Label>
                      <Select value={requestData.destinationPosition} onValueChange={(v) => setRequestData(prev => ({ ...prev, destinationPosition: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new position..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="teacher">Classroom Teacher</SelectItem>
                          <SelectItem value="senior">Senior Teacher</SelectItem>
                          <SelectItem value="head">Department Head</SelectItem>
                          <SelectItem value="coordinator">Curriculum Coordinator</SelectItem>
                          <SelectItem value="counselor">School Counselor</SelectItem>
                          <SelectItem value="vp">Vice Principal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Effective Date *</Label>
                      <Input 
                        type="date" 
                        value={requestData.effectiveDate}
                        onChange={(e) => setRequestData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date (if temporary)</Label>
                      <Input 
                        type="date" 
                        value={requestData.endDate}
                        onChange={(e) => setRequestData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority Level</Label>
                    <Select value={requestData.urgency} onValueChange={(v) => setRequestData(prev => ({ ...prev, urgency: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Routine placement</SelectItem>
                        <SelectItem value="normal">Normal - Standard timeline</SelectItem>
                        <SelectItem value="high">High - Expedited processing</SelectItem>
                        <SelectItem value="critical">Critical - Immediate action required</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <Label>Housing Required</Label>
                        <p className="text-xs text-muted-foreground">Staff needs accommodation</p>
                      </div>
                      <Switch 
                        checked={requestData.requiresHousing}
                        onCheckedChange={(v) => setRequestData(prev => ({ ...prev, requiresHousing: v }))}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <Label>Training Required</Label>
                        <p className="text-xs text-muted-foreground">Orientation or upskilling</p>
                      </div>
                      <Switch 
                        checked={requestData.requiresTraining}
                        onCheckedChange={(v) => setRequestData(prev => ({ ...prev, requiresTraining: v }))}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="justification" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Reason for Request *</Label>
                    <Select value={requestData.reason} onValueChange={(v) => setRequestData(prev => ({ ...prev, reason: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacancy">Fill vacancy</SelectItem>
                        <SelectItem value="closer">Closer to residence</SelectItem>
                        <SelectItem value="career">Career development</SelectItem>
                        <SelectItem value="performance">Performance-based</SelectItem>
                        <SelectItem value="restructure">Organizational restructure</SelectItem>
                        <SelectItem value="personal">Personal request</SelectItem>
                        <SelectItem value="emergency">Emergency coverage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea 
                      placeholder="Provide additional context or justification for this request..."
                      rows={5}
                      value={requestData.notes}
                      onChange={(e) => setRequestData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        Notifications
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">Notify Staff Member</p>
                            <p className="text-xs text-muted-foreground">Send email notification upon submission</p>
                          </div>
                          <Switch 
                            checked={requestData.notifyStaff}
                            onCheckedChange={(v) => setRequestData(prev => ({ ...prev, notifyStaff: v }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm">Notify Union Representative</p>
                            <p className="text-xs text-muted-foreground">Required for some transfer types</p>
                          </div>
                          <Switch 
                            checked={requestData.notifyUnion}
                            onCheckedChange={(v) => setRequestData(prev => ({ ...prev, notifyUnion: v }))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="review" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Request Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Request Type:</span>
                          <p className="font-medium">{requestTemplates.find(t => t.id === selectedTemplate)?.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Priority:</span>
                          <p className="font-medium capitalize">{requestData.urgency}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Staff Member:</span>
                          <p className="font-medium">{requestData.staffId ? "Ahmad Al-Rashid" : "Not selected"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Effective Date:</span>
                          <p className="font-medium">{requestData.effectiveDate || "Not set"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="text-center flex-1">
                          <School className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">From</p>
                          <p className="font-medium text-sm">{requestData.currentSchool ? schools.find(s => s.id === requestData.currentSchool)?.name : "Current School"}</p>
                        </div>
                        <ArrowRight className="h-6 w-6 text-primary" />
                        <div className="text-center flex-1">
                          <School className="h-8 w-8 mx-auto mb-1 text-primary" />
                          <p className="text-xs text-muted-foreground">To</p>
                          <p className="font-medium text-sm">{requestData.destinationSchool ? schools.find(s => s.id === requestData.destinationSchool)?.name : "Destination School"}</p>
                        </div>
                      </div>

                      {(requestData.requiresHousing || requestData.requiresTraining) && (
                        <div className="flex gap-2">
                          {requestData.requiresHousing && (
                            <Badge variant="outline" className="bg-blue-50">Housing Required</Badge>
                          )}
                          {requestData.requiresTraining && (
                            <Badge variant="outline" className="bg-purple-50">Training Required</Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Approval Workflow
                      </h4>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge className="bg-blue-100 text-blue-700">HR Review</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <Badge className="bg-purple-100 text-purple-700">Manager Approval</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <Badge className="bg-green-100 text-green-700">Final Confirmation</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            <DialogFooter className="mt-6">
              {selectedTemplate && (
                <>
                  <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                    Cancel
                  </Button>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={() => setShowNewRequest(false)}>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Placements
            </CardDescription>
            <CardTitle className="text-3xl">{stats.totalPlacements}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Active Placements
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.activePlacements}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Pending Requests
            </CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pendingRequests}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Completed Transfers
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.completedTransfers}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Pending Requests Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Requests
              </CardTitle>
              <CardDescription>Requests awaiting action</CardDescription>
            </div>
            <Link href="/placement/requests">
              <Button variant="outline" size="sm">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {request.staffName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{request.staffName}</p>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {request.type} • {request.from} → {request.to}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{request.date}</p>
                    <p className="text-xs font-medium">{request.position}</p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Details</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Placement by Region
            </CardTitle>
            <CardDescription>Staff distribution across UAE</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {regionData.map((region) => (
              <div key={region.region} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{region.region}</span>
                  <span className="font-medium">{region.count} ({region.percentage}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${region.color} transition-all`}
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Schools with Vacancies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Schools with Vacancies
            </CardTitle>
            <CardDescription>Open positions by school</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {schools.filter(s => s.vacancies > 0).slice(0, 4).map((school) => (
              <div key={school.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{school.name}</p>
                  <p className="text-xs text-muted-foreground">{school.region}</p>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  {school.vacancies} open
                </Badge>
              </div>
            ))}
            <Link href="/placement/analytics">
              <Button variant="outline" className="w-full mt-2" size="sm">
                View All Schools
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Staff Awaiting Placement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Awaiting Placement
            </CardTitle>
            <CardDescription>Staff pending assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {awaitingPlacement.map((staff) => (
              <div key={staff.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{staff.name}</p>
                  <p className="text-xs text-muted-foreground">{staff.position}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={
                    staff.days > 7 ? 'bg-red-50 text-red-700' : 
                    staff.days > 3 ? 'bg-amber-50 text-amber-700' : 
                    'bg-green-50 text-green-700'
                  }>
                    {staff.days} days
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest placement updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`mt-0.5 ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.staff} - {activity.details}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Row */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common placement operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Link href="/placement/requests">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Placement Requests</p>
                    <p className="text-xs text-muted-foreground">View all requests</p>
                  </div>
                </div>
              </Button>
            </Link>
            <Link href="/placement/history">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Transfer History</p>
                    <p className="text-xs text-muted-foreground">Past movements</p>
                  </div>
                </div>
              </Button>
            </Link>
            <Link href="/placement/directory">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Staff Directory</p>
                    <p className="text-xs text-muted-foreground">All educators</p>
                  </div>
                </div>
              </Button>
            </Link>
            <Link href="/placement/analytics">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Placement Analytics</p>
                    <p className="text-xs text-muted-foreground">Reports & insights</p>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
