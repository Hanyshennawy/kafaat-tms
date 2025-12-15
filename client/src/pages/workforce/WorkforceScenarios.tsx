import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Plus, 
  BarChart3, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  RefreshCcw, 
  Building2, 
  Users,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  DollarSign,
  Trash2,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Scenario templates
const scenarioTemplates = [
  {
    id: "expansion",
    title: "📈 School Expansion",
    description: "Plan for growth and new positions",
    color: "bg-green-500",
    defaults: {
      scenarioType: "expansion",
      planningHorizon: "3",
      description: "Workforce planning for school expansion and growth"
    }
  },
  {
    id: "budget_reduction",
    title: "💰 Budget Optimization",
    description: "Workforce restructuring for efficiency",
    color: "bg-amber-500",
    defaults: {
      scenarioType: "downsizing",
      planningHorizon: "1",
      description: "Optimize workforce allocation within budget constraints"
    }
  },
  {
    id: "digital",
    title: "🖥️ Digital Transformation",
    description: "Technology-driven workforce changes",
    color: "bg-blue-500",
    defaults: {
      scenarioType: "restructuring",
      planningHorizon: "3",
      description: "Workforce adaptation for digital learning initiatives"
    }
  },
  {
    id: "retirement",
    title: "👨‍🏫 Retirement Wave",
    description: "Succession planning for retiring staff",
    color: "bg-purple-500",
    defaults: {
      scenarioType: "custom",
      planningHorizon: "5",
      description: "Plan for upcoming teacher retirements and knowledge transfer"
    }
  }
];

