import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, Target, Lightbulb, CheckCircle2, AlertCircle, Clock, 
  TrendingUp, Users, BookOpen, Award, GraduationCap, Sparkles,
  ChevronRight, Calendar, Flag, Eye, Bell, Paperclip, Trash2,
  BarChart3, Star, Zap
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Goal categories for educators
const GOAL_CATEGORIES = [
  { value: "teaching_excellence", label: "Teaching Excellence", icon: GraduationCap, color: "text-blue-600" },
  { value: "student_outcomes", label: "Student Outcomes", icon: TrendingUp, color: "text-green-600" },
  { value: "professional_development", label: "Professional Development", icon: BookOpen, color: "text-purple-600" },
  { value: "leadership", label: "Leadership & Collaboration", icon: Users, color: "text-orange-600" },
  { value: "innovation", label: "Innovation & Technology", icon: Lightbulb, color: "text-yellow-600" },
  { value: "community", label: "Community Engagement", icon: Award, color: "text-teal-600" },
];

// Goal templates for quick start
const GOAL_TEMPLATES = [
  {
    title: "Improve Student Assessment Scores",
    description: "Increase average student assessment scores by 15% through differentiated instruction and targeted interventions.",
    category: "student_outcomes",
    measurementCriteria: "Compare pre and post assessment scores across all classes",
    milestones: ["Baseline assessment", "Mid-term review", "Final assessment comparison"]
  },
  {
    title: "Complete CPD Requirements",
    description: "Successfully complete 40 hours of professional development aligned with teaching standards.",
    category: "professional_development",
    measurementCriteria: "CPD hours logged and certificates obtained",
    milestones: ["10 hours completed", "25 hours completed", "40 hours completed"]
  },
  {
    title: "Implement New Teaching Strategy",
    description: "Integrate project-based learning into curriculum for at least 2 units per semester.",
    category: "teaching_excellence",
    measurementCriteria: "Lesson plans, student projects, and feedback surveys",
    milestones: ["Strategy research", "First unit implementation", "Second unit implementation", "Student feedback collection"]
  },
  {
    title: "Mentor New Teachers",
    description: "Provide structured mentorship to 2 new teachers throughout the academic year.",
    category: "leadership",
    measurementCriteria: "Mentoring logs, mentee feedback, and observed lesson improvements",
    milestones: ["Mentoring plan created", "Monthly check-ins established", "Mid-year review", "End-of-year evaluation"]
  },
];

// Initial state for new goal
const initialGoalState = {
  title: "",
  description: "",
  targetDate: "",
  category: "",
  priority: "medium",
  goalType: "individual",
  weight: 20,
  measurementCriteria: "",
  visibility: "manager",
  linkedCpd: false,
  reminderFrequency: "weekly",
  milestones: [""],
  subjectAlignment: "",
  gradeLevel: "",
  expectedImpact: "",
  initialProgress: 0,
};

