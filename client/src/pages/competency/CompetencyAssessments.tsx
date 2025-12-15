import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  ClipboardCheck, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BookOpen,
  Award,
  BarChart3,
  FileText,
  RefreshCw,
  Brain,
  GraduationCap,
  Users,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  AlertCircle,
  Star
} from "lucide-react";

// Types
interface CompetencyDomain {
  id: string;
  name: string;
  description: string;
  competencies: Competency[];
}

interface Competency {
  id: string;
  name: string;
  description: string;
  indicators: string[];
}

interface AssessmentQuestion {
  id: string;
  competencyId: string;
  competencyName: string;
  domainName: string;
  question: string;
  behavioralIndicator: string;
  aiGenerated: boolean;
}

interface AssessmentResponse {
  questionId: string;
  rating: number;
  notes?: string;
}

interface AssessmentResult {
  id: string;
  assessmentType: string;
  jobTitle: string;
  completedAt: string;
  overallScore: number;
  domainScores: { domain: string; score: number; level: string }[];
  strengths: string[];
  developmentAreas: string[];
  recommendations: { title: string; description: string; priority: 'high' | 'medium' | 'low' }[];
}

interface AvailableAssessment {
  id: string;
  title: string;
  description: string;
  jobTitle: string;
  framework: string;
  questionCount: number;
  estimatedTime: string;
  dueDate?: string;
  status: 'available' | 'in_progress' | 'completed';
}

// Rating scale labels (1-5)
const ratingLabels: Record<number, { label: string; description: string; color: string }> = {
  1: { label: "Never", description: "I never demonstrate this behavior", color: "text-red-600" },
  2: { label: "Rarely", description: "I rarely demonstrate this behavior", color: "text-orange-600" },
  3: { label: "Sometimes", description: "I sometimes demonstrate this behavior", color: "text-yellow-600" },
  4: { label: "Often", description: "I often demonstrate this behavior", color: "text-blue-600" },
  5: { label: "Always", description: "I consistently demonstrate this behavior", color: "text-green-600" }
};

// Demo data - ACI Competency Framework for Educators
const aciFramework: CompetencyDomain[] = [
  {
    id: "teaching-learning",
    name: "Teaching & Learning",
    description: "Core competencies related to instructional practices and student learning",
    competencies: [
      {
        id: "lesson-planning",
        name: "Lesson Planning & Curriculum Design",
        description: "Ability to design effective, standards-aligned lesson plans",
        indicators: [
          "Develops clear learning objectives aligned with curriculum standards",
          "Creates differentiated instruction to meet diverse learner needs",
          "Integrates formative assessment strategies into lesson design",
          "Uses data to inform instructional planning"
        ]
      },
      {
        id: "instructional-delivery",
        name: "Instructional Delivery",
        description: "Effective delivery of instruction using varied methodologies",
        indicators: [
          "Uses multiple teaching strategies to engage all learners",
          "Effectively manages instructional time",
          "Provides clear explanations and demonstrations",
          "Adapts instruction based on student responses"
        ]
      },
      {
        id: "assessment-feedback",
        name: "Assessment & Feedback",
        description: "Using assessment to monitor and improve student learning",
        indicators: [
          "Designs valid and reliable assessments",
          "Provides timely and constructive feedback",
          "Uses assessment data to adjust instruction",
          "Involves students in self-assessment"
        ]
      }
    ]
  },
  {
    id: "student-support",
    name: "Student Support & Wellbeing",
    description: "Competencies related to supporting student development and wellbeing",
    competencies: [
      {
        id: "inclusive-education",
        name: "Inclusive Education",
        description: "Creating inclusive learning environments for all students",
        indicators: [
          "Identifies and addresses diverse learning needs",
          "Implements accommodations and modifications",
          "Creates culturally responsive learning experiences",
          "Promotes equity and access for all students"
        ]
      },
      {
        id: "social-emotional",
        name: "Social-Emotional Learning",
        description: "Supporting students' social and emotional development",
        indicators: [
          "Creates a safe and supportive classroom environment",
          "Teaches social-emotional skills explicitly",
          "Recognizes signs of student distress",
          "Builds positive relationships with students"
        ]
      }
    ]
  },
  {
    id: "professional-growth",
    name: "Professional Growth & Leadership",
    description: "Competencies related to professional development and leadership",
    competencies: [
      {
        id: "continuous-learning",
        name: "Continuous Professional Learning",
        description: "Commitment to ongoing professional development",
        indicators: [
          "Reflects on teaching practice regularly",
          "Seeks feedback from colleagues and supervisors",
          "Engages in professional learning communities",
          "Applies new knowledge to improve practice"
        ]
      },
      {
        id: "collaboration",
        name: "Collaboration & Communication",
        description: "Effective collaboration with colleagues, parents, and community",
        indicators: [
          "Communicates effectively with parents and guardians",
          "Collaborates with colleagues on curriculum and instruction",
          "Participates in school improvement initiatives",
          "Builds partnerships with community stakeholders"
        ]
      }
    ]
  },
  {
    id: "technology-innovation",
    name: "Technology & Innovation",
    description: "Competencies related to educational technology and innovation",
    competencies: [
      {
        id: "digital-literacy",
        name: "Digital Literacy & Technology Integration",
        description: "Effective use of technology to enhance learning",
        indicators: [
          "Integrates technology meaningfully into instruction",
          "Teaches students digital citizenship",
          "Uses technology for assessment and feedback",
          "Explores innovative teaching approaches"
        ]
      }
    ]
  }
];

