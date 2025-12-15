import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, Calendar, Clock, Users, Plus, Filter, CheckCircle2, XCircle, AlertCircle,
  Play, FileText, Video, MessageSquare, TrendingUp, Award, BarChart3, Send, Eye,
  Sparkles, Brain, Target, ThumbsUp, ThumbsDown, Minus, Timer, Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

// Demo data
const DEMO_STATS = {
  totalTemplates: 5,
  totalSessions: 6,
  completedSessions: 3,
  scheduledSessions: 2,
  inProgressSessions: 1,
  averageScore: 79.5,
  strongHireCount: 1,
  hireCount: 1,
  maybeCount: 1,
  noHireCount: 0,
};

const DEMO_TEMPLATES = [
  { id: 1, name: "Teacher Screening - General", positionType: "Teacher", duration: 25, questionsCount: 8, sessionsCount: 45, status: "active" },
  { id: 2, name: "Mathematics Teacher - Technical", positionType: "Teacher", subjectArea: "Mathematics", duration: 30, questionsCount: 10, sessionsCount: 23, status: "active" },
  { id: 3, name: "Science Teacher - Lab Skills", positionType: "Teacher", subjectArea: "Science", duration: 35, questionsCount: 12, sessionsCount: 18, status: "active" },
  { id: 4, name: "School Principal - Leadership", positionType: "Principal", duration: 45, questionsCount: 15, sessionsCount: 8, status: "active" },
  { id: 5, name: "Arabic Language Teacher", positionType: "Teacher", subjectArea: "Arabic", duration: 30, questionsCount: 10, sessionsCount: 0, status: "draft" },
];

const DEMO_SESSIONS = [
  { id: 1, candidateName: "Ahmad Al-Rashid", candidatePosition: "Expert Teacher - Mathematics", templateName: "Teacher Screening - General", scheduledAt: new Date("2024-01-25T10:00:00"), status: "completed", percentageScore: 82.5, aiRecommendation: "hire", interviewMode: "video" },
  { id: 2, candidateName: "Sara Abdullah", candidatePosition: "Teacher - Mathematics", templateName: "Mathematics Teacher - Technical", scheduledAt: new Date("2024-01-25T14:00:00"), status: "completed", percentageScore: 91.0, aiRecommendation: "strong_hire", interviewMode: "video" },
  { id: 3, candidateName: "Noura Ahmed", candidatePosition: "Teacher - Arabic", templateName: "Teacher Screening - General", scheduledAt: new Date("2024-01-26T09:00:00"), status: "scheduled", percentageScore: null, aiRecommendation: null, interviewMode: "text" },
  { id: 4, candidateName: "Hassan Ibrahim", candidatePosition: "Teacher - Physics", templateName: "Science Teacher - Lab Skills", scheduledAt: new Date("2024-01-26T11:00:00"), status: "in_progress", percentageScore: null, aiRecommendation: null, interviewMode: "video" },
  { id: 5, candidateName: "Mariam Khalil", candidatePosition: "Teacher - English", templateName: "Teacher Screening - General", scheduledAt: new Date("2024-01-24T15:00:00"), status: "completed", percentageScore: 65.0, aiRecommendation: "maybe", interviewMode: "text" },
  { id: 6, candidateName: "Dr. Khalid Omar", candidatePosition: "School Principal", templateName: "School Principal - Leadership", scheduledAt: new Date("2024-01-27T10:00:00"), status: "scheduled", percentageScore: null, aiRecommendation: null, interviewMode: "video" },
];

const AVAILABLE_CANDIDATES = [
  { id: 107, name: "Fatima Al-Sayed", email: "fatima.alsayed@email.com", position: "Teacher - English" },
  { id: 108, name: "Omar Hassan", email: "omar.hassan@email.com", position: "Expert Teacher - History" },
  { id: 109, name: "Layla Mohammed", email: "layla.m@email.com", position: "Teacher - Art" },
  { id: 110, name: "Youssef Ahmed", email: "youssef.a@email.com", position: "Teacher - Physical Education" },
];

