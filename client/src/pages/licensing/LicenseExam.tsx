import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Clock,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Flag,
  Timer,
  ClipboardCheck,
  Target,
  Award,
  RotateCcw,
  Home,
  BookOpen,
  Loader2,
  Play,
  Pause,
  AlertCircle
} from "lucide-react";

// Mock exam questions
const EXAM_QUESTIONS = [
  {
    id: 1,
    question: "According to UAE education regulations, what is the minimum student-teacher ratio required for primary schools?",
    options: [
      { id: "a", text: "1:15" },
      { id: "b", text: "1:20" },
      { id: "c", text: "1:25" },
      { id: "d", text: "1:30" },
    ],
    correctAnswer: "c",
    category: "Regulations",
  },
  {
    id: 2,
    question: "Which of the following is NOT a core competency in the UAE Teacher Professional Standards?",
    options: [
      { id: "a", text: "Planning and implementing effective teaching" },
      { id: "b", text: "Creating safe learning environments" },
      { id: "c", text: "Student marketing and enrollment" },
      { id: "d", text: "Professional development and ethics" },
    ],
    correctAnswer: "c",
    category: "Standards",
  },
  {
    id: 3,
    question: "A teacher notices signs of potential child abuse. According to UAE child protection laws, what is the correct first step?",
    options: [
      { id: "a", text: "Confront the suspected abuser directly" },
      { id: "b", text: "Report to school administration and child protection officer" },
      { id: "c", text: "Discuss with other teachers first" },
      { id: "d", text: "Wait to gather more evidence" },
    ],
    correctAnswer: "b",
    category: "Child Safety",
  },
  {
    id: 4,
    question: "When implementing differentiated instruction, which approach is most appropriate for students with diverse learning needs?",
    options: [
      { id: "a", text: "Teaching all students at the same pace" },
      { id: "b", text: "Grouping students strictly by ability" },
      { id: "c", text: "Providing varied learning activities based on readiness" },
      { id: "d", text: "Only focusing on advanced learners" },
    ],
    correctAnswer: "c",
    category: "Pedagogy",
  },
  {
    id: 5,
    question: "What is the recommended frequency for Continuing Professional Development (CPD) activities for licensed educators in the UAE?",
    options: [
      { id: "a", text: "Once per academic year" },
      { id: "b", text: "Minimum 40 hours over two years" },
      { id: "c", text: "Only when renewing license" },
      { id: "d", text: "No specific requirement" },
    ],
    correctAnswer: "b",
    category: "Professional Development",
  },
  {
    id: 6,
    question: "Which assessment method is most appropriate for evaluating 21st-century skills like collaboration and critical thinking?",
    options: [
      { id: "a", text: "Multiple choice tests only" },
      { id: "b", text: "Project-based assessments with rubrics" },
      { id: "c", text: "Memorization-based exams" },
      { id: "d", text: "Attendance records" },
    ],
    correctAnswer: "b",
    category: "Assessment",
  },
  {
    id: 7,
    question: "According to UAE education policy, what language must be used for teaching national identity subjects?",
    options: [
      { id: "a", text: "English only" },
      { id: "b", text: "Arabic" },
      { id: "c", text: "Any language preferred by the school" },
      { id: "d", text: "Bilingual (Arabic and English)" },
    ],
    correctAnswer: "b",
    category: "Curriculum",
  },
  {
    id: 8,
    question: "A student with special educational needs (SEN) requires accommodations during exams. What is the teacher's primary responsibility?",
    options: [
      { id: "a", text: "Treat them exactly like other students" },
      { id: "b", text: "Implement the documented Individual Education Plan (IEP)" },
      { id: "c", text: "Exempt them from all assessments" },
      { id: "d", text: "Assign a separate teacher" },
    ],
    correctAnswer: "b",
    category: "Inclusive Education",
  },
  {
    id: 9,
    question: "What is the primary purpose of formative assessment in the classroom?",
    options: [
      { id: "a", text: "To grade students at the end of term" },
      { id: "b", text: "To provide ongoing feedback and guide instruction" },
      { id: "c", text: "To rank students against each other" },
      { id: "d", text: "To satisfy regulatory requirements" },
    ],
    correctAnswer: "b",
    category: "Assessment",
  },
  {
    id: 10,
    question: "When using technology in the classroom, which consideration is most important according to digital citizenship guidelines?",
    options: [
      { id: "a", text: "Using the most expensive devices" },
      { id: "b", text: "Student safety, privacy, and responsible use" },
      { id: "c", text: "Replacing all traditional teaching methods" },
      { id: "d", text: "Allowing unrestricted internet access" },
    ],
    correctAnswer: "b",
    category: "Technology",
  },
];

// Exam states
type ExamState = "instructions" | "in-progress" | "review" | "completed";

