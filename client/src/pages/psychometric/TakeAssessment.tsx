import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Brain, Clock, ChevronLeft, ChevronRight, Save, CheckCircle2, 
  HelpCircle, Pause, Play, BookOpen, Heart, Target, Lightbulb,
  GraduationCap, Users, MessageSquare, Sparkles, AlertCircle, Info, Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

// Assessment type definitions
const assessmentConfigs: Record<string, {
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  totalQuestions: number;
  duration: number;
  sections: { name: string; questions: number }[];
  traitInfo: string;
}> = {
  personality: {
    name: "Personality Assessment",
    description: "Big Five Personality Traits Evaluation",
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    totalQuestions: 50,
    duration: 25,
    sections: [
      { name: "Openness", questions: 10 },
      { name: "Conscientiousness", questions: 10 },
      { name: "Extraversion", questions: 10 },
      { name: "Agreeableness", questions: 10 },
      { name: "Emotional Stability", questions: 10 },
    ],
    traitInfo: "This trait measures your openness to new experiences and creativity in the classroom."
  },
  eq: {
    name: "Emotional Intelligence",
    description: "EQ Assessment for Educators",
    icon: Heart,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    totalQuestions: 40,
    duration: 20,
    sections: [
      { name: "Self-Awareness", questions: 10 },
      { name: "Self-Regulation", questions: 10 },
      { name: "Empathy", questions: 10 },
      { name: "Social Skills", questions: 10 },
    ],
    traitInfo: "Emotional intelligence helps educators connect with students and manage classroom dynamics."
  },
  "teaching-style": {
    name: "Teaching Style Inventory",
    description: "Discover Your Instructional Approach",
    icon: BookOpen,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    totalQuestions: 30,
    duration: 15,
    sections: [
      { name: "Direct Instruction", questions: 8 },
      { name: "Facilitation", questions: 8 },
      { name: "Collaboration", questions: 7 },
      { name: "Delegation", questions: 7 },
    ],
    traitInfo: "Understanding your teaching style helps optimize lesson delivery and student engagement."
  },
  leadership: {
    name: "Instructional Leadership",
    description: "Educational Leadership Assessment",
    icon: GraduationCap,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    totalQuestions: 35,
    duration: 20,
    sections: [
      { name: "Vision & Strategy", questions: 9 },
      { name: "Team Development", questions: 9 },
      { name: "Decision Making", questions: 9 },
      { name: "Change Management", questions: 8 },
    ],
    traitInfo: "Leadership potential assessment for department heads and aspiring administrators."
  },
  cognitive: {
    name: "Cognitive Ability Test",
    description: "Problem-Solving & Analytical Skills",
    icon: Target,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    totalQuestions: 45,
    duration: 30,
    sections: [
      { name: "Verbal Reasoning", questions: 15 },
      { name: "Numerical Reasoning", questions: 15 },
      { name: "Abstract Reasoning", questions: 15 },
    ],
    traitInfo: "Cognitive tests measure analytical thinking essential for curriculum development."
  },
};

