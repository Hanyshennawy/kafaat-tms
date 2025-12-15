import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Plus, MessageSquare, Eye, FileText, Users, ListChecks, Settings, Sparkles, Clock, GripVertical, Trash2, Copy, ChevronUp, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Survey Templates
const surveyTemplates = [
  {
    id: "engagement-pulse",
    name: "Engagement Pulse",
    icon: "💓",
    description: "Quick weekly/monthly check-in on educator wellbeing",
    questions: 5,
    estimatedTime: "2-3 min",
    suggestedQuestions: [
      { text: "How satisfied are you with your work this week?", type: "rating" },
      { text: "Do you have the resources you need for effective teaching?", type: "rating" },
      { text: "How supported do you feel by leadership?", type: "rating" },
    ]
  },
  {
    id: "pd-feedback",
    name: "PD Feedback",
    icon: "📚",
    description: "Professional development session evaluation",
    questions: 8,
    estimatedTime: "5-7 min",
    suggestedQuestions: [
      { text: "How relevant was this training to your teaching practice?", type: "rating" },
      { text: "What was the most valuable takeaway?", type: "text" },
      { text: "Would you recommend this training to colleagues?", type: "nps" },
    ]
  },
  {
    id: "classroom-resources",
    name: "Classroom Resources",
    icon: "🎒",
    description: "Assess adequacy of teaching materials and facilities",
    questions: 10,
    estimatedTime: "5-8 min",
    suggestedQuestions: [
      { text: "Rate the quality of technology available in your classroom", type: "rating" },
      { text: "Do you have adequate teaching materials for your curriculum?", type: "choice" },
      { text: "What additional resources would improve your teaching?", type: "text" },
    ]
  },
  {
    id: "work-environment",
    name: "Work Environment",
    icon: "🏫",
    description: "School culture, collaboration, and workplace satisfaction",
    questions: 12,
    estimatedTime: "8-10 min",
    suggestedQuestions: [
      { text: "How would you rate the collaborative culture at your school?", type: "rating" },
      { text: "Do you feel respected by your colleagues?", type: "rating" },
      { text: "What would improve the work environment?", type: "text" },
    ]
  },
  {
    id: "leadership-effectiveness",
    name: "Leadership Effectiveness",
    icon: "👔",
    description: "Evaluate school leadership and administration",
    questions: 10,
    estimatedTime: "6-8 min",
    suggestedQuestions: [
      { text: "How effectively does leadership communicate with staff?", type: "rating" },
      { text: "Do you feel leadership supports your professional growth?", type: "rating" },
      { text: "What could leadership do better?", type: "text" },
    ]
  },
  {
    id: "blank",
    name: "Blank Survey",
    icon: "📝",
    description: "Start from scratch with a custom survey",
    questions: 0,
    estimatedTime: "Custom",
    suggestedQuestions: []
  }
];

// Question types
const questionTypes = [
  { value: "rating", label: "Rating Scale (1-10)", icon: "⭐" },
  { value: "nps", label: "NPS (0-10)", icon: "📊" },
  { value: "choice", label: "Multiple Choice", icon: "☑️" },
  { value: "text", label: "Open Text", icon: "✍️" },
  { value: "yesno", label: "Yes/No", icon: "✓✗" },
];

interface SurveyQuestion {
  id: string;
  text: string;
  type: string;
  required: boolean;
  options?: string[];
}

