import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Plus,
  Search,
  ArrowLeft,
  FileText,
  Clock,
  Users,
  Star,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  Play,
  Briefcase,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Settings,
  Target,
  Brain,
  Mic,
  Video,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Wand2,
  BookOpen,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Question {
  id: string;
  text: string;
  type: "behavioral" | "technical" | "situational" | "competency";
  competency: string;
  followUps: number;
  required: boolean;
  timeLimit?: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  jobPosition: string;
  department: string;
  duration: number;
  questions: Question[];
  competencies: string[];
  settings: {
    allowAudioResponses: boolean;
    allowVideoResponses: boolean;
    adaptiveDifficulty: boolean;
    generateFollowUps: boolean;
    aiPersonality: string;
  };
  status: "draft" | "active" | "archived";
  usageCount: number;
  avgScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// Demo data
const demoTemplates: Template[] = [
  {
    id: "1",
    name: "Senior Software Engineer Interview",
    description: "Comprehensive technical interview for senior engineering positions focusing on system design, coding practices, and leadership.",
    jobPosition: "Senior Software Engineer",
    department: "Engineering",
    duration: 45,
    questions: [
      { id: "q1", text: "Describe a complex system you designed. What were the key architectural decisions?", type: "technical", competency: "System Design", followUps: 3, required: true },
      { id: "q2", text: "Tell me about a time you mentored a junior developer through a challenging project.", type: "behavioral", competency: "Leadership", followUps: 2, required: true },
      { id: "q3", text: "How do you approach code reviews? What do you look for?", type: "technical", competency: "Code Quality", followUps: 2, required: true },
      { id: "q4", text: "Describe a situation where you had to make a trade-off between code quality and delivery speed.", type: "situational", competency: "Decision Making", followUps: 2, required: true },
      { id: "q5", text: "How do you stay current with technology trends?", type: "behavioral", competency: "Continuous Learning", followUps: 1, required: false },
    ],
    competencies: ["System Design", "Leadership", "Code Quality", "Decision Making", "Continuous Learning"],
    settings: {
      allowAudioResponses: true,
      allowVideoResponses: true,
      adaptiveDifficulty: true,
      generateFollowUps: true,
      aiPersonality: "professional",
    },
    status: "active",
    usageCount: 45,
    avgScore: 72,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "2",
    name: "Product Manager Behavioral",
    description: "Behavioral interview template focusing on product thinking, stakeholder management, and strategic decision making.",
    jobPosition: "Product Manager",
    department: "Product",
    duration: 30,
    questions: [
      { id: "q1", text: "Walk me through how you prioritize your product backlog.", type: "behavioral", competency: "Prioritization", followUps: 2, required: true },
      { id: "q2", text: "Describe a product launch that didn't go as planned. What did you learn?", type: "behavioral", competency: "Learning Agility", followUps: 3, required: true },
      { id: "q3", text: "How do you balance user needs with business objectives?", type: "situational", competency: "Strategic Thinking", followUps: 2, required: true },
    ],
    competencies: ["Prioritization", "Learning Agility", "Strategic Thinking", "Stakeholder Management"],
    settings: {
      allowAudioResponses: true,
      allowVideoResponses: false,
      adaptiveDifficulty: false,
      generateFollowUps: true,
      aiPersonality: "conversational",
    },
    status: "active",
    usageCount: 28,
    avgScore: 68,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-25"),
  },
  {
    id: "3",
    name: "Customer Success Representative",
    description: "Template for assessing customer service skills, problem-solving, and communication abilities.",
    jobPosition: "Customer Success Representative",
    department: "Customer Success",
    duration: 25,
    questions: [
      { id: "q1", text: "Tell me about a time you turned an unhappy customer into a satisfied one.", type: "behavioral", competency: "Customer Focus", followUps: 2, required: true },
      { id: "q2", text: "How do you handle multiple urgent customer requests simultaneously?", type: "situational", competency: "Time Management", followUps: 2, required: true },
    ],
    competencies: ["Customer Focus", "Time Management", "Communication", "Problem Solving"],
    settings: {
      allowAudioResponses: true,
      allowVideoResponses: true,
      adaptiveDifficulty: false,
      generateFollowUps: true,
      aiPersonality: "friendly",
    },
    status: "draft",
    usageCount: 0,
    avgScore: 0,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "4",
    name: "Sales Manager Leadership",
    description: "Leadership assessment for sales management positions focusing on team building and revenue strategy.",
    jobPosition: "Sales Manager",
    department: "Sales",
    duration: 40,
    questions: [
      { id: "q1", text: "Describe your approach to building and motivating a sales team.", type: "behavioral", competency: "Team Leadership", followUps: 3, required: true },
      { id: "q2", text: "How do you handle underperforming team members?", type: "situational", competency: "Performance Management", followUps: 2, required: true },
      { id: "q3", text: "Tell me about a time you exceeded your sales targets. What was your strategy?", type: "behavioral", competency: "Results Orientation", followUps: 2, required: true },
    ],
    competencies: ["Team Leadership", "Performance Management", "Results Orientation", "Strategic Planning"],
    settings: {
      allowAudioResponses: true,
      allowVideoResponses: true,
      adaptiveDifficulty: true,
      generateFollowUps: true,
      aiPersonality: "professional",
    },
    status: "archived",
    usageCount: 12,
    avgScore: 75,
    createdAt: new Date("2023-11-15"),
    updatedAt: new Date("2024-01-10"),
  },
];

const questionTypes = [
  { value: "behavioral", label: "Behavioral", icon: MessageSquare, color: "bg-blue-100 text-blue-700" },
  { value: "technical", label: "Technical", icon: Brain, color: "bg-purple-100 text-purple-700" },
  { value: "situational", label: "Situational", icon: Target, color: "bg-orange-100 text-orange-700" },
  { value: "competency", label: "Competency", icon: Star, color: "bg-green-100 text-green-700" },
];

const aiPersonalities = [
  { value: "professional", label: "Professional", description: "Formal and business-like" },
  { value: "conversational", label: "Conversational", description: "Friendly but focused" },
  { value: "friendly", label: "Friendly", description: "Warm and encouraging" },
  { value: "challenging", label: "Challenging", description: "Probing and thorough" },
];

export default function AIInterviewTemplates() {
  const [templates, setTemplates] = useState<Template[]>(demoTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    jobPosition: "",
    department: "",
    duration: 30,
    questions: [] as Question[],
    settings: {
      allowAudioResponses: true,
      allowVideoResponses: true,
      adaptiveDifficulty: true,
      generateFollowUps: true,
      aiPersonality: "professional",
    },
  });

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.jobPosition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || template.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || template.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = Array.from(new Set(templates.map((t) => t.department)));

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.status === "active").length,
    draft: templates.filter((t) => t.status === "draft").length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Active</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Draft</Badge>;
      case "archived":
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">Archived</Badge>;
      default:
        return null;
    }
  };

  const getQuestionTypeBadge = (type: string) => {
    const qType = questionTypes.find((qt) => qt.value === type);
    if (!qType) return null;
    const Icon = qType.icon;
    return (
      <Badge className={`${qType.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {qType.label}
      </Badge>
    );
  };

  const handleDuplicateTemplate = (template: Template) => {
    const duplicate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      status: "draft",
      usageCount: 0,
      avgScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTemplates([duplicate, ...templates]);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter((t) => t.id !== templateId));
  };

  const handleToggleStatus = (template: Template) => {
    const newStatus = template.status === "active" ? "draft" : "active";
    setTemplates(
      templates.map((t) =>
        t.id === template.id ? { ...t, status: newStatus, updatedAt: new Date() } : t
      )
    );
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      type: "behavioral",
      competency: "",
      followUps: 2,
      required: true,
    };
    setNewTemplate({
      ...newTemplate,
      questions: [...newTemplate.questions, newQuestion],
    });
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = [...newTemplate.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    setNewTemplate({ ...newTemplate, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    setNewTemplate({
      ...newTemplate,
      questions: newTemplate.questions.filter((_, i) => i !== index),
    });
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newTemplate.questions.length) return;
    const questions = [...newTemplate.questions];
    [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
    setNewTemplate({ ...newTemplate, questions });
  };

  const handleCreateTemplate = () => {
    const competencySet = newTemplate.questions.map((q) => q.competency).filter(Boolean);
    const uniqueCompetencies = competencySet.filter((v, i, a) => a.indexOf(v) === i);
    const template: Template = {
      id: Date.now().toString(),
      ...newTemplate,
      competencies: uniqueCompetencies,
      status: "draft",
      usageCount: 0,
      avgScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTemplates([template, ...templates]);
    setCreateDialogOpen(false);
    setNewTemplate({
      name: "",
      description: "",
      jobPosition: "",
      department: "",
      duration: 30,
      questions: [],
      settings: {
        allowAudioResponses: true,
        allowVideoResponses: true,
        adaptiveDifficulty: true,
        generateFollowUps: true,
        aiPersonality: "professional",
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/recruitment/ai-interview">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Interview Templates
            </h1>
            <p className="text-muted-foreground">Create and manage AI interview templates</p>
          </div>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Interview Template
              </DialogTitle>
              <DialogDescription>
                Design an AI-powered interview template with custom questions and settings
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basics" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basics">Basic Info</TabsTrigger>
                <TabsTrigger value="questions">Questions ({newTemplate.questions.length})</TabsTrigger>
                <TabsTrigger value="settings">AI Settings</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[500px] pr-4">
                <TabsContent value="basics" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Senior Developer Technical Interview"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobPosition">Job Position</Label>
                      <Input
                        id="jobPosition"
                        placeholder="e.g., Senior Software Engineer"
                        value={newTemplate.jobPosition}
                        onChange={(e) => setNewTemplate({ ...newTemplate, jobPosition: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={newTemplate.department}
                        onValueChange={(value) => setNewTemplate({ ...newTemplate, department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Customer Success">Customer Success</SelectItem>
                          <SelectItem value="Human Resources">Human Resources</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[newTemplate.duration]}
                          onValueChange={(value) => setNewTemplate({ ...newTemplate, duration: value[0] })}
                          min={15}
                          max={90}
                          step={5}
                          className="flex-1"
                        />
                        <span className="w-16 text-center font-medium">{newTemplate.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this template is designed to assess..."
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="questions" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Add questions that the AI will ask during the interview
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Wand2 className="h-4 w-4" />
                        AI Generate
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <BookOpen className="h-4 w-4" />
                        From Library
                      </Button>
                      <Button size="sm" onClick={addQuestion} className="gap-1">
                        <Plus className="h-4 w-4" />
                        Add Question
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {newTemplate.questions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === 0}
                              onClick={() => moveQuestion(index, "up")}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <GripVertical className="h-4 w-4 text-muted-foreground mx-auto" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === newTemplate.questions.length - 1}
                              onClick={() => moveQuestion(index, "down")}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">Q{index + 1}</span>
                              <Select
                                value={question.type}
                                onValueChange={(value: Question["type"]) => updateQuestion(index, { type: value })}
                              >
                                <SelectTrigger className="w-[140px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {questionTypes.map((qt) => (
                                    <SelectItem key={qt.value} value={qt.value}>
                                      <div className="flex items-center gap-2">
                                        <qt.icon className="h-3 w-3" />
                                        {qt.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex items-center gap-2 ml-auto">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant={question.required ? "default" : "outline"}
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => updateQuestion(index, { required: !question.required })}
                                      >
                                        {question.required ? (
                                          <Lock className="h-3 w-3" />
                                        ) : (
                                          <Unlock className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {question.required ? "Required question" : "Optional question"}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => removeQuestion(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <Textarea
                              placeholder="Enter your interview question..."
                              value={question.text}
                              onChange={(e) => updateQuestion(index, { text: e.target.value })}
                              rows={2}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Competency</Label>
                                <Input
                                  placeholder="e.g., Problem Solving"
                                  value={question.competency}
                                  onChange={(e) => updateQuestion(index, { competency: e.target.value })}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">AI Follow-ups</Label>
                                <Select
                                  value={question.followUps.toString()}
                                  onValueChange={(value) => updateQuestion(index, { followUps: parseInt(value) })}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">No follow-ups</SelectItem>
                                    <SelectItem value="1">1 follow-up</SelectItem>
                                    <SelectItem value="2">2 follow-ups</SelectItem>
                                    <SelectItem value="3">3 follow-ups</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {newTemplate.questions.length === 0 && (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="font-medium">No questions added yet</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start building your interview by adding questions
                      </p>
                      <Button onClick={addQuestion}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Question
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-6 mt-4">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Response Settings
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mic className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">Audio Responses</p>
                            <p className="text-xs text-muted-foreground">Allow candidates to respond via voice</p>
                          </div>
                        </div>
                        <Switch
                          checked={newTemplate.settings.allowAudioResponses}
                          onCheckedChange={(checked) =>
                            setNewTemplate({
                              ...newTemplate,
                              settings: { ...newTemplate.settings, allowAudioResponses: checked },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">Video Responses</p>
                            <p className="text-xs text-muted-foreground">Allow candidates to respond via video</p>
                          </div>
                        </div>
                        <Switch
                          checked={newTemplate.settings.allowVideoResponses}
                          onCheckedChange={(checked) =>
                            setNewTemplate({
                              ...newTemplate,
                              settings: { ...newTemplate.settings, allowVideoResponses: checked },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      AI Behavior
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Zap className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">Adaptive Difficulty</p>
                            <p className="text-xs text-muted-foreground">Adjust question difficulty based on responses</p>
                          </div>
                        </div>
                        <Switch
                          checked={newTemplate.settings.adaptiveDifficulty}
                          onCheckedChange={(checked) =>
                            setNewTemplate({
                              ...newTemplate,
                              settings: { ...newTemplate.settings, adaptiveDifficulty: checked },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">Generate Follow-ups</p>
                            <p className="text-xs text-muted-foreground">AI generates contextual follow-up questions</p>
                          </div>
                        </div>
                        <Switch
                          checked={newTemplate.settings.generateFollowUps}
                          onCheckedChange={(checked) =>
                            setNewTemplate({
                              ...newTemplate,
                              settings: { ...newTemplate.settings, generateFollowUps: checked },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      AI Personality
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {aiPersonalities.map((personality) => (
                        <div
                          key={personality.value}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            newTemplate.settings.aiPersonality === personality.value
                              ? "border-primary bg-primary/5"
                              : "hover:border-muted-foreground/50"
                          }`}
                          onClick={() =>
                            setNewTemplate({
                              ...newTemplate,
                              settings: { ...newTemplate.settings, aiPersonality: personality.value },
                            })
                          }
                        >
                          <p className="font-medium text-sm">{personality.label}</p>
                          <p className="text-xs text-muted-foreground">{personality.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTemplate}
                disabled={!newTemplate.name || !newTemplate.jobPosition || newTemplate.questions.length === 0}
              >
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsage}</p>
                <p className="text-sm text-muted-foreground">Total Usage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Table
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Briefcase className="h-3 w-3" />
                          {template.jobPosition}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditTemplate(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleStatus(template)}>
                            {template.status === "active" ? (
                              <>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Set as Draft
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {getStatusBadge(template.status)}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.competencies.slice(0, 3).map((comp) => (
                        <Badge key={comp} variant="secondary" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                      {template.competencies.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.competencies.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{template.questions.length}</p>
                        <p className="text-xs text-muted-foreground">Questions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{template.duration}m</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{template.usageCount}</p>
                        <p className="text-xs text-muted-foreground">Uses</p>
                      </div>
                    </div>
                    {template.status === "active" && (
                      <Button className="w-full gap-2" size="sm">
                        <Play className="h-4 w-4" />
                        Use Template
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead className="text-center">Duration</TableHead>
                <TableHead className="text-center">Usage</TableHead>
                <TableHead className="text-center">Avg Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.jobPosition}</TableCell>
                  <TableCell>{template.department}</TableCell>
                  <TableCell className="text-center">{template.questions.length}</TableCell>
                  <TableCell className="text-center">{template.duration}m</TableCell>
                  <TableCell className="text-center">{template.usageCount}</TableCell>
                  <TableCell className="text-center">
                    {template.avgScore > 0 ? `${template.avgScore}%` : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(template.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditTemplate(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle>{previewTemplate.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {previewTemplate.jobPosition}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {previewTemplate.duration} minutes
                  </span>
                  {getStatusBadge(previewTemplate.status)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{previewTemplate.description}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Questions ({previewTemplate.questions.length})</h4>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {previewTemplate.questions.map((q, idx) => (
                        <div key={q.id} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">Q{idx + 1}</span>
                            {getQuestionTypeBadge(q.type)}
                            {q.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                          </div>
                          <p className="text-sm">{q.text}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Competency: {q.competency} • {q.followUps} follow-up(s)
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <div>
                  <h4 className="font-medium mb-2">AI Settings</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.settings.allowAudioResponses && (
                      <Badge variant="secondary"><Mic className="h-3 w-3 mr-1" />Audio</Badge>
                    )}
                    {previewTemplate.settings.allowVideoResponses && (
                      <Badge variant="secondary"><Video className="h-3 w-3 mr-1" />Video</Badge>
                    )}
                    {previewTemplate.settings.adaptiveDifficulty && (
                      <Badge variant="secondary"><Zap className="h-3 w-3 mr-1" />Adaptive</Badge>
                    )}
                    {previewTemplate.settings.generateFollowUps && (
                      <Badge variant="secondary"><MessageSquare className="h-3 w-3 mr-1" />Follow-ups</Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      <Bot className="h-3 w-3 mr-1" />
                      {previewTemplate.settings.aiPersonality}
                    </Badge>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
                {previewTemplate.status === "active" && (
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || departmentFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first interview template to get started"}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
