import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardList, Users, Clock, BarChart3, CheckCircle2,
  ChevronLeft, ChevronRight, Send, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

interface SurveyQuestion {
  id: number;
  text: string;
  type: "rating" | "multiple_choice" | "text" | "likert";
  options?: string[];
  required: boolean;
}

interface SurveySection {
  id: number;
  title: string;
  description: string;
  questions: SurveyQuestion[];
}

export default function SurveyDetails() {
  const params = useParams();
  const [, navigate] = useLocation();
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<number, string | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo survey data
  const survey = {
    id: params.id || "1",
    title: "Employee Engagement Survey 2024",
    description: "Help us understand your workplace experience and identify areas for improvement.",
    status: "active",
    dueDate: "2024-12-31",
    estimatedTime: "15 minutes",
    completedResponses: 156,
    totalInvited: 250,
    anonymous: true,
  };

  const sections: SurveySection[] = [
    {
      id: 1,
      title: "Work Environment",
      description: "Questions about your daily work environment and conditions",
      questions: [
        { id: 1, text: "I have the tools and resources I need to do my job effectively.", type: "likert", required: true },
        { id: 2, text: "My workplace is safe and comfortable.", type: "likert", required: true },
        { id: 3, text: "I have a good work-life balance.", type: "likert", required: true },
      ],
    },
    {
      id: 2,
      title: "Leadership & Management",
      description: "Questions about leadership and management effectiveness",
      questions: [
        { id: 4, text: "My manager provides clear direction and expectations.", type: "likert", required: true },
        { id: 5, text: "I receive regular feedback on my performance.", type: "likert", required: true },
        { id: 6, text: "Leadership communicates the organization's vision effectively.", type: "likert", required: true },
      ],
    },
    {
      id: 3,
      title: "Growth & Development",
      description: "Questions about career growth and professional development",
      questions: [
        { id: 7, text: "I have opportunities to learn and develop new skills.", type: "likert", required: true },
        { id: 8, text: "I see a clear path for career advancement.", type: "likert", required: true },
        { id: 9, text: "The organization supports my professional development goals.", type: "likert", required: true },
      ],
    },
    {
      id: 4,
      title: "Team & Culture",
      description: "Questions about team dynamics and organizational culture",
      questions: [
        { id: 10, text: "I feel valued and respected by my colleagues.", type: "likert", required: true },
        { id: 11, text: "There is good collaboration within my team.", type: "likert", required: true },
        { id: 12, text: "The organization promotes diversity and inclusion.", type: "likert", required: true },
      ],
    },
    {
      id: 5,
      title: "Additional Feedback",
      description: "Share any additional thoughts or suggestions",
      questions: [
        { id: 13, text: "What do you enjoy most about working here?", type: "text", required: false },
        { id: 14, text: "What areas do you think need improvement?", type: "text", required: false },
        { id: 15, text: "Any other comments or suggestions?", type: "text", required: false },
      ],
    },
  ];

  const likertOptions = [
    { value: "1", label: "Strongly Disagree" },
    { value: "2", label: "Disagree" },
    { value: "3", label: "Neutral" },
    { value: "4", label: "Agree" },
    { value: "5", label: "Strongly Agree" },
  ];

  const handleResponseChange = (questionId: number, value: string | number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateProgress = () => {
    const totalQuestions = sections.reduce((sum, s) => sum + s.questions.filter(q => q.required).length, 0);
    const answeredQuestions = Object.keys(responses).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast.success("Survey submitted successfully! Thank you for your feedback.");
    navigate("/engagement/surveys");
  };

  const currentSectionData = sections[currentSection];
  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" className="mb-2 -ml-2" onClick={() => navigate("/engagement/surveys")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Surveys
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-indigo-600" />
            {survey.title}
          </h1>
          <p className="text-muted-foreground mt-1">{survey.description}</p>
        </div>
        <div className="text-right space-y-1">
          <Badge variant={survey.status === "active" ? "default" : "secondary"}>
            {survey.status === "active" ? "Active" : "Closed"}
          </Badge>
          {survey.anonymous && (
            <p className="text-xs text-muted-foreground">🔒 Anonymous Survey</p>
          )}
        </div>
      </div>

      {/* Survey Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Estimated Time</p>
                <p className="font-semibold">{survey.estimatedTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Responses</p>
                <p className="font-semibold">{survey.completedResponses} / {survey.totalInvited}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="font-semibold">{Math.round((survey.completedResponses / survey.totalInvited) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Your Progress</p>
                <p className="font-semibold">{progress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Survey Progress</span>
            <span className="text-sm text-muted-foreground">{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(idx)}
                className={`flex flex-col items-center ${
                  idx === currentSection ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  idx < currentSection
                    ? "bg-green-500 text-white"
                    : idx === currentSection
                    ? "bg-primary text-white"
                    : "bg-muted"
                }`}>
                  {idx < currentSection ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                <span className="text-xs mt-1 hidden md:block max-w-[80px] truncate">
                  {section.title}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Survey Questions */}
      <Card>
        <CardHeader>
          <CardTitle>{currentSectionData.title}</CardTitle>
          <CardDescription>{currentSectionData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {currentSectionData.questions.map((question, qIdx) => (
            <div key={question.id} className="space-y-4">
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {qIdx + 1}.
                </span>
                <Label className="text-base">
                  {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              </div>

              {question.type === "likert" && (
                <RadioGroup
                  value={responses[question.id]?.toString() || ""}
                  onValueChange={(value) => handleResponseChange(question.id, value)}
                  className="flex flex-wrap gap-3"
                >
                  {likertOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`q${question.id}-${option.value}`} />
                      <Label htmlFor={`q${question.id}-${option.value}`} className="text-sm cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === "text" && (
                <Textarea
                  placeholder="Enter your response..."
                  value={responses[question.id]?.toString() || ""}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  rows={4}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSection(prev => prev - 1)}
          disabled={currentSection === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Section
        </Button>
        
        {currentSection < sections.length - 1 ? (
          <Button onClick={() => setCurrentSection(prev => prev + 1)}>
            Next Section
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Survey"}
          </Button>
        )}
      </div>
    </div>
  );
}
