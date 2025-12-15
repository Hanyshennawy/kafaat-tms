import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertTriangle,
  Timer,
} from "lucide-react";
import { useLocation } from "wouter";

// Mock exam data
const mockExam = {
  id: 1,
  title: "Mathematics Tier 3 Initial Licensing Exam",
  duration: 120, // minutes
  totalQuestions: 20,
  questions: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    questionText: `Question ${i + 1}: What is the best approach to teach ${getSubject(i)} to students with diverse learning needs?`,
    questionContext: i % 5 === 0 ? `Context: Consider a classroom scenario where students are learning ${getSubject(i)} with varying levels of prior knowledge.` : undefined,
    questionType: "multiple_choice",
    difficultyLevel: getDifficulty(i),
    points: i % 4 === 0 ? 5 : i % 3 === 0 ? 3 : 2,
    options: [
      { id: i * 4 + 1, optionText: "Use differentiated instruction strategies", isCorrect: i % 4 === 0 },
      { id: i * 4 + 2, optionText: "Implement collaborative learning activities", isCorrect: i % 4 === 1 },
      { id: i * 4 + 3, optionText: "Provide individualized support and scaffolding", isCorrect: i % 4 === 2 },
      { id: i * 4 + 4, optionText: "All of the above", isCorrect: i % 4 === 3 },
    ],
  })),
};

function getSubject(index: number) {
  const subjects = ["algebra", "geometry", "statistics", "calculus", "trigonometry"];
  return subjects[index % subjects.length];
}

function getDifficulty(index: number) {
  const difficulties = ["basic", "intermediate", "advanced", "expert"];
  return difficulties[index % difficulties.length];
}

export default function TakeExam() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(mockExam.duration * 60); // in seconds
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto submit
          handleSubmit();
          return 0;
        }
        
        // Show warnings
        if (prev === 600) { // 10 minutes
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 5000);
        }
        if (prev === 300) { // 5 minutes
          setShowTimeWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Prevent page refresh during exam
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 300) return 'text-red-600'; // 5 minutes
    if (timeRemaining <= 600) return 'text-yellow-600'; // 10 minutes
    return 'text-green-600';
  };

  const getTimerBgColor = () => {
    if (timeRemaining <= 300) return 'bg-red-50 border-red-500 border-2';
    if (timeRemaining <= 600) return 'bg-yellow-50 border-yellow-500 border-2';
    return 'bg-green-50 border-green-500';
  };

  const currentQ = mockExam.questions[currentQuestion];
  const progress = (Object.keys(answers).length / mockExam.totalQuestions) * 100;

  const handleAnswerChange = (optionId: number) => {
    setAnswers({ ...answers, [currentQ.id]: optionId });
  };

  const handleFlag = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQ.id)) {
      newFlagged.delete(currentQ.id);
    } else {
      newFlagged.add(currentQ.id);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < mockExam.totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Mock submission - in real app, submit to backend
    const attemptId = Math.floor(Math.random() * 1000);
    setLocation(`/exams/results/${attemptId}`);
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = mockExam.totalQuestions - answeredCount;

  return (
    <div className="container py-8 max-w-7xl">
      {/* Time Warning Alert */}
      {showTimeWarning && (
        <Alert className="mb-4 border-red-500 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-900 font-semibold">
            {timeRemaining <= 300 ? "⚠️ Only 5 minutes remaining! The exam will auto-submit when time expires." : "⚠️ 10 minutes remaining!"}
          </AlertDescription>
        </Alert>
      )}

      {/* Header with Timer */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{mockExam.title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {mockExam.totalQuestions}
            </p>
          </div>
          
          {/* Countdown Timer - Fixed Position */}
          <Card className={`${getTimerBgColor()} ${timeRemaining <= 300 ? 'animate-pulse' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Timer className={`h-6 w-6 ${getTimerColor()}`} />
                <div>
                  <div className={`text-3xl font-bold font-mono ${getTimerColor()}`}>
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs text-muted-foreground">Time Remaining</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress: {answeredCount} / {mockExam.totalQuestions} answered</span>
            <span className="text-muted-foreground">{progress.toFixed(0)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main Question Area */}
        <div className="space-y-6">
          {/* Question Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{currentQ.difficultyLevel}</Badge>
                    <Badge variant="outline">{currentQ.points} points</Badge>
                    {flaggedQuestions.has(currentQ.id) && (
                      <Badge variant="destructive">
                        <Flag className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">Question {currentQuestion + 1}</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFlag}
                  className={flaggedQuestions.has(currentQ.id) ? "border-red-500" : ""}
                >
                  <Flag className={`h-4 w-4 ${flaggedQuestions.has(currentQ.id) ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Context */}
              {currentQ.questionContext && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Context:</p>
                  <p>{currentQ.questionContext}</p>
                </div>
              )}

              {/* Question Text */}
              <div>
                <p className="text-lg font-medium">{currentQ.questionText}</p>
              </div>

              {/* Options */}
              <RadioGroup
                value={answers[currentQ.id]?.toString()}
                onValueChange={(value) => handleAnswerChange(parseInt(value))}
              >
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-accent ${
                        answers[currentQ.id] === option.id ? "border-primary bg-accent" : "border-gray-200"
                      }`}
                    >
                      <RadioGroupItem value={option.id.toString()} id={option.id.toString()} />
                      <Label htmlFor={option.id.toString()} className="flex-1 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="flex-1">{option.optionText}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentQuestion + 1} / {mockExam.totalQuestions}
                </span>
                {currentQuestion < mockExam.totalQuestions - 1 ? (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={() => setShowSubmitDialog(true)}>
                    Submit Exam
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Question Navigator */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Navigator</CardTitle>
              <CardDescription>
                Click on any question to jump to it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {mockExam.questions.map((q, index) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isFlagged = flaggedQuestions.has(q.id);
                  const isCurrent = index === currentQuestion;

                  return (
                    <Button
                      key={q.id}
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      className={`h-12 relative ${
                        isAnswered && !isCurrent ? "border-green-500" : ""
                      } ${isFlagged ? "border-red-500" : ""}`}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                      {isAnswered && (
                        <CheckCircle2 className="h-3 w-3 absolute top-1 right-1 text-green-600" />
                      )}
                      {isFlagged && (
                        <Flag className="h-3 w-3 absolute bottom-1 right-1 text-red-600 fill-red-600" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Answered:</span>
                <Badge variant="default">{answeredCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Unanswered:</span>
                <Badge variant="secondary">{unansweredCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Flagged:</span>
                <Badge variant="destructive">{flaggedQuestions.size}</Badge>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => setShowSubmitDialog(true)}
              >
                Submit Exam
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your exam? You won't be able to change your answers after submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <span>Answered Questions:</span>
              <span className="font-semibold">{answeredCount} / {mockExam.totalQuestions}</span>
            </div>
            {unansweredCount > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. These will be marked as incorrect.
                </AlertDescription>
              </Alert>
            )}
            {flaggedQuestions.size > 0 && (
              <Alert>
                <Flag className="h-4 w-4" />
                <AlertDescription>
                  You have {flaggedQuestions.size} flagged question{flaggedQuestions.size > 1 ? 's' : ''}. Make sure you've reviewed them.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Confirm Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
