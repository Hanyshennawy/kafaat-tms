import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Target, TrendingUp, Award, ChevronRight, Clock, 
  CheckCircle2, BarChart3, Play, Sparkles, Users, Star,
  ClipboardCheck, BookOpen, Heart, GraduationCap, Trophy
} from "lucide-react";
import { Link } from "wouter";

export default function AssessmentsDashboard() {
  // Overall stats
  const overallStats = {
    totalAssessments: 5,
    completedAssessments: 2,
    inProgressAssessments: 1,
    pendingAssessments: 2,
    averageScore: 82,
  };

  // Competency Assessment Summary
  const competencyStats = {
    lastAssessment: "2024-12-01",
    overallScore: 3.8,
    level: "Proficient",
    domainsAssessed: 4,
    strengths: 3,
    developmentAreas: 2,
    nextDue: "2025-02-15",
  };

  // Psychometric Assessment Summary  
  const psychometricStats = {
    completedTests: 3,
    totalTests: 8,
    personalityCompleted: true,
    eqCompleted: true,
    teachingStyleCompleted: true,
    cognitiveCompleted: false,
    leadershipCompleted: false,
    lastAssessment: "2024-11-15",
  };

  // Recent activity
  const recentActivity = [
    { 
      type: "competency", 
      title: "ACI Annual Competency Assessment", 
      date: "Dec 1, 2024", 
      score: "3.8/5",
      status: "completed" 
    },
    { 
      type: "psychometric", 
      title: "Teaching Style Inventory", 
      date: "Nov 20, 2024", 
      score: "85%",
      status: "completed" 
    },
    { 
      type: "psychometric", 
      title: "Emotional Intelligence (EQ)", 
      date: "Nov 15, 2024", 
      score: "78%",
      status: "completed" 
    },
    { 
      type: "competency", 
      title: "Leadership Readiness Assessment", 
      date: "In Progress", 
      score: "-",
      status: "in_progress" 
    },
  ];

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            Assessments Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive view of your competency and psychometric assessments
          </p>
        </div>
        <Link href="/assessments/take">
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Take Assessment
          </Button>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {overallStats.completedAssessments}/{overallStats.totalAssessments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
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
              {overallStats.inProgressAssessments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Continue where you left</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {overallStats.pendingAssessments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {overallStats.averageScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all assessments</p>
          </CardContent>
        </Card>
      </div>

      {/* Two Assessment Type Cards */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Competency Assessment Card */}
        <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-lg bg-primary/10">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <Badge variant="outline" className="text-primary border-primary">
                ACI Framework
              </Badge>
            </div>
            <CardTitle className="mt-4 text-xl">Competency Assessment</CardTitle>
            <CardDescription>
              AI-powered assessment based on the ACI Educator Competency Framework. 
              Evaluates your professional competencies across teaching, student support, 
              and professional growth domains.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Assessment</span>
                <span className="font-medium">{competencyStats.lastAssessment}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Score</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-600">{competencyStats.overallScore}/5</span>
                  <Badge variant="secondary">{competencyStats.level}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Domains Assessed</span>
                <span className="font-medium">{competencyStats.domainsAssessed} domains</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Next Due</span>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  {competencyStats.nextDue}
                </Badge>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>5-Point Scale Rating</span>
                  <span className="text-muted-foreground">1=Never to 5=Always</span>
                </div>
                <Progress value={competencyStats.overallScore * 20} className="h-2" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Link href="/assessments/competency" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <BarChart3 className="h-4 w-4" />
                View Results
              </Button>
            </Link>
            <Link href="/assessments/take?type=competency" className="flex-1">
              <Button className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                Start Assessment
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Psychometric Assessment Card */}
        <Card className="border-2 border-pink-200 hover:border-pink-400 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-lg bg-pink-100">
                <Brain className="h-8 w-8 text-pink-600" />
              </div>
              <Badge variant="outline" className="text-pink-600 border-pink-300">
                8 Assessment Types
              </Badge>
            </div>
            <CardTitle className="mt-4 text-xl">Psychometric Assessment</CardTitle>
            <CardDescription>
              Comprehensive personality, cognitive, and behavioral assessments. 
              Includes Big Five, Emotional Intelligence, Teaching Style, 
              and Leadership evaluations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tests Completed</span>
                <span className="font-medium">{psychometricStats.completedTests}/{psychometricStats.totalTests}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Assessment</span>
                <span className="font-medium">{psychometricStats.lastAssessment}</span>
              </div>
              <div className="pt-2">
                <div className="text-sm mb-2">Completed Assessments:</div>
                <div className="flex flex-wrap gap-2">
                  {psychometricStats.personalityCompleted && (
                    <Badge variant="secondary" className="gap-1">
                      <Brain className="h-3 w-3" /> Personality
                    </Badge>
                  )}
                  {psychometricStats.eqCompleted && (
                    <Badge variant="secondary" className="gap-1">
                      <Heart className="h-3 w-3" /> EQ
                    </Badge>
                  )}
                  {psychometricStats.teachingStyleCompleted && (
                    <Badge variant="secondary" className="gap-1">
                      <BookOpen className="h-3 w-3" /> Teaching Style
                    </Badge>
                  )}
                </div>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion Progress</span>
                  <span className="text-muted-foreground">
                    {Math.round((psychometricStats.completedTests / psychometricStats.totalTests) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(psychometricStats.completedTests / psychometricStats.totalTests) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Link href="/assessments/psychometric" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <BarChart3 className="h-4 w-4" />
                View Results
              </Button>
            </Link>
            <Link href="/assessments/take?type=psychometric" className="flex-1">
              <Button className="w-full gap-2 bg-pink-600 hover:bg-pink-700">
                <Play className="h-4 w-4" />
                Take Test
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest assessment activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'competency' ? 'bg-primary/10' : 'bg-pink-100'
                  }`}>
                    {activity.type === 'competency' ? (
                      <Target className="h-5 w-5 text-primary" />
                    ) : (
                      <Brain className="h-5 w-5 text-pink-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {activity.status === 'completed' ? (
                    <>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{activity.score}</div>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      <Clock className="h-3 w-3 mr-1" />
                      In Progress
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/assessments/history">
            <Button variant="outline" className="gap-2">
              View All History
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/assessments/take">
            <CardContent className="pt-6 text-center">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Take Assessment</h3>
              <p className="text-sm text-muted-foreground">Start a new assessment</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/assessments/results">
            <CardContent className="pt-6 text-center">
              <div className="p-4 rounded-full bg-green-100 w-fit mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">My Results</h3>
              <p className="text-sm text-muted-foreground">View all your results</p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/assessments/analytics">
            <CardContent className="pt-6 text-center">
              <div className="p-4 rounded-full bg-blue-100 w-fit mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Analytics</h3>
              <p className="text-sm text-muted-foreground">View progress & trends</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
