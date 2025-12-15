import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Users, Target, TrendingUp, Award, Brain, MessageSquare, BarChart3, Plus, Star, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const LEADERSHIP_COMPETENCIES = [
  { id: "vision", name: "Strategic Vision", description: "Ability to set and communicate a clear direction for the school", weight: 20 },
  { id: "decision", name: "Decision Making", description: "Making sound decisions under pressure with available information", weight: 15 },
  { id: "team", name: "Team Development", description: "Building and developing high-performing teams", weight: 15 },
  { id: "communication", name: "Communication", description: "Effective communication with all stakeholders", weight: 15 },
  { id: "change", name: "Change Management", description: "Leading organizational change effectively", weight: 10 },
  { id: "emotional", name: "Emotional Intelligence", description: "Understanding and managing emotions in self and others", weight: 10 },
  { id: "innovation", name: "Innovation", description: "Driving innovation and continuous improvement", weight: 10 },
  { id: "ethics", name: "Ethical Leadership", description: "Leading with integrity and ethical standards", weight: 5 },
];

const ASSESSMENTS = [
  {
    id: 1,
    leader: { name: "Dr. Fatima Hassan", role: "VP Academic", avatar: "FH" },
    assessmentType: "360-degree",
    status: "completed",
    completedDate: "2024-01-10",
    overallScore: 4.3,
    scores: { vision: 4.5, decision: 4.2, team: 4.6, communication: 4.4, change: 4.0, emotional: 4.5, innovation: 4.2, ethics: 4.8 },
    readiness: "ready-now",
    potentialRoles: ["Principal", "Executive Principal"],
  },
  {
    id: 2,
    leader: { name: "Prof. Mohammed Saeed", role: "Head of Academic Affairs", avatar: "MS" },
    assessmentType: "self-assessment",
    status: "in-progress",
    completedDate: null,
    overallScore: null,
    scores: {},
    readiness: null,
    potentialRoles: ["VP Academic"],
  },
  {
    id: 3,
    leader: { name: "Dr. Khalid Omar", role: "Head of Subject - Mathematics", avatar: "KO" },
    assessmentType: "360-degree",
    status: "completed",
    completedDate: "2024-01-05",
    overallScore: 3.8,
    scores: { vision: 3.5, decision: 4.0, team: 3.8, communication: 4.2, change: 3.5, emotional: 3.8, innovation: 4.0, ethics: 4.5 },
    readiness: "ready-1-2-years",
    potentialRoles: ["Head of Academic Affairs"],
  },
];

export default function LeadershipAssessments() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<typeof ASSESSMENTS[0] | null>(null);

  const filteredAssessments = statusFilter === "all" 
    ? ASSESSMENTS 
    : ASSESSMENTS.filter(a => a.status === statusFilter);

  const getReadinessBadge = (readiness: string | null) => {
    switch (readiness) {
      case "ready-now": return <Badge className="bg-green-100 text-green-800">Ready Now</Badge>;
      case "ready-1-2-years": return <Badge className="bg-yellow-100 text-yellow-800">Ready 1-2 Years</Badge>;
      case "ready-2-3-years": return <Badge className="bg-blue-100 text-blue-800">Ready 2-3 Years</Badge>;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leadership Assessments</h1>
          <p className="text-muted-foreground">Evaluate leadership potential for succession planning</p>
        </div>
        <Dialog open={isNewAssessmentOpen} onOpenChange={setIsNewAssessmentOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Assessment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Start New Leadership Assessment</DialogTitle>
              <DialogDescription>Select a leader and assessment type</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Leader to Assess</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select leader" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sara">Sara Abdullah - Expert Teacher</SelectItem>
                    <SelectItem value="hassan">Hassan Ibrahim - Head of Unit</SelectItem>
                    <SelectItem value="noura">Noura Ahmed - Teacher T1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assessment Type</Label>
                <RadioGroup defaultValue="360">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="360" id="360" />
                    <Label htmlFor="360">360-Degree Assessment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="self" id="self" />
                    <Label htmlFor="self">Self Assessment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manager" id="manager" />
                    <Label htmlFor="manager">Manager Assessment Only</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Target Role</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select target role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hos">Head of Subject</SelectItem>
                    <SelectItem value="hou">Head of Unit</SelectItem>
                    <SelectItem value="vp">VP Academic</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Any specific focus areas or notes..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewAssessmentOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsNewAssessmentOpen(false)}>Start Assessment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Assessed</p>
                <p className="text-2xl font-bold">{ASSESSMENTS.filter(a => a.status === "completed").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Ready Now</p>
                <p className="text-2xl font-bold">{ASSESSMENTS.filter(a => a.readiness === "ready-now").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="h-5 w-5 text-yellow-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{ASSESSMENTS.filter(a => a.status === "in-progress").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{(ASSESSMENTS.filter(a => a.overallScore).reduce((sum, a) => sum + (a.overallScore || 0), 0) / ASSESSMENTS.filter(a => a.overallScore).length).toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assessments">
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="competencies">Competency Framework</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4 mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assessments</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Assessment Cards */}
          <div className="grid gap-4">
            {filteredAssessments.map(assessment => (
              <Card key={assessment.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAssessment(assessment)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback>{assessment.leader.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-bold">{assessment.leader.name}</h3>
                        <p className="text-muted-foreground">{assessment.leader.role}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline">{assessment.assessmentType}</Badge>
                          <Badge variant={assessment.status === "completed" ? "default" : "secondary"}>
                            {assessment.status === "completed" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                            {assessment.status}
                          </Badge>
                          {assessment.readiness && getReadinessBadge(assessment.readiness)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {assessment.overallScore && (
                        <>
                          <div className="text-3xl font-bold text-primary">{assessment.overallScore}</div>
                          <div className="text-sm text-muted-foreground">out of 5.0</div>
                        </>
                      )}
                      {assessment.potentialRoles.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Potential Roles:</p>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {assessment.potentialRoles.map(role => (
                              <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {assessment.status === "completed" && Object.keys(assessment.scores).length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-sm font-medium mb-3">Competency Scores</p>
                      <div className="grid grid-cols-4 gap-4">
                        {Object.entries(assessment.scores).slice(0, 4).map(([key, value]) => {
                          const comp = LEADERSHIP_COMPETENCIES.find(c => c.id === key);
                          return (
                            <div key={key} className="text-center">
                              <div className="text-xl font-bold text-primary">{value}</div>
                              <div className="text-xs text-muted-foreground">{comp?.name || key}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="competencies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Leadership Competency Framework</CardTitle>
              <CardDescription>Competencies assessed in leadership evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {LEADERSHIP_COMPETENCIES.map((comp) => (
                  <div key={comp.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{comp.name}</h4>
                          <p className="text-sm text-muted-foreground">{comp.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Weight: {comp.weight}%</Badge>
                    </div>
                    <Progress value={comp.weight * 5} className="h-2" />
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