export default function Surveys() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Form state
  const [newSurvey, setNewSurvey] = useState({
    title: "",
    description: "",
    surveyType: "pulse" as const,
    // Audience
    targetDepartments: [] as string[],
    targetRoles: [] as string[],
    targetSchoolLevels: [] as string[],
    targetExperience: "all",
    isAnonymous: true,
    // Timing
    startDate: "",
    endDate: "",
    reminderFrequency: "weekly",
    // Settings
    showProgressBar: true,
    allowSaveProgress: true,
    sendConfirmation: true,
    shareResultsWithParticipants: false,
  });
  
  // Questions state
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("rating");
  
  const { data: surveys, refetch } = trpc.employeeEngagement.getAllSurveys.useQuery();
  const createSurvey = trpc.employeeEngagement.createSurvey.useMutation({
    onSuccess: () => {
      toast.success("Survey created successfully!");
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
  });

  const resetForm = () => {
    setNewSurvey({
      title: "",
      description: "",
      surveyType: "pulse",
      targetDepartments: [],
      targetRoles: [],
      targetSchoolLevels: [],
      targetExperience: "all",
      isAnonymous: true,
      startDate: "",
      endDate: "",
      reminderFrequency: "weekly",
      showProgressBar: true,
      allowSaveProgress: true,
      sendConfirmation: true,
      shareResultsWithParticipants: false,
    });
    setQuestions([]);
    setSelectedTemplate(null);
    setActiveTab("details");
  };

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = surveyTemplates.find(t => t.id === templateId);
    if (template && template.id !== "blank") {
      setNewSurvey(prev => ({
        ...prev,
        title: `${template.name} - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
        description: template.description,
      }));
      // Add suggested questions
      const templateQuestions = template.suggestedQuestions.map((q, idx) => ({
        id: `q-${Date.now()}-${idx}`,
        text: q.text,
        type: q.type,
        required: true,
      }));
      setQuestions(templateQuestions);
    }
  };

  const addQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: SurveyQuestion = {
      id: `q-${Date.now()}`,
      text: newQuestionText,
      type: newQuestionType,
      required: true,
    };
    setQuestions([...questions, newQ]);
    setNewQuestionText("");
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  const duplicateQuestion = (question: SurveyQuestion) => {
    const duplicate = { ...question, id: `q-${Date.now()}`, text: `${question.text} (copy)` };
    setQuestions([...questions, duplicate]);
  };

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const calculateEstimatedTime = () => {
    const baseTime = questions.length * 0.5; // 30 seconds per question
    const textQuestions = questions.filter(q => q.type === 'text').length;
    const additionalTime = textQuestions * 1; // Extra minute for text questions
    const total = Math.ceil(baseTime + additionalTime);
    return total < 1 ? "< 1 min" : `${total}-${total + 2} min`;
  };

  const getCompletionProgress = () => {
    let score = 0;
    if (newSurvey.title) score += 25;
    if (questions.length > 0) score += 25;
    if (newSurvey.startDate && newSurvey.endDate) score += 25;
    if (newSurvey.targetDepartments.length > 0 || newSurvey.targetRoles.length > 0) score += 25;
    return score;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-yellow-600" />
            Employee Surveys
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage employee engagement surveys</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Survey</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Create New Survey
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
                <TabsTrigger value="audience" className="gap-2">
                  <Users className="h-4 w-4" />
                  Audience
                </TabsTrigger>
                <TabsTrigger value="questions" className="gap-2">
                  <ListChecks className="h-4 w-4" />
                  Questions
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Survey Details */}
              <TabsContent value="details" className="space-y-6 mt-4">
                {/* Template Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Choose a Template
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {surveyTemplates.map(template => (
                      <div
                        key={template.id}
                        onClick={() => applyTemplate(template.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary hover:bg-accent/50 ${selectedTemplate === template.id ? 'border-primary bg-accent ring-2 ring-primary/20' : ''}`}
                      >
                        <div className="text-2xl mb-2">{template.icon}</div>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {template.estimatedTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Survey Title *</Label>
                    <Input 
                      placeholder="e.g., Q1 Engagement Survey" 
                      value={newSurvey.title} 
                      onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Survey Type</Label>
                    <Select value={newSurvey.surveyType} onValueChange={(v: any) => setNewSurvey({ ...newSurvey, surveyType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pulse">Pulse Survey</SelectItem>
                        <SelectItem value="quarterly">Quarterly Review</SelectItem>
                        <SelectItem value="annual">Annual Survey</SelectItem>
                        <SelectItem value="exit">Exit Survey</SelectItem>
                        <SelectItem value="onboarding">Onboarding Feedback</SelectItem>
                        <SelectItem value="event">Event/PD Feedback</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe the purpose of this survey and what you hope to learn..." 
                    value={newSurvey.description} 
                    onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input 
                      type="date" 
                      value={newSurvey.startDate}
                      onChange={(e) => setNewSurvey({ ...newSurvey, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input 
                      type="date" 
                      value={newSurvey.endDate}
                      onChange={(e) => setNewSurvey({ ...newSurvey, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Audience & Timing */}
              <TabsContent value="audience" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Target Departments</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Mathematics", "Science", "English", "Social Studies", "Arts", "Physical Education", "Special Education", "Administration", "Support Staff"].map(dept => (
                      <div key={dept} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`dept-${dept}`}
                          checked={newSurvey.targetDepartments.includes(dept)}
                          onCheckedChange={() => toggleArrayItem(
                            newSurvey.targetDepartments, 
                            dept, 
                            (arr) => setNewSurvey({ ...newSurvey, targetDepartments: arr })
                          )}
                        />
                        <label htmlFor={`dept-${dept}`} className="text-sm">{dept}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Target School Levels</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Elementary (K-5)", "Middle School (6-8)", "High School (9-12)", "All Levels"].map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`level-${level}`}
                          checked={newSurvey.targetSchoolLevels.includes(level)}
                          onCheckedChange={() => toggleArrayItem(
                            newSurvey.targetSchoolLevels, 
                            level, 
                            (arr) => setNewSurvey({ ...newSurvey, targetSchoolLevels: arr })
                          )}
                        />
                        <label htmlFor={`level-${level}`} className="text-sm">{level}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Target by Experience Level</Label>
                  <RadioGroup 
                    value={newSurvey.targetExperience} 
                    onValueChange={(v) => setNewSurvey({ ...newSurvey, targetExperience: v })}
                    className="grid grid-cols-4 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="exp-all" />
                      <Label htmlFor="exp-all" className="font-normal">All Educators</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="exp-new" />
                      <Label htmlFor="exp-new" className="font-normal">New (0-3 years)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mid" id="exp-mid" />
                      <Label htmlFor="exp-mid" className="font-normal">Mid-Career (4-10)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="veteran" id="exp-veteran" />
                      <Label htmlFor="exp-veteran" className="font-normal">Veteran (10+)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Target Roles</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Classroom Teacher", "Department Head", "Coordinator", "Assistant Principal", "Principal", "Counselor", "Instructional Coach", "Substitute Teacher", "Teaching Assistant"].map(role => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`role-${role}`}
                          checked={newSurvey.targetRoles.includes(role)}
                          onCheckedChange={() => toggleArrayItem(
                            newSurvey.targetRoles, 
                            role, 
                            (arr) => setNewSurvey({ ...newSurvey, targetRoles: arr })
                          )}
                        />
                        <label htmlFor={`role-${role}`} className="text-sm">{role}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="font-semibold">Anonymous Responses</Label>
                    <p className="text-sm text-muted-foreground">Respondent identities will be hidden</p>
                  </div>
                  <Switch 
                    checked={newSurvey.isAnonymous}
                    onCheckedChange={(checked) => setNewSurvey({ ...newSurvey, isAnonymous: checked })}
                  />
                </div>
              </TabsContent>

              {/* Tab 3: Questions */}
              <TabsContent value="questions" className="space-y-6 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Survey Questions</Label>
                    <p className="text-sm text-muted-foreground">
                      {questions.length} question{questions.length !== 1 ? 's' : ''} • Est. time: {calculateEstimatedTime()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Suggest Questions
                  </Button>
                </div>

                {/* Add Question Form */}
                <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                  <div className="flex gap-3">
                    <Input 
                      placeholder="Enter your question..." 
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
                    />
                    <Select value={newQuestionType} onValueChange={setNewQuestionType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.map(qt => (
                          <SelectItem key={qt.value} value={qt.value}>
                            <span className="flex items-center gap-2">
                              <span>{qt.icon}</span>
                              {qt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addQuestion} disabled={!newQuestionText.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-2">
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No questions added yet</p>
                      <p className="text-sm">Select a template or add questions manually</p>
                    </div>
                  ) : (
                    questions.map((q, idx) => (
                      <div key={q.id} className="flex items-center gap-2 p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors group">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <span className="text-sm font-medium text-muted-foreground w-6">{idx + 1}.</span>
                        <div className="flex-1">
                          <p className="text-sm">{q.text}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {questionTypes.find(qt => qt.value === q.type)?.icon} {questionTypes.find(qt => qt.value === q.type)?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveQuestion(idx, 'up')} disabled={idx === 0}>
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveQuestion(idx, 'down')} disabled={idx === questions.length - 1}>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateQuestion(q)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeQuestion(q.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Tab 4: Settings & Notifications */}
              <TabsContent value="settings" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Reminder Settings</Label>
                  <Select 
                    value={newSurvey.reminderFrequency} 
                    onValueChange={(v) => setNewSurvey({ ...newSurvey, reminderFrequency: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Reminders</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                      <SelectItem value="once">One Reminder Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Survey Experience</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Show Progress Bar</Label>
                        <p className="text-sm text-muted-foreground">Display completion progress to respondents</p>
                      </div>
                      <Switch 
                        checked={newSurvey.showProgressBar}
                        onCheckedChange={(checked) => setNewSurvey({ ...newSurvey, showProgressBar: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Allow Save & Continue</Label>
                        <p className="text-sm text-muted-foreground">Let respondents save progress and finish later</p>
                      </div>
                      <Switch 
                        checked={newSurvey.allowSaveProgress}
                        onCheckedChange={(checked) => setNewSurvey({ ...newSurvey, allowSaveProgress: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Notifications</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Send Confirmation Email</Label>
                        <p className="text-sm text-muted-foreground">Email respondents after they complete the survey</p>
                      </div>
                      <Switch 
                        checked={newSurvey.sendConfirmation}
                        onCheckedChange={(checked) => setNewSurvey({ ...newSurvey, sendConfirmation: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Share Results with Participants</Label>
                        <p className="text-sm text-muted-foreground">Allow respondents to see aggregate results</p>
                      </div>
                      <Switch 
                        checked={newSurvey.shareResultsWithParticipants}
                        onCheckedChange={(checked) => setNewSurvey({ ...newSurvey, shareResultsWithParticipants: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Survey Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="font-medium">{newSurvey.title || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="font-medium">{questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Time:</span>
                      <span className="font-medium">{calculateEstimatedTime()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Anonymous:</span>
                      <span className="font-medium">{newSurvey.isAnonymous ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target Audience:</span>
                      <span className="font-medium">
                        {newSurvey.targetDepartments.length > 0 
                          ? `${newSurvey.targetDepartments.length} dept(s)` 
                          : "All"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <div className="flex gap-2">
                {activeTab !== "details" && (
                  <Button variant="outline" onClick={() => {
                    const tabs = ["details", "audience", "questions", "settings"];
                    const currentIdx = tabs.indexOf(activeTab);
                    if (currentIdx > 0) setActiveTab(tabs[currentIdx - 1]);
                  }}>
                    Previous
                  </Button>
                )}
                {activeTab !== "settings" ? (
                  <Button onClick={() => {
                    const tabs = ["details", "audience", "questions", "settings"];
                    const currentIdx = tabs.indexOf(activeTab);
                    if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1]);
                  }}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={() => createSurvey.mutate({
                      ...newSurvey,
                      startDate: newSurvey.startDate ? new Date(newSurvey.startDate) : undefined,
                      endDate: newSurvey.endDate ? new Date(newSurvey.endDate) : undefined,
                    })}
                    disabled={!newSurvey.title || questions.length === 0}
                  >
                    Create Survey
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
            <div className="text-2xl font-bold">{surveys?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Surveys</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {surveys?.filter(s => s.status === 'active').length || 0}
            </div>
            <p className="text-sm text-muted-foreground">Active Surveys</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">85%</div>
            <p className="text-sm text-muted-foreground">Avg. Completion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">8.2</div>
            <p className="text-sm text-muted-foreground">Avg. Satisfaction Score</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {surveys?.map(survey => (
          <Card key={survey.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{survey.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{survey.description}</p>
                </div>
                <Badge variant={survey.status === 'active' ? 'default' : survey.status === 'completed' ? 'secondary' : 'outline'}>
                  {survey.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/engagement/surveys/${survey.id}`}>
                <Button variant="outline" size="sm" className="gap-2 w-full"><Eye className="h-4 w-4" />View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