// Sample questions by type (FALLBACK - used when AI is not available)
const fallbackQuestions: Record<string, Array<{ id: number; text: string; section: string }>> = {
  personality: [
    { id: 1, text: "I see myself as someone who is talkative", section: "Extraversion" },
    { id: 2, text: "I tend to find fault with others", section: "Agreeableness" },
    { id: 3, text: "I do a thorough job", section: "Conscientiousness" },
    { id: 4, text: "I am depressed, blue", section: "Emotional Stability" },
    { id: 5, text: "I am original, come up with new ideas", section: "Openness" },
    { id: 6, text: "I am reserved", section: "Extraversion" },
    { id: 7, text: "I am helpful and unselfish with others", section: "Agreeableness" },
    { id: 8, text: "I can be somewhat careless", section: "Conscientiousness" },
    { id: 9, text: "I am relaxed, handle stress well", section: "Emotional Stability" },
    { id: 10, text: "I am curious about many different things", section: "Openness" },
  ],
  eq: [
    { id: 1, text: "I can easily identify my emotions as I experience them", section: "Self-Awareness" },
    { id: 2, text: "I stay calm under pressure in the classroom", section: "Self-Regulation" },
    { id: 3, text: "I can sense when a student is struggling emotionally", section: "Empathy" },
    { id: 4, text: "I build strong relationships with colleagues", section: "Social Skills" },
    { id: 5, text: "I understand how my mood affects my teaching", section: "Self-Awareness" },
  ],
  "teaching-style": [
    { id: 1, text: "I prefer to explain concepts step-by-step before student practice", section: "Direct Instruction" },
    { id: 2, text: "I ask guiding questions to help students discover answers", section: "Facilitation" },
    { id: 3, text: "I frequently use group activities in my lessons", section: "Collaboration" },
    { id: 4, text: "I give students autonomy to choose their learning path", section: "Delegation" },
  ],
  leadership: [
    { id: 1, text: "I can articulate a clear vision for educational improvement", section: "Vision & Strategy" },
    { id: 2, text: "I actively mentor and develop other teachers", section: "Team Development" },
    { id: 3, text: "I make decisions confidently even with incomplete information", section: "Decision Making" },
  ],
  cognitive: [
    { id: 1, text: "Which word does NOT belong: Apple, Banana, Carrot, Orange?", section: "Verbal Reasoning" },
    { id: 2, text: "If 5 teachers can grade 100 papers in 2 hours, how long for 10 teachers?", section: "Numerical Reasoning" },
    { id: 3, text: "Identify the pattern: 2, 6, 12, 20, ?", section: "Abstract Reasoning" },
  ],
};

const likertOptions = [
  { id: 1, text: "Strongly Disagree", value: 1, color: "text-red-600" },
  { id: 2, text: "Disagree", value: 2, color: "text-orange-600" },
  { id: 3, text: "Neutral", value: 3, color: "text-gray-600" },
  { id: 4, text: "Agree", value: 4, color: "text-blue-600" },
  { id: 5, text: "Strongly Agree", value: 5, color: "text-green-600" },
];

