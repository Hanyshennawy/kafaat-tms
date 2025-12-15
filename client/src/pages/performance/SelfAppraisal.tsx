import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardCheck, Target, Award, TrendingUp, Save, Send, 
  CheckCircle2, Star, Lightbulb, Calendar
} from "lucide-react";
import { toast } from "sonner";

interface Competency {
  id: number;
  name: string;
  description: string;
  category: string;
  selfRating: number;
  comments: string;
}

interface Goal {
  id: number;
  title: string;
  description: string;
  progress: number;
  achievement: string;
  challenges: string;
}

export default function SelfAppraisal() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaving, setIsSaving] = useState(false);
  
  // Demo data for self-appraisal
  const [appraisalData, setAppraisalData] = useState({
    period: "2024 Annual Review",
    dueDate: "2024-12-31",
    status: "in_progress",
    overallProgress: 65,
  });

  const [competencies, setCompetencies] = useState<Competency[]>([
    { id: 1, name: "Teaching Excellence", description: "Quality of instruction and student engagement", category: "Core", selfRating: 4, comments: "" },
    { id: 2, name: "Curriculum Development", description: "Ability to design and improve curriculum", category: "Core", selfRating: 3, comments: "" },
    { id: 3, name: "Student Assessment", description: "Effective evaluation of student progress", category: "Core", selfRating: 4, comments: "" },
    { id: 4, name: "Communication", description: "Clear and effective communication with stakeholders", category: "Behavioral", selfRating: 5, comments: "" },
    { id: 5, name: "Collaboration", description: "Working effectively with colleagues", category: "Behavioral", selfRating: 4, comments: "" },
    { id: 6, name: "Innovation", description: "Introducing new teaching methods and technologies", category: "Leadership", selfRating: 3, comments: "" },
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    { id: 1, title: "Improve Student Pass Rate", description: "Increase pass rate by 10%", progress: 80, achievement: "", challenges: "" },
    { id: 2, title: "Complete CPD Training", description: "40 hours of professional development", progress: 65, achievement: "", challenges: "" },
    { id: 3, title: "Implement Blended Learning", description: "Integrate digital tools in 3 courses", progress: 50, achievement: "", challenges: "" },
  ]);

  const [overallReflection, setOverallReflection] = useState({
    achievements: "",
    challenges: "",
    developmentAreas: "",
    careerAspirations: "",
  });

  const updateCompetencyRating = (id: number, rating: number) => {
    setCompetencies(prev => prev.map(c => c.id === id ? { ...c, selfRating: rating } : c));
  };

  const updateCompetencyComments = (id: number, comments: string) => {
    setCompetencies(prev => prev.map(c => c.id === id ? { ...c, comments } : c));
  };

  const updateGoal = (id: number, field: 'achievement' | 'challenges', value: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Self-appraisal saved successfully");
  };

  const handleSubmit = async () => {
    toast.success("Self-appraisal submitted for review");
    setAppraisalData(prev => ({ ...prev, status: "submitted" }));
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      not_started: { color: "bg-gray-100 text-gray-700", label: "Not Started" },
      in_progress: { color: "bg-blue-100 text-blue-700", label: "In Progress" },
      submitted: { color: "bg-amber-100 text-amber-700", label: "Submitted" },
      reviewed: { color: "bg-green-100 text-green-700", label: "Reviewed" },
    };
    const { color, label } = variants[status] || variants.not_started;
    return <Badge className={color}>{label}</Badge>;
  };

  const averageRating = competencies.reduce((sum, c) => sum + c.selfRating, 0) / competencies.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-indigo-600" />
            Self Appraisal
          </h1>
          <p className="text-muted-foreground mt-1">
            Reflect on your performance and set goals for the upcoming period
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(appraisalData.status)}
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Due: {new Date(appraisalData.dueDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Completion</span>
            <span className="text-sm text-muted-foreground">{appraisalData.overallProgress}%</span>
          </div>
          <Progress value={appraisalData.overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Complete all sections to submit your self-appraisal
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Target className="h-4 w-4" />
            Goals Review
          </TabsTrigger>
          <TabsTrigger value="competencies" className="gap-2">
            <Award className="h-4 w-4" />
            Competencies
          </TabsTrigger>
          <TabsTrigger value="reflection" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Reflection
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Summary
          </TabsTrigger>
        </TabsList>

        {/* Goals Review Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Goals Review</CardTitle>
              <CardDescription>Review your progress on goals set for this period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {goals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <Badge variant={goal.progress >= 100 ? "default" : "secondary"}>
                      {goal.progress}% Complete
                    </Badge>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Key Achievements</Label>
                      <Textarea
                        placeholder="Describe what you achieved for this goal..."
                        value={goal.achievement}
                        onChange={(e) => updateGoal(goal.id, 'achievement', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Challenges Faced</Label>
                      <Textarea
                        placeholder="Describe any challenges or obstacles..."
                        value={goal.challenges}
                        onChange={(e) => updateGoal(goal.id, 'challenges', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competencies Tab */}
        <TabsContent value="competencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competency Self-Assessment</CardTitle>
              <CardDescription>Rate yourself on each competency (1-5 scale)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(
                competencies.reduce((acc, c) => {
                  if (!acc[c.category]) acc[c.category] = [];
                  acc[c.category].push(c);
                  return acc;
                }, {} as Record<string, Competency[]>)
              ).map(([category, items]) => (
                <div key={category} className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2">{category} Competencies</h4>
                  {items.map((competency) => (
                    <div key={competency.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{competency.name}</h5>
                          <p className="text-sm text-muted-foreground">{competency.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => updateCompetencyRating(competency.id, star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  star <= competency.selfRating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Supporting Comments</Label>
                        <Textarea
                          placeholder="Provide examples or evidence for your rating..."
                          value={competency.comments}
                          onChange={(e) => updateCompetencyComments(competency.id, e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reflection Tab */}
        <TabsContent value="reflection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overall Reflection</CardTitle>
              <CardDescription>Share your thoughts on your overall performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Key Achievements This Period</Label>
                <Textarea
                  placeholder="What are you most proud of accomplishing?"
                  value={overallReflection.achievements}
                  onChange={(e) => setOverallReflection(prev => ({ ...prev, achievements: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Challenges & Lessons Learned</Label>
                <Textarea
                  placeholder="What challenges did you face and what did you learn?"
                  value={overallReflection.challenges}
                  onChange={(e) => setOverallReflection(prev => ({ ...prev, challenges: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Areas for Development</Label>
                <Textarea
                  placeholder="What skills or competencies would you like to develop?"
                  value={overallReflection.developmentAreas}
                  onChange={(e) => setOverallReflection(prev => ({ ...prev, developmentAreas: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Career Aspirations</Label>
                <Textarea
                  placeholder="What are your career goals for the next 1-3 years?"
                  value={overallReflection.careerAspirations}
                  onChange={(e) => setOverallReflection(prev => ({ ...prev, careerAspirations: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Self Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">/ 5.0</span>
                </div>
                <div className="flex mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(averageRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Goals Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">
                    {Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {goals.filter(g => g.progress >= 100).length} of {goals.length} goals completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Competencies Rated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">{competencies.length}</span>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">All competencies self-rated</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ready to Submit?</CardTitle>
              <CardDescription>
                Review your self-appraisal before submitting for manager review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>All goals reviewed with achievements and challenges</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>All competencies self-rated</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Overall reflection completed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
        <Button onClick={handleSubmit} disabled={appraisalData.status === "submitted"}>
          <Send className="h-4 w-4 mr-2" />
          Submit for Review
        </Button>
      </div>
    </div>
  );
}
