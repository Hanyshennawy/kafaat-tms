import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Search, Users, Eye, AlertTriangle, Clock, Shield, Building2,
  UserCheck, GraduationCap, Target, Calendar, Trash2, Sparkles, Star,
  TrendingUp, ChevronRight, Zap, User, AlertCircle, CheckCircle2,
  Gauge, BarChart3, ArrowUpRight, Timer, XCircle, UserX, ShieldAlert
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Position templates for educators
const POSITION_TEMPLATES = [
  {
    name: "Principal Succession",
    description: "Prepare successors for school principal position",
    position: "Principal",
    level: "school",
    criticality: "critical",
    requiredExperience: 10,
    candidates: [
      { name: "", readiness: "ready_2_years", developmentNeeds: "" }
    ]
  },
  {
    name: "Vice Principal Pipeline",
    description: "Develop future vice principals from senior educators",
    position: "Vice Principal",
    level: "school",
    criticality: "high",
    requiredExperience: 7,
    candidates: [
      { name: "", readiness: "ready_1_year", developmentNeeds: "" }
    ]
  },
  {
    name: "Department Head Succession",
    description: "Succession planning for academic department leadership",
    position: "Department Head",
    level: "department",
    criticality: "high",
    requiredExperience: 5,
    candidates: [
      { name: "", readiness: "ready_1_year", developmentNeeds: "" }
    ]
  },
  {
    name: "Lead Teacher Development",
    description: "Identify and develop future lead teachers",
    position: "Lead Teacher",
    level: "department",
    criticality: "medium",
    requiredExperience: 3,
    candidates: [
      { name: "", readiness: "ready_now", developmentNeeds: "" }
    ]
  },
];

// Leadership levels
const LEADERSHIP_LEVELS = [
  { value: "school", label: "School Level", description: "Principal, VP, Coordinators" },
  { value: "department", label: "Department Level", description: "Department Heads, Lead Teachers" },
  { value: "district", label: "District Level", description: "District Directors, Supervisors" },
  { value: "regional", label: "Regional Level", description: "Regional Directors, Officers" },
];

// Criticality levels
const CRITICALITY_LEVELS = [
  { value: "critical", label: "Critical", color: "bg-red-500", description: "Immediate business impact if vacant" },
  { value: "high", label: "High", color: "bg-orange-500", description: "Significant impact within 3 months" },
  { value: "medium", label: "Medium", color: "bg-yellow-500", description: "Moderate impact, can be managed" },
  { value: "low", label: "Low", color: "bg-green-500", description: "Minimal immediate impact" },
];

// Vacancy risk reasons
const VACANCY_RISKS = [
  { value: "retirement", label: "Upcoming Retirement" },
  { value: "resignation", label: "Potential Resignation" },
  { value: "promotion", label: "Promotion/Transfer" },
  { value: "health", label: "Health Concerns" },
  { value: "performance", label: "Performance Issues" },
  { value: "restructuring", label: "Organizational Restructuring" },
  { value: "other", label: "Other" },
];

// Readiness levels
const READINESS_LEVELS = [
  { value: "ready_now", label: "Ready Now", color: "text-green-600 bg-green-50", description: "Can step in immediately" },
  { value: "ready_1_year", label: "Ready in 1 Year", color: "text-blue-600 bg-blue-50", description: "With focused development" },
  { value: "ready_2_years", label: "Ready in 2+ Years", color: "text-orange-600 bg-orange-50", description: "Longer-term development needed" },
  { value: "potential", label: "High Potential", color: "text-purple-600 bg-purple-50", description: "Shows potential, needs experience" },
];

// Initial state for new succession plan
const initialPlanState = {
  name: "",
  description: "",
  position: "",
  currentIncumbent: "",
  incumbentEmail: "",
  level: "",
  criticality: "high",
  vacancyRisk: "",
  expectedVacancyDate: "",
  priority: "high",
  department: "",
  requiredExperience: 5,
  requiredCompetencies: [""],
  candidates: [
    { name: "", email: "", readiness: "ready_1_year", developmentNeeds: "", mentorAssigned: "" }
  ],
  developmentPlan: "",
  notes: "",
};

