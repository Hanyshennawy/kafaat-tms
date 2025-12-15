import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Award,
  TrendingUp,
  Target,
  BarChart3,
  FileText,
  Home
} from "lucide-react";
import { useLocation } from "wouter";

export default function ExamReview() {
  const [, params] = useRoute("/exams/review/:attemptId");
  const [, setLocation] = useLocation();
  const attemptId = params?.attemptId ? parseInt(params.attemptId) : 0;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: reviewData, isLoading } = trpc.questionBank.getExamReview.useQuery(
    { attemptId },
    { enabled: attemptId > 0 }
  );

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Exam Review Not Found</CardTitle>
            <CardDescription>The exam review you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/exams")}>
              <Home className="h-4 w-4 mr-2" />
              Back to Exams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { attempt, answers, analytics } = reviewData;
  const currentAnswer = answers[currentQuestionIndex];

  const getAnswerStatusColor = (isCorrect: boolean) => {
    return isCorrect ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";
  };

  const getAnswerStatusIcon = (isCorrect: boolean) => {
    return isCorrect ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  return (
    <div className="container py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Exam Review</h1>
            <p className="text-muted-foreground">{attempt.examTitle}</p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/exams")}>
            <Home className="h-4 w-4 mr-2" />
            Back to Exams
          </Button>
        </div>

        {/* Overall Score Card */}
        <Card className={attempt.passed ? "border-green-500" : "border-red-500"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {attempt.passed ? "Congratulations! You Passed" : "Not Passed"}
                </CardTitle>
                <CardDescription>
                  Completed on {new Date(attempt.completedAt).toLocaleString()}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">
                  {analytics.scorePercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {analytics.correctAnswers} / {analytics.totalQuestions} correct
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress 
              value={analytics.scorePercentage} 
              className="h-3"
            />
            <div className="mt-2 text-sm text-muted-foreground">
              Passing score: {attempt.passingScore}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="questions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions">
            <FileText className="h-4 w-4 mr-2" />
            Questions Review
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance Analytics
          </TabsTrigger>
          <TabsTrigger value="summary">
            <Award className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
        </TabsList>

        {/* Questions Review Tab */}
        <TabsContent value="questions" className="space-y-6">
          {/* Question Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question {currentQuestionIndex + 1} of {answers.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {answers.map((answer: any, index: number) => (
                  <Button
                    key={index}
                    variant={currentQuestionIndex === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-12 h-12 ${
                      answer.isCorrect 
                        ? "border-green-500 hover:border-green-600" 
                        : "border-red-500 hover:border-red-600"
                    }`}
                  >
                    {index + 1}
                    {answer.isCorrect ? (
                      <CheckCircle2 className="h-3 w-3 absolute top-1 right-1 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 absolute top-1 right-1 text-red-600" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Question Details */}
          {currentAnswer && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getAnswerStatusIcon(currentAnswer.isCorrect)}
                      <Badge variant="outline">{currentAnswer.difficulty_level}</Badge>
                      <Badge variant="outline">{currentAnswer.points} points</Badge>
                    </div>
                    <CardTitle className="text-xl">
                      Question {currentQuestionIndex + 1}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Context */}
                {currentAnswer.question_context && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Context:</p>
                    <p>{currentAnswer.question_context}</p>
                  </div>
                )}

                {/* Question Text */}
                <div>
                  <p className="text-lg font-medium">{currentAnswer.question_text}</p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentAnswer.options.map((option: string, index: number) => {
                    const isSelected = currentAnswer.selectedAnswer === index;
                    const isCorrect = currentAnswer.correctAnswer === index;
                    
                    let className = "p-4 border-2 rounded-lg ";
                    if (isCorrect) {
                      className += "border-green-500 bg-green-50";
                    } else if (isSelected && !isCorrect) {
                      className += "border-red-500 bg-red-50";
                    } else {
                      className += "border-gray-200";
                    }

                    return (
                      <div key={index} className={className}>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="flex-1">
                            <p>{option}</p>
                          </div>
                          <div className="flex-shrink-0">
                            {isCorrect && (
                              <Badge className="bg-green-600">Correct Answer</Badge>
                            )}
                            {isSelected && !isCorrect && (
                              <Badge variant="destructive">Your Answer</Badge>
                            )}
                            {isSelected && isCorrect && (
                              <Badge className="bg-green-600">Your Answer ✓</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="font-semibold text-blue-900 mb-2">Explanation:</p>
                  <p className="text-blue-800">{currentAnswer.explanation}</p>
                </div>

                {/* Tags */}
                {currentAnswer.tags && currentAnswer.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Competency Areas:</p>
                    <div className="flex flex-wrap gap-2">
                      {(typeof currentAnswer.tags === 'string' 
                        ? JSON.parse(currentAnswer.tags) 
                        : currentAnswer.tags
                      ).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {answers.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(Math.min(answers.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === answers.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance by Difficulty */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance by Difficulty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.byDifficulty.map((item: any) => (
                  <div key={item.level}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{item.level}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.correct} / {item.total} ({item.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance by Topic */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance by Competency
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.byTopic.slice(0, 5).map((item: any) => (
                  <div key={item.topic}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.topic}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.correct} / {item.total} ({item.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{analytics.totalQuestions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Correct Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">
                  {analytics.correctAnswers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Incorrect Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-red-600">
                  {analytics.incorrectAnswers}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.byTopic
                .filter((item: any) => item.percentage < 70)
                .map((item: any) => (
                  <div key={item.topic} className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <p className="font-semibold text-yellow-900">
                      Focus on: {item.topic}
                    </p>
                    <p className="text-sm text-yellow-800 mt-1">
                      You scored {item.percentage.toFixed(0)}% in this area. Consider reviewing related materials and practicing more questions.
                    </p>
                  </div>
                ))}
              
              {analytics.byTopic.filter((item: any) => item.percentage < 70).length === 0 && (
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <p className="font-semibold text-green-900">
                    Excellent Performance!
                  </p>
                  <p className="text-sm text-green-800 mt-1">
                    You've demonstrated strong competency across all areas. Keep up the great work!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