// Demo job titles for educators
const educatorJobTitles = [
  { id: "teacher", title: "Classroom Teacher", description: "Primary or secondary classroom teacher" },
  { id: "lead-teacher", title: "Lead Teacher", description: "Experienced teacher with leadership responsibilities" },
  { id: "department-head", title: "Department Head", description: "Head of academic department" },
  { id: "curriculum-coordinator", title: "Curriculum Coordinator", description: "Coordinates curriculum development" },
  { id: "special-ed", title: "Special Education Teacher", description: "Specialized support teacher" },
  { id: "instructional-coach", title: "Instructional Coach", description: "Supports teacher development" }
];

// Demo available assessments
const demoAvailableAssessments: AvailableAssessment[] = [
  {
    id: "assessment-1",
    title: "ACI Annual Competency Assessment",
    description: "Comprehensive annual assessment covering all ACI competency domains",
    jobTitle: "Classroom Teacher",
    framework: "ACI Educator Framework",
    questionCount: 32,
    estimatedTime: "45-60 minutes",
    dueDate: "2025-02-15",
    status: "available"
  },
  {
    id: "assessment-2",
    title: "Teaching & Learning Self-Assessment",
    description: "Focused assessment on core instructional competencies",
    jobTitle: "Classroom Teacher",
    framework: "ACI Educator Framework",
    questionCount: 16,
    estimatedTime: "20-25 minutes",
    status: "available"
  },
  {
    id: "assessment-3",
    title: "Leadership Readiness Assessment",
    description: "Assessment for teachers considering leadership roles",
    jobTitle: "Lead Teacher",
    framework: "ACI Leadership Framework",
    questionCount: 24,
    estimatedTime: "30-40 minutes",
    status: "in_progress"
  }
];