export default function SuccessionPlans() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState(initialPlanState);
  const [activeTab, setActiveTab] = useState("position");
  const [showTemplates, setShowTemplates] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: plans, refetch } = trpc.successionPlanning.getAllPlans.useQuery();
  const createPlan = trpc.successionPlanning.createPlan.useMutation({
    onSuccess: () => {
      toast.success("Succession plan created successfully!");
      setIsCreateDialogOpen(false);
      setNewPlan(initialPlanState);
      setActiveTab("position");
      setShowTemplates(true);
      refetch();
    },
    onError: (error) => {
      console.error("Failed to create succession plan:", error);
      toast.error(error.message || "Failed to create plan. Check database connection.");
    },
  });

  const applyTemplate = (template: typeof POSITION_TEMPLATES[0]) => {
    setNewPlan({
      ...newPlan,
      name: template.name,
      description: template.description,
      position: template.position,
      level: template.level,
      criticality: template.criticality,
      requiredExperience: template.requiredExperience,
      candidates: template.candidates.map(c => ({ ...c, email: "", mentorAssigned: "" })),
    });
    setShowTemplates(false);
    toast.success("Template applied! Customize as needed.");
  };

  const addCandidate = () => {
    setNewPlan({
      ...newPlan,
      candidates: [...newPlan.candidates, { name: "", email: "", readiness: "ready_1_year", developmentNeeds: "", mentorAssigned: "" }]
    });
  };

  const updateCandidate = (index: number, field: string, value: string) => {
    const updated = [...newPlan.candidates];
    updated[index] = { ...updated[index], [field]: value };
    setNewPlan({ ...newPlan, candidates: updated });
  };

  const removeCandidate = (index: number) => {
    if (newPlan.candidates.length > 1) {
      const updated = newPlan.candidates.filter((_, i) => i !== index);
      setNewPlan({ ...newPlan, candidates: updated });
    }
  };

  const addCompetency = () => {
    setNewPlan({ ...newPlan, requiredCompetencies: [...newPlan.requiredCompetencies, ""] });
  };

  const updateCompetency = (index: number, value: string) => {
    const updated = [...newPlan.requiredCompetencies];
    updated[index] = value;
    setNewPlan({ ...newPlan, requiredCompetencies: updated });
  };

  const removeCompetency = (index: number) => {
    const updated = newPlan.requiredCompetencies.filter((_, i) => i !== index);
    setNewPlan({ ...newPlan, requiredCompetencies: updated });
  };

  const handleCreate = () => {
    if (!newPlan.name.trim()) {
      toast.error("Please enter a plan name");
      return;
    }
    createPlan.mutate({ 
      criticalPositionId: 1, 
      name: newPlan.name, 
      description: newPlan.description 
    });
  };

  const getCriticalityInfo = (value: string) => {
    return CRITICALITY_LEVELS.find(c => c.value === value) || CRITICALITY_LEVELS[1];
  };

  const getReadinessInfo = (value: string) => {
    return READINESS_LEVELS.find(r => r.value === value) || READINESS_LEVELS[1];
  };

  const filteredPlans = plans?.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-purple-600" />
            Succession Plans
          </h1>
          <p className="text-muted-foreground mt-1">Manage leadership pipeline and succession planning for educators</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setNewPlan(initialPlanState);
            setActiveTab("position");
            setShowTemplates(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Plan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Create Succession Plan
              </DialogTitle>
              <DialogDescription>
                Plan for leadership continuity by identifying and developing successors
              </DialogDescription>
            </DialogHeader>

            {/* Templates Section */}
            {showTemplates && (
              <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-sm">Quick Start Templates</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
                    Start from scratch
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {POSITION_TEMPLATES.map((template, index) => {
                    const criticality = getCriticalityInfo(template.criticality);
                    return (
                      <button
                        key={index}
                        onClick={() => applyTemplate(template)}
                        className="text-left p-3 rounded-lg border bg-white hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm line-clamp-1">{template.name}</p>
                              <div className={`h-2 w-2 rounded-full ${criticality.color}`} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{template.position} • {template.requiredExperience}+ years exp.</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tabs for organized form */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="position" className="text-xs">Position</TabsTrigger>
                <TabsTrigger value="risk" className="text-xs">Risk & Timeline</TabsTrigger>
                <TabsTrigger value="candidates" className="text-xs">Candidates</TabsTrigger>
                <TabsTrigger value="development" className="text-xs">Development</TabsTrigger>
              </TabsList>

              {/* Tab 1: Position Details */}
              <TabsContent value="position" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Plan Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    placeholder="e.g., Principal Succession Plan - Al Noor School" 
                    value={newPlan.name} 
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe the purpose and scope of this succession plan..." 
                    value={newPlan.description} 
                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })} 
                    rows={2} 
                  />
                </div>

                <Separator />

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-blue-900">Target Position</p>
                      <p className="text-xs text-blue-700 mt-1">
                        The leadership role this plan is designed to fill
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Position Title</Label>
                    <Input 
                      placeholder="e.g., School Principal" 
                      value={newPlan.position} 
                      onChange={(e) => setNewPlan({ ...newPlan, position: e.target.value })} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Leadership Level</Label>
                    <Select value={newPlan.level} onValueChange={(value) => setNewPlan({ ...newPlan, level: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEADERSHIP_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div>
                              <span>{level.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Current Incumbent
                    </Label>
                    <Input 
                      placeholder="Name of current role holder" 
                      value={newPlan.currentIncumbent} 
                      onChange={(e) => setNewPlan({ ...newPlan, currentIncumbent: e.target.value })} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Department/School</Label>
                    <Input 
                      placeholder="e.g., Al Noor International School" 
                      value={newPlan.department} 
                      onChange={(e) => setNewPlan({ ...newPlan, department: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Criticality Level
                    </Label>
                    <Select value={newPlan.criticality} onValueChange={(value) => setNewPlan({ ...newPlan, criticality: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CRITICALITY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full ${level.color}`} />
                              <span>{level.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Required Experience (Years)
                    </Label>
                    <Input 
                      type="number"
                      min="0"
                      value={newPlan.requiredExperience} 
                      onChange={(e) => setNewPlan({ ...newPlan, requiredExperience: parseInt(e.target.value) || 0 })} 
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Risk & Timeline */}
              <TabsContent value="risk" className="space-y-4 mt-4">
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-orange-900">Risk Assessment</p>
                      <p className="text-xs text-orange-700 mt-1">
                        Identify potential vacancy triggers and timeline urgency
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vacancy Risk Reason</Label>
                    <Select value={newPlan.vacancyRisk} onValueChange={(value) => setNewPlan({ ...newPlan, vacancyRisk: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {VACANCY_RISKS.map((risk) => (
                          <SelectItem key={risk.value} value={risk.value}>
                            {risk.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Expected Vacancy Date
                    </Label>
                    <Input 
                      type="date"
                      value={newPlan.expectedVacancyDate} 
                      onChange={(e) => setNewPlan({ ...newPlan, expectedVacancyDate: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Priority Level</Label>
                  <Select value={newPlan.priority} onValueChange={(value) => setNewPlan({ ...newPlan, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          Urgent - Immediate attention required
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          High - Address within 3 months
                        </div>
                      </SelectItem>
                      <SelectItem value="normal">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          Normal - Planned succession
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Required Competencies
                    </Label>
                    <Button variant="outline" size="sm" onClick={addCompetency}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newPlan.requiredCompetencies.map((comp, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-600 text-xs font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <Input
                          placeholder="e.g., Educational Leadership, Strategic Planning"
                          value={comp}
                          onChange={(e) => updateCompetency(index, e.target.value)}
                          className="flex-1"
                        />
                        {newPlan.requiredCompetencies.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeCompetency(index)} className="h-8 w-8 text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Successor Candidates */}
              <TabsContent value="candidates" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Potential Successors</Label>
                    <p className="text-sm text-muted-foreground">Identify and assess candidates for this role</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addCandidate}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Candidate
                  </Button>
                </div>

                <div className="space-y-4">
                  {newPlan.candidates.map((candidate, index) => (
                    <Card key={index} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                                {candidate.name ? candidate.name.charAt(0).toUpperCase() : (index + 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">Candidate {index + 1}</span>
                          </div>
                          {newPlan.candidates.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => removeCandidate(index)} className="h-7 w-7 text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Candidate Name</Label>
                            <Input
                              placeholder="Full name"
                              value={candidate.name}
                              onChange={(e) => updateCandidate(index, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Email</Label>
                            <Input
                              type="email"
                              placeholder="Email address"
                              value={candidate.email}
                              onChange={(e) => updateCandidate(index, "email", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Readiness Level</Label>
                            <Select value={candidate.readiness} onValueChange={(value) => updateCandidate(index, "readiness", value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {READINESS_LEVELS.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    <span className={level.color.split(' ')[0]}>{level.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Assigned Mentor</Label>
                            <Input
                              placeholder="Mentor name"
                              value={candidate.mentorAssigned}
                              onChange={(e) => updateCandidate(index, "mentorAssigned", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Development Needs</Label>
                          <Input
                            placeholder="Key gaps to address (e.g., Budget management, Parent relations)"
                            value={candidate.developmentNeeds}
                            onChange={(e) => updateCandidate(index, "developmentNeeds", e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Readiness Summary */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium text-sm mb-3">Candidate Readiness Summary</p>
                  <div className="flex flex-wrap gap-2">
                    {READINESS_LEVELS.map((level) => {
                      const count = newPlan.candidates.filter(c => c.readiness === level.value && c.name).length;
                      return (
                        <Badge key={level.value} variant="outline" className={level.color}>
                          {level.label}: {count}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Development Planning */}
              <TabsContent value="development" className="space-y-4 mt-4">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-green-900">Development Strategy</p>
                      <p className="text-xs text-green-700 mt-1">
                        Define how candidates will be prepared for the role
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Development Plan Overview</Label>
                  <Textarea 
                    placeholder="Describe the overall development approach, training programs, mentorship structure, and key milestones for preparing successors..." 
                    value={newPlan.developmentPlan} 
                    onChange={(e) => setNewPlan({ ...newPlan, developmentPlan: e.target.value })} 
                    rows={4} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea 
                    placeholder="Any other important information about this succession plan..." 
                    value={newPlan.notes} 
                    onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })} 
                    rows={3} 
                  />
                </div>

                <Separator />

                {/* Plan Summary */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <p className="font-medium text-sm">Succession Plan Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Position:</span>
                      <span>{newPlan.position || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level:</span>
                      <span className="capitalize">{newPlan.level || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Criticality:</span>
                      <div className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${getCriticalityInfo(newPlan.criticality).color}`} />
                        <span className="capitalize">{newPlan.criticality}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <span className="capitalize">{newPlan.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Candidates:</span>
                      <span>{newPlan.candidates.filter(c => c.name).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Competencies:</span>
                      <span>{newPlan.requiredCompetencies.filter(c => c.trim()).length}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createPlan.isPending} className="gap-2">
                {createPlan.isPending ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Create Plan
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{plans?.length || 0}</div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{plans?.filter(p => p.status === "active").length || 0}</div>
              <CheckCircle2 className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">3</div>
              <AlertTriangle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ready Successors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <UserCheck className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NEW: Enhanced Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Risk Assessment */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              Succession Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { position: "Principal", risk: "high", reason: "Incumbent retiring in 6 months", successors: 1 },
              { position: "VP Academic", risk: "medium", reason: "No immediate successor identified", successors: 0 },
              { position: "Dept Head - Science", risk: "low", reason: "2 ready successors", successors: 2 },
              { position: "Lead Teacher - Math", risk: "low", reason: "Stable position", successors: 3 },
            ].map((item) => (
              <div key={item.position} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      item.risk === 'high' ? 'bg-red-500' :
                      item.risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <p className="text-sm font-medium">{item.position}</p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-4">{item.reason}</p>
                </div>
                <Badge variant="outline" className={`text-xs ${
                  item.risk === 'high' ? 'text-red-600 border-red-200' :
                  item.risk === 'medium' ? 'text-yellow-600 border-yellow-200' : 'text-green-600 border-green-200'
                }`}>
                  {item.successors === 0 ? 'No backup' : `${item.successors} ready`}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bench Strength Indicator */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-600" />
              Bench Strength by Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { level: "Executive Leadership", strength: 40, target: 80, status: "critical" },
              { level: "School Leadership", strength: 65, target: 80, status: "warning" },
              { level: "Department Heads", strength: 85, target: 80, status: "good" },
              { level: "Lead Teachers", strength: 90, target: 80, status: "excellent" },
            ].map((item) => (
              <div key={item.level} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.level}</span>
                  <span className={`font-medium ${
                    item.status === 'critical' ? 'text-red-600' :
                    item.status === 'warning' ? 'text-yellow-600' :
                    item.status === 'good' ? 'text-green-600' : 'text-blue-600'
                  }`}>{item.strength}%</span>
                </div>
                <div className="relative w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.status === 'critical' ? 'bg-red-500' :
                      item.status === 'warning' ? 'bg-yellow-500' :
                      item.status === 'good' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${item.strength}%` }}
                  />
                  <div 
                    className="absolute top-0 h-2 w-0.5 bg-gray-400"
                    style={{ left: `${item.target}%` }}
                    title={`Target: ${item.target}%`}
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-center mt-2">
              Target bench strength: 80% | Line indicates target
            </p>
          </CardContent>
        </Card>

        {/* Readiness Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4 text-purple-600" />
              Successor Readiness Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-around text-center py-4">
              <div>
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-green-600">5</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Ready Now</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-blue-600">7</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">1 Year</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-orange-600">4</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">2+ Years</p>
              </div>
            </div>
            <Separator />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">16</span> total successors in pipeline
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 9-Box Grid Quick View */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              Talent 9-Box Grid Overview
            </CardTitle>
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Full Grid View
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "High Potential", count: 8, bg: "bg-green-100", text: "text-green-700", position: "Stars" },
              { label: "High Performer", count: 12, bg: "bg-green-50", text: "text-green-600", position: "High Performers" },
              { label: "Solid Performer", count: 25, bg: "bg-blue-50", text: "text-blue-600", position: "Core Players" },
              { label: "Emerging Talent", count: 15, bg: "bg-yellow-100", text: "text-yellow-700", position: "Growth Potential" },
              { label: "Key Contributor", count: 35, bg: "bg-gray-100", text: "text-gray-700", position: "Trusted Professionals" },
              { label: "Effective", count: 18, bg: "bg-gray-50", text: "text-gray-600", position: "Consistent" },
              { label: "Question Mark", count: 5, bg: "bg-orange-100", text: "text-orange-700", position: "Development Focus" },
              { label: "Underperformer", count: 3, bg: "bg-red-50", text: "text-red-600", position: "Action Needed" },
              { label: "Risk", count: 2, bg: "bg-red-100", text: "text-red-700", position: "Immediate Action" },
            ].map((cell, index) => (
              <div key={index} className={`p-3 rounded-lg ${cell.bg} text-center`}>
                <p className={`text-2xl font-bold ${cell.text}`}>{cell.count}</p>
                <p className="text-xs text-muted-foreground">{cell.position}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search succession plans..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredPlans?.length === 0 && (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Succession Plans Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first succession plan to ensure leadership continuity
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />Create Succession Plan
              </Button>
            </CardContent>
          </Card>
        )}
        {filteredPlans?.map(plan => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="mt-1">{plan.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>{plan.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/succession/plans/${plan.id}`}>
                <Button variant="outline" size="sm" className="gap-2 w-full">
                  <Eye className="h-4 w-4" />View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
