import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, ChevronLeft, ChevronRight, CheckCircle2, Send, Clock } from "lucide-react";

const DEMO_SURVEY = {
  id: 1,
  title: "Annual Staff Satisfaction Survey 2024",
  description: "Help us understand your experience working at our school. Your feedback is valuable for improving our workplace environment.",
  sections: [
    {
      id: "work-environment",
      title: "Work Environment",
      questions: [
        { id: 1, text: "I feel supported by my colleagues in my teaching role", type: "rating" },
        { id: 2, text: "I have access to the resources I need to teach effectively", type: "rating" },
        { id: 3, text: "The school environment supports my professional growth", type: "rating" },
      ]
    },
    {
      id: "leadership",
      title: "Leadership & Management",
      questions: [
        { id: 4, text: "School leadership communicates expectations clearly", type: "rating" },
        { id: 5, text: "I receive constructive feedback from my supervisor", type: "rating" },
        { id: 6, text: "Leadership is responsive to teacher concerns", type: "rating" },
      ]
    },
    {
      id: "development",
      title: "Professional Development",
      questions: [
        { id: 7, text: "I have opportunities for professional growth", type: "rating" },
        { id: 8, text: "The CPD programs are relevant to my teaching needs", type: "rating" },
        { id: 9, text: "I am satisfied with my career progression at this school", type: "rating" },
      ]
    },
    {
      id: "feedback",
      title: "Open Feedback",
      questions: [
        { id: 10, text: "What do you like most about working at this school?", type: "text" },
        { id: 11, text: "What improvements would you suggest?", type: "text" },
      ]
    }
  ]
};

const RATING_OPTIONS = [
  { value: "5", label: "Strongly Agree" },
  { value: "4", label: "Agree" },
  { value: "3", label: "Neutral" },
  { value: "2", label: "Disagree" },
  { value: "1", label: "Strongly Disagree" },
];

export default function TakeSurvey() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const survey = DEMO_SURVEY;
  const section = survey.sections[currentSection];
  const totalQuestions = survey.sections.reduce((sum, s) => sum + s.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentSection < survey.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your feedback has been submitted successfully. Your responses are anonymous and will help us improve our school environment.
            </p>
            <Button onClick={() => setLocation("/engagement/surveys")}>Back to Surveys</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Survey Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-2">
                <Clock className="h-3 w-3 mr-1" />~10 minutes
              </Badge>
              <CardTitle>{survey.title}</CardTitle>
              <CardDescription>{survey.description}</CardDescription>
            </div>
            <ClipboardList className="h-10 w-10 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="text-muted-foreground">{answeredQuestions} of {totalQuestions} questions answered</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Section Navigation */}
      <div className="flex gap-2">
        {survey.sections.map((s, index) => (
          <Button
            key={s.id}
            variant={currentSection === index ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentSection(index)}
          >
            {index + 1}. {s.title}
          </Button>
        ))}
      </div>

      {/* Current Section */}
      <Card>
        <CardHeader>
          <CardTitle>{section.title}</CardTitle>
          <CardDescription>Section {currentSection + 1} of {survey.sections.length}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {section.questions.map((question, qIndex) => (
            <div key={question.id} className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {qIndex + 1}
                </span>
                <Label className="text-base leading-relaxed">{question.text}</Label>
              </div>
              
              {question.type === "rating" ? (
                <RadioGroup
                  value={answers[question.id] || ""}
                  onValueChange={(value) => handleAnswer(question.id, value)}
                  className="grid grid-cols-5 gap-2 ml-9"
                >
                  {RATING_OPTIONS.map(option => (
                    <div key={option.value} className="flex flex-col items-center">
                      <RadioGroupItem value={option.value} id={`q${question.id}-${option.value}`} />
                      <Label htmlFor={`q${question.id}-${option.value}`} className="text-xs text-center mt-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Textarea
                  placeholder="Enter your response..."
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  rows={4}
                  className="ml-9"
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSection === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />Previous
        </Button>
        
        {currentSection === survey.sections.length - 1 ? (
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />Submit Survey
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next<ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
