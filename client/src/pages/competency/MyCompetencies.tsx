import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  TrendingUp, 
  Award, 
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from "lucide-react";

/**
 * My Competencies Page
 * Educator's view of their competency progress and achievements
 */

export default function MyCompetencies() {
  const [activeTab, setActiveTab] = useState("all");

  // Mock data
  const competencies = [
    {
      id: 1,
      standard: "Pedagogical Knowledge",
      category: "Teaching & Learning",
      currentLevel: "proficient",
      targetLevel: "advanced",
      status: "in_progress",
      progress: 75,
      lastAssessed: "2024-10-15",
      nextAssessment: "2025-01-15",
    },
    {
      id: 2,
      standard: "Student Assessment",
      category: "Teaching & Learning",
      currentLevel: "advanced",
      targetLevel: "expert",
      status: "achieved",
      progress: 100,
      lastAssessed: "2024-11-01",
      nextAssessment: null,
    },
    {
      id: 3,
      standard: "Digital Literacy",
      category: "Professional Development",
      currentLevel: "developing",
      targetLevel: "proficient",
      status: "in_progress",
      progress: 45,
      lastAssessed: "2024-09-20",
      nextAssessment: "2024-12-20",
    },
    {
      id: 4,
      standard: "Classroom Management",
      category: "Teaching & Learning",
      currentLevel: "proficient",
      targetLevel: "advanced",
      status: "in_progress",
      progress: 60,
      lastAssessed: "2024-10-10",
      nextAssessment: "2025-01-10",
    },
    {
      id: 5,
      standard: "Cultural Responsiveness",
      category: "Professional Values",
      currentLevel: "not_started",
      targetLevel: "developing",
      status: "in_progress",
      progress: 10,
      lastAssessed: null,
      nextAssessment: "2024-12-01",
    },
  ];

  const stats = {
    total: competencies.length,
    achieved: competencies.filter((c) => c.status === "achieved").length,
    inProgress: competencies.filter((c) => c.status === "in_progress").length,
    averageProgress:
      competencies.reduce((sum, c) => sum + c.progress, 0) / competencies.length,
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "expert":
        return "bg-purple-100 text-purple-800";
      case "advanced":
        return "bg-blue-100 text-blue-800";
      case "proficient":
        return "bg-green-100 text-green-800";
      case "developing":
        return "bg-yellow-100 text-yellow-800";
      case "not_started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "achieved":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "under_review":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const filteredCompetencies = competencies.filter((comp) => {
    if (activeTab === "all") return true;
    if (activeTab === "achieved") return comp.status === "achieved";
    if (activeTab === "in-progress") return comp.status === "in_progress";
    return true;
  });

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Competencies</h1>
        <p className="text-muted-foreground">
          Track your professional competency development and achievements
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total Competencies
            </CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Achieved
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.achieved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              In Progress
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Overall Progress
            </CardDescription>
            <CardTitle className="text-3xl">{Math.round(stats.averageProgress)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value="achieved">Achieved ({stats.achieved})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Competencies List */}
      <div className="grid gap-4">
        {filteredCompetencies.map((competency) => (
          <Card key={competency.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{competency.standard}</CardTitle>
                    {getStatusIcon(competency.status)}
                  </div>
                  <CardDescription>{competency.category}</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Levels */}
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current: </span>
                    <Badge className={getLevelColor(competency.currentLevel)}>
                      {competency.currentLevel.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target: </span>
                    <Badge className={getLevelColor(competency.targetLevel)}>
                      {competency.targetLevel}
                    </Badge>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{competency.progress}%</span>
                  </div>
                  <Progress value={competency.progress} />
                </div>

                {/* Dates */}
                <div className="flex gap-6 text-sm">
                  {competency.lastAssessed && (
                    <div>
                      <span className="text-muted-foreground">Last Assessed: </span>
                      <span className="font-medium">
                        {new Date(competency.lastAssessed).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {competency.nextAssessment && (
                    <div>
                      <span className="text-muted-foreground">Next Assessment: </span>
                      <span className="font-medium">
                        {new Date(competency.nextAssessment).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompetencies.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No competencies found</h3>
            <p className="text-muted-foreground">
              {activeTab === "all"
                ? "You haven't been assigned any competencies yet"
                : `You don't have any ${activeTab.replace("-", " ")} competencies`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