export default function TakeAssessment() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const assessmentType = urlParams.get('type') || 'personality';
  
  const config = assessmentConfigs[assessmentType] || assessmentConfigs.personality;
  
  // State for AI-generated questions
  const [questions, setQuestions] = useState<Array<{ id: number; text: string; section: string }>>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showIntro, setShowIntro] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(config.duration * 60);
  const [showResults, setShowResults] = useState(false);
  const [showTip, setShowTip] = useState(false);
  
  // AI question generation mutation
  const generateQuestionsMutation = trpc.services.ai.generatePsychometricQuestions.useMutation();
  
  // Map assessment types to API test types
  const testTypeMap: Record<string, string> = {
    'personality': 'big5',
    'eq': 'emotional_intelligence',
    'teaching-style': 'teaching_style',
    'leadership': 'leadership',
    'cognitive': 'cognitive',
  };
  
  // Load AI-generated questions when starting assessment
  const loadAIQuestions = async () => {
    setIsLoadingQuestions(true);
    setAiError(null);
    
    try {
      const testType = testTypeMap[assessmentType] || 'big5';
      const dimension = config.sections[0]?.name || 'General';
      const count = config.totalQuestions;
      
      const aiQuestions = await generateQuestionsMutation.mutateAsync({
        testType: testType as any,
        dimension,
        count: Math.min(count, 50), // API limit
      });
      
      if (aiQuestions && aiQuestions.length > 0) {
        // Transform AI questions to component format
        const formattedQuestions = aiQuestions.map((q: any, idx: number) => ({
          id: idx + 1,
          text: q.question || q.text || '',
          section: q.dimension || config.sections[idx % config.sections.length]?.name || 'General',
        }));
        setQuestions(formattedQuestions);
        setIsAiGenerated(true);
        console.log(`[Assessment] Loaded ${formattedQuestions.length} AI-generated questions`);
      } else {
        // Fallback to static questions
        setQuestions(fallbackQuestions[assessmentType] || fallbackQuestions.personality);
        setIsAiGenerated(false);
        console.log('[Assessment] Using fallback questions - AI returned empty');
      }
    } catch (error: any) {
      console.warn('[Assessment] AI question generation failed, using fallback:', error);
      setAiError(error?.message || 'AI service unavailable');
      setQuestions(fallbackQuestions[assessmentType] || fallbackQuestions.personality);
      setIsAiGenerated(false);
    } finally {
      setIsLoadingQuestions(false);
    }
  };
  
  // Load questions when intro screen is dismissed
  useEffect(() => {
    if (!showIntro && questions.length === 0) {
      loadAIQuestions();
    }
  }, [showIntro]);
  
  const totalQuestions = questions.length || config.totalQuestions;
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  // Timer effect
  useEffect(() => {
    if (showIntro || isPaused || showResults) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showIntro, isPaused, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowTip(false);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowTip(false);
    }
  };

  const getCurrentSection = () => {
    const q = questions[currentQuestion];
    return q?.section || config.sections[0]?.name;
  };

  const calculateScore = () => {
    const total = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const maxScore = Object.keys(answers).length * 5;
    return maxScore > 0 ? Math.round((total / maxScore) * 100) : 0;
  };

  // Intro Screen
  if (showIntro) {
    const IconComponent = config.icon;
    return (
      <div className="container max-w-3xl py-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-4`}>
                <IconComponent className={`h-10 w-10 ${config.color}`} />
              </div>
              <h1 className="text-2xl font-bold mb-2">{config.name}</h1>
              <p className="text-muted-foreground">{config.description}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">{config.duration} minutes</p>
                <p className="text-xs text-muted-foreground">Estimated time</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <HelpCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="font-medium">{config.totalQuestions} questions</p>
                <p className="text-xs text-muted-foreground">Total questions</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Save className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="font-medium">Auto-save</p>
                <p className="text-xs text-muted-foreground">Progress saved</p>
              </div>
            </div>

            <Card className="mb-6 border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-blue-600" />
                  Assessment Sections
                </h3>
                <div className="grid gap-2">
                  {config.sections.map((section, index) => (
                    <div key={section.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        {section.name}
                      </span>
                      <span className="text-muted-foreground">{section.questions} questions</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium flex items-center gap-2 text-amber-800 mb-2">
                <AlertCircle className="h-4 w-4" />
                Instructions
              </h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Answer honestly - there are no right or wrong answers</li>
                <li>• Your first instinct is usually the best response</li>
                <li>• You can pause and resume at any time</li>
                <li>• Results are confidential and used for development purposes</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => window.history.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button className="flex-1" onClick={() => setShowIntro(false)}>
                Start Assessment
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Screen
  if (showResults) {
    const score = calculateScore();
    const IconComponent = config.icon;
    
    return (
      <div className="container max-w-3xl py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Assessment Complete!</h1>
              <p className="text-muted-foreground">Great job completing the {config.name}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <p className="text-3xl font-bold text-green-600">{score}%</p>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <p className="text-3xl font-bold text-blue-600">{answeredCount}/{totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Questions Answered</p>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <p className="text-3xl font-bold text-purple-600">{formatTime(config.duration * 60 - timeRemaining)}</p>
                  <p className="text-sm text-muted-foreground">Time Taken</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6 border-amber-200 bg-amber-50/50 text-left">
              <CardContent className="p-4">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  Key Insights for Educators
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                    <div>
                      <p className="font-medium">Strong in Collaboration</p>
                      <p className="text-muted-foreground">Your results show excellent team-oriented teaching approach</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                    <div>
                      <p className="font-medium">Growth Area: Delegation</p>
                      <p className="text-muted-foreground">Consider giving students more autonomy in learning activities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                    <div>
                      <p className="font-medium">Career Match</p>
                      <p className="text-muted-foreground">Your profile aligns well with Department Head roles</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => window.location.href = '/psychometric'}>
                Back to Dashboard
              </Button>
              <Button className="flex-1" onClick={() => window.location.href = '/psychometric/results'}>
                View Detailed Results
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Assessment Taking Screen
  const currentQ = questions[currentQuestion];
  const IconComponent = config.icon;

  // Loading state while generating AI questions
  if (isLoadingQuestions) {
    return (
      <div className="container max-w-3xl py-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Sparkles className="h-10 w-10 text-white animate-spin" />
              </div>
              <h2 className="text-xl font-bold mb-2">Generating Your Assessment</h2>
              <p className="text-muted-foreground mb-6">
                Our AI is creating personalized {config.name} questions tailored to UAE education standards...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>This may take a few seconds</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No questions available
  if (questions.length === 0) {
    return (
      <div className="container max-w-3xl py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Unable to Load Questions</h2>
            <p className="text-muted-foreground mb-6">
              {aiError || 'We couldn\'t generate assessment questions. Please try again.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button onClick={loadAIQuestions}>
                <Sparkles className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start mb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconComponent className={`h-6 w-6 ${config.color}`} />
                {config.name}
                {isAiGenerated && (
                  <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                {config.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setIsPaused(!isPaused)}
                    >
                      {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isPaused ? 'Resume' : 'Pause'} Assessment</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full ${
                timeRemaining < 300 ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Section indicator */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className={config.bgColor}>
              {getCurrentSection()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Section {Math.floor(currentQuestion / (totalQuestions / config.sections.length)) + 1} of {config.sections.length}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Question dots indicator */}
            <div className="flex gap-1 flex-wrap mt-2">
              {questions.slice(0, Math.min(20, questions.length)).map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                    idx === currentQuestion 
                      ? 'bg-primary' 
                      : answers[questions[idx]?.id] 
                        ? 'bg-green-500' 
                        : 'bg-muted'
                  }`}
                  onClick={() => setCurrentQuestion(idx)}
                />
              ))}
              {questions.length > 20 && (
                <span className="text-xs text-muted-foreground ml-1">+{questions.length - 20} more</span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isPaused ? (
            <div className="text-center py-12">
              <Pause className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Assessment Paused</h3>
              <p className="text-muted-foreground mb-4">Your progress has been saved. Click resume to continue.</p>
              <Button onClick={() => setIsPaused(false)}>
                <Play className="mr-2 h-4 w-4" />
                Resume Assessment
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-muted/50 p-6 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium flex-1">{currentQ?.text}</h3>
                  <TooltipProvider>
                    <Tooltip open={showTip} onOpenChange={setShowTip}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <HelpCircle className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-sm">{config.traitInfo}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <RadioGroup 
                  value={answers[currentQ?.id]?.toString() || ''} 
                  onValueChange={(val) => handleAnswer(parseInt(val))}
                >
                  {likertOptions.map((option) => (
                    <div 
                      key={option.id} 
                      className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors cursor-pointer ${
                        answers[currentQ?.id] === option.value 
                          ? 'bg-primary/10 border border-primary' 
                          : 'hover:bg-muted border border-transparent'
                      }`}
                      onClick={() => handleAnswer(option.value)}
                    >
                      <RadioGroupItem value={option.value.toString()} id={`option-${option.id}`} />
                      <Label 
                        htmlFor={`option-${option.id}`} 
                        className={`cursor-pointer flex-1 font-medium ${
                          answers[currentQ?.id] === option.value ? 'text-primary' : ''
                        }`}
                      >
                        {option.text}
                      </Label>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full ${
                              i < option.value ? 'bg-primary' : 'bg-muted'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Progress summary */}
              <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {answeredCount} of {questions.length} answered
                </span>
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Auto-saved
                </span>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!answers[currentQ?.id]}
                >
                  {currentQuestion === questions.length - 1 ? (
                    <>
                      Submit
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
