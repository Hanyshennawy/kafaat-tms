import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, Award, GraduationCap, Clock, Star, ArrowRight, Sparkles, BookOpen, Users, Briefcase, CheckCircle2, AlertCircle } from "lucide-react";

const CURRENT_PROFILE = {
  name: "Sulaiman Alkaabi",
  currentRole: "Teacher T1",
  department: "Mathematics",
  yearsExperience: 6,
  performanceScore: 4.2,
  competencies: [
    { name: "Teaching Excellence", score: 85 },
    { name: "Subject Expertise", score: 90 },
    { name: "Classroom Management", score: 82 },
    { name: "Student Assessment", score: 88 },
    { name: "Technology Integration", score: 75 },
    { name: "Leadership", score: 70 },
  ],
};

const CAREER_RECOMMENDATIONS = [
  {
    id: 1,
    title: "Expert Teacher - Mathematics",
    matchScore: 92,
    type: "promotion",
    timeframe: "6-12 months",
    salaryIncrease: "+25%",
    description: "Natural progression leveraging your strong teaching skills and subject expertise",
    requirements: [
      { name: "Teaching License T1 or higher", status: "met" },
      { name: "5+ years teaching experience", status: "met" },
      { name: "Performance rating 4.0+", status: "met" },
      { name: "CPD hours (60 required)", status: "partial", progress: 85 },
      { name: "Mentoring experience", status: "met" },
    ],
    skillGaps: ["Advanced Curriculum Development", "Research Publication"],
    recommendedTraining: ["Expert Teacher Certification Program", "Educational Research Methods"],
  },
  {
    id: 2,
    title: "Head of Subject - Mathematics",
    matchScore: 78,
    type: "leadership",
    timeframe: "18-24 months",
    salaryIncrease: "+40%",
    description: "Leadership role managing the mathematics department and curriculum",
    requirements: [
      { name: "Expert Teacher status", status: "not-met" },
      { name: "7+ years teaching experience", status: "partial", progress: 85 },
      { name: "Leadership certification", status: "not-met" },
      { name: "Curriculum development experience", status: "partial", progress: 60 },
    ],
    skillGaps: ["Department Management", "Budget Planning", "Team Leadership"],
    recommendedTraining: ["Educational Leadership Certificate", "Department Head Training"],
  },
  {
    id: 3,
    title: "Curriculum Specialist - Mathematics",
    matchScore: 85,
    type: "specialist",
    timeframe: "12-18 months",
    salaryIncrease: "+30%",
    description: "Specialist role focusing on curriculum development and teacher training",
    requirements: [
      { name: "Strong subject expertise", status: "met" },
      { name: "Curriculum development experience", status: "partial", progress: 70 },
      { name: "Training facilitation skills", status: "partial", progress: 50 },
      { name: "IB/Cambridge certification", status: "not-met" },
    ],
    skillGaps: ["Curriculum Design", "Adult Learning Principles"],
    recommendedTraining: ["Curriculum Development Workshop", "Train the Trainer Program"],
  },
];

const SKILL_DEVELOPMENT = [
  { skill: "Advanced Curriculum Development", priority: "high", courses: ["Curriculum Design Masterclass", "IB Mathematics Curriculum"] },
  { skill: "Educational Leadership", priority: "medium", courses: ["Leadership in Education", "Team Management"] },
  { skill: "Research & Publication", priority: "medium", courses: ["Action Research Methods", "Academic Writing"] },
  { skill: "Technology Integration", priority: "low", courses: ["EdTech Innovation", "Digital Learning Tools"] },
];

