import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Plus, Target, Eye, Calendar, FileText, Users, Settings, Sparkles,
  CheckCircle, Clock, GraduationCap, BarChart3, Bell, AlertCircle,
  Copy, UserCheck, MessageSquare, ClipboardList
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Cycle templates
const cycleTemplates = [
  {
    id: "annual-review",
    name: "Annual Review",
    icon: "📊",
    description: "Comprehensive yearly performance evaluation",
    defaults: {
      cycleType: "annual",
      includeSelfAssessment: true,
      includeManagerReview: true,
      include360Feedback: true,
      includeCalibration: true,
    }
  },
  {
    id: "mid-year",
    name: "Mid-Year Review",
    icon: "📅",
    description: "Six-month progress check and goal adjustment",
    defaults: {
      cycleType: "semi-annual",
      includeSelfAssessment: true,
      includeManagerReview: true,
      include360Feedback: false,
      includeCalibration: false,
    }
  },
  {
    id: "probation",
    name: "Probation Review",
    icon: "🆕",
    description: "End of probation period evaluation",
    defaults: {
      cycleType: "probation",
      includeSelfAssessment: true,
      includeManagerReview: true,
      include360Feedback: false,
      includeCalibration: false,
    }
  },
  {
    id: "quarterly",
    name: "Quarterly Check-in",
    icon: "📈",
    description: "Regular quarterly performance touchpoint",
    defaults: {
      cycleType: "quarterly",
      includeSelfAssessment: true,
      includeManagerReview: true,
      include360Feedback: false,
      includeCalibration: false,
    }
  },
  {
    id: "pd-evaluation",
    name: "PD Evaluation",
    icon: "🎓",
    description: "Professional development impact assessment",
    defaults: {
      cycleType: "custom",
      includeSelfAssessment: true,
      includeManagerReview: true,
      include360Feedback: false,
      includeCalibration: false,
    }
  },
  {
    id: "custom",
    name: "Custom Cycle",
    icon: "⚙️",
    description: "Build your own evaluation cycle",
    defaults: {
      cycleType: "custom",
      includeSelfAssessment: true,
      includeManagerReview: true,
      include360Feedback: false,
      includeCalibration: false,
    }
  },
];

const competencies = [
  { id: "teaching", name: "Teaching & Instruction", weight: 25 },
  { id: "curriculum", name: "Curriculum Knowledge", weight: 20 },
  { id: "student-engagement", name: "Student Engagement", weight: 15 },
  { id: "assessment", name: "Assessment & Feedback", weight: 15 },
  { id: "professionalism", name: "Professionalism", weight: 10 },
  { id: "collaboration", name: "Collaboration", weight: 10 },
  { id: "pd", name: "Professional Development", weight: 5 },
];

const departments = ["Mathematics", "Science", "English", "Arabic", "Social Studies", "PE", "Arts", "Special Education", "Administration"];
const roles = ["Classroom Teacher", "Department Head", "Coordinator", "Counselor", "Administrator"];

