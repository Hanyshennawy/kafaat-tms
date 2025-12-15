import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  Target,
  TrendingUp,
  Home,
  RotateCcw,
} from "lucide-react";
import { useLocation } from "wouter";

export default function ExamResults() {
  const [, setLocation] = useLocation();
  
  // Parse query params (in real app, get from backend)
  const urlParams = new URLSearchParams(window.location.search);
  const score = parseInt(urlParams.get("score") || "75");
  const correct = parseInt(urlParams.get("correct") || "38");
  const total = parseInt(urlParams.get("total") || "50");
  
  const passed = score >= 75;
  const incorrect = total - correct;

  const performanceByDifficulty = [
    { level: "Basic", correct: 12, total: 15, percentage: 80 },
    { level: "Intermediate", correct: 15, total: 20, percentage: 75 },
    { level: "Advanced", correct: 8, total: 10, percentage: 80 },
    { level: "Expert", correct: 3, total: 5, percentage: 60 },
  ];

  const performanceByTopic = [
    { topic: "Pedagogical Knowledge", correct: 15, total: 18, percentage: 83 },
    { topic: "Subject Matter Expertise", correct: 12, total: 15, percentage: 80 },
    { topic: "Assessment Methods", correct: 6, total: 8, percentage: 75 },
    { topic: "Classroom Management", correct: 5, total: 9, percentage: 56 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-5xl">
        {/* Header Card */}
        <Card className={`mb-8 ${passed ? "border-green-500 border-2" : "border-red-500 border-2"}`}>
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              {passed ? (
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl mb-2">
              {passed ? "Congratulations! You Passed!" : "Exam Not Passed"}
            </CardTitle>
            <CardDescription className="text-lg">
              Mathematics Tier 3 Initial Licensing Exam
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold mb-2" style={{ color: passed ? "#16a34a" : "#dc2626" }}>
                {score}%
              </div>
              <p className="text-muted-foreground">
                {correct} out of {total} questions correct
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{correct}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{incorrect}</div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">75%</div>
                  <div className="text-sm text-muted-foreground">Passing Score</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={() => setLocation("/exams")} variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Back to Exams
              </Button>
              {!passed && (
                <Button onClick={() => setLocation("/exams")}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Exam
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance by Difficulty */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance by Difficulty Level
            </CardTitle>
            <CardDescription>
              Your performance across different difficulty levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceByDifficulty.map((item) => (
              <div key={item.level}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.level}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {item.correct}/{item.total} correct
                    </span>
                  </div>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance by Topic */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance by Topic
            </CardTitle>
            <CardDescription>
              Identify your strengths and areas for improvement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceByTopic.map((item) => (
              <div key={item.topic}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium">{item.topic}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.correct}/{item.total} correct
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.percentage}%</span>
                    {item.percentage >= 75 ? (
                      <Badge className="bg-green-500">Strong</Badge>
                    ) : item.percentage >= 60 ? (
                      <Badge className="bg-yellow-500">Fair</Badge>
                    ) : (
                      <Badge className="bg-red-500">Needs Improvement</Badge>
                    )}
                  </div>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Based on your performance, here are some suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!passed && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Retake Required</h4>
                <p className="text-sm text-red-700">
                  You need to score at least 75% to pass this exam. Review the areas where you scored below 60% and retake the exam when ready.
                </p>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Focus on Classroom Management</h4>
              <p className="text-sm text-blue-700 mb-2">
                Your performance in Classroom Management (56%) needs improvement. Consider:
              </p>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Reviewing behavior management strategies</li>
                <li>Studying effective classroom organization techniques</li>
                <li>Practicing conflict resolution scenarios</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Strong in Pedagogical Knowledge</h4>
              <p className="text-sm text-green-700">
                Excellent work! Your score of 83% in Pedagogical Knowledge demonstrates strong teaching methodology understanding.
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Recommended Resources</h4>
              <ul className="text-sm text-purple-700 space-y-2">
                <li>
                  <strong>Course:</strong> Advanced Classroom Management Techniques
                  <Badge className="ml-2 bg-purple-500">Online</Badge>
                </li>
                <li>
                  <strong>Workshop:</strong> Effective Assessment Strategies for Mathematics
                  <Badge className="ml-2 bg-purple-500">In-Person</Badge>
                </li>
                <li>
                  <strong>Reading:</strong> "Teaching Mathematics in the 21st Century"
                  <Badge className="ml-2 bg-purple-500">Book</Badge>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Exam Details */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Exam Type</div>
                <div className="font-medium">Initial Licensing</div>
              </div>
              <div>
                <div className="text-muted-foreground">License Tier</div>
                <div className="font-medium">Tier 3</div>
              </div>
              <div>
                <div className="text-muted-foreground">Subject Area</div>
                <div className="font-medium">Mathematics</div>
              </div>
              <div>
                <div className="text-muted-foreground">Completion Time</div>
                <div className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  98 minutes
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Attempt Number</div>
                <div className="font-medium">1 of 3</div>
              </div>
              <div>
                <div className="text-muted-foreground">Exam Date</div>
                <div className="font-medium">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
