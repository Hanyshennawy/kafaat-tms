import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, ArrowRight, TrendingUp, GraduationCap, Award,
  BookOpen, Target, CheckCircle2, Clock, Star, Users
} from "lucide-react";

// UAE Educator Career Path
const TEACHING_CAREER_PATH = [
  { level: 1, role: "Assistant Teacher", minYears: 0, requirements: ["Bachelor's Degree", "Basic Teaching Certificate"] },
  { level: 2, role: "Teacher", minYears: 2, requirements: ["UAE Teaching License Level 1", "2+ years experience"] },
  { level: 3, role: "Teacher T1", minYears: 4, requirements: ["UAE Teaching License Level 2", "Advanced certification", "4+ years experience"] },
  { level: 4, role: "Expert Teacher", minYears: 6, requirements: ["UAE Teaching License Level 3", "Master's Degree", "Mentorship experience"] },
  { level: 5, role: "Head of Subject 1", minYears: 8, requirements: ["Expert Teacher status", "Leadership training", "Curriculum development"] },
  { level: 6, role: "Head of Subject 2", minYears: 10, requirements: ["Head of Subject 1 experience", "Department management"] },
  { level: 7, role: "Head of Unit 1", minYears: 12, requirements: ["Cross-functional leadership", "Strategic planning"] },
  { level: 8, role: "Head of Unit 2", minYears: 14, requirements: ["Senior unit leadership", "School-wide initiatives"] },
  { level: 9, role: "Vice Principal (Academic)", minYears: 15, requirements: ["Educational Leadership Certification", "Full academic oversight"] },
  { level: 10, role: "Principal", minYears: 18, requirements: ["Principal Certification", "School management experience"] },
  { level: 11, role: "Expert Principal", minYears: 20, requirements: ["Distinguished leadership", "District-level responsibilities"] },
];

export default function CareerPathDetails() {
  const params = useParams();
  const [, navigate] = useLocation();

  // Demo: Current educator is at Expert Teacher level
  const currentLevel = 4;
  const currentRole = TEACHING_CAREER_PATH[currentLevel - 1];
  const nextRole = TEACHING_CAREER_PATH[currentLevel];

  const progressToNext = 75; // 75% progress to next level

  const completedRequirements = [
    "UAE Teaching License Level 3",
    "Master's Degree in Education",
    "Mentorship experience (3 mentees)",
  ];

  const pendingRequirements = [
    { name: "Leadership Training Program", progress: 60 },
    { name: "Curriculum Development Certification", progress: 40 },
    { name: "Minimum 8 years experience", progress: 75 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" className="mb-2 -ml-2" onClick={() => navigate("/career/paths")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Career Paths
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Teaching Career Path</h1>
            <p className="text-muted-foreground">Your journey from Teacher to School Leadership</p>
          </div>
        </div>
      </div>

      {/* Current Position Card */}
      <Card className="border-2 border-indigo-200 bg-indigo-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                {currentLevel}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Position</p>
                <h2 className="text-2xl font-bold">{currentRole.role}</h2>
                <Badge className="mt-1">Level {currentLevel} of 11</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progress to Next Level</p>
              <p className="text-3xl font-bold text-indigo-600">{progressToNext}%</p>
              <p className="text-sm">to {nextRole?.role}</p>
            </div>
          </div>
          <Progress value={progressToNext} className="mt-4 h-3" />
        </CardContent>
      </Card>

      {/* Career Path Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Career Progression Path</CardTitle>
          <CardDescription>UAE Ministry of Education Teaching Career Ladder</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-muted" />
            <div className="space-y-6">
              {TEACHING_CAREER_PATH.map((step, idx) => {
                const isCompleted = step.level < currentLevel;
                const isCurrent = step.level === currentLevel;
                const isNext = step.level === currentLevel + 1;

                return (
                  <div key={step.level} className="relative flex items-start gap-4 pl-4">
                    <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                        : isNext
                        ? "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.level}
                    </div>
                    <div className={`flex-1 p-4 rounded-lg border ${
                      isCurrent ? "border-indigo-200 bg-indigo-50" : isNext ? "border-amber-200 bg-amber-50" : ""
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {step.role}
                            {isCurrent && <Badge>Current</Badge>}
                            {isNext && <Badge variant="secondary">Next</Badge>}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Minimum {step.minYears} years experience required
                          </p>
                        </div>
                        {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      </div>
                      {(isCurrent || isNext) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {step.requirements.map((req, rIdx) => (
                            <Badge key={rIdx} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements for Next Level */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Completed Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedRequirements.map((req, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>{req}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequirements.map((req, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{req.name}</span>
                  <span className="font-medium">{req.progress}%</span>
                </div>
                <Progress value={req.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          <BookOpen className="h-4 w-4 mr-2" />
          View Training Programs
        </Button>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Set Career Goals
        </Button>
      </div>
    </div>
  );
}