export default function CareerRecommendations() {
  const [selectedPath, setSelectedPath] = useState<typeof CAREER_RECOMMENDATIONS[0] | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "met": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "partial": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Career Recommendations
          </h1>
          <p className="text-muted-foreground">AI-powered career path suggestions based on your profile and performance</p>
        </div>
        <Button variant="outline">Update Preferences</Button>
      </div>

      {/* Current Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Career Profile</CardTitle>
          <CardDescription>Current position and competency snapshot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg">{CURRENT_PROFILE.currentRole}</p>
                  <p className="text-muted-foreground">{CURRENT_PROFILE.department} Department</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{CURRENT_PROFILE.yearsExperience}</p>
                  <p className="text-xs text-muted-foreground">Years Experience</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{CURRENT_PROFILE.performanceScore}</p>
                  <p className="text-xs text-muted-foreground">Performance Score</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{CAREER_RECOMMENDATIONS.length}</p>
                  <p className="text-xs text-muted-foreground">Career Paths</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Competency Overview</p>
              <div className="space-y-2">
                {CURRENT_PROFILE.competencies.slice(0, 4).map(comp => (
                  <div key={comp.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{comp.name}</span>
                      <span className="text-muted-foreground">{comp.score}%</span>
                    </div>
                    <Progress value={comp.score} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommendations">
        <TabsList>
          <TabsTrigger value="recommendations">Career Paths</TabsTrigger>
          <TabsTrigger value="skills">Skill Development</TabsTrigger>
          <TabsTrigger value="training">Recommended Training</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {CAREER_RECOMMENDATIONS.map((path) => (
              <Card key={path.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedPath?.id === path.id ? "ring-2 ring-primary" : ""}`} onClick={() => setSelectedPath(path)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        {path.type === "promotion" ? <TrendingUp className="h-6 w-6 text-primary" /> :
                         path.type === "leadership" ? <Users className="h-6 w-6 text-primary" /> :
                         <Award className="h-6 w-6 text-primary" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold">{path.title}</h3>
                          <Badge variant="outline">{path.type}</Badge>
                          <Badge variant="secondary">{path.salaryIncrease}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{path.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{path.timeframe}</span>
                          <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-4 w-4" />{path.requirements.filter(r => r.status === "met").length}/{path.requirements.length} requirements met</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{path.matchScore}%</div>
                      <div className="text-xs text-muted-foreground">Match Score</div>
                    </div>
                  </div>

                  {selectedPath?.id === path.id && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <div>
                        <h4 className="font-medium mb-3">Requirements</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {path.requirements.map((req, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              {getStatusIcon(req.status)}
                              <span className={req.status === "not-met" ? "text-muted-foreground" : ""}>{req.name}</span>
                              {req.progress && <span className="text-xs text-muted-foreground">({req.progress}%)</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Skill Gaps to Address</h4>
                          <div className="flex flex-wrap gap-2">
                            {path.skillGaps.map(gap => (
                              <Badge key={gap} variant="outline" className="text-yellow-600">{gap}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Recommended Training</h4>
                          <div className="flex flex-wrap gap-2">
                            {path.recommendedTraining.map(training => (
                              <Badge key={training} variant="secondary">{training}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline">View Full Analysis</Button>
                        <Button>Start This Path <ArrowRight className="h-4 w-4 ml-2" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority Skills Development</CardTitle>
              <CardDescription>Skills to develop for your recommended career paths</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SKILL_DEVELOPMENT.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">{item.skill}</h4>
                      </div>
                      <Badge variant={item.priority === "high" ? "destructive" : item.priority === "medium" ? "secondary" : "outline"}>
                        {item.priority} priority
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Recommended courses:</span>
                      {item.courses.map(course => (
                        <Badge key={course} variant="outline">{course}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Catalog</CardTitle>
              <CardDescription>Curated training programs for your career development</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Expert Teacher Certification", duration: "40 hours", provider: "MOE", type: "Certification", relevance: 95 },
                  { title: "Educational Leadership Program", duration: "60 hours", provider: "British Council", type: "Leadership", relevance: 88 },
                  { title: "Curriculum Design Masterclass", duration: "20 hours", provider: "IB", type: "Specialist", relevance: 82 },
                  { title: "Action Research Methods", duration: "15 hours", provider: "ADEK", type: "Academic", relevance: 75 },
                ].map((course, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{course.title}</h4>
                      <Badge variant="outline">{course.relevance}% match</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{course.provider}</span>
                      <span>{course.duration}</span>
                      <Badge variant="secondary">{course.type}</Badge>
                    </div>
                    <Button size="sm" className="w-full">Enroll Now</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