export default function AIInterviewDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [interviewMode, setInterviewMode] = useState("video");
  const [language, setLanguage] = useState("en");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const filteredSessions = statusFilter === "all" 
    ? DEMO_SESSIONS 
    : DEMO_SESSIONS.filter(s => s.status === statusFilter);

  const getRecommendationBadge = (recommendation: string | null) => {
    switch (recommendation) {
      case "strong_hire":
        return <Badge className="bg-green-600"><ThumbsUp className="h-3 w-3 mr-1" />Strong Hire</Badge>;
      case "hire":
        return <Badge className="bg-blue-600"><ThumbsUp className="h-3 w-3 mr-1" />Hire</Badge>;
      case "maybe":
        return <Badge variant="secondary"><Minus className="h-3 w-3 mr-1" />Maybe</Badge>;
      case "no_hire":
        return <Badge variant="destructive"><ThumbsDown className="h-3 w-3 mr-1" />No Hire</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case "scheduled":
        return <Badge variant="outline"><Calendar className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-500"><Play className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "expired":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              AI Interview Simulation
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600">
                <Sparkles className="h-3 w-3 mr-1" />AI Powered
              </Badge>
            </h1>
            <p className="text-muted-foreground">Automated candidate screening with AI-powered interviews and reports</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/recruitment/ai-interview/templates">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />Templates
            </Button>
          </Link>
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                <Plus className="h-4 w-4 mr-2" />Schedule AI Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                  Schedule AI Interview
                </DialogTitle>
                <DialogDescription>
                  Set up an automated AI interview for a candidate
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Interview Template *</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interview template" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEMO_TEMPLATES.filter(t => t.status === "active").map(template => (
                        <SelectItem key={template.id} value={String(template.id)}>
                          {template.name} ({template.duration} min, {template.questionsCount} questions)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Candidate *</Label>
                  <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_CANDIDATES.map(candidate => (
                        <SelectItem key={candidate.id} value={String(candidate.id)}>
                          {candidate.name} - {candidate.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input 
                      type="date" 
                      value={scheduledDate}
                      onChange={e => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time *</Label>
                    <Input 
                      type="time" 
                      value={scheduledTime}
                      onChange={e => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Interview Mode</Label>
                    <Select value={interviewMode} onValueChange={setInterviewMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video"><Video className="h-4 w-4 inline mr-2" />Video Call</SelectItem>
                        <SelectItem value="voice"><MessageSquare className="h-4 w-4 inline mr-2" />Voice Only</SelectItem>
                        <SelectItem value="text"><FileText className="h-4 w-4 inline mr-2" />Text Chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300 flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                    The candidate will receive an email with a unique access link to start their AI interview.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-indigo-600"
                  onClick={() => setIsScheduleDialogOpen(false)}
                >
                  <Send className="h-4 w-4 mr-2" />Schedule & Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{DEMO_STATS.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{DEMO_STATS.completedSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{DEMO_STATS.scheduledSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Play className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{DEMO_STATS.inProgressSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{DEMO_STATS.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              <span className="font-medium">Strong Hire</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{DEMO_STATS.strongHireCount}</span>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThumbsUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Hire</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{DEMO_STATS.hireCount}</span>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50/50 dark:bg-gray-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Minus className="h-5 w-5 text-gray-600" />
              <span className="font-medium">Maybe</span>
            </div>
            <span className="text-2xl font-bold text-gray-600">{DEMO_STATS.maybeCount}</span>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThumbsDown className="h-5 w-5 text-red-600" />
              <span className="font-medium">No Hire</span>
            </div>
            <span className="text-2xl font-bold text-red-600">{DEMO_STATS.noHireCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">All Sessions</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Search by candidate name..." className="max-w-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Sessions List */}
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                              {session.candidateName.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{session.candidateName}</h3>
                              {session.interviewMode === "video" && <Video className="h-4 w-4 text-muted-foreground" />}
                              {session.interviewMode === "text" && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{session.candidatePosition}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <FileText className="h-3 w-3" />{session.templateName}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {session.scheduledAt.toLocaleDateString()}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {session.scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {session.percentageScore !== null && (
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600">{session.percentageScore}%</p>
                              <p className="text-xs text-muted-foreground">AI Score</p>
                            </div>
                          )}
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(session.status)}
                            {getRecommendationBadge(session.aiRecommendation)}
                          </div>
                          {session.status === "completed" && (
                            <Link href={`/recruitment/ai-interview/report/${session.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />View Report
                              </Button>
                            </Link>
                          )}
                          {session.status === "in_progress" && (
                            <Button variant="outline" size="sm" disabled>
                              <Play className="h-4 w-4 mr-1" />In Progress...
                            </Button>
                          )}
                          {session.status === "scheduled" && (
                            <Button variant="outline" size="sm">
                              <Send className="h-4 w-4 mr-1" />Resend Link
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_TEMPLATES.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant={template.status === "active" ? "default" : "secondary"}>
                      {template.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {template.positionType} {template.subjectArea ? `- ${template.subjectArea}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div>
                      <p className="text-lg font-bold">{template.duration}</p>
                      <p className="text-xs text-muted-foreground">Minutes</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{template.questionsCount}</p>
                      <p className="text-xs text-muted-foreground">Questions</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{template.sessionsCount}</p>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />View
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-1" />Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Template Card */}
            <Card className="border-dashed hover:border-purple-400 cursor-pointer transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
                  <Plus className="h-6 w-6 text-purple-600" />
                </div>
                <p className="font-medium">Create New Template</p>
                <p className="text-sm text-muted-foreground text-center">Design a custom AI interview for specific roles</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>90-100% (Excellent)</span>
                      <span className="font-medium">1</span>
                    </div>
                    <Progress value={33} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>70-89% (Good)</span>
                      <span className="font-medium">1</span>
                    </div>
                    <Progress value={33} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>50-69% (Fair)</span>
                      <span className="font-medium">1</span>
                    </div>
                    <Progress value={33} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Below 50% (Poor)</span>
                      <span className="font-medium">0</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competency Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Top Competencies Assessed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span>Communication</span>
                    <Badge variant="secondary">85% avg</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span>Classroom Management</span>
                    <Badge variant="secondary">80% avg</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span>Subject Mastery</span>
                    <Badge variant="secondary">88% avg</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span>Pedagogy</span>
                    <Badge variant="secondary">82% avg</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Time Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-purple-600">12.5</p>
                  <p className="text-muted-foreground">Hours saved this month</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on 25 min avg AI interview vs 1 hour traditional
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Hiring Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  AI Interview Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="flex-1">Scheduled</span>
                    <span className="font-medium">6</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="flex-1">Completed</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="flex-1">Recommended for Hire</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span className="flex-1">Advanced to Final Round</span>
                    <span className="font-medium">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
