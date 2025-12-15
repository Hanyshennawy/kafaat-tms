import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  FileText, 
  Award, 
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play
} from "lucide-react";
import { useLocation } from "wouter";

export default function AvailableExams() {
  const [, setLocation] = useLocation();
  const [selectedExam, setSelectedExam] = useState<number | null>(null);

  // Fetch real exams from backend
  const { data: exams, isLoading } = trpc.questionBank.listExams.useQuery();
  const { data: myAttempts } = trpc.questionBank.myAttempts.useQuery();
  
  // Fallback mock data for demonstration if no real exams
  const mockExams = [
    {
      id: 1,
      title: "Mathematics Tier 3 Initial Licensing Exam",
      description: "Comprehensive assessment for senior mathematics teachers",
      examType: "initial",
      totalQuestions: 50,
      duration: 120,
      totalPoints: 100,
      passingScore: 75,
      maxAttempts: 3,
      status: "published",
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      title: "English Language Teaching Assessment",
      description: "Evaluation of English language teaching competencies",
      examType: "renewal",
      totalQuestions: 40,
      duration: 90,
      totalPoints: 80,
      passingScore: 70,
      maxAttempts: 2,
      status: "published",
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      title: "Science Education Methodology Exam",
      description: "Assessment of science teaching methods and practices",
      examType: "upgrade",
      totalQuestions: 35,
      duration: 75,
      totalPoints: 70,
      passingScore: 75,
      maxAttempts: 3,
      status: "published",
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endTime: null,
    },
  ];

  const handleStartExam = (examId: number) => {
    setSelectedExam(examId);
    // Simulate loading
    setTimeout(() => {
      setLocation(`/exams/take/${examId}`);
    }, 1000);
  };

  const getExamTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      initial: "bg-blue-500",
      renewal: "bg-green-500",
      upgrade: "bg-purple-500",
      remedial: "bg-orange-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const getStatusBadge = (exam: any) => {
    const now = new Date();
    const start = exam.startTime ? new Date(exam.startTime) : null;
    const end = exam.endTime ? new Date(exam.endTime) : null;

    if (exam.status === "draft") {
      return <Badge variant="outline" className="bg-gray-100">Draft</Badge>;
    }
    if (exam.status === "archived") {
      return <Badge variant="outline" className="bg-gray-200">Archived</Badge>;
    }
    if (start && now < start) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Upcoming</Badge>;
    }
    if (end && now > end) {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Closed</Badge>;
    }
    return <Badge variant="outline" className="bg-green-100 text-green-800">Available</Badge>;
  };

  const canTakeExam = (exam: any) => {
    const now = new Date();
    const start = exam.startTime ? new Date(exam.startTime) : null;
    const end = exam.endTime ? new Date(exam.endTime) : null;

    if (exam.status !== "published") return false;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const displayExams = (exams && exams.length > 0) ? exams : mockExams;
  const availableExams = displayExams?.filter(canTakeExam) || [];
  const upcomingExams = displayExams?.filter((e: any) => {
    const start = e.startTime ? new Date(e.startTime) : null;
    return e.status === "published" && start && new Date() < start;
  }) || [];
  const closedExams = displayExams?.filter((e: any) => {
    const end = e.endTime ? new Date(e.endTime) : null;
    return e.status === "published" && end && new Date() > end;
  }) || [];

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Exams</h1>
        <p className="text-muted-foreground">
          Select an exam to begin your assessment
        </p>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">
            Available ({availableExams.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingExams.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({closedExams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {availableExams.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No exams are currently available. Please check back later.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {availableExams.map((exam: any) => (
                <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{exam.title}</CardTitle>
                        <CardDescription>{exam.description}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(exam)}
                        <Badge className={getExamTypeColor(exam.examType)}>
                          {exam.examType}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.totalQuestions} Questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.duration} Minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.totalPoints} Points</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.passingScore}% to Pass</span>
                      </div>
                    </div>

                    {exam.startTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Available from {new Date(exam.startTime).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {exam.endTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Closes on {new Date(exam.endTime).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You have {exam.maxAttempts} attempts for this exam
                      </AlertDescription>
                    </Alert>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleStartExam(exam.id)}
                      disabled={selectedExam === exam.id}
                    >
                      {selectedExam === exam.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Exam
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingExams.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No upcoming exams scheduled.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {upcomingExams.map((exam: any) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{exam.title}</CardTitle>
                        <CardDescription>{exam.description}</CardDescription>
                      </div>
                      {getStatusBadge(exam)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.totalQuestions} Questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{exam.duration} Minutes</span>
                      </div>
                    </div>

                    {exam.startTime && (
                      <Alert>
                        <Calendar className="h-4 w-4" />
                        <AlertDescription>
                          Opens on {new Date(exam.startTime).toLocaleString()}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          {closedExams.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No closed exams.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {closedExams.map((exam: any) => (
                <Card key={exam.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{exam.title}</CardTitle>
                        <CardDescription>{exam.description}</CardDescription>
                      </div>
                      {getStatusBadge(exam)}
                    </div>
                  </CardHeader>

                  <CardContent>
                    {exam.endTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <XCircle className="h-4 w-4" />
                        <span>
                          Closed on {new Date(exam.endTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
