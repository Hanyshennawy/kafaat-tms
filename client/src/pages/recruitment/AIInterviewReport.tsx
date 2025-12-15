import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, ArrowLeft, Download, Share2, CheckCircle2, Clock, Video, 
  Star, ThumbsUp, ThumbsDown, Minus, AlertTriangle, Sparkles,
  Brain, Target, MessageSquare, FileText, BarChart3, User, Award,
  TrendingUp, Calendar, Play, Printer
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";

// Demo report data
const DEMO_REPORT = {
  id: 1,
  sessionId: 1,
  candidateName: "Ahmad Al-Rashid",
  candidateEmail: "ahmad.rashid@email.com",
  candidatePosition: "Expert Teacher - Mathematics",
  templateName: "Teacher Screening - General",
  scheduledAt: new Date("2024-01-25T10:00:00"),
  completedAt: new Date("2024-01-25T10:28:00"),
  duration: 28,
  interviewMode: "video",
  language: "en",
  totalScore: 82,
  percentageScore: 82.5,
  aiRecommendation: "hire",
  
  executiveSummary: "Ahmad Al-Rashid demonstrates strong potential as an Expert Mathematics Teacher. With an overall score of 82.5%, he shows excellent communication skills and a solid foundation in classroom management. His passion for mathematics and student-centered approach make him a recommended hire for the position.",
  
  strengthsAnalysis: [
    "Excellent verbal communication and articulation",
    "Strong classroom management philosophy with proactive strategies",
    "Genuine passion for mathematics education evident throughout",
    "Shows growth mindset and adaptability to new technologies",
    "Student-centered teaching approach with focus on individual needs"
  ],
  
  areasForDevelopment: [
    "Could improve on being more concise in verbal responses",
    "Assessment strategies could be more varied beyond traditional methods",
    "May benefit from additional training in differentiated instruction for advanced learners"
  ],
  
  cultureFitAssessment: "Ahmad shows strong alignment with the school's values of student success and continuous improvement. His collaborative approach to problem-solving indicates he would work well with colleagues. His responses demonstrate respect for diverse learning needs and a commitment to inclusive education.",
  
  teachingReadiness: "Ready to take on a full teaching load with minimal onboarding. His experience and methodology align well with the school's curriculum approach. Recommended for participation in the mentorship program as a mentee initially.",
  
  communicationSkills: {
    score: 85,
    notes: "Clear, articulate, and engaging communication style. Maintains appropriate professional tone throughout. Good at explaining complex concepts in simple terms."
  },
  
  subjectMastery: {
    score: 88,
    notes: "Demonstrated strong mathematical knowledge with ability to relate concepts to real-world applications. Showed understanding of multiple problem-solving approaches."
  },
  
  recommendedNextSteps: [
    "Schedule final panel interview with Department Head",
    "Conduct demo lesson observation in classroom setting",
    "Complete reference checks with previous employers",
    "Prepare offer letter pending successful completion of above steps"
  ],
  
  redFlags: [],
  
  highlights: [
    { text: "Excellent example of turning a disruptive student into an engaged learner", question: 2 },
    { text: "Strong understanding of differentiated instruction principles", question: 3 },
    { text: "Innovative use of technology in mathematics education", question: 5 }
  ],
  
  competencyScores: [
    { name: "Communication", score: 85, maxScore: 100, color: "bg-blue-500" },
    { name: "Classroom Management", score: 80, maxScore: 100, color: "bg-green-500" },
    { name: "Pedagogy", score: 82, maxScore: 100, color: "bg-purple-500" },
    { name: "Adaptability", score: 83, maxScore: 100, color: "bg-orange-500" }
  ],
  
  questionResponses: [
    {
      id: 1,
      question: "Tell me about yourself and why you chose teaching as a profession.",
      response: "I've been passionate about mathematics since childhood. Teaching allows me to share this passion and make a difference in students' lives. I believe every student can excel with the right guidance and support. Over my 7 years of teaching experience, I've developed methodologies that help students overcome their fear of mathematics.",
      score: 8,
      maxScore: 10,
      aiNotes: "Clear motivation and passion evident. Good connection to student impact."
    },
    {
      id: 2,
      question: "Describe a challenging classroom situation you faced and how you handled it.",
      response: "I had a student who was constantly disruptive and showed no interest in mathematics. Instead of punishment, I spoke privately with them and learned about their home situation. We created a behavior plan together that included small wins and recognition. Over the semester, they became one of my most engaged students and even started helping peers.",
      score: 9,
      maxScore: 10,
      aiNotes: "Excellent example demonstrating empathy, problem-solving, and positive outcomes. Uses STAR method effectively."
    },
    {
      id: 3,
      question: "How do you differentiate instruction to meet diverse student needs?",
      response: "I use a multi-tiered approach. First, I assess each student's current level through diagnostic tests. Then I create flexible groupings that change based on topic. I provide extension activities for advanced learners and scaffolded support for struggling students. I also offer multiple ways to demonstrate understanding - not just tests but projects and presentations.",
      score: 8,
      maxScore: 10,
      aiNotes: "Comprehensive approach to differentiation. Could elaborate more on specific strategies for gifted students."
    },
    {
      id: 4,
      question: "A student consistently disrupts class. Walk me through your approach.",
      response: "First, I would observe to understand the root cause. Is it boredom, difficulty, or personal issues? I'd have a private conversation to build rapport and understand their perspective. Together, we'd set clear expectations and consequences. I'd also ensure my lessons are engaging and that the student has appropriate challenges. If issues persist, I'd involve parents and counselors.",
      score: 8,
      maxScore: 10,
      aiNotes: "Structured approach showing understanding of behavior management principles. Good stakeholder involvement."
    },
    {
      id: 5,
      question: "How do you incorporate technology in your teaching?",
      response: "I use interactive tools like GeoGebra for visualizing geometric concepts and Desmos for graphing functions. Students can explore concepts hands-on. I also use learning management systems for assignments and feedback. During remote learning, I developed video tutorials that students still use. I'm always exploring new edtech tools that can enhance learning.",
      score: 9,
      maxScore: 10,
      aiNotes: "Strong technology integration with specific examples. Shows initiative and adaptability."
    }
  ]
};