// Demo completed assessments
const demoCompletedResults: AssessmentResult[] = [
  {
    id: "result-1",
    assessmentType: "ACI Annual Competency Assessment",
    jobTitle: "Classroom Teacher",
    completedAt: "2024-12-01",
    overallScore: 3.8,
    domainScores: [
      { domain: "Teaching & Learning", score: 4.2, level: "Proficient" },
      { domain: "Student Support & Wellbeing", score: 3.9, level: "Proficient" },
      { domain: "Professional Growth & Leadership", score: 3.5, level: "Developing" },
      { domain: "Technology & Innovation", score: 3.6, level: "Developing" }
    ],
    strengths: [
      "Strong lesson planning and curriculum design skills",
      "Effective instructional delivery with varied methodologies",
      "Excellent student rapport and classroom management"
    ],
    developmentAreas: [
      "Technology integration in instruction",
      "Data-driven decision making",
      "Leadership and mentoring skills"
    ],
    recommendations: [
      {
        title: "Complete Digital Learning Certificate",
        description: "Enroll in the EdTech Integration certification program to enhance technology skills",
        priority: "high"
      },
      {
        title: "Join Professional Learning Community",
        description: "Participate in the school's data analysis PLC to improve data-driven practices",
        priority: "medium"
      },
      {
        title: "Mentor a New Teacher",
        description: "Take on a mentoring role to develop leadership competencies",
        priority: "low"
      }
    ]
  }
];