export default function PerformanceCycles() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const [newCycle, setNewCycle] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    cycleType: "annual" as const,
    // Evaluation Criteria
    ratingScale: "5-point",
    selectedCompetencies: ["teaching", "curriculum", "student-engagement", "assessment", "professionalism"],
    includeGoalProgress: true,
    includeClassroomObservation: true,
    includeStudentOutcomes: false,
    includePDMetrics: true,
    // Participants
    targetDepartments: [] as string[],
    targetRoles: [] as string[],
    excludeOnLeave: true,
    excludeProbation: false,
    minTenureMonths: 0,
    // Workflow
    includeSelfAssessment: true,
    includeManagerReview: true,
    include360Feedback: false,
    includeCalibration: true,
    requireFinalApproval: true,
    // Timeline
    selfAssessmentDays: 14,
    managerReviewDays: 14,
    calibrationDate: "",
    reminderFrequency: "weekly",
    escalationDays: 3,
  });
  
  const { data: cycles, refetch } = trpc.performanceManagement.getAllCycles.useQuery();
  const createCycle = trpc.performanceManagement.createCycle.useMutation({
    onSuccess: () => {
      toast.success("Performance cycle created successfully!");
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
  });

  const resetForm = () => {
    setNewCycle({
      name: "",
      startDate: "",
      endDate: "",
      description: "",
      cycleType: "annual",
      ratingScale: "5-point",
      selectedCompetencies: ["teaching", "curriculum", "student-engagement", "assessment", "professionalism"],
      includeGoalProgress: true,
      includeClassroomObservation: true,
      includeStudentOutcomes: false,
      includePDMetrics: true,
      targetDepartments: [],
      targetRoles: [],
      excludeOnLeave: true,
      excludeProbation: false,
      minTenureMonths: 0,
      includeSelfAssessment: true,
      includeManagerReview: true,
      include360Feedback: false,
      includeCalibration: true,
      requireFinalApproval: true,
      selfAssessmentDays: 14,
      managerReviewDays: 14,
      calibrationDate: "",
      reminderFrequency: "weekly",
      escalationDays: 3,
    });
    setSelectedTemplate(null);
    setActiveTab("details");
  };

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = cycleTemplates.find(t => t.id === templateId);
    if (template) {
      setNewCycle(prev => ({
        ...prev,
        name: `${template.name} - ${new Date().getFullYear()}`,
        description: template.description,
        cycleType: template.defaults.cycleType as any,
        includeSelfAssessment: template.defaults.includeSelfAssessment,
        includeManagerReview: template.defaults.includeManagerReview,
        include360Feedback: template.defaults.include360Feedback,
        includeCalibration: template.defaults.includeCalibration,
      }));
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const getCompletionProgress = () => {
    let score = 0;
    if (newCycle.name) score += 20;
    if (newCycle.startDate && newCycle.endDate) score += 20;
    if (newCycle.selectedCompetencies.length > 0) score += 20;
    if (newCycle.includeSelfAssessment || newCycle.includeManagerReview) score += 20;
    if (newCycle.selfAssessmentDays > 0) score += 20;
    return score;
  };

  const getEstimatedParticipants = () => {
    // Demo calculation
    const baseCount = 68;
    let count = baseCount;
    if (newCycle.targetDepartments.length > 0) {
      count = Math.floor(baseCount * (newCycle.targetDepartments.length / departments.length));
    }
    if (newCycle.excludeOnLeave) count -= 3;
    if (newCycle.excludeProbation) count -= 5;
    return Math.max(count, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-indigo-600" />
            Performance Cycles
          </h1>
          <p className="text-muted-foreground mt-1">Manage performance review cycles</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Cycle</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Create Performance Cycle
              </DialogTitle>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1">
                  <Progress value={getCompletionProgress()} className="h-2" />
                </div>
                <span className="text-sm text-muted-foreground">{getCompletionProgress()}% complete</span>
              </div>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="criteria" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Criteria
                </TabsTrigger>
                <TabsTrigger value="participants" className="gap-2">
                  <Users className="h-4 w-4" />
                  Participants
                </TabsTrigger>
                <TabsTrigger value="timeline" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Cycle Details */}
              <TabsContent value="details" className="space-y-6 mt-4">
                {/* Template Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Choose a Template
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {cycleTemplates.map(template => (
                      <div
                        key={template.id}
                        onClick={() => applyTemplate(template.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary hover:bg-accent/50 ${selectedTemplate === template.id ? 'border-primary bg-accent ring-2 ring-primary/20' : ''}`}
                      >
                        <div className="text-2xl mb-2">{template.icon}</div>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cycle Name *</Label>
                    <Input 
                      placeholder="e.g., 2025 Annual Review" 
                      value={newCycle.name} 
                      onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cycle Type</Label>
                    <Select value={newCycle.cycleType} onValueChange={(v: any) => setNewCycle({ ...newCycle, cycleType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual Review</SelectItem>
                        <SelectItem value="semi-annual">Mid-Year Review</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="probation">Probation</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input 
                      type="date" 
                      value={newCycle.startDate} 
                      onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input 
                      type="date" 
                      value={newCycle.endDate} 
                      onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe the purpose and focus areas of this review cycle..." 
                    value={newCycle.description}
                    onChange={(e) => setNewCycle({ ...newCycle, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Workflow Configuration */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Review Workflow</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-blue-600" />
                        <Label>Self Assessment</Label>
                      </div>
                      <Switch 
                        checked={newCycle.includeSelfAssessment}
                        onCheckedChange={(checked) => setNewCycle({ ...newCycle, includeSelfAssessment: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <Label>Manager Review</Label>
                      </div>
                      <Switch 
                        checked={newCycle.includeManagerReview}
                        onCheckedChange={(checked) => setNewCycle({ ...newCycle, includeManagerReview: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        <Label>360° Feedback</Label>
                      </div>
                      <Switch 
                        checked={newCycle.include360Feedback}
                        onCheckedChange={(checked) => setNewCycle({ ...newCycle, include360Feedback: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-orange-600" />
                        <Label>Calibration Session</Label>
                      </div>
                      <Switch 
                        checked={newCycle.includeCalibration}
                        onCheckedChange={(checked) => setNewCycle({ ...newCycle, includeCalibration: checked })}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Evaluation Criteria */}
              <TabsContent value="criteria" className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Rating Scale</Label>
                  <Select value={newCycle.ratingScale} onValueChange={(v) => setNewCycle({ ...newCycle, ratingScale: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-point">5-Point Scale (1-5)</SelectItem>
                      <SelectItem value="10-point">10-Point Scale (1-10)</SelectItem>
                      <SelectItem value="descriptive">Descriptive (Exceeds, Meets, Below)</SelectItem>
                      <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Competencies to Evaluate</Label>
                  <div className="space-y-2">
                    {competencies.map(comp => (
                      <div key={comp.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id={`comp-${comp.id}`}
                            checked={newCycle.selectedCompetencies.includes(comp.id)}
                            onCheckedChange={() => toggleArrayItem(
                              newCycle.selectedCompetencies, 
                              comp.id, 
                              (arr) => setNewCycle({ ...newCycle, selectedCompetencies: arr })
                            )}
                          />
                          <label htmlFor={`comp-${comp.id}`} className="font-medium">{comp.name}</label>
                        </div>
                        <Badge variant="secondary">{comp.weight}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    Educator-Specific Metrics
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Goal Progress</Label>
                        <p className="text-xs text-muted-foreground">Include goal completion %</p>
                      </div>
                      <Switch 
                        checked={newCycle.includeGoalProgress}
                        onCheckedChange={(checked) => setNewCycle({ ...newCycle, includeGoalProgress: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Classroom Observations</Label>
                        <p className="text-xs text-muted-foreground">Include observation scores</p>
                      </div>
                      <Switch 
                        checked={newCycle.includeClassroomObservation}
                        onCheckedChange={(checked) => setNewCycle({ ...newCycle, includeClassroomObservation: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Student Outcomes</Label>
                        <p className="text-xs text-muted-foreground">Link to student performance data</p>
                      </div>
                      <Switch 
                        checked={newCycle.includeStudentOutcomes}
                        onCheckedChange={(checked) => setNewCycle({ ...newCycle, includeStudentOutcomes: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>PD Completion</Label>
                        <p className="text-xs text-muted-foreground">Professional development hours</p>
                      </div>
                      <Switch 
                        checked={newCycle.includePDMetrics}
                        onCheckedChange={(checked) => setNewCycle({ ...newCycle, includePDMetrics: checked })}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Participants */}
              <TabsContent value="participants" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Target Departments</Label>
                  <p className="text-sm text-muted-foreground">Leave empty to include all departments</p>
                  <div className="grid grid-cols-3 gap-2">
                    {departments.map(dept => (
                      <div key={dept} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`dept-${dept}`}
                          checked={newCycle.targetDepartments.includes(dept)}
                          onCheckedChange={() => toggleArrayItem(
                            newCycle.targetDepartments, 
                            dept, 
                            (arr) => setNewCycle({ ...newCycle, targetDepartments: arr })
                          )}
                        />
                        <label htmlFor={`dept-${dept}`} className="text-sm">{dept}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Target Roles</Label>
                  <p className="text-sm text-muted-foreground">Leave empty to include all roles</p>
                  <div className="grid grid-cols-3 gap-2">
                    {roles.map(role => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`role-${role}`}
                          checked={newCycle.targetRoles.includes(role)}
                          onCheckedChange={() => toggleArrayItem(
                            newCycle.targetRoles, 
                            role, 
                            (arr) => setNewCycle({ ...newCycle, targetRoles: arr })
                          )}
                        />
                        <label htmlFor={`role-${role}`} className="text-sm">{role}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Exclusions</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Exclude Employees on Leave</Label>
                        <p className="text-sm text-muted-foreground">Skip employees currently on extended leave</p>
                      </div>
                      <Switch 
                        checked={newCycle.excludeOnLeave}
                        onCheckedChange={(checked) => setNewCycle({ ...newCycle, excludeOnLeave: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Exclude Probationary Employees</Label>
                        <p className="text-sm text-muted-foreground">Skip employees still in probation</p>
                      </div>
                      <Switch 
                        checked={newCycle.excludeProbation}
                        onCheckedChange={(checked) => setNewCycle({ ...newCycle, excludeProbation: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Minimum Tenure (Months)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[newCycle.minTenureMonths]}
                      onValueChange={(v) => setNewCycle({ ...newCycle, minTenureMonths: v[0] })}
                      max={24}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold w-24 text-center">{newCycle.minTenureMonths} months</span>
                  </div>
                </div>

                {/* Participant Summary */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Estimated Participants</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{getEstimatedParticipants()}</div>
                    <p className="text-sm text-muted-foreground mt-1">Based on current filters</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 4: Timeline & Reminders */}
              <TabsContent value="timeline" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Stage Durations</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {newCycle.includeSelfAssessment && (
                      <div className="space-y-2">
                        <Label>Self Assessment Period (Days)</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[newCycle.selfAssessmentDays]}
                            onValueChange={(v) => setNewCycle({ ...newCycle, selfAssessmentDays: v[0] })}
                            max={30}
                            step={1}
                            className="flex-1"
                          />
                          <span className="font-bold w-12 text-center">{newCycle.selfAssessmentDays}d</span>
                        </div>
                      </div>
                    )}
                    {newCycle.includeManagerReview && (
                      <div className="space-y-2">
                        <Label>Manager Review Period (Days)</Label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[newCycle.managerReviewDays]}
                            onValueChange={(v) => setNewCycle({ ...newCycle, managerReviewDays: v[0] })}
                            max={30}
                            step={1}
                            className="flex-1"
                          />
                          <span className="font-bold w-12 text-center">{newCycle.managerReviewDays}d</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {newCycle.includeCalibration && (
                  <div className="space-y-2">
                    <Label>Calibration Session Date</Label>
                    <Input 
                      type="date"
                      value={newCycle.calibrationDate}
                      onChange={(e) => setNewCycle({ ...newCycle, calibrationDate: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Reminder Settings
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Reminder Frequency</Label>
                      <Select value={newCycle.reminderFrequency} onValueChange={(v) => setNewCycle({ ...newCycle, reminderFrequency: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                          <SelectItem value="none">No Reminders</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Escalation After (Days Overdue)</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[newCycle.escalationDays]}
                          onValueChange={(v) => setNewCycle({ ...newCycle, escalationDays: v[0] })}
                          max={14}
                          step={1}
                          className="flex-1"
                        />
                        <span className="font-bold w-12 text-center">{newCycle.escalationDays}d</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="font-semibold">Require Final Approval</Label>
                    <p className="text-sm text-muted-foreground">HR must approve before finalizing reviews</p>
                  </div>
                  <Switch 
                    checked={newCycle.requireFinalApproval}
                    onCheckedChange={(checked) => setNewCycle({ ...newCycle, requireFinalApproval: checked })}
                  />
                </div>

                {/* Cycle Summary */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Cycle Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cycle Name:</span>
                        <span className="font-medium">{newCycle.name || "Not set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium capitalize">{newCycle.cycleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">
                          {newCycle.startDate && newCycle.endDate 
                            ? `${Math.ceil((new Date(newCycle.endDate).getTime() - new Date(newCycle.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                            : "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Participants:</span>
                        <span className="font-medium">~{getEstimatedParticipants()} employees</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Competencies:</span>
                        <span className="font-medium">{newCycle.selectedCompetencies.length} selected</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Workflow Steps:</span>
                        <span className="font-medium">
                          {[
                            newCycle.includeSelfAssessment && "Self",
                            newCycle.includeManagerReview && "Manager",
                            newCycle.include360Feedback && "360°",
                            newCycle.includeCalibration && "Calibration",
                          ].filter(Boolean).join(" → ")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <div className="flex items-center gap-2 mr-auto">
                <Button variant="ghost" size="sm" className="gap-1">
                  <Copy className="h-4 w-4" />
                  Copy from Previous
                </Button>
              </div>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <div className="flex gap-2">
                {activeTab !== "details" && (
                  <Button variant="outline" onClick={() => {
                    const tabs = ["details", "criteria", "participants", "timeline"];
                    const currentIdx = tabs.indexOf(activeTab);
                    if (currentIdx > 0) setActiveTab(tabs[currentIdx - 1]);
                  }}>
                    Previous
                  </Button>
                )}
                {activeTab !== "timeline" ? (
                  <Button onClick={() => {
                    const tabs = ["details", "criteria", "participants", "timeline"];
                    const currentIdx = tabs.indexOf(activeTab);
                    if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1]);
                  }}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={() => createCycle.mutate({ 
                      ...newCycle, 
                      startDate: new Date(newCycle.startDate), 
                      endDate: new Date(newCycle.endDate) 
                    })}
                    disabled={!newCycle.name || !newCycle.startDate || !newCycle.endDate}
                  >
                    Create Cycle
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{cycles?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Cycles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {cycles?.filter(c => c.status === 'active').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Active Cycles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">68</div>
            <p className="text-sm text-muted-foreground">Employees in Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">85%</div>
            <p className="text-sm text-muted-foreground">Avg. Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cycles?.map(cycle => (
          <Card key={cycle.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{cycle.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={cycle.status === 'active' ? 'default' : cycle.status === 'completed' ? 'secondary' : 'outline'}>
                  {cycle.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="gap-2 w-full"><Eye className="h-4 w-4" />View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