export default function LicenseExam() {
  const [, setLocation] = useLocation();
  const [examState, setExamState] = useState<ExamState>("instructions");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(120 * 60); // 120 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [examResults, setExamResults] = useState<{
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    categoryScores: Record<string, { correct: number; total: number }>;
  } | null>(null);

  // Timer effect
  useEffect(() => {
    if (examState !== "in-progress" || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, isPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (questionId: number, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < EXAM_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestion(index);
    if (examState === "review") {
      setExamState("in-progress");
    }
  };

  const handleReviewExam = () => {
    setExamState("review");
  };

  const handleSubmitExam = () => {
    // Calculate results
    let correctCount = 0;
    const categoryScores: Record<string, { correct: number; total: number }> = {};

    EXAM_QUESTIONS.forEach((q) => {
      // Initialize category if not exists
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { correct: 0, total: 0 };
      }
      categoryScores[q.category].total++;

      // Check if answer is correct
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
        categoryScores[q.category].correct++;
      }
    });

    const score = Math.round((correctCount / EXAM_QUESTIONS.length) * 100);
    const passed = score >= 70;

    setExamResults({
      score,
      passed,
      correctAnswers: correctCount,
      totalQuestions: EXAM_QUESTIONS.length,
      categoryScores,
    });

    setExamState("completed");

    if (passed) {
      toast.success("Congratulations! You passed the exam!");
    } else {
      toast.error("Unfortunately, you did not pass. You can retake the exam after 7 days.");
    }
  };

  const renderInstructions = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto p-4 bg-blue-100 rounded-full w-fit mb-4">
            <ClipboardCheck className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Licensing Examination</CardTitle>
          <CardDescription>Professional Teaching License - Theory Exam</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exam Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <Timer className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">2 Hours</p>
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <ClipboardCheck className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{EXAM_QUESTIONS.length}</p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <Target className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">70%</p>
              <p className="text-sm text-muted-foreground">Passing Score</p>
            </div>
          </div>

          <Separator />

          {/* Instructions */}
          <div>
            <h4 className="font-semibold mb-3">Exam Instructions</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Read each question carefully before selecting your answer</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>You can flag questions to review later using the flag button</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Navigate between questions using the numbered buttons or arrows</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>You can change your answers at any time before submitting</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>The exam will auto-submit when time expires</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <span>Do not refresh or close the browser during the exam</span>
              </li>
            </ul>
          </div>

          <Separator />

          {/* Topics Covered */}
          <div>
            <h4 className="font-semibold mb-3">Topics Covered</h4>
            <div className="flex flex-wrap gap-2">
              {["Regulations", "Standards", "Child Safety", "Pedagogy", "Assessment", "Curriculum", "Inclusive Education", "Technology"].map(
                (topic) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                )
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg w-full flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <p className="text-sm text-yellow-700">
              Once you start the exam, the timer will begin. Make sure you have a stable internet connection and a quiet environment.
            </p>
          </div>
          <Button size="lg" className="w-full" onClick={() => setExamState("in-progress")}>
            <Play className="mr-2 h-5 w-5" />
            Start Examination
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const renderExamInProgress = () => {
    const question = EXAM_QUESTIONS[currentQuestion];
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / EXAM_QUESTIONS.length) * 100;

    return (
      <div className="space-y-4">
        {/* Timer and Progress Bar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeRemaining < 600 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                }`}>
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
                </div>
                <Badge variant="outline">
                  {answeredCount}/{EXAM_QUESTIONS.length} Answered
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleReviewExam}>
                <BookOpen className="h-4 w-4 mr-2" />
                Review All
              </Button>
            </div>
            <Progress value={progress} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Question Navigator */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {EXAM_QUESTIONS.map((_, index) => (
                  <Button
                    key={index}
                    variant={currentQuestion === index ? "default" : "outline"}
                    size="sm"
                    className={`relative ${
                      answers[EXAM_QUESTIONS[index].id]
                        ? currentQuestion === index
                          ? ""
                          : "bg-green-50 border-green-300 text-green-700"
                        : ""
                    }`}
                    onClick={() => handleGoToQuestion(index)}
                  >
                    {index + 1}
                    {flaggedQuestions.has(EXAM_QUESTIONS[index].id) && (
                      <Flag className="h-3 w-3 text-orange-500 absolute -top-1 -right-1" />
                    )}
                  </Button>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border border-green-300 rounded" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-orange-500" />
                  <span>Flagged</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">{question.category}</Badge>
                  <CardTitle className="text-lg">Question {currentQuestion + 1} of {EXAM_QUESTIONS.length}</CardTitle>
                </div>
                <Button
                  variant={flaggedQuestions.has(question.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFlagQuestion(question.id)}
                >
                  <Flag className={`h-4 w-4 ${flaggedQuestions.has(question.id) ? "fill-current" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg">{question.question}</p>

              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => handleAnswerSelect(question.id, value)}
              >
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                        answers[question.id] === option.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-gray-300"
                      }`}
                      onClick={() => handleAnswerSelect(question.id, option.id)}
                    >
                      <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                      <Label
                        htmlFor={`option-${option.id}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        <span className="font-semibold mr-2">{option.id.toUpperCase()}.</span>
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <div className="flex gap-2">
                {currentQuestion === EXAM_QUESTIONS.length - 1 ? (
                  <Button onClick={handleReviewExam}>
                    Review & Submit
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  };

  const renderReview = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Answers</CardTitle>
          <CardDescription>Review your answers before submitting the exam</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-700">{Object.keys(answers).length}</p>
              <p className="text-sm text-green-600">Answered</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-yellow-700">
                {EXAM_QUESTIONS.length - Object.keys(answers).length}
              </p>
              <p className="text-sm text-yellow-600">Unanswered</p>
            </div>
          </div>

          {flaggedQuestions.size > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Flag className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">Flagged Questions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(flaggedQuestions).map((qId) => {
                  const qIndex = EXAM_QUESTIONS.findIndex((q) => q.id === qId);
                  return (
                    <Button
                      key={qId}
                      variant="outline"
                      size="sm"
                      onClick={() => handleGoToQuestion(qIndex)}
                    >
                      Question {qIndex + 1}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            {EXAM_QUESTIONS.map((q, index) => (
              <div
                key={q.id}
                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer ${
                  answers[q.id] ? "bg-green-50" : "bg-yellow-50"
                }`}
                onClick={() => handleGoToQuestion(index)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">Q{index + 1}</span>
                  {flaggedQuestions.has(q.id) && <Flag className="h-4 w-4 text-orange-500" />}
                </div>
                <Badge variant={answers[q.id] ? "default" : "secondary"}>
                  {answers[q.id] ? `Answered: ${answers[q.id].toUpperCase()}` : "Not Answered"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => setExamState("in-progress")}>
            Continue Exam
          </Button>
          <Button className="flex-1" onClick={handleSubmitExam}>
            Submit Exam
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const renderResults = () => {
    if (!examResults) return null;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className={`mx-auto p-6 rounded-full w-fit ${
              examResults.passed ? "bg-green-100" : "bg-red-100"
            }`}>
              {examResults.passed ? (
                <Award className="h-16 w-16 text-green-600" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600" />
              )}
            </div>
            <CardTitle className={`text-2xl ${examResults.passed ? "text-green-700" : "text-red-700"}`}>
              {examResults.passed ? "Congratulations! You Passed!" : "Exam Not Passed"}
            </CardTitle>
            <CardDescription>
              {examResults.passed
                ? "You have successfully passed the licensing examination"
                : "You did not meet the minimum passing score of 70%"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="p-6 bg-gray-50 rounded-lg">
              <p className="text-6xl font-bold mb-2">{examResults.score}%</p>
              <p className="text-muted-foreground">
                {examResults.correctAnswers} out of {examResults.totalQuestions} correct
              </p>
              <Progress 
                value={examResults.score} 
                className={`h-4 mt-4 ${examResults.passed ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`}
              />
            </div>

            {/* Category Breakdown */}
            <div>
              <h4 className="font-semibold mb-4 text-left">Performance by Category</h4>
              <div className="space-y-3">
                {Object.entries(examResults.categoryScores).map(([category, scores]) => {
                  const percentage = Math.round((scores.correct / scores.total) * 100);
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span className="font-medium">
                          {scores.correct}/{scores.total} ({percentage}%)
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${percentage >= 70 ? "[&>div]:bg-green-500" : "[&>div]:bg-yellow-500"}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Next Steps */}
            <div className="text-left">
              <h4 className="font-semibold mb-3">Next Steps</h4>
              {examResults.passed ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Your exam results have been recorded</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Continue with document verification to complete your application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Your license will be issued within 5-7 business days after verification</span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>You can retake the exam after a 7-day waiting period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Review the training materials focusing on weak areas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-purple-500 mt-0.5" />
                    <span>You have 2 more attempts remaining</span>
                  </li>
                </ul>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => setLocation("/licensing")}>
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            {examResults.passed ? (
              <Button className="flex-1" onClick={() => setLocation("/licensing/new-license")}>
                Continue Application
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button className="flex-1" onClick={() => setLocation("/training")}>
                <BookOpen className="mr-2 h-4 w-4" />
                Review Materials
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header - only show when not in exam */}
      {examState === "instructions" && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/licensing/new-license")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Licensing Examination</h1>
            <p className="text-muted-foreground">Theory exam for professional teaching license</p>
          </div>
        </div>
      )}

      {/* Exam Content */}
      {examState === "instructions" && renderInstructions()}
      {examState === "in-progress" && renderExamInProgress()}
      {examState === "review" && renderReview()}
      {examState === "completed" && renderResults()}
    </div>
  );
}
