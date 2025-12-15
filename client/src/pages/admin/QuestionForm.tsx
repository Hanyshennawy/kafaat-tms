import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, X, Eye } from "lucide-react";
import { toast } from "sonner";

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export default function QuestionForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const isEditMode = !!params.id;

  const [questionText, setQuestionText] = useState("");
  const [questionContext, setQuestionContext] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [difficultyLevel, setDifficultyLevel] = useState("intermediate");
  const [subjectArea, setSubjectArea] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [licenseTier, setLicenseTier] = useState("");
  const [points, setPoints] = useState("1");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: "1", text: "", isCorrect: false },
    { id: "2", text: "", isCorrect: false },
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const addOption = () => {
    setOptions([...options, { id: Date.now().toString(), text: "", isCorrect: false }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      toast.error("A question must have at least 2 options");
      return;
    }
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const updateOption = (id: string, field: "text" | "isCorrect", value: string | boolean) => {
    setOptions(
      options.map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt
      )
    );
  };

  const handleSubmit = () => {
    // Validation
    if (!questionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (questionType === "multiple_choice" || questionType === "true_false") {
      if (!options.some((opt) => opt.isCorrect)) {
        toast.error("Please mark at least one correct answer");
        return;
      }
      if (options.some((opt) => !opt.text.trim())) {
        toast.error("All options must have text");
        return;
      }
    }

    // Submit logic here
    toast.success(isEditMode ? "Question updated successfully" : "Question created successfully");
    setLocation("/admin/questions");
  };

  const handleCancel = () => {
    if (confirm("Discard changes?")) {
      setLocation("/admin/questions");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Edit Question" : "Add New Question"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update question details" : "Create a new exam question"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            {isEditMode ? "Update" : "Create"} Question
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Details</CardTitle>
              <CardDescription>Enter the question text and context</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionText">Question Text *</Label>
                <Textarea
                  id="questionText"
                  placeholder="Enter the question..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionContext">Context (Optional)</Label>
                <Textarea
                  id="questionContext"
                  placeholder="Provide additional context or scenario..."
                  value={questionContext}
                  onChange={(e) => setQuestionContext(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Add background information or scenario for the question
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Options (for MCQ and True/False) */}
          {(questionType === "multiple_choice" || questionType === "true_false") && (
            <Card>
              <CardHeader>
                <CardTitle>Answer Options</CardTitle>
                <CardDescription>
                  Add options and mark the correct answer(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {options.map((option, index) => (
                  <div key={option.id} className="flex gap-2 items-start">
                    <div className="flex items-center h-10">
                      <Checkbox
                        checked={option.isCorrect}
                        onCheckedChange={(checked) =>
                          updateOption(option.id, "isCorrect", checked as boolean)
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) => updateOption(option.id, "text", e.target.value)}
                      />
                    </div>
                    {options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(option.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {questionType === "multiple_choice" && (
                  <Button variant="outline" onClick={addOption} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Explanation */}
          <Card>
            <CardHeader>
              <CardTitle>Explanation</CardTitle>
              <CardDescription>
                Provide an explanation for the correct answer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Explain why this is the correct answer..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Set question properties</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionType">Question Type *</Label>
                <Select value={questionType} onValueChange={setQuestionType}>
                  <SelectTrigger id="questionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="scenario">Scenario-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Difficulty Level *</Label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger id="difficultyLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectArea">Subject Area *</Label>
                <Select value={subjectArea} onValueChange={setSubjectArea}>
                  <SelectTrigger id="subjectArea">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pedagogy">Pedagogy</SelectItem>
                    <SelectItem value="Assessment">Assessment</SelectItem>
                    <SelectItem value="Educational Theory">Educational Theory</SelectItem>
                    <SelectItem value="Classroom Management">Classroom Management</SelectItem>
                    <SelectItem value="Curriculum Design">Curriculum Design</SelectItem>
                    <SelectItem value="Technology Integration">Technology Integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobRole">Job Role *</Label>
                <Select value={jobRole} onValueChange={setJobRole}>
                  <SelectTrigger id="jobRole">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Senior Teacher">Senior Teacher</SelectItem>
                    <SelectItem value="Department Head">Department Head</SelectItem>
                    <SelectItem value="Vice Principal">Vice Principal</SelectItem>
                    <SelectItem value="Principal">Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseTier">License Tier *</Label>
                <Select value={licenseTier} onValueChange={setLicenseTier}>
                  <SelectTrigger id="licenseTier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tier 1">Tier 1</SelectItem>
                    <SelectItem value="Tier 2">Tier 2</SelectItem>
                    <SelectItem value="Tier 3">Tier 3</SelectItem>
                    <SelectItem value="Tier 4">Tier 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points *</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max="10"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Badge className="mb-2">{difficultyLevel}</Badge>
                  <p className="font-medium">{questionText || "Question text will appear here..."}</p>
                  {questionContext && (
                    <p className="text-sm text-muted-foreground mt-2">{questionContext}</p>
                  )}
                </div>
                {(questionType === "multiple_choice" || questionType === "true_false") && (
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div
                        key={option.id}
                        className={`p-2 rounded border ${
                          option.isCorrect ? "border-green-500 bg-green-50" : "border-gray-200"
                        }`}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option.text || `Option ${index + 1}`}
                        {option.isCorrect && (
                          <Badge className="ml-2 bg-green-600">Correct</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {explanation && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-muted-foreground">Explanation:</p>
                    <p className="text-sm">{explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
