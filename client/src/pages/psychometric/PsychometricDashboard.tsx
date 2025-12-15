import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Brain, TrendingUp, Users, Award, Plus, Heart, BookOpen, 
  MessageSquare, Lightbulb, Target, Sparkles, Clock, CheckCircle2,
  BarChart3, Radar, GraduationCap, UserCheck, ChevronRight, Star, Trophy
} from "lucide-react";
import { Link } from "wouter";

export default function PsychometricDashboard() {
  const stats = {
    totalAssessments: 156,
    completedTests: 142,
    averageScore: 78,
    pendingReviews: 14,
  };

  // Educator-specific assessment types
  const assessmentTypes = [
    { 
      id: "personality", 
      name: "Personality Assessment (Big Five)", 
      icon: Brain, 
      description: "Understand your core personality traits",
      duration: "25 min",
      questions: 50,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      path: "/psychometric/take-assessment?type=personality"
    },
    { 
      id: "eq", 
      name: "Emotional Intelligence (EQ)", 
      icon: Heart, 
      description: "Measure your emotional awareness & empathy",
      duration: "20 min",
      questions: 40,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      path: "/psychometric/take-assessment?type=eq"
    },
    { 
      id: "teaching-style", 
      name: "Teaching Style Inventory", 
      icon: BookOpen, 
      description: "Discover your instructional approach",
      duration: "15 min",
      questions: 30,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      path: "/psychometric/take-assessment?type=teaching-style"
    },
    { 
      id: "leadership", 
      name: "Instructional Leadership", 
      icon: GraduationCap, 
      description: "Assess your leadership potential in education",
      duration: "20 min",
      questions: 35,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      path: "/psychometric/take-assessment?type=leadership"
    },
    { 
      id: "classroom-mgmt", 
      name: "Classroom Management Style", 
      icon: Users, 
      description: "Identify your classroom management approach",
      duration: "15 min",
      questions: 25,
      color: "text-green-600",
      bgColor: "bg-green-100",
      path: "/psychometric/take-assessment?type=classroom-mgmt"
    },
    { 
      id: "growth-mindset", 
      name: "Growth Mindset Evaluation", 
      icon: Lightbulb, 
      description: "Measure your openness to learning & growth",
      duration: "10 min",
      questions: 20,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      path: "/psychometric/take-assessment?type=growth-mindset"
    },
    { 
      id: "communication", 
      name: "Communication Style", 
      icon: MessageSquare, 
      description: "Understand how you communicate with students",
      duration: "12 min",
      questions: 24,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      path: "/psychometric/take-assessment?type=communication"
    },
    { 
      id: "cognitive", 
      name: "Cognitive Ability Tests", 
      icon: Target, 
      description: "Assess problem-solving & analytical skills",
      duration: "30 min",
      questions: 45,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      path: "/psychometric/take-assessment?type=cognitive"
    },
  ];

  // Trait scores for radar chart (simplified visual)
  const traitScores = [
    { trait: "Openness", score: 82, color: "bg-purple-500" },
    { trait: "Conscientiousness", score: 75, color: "bg-blue-500" },
    { trait: "Extraversion", score: 68, color: "bg-green-500" },
    { trait: "Agreeableness", score: 88, color: "bg-pink-500" },
    { trait: "Emotional Stability", score: 71, color: "bg-amber-500" },
  ];

  // Recent assessments
  const recentAssessments = [
    { 
      id: 1, 
      name: "Big Five Personality", 
      date: "Dec 10, 2025", 
      score: 82, 
      status: "completed",
      icon: Brain
    },
    { 
      id: 2, 
      name: "Emotional Intelligence", 
      date: "Dec 8, 2025", 
      score: 76, 
      status: "completed",
      icon: Heart
    },
    { 
      id: 3, 
      name: "Teaching Style Inventory", 
      date: "Dec 5, 2025", 
      score: 89, 
      status: "completed",
      icon: BookOpen
    },
    { 
      id: 4, 
      name: "Leadership Assessment", 
      date: "In Progress", 
      score: 45, 
      status: "in-progress",
      icon: GraduationCap
    },
  ];

  // Top performers
  const topEducators = [
    { name: "Sarah Al-Rashid", role: "Science Teacher", score: 94, avatar: "SA" },
    { name: "Ahmad Khalil", role: "Math Department Head", score: 91, avatar: "AK" },
    { name: "Fatima Hassan", role: "English Teacher", score: 89, avatar: "FH" },
  ];

  // Score trends data (last 6 months)
  const scoreTrends = [
    { month: "Jul", score: 72 },
    { month: "Aug", score: 74 },
    { month: "Sep", score: 76 },
    { month: "Oct", score: 75 },
    { month: "Nov", score: 78 },
    { month: "Dec", score: 82 },
  ];
  const maxScore = Math.max(...scoreTrends.map(s => s.score));

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Psychometric Assessments</h1>
          <p className="text-muted-foreground">
            Comprehensive psychological and cognitive assessments for educators
          </p>
        </div>
        <Link href="/psychometric/take-assessment">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Take Assessment
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Total Assessments
            </CardDescription>
            <CardTitle className="text-3xl">{stats.totalAssessments}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Completed Tests
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.completedTests}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Score
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.averageScore}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pending Reviews
            </CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pendingReviews}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Score Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Score Trends
            </CardTitle>
            <CardDescription>Your assessment performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-4">
              {scoreTrends.map((item, index) => (
                <TooltipProvider key={item.month}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                          style={{ height: `${(item.score / 100) * 160}px` }}
                        />
                        <span className="text-xs text-muted-foreground">{item.month}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.month}: {item.score}%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>+10% improvement over last 6 months</span>
            </div>
          </CardContent>
        </Card>

        {/* Personality Traits Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radar className="h-5 w-5" />
              Trait Profile
            </CardTitle>
            <CardDescription>Big Five Personality Scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {traitScores.map((trait) => (
              <div key={trait.trait} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{trait.trait}</span>
                  <span className="font-medium">{trait.score}%</span>
                </div>
                <Progress value={trait.score} className="h-2" />
              </div>
            ))}
            <div className="pt-2">
              <Link href="/psychometric/results">
                <Button variant="outline" className="w-full" size="sm">
                  View Full Analysis
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Types Grid */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Educator Assessment Library
          </CardTitle>
          <CardDescription>Comprehensive assessments designed specifically for educators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {assessmentTypes.map((assessment) => (
              <Link key={assessment.id} href={assessment.path}>
                <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 h-full">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${assessment.bgColor} flex items-center justify-center mb-3`}>
                      <assessment.icon className={`h-5 w-5 ${assessment.color}`} />
                    </div>
                    <h4 className="font-medium text-sm mb-1">{assessment.name}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{assessment.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {assessment.duration}
                      </span>
                      <span>{assessment.questions} questions</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Assessments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Assessments
            </CardTitle>
            <CardDescription>Your latest test results and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    assessment.status === 'completed' ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    <assessment.icon className={`h-5 w-5 ${
                      assessment.status === 'completed' ? 'text-green-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{assessment.name}</h4>
                      {assessment.status === 'in-progress' && (
                        <Badge variant="outline" className="text-xs">In Progress</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{assessment.date}</p>
                  </div>
                  <div className="text-right">
                    {assessment.status === 'completed' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">{assessment.score}%</span>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-24">
                        <Progress value={assessment.score} className="h-2" />
                        <span className="text-xs text-muted-foreground">{assessment.score}% complete</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/psychometric/results">
                <Button variant="outline" className="w-full">
                  View All Results
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Top Performers
            </CardTitle>
            <CardDescription>Highest scoring educators this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topEducators.map((educator, index) => (
                <div key={educator.name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {educator.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{educator.name}</p>
                    <p className="text-xs text-muted-foreground">{educator.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold">{educator.score}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-sm">Your Ranking</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">#12 <span className="text-sm font-normal text-muted-foreground">out of 156 educators</span></p>
              <p className="text-xs text-muted-foreground mt-1">Top 8% performer - Keep it up!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