export default function AIInterviewReport() {
  const { sessionId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const report = DEMO_REPORT;

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case "strong_hire":
        return { bg: "bg-green-500", text: "Strong Hire", icon: ThumbsUp };
      case "hire":
        return { bg: "bg-blue-500", text: "Hire", icon: ThumbsUp };
      case "maybe":
        return { bg: "bg-yellow-500", text: "Maybe", icon: Minus };
      case "no_hire":
        return { bg: "bg-red-500", text: "No Hire", icon: ThumbsDown };
      default:
        return { bg: "bg-gray-500", text: "Pending", icon: Clock };
    }
  };

  const recommendation = getRecommendationStyle(report.aiRecommendation);
  const RecommendationIcon = recommendation.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/recruitment/ai-interview">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">AI Interview Report</h1>
                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600">
                    <Sparkles className="h-3 w-3 mr-1" />AI Generated
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {report.candidateName} • {report.candidatePosition}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />Share
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />Print
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Candidate Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    {report.candidateName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{report.candidateName}</h2>
                      <p className="text-muted-foreground">{report.candidatePosition}</p>
                      <p className="text-sm text-muted-foreground mt-1">{report.candidateEmail}</p>
                    </div>
                    
                    {/* Score Circle */}
                    <div className="text-center">
                      <div className={`w-24 h-24 rounded-full ${recommendation.bg} flex items-center justify-center`}>
                        <div className="text-center text-white">
                          <p className="text-2xl font-bold">{report.percentageScore}%</p>
                          <p className="text-xs">Score</p>
                        </div>
                      </div>
                      <Badge className={`mt-2 ${recommendation.bg}`}>
                        <RecommendationIcon className="h-3 w-3 mr-1" />
                        {recommendation.text}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Meta info */}
                  <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {report.templateName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {report.completedAt.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {report.duration} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      {report.interviewMode === "video" ? "Video Interview" : "Text Interview"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="competencies">Competencies</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Executive Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {report.executiveSummary}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Strengths & Areas for Development */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <ThumbsUp className="h-5 w-5" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.strengthsAnalysis.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                      <TrendingUp className="h-5 w-5" />
                      Areas for Development
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.areasForDevelopment.map((area, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                          <span className="text-sm">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Competency Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Competency Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {report.competencyScores.map((comp, i) => (
                      <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="relative inline-flex items-center justify-center">
                          <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="35"
                              stroke="currentColor"
                              strokeWidth="6"
                              fill="none"
                              className="text-gray-200"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="35"
                              stroke="currentColor"
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray={`${(comp.score / 100) * 220} 220`}
                              className={comp.color.replace('bg-', 'text-')}
                            />
                          </svg>
                          <span className="absolute text-lg font-bold">{comp.score}%</span>
                        </div>
                        <p className="mt-2 font-medium text-sm">{comp.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Interview Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                        <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm">{highlight.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">Question {highlight.question}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="competencies" className="space-y-6">
            {report.competencyScores.map((comp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{comp.name}</CardTitle>
                      <Badge className={comp.color}>{comp.score}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={comp.score} className="h-3 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-green-600">Strengths</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Clear demonstration in responses</li>
                          <li>• Provided concrete examples</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-orange-600">Improvement Areas</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Could provide more specific metrics</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="responses" className="space-y-6">
            {report.questionResponses.map((qr, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">Question {qr.id}</Badge>
                        <CardTitle className="text-lg">{qr.question}</CardTitle>
                      </div>
                      <div className="text-center ml-4">
                        <div className="text-2xl font-bold text-purple-600">{qr.score}/{qr.maxScore}</div>
                        <p className="text-xs text-muted-foreground">AI Score</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Candidate Response
                      </h4>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm leading-relaxed">{qr.response}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Bot className="h-4 w-4 text-purple-600" />
                        AI Analysis
                      </h4>
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <p className="text-sm text-purple-700 dark:text-purple-300">{qr.aiNotes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            {/* Culture Fit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    Culture Fit Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {report.cultureFitAssessment}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Teaching Readiness */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Teaching Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {report.teachingReadiness}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-purple-600" />
                    Recommended Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {report.recommendedNextSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 text-sm font-medium shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </motion.div>

            {/* Red Flags */}
            {report.redFlags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Red Flags / Concerns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.redFlags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2 text-red-700 dark:text-red-300">
                          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                          <span className="text-sm">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Final Recommendation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className={`border-2 ${
                report.aiRecommendation === "strong_hire" ? "border-green-500 bg-green-50/50 dark:bg-green-950/20" :
                report.aiRecommendation === "hire" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" :
                report.aiRecommendation === "maybe" ? "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20" :
                "border-red-500 bg-red-50/50 dark:bg-red-950/20"
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-full ${recommendation.bg}`}>
                        <RecommendationIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">AI Recommendation: {recommendation.text}</h3>
                        <p className="text-muted-foreground">
                          Based on interview performance and competency assessment
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold">{report.percentageScore}%</p>
                      <p className="text-sm text-muted-foreground">Overall Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