export default function WorkforceScenarios() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  
  // Enhanced form state
  const [formData, setFormData] = useState({
    // Tab 1: Details
    name: "",
    scenarioType: "expansion" as string,
    description: "",
    planningHorizon: "3",
    baseYear: "2025",
    priority: "medium",
    
    // Tab 2: Workforce Impact
    departments: [] as string[],
    currentHeadcount: 0,
    projectedHeadcount: 0,
    positionsToAdd: [] as { title: string; count: number }[],
    positionsToRemove: [] as { title: string; count: number }[],
    budgetImpact: 0,
    budgetDirection: "increase",
    
    // Tab 3: Timeline
    startDate: "",
    endDate: "",
    milestones: [] as { name: string; date: string; status: string }[],
    
    // Tab 4: Assumptions & Risks
    assumptions: [] as string[],
    risks: [] as { description: string; likelihood: string; impact: string }[],
    successMetrics: [] as string[],
    
    // Educator-specific
    studentTeacherRatio: 20,
    subjectAreas: [] as string[],
    licenseRequirements: [] as string[],
    trainingNeeds: ""
  });

  const [newDepartment, setNewDepartment] = useState("");
  const [newAssumption, setNewAssumption] = useState("");
  const [newMetric, setNewMetric] = useState("");
  const [newMilestone, setNewMilestone] = useState({ name: "", date: "" });
  const [newPosition, setNewPosition] = useState({ title: "", count: 1, action: "add" });
  
  const { data: scenarios, refetch } = trpc.workforcePlanning.getAllScenarios.useQuery();
  const createScenario = trpc.workforcePlanning.createScenario.useMutation({
    onSuccess: () => {
      toast.success("Scenario created successfully!");
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      scenarioType: "expansion",
      description: "",
      planningHorizon: "3",
      baseYear: "2025",
      priority: "medium",
      departments: [],
      currentHeadcount: 0,
      projectedHeadcount: 0,
      positionsToAdd: [],
      positionsToRemove: [],
      budgetImpact: 0,
      budgetDirection: "increase",
      startDate: "",
      endDate: "",
      milestones: [],
      assumptions: [],
      risks: [],
      successMetrics: [],
      studentTeacherRatio: 20,
      subjectAreas: [],
      licenseRequirements: [],
      trainingNeeds: ""
    });
    setSelectedTemplate(null);
    setActiveTab("details");
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = scenarioTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setFormData({
        ...formData,
        ...template.defaults,
        name: ""
      });
      setActiveTab("details");
    }
  };

  const addDepartment = () => {
    if (newDepartment && !formData.departments.includes(newDepartment)) {
      setFormData({ ...formData, departments: [...formData.departments, newDepartment] });
      setNewDepartment("");
    }
  };

  const addAssumption = () => {
    if (newAssumption.trim()) {
      setFormData({ ...formData, assumptions: [...formData.assumptions, newAssumption.trim()] });
      setNewAssumption("");
    }
  };

  const addMetric = () => {
    if (newMetric.trim()) {
      setFormData({ ...formData, successMetrics: [...formData.successMetrics, newMetric.trim()] });
      setNewMetric("");
    }
  };

  const addMilestone = () => {
    if (newMilestone.name && newMilestone.date) {
      setFormData({ 
        ...formData, 
        milestones: [...formData.milestones, { ...newMilestone, status: "pending" }] 
      });
      setNewMilestone({ name: "", date: "" });
    }
  };

  const addPosition = () => {
    if (newPosition.title) {
      if (newPosition.action === "add") {
        setFormData({
          ...formData,
          positionsToAdd: [...formData.positionsToAdd, { title: newPosition.title, count: newPosition.count }]
        });
      } else {
        setFormData({
          ...formData,
          positionsToRemove: [...formData.positionsToRemove, { title: newPosition.title, count: newPosition.count }]
        });
      }
      setNewPosition({ title: "", count: 1, action: "add" });
    }
  };

  const getScenarioIcon = (type: string) => {
    switch (type) {
      case "expansion": return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "downsizing": return <TrendingDown className="h-5 w-5 text-red-500" />;
      case "restructuring": return <RefreshCcw className="h-5 w-5 text-blue-500" />;
      case "merger": return <Building2 className="h-5 w-5 text-purple-500" />;
      default: return <BarChart3 className="h-5 w-5 text-gray-500" />;
    }
  };

  // Demo workforce analytics data
  const workforceAnalytics = {
    currentHeadcount: 156,
    projectedHeadcount: 172,
    budgetUtilization: 87,
    attritionRate: 8.5,
    retirementProjections: [
      { year: "2025", count: 4 },
      { year: "2026", count: 7 },
      { year: "2027", count: 12 },
      { year: "2028", count: 9 },
      { year: "2029", count: 6 }
    ],
    departmentGaps: [
      { name: "Mathematics", current: 18, required: 22, gap: -4 },
      { name: "Science", current: 15, required: 18, gap: -3 },
      { name: "English", current: 20, required: 20, gap: 0 },
      { name: "Arabic", current: 14, required: 16, gap: -2 },
      { name: "Special Education", current: 6, required: 10, gap: -4 },
      { name: "PE & Arts", current: 8, required: 8, gap: 0 }
    ],
    scenarioComparison: [
      { scenario: "Current State", headcount: 156, cost: 12.4, efficiency: 78 },
      { scenario: "Expansion Plan", headcount: 172, cost: 13.8, efficiency: 85 },
      { scenario: "Optimization", headcount: 148, cost: 11.2, efficiency: 92 }
    ],
    attritionRisks: [
      { category: "Retirement", count: 12, risk: "high" },
      { category: "Career Change", count: 6, risk: "medium" },
      { category: "Relocation", count: 4, risk: "low" },
      { category: "Performance", count: 2, risk: "medium" }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-green-600" />
            Workforce Scenarios
          </h1>
          <p className="text-muted-foreground mt-1">Model and simulate workforce planning scenarios</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Scenario</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Workforce Scenario</DialogTitle>
              <DialogDescription>
                Plan and model workforce changes with detailed impact analysis
              </DialogDescription>
            </DialogHeader>

            {/* Templates Section */}
            {!selectedTemplate && activeTab === "details" && (
              <div className="py-4">
                <h3 className="text-sm font-medium mb-3">Quick Start Templates</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {scenarioTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className="p-4 rounded-lg border-2 hover:border-primary/50 transition-all text-left group"
                    >
                      <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center text-white text-xl mb-2`}>
                        {template.title.split(" ")[0]}
                      </div>
                      <h4 className="font-medium text-sm">{template.title.slice(3)}</h4>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">or create from scratch</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Scenario Details</TabsTrigger>
                <TabsTrigger value="impact">Workforce Impact</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="risks">Risks & Metrics</TabsTrigger>
              </TabsList>

              {/* Tab 1: Scenario Details */}
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Scenario Name *</Label>
                    <Input 
                      id="name"
                      placeholder="e.g., 2026 Expansion Plan" 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Scenario Type *</Label>
                    <Select value={formData.scenarioType} onValueChange={(v) => setFormData({ ...formData, scenarioType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expansion">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" /> Expansion
                          </div>
                        </SelectItem>
                        <SelectItem value="downsizing">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-500" /> Downsizing
                          </div>
                        </SelectItem>
                        <SelectItem value="restructuring">
                          <div className="flex items-center gap-2">
                            <RefreshCcw className="h-4 w-4 text-blue-500" /> Restructuring
                          </div>
                        </SelectItem>
                        <SelectItem value="merger">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-purple-500" /> Merger
                          </div>
                        </SelectItem>
                        <SelectItem value="custom">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-500" /> Custom
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Planning Horizon</Label>
                    <Select value={formData.planningHorizon} onValueChange={(v) => setFormData({ ...formData, planningHorizon: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Year</SelectItem>
                        <SelectItem value="2">2 Years</SelectItem>
                        <SelectItem value="3">3 Years</SelectItem>
                        <SelectItem value="5">5 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Base Year</Label>
                    <Select value={formData.baseYear} onValueChange={(v) => setFormData({ ...formData, baseYear: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority Level</Label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">🔴 Critical</SelectItem>
                        <SelectItem value="high">🟠 High</SelectItem>
                        <SelectItem value="medium">🟡 Medium</SelectItem>
                        <SelectItem value="low">🟢 Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe the scenario objectives and context..."
                    className="min-h-[100px]"
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  />
                </div>

                {/* Educator-Specific Section */}
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-blue-500" />
                      Educator-Specific Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Target Student-to-Teacher Ratio</Label>
                        <span className="text-sm font-medium">{formData.studentTeacherRatio}:1</span>
                      </div>
                      <Slider
                        value={[formData.studentTeacherRatio]}
                        onValueChange={(v) => setFormData({ ...formData, studentTeacherRatio: v[0] })}
                        min={10}
                        max={35}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>10:1 (Ideal)</span>
                        <span>35:1 (Max)</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Subject Areas Impacted</Label>
                      <div className="flex flex-wrap gap-2 p-2 border rounded-lg min-h-[40px]">
                        {formData.subjectAreas.map((area, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1">
                            {area}
                            <button 
                              onClick={() => setFormData({
                                ...formData,
                                subjectAreas: formData.subjectAreas.filter((_, i) => i !== idx)
                              })}
                              className="ml-1 hover:text-destructive"
                            >×</button>
                          </Badge>
                        ))}
                      </div>
                      <Select onValueChange={(v) => {
                        if (!formData.subjectAreas.includes(v)) {
                          setFormData({ ...formData, subjectAreas: [...formData.subjectAreas, v] });
                        }
                      }}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Add subject area..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Arabic">Arabic</SelectItem>
                          <SelectItem value="Islamic Studies">Islamic Studies</SelectItem>
                          <SelectItem value="Social Studies">Social Studies</SelectItem>
                          <SelectItem value="Physical Education">Physical Education</SelectItem>
                          <SelectItem value="Arts">Arts</SelectItem>
                          <SelectItem value="All Subjects">All Subjects</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Workforce Impact */}
              <TabsContent value="impact" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Headcount Changes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Current Headcount</Label>
                          <Input 
                            type="number"
                            value={formData.currentHeadcount}
                            onChange={(e) => setFormData({ ...formData, currentHeadcount: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Projected Headcount</Label>
                          <Input 
                            type="number"
                            value={formData.projectedHeadcount}
                            onChange={(e) => setFormData({ ...formData, projectedHeadcount: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      {formData.projectedHeadcount !== formData.currentHeadcount && (
                        <div className={`p-3 rounded-lg ${formData.projectedHeadcount > formData.currentHeadcount ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
                          <p className="text-sm font-medium">
                            {formData.projectedHeadcount > formData.currentHeadcount ? (
                              <span className="text-green-700 dark:text-green-300">
                                +{formData.projectedHeadcount - formData.currentHeadcount} positions
                              </span>
                            ) : (
                              <span className="text-red-700 dark:text-red-300">
                                {formData.projectedHeadcount - formData.currentHeadcount} positions
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Budget Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Select value={formData.budgetDirection} onValueChange={(v) => setFormData({ ...formData, budgetDirection: v })}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="increase">Increase</SelectItem>
                            <SelectItem value="decrease">Decrease</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input 
                          type="number"
                          placeholder="Amount"
                          value={formData.budgetImpact}
                          onChange={(e) => setFormData({ ...formData, budgetImpact: parseInt(e.target.value) || 0 })}
                        />
                        <span className="flex items-center text-muted-foreground">AED</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <Label>Departments Affected</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[50px]">
                    {formData.departments.map((dept, idx) => (
                      <Badge key={idx} variant="outline" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {dept}
                        <button 
                          onClick={() => setFormData({
                            ...formData,
                            departments: formData.departments.filter((_, i) => i !== idx)
                          })}
                          className="ml-1 hover:text-destructive"
                        >×</button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select value={newDepartment} onValueChange={setNewDepartment}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select department..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Arabic">Arabic</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Student Services">Student Services</SelectItem>
                        <SelectItem value="All Departments">All Departments</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addDepartment} variant="outline">Add</Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Positions to Add */}
                  <Card className="border-green-200 dark:border-green-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-300">
                        <TrendingUp className="h-4 w-4" />
                        Positions to Add
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {formData.positionsToAdd.map((pos, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                          <span>{pos.title}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">+{pos.count}</Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setFormData({
                                ...formData,
                                positionsToAdd: formData.positionsToAdd.filter((_, i) => i !== idx)
                              })}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Positions to Remove */}
                  <Card className="border-red-200 dark:border-red-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-300">
                        <TrendingDown className="h-4 w-4" />
                        Positions to Remove
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {formData.positionsToRemove.map((pos, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded">
                          <span>{pos.title}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">-{pos.count}</Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setFormData({
                                ...formData,
                                positionsToRemove: formData.positionsToRemove.filter((_, i) => i !== idx)
                              })}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Add Position Form */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex gap-2">
                      <Select value={newPosition.action} onValueChange={(v) => setNewPosition({ ...newPosition, action: v })}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="add">Add</SelectItem>
                          <SelectItem value="remove">Remove</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={newPosition.title} onValueChange={(v) => setNewPosition({ ...newPosition, title: v })}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select position..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Teacher">Teacher</SelectItem>
                          <SelectItem value="Senior Teacher">Senior Teacher</SelectItem>
                          <SelectItem value="Lead Teacher">Lead Teacher</SelectItem>
                          <SelectItem value="Department Head">Department Head</SelectItem>
                          <SelectItem value="Coordinator">Coordinator</SelectItem>
                          <SelectItem value="Vice Principal">Vice Principal</SelectItem>
                          <SelectItem value="Teaching Assistant">Teaching Assistant</SelectItem>
                          <SelectItem value="Counselor">Counselor</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        type="number"
                        min="1"
                        className="w-20"
                        value={newPosition.count}
                        onChange={(e) => setNewPosition({ ...newPosition, count: parseInt(e.target.value) || 1 })}
                      />
                      <Button onClick={addPosition}>Add</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Timeline */}
              <TabsContent value="timeline" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Scenario Start Date</Label>
                    <Input 
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Completion Date</Label>
                    <Input 
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Key Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {formData.milestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium">{milestone.name}</p>
                            <p className="text-sm text-muted-foreground">{milestone.date}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setFormData({
                            ...formData,
                            milestones: formData.milestones.filter((_, i) => i !== idx)
                          })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex gap-2 pt-2">
                      <Input 
                        placeholder="Milestone name..."
                        value={newMilestone.name}
                        onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                        className="flex-1"
                      />
                      <Input 
                        type="date"
                        value={newMilestone.date}
                        onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                        className="w-[150px]"
                      />
                      <Button onClick={addMilestone} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Common Milestones Quick Add */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Quick Add Common Milestones</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {[
                      "Planning Phase Complete",
                      "Budget Approval",
                      "Hiring Begins",
                      "Training Scheduled",
                      "Implementation Start",
                      "Midpoint Review",
                      "Final Implementation",
                      "Post-Implementation Review"
                    ].map(name => (
                      <Button
                        key={name}
                        variant="outline"
                        size="sm"
                        onClick={() => setNewMilestone({ ...newMilestone, name })}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {name}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 4: Risks & Metrics */}
              <TabsContent value="risks" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Key Assumptions
                    </CardTitle>
                    <CardDescription>What conditions must be true for this scenario?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {formData.assumptions.map((assumption, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="flex-1">{assumption}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setFormData({
                            ...formData,
                            assumptions: formData.assumptions.filter((_, i) => i !== idx)
                          })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g., Student enrollment will increase by 15%"
                        value={newAssumption}
                        onChange={(e) => setNewAssumption(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addAssumption()}
                      />
                      <Button onClick={addAssumption} variant="outline">Add</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Risk Factors
                    </CardTitle>
                    <CardDescription>Identify potential risks to this scenario</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {formData.risks.map((risk, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{risk.description}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Likelihood: {risk.likelihood}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Impact: {risk.impact}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setFormData({
                            ...formData,
                            risks: formData.risks.filter((_, i) => i !== idx)
                          })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      <Input 
                        placeholder="Risk description..."
                        className="col-span-2"
                        id="riskDesc"
                      />
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Likelihood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline">Add Risk</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Success Metrics
                    </CardTitle>
                    <CardDescription>How will you measure success?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {formData.successMetrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded">
                        <Target className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="flex-1">{metric}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setFormData({
                            ...formData,
                            successMetrics: formData.successMetrics.filter((_, i) => i !== idx)
                          })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g., Achieve 18:1 student-teacher ratio"
                        value={newMetric}
                        onChange={(e) => setNewMetric(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addMetric()}
                      />
                      <Button onClick={addMetric} variant="outline">Add</Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>Training Needs for This Scenario</Label>
                  <Textarea 
                    placeholder="Describe any training or upskilling required for current staff..."
                    value={formData.trainingNeeds}
                    onChange={(e) => setFormData({ ...formData, trainingNeeds: e.target.value })}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button variant="outline">Save as Draft</Button>
              <Button onClick={() => createScenario.mutate({
                name: formData.name,
                description: formData.description,
                scenarioType: formData.scenarioType as any
              })}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create Scenario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workforce Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Current Headcount</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{workforceAnalytics.currentHeadcount}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Active employees</p>
              </div>
              <Users className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Projected (2026)</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{workforceAnalytics.projectedHeadcount}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +{workforceAnalytics.projectedHeadcount - workforceAnalytics.currentHeadcount} growth
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Budget Utilization</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{workforceAnalytics.budgetUtilization}%</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Of approved budget</p>
              </div>
              <DollarSign className="h-10 w-10 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Attrition Rate</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{workforceAnalytics.attritionRate}%</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Annual turnover</p>
              </div>
              <TrendingDown className="h-10 w-10 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Scenario Comparison
          </CardTitle>
          <CardDescription>Compare headcount, cost, and efficiency across scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {workforceAnalytics.scenarioComparison.map((scenario, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{scenario.scenario}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" /> {scenario.headcount} staff
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <DollarSign className="h-3 w-3" /> {scenario.cost}M AED
                    </Badge>
                    <Badge className={
                      scenario.efficiency >= 90 ? "bg-green-100 text-green-800" :
                      scenario.efficiency >= 80 ? "bg-blue-100 text-blue-800" :
                      "bg-amber-100 text-amber-800"
                    }>
                      {scenario.efficiency}% efficient
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Headcount</p>
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${(scenario.headcount / 180) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cost Impact</p>
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${(scenario.cost / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Efficiency</p>
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          scenario.efficiency >= 90 ? 'bg-green-500' :
                          scenario.efficiency >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${scenario.efficiency}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Headcount Forecasting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Retirement Projections
            </CardTitle>
            <CardDescription>Expected retirements over next 5 years</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end justify-between h-40 gap-2">
                {workforceAnalytics.retirementProjections.map((year, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t transition-all duration-500"
                      style={{ height: `${(year.count / 12) * 100}%`, minHeight: '20px' }}
                    >
                      <div className="text-center text-white font-bold pt-1">{year.count}</div>
                    </div>
                    <span className="text-xs font-medium">{year.year}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <span className="font-medium text-orange-700 dark:text-orange-300">Total Projected Retirements</span>
                <Badge className="bg-orange-500 text-white">
                  {workforceAnalytics.retirementProjections.reduce((sum, y) => sum + y.count, 0)} positions
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attrition Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Attrition Risk Analysis
            </CardTitle>
            <CardDescription>Categories of employee turnover risk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workforceAnalytics.attritionRisks.map((risk, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      risk.risk === 'high' ? 'bg-red-500' :
                      risk.risk === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    <span className="font-medium">{risk.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{risk.count}</span>
                    <Badge className={
                      risk.risk === 'high' ? 'bg-red-100 text-red-800' :
                      risk.risk === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {risk.risk} risk
                    </Badge>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <span className="font-medium text-red-700 dark:text-red-300">Total At-Risk Employees</span>
                <Badge className="bg-red-500 text-white">
                  {workforceAnalytics.attritionRisks.reduce((sum, r) => sum + r.count, 0)} employees
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workforce Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Workforce Gap Analysis
          </CardTitle>
          <CardDescription>Current vs. required staffing levels by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workforceAnalytics.departmentGaps.map((dept, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {dept.current} / {dept.required}
                    </span>
                    {dept.gap === 0 ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Staffed
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" /> {dept.gap} gap
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
                  {/* Required level indicator */}
                  <div 
                    className="absolute h-full w-0.5 bg-gray-400 dark:bg-gray-500 z-10"
                    style={{ left: `${(dept.required / 25) * 100}%` }}
                  />
                  {/* Current level */}
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      dept.gap === 0 ? 'bg-green-500' : 'bg-red-400'
                    }`}
                    style={{ width: `${(dept.current / 25) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg mt-6">
              <div>
                <span className="font-medium text-indigo-700 dark:text-indigo-300">Total Workforce Gap</span>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  Need to hire {Math.abs(workforceAnalytics.departmentGaps.reduce((sum, d) => sum + d.gap, 0))} more educators
                </p>
              </div>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Hiring Scenario
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Active Scenarios
        </h2>
        <Badge variant="outline">{scenarios?.length || 0} scenarios</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {scenarios?.map(scenario => (
          <Card key={scenario.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getScenarioIcon(scenario.scenarioType)}
                  <div>
                    <CardTitle>{scenario.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
                  </div>
                </div>
                <Badge className={
                  scenario.status === 'active' ? 'bg-green-100 text-green-800' :
                  scenario.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }>{scenario.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link href={`/workforce/scenarios/${scenario.id}`}>
                  <Button variant="outline" size="sm" className="gap-2"><Eye className="h-4 w-4" />View</Button>
                </Link>
                <Button variant="outline" size="sm">Simulate</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
