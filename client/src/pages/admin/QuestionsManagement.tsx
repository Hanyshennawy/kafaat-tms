import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Filter, Edit, Trash2, Eye, Download, Upload } from "lucide-react";
import { toast } from "sonner";

// Mock data for demonstration
const mockQuestions = [
  {
    id: 1,
    questionText: "What is the primary goal of differentiated instruction?",
    questionType: "multiple_choice",
    difficultyLevel: "intermediate",
    subjectArea: "Pedagogy",
    jobRole: "Teacher",
    licenseTier: "Tier 2",
    points: 2,
    isActive: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: 2,
    questionText: "Explain the concept of formative assessment and its importance.",
    questionType: "essay",
    difficultyLevel: "advanced",
    subjectArea: "Assessment",
    jobRole: "Senior Teacher",
    licenseTier: "Tier 3",
    points: 5,
    isActive: true,
    createdAt: new Date("2024-01-20"),
  },
  {
    id: 3,
    questionText: "Bloom's Taxonomy includes six levels of cognitive skills.",
    questionType: "true_false",
    difficultyLevel: "basic",
    subjectArea: "Educational Theory",
    jobRole: "Teacher",
    licenseTier: "Tier 1",
    points: 1,
    isActive: true,
    createdAt: new Date("2024-02-01"),
  },
];

export default function QuestionsManagement() {
  const [, setLocation] = useLocation();
  const [searchText, setSearchText] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [previewQuestion, setPreviewQuestion] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter questions
  const filteredQuestions = mockQuestions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchText.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || q.difficultyLevel === difficultyFilter;
    const matchesType = typeFilter === "all" || q.questionType === typeFilter;
    const matchesSubject = subjectFilter === "all" || q.subjectArea === subjectFilter;
    return matchesSearch && matchesDifficulty && matchesType && matchesSubject;
  });

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(paginatedQuestions.map((q) => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleSelectQuestion = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedQuestions([...selectedQuestions, id]);
    } else {
      setSelectedQuestions(selectedQuestions.filter((qid) => qid !== id));
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      toast.success("Question deleted successfully");
    }
  };

  const handleBulkDelete = () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select questions to delete");
      return;
    }
    if (confirm(`Delete ${selectedQuestions.length} selected questions?`)) {
      toast.success(`${selectedQuestions.length} questions deleted successfully`);
      setSelectedQuestions([]);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "basic":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-orange-100 text-orange-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Questions Management</h1>
          <p className="text-muted-foreground">Manage exam questions and question bank</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("Import feature coming soon")}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={() => toast.info("Export feature coming soon")}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setLocation("/admin/questions/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Questions</CardDescription>
            <CardTitle className="text-3xl">{mockQuestions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Questions</CardDescription>
            <CardTitle className="text-3xl">{mockQuestions.filter(q => q.isActive).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Multiple Choice</CardDescription>
            <CardTitle className="text-3xl">
              {mockQuestions.filter(q => q.questionType === "multiple_choice").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Essay Questions</CardDescription>
            <CardTitle className="text-3xl">
              {mockQuestions.filter(q => q.questionType === "essay").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
                <SelectItem value="scenario">Scenario</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Subject Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Pedagogy">Pedagogy</SelectItem>
                <SelectItem value="Assessment">Assessment</SelectItem>
                <SelectItem value="Educational Theory">Educational Theory</SelectItem>
                <SelectItem value="Classroom Management">Classroom Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedQuestions.length} question(s) selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedQuestions([])}>
                  Clear Selection
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
          <CardDescription>
            Showing {paginatedQuestions.length} of {filteredQuestions.length} questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedQuestions.length === paginatedQuestions.length && paginatedQuestions.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={(checked) => handleSelectQuestion(question.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="font-medium truncate">{question.questionText}</p>
                    <p className="text-sm text-muted-foreground">
                      {question.jobRole} • {question.licenseTier}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(question.questionType)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(question.difficultyLevel)}>
                      {question.difficultyLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{question.subjectArea}</TableCell>
                  <TableCell>{question.points}</TableCell>
                  <TableCell>
                    {question.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewQuestion(question)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation(`/admin/questions/edit/${question.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
            <DialogDescription>View question details</DialogDescription>
          </DialogHeader>
          {previewQuestion && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Question Text:</h3>
                <p>{previewQuestion.questionText}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{getTypeLabel(previewQuestion.questionType)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <Badge className={getDifficultyColor(previewQuestion.difficultyLevel)}>
                    {previewQuestion.difficultyLevel}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subject Area</p>
                  <p className="font-medium">{previewQuestion.subjectArea}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Points</p>
                  <p className="font-medium">{previewQuestion.points}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Job Role</p>
                  <p className="font-medium">{previewQuestion.jobRole}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Tier</p>
                  <p className="font-medium">{previewQuestion.licenseTier}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