export default function CompetencyAssessments() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAssessment, setSelectedAssessment] = useState<AvailableAssessment | null>(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [isAssessmentActive, setIsAssessmentActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");
  const [customContext, setCustomContext] = useState("");
  const [showStartDialog, setShowStartDialog] = useState(false);

  // Generate AI-powered questions based on competency framework and job description
  const generateQuestions = async () => {
    setIsGeneratingQuestions(true);
    
    // Simulate AI question generation based on framework and job description
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const questions: AssessmentQuestion[] = [];
    const job = educatorJobTitles.find(j => j.id === selectedJobTitle);
    
    // Generate questions for each competency domain
    aciFramework.forEach(domain => {
      domain.competencies.forEach(competency => {
        competency.indicators.forEach((indicator, idx) => {
          // Generate contextual question based on indicator and job title
          const question = generateQuestionFromIndicator(indicator, competency.name, domain.name, job?.title || "Educator");
          questions.push({
            id: `q-${domain.id}-${competency.id}-${idx}`,
            competencyId: competency.id,
            competencyName: competency.name,
            domainName: domain.name,
            question: question,
            behavioralIndicator: indicator,
            aiGenerated: true
          });
        });
      });
    });
    
    setGeneratedQuestions(questions);
    setIsGeneratingQuestions(false);
    toast.success(`Generated ${questions.length} AI-powered assessment questions`);
  };

  // Generate question from behavioral indicator (simulated AI)
  const generateQuestionFromIndicator = (indicator: string, competency: string, domain: string, jobTitle: string): string => {
    const questionTemplates = [
      `In your role as ${jobTitle}, how frequently do you "${indicator.toLowerCase()}"?`,
      `Considering your responsibilities as ${jobTitle}, rate how often you "${indicator.toLowerCase()}"`,
      `As a ${jobTitle} working in ${domain}, how consistently do you "${indicator.toLowerCase()}"?`,
      `Reflect on your practice as ${jobTitle}: How often do you "${indicator.toLowerCase()}"?`
    ];
    return questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
  };

  // Start the assessment
  const startAssessment = async () => {
    if (!selectedJobTitle) {
      toast.error("Please select your job title");
      return;
    }
    
    await generateQuestions();
    setShowStartDialog(false);
    setIsAssessmentActive(true);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setActiveTab("take-assessment");
  };

  // Handle response to a question
  const handleResponse = (rating: number) => {
    const question = generatedQuestions[currentQuestionIndex];
    const existingIndex = responses.findIndex(r => r.questionId === question.id);
    
    if (existingIndex >= 0) {
      const updated = [...responses];
      updated[existingIndex] = { questionId: question.id, rating };
      setResponses(updated);
    } else {
      setResponses([...responses, { questionId: question.id, rating }]);
    }
  };

  // Get current response for a question
  const getCurrentResponse = (): number | null => {
    const question = generatedQuestions[currentQuestionIndex];
    const response = responses.find(r => r.questionId === question?.id);
    return response?.rating || null;
  };

  // Navigate questions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Complete assessment and generate results
  const completeAssessment = () => {
    // Calculate scores by domain
    const domainScores: Record<string, { total: number; count: number }> = {};
    
    generatedQuestions.forEach(q => {
      const response = responses.find(r => r.questionId === q.id);
      if (response) {
        if (!domainScores[q.domainName]) {
          domainScores[q.domainName] = { total: 0, count: 0 };
        }
        domainScores[q.domainName].total += response.rating;
        domainScores[q.domainName].count += 1;
      }
    });

    const domainResults = Object.entries(domainScores).map(([domain, data]) => {
      const score = data.total / data.count;
      let level = "Beginning";
      if (score >= 4.5) level = "Expert";
      else if (score >= 3.5) level = "Proficient";
      else if (score >= 2.5) level = "Developing";
      else if (score >= 1.5) level = "Emerging";
      
      return { domain, score: Math.round(score * 10) / 10, level };
    });

    const overallScore = domainResults.reduce((sum, d) => sum + d.score, 0) / domainResults.length;

    // Generate AI recommendations based on scores
    const strengths: string[] = [];
    const developmentAreas: string[] = [];
    const recommendations: { title: string; description: string; priority: 'high' | 'medium' | 'low' }[] = [];

    domainResults.forEach(d => {
      if (d.score >= 4) {
        strengths.push(`Strong performance in ${d.domain}`);
      } else if (d.score < 3) {
        developmentAreas.push(`${d.domain} requires focused development`);
        recommendations.push({
          title: `Develop ${d.domain} Skills`,
          description: `Consider professional development opportunities focused on ${d.domain.toLowerCase()} competencies.`,
          priority: d.score < 2 ? 'high' : 'medium'
        });
      }
    });

    const result: AssessmentResult = {
      id: `result-${Date.now()}`,
      assessmentType: selectedAssessment?.title || "ACI Competency Assessment",
      jobTitle: educatorJobTitles.find(j => j.id === selectedJobTitle)?.title || "Educator",
      completedAt: new Date().toISOString().split('T')[0],
      overallScore: Math.round(overallScore * 10) / 10,
      domainScores: domainResults,
      strengths,
      developmentAreas,
      recommendations
    };

    setAssessmentResults(result);
    setIsAssessmentActive(false);
    setShowResults(true);
    setActiveTab("results");
    toast.success("Assessment completed! View your results and recommendations.");
  };

  // Calculate progress percentage
  const progressPercentage = generatedQuestions.length > 0 
    ? (responses.length / generatedQuestions.length) * 100 
    : 0;

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 3.5) return "text-blue-600";
    if (score >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  // Get trend icon
  const getTrendIcon = (score: number, previousScore?: number) => {
    if (!previousScore) return <Minus className="h-4 w-4 text-gray-400" />;
    if (score > previousScore) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score < previousScore) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            Competency Assessments
          </h1>
          <p className="text-muted-foreground">
            AI-powered competency assessments for educators based on the ACI Framework
          </p>
        </div>
        <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Start New Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Start AI-Powered Assessment
              </DialogTitle>
              <DialogDescription>
                The AI will generate personalized competency questions based on your role and the ACI Framework
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="job-title">Select Your Role</Label>
                <Select value={selectedJobTitle} onValueChange={setSelectedJobTitle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your job title" />
                  </SelectTrigger>
                  <SelectContent>
                    {educatorJobTitles.map(job => (
                      <SelectItem key={job.id} value={job.id}>
                        <div>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-xs text-muted-foreground">{job.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Additional Context (Optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Add any specific context about your role, subjects taught, grade levels, etc. The AI will use this to generate more relevant questions."
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI Question Generation
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Questions based on ACI Competency Framework</li>
                  <li>• Tailored to your specific job role</li>
                  <li>• 5-point rating scale (1=Never to 5=Always)</li>
                  <li>• Behavioral indicators for each competency</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStartDialog(false)}>
                Cancel
              </Button>
              <Button onClick={startAssessment} disabled={!selectedJobTitle || isGeneratingQuestions}>
                {isGeneratingQuestions ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate & Start
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="available" className="gap-2">
            <FileText className="h-4 w-4" />
            Available Assessments
          </TabsTrigger>
          <TabsTrigger value="take-assessment" className="gap-2" disabled={!isAssessmentActive}>
            <ClipboardCheck className="h-4 w-4" />
            Take Assessment
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-2">
            <Award className="h-4 w-4" />
            My Results
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Assessments Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {demoAvailableAssessments.filter(a => a.status === 'available').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Ready to take</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {demoAvailableAssessments.filter(a => a.status === 'in_progress').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Continue where you left</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {demoCompletedResults.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">This year</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(demoCompletedResults[0]?.overallScore || 0)}`}>
                  {demoCompletedResults[0]?.overallScore || "N/A"}
                  {demoCompletedResults[0] && <span className="text-lg">/5</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Latest assessment</p>
              </CardContent>
            </Card>
          </div>

          {/* Latest Results Summary */}
          {demoCompletedResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Latest Assessment Results
                </CardTitle>
                <CardDescription>
                  {demoCompletedResults[0].assessmentType} • Completed {demoCompletedResults[0].completedAt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {demoCompletedResults[0].domainScores.map((domain, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{domain.domain}</span>
                        {getTrendIcon(domain.score)}
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(domain.score)}`}>
                        {domain.score}/5
                      </div>
                      <Badge variant="outline" className="mt-1">{domain.level}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="gap-2" onClick={() => setActiveTab("results")}>
                  View Full Results
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* AI Recommendations */}
          {demoCompletedResults[0]?.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  AI-Generated Development Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your assessment results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoCompletedResults[0].recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className={`p-2 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{rec.title}</h4>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Available Assessments Tab */}
        <TabsContent value="available" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demoAvailableAssessments.map(assessment => (
              <Card key={assessment.id} className={assessment.status === 'in_progress' ? 'border-yellow-500' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={
                      assessment.status === 'available' ? 'default' :
                      assessment.status === 'in_progress' ? 'secondary' :
                      'outline'
                    }>
                      {assessment.status === 'available' ? 'Available' :
                       assessment.status === 'in_progress' ? 'In Progress' :
                       'Completed'}
                    </Badge>
                    {assessment.dueDate && (
                      <span className="text-xs text-muted-foreground">
                        Due: {assessment.dueDate}
                      </span>
                    )}
                  </div>
                  <CardTitle className="mt-2">{assessment.title}</CardTitle>
                  <CardDescription>{assessment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span>{assessment.jobTitle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{assessment.framework}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{assessment.questionCount} questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{assessment.estimatedTime}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full gap-2"
                    variant={assessment.status === 'in_progress' ? 'secondary' : 'default'}
                    onClick={() => {
                      setSelectedAssessment(assessment);
                      setShowStartDialog(true);
                    }}
                  >
                    {assessment.status === 'in_progress' ? (
                      <>
                        <Play className="h-4 w-4" />
                        Continue
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Start Assessment
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Take Assessment Tab */}
        <TabsContent value="take-assessment" className="space-y-6">
          {isAssessmentActive && generatedQuestions.length > 0 && (
            <>
              {/* Progress Header */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Question {currentQuestionIndex + 1} of {generatedQuestions.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {responses.length} answered
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </CardContent>
              </Card>

              {/* Current Question */}
              <Card className="min-h-[400px]">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{generatedQuestions[currentQuestionIndex].domainName}</Badge>
                    <Badge>{generatedQuestions[currentQuestionIndex].competencyName}</Badge>
                    {generatedQuestions[currentQuestionIndex].aiGenerated && (
                      <Badge variant="secondary" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    {generatedQuestions[currentQuestionIndex].question}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <span className="font-medium">Behavioral Indicator:</span>{" "}
                    {generatedQuestions[currentQuestionIndex].behavioralIndicator}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Rate your practice:</Label>
                    <RadioGroup
                      value={getCurrentResponse()?.toString() || ""}
                      onValueChange={(value) => handleResponse(parseInt(value))}
                      className="space-y-3"
                    >
                      {[1, 2, 3, 4, 5].map(rating => (
                        <div key={rating} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                          <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                          <Label htmlFor={`rating-${rating}`} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <Star 
                                    key={idx} 
                                    className={`h-4 w-4 ${idx < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className={`font-medium ${ratingLabels[rating].color}`}>
                                {rating} - {ratingLabels[rating].label}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {ratingLabels[rating].description}
                            </p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={goToPrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    {currentQuestionIndex === generatedQuestions.length - 1 ? (
                      <Button 
                        onClick={completeAssessment}
                        disabled={responses.length < generatedQuestions.length}
                        className="gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete Assessment
                      </Button>
                    ) : (
                      <Button 
                        onClick={goToNextQuestion}
                        disabled={!getCurrentResponse()}
                        className="gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>

              {/* Question Navigator */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Question Navigator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {generatedQuestions.map((q, idx) => {
                      const isAnswered = responses.some(r => r.questionId === q.id);
                      const isCurrent = idx === currentQuestionIndex;
                      return (
                        <Button
                          key={q.id}
                          size="sm"
                          variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                          className="w-10 h-10"
                          onClick={() => setCurrentQuestionIndex(idx)}
                        >
                          {idx + 1}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          {!isAssessmentActive && (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">No Active Assessment</CardTitle>
                <CardDescription className="mb-4">
                  Start a new assessment to begin answering competency questions
                </CardDescription>
                <Button onClick={() => setShowStartDialog(true)} className="gap-2">
                  <Play className="h-4 w-4" />
                  Start New Assessment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {(showResults && assessmentResults) || demoCompletedResults.length > 0 ? (
            <>
              {/* Results Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Assessment Results
                      </CardTitle>
                      <CardDescription>
                        {(assessmentResults || demoCompletedResults[0]).assessmentType} • {(assessmentResults || demoCompletedResults[0]).jobTitle}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${getScoreColor((assessmentResults || demoCompletedResults[0]).overallScore)}`}>
                        {(assessmentResults || demoCompletedResults[0]).overallScore}
                        <span className="text-lg text-muted-foreground">/5</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Domain Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>Competency Domain Scores</CardTitle>
                  <CardDescription>Performance across all competency domains</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {(assessmentResults || demoCompletedResults[0]).domainScores.map((domain, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{domain.domain}</span>
                            <Badge variant="outline">{domain.level}</Badge>
                          </div>
                          <span className={`font-bold ${getScoreColor(domain.score)}`}>
                            {domain.score}/5
                          </span>
                        </div>
                        <Progress value={domain.score * 20} className="h-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Development Areas */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(assessmentResults || demoCompletedResults[0]).strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <Target className="h-5 w-5" />
                      Development Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(assessmentResults || demoCompletedResults[0]).developmentAreas.map((area, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI-Generated Development Plan
                  </CardTitle>
                  <CardDescription>
                    Personalized recommendations based on your assessment results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(assessmentResults || demoCompletedResults[0]).recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border">
                        <div className={`p-2 rounded-full ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          <Lightbulb className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{rec.title}</h4>
                            <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                              {rec.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Create Development Plan
                  </Button>
                </CardFooter>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">No Results Yet</CardTitle>
                <CardDescription className="mb-4">
                  Complete an assessment to view your competency results
                </CardDescription>
                <Button onClick={() => setShowStartDialog(true)} className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>View all your past competency assessments</CardDescription>
            </CardHeader>
            <CardContent>
              {demoCompletedResults.length > 0 ? (
                <div className="space-y-4">
                  {demoCompletedResults.map((result, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{result.assessmentType}</h4>
                          <p className="text-sm text-muted-foreground">
                            {result.jobTitle} • Completed {result.completedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getScoreColor(result.overallScore)}`}>
                            {result.overallScore}/5
                          </div>
                          <p className="text-xs text-muted-foreground">Overall Score</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          setAssessmentResults(result);
                          setShowResults(true);
                          setActiveTab("results");
                        }}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No assessment history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
