/**
 * ASSESSMENT BUILDER PAGE
 * 
 * Comprehensive UI for building assessments with:
 * - Drag-drop question arrangement
 * - Multiple question types support
 * - Preview mode
 * - Assessment configuration
 * - Publishing workflow
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, Plus, Save, Trash2, Edit, Copy, Eye, ChevronRight, Loader2, 
  Check, AlertCircle, GripVertical, Search, Filter, BarChart3, Clock,
  Users, Target, Sparkles, Settings, Play, Send, ArrowLeft, ArrowRight,
  ChevronUp, ChevronDown, X, Wand2, Download, Upload, RefreshCw, Layers
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ============================================================================
// TYPES
// ============================================================================

interface AssessmentQuestion {
  id: number;
  tempId?: string;
  questionType: string;
  questionText: string;
  scenario?: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  difficulty: string;
  dimension?: string;
  framework?: string;
  timeLimit?: number;
  points: number;
  order: number;
  isRequired: boolean;
}

interface QuestionOption {
  id: string;
  text: string;
  value?: number;
  isCorrect?: boolean;
  dimension?: string;
}

interface Assessment {
  id?: number;
  title: string;
  code: string;
  description: string;
  category: string;
  frameworkId?: number;
  aiConfigId?: number;
  totalDuration?: number;
  totalQuestions: number;
  passingScore?: number;
  showResults: boolean;
  showCorrectAnswers?: boolean;
  generateReport?: boolean;
  maxAttempts?: number;
  instructions: string;
  status: string;
  questions: AssessmentQuestion[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AssessmentBuilderPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Assessment Builder
          </h1>
          <p className="text-muted-foreground">
            Create and manage comprehensive assessments with multiple question types
          </p>
        </div>
      </div>

      {selectedAssessment ? (
        <AssessmentEditor
          assessment={selectedAssessment}
          onSave={(updated) => setSelectedAssessment(updated)}
          onBack={() => setSelectedAssessment(null)}
          isPreviewMode={isPreviewMode}
          setIsPreviewMode={setIsPreviewMode}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              All Assessments
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <AssessmentList onSelect={(a) => setSelectedAssessment(a)} />
          </TabsContent>

          <TabsContent value="create">
            <CreateAssessmentForm onCreated={(a) => {
              setSelectedAssessment(a);
              toast.success("Assessment created! Now add questions.");
            }} />
          </TabsContent>

          <TabsContent value="templates">
            <AssessmentTemplates />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// ============================================================================
// ASSESSMENT LIST
// ============================================================================

function AssessmentList({ onSelect }: { onSelect: (a: Assessment) => void }) {
  const { data, isLoading, refetch } = trpc.assessmentBuilder.getAllAssessments.useQuery({});
  const assessments = data?.assessments || [];
  const deleteMutation = trpc.assessmentBuilder.deleteAssessment.useMutation({
    onSuccess: () => refetch()
  });
  const duplicateMutation = trpc.assessmentBuilder.duplicateAssessment.useMutation({
    onSuccess: () => refetch()
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAssessments = assessments.filter((a: any) => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "psychometric": return "bg-purple-500/20 text-purple-500";
      case "competency": return "bg-blue-500/20 text-blue-500";
      case "cognitive": return "bg-green-500/20 text-green-500";
      case "leadership": return "bg-orange-500/20 text-orange-500";
      default: return "bg-gray-500/20 text-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAssessments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Assessments Found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter"
                : "Create your first assessment to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAssessments.map((assessment: any) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{assessment.title}</CardTitle>
                    <Badge className={getCategoryColor(assessment.category)}>
                      {assessment.category}
                    </Badge>
                    <Badge variant={assessment.status === "published" ? "default" : "secondary"}>
                      {assessment.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onSelect({
                      ...assessment,
                      questions: []
                    })}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => duplicateMutation.mutate({ 
                        id: assessment.id,
                        newTitle: `${assessment.title} (Copy)`,
                        newCode: `${assessment.code}_copy_${Date.now()}`
                      })}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteMutation.mutate({ id: assessment.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{assessment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{assessment.totalQuestions || 0} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{assessment.totalDuration || 0} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>Pass: {assessment.passingScore || 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{assessment.maxAttempts || 1} attempts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span>Code: {assessment.code}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CREATE ASSESSMENT FORM
// ============================================================================

function CreateAssessmentForm({ onCreated }: { onCreated: (a: Assessment) => void }) {
  const createMutation = trpc.assessmentBuilder.createAssessment.useMutation({
    onSuccess: (data) => {
      onCreated({
        ...formData,
        id: data.id,
        status: "draft",
        questions: []
      } as Assessment);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    category: "psychometric" as "psychometric" | "competency" | "cognitive" | "skills" | "behavioral" | "leadership" | "custom",
    totalDuration: 30,
    totalQuestions: 10,
    passingScore: 70,
    showResults: true,
    showCorrectAnswers: false,
    generateReport: true,
    maxAttempts: 1,
    instructions: ""
  });

  const categories = [
    { value: "psychometric", label: "Psychometric Assessment" },
    { value: "competency", label: "Competency Assessment" },
    { value: "cognitive", label: "Cognitive Test" },
    { value: "behavioral", label: "Behavioral Assessment" },
    { value: "leadership", label: "Leadership Assessment" },
    { value: "skills", label: "Technical Skills" },
    { value: "custom", label: "Custom Assessment" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate code from title if not provided
    const code = formData.code || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    createMutation.mutate({ ...formData, code });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Create New Assessment</CardTitle>
          <CardDescription>
            Define the basic settings for your assessment. You can add questions after creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Assessment Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Leadership Competency Assessment"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Assessment Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="e.g., LEAD_COMP_001 (auto-generated if empty)"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v: any) => setFormData(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Total Questions</Label>
              <Input
                type="number"
                value={formData.totalQuestions}
                onChange={(e) => setFormData(prev => ({ ...prev, totalQuestions: parseInt(e.target.value) || 1 }))}
                min={1}
                max={200}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose and scope of this assessment..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.totalDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, totalDuration: parseInt(e.target.value) || 0 }))}
                min={0}
                max={300}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Attempts</Label>
              <Input
                type="number"
                value={formData.maxAttempts}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 1 }))}
                min={1}
                max={10}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Passing Score (%)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.passingScore]}
                  onValueChange={([v]) => setFormData(prev => ({ ...prev, passingScore: v }))}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="w-12 text-center">{formData.passingScore}%</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="showResults"
                  checked={formData.showResults}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, showResults: v }))}
                />
                <Label htmlFor="showResults">Show Results to Candidates</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="generateReport"
                  checked={formData.generateReport}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, generateReport: v }))}
                />
                <Label htmlFor="generateReport">Generate Report</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="Instructions shown to candidates before starting the assessment..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={createMutation.isPending || !formData.title}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Assessment
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

// ============================================================================
// ASSESSMENT EDITOR
// ============================================================================

function AssessmentEditor({ 
  assessment, 
  onSave, 
  onBack, 
  isPreviewMode, 
  setIsPreviewMode 
}: { 
  assessment: Assessment;
  onSave: (a: Assessment) => void;
  onBack: () => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (v: boolean) => void;
}) {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>(assessment.questions || []);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const updateMutation = trpc.assessmentBuilder.updateAssessment.useMutation({
    onSuccess: () => {
      toast.success("Assessment saved!");
    }
  });

  const linkQuestionsMutation = trpc.assessmentBuilder.linkQuestionsToAssessment.useMutation({
    onSuccess: () => {
      toast.success("Questions linked to assessment");
    }
  });

  const publishMutation = trpc.assessmentBuilder.publishAssessment.useMutation({
    onSuccess: () => {
      toast.success("Assessment published!");
      onSave({ ...assessment, status: "published" });
    }
  });

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newQuestions = [...questions];
    const draggedQuestion = newQuestions[draggedItem];
    newQuestions.splice(draggedItem, 1);
    newQuestions.splice(index, 0, draggedQuestion);
    newQuestions.forEach((q, i) => q.order = i + 1);
    
    setQuestions(newQuestions);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    newQuestions.forEach((q, i) => q.order = i + 1);
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    newQuestions.forEach((q, i) => q.order = i + 1);
    setQuestions(newQuestions);
  };

  const addQuestion = (question: AssessmentQuestion) => {
    setQuestions(prev => [...prev, { ...question, order: prev.length + 1 }]);
    setShowAddQuestion(false);
  };

  if (isPreviewMode) {
    return (
      <AssessmentPreview
        assessment={{ ...assessment, questions }}
        onExit={() => setIsPreviewMode(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{assessment.title}</h2>
            <p className="text-muted-foreground">{assessment.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewMode(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            variant="outline"
            onClick={() => updateMutation.mutate({ 
              id: assessment.id!, 
              title: assessment.title
            })}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
          <Button 
            onClick={() => publishMutation.mutate({ id: assessment.id! })}
            disabled={publishMutation.isPending || questions.length === 0}
          >
            {publishMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{questions.length}</p>
              <p className="text-muted-foreground text-sm">Questions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{assessment.totalDuration || 0}</p>
              <p className="text-muted-foreground text-sm">Minutes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{assessment.passingScore || 0}%</p>
              <p className="text-muted-foreground text-sm">Pass Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{questions.reduce((sum, q) => sum + q.points, 0)}</p>
              <p className="text-muted-foreground text-sm">Total Points</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Management */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Questions List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Questions</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowAIGenerate(true)}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Generate
                </Button>
                <Button size="sm" onClick={() => setShowAddQuestion(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Questions Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add questions manually or generate them with AI
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAIGenerate(true)}>
                    <Wand2 className="h-4 w-4 mr-2" />
                    AI Generate
                  </Button>
                  <Button onClick={() => setShowAddQuestion(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Manually
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div
                    key={question.id || question.tempId || index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-start gap-2 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors ${
                      draggedItem === index ? 'opacity-50 border-primary' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1 cursor-grab">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{question.questionType.replace(/_/g, ' ')}</Badge>
                        <Badge variant="secondary">{question.difficulty}</Badge>
                        {question.dimension && <Badge>{question.dimension}</Badge>}
                      </div>
                      <p className="text-sm line-clamp-2">{question.questionText}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => moveQuestion(index, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => moveQuestion(index, "down")}
                        disabled={index === questions.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assessment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Status</Label>
                <Badge className="w-full justify-center py-2" variant={assessment.status === "published" ? "default" : "secondary"}>
                  {assessment.status.toUpperCase()}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Show Results</span>
                  <Switch checked={assessment.showResults} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Show Correct Answers</span>
                  <Switch checked={assessment.showCorrectAnswers} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Generate Report</span>
                  <Switch checked={assessment.generateReport} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(
                  questions.reduce((acc, q) => {
                    acc[q.questionType] = (acc[q.questionType] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Question Dialog */}
      <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
          </DialogHeader>
          <AddQuestionForm onAdd={addQuestion} onCancel={() => setShowAddQuestion(false)} />
        </DialogContent>
      </Dialog>

      {/* AI Generate Dialog */}
      <Dialog open={showAIGenerate} onOpenChange={setShowAIGenerate}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Questions with AI</DialogTitle>
          </DialogHeader>
          <AIGenerateQuestionsForm 
            category={assessment.category}
            onGenerated={(generated) => {
              setQuestions(prev => [
                ...prev,
                ...generated.map((q: any, i: number) => ({
                  ...q,
                  order: prev.length + i + 1,
                  tempId: `temp-${Date.now()}-${i}`
                }))
              ]);
              setShowAIGenerate(false);
              toast.success(`Added ${generated.length} questions!`);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// ADD QUESTION FORM
// ============================================================================

function AddQuestionForm({ onAdd, onCancel }: { onAdd: (q: AssessmentQuestion) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    questionType: "mcq",
    questionText: "",
    scenario: "",
    options: [
      { id: "A", text: "", isCorrect: false },
      { id: "B", text: "", isCorrect: false },
      { id: "C", text: "", isCorrect: false },
      { id: "D", text: "", isCorrect: false }
    ] as QuestionOption[],
    difficulty: "intermediate",
    dimension: "",
    points: 1,
    timeLimit: 0,
    isRequired: true
  });

  const questionTypes = [
    { value: "mcq", label: "Multiple Choice", hasOptions: true },
    { value: "true_false", label: "True/False", hasOptions: true },
    { value: "likert", label: "Likert Scale", hasOptions: true },
    { value: "rating_scale", label: "Rating Scale", hasOptions: false },
    { value: "scenario", label: "Scenario-Based", hasOptions: true },
    { value: "forced_choice", label: "Forced Choice", hasOptions: true },
    { value: "ranking", label: "Ranking", hasOptions: true },
    { value: "situational_judgment", label: "Situational Judgment", hasOptions: true },
    { value: "short_answer", label: "Short Answer", hasOptions: false },
    { value: "essay", label: "Essay", hasOptions: false },
    { value: "fill_blank", label: "Fill in the Blank", hasOptions: false }
  ];

  const currentType = questionTypes.find(t => t.value === formData.questionType);

  const addOption = () => {
    const nextId = String.fromCharCode(65 + formData.options.length);
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { id: nextId, text: "", isCorrect: false }]
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index).map((opt, i) => ({
        ...opt,
        id: String.fromCharCode(65 + i)
      }))
    }));
  };

  const updateOption = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index 
          ? { ...opt, [field]: value }
          : field === "isCorrect" && value ? { ...opt, isCorrect: false } : opt
      )
    }));
  };

  const handleSubmit = () => {
    if (!formData.questionText.trim()) return;
    
    onAdd({
      id: Date.now(),
      questionType: formData.questionType,
      questionText: formData.questionText,
      scenario: formData.scenario || undefined,
      options: currentType?.hasOptions ? formData.options.filter(o => o.text.trim()) : undefined,
      difficulty: formData.difficulty,
      dimension: formData.dimension || undefined,
      points: formData.points,
      timeLimit: formData.timeLimit || undefined,
      isRequired: formData.isRequired,
      order: 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Question Type</Label>
          <Select value={formData.questionType} onValueChange={(v) => setFormData(prev => ({ ...prev, questionType: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {questionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={formData.difficulty} onValueChange={(v) => setFormData(prev => ({ ...prev, difficulty: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(formData.questionType === "scenario" || formData.questionType === "situational_judgment") && (
        <div className="space-y-2">
          <Label>Scenario/Context</Label>
          <Textarea
            value={formData.scenario}
            onChange={(e) => setFormData(prev => ({ ...prev, scenario: e.target.value }))}
            placeholder="Describe the scenario or context for this question..."
            className="min-h-[100px]"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Question Text</Label>
        <Textarea
          value={formData.questionText}
          onChange={(e) => setFormData(prev => ({ ...prev, questionText: e.target.value }))}
          placeholder="Enter your question..."
          className="min-h-[100px]"
          required
        />
      </div>

      {currentType?.hasOptions && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              <Plus className="h-4 w-4 mr-1" />
              Add Option
            </Button>
          </div>
          {formData.options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <span className="w-6 text-center font-medium">{option.id}</span>
              <Input
                value={option.text}
                onChange={(e) => updateOption(index, "text", e.target.value)}
                placeholder={`Option ${option.id}`}
                className="flex-1"
              />
              {formData.questionType === "mcq" && (
                <div className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={option.isCorrect}
                    onChange={() => updateOption(index, "isCorrect", true)}
                    className="h-4 w-4"
                  />
                  <span className="text-xs text-muted-foreground">Correct</span>
                </div>
              )}
              {formData.options.length > 2 && (
                <Button variant="ghost" size="icon" onClick={() => removeOption(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Dimension/Trait</Label>
          <Input
            value={formData.dimension}
            onChange={(e) => setFormData(prev => ({ ...prev, dimension: e.target.value }))}
            placeholder="e.g., Openness"
          />
        </div>
        <div className="space-y-2">
          <Label>Points</Label>
          <Input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
            min={1}
            max={100}
          />
        </div>
        <div className="space-y-2">
          <Label>Time Limit (seconds, 0 = none)</Label>
          <Input
            type="number"
            value={formData.timeLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
            min={0}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!formData.questionText.trim()}>Add Question</Button>
      </DialogFooter>
    </div>
  );
}

// ============================================================================
// AI GENERATE QUESTIONS FORM
// ============================================================================

function AIGenerateQuestionsForm({ 
  category,
  onGenerated 
}: { 
  category: string;
  onGenerated: (questions: any[]) => void;
}) {
  const [config, setConfig] = useState({
    category: category,
    frameworkCode: "big_five",
    questionTypes: ["scenario", "forced_choice", "likert"],
    count: 10,
    difficulty: "mixed",
    includeValidityChecks: true,
    includeAntiFaking: true
  });

  const generateMutation = trpc.aiConfig.generateQuestions.useMutation({
    onSuccess: (data) => {
      onGenerated(data.questions);
    }
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Number of Questions</Label>
          <Input
            type="number"
            value={config.count}
            onChange={(e) => setConfig(prev => ({ ...prev, count: parseInt(e.target.value) || 5 }))}
            min={1}
            max={50}
          />
        </div>
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select value={config.difficulty} onValueChange={(v) => setConfig(prev => ({ ...prev, difficulty: v }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={config.includeAntiFaking}
            onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeAntiFaking: v }))}
          />
          <Label>Anti-faking measures</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={config.includeValidityChecks}
            onCheckedChange={(v) => setConfig(prev => ({ ...prev, includeValidityChecks: v }))}
          />
          <Label>Validity checks</Label>
        </div>
      </div>

      <DialogFooter>
        <Button 
          onClick={() => generateMutation.mutate(config as any)}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate {config.count} Questions
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}

// ============================================================================
// ASSESSMENT PREVIEW
// ============================================================================

function AssessmentPreview({ assessment, onExit }: { assessment: Assessment; onExit: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});

  const currentQuestion = assessment.questions[currentIndex];
  const progress = ((currentIndex + 1) / assessment.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onExit}>
          <X className="h-4 w-4 mr-2" />
          Exit Preview
        </Button>
        <Badge variant="outline">Preview Mode</Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>{assessment.title}</CardTitle>
            <span className="text-muted-foreground">
              Question {currentIndex + 1} of {assessment.questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestion ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{currentQuestion.questionType.replace(/_/g, ' ')}</Badge>
                <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
                {currentQuestion.points > 1 && <Badge>{currentQuestion.points} pts</Badge>}
              </div>

              {currentQuestion.scenario && (
                <div className="p-4 bg-muted rounded-lg italic">
                  {currentQuestion.scenario}
                </div>
              )}

              <p className="text-lg font-medium">{currentQuestion.questionText}</p>

              {currentQuestion.options && currentQuestion.options.length > 0 && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: option.id }))}
                      className={`w-full p-4 text-left border rounded-lg transition-colors ${
                        answers[currentQuestion.id] === option.id 
                          ? 'border-primary bg-primary/10' 
                          : 'hover:bg-accent'
                      }`}
                    >
                      <span className="font-medium mr-2">{option.id}.</span>
                      {option.text}
                    </button>
                  ))}
                </div>
              )}

              {!currentQuestion.options && (
                <Textarea placeholder="Type your answer here..." className="min-h-[150px]" />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No questions in this assessment</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={() => setCurrentIndex(i => Math.min(assessment.questions.length - 1, i + 1))}
            disabled={currentIndex >= assessment.questions.length - 1}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// ============================================================================
// ASSESSMENT TEMPLATES
// ============================================================================

function AssessmentTemplates() {
  const templates = [
    {
      id: 1,
      name: "Big Five Personality Assessment",
      description: "Comprehensive personality assessment using the OCEAN model",
      category: "psychometric",
      questionCount: 50,
      estimatedTime: 20
    },
    {
      id: 2,
      name: "Leadership Competency Evaluation",
      description: "Assess leadership capabilities across multiple dimensions",
      category: "leadership",
      questionCount: 30,
      estimatedTime: 25
    },
    {
      id: 3,
      name: "Emotional Intelligence Assessment",
      description: "Measure EQ across self-awareness, empathy, and social skills",
      category: "psychometric",
      questionCount: 40,
      estimatedTime: 15
    },
    {
      id: 4,
      name: "Teacher Competency Framework",
      description: "Based on UAE National Educators' Competency Framework",
      category: "competency",
      questionCount: 60,
      estimatedTime: 45
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Start with a pre-built template and customize it to your needs
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge>{template.category}</Badge>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {template.questionCount} questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  ~{template.estimatedTime} min
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Use Template
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
