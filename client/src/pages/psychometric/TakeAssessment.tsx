import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, Clock, ChevronLeft, ChevronRight, Save, CheckCircle2, 
  HelpCircle, Pause, Play, BookOpen, Heart, Target, Lightbulb,
  GraduationCap, Users, MessageSquare, Sparkles, AlertCircle, Info, Loader2,
  CheckSquare, List, FileText, Scale
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

// Enhanced question type with multiple formats
interface AssessmentQuestion {
  id: number;
  text: string;
  section: string;
  type: 'likert' | 'scenario' | 'multiple_choice' | 'forced_choice' | 'situational' | 'ranking';
  options?: Array<{ id: string | number; text: string; value?: number }>;
  scenario?: string;
  correctAnswer?: number;
  explanation?: string;
}

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

// Professional fallback questions with varied types for UAE educators
const fallbackQuestions: Record<string, AssessmentQuestion[]> = {
  personality: [
    { 
      id: 1, 
      type: 'scenario',
      text: "A parent criticizes your teaching method during a PTM. You:",
      scenario: "You've been using collaborative learning in your Grade 8 Science class. During the parent-teacher meeting, a parent insists their child isn't learning because 'real teaching means lecturing.' They demand you return to traditional methods.",
      section: "Openness",
      options: [
        { id: 'a', text: "Explain the research behind collaborative learning and offer to share data on student outcomes", value: 5 },
        { id: 'b', text: "Agree to modify your approach for this specific student", value: 3 },
        { id: 'c', text: "Escalate to the Head of Department to handle the situation", value: 2 },
        { id: 'd', text: "Firmly maintain your teaching style without explanation", value: 1 },
      ]
    },
    { 
      id: 2, 
      type: 'forced_choice',
      text: "When planning lessons, which approach resonates more with you?",
      section: "Conscientiousness",
      options: [
        { id: 'a', text: "Following a detailed weekly plan that I prepared at the start of the term", value: 5 },
        { id: 'b', text: "Adapting each lesson based on student responses from the previous class", value: 4 },
      ]
    },
    { 
      id: 3, 
      type: 'situational',
      text: "Choose how you would most likely respond:",
      scenario: "Two students in your class are consistently outperforming others. Their classmates are becoming discouraged and participation is declining.",
      section: "Extraversion",
      options: [
        { id: 'a', text: "Create differentiated group activities where high performers mentor others", value: 5 },
        { id: 'b', text: "Have a private conversation with the high performers about being more supportive", value: 4 },
        { id: 'c', text: "Introduce more challenging extension work to keep high performers busy", value: 3 },
        { id: 'd', text: "Wait for the situation to balance itself naturally", value: 1 },
      ]
    },
    { 
      id: 4, 
      type: 'multiple_choice',
      text: "A colleague shares a teaching strategy that you've tried before with poor results. Your typical response would be:",
      section: "Agreeableness",
      options: [
        { id: 'a', text: "Share your experience honestly but offer to explore modifications together", value: 5 },
        { id: 'b', text: "Encourage them to try it without mentioning your past experience", value: 3 },
        { id: 'c', text: "Politely suggest a different approach that worked better for you", value: 4 },
        { id: 'd', text: "Let them discover the issues themselves - it's a learning experience", value: 2 },
      ]
    },
    { 
      id: 5, 
      type: 'scenario',
      text: "How would you handle this classroom situation?",
      scenario: "During an important exam review session, you notice a student appears distressed and is not focusing. When you quietly ask if they're okay, they mention problems at home but insist on staying in class.",
      section: "Emotional Stability",
      options: [
        { id: 'a', text: "Continue the session but check in with the student during break time", value: 5 },
        { id: 'b', text: "Suggest they speak with the school counselor immediately", value: 4 },
        { id: 'c', text: "Offer to help them catch up later and encourage them to take a break", value: 4 },
        { id: 'd', text: "Acknowledge their feelings and continue with reduced expectations for them today", value: 3 },
      ]
    },
    { 
      id: 6, 
      type: 'forced_choice',
      text: "In professional development, you prefer:",
      section: "Openness",
      options: [
        { id: 'a', text: "Exploring new educational technologies and innovative teaching methods", value: 5 },
        { id: 'b', text: "Deepening expertise in proven, established teaching frameworks", value: 3 },
      ]
    },
    { 
      id: 7, 
      type: 'situational',
      text: "What would be your approach?",
      scenario: "Your school is implementing a new student management system. Many colleagues are resistant and vocally negative. You've tested the system and see potential benefits despite the learning curve.",
      section: "Conscientiousness",
      options: [
        { id: 'a', text: "Volunteer to help train colleagues and address their specific concerns", value: 5 },
        { id: 'b', text: "Focus on mastering it yourself and let others adapt at their pace", value: 3 },
        { id: 'c', text: "Share your positive experience in the staff meeting to shift perspectives", value: 4 },
        { id: 'd', text: "Express reservations publicly to show solidarity with colleagues", value: 1 },
      ]
    },
    { 
      id: 8, 
      type: 'multiple_choice',
      text: "During collaborative planning, you typically:",
      section: "Extraversion",
      options: [
        { id: 'a', text: "Lead the discussion and keep the group focused on objectives", value: 5 },
        { id: 'b', text: "Contribute when you have specific expertise to share", value: 3 },
        { id: 'c', text: "Listen to all perspectives and help synthesize ideas", value: 4 },
        { id: 'd', text: "Document decisions and follow up on action items", value: 4 },
      ]
    },
    { 
      id: 9, 
      type: 'scenario',
      text: "How would you handle this leadership situation?",
      scenario: "As Grade Level Coordinator, you receive conflicting directives from the Principal and Vice Principal about an upcoming event. Both seem to expect compliance with their version.",
      section: "Agreeableness",
      options: [
        { id: 'a', text: "Request a joint meeting to clarify priorities and get aligned", value: 5 },
        { id: 'b', text: "Follow the Principal's directive as they're the senior leader", value: 3 },
        { id: 'c', text: "Propose a compromise that incorporates elements from both", value: 4 },
        { id: 'd', text: "Implement what you believe is best and explain your reasoning later", value: 2 },
      ]
    },
    { 
      id: 10, 
      type: 'forced_choice',
      text: "After a challenging day at school, you're more likely to:",
      section: "Emotional Stability",
      options: [
        { id: 'a', text: "Reflect on what went wrong and plan improvements for tomorrow", value: 4 },
        { id: 'b', text: "Disconnect completely and focus on personal activities to recharge", value: 5 },
      ]
    },
  ],
  eq: [
    { 
      id: 1, 
      type: 'scenario',
      text: "How do you respond in this situation?",
      scenario: "A student who usually excels suddenly submits poor quality work. When you ask about it, they become defensive and say 'It's fine, just grade it.'",
      section: "Self-Awareness",
      options: [
        { id: 'a', text: "Recognize your concern for them and calmly ask if there's something affecting their work", value: 5 },
        { id: 'b', text: "Respect their response and provide constructive written feedback on the work", value: 3 },
        { id: 'c', text: "Contact their parents to understand if something is happening at home", value: 2 },
        { id: 'd', text: "Grade it as-is and mention your door is always open if they want to talk", value: 4 },
      ]
    },
    { 
      id: 2, 
      type: 'situational',
      text: "Choose your most likely response:",
      scenario: "You've just received critical feedback from an observation. You feel it was unfair because the observer didn't see your typical teaching. You have 10 minutes before your next class.",
      section: "Self-Regulation",
      options: [
        { id: 'a', text: "Take a few deep breaths, note points to discuss later, and refocus on your class", value: 5 },
        { id: 'b', text: "Quickly email the observer asking to discuss the feedback concerns", value: 2 },
        { id: 'c', text: "Vent briefly to a trusted colleague to release the frustration", value: 3 },
        { id: 'd', text: "Review the feedback objectively and identify valid growth points", value: 4 },
      ]
    },
    { 
      id: 3, 
      type: 'forced_choice',
      text: "When a student challenges your authority in class:",
      section: "Empathy",
      options: [
        { id: 'a', text: "I first try to understand what might be driving their behavior", value: 5 },
        { id: 'b', text: "I address the behavior immediately to maintain classroom order", value: 3 },
      ]
    },
    { 
      id: 4, 
      type: 'multiple_choice',
      text: "In navigating school politics and interpersonal dynamics, you:",
      section: "Social Skills",
      options: [
        { id: 'a', text: "Build relationships across different groups and stay informed", value: 5 },
        { id: 'b', text: "Stay neutral and focus primarily on your classroom responsibilities", value: 3 },
        { id: 'c', text: "Align with colleagues whose teaching philosophy matches yours", value: 2 },
        { id: 'd', text: "Actively advocate for what you believe benefits students most", value: 4 },
      ]
    },
    { 
      id: 5, 
      type: 'scenario',
      text: "How would you navigate this team dynamic?",
      scenario: "During a department meeting, a senior colleague dismisses your idea without consideration. Others seem uncomfortable but don't speak up.",
      section: "Self-Awareness",
      options: [
        { id: 'a', text: "Note your emotional response, then calmly ask for specific feedback on the idea", value: 5 },
        { id: 'b', text: "Accept the dismissal and bring up the idea with administration separately", value: 2 },
        { id: 'c', text: "Move on gracefully and look for allies to support the idea later", value: 3 },
        { id: 'd', text: "Ask colleagues directly what they think about the idea", value: 4 },
      ]
    },
  ],
  "teaching-style": [
    { 
      id: 1, 
      type: 'scenario',
      text: "Select the approach that best matches your teaching style:",
      scenario: "You're introducing the concept of fractions to Grade 4 students. You have 40 minutes and access to both digital tools and physical manipulatives.",
      section: "Direct Instruction",
      options: [
        { id: 'a', text: "Begin with a clear explanation using visuals, then guided practice with manipulatives", value: 5 },
        { id: 'b', text: "Present a pizza-sharing problem and let students discover fraction concepts", value: 4 },
        { id: 'c', text: "Have students work in groups with manipulatives to figure out equal parts", value: 3 },
        { id: 'd', text: "Provide a choice board with different activities for exploring fractions", value: 4 },
      ]
    },
    { 
      id: 2, 
      type: 'forced_choice',
      text: "When students ask questions during a lesson:",
      section: "Facilitation",
      options: [
        { id: 'a', text: "I address them immediately if relevant, or note them for later", value: 4 },
        { id: 'b', text: "I turn questions back to the class to encourage peer learning", value: 5 },
      ]
    },
    { 
      id: 3, 
      type: 'situational',
      text: "How do you handle differentiation?",
      scenario: "Your class has students ranging from struggling readers to those reading two years above level. You're planning a literature unit.",
      section: "Collaboration",
      options: [
        { id: 'a', text: "Create three leveled groups with appropriate texts and activities", value: 4 },
        { id: 'b', text: "Use one anchor text with scaffolded supports and extensions", value: 5 },
        { id: 'c', text: "Implement book clubs where students choose from various options", value: 4 },
        { id: 'd', text: "Focus on skills with grade-level text and provide additional support as needed", value: 3 },
      ]
    },
    { 
      id: 4, 
      type: 'multiple_choice',
      text: "Your preferred assessment approach is:",
      section: "Delegation",
      options: [
        { id: 'a', text: "Regular formative checks with summative assessment at unit end", value: 4 },
        { id: 'b', text: "Student-led portfolios with reflection on their learning growth", value: 5 },
        { id: 'c', text: "Standardized assessments that allow comparison across classes", value: 2 },
        { id: 'd', text: "Project-based assessment where students demonstrate understanding", value: 4 },
      ]
    },
  ],
  leadership: [
    { 
      id: 1, 
      type: 'scenario',
      text: "As a department head, how would you approach this?",
      scenario: "Your department's exam results have dropped 8% from last year. The Principal wants an action plan by end of week. Your team includes new teachers and experienced ones resistant to change.",
      section: "Vision & Strategy",
      options: [
        { id: 'a', text: "Analyze data to identify specific gaps, then collaborate with the team on targeted interventions", value: 5 },
        { id: 'b', text: "Implement a proven intervention program from another successful school", value: 3 },
        { id: 'c', text: "Meet individually with teachers to understand challenges before planning", value: 4 },
        { id: 'd', text: "Present a comprehensive action plan and delegate specific tasks to team members", value: 3 },
      ]
    },
    { 
      id: 2, 
      type: 'forced_choice',
      text: "When making important decisions that affect your team:",
      section: "Decision Making",
      options: [
        { id: 'a', text: "I gather input from all stakeholders and build consensus before deciding", value: 4 },
        { id: 'b', text: "I analyze data and best practices, then communicate my decision clearly", value: 4 },
      ]
    },
    { 
      id: 3, 
      type: 'situational',
      text: "How would you develop this team member?",
      scenario: "A teacher on your team has strong content knowledge but struggles with classroom management. They've asked you not to involve administration as they're worried about their contract renewal.",
      section: "Team Development",
      options: [
        { id: 'a', text: "Provide regular coaching, peer observation opportunities, and honest feedback", value: 5 },
        { id: 'b', text: "Respect their request but document concerns for future reference", value: 2 },
        { id: 'c', text: "Create a confidential development plan with milestones and support", value: 5 },
        { id: 'd', text: "Connect them with a mentor teacher who excels in classroom management", value: 4 },
      ]
    },
  ],
  cognitive: [
    { 
      id: 1, 
      type: 'multiple_choice',
      text: "In educational contexts, which statement represents the strongest logical conclusion?",
      scenario: "All teachers who completed the professional development showed improved student engagement. Mr. Ahmed did not show improved student engagement.",
      section: "Verbal Reasoning",
      options: [
        { id: 'a', text: "Mr. Ahmed did not complete the professional development", value: 5 },
        { id: 'b', text: "The professional development was ineffective for Mr. Ahmed", value: 1 },
        { id: 'c', text: "Mr. Ahmed's students were already highly engaged", value: 1 },
        { id: 'd', text: "Mr. Ahmed needs additional support", value: 1 },
      ],
      correctAnswer: 0,
      explanation: "This is a logical deduction. If all PD completers showed improvement, and Ahmed didn't show improvement, he couldn't have completed the PD."
    },
    { 
      id: 2, 
      type: 'multiple_choice',
      text: "A school allocates budget based on student numbers. If 450 students require AED 675,000, how much would 380 students require?",
      section: "Numerical Reasoning",
      options: [
        { id: 'a', text: "AED 570,000", value: 5 },
        { id: 'b', text: "AED 550,000", value: 1 },
        { id: 'c', text: "AED 590,000", value: 1 },
        { id: 'd', text: "AED 525,000", value: 1 },
      ],
      correctAnswer: 0,
      explanation: "Per student cost = 675,000 ÷ 450 = AED 1,500. For 380 students: 380 × 1,500 = AED 570,000"
    },
    { 
      id: 3, 
      type: 'multiple_choice',
      text: "Identify the next number in this education-themed sequence: 1, 1, 2, 3, 5, 8, ?",
      section: "Abstract Reasoning",
      options: [
        { id: 'a', text: "13", value: 5 },
        { id: 'b', text: "11", value: 1 },
        { id: 'c', text: "12", value: 1 },
        { id: 'd', text: "16", value: 1 },
      ],
      correctAnswer: 0,
      explanation: "This is the Fibonacci sequence. Each number is the sum of the two preceding ones: 5 + 8 = 13"
    },
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
  const [questions, setQuestions] = useState<Array<{ 
    id: number; 
    text: string; 
    section: string;
    type?: 'likert' | 'multiple_choice' | 'forced_choice' | 'situational' | 'scenario';
    scenario?: string;
    options?: Array<{ id: string; text: string; value: number }>;
    correctAnswer?: number;
    explanation?: string;
  }>>([]);
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
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]);
  
  // Question bank query - fetches from professional question bank
  const questionBankQuery = trpc.psychometric.getQuestionsForAssessment.useQuery(
    { testType: assessmentType, count: config.totalQuestions },
    { enabled: false } // Manual trigger
  );
  
  // Mutation to mark questions as used after assessment
  const markQuestionsUsedMutation = trpc.psychometric.markQuestionsUsed.useMutation();
  
  // AI question generation mutation (fallback)
  const generateQuestionsMutation = trpc.services.ai.generatePsychometricQuestions.useMutation();
  
  // Map assessment types to API test types
  const testTypeMap: Record<string, string> = {
    'personality': 'personality',
    'eq': 'emotional_intelligence',
    'teaching-style': 'teaching_style',
    'leadership': 'leadership',
    'cognitive': 'cognitive',
  };
  
  // Load questions from question bank (with AI fallback)
  const loadQuestions = async () => {
    setIsLoadingQuestions(true);
    setAiError(null);
    
    try {
      // First try: Professional Question Bank
      const bankResult = await questionBankQuery.refetch();
      
      if (bankResult.data && bankResult.data.length > 0) {
        const formattedQuestions = bankResult.data.map((q: any, idx: number) => ({
          id: q.id || idx + 1,
          text: q.text,
          section: q.section,
          type: q.type || 'multiple_choice',
          scenario: q.scenario,
          options: q.options,
          traitMeasured: q.traitMeasured,
        }));
        setQuestions(formattedQuestions);
        setUsedQuestionIds(formattedQuestions.map((q: any) => q.id).filter((id: any) => typeof id === 'number'));
        setIsAiGenerated(false);
        console.log(`[Assessment] Loaded ${formattedQuestions.length} questions from Question Bank`);
        return;
      }
      
      // Second try: AI-generated questions
      const testType = testTypeMap[assessmentType] || 'personality';
      const dimension = config.sections[0]?.name || 'General';
      const count = Math.min(config.totalQuestions, 15);
      
      const aiQuestions = await generateQuestionsMutation.mutateAsync({
        testType: testType as any,
        dimension,
        count,
      });
      
      if (aiQuestions && aiQuestions.length > 0) {
        const formattedQuestions = aiQuestions.map((q: any, idx: number) => ({
          id: idx + 1,
          text: q.question || q.text || '',
          section: q.dimension || config.sections[idx % config.sections.length]?.name || 'General',
          type: q.type || 'multiple_choice',
          scenario: q.scenario || undefined,
          options: q.options?.map((opt: any, optIdx: number) => ({
            id: opt.id || String.fromCharCode(97 + optIdx),
            text: opt.text || opt,
            value: opt.value || opt.score || (5 - optIdx),
          })) || undefined,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        }));
        setQuestions(formattedQuestions);
        setIsAiGenerated(true);
        console.log(`[Assessment] Loaded ${formattedQuestions.length} AI-generated questions`);
      } else {
        // Final fallback: Static questions
        setQuestions(fallbackQuestions[assessmentType] || fallbackQuestions.personality);
        setIsAiGenerated(false);
        console.log('[Assessment] Using fallback static questions');
      }
    } catch (error: any) {
      console.warn('[Assessment] Question loading failed, using fallback:', error);
      setAiError(error?.message || 'Could not load questions');
      setQuestions(fallbackQuestions[assessmentType] || fallbackQuestions.personality);
      setIsAiGenerated(false);
    } finally {
      setIsLoadingQuestions(false);
    }
  };
  
  // Load questions when intro screen is dismissed
  useEffect(() => {
    if (!showIntro && questions.length === 0) {
      loadQuestions();
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
      // Assessment completed - mark questions as used for AI replenishment
      if (usedQuestionIds.length > 0) {
        markQuestionsUsedMutation.mutate({
          questionIds: usedQuestionIds,
          assessmentId: Date.now(), // Use timestamp as mock assessment ID
        }, {
          onSuccess: () => {
            console.log('[Assessment] Questions marked as used - bank will be replenished');
          },
          onError: (err) => {
            console.warn('[Assessment] Could not mark questions as used:', err);
          }
        });
      }
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
                {/* Question Type Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className={`text-xs ${
                    currentQ?.type === 'scenario' || currentQ?.type === 'situational' 
                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                      : currentQ?.type === 'forced_choice' 
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : currentQ?.type === 'multiple_choice'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {currentQ?.type === 'scenario' ? '📋 Scenario' 
                      : currentQ?.type === 'situational' ? '🎯 Situational Judgment'
                      : currentQ?.type === 'forced_choice' ? '⚖️ Choose One'
                      : currentQ?.type === 'multiple_choice' ? '📝 Multiple Choice'
                      : '📊 Rating Scale'}
                  </Badge>
                </div>

                {/* Scenario Description (for scenario/situational questions) */}
                {(currentQ?.type === 'scenario' || currentQ?.type === 'situational') && currentQ?.scenario && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Info className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">Scenario</p>
                        <p className="text-sm text-blue-700">{currentQ.scenario}</p>
                      </div>
                    </div>
                  </div>
                )}

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
                
                {/* Render options based on question type */}
                <RadioGroup 
                  value={answers[currentQ?.id]?.toString() || ''} 
                  onValueChange={(val) => handleAnswer(parseInt(val))}
                >
                  {/* For questions with custom options (scenario, situational, multiple_choice, forced_choice) */}
                  {currentQ?.options && currentQ.options.length > 0 ? (
                    currentQ.options.map((option: any, idx: number) => (
                      <div 
                        key={option.id || idx} 
                        className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition-all cursor-pointer ${
                          answers[currentQ?.id] === option.value 
                            ? 'bg-primary/10 border-2 border-primary shadow-sm' 
                            : 'hover:bg-muted border border-muted-foreground/20 hover:border-muted-foreground/40'
                        }`}
                        onClick={() => handleAnswer(option.value)}
                      >
                        <RadioGroupItem value={option.value.toString()} id={`option-${option.id || idx}`} />
                        <div className="flex items-center gap-3 flex-1">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            answers[currentQ?.id] === option.value 
                              ? 'bg-primary text-white' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <Label 
                            htmlFor={`option-${option.id || idx}`} 
                            className={`cursor-pointer flex-1 ${
                              answers[currentQ?.id] === option.value ? 'text-primary font-medium' : ''
                            }`}
                          >
                            {option.text}
                          </Label>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Fallback to Likert scale for questions without options */
                    likertOptions.map((option) => (
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
                    ))
                  )}
                </RadioGroup>
                
                {/* Explanation for cognitive questions */}
                {currentQ?.type === 'multiple_choice' && currentQ?.correctAnswer !== undefined && answers[currentQ?.id] && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    answers[currentQ?.id] === currentQ.options?.[currentQ.correctAnswer]?.value
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-amber-50 border border-amber-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      answers[currentQ?.id] === currentQ.options?.[currentQ.correctAnswer]?.value
                        ? 'text-green-700'
                        : 'text-amber-700'
                    }`}>
                      {answers[currentQ?.id] === currentQ.options?.[currentQ.correctAnswer]?.value
                        ? '✓ Correct!'
                        : '✗ Not quite right'}
                    </p>
                    {currentQ.explanation && (
                      <p className="text-sm text-muted-foreground mt-1">{currentQ.explanation}</p>
                    )}
                  </div>
                )}
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