export default function Goals() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(initialGoalState);
  const [activeTab, setActiveTab] = useState("details");
  const [showTemplates, setShowTemplates] = useState(true);
  
  const { data: goals, refetch } = trpc.performanceManagement.getGoals.useQuery({ employeeId: 1, cycleId: 1 });
  const createGoal = trpc.performanceManagement.createGoal.useMutation({
    onSuccess: () => {
      toast.success("Goal created successfully!");
      setIsCreateDialogOpen(false);
      setNewGoal(initialGoalState);
      setActiveTab("details");
      refetch();
    },
  });

  const applyTemplate = (template: typeof GOAL_TEMPLATES[0]) => {
    setNewGoal({
      ...newGoal,
      title: template.title,
      description: template.description,
      category: template.category,
      measurementCriteria: template.measurementCriteria,
      milestones: template.milestones,
    });
    setShowTemplates(false);
    toast.success("Template applied! Customize as needed.");
  };

  const addMilestone = () => {
    setNewGoal({ ...newGoal, milestones: [...newGoal.milestones, ""] });
  };

  const updateMilestone = (index: number, value: string) => {
    const updated = [...newGoal.milestones];
    updated[index] = value;
    setNewGoal({ ...newGoal, milestones: updated });
  };

  const removeMilestone = (index: number) => {
    const updated = newGoal.milestones.filter((_, i) => i !== index);
    setNewGoal({ ...newGoal, milestones: updated });
  };

  const handleCreate = () => {
    if (!newGoal.title.trim()) {
      toast.error("Please enter a goal title");
      return;
    }
    const goalTypeMap: Record<string, "individual" | "team" | "departmental" | "organizational"> = {
      "individual": "individual",
      "team": "team",
      "department": "departmental",
      "departmental": "departmental",
      "organizational": "organizational"
    };
    createGoal.mutate({ 
      employeeId: 1, 
      cycleId: 1, 
      title: newGoal.title, 
      goalType: goalTypeMap[newGoal.goalType] || "individual", 
      description: newGoal.description, 
      deadline: newGoal.targetDate ? new Date(newGoal.targetDate) : undefined 
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "text-green-600";
    if (progress >= 50) return "text-blue-600";
    if (progress >= 25) return "text-yellow-600";
    return "text-gray-600";
  };

  const getCategoryInfo = (categoryValue: string) => {
    return GOAL_CATEGORIES.find(c => c.value === categoryValue) || GOAL_CATEGORIES[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-indigo-600" />
            Goals
          </h1>
          <p className="text-muted-foreground mt-1">Set and track SMART goals for educator excellence</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setNewGoal(initialGoalState);
            setActiveTab("details");
            setShowTemplates(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Goal</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Create New SMART Goal
              </DialogTitle>
              <DialogDescription>
                Define specific, measurable, achievable, relevant, and time-bound goals
              </DialogDescription>
            </DialogHeader>

            {/* Goal Templates Section */}
            {showTemplates && (
              <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium text-sm">Quick Start Templates</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
                    Skip
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {GOAL_TEMPLATES.map((template, index) => {
                    const category = getCategoryInfo(template.category);
                    return (
                      <button
                        key={index}
                        onClick={() => applyTemplate(template)}
                        className="text-left p-3 rounded-lg border bg-white hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                      >
                        <div className="flex items-start gap-2">
                          <category.icon className={`h-4 w-4 mt-0.5 ${category.color}`} />
                          <div>
                            <p className="font-medium text-sm line-clamp-1">{template.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{template.description}</p>
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
                <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                <TabsTrigger value="measurement" className="text-xs">Measurement</TabsTrigger>
                <TabsTrigger value="educator" className="text-xs">Educator</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
              </TabsList>

              {/* Tab 1: Basic Details */}
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Goal Title <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    placeholder="e.g., Improve student reading comprehension by 20%" 
                    value={newGoal.title} 
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe the goal, context, and expected outcomes..." 
                    value={newGoal.description} 
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} 
                    rows={3} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className={`h-4 w-4 ${cat.color}`} />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Goal Type</Label>
                    <Select value={newGoal.goalType} onValueChange={(value) => setNewGoal({ ...newGoal, goalType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual Goal</SelectItem>
                        <SelectItem value="team">Team Goal</SelectItem>
                        <SelectItem value="department">Department Goal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Target Date
                    </Label>
                    <Input 
                      type="date" 
                      value={newGoal.targetDate} 
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Priority
                    </Label>
                    <Select value={newGoal.priority} onValueChange={(value) => setNewGoal({ ...newGoal, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            High Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            Medium Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Low Priority
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Weight in Performance Review</Label>
                    <span className="text-sm font-medium text-indigo-600">{newGoal.weight}%</span>
                  </div>
                  <Slider
                    value={[newGoal.weight]}
                    onValueChange={(value) => setNewGoal({ ...newGoal, weight: value[0] })}
                    min={5}
                    max={50}
                    step={5}
                    className="py-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    How much this goal counts toward your overall performance evaluation
                  </p>
                </div>
              </TabsContent>

              {/* Tab 2: Measurement & Milestones */}
              <TabsContent value="measurement" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Measurement Criteria
                  </Label>
                  <Textarea 
                    placeholder="How will success be measured? What metrics or evidence will demonstrate achievement?" 
                    value={newGoal.measurementCriteria} 
                    onChange={(e) => setNewGoal({ ...newGoal, measurementCriteria: e.target.value })} 
                    rows={3} 
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Key Milestones
                    </Label>
                    <Button variant="outline" size="sm" onClick={addMilestone}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Milestone
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newGoal.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <Input
                          placeholder={`Milestone ${index + 1}: e.g., Complete initial assessment`}
                          value={milestone}
                          onChange={(e) => updateMilestone(index, e.target.value)}
                          className="flex-1"
                        />
                        {newGoal.milestones.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeMilestone(index)} className="h-8 w-8 text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Initial Progress</Label>
                    <span className="text-sm font-medium">{newGoal.initialProgress}%</span>
                  </div>
                  <Slider
                    value={[newGoal.initialProgress]}
                    onValueChange={(value) => setNewGoal({ ...newGoal, initialProgress: value[0] })}
                    min={0}
                    max={100}
                    step={5}
                    className="py-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Set initial progress if work has already begun on this goal
                  </p>
                </div>
              </TabsContent>

              {/* Tab 3: Educator-Specific */}
              <TabsContent value="educator" className="space-y-4 mt-4">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-blue-900">Educator-Focused Goal Setting</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Connect your goal to teaching standards and student outcomes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject Alignment</Label>
                    <Select value={newGoal.subjectAlignment} onValueChange={(value) => setNewGoal({ ...newGoal, subjectAlignment: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English Language</SelectItem>
                        <SelectItem value="arabic">Arabic Language</SelectItem>
                        <SelectItem value="social_studies">Social Studies</SelectItem>
                        <SelectItem value="islamic_studies">Islamic Studies</SelectItem>
                        <SelectItem value="physical_education">Physical Education</SelectItem>
                        <SelectItem value="arts">Arts & Music</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Grade Level</Label>
                    <Select value={newGoal.gradeLevel} onValueChange={(value) => setNewGoal({ ...newGoal, gradeLevel: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="kg">Kindergarten</SelectItem>
                        <SelectItem value="elementary">Elementary (1-5)</SelectItem>
                        <SelectItem value="middle">Middle School (6-8)</SelectItem>
                        <SelectItem value="high">High School (9-12)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Expected Student Impact
                  </Label>
                  <Textarea 
                    placeholder="Describe how achieving this goal will positively impact student learning and outcomes..." 
                    value={newGoal.expectedImpact} 
                    onChange={(e) => setNewGoal({ ...newGoal, expectedImpact: e.target.value })} 
                    rows={3} 
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Link to CPD Records</p>
                      <p className="text-xs text-muted-foreground">Connect this goal to professional development hours</p>
                    </div>
                  </div>
                  <Switch 
                    checked={newGoal.linkedCpd} 
                    onCheckedChange={(checked) => setNewGoal({ ...newGoal, linkedCpd: checked })} 
                  />
                </div>
              </TabsContent>

              {/* Tab 4: Settings */}
              <TabsContent value="settings" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Visibility
                  </Label>
                  <Select value={newGoal.visibility} onValueChange={(value) => setNewGoal({ ...newGoal, visibility: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private - Only you can see</SelectItem>
                      <SelectItem value="manager">Manager Only - You and your supervisor</SelectItem>
                      <SelectItem value="team">Team - Visible to your department</SelectItem>
                      <SelectItem value="public">Public - Visible to organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Reminder Frequency
                  </Label>
                  <Select value={newGoal.reminderFrequency} onValueChange={(value) => setNewGoal({ ...newGoal, reminderFrequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Check-in</SelectItem>
                      <SelectItem value="weekly">Weekly Reminder</SelectItem>
                      <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                      <SelectItem value="monthly">Monthly Review</SelectItem>
                      <SelectItem value="none">No Reminders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <p className="font-medium text-sm">Goal Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{newGoal.category ? getCategoryInfo(newGoal.category).label : "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <span className="capitalize">{newGoal.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight:</span>
                      <span>{newGoal.weight}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Milestones:</span>
                      <span>{newGoal.milestones.filter(m => m.trim()).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CPD Linked:</span>
                      <span>{newGoal.linkedCpd ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visibility:</span>
                      <span className="capitalize">{newGoal.visibility}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createGoal.isPending} className="gap-2">
                {createGoal.isPending ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Create Goal
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{goals?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Goals</p>
              </div>
              <Target className="h-8 w-8 text-indigo-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{goals?.filter((g: any) => g.status === 'completed').length || 0}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{goals?.filter((g: any) => g.status === 'in_progress').length || 0}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <Clock className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{goals?.filter((g: any) => g.status === 'at_risk').length || 0}</p>
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid gap-4">
        {goals?.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Goals Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start by creating your first SMART goal to track your progress
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
        {goals?.map((goal: any) => {
          const progress = goal.progress || 0;
          return (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      {goal.goalType === 'team' && (
                        <Badge variant="outline" className="text-xs">Team</Badge>
                      )}
                    </div>
                    <CardDescription>{goal.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      goal.status === 'completed' ? 'default' :
                      goal.status === 'in_progress' ? 'secondary' :
                      goal.status === 'at_risk' ? 'destructive' : 'outline'
                    }>
                      {goal.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className={`font-medium ${getProgressColor(progress)}`}>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {goal.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Target: {new Date(goal.deadline).toLocaleDateString()}
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      View Details
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
