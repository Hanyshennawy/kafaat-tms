import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, User, Users, Target, TrendingUp, Calendar, Award, CheckCircle2, AlertCircle, Clock, Star, Briefcase } from "lucide-react";

const DEMO_SUCCESSION_PLAN = {
  id: 1,
  position: "Principal",
  department: "School Leadership",
  currentHolder: {
    name: "Dr. Ahmad Al-Rashid",
    yearsInRole: 8,
    retirementDate: "2026-08-31",
    status: "Active",
  },
  status: "active",
  priority: "high",
  timeToSuccession: "30 months",
  
  successors: [
    {
      id: 1,
      name: "Dr. Fatima Hassan",
      currentRole: "VP Academic",
      readiness: "ready-now",
      readinessScore: 92,
      yearsExperience: 15,
      strengths: ["Leadership", "Strategic Planning", "Community Relations", "Curriculum Development"],
      developmentAreas: ["Financial Management", "Board Relations"],
      completedDevelopment: 85,
      education: "PhD in Educational Leadership",
      certifications: ["Expert Principal License", "Educational Leadership Certification"],
    },
    {
      id: 2,
      name: "Prof. Mohammed Saeed",
      currentRole: "Head of Academic Affairs",
      readiness: "ready-1-2-years",
      readinessScore: 78,
      yearsExperience: 12,
      strengths: ["Academic Excellence", "Staff Development", "Innovation"],
      developmentAreas: ["School Operations", "Parent Engagement", "Regulatory Compliance"],
      completedDevelopment: 60,
      education: "Master's in Education",
      certifications: ["Senior Teacher License", "IB Leadership Certificate"],
    },
    {
      id: 3,
      name: "Dr. Khalid Omar",
      currentRole: "Head of Subject - Mathematics",
      readiness: "ready-2-3-years",
      readinessScore: 65,
      yearsExperience: 10,
      strengths: ["Subject Expertise", "Team Management", "Data Analysis"],
      developmentAreas: ["Whole-School Leadership", "Strategic Planning", "External Stakeholders"],
      completedDevelopment: 40,
      education: "PhD in Mathematics Education",
      certifications: ["Expert Teacher License"],
    },
  ],
  
  developmentPlan: [
    { activity: "Leadership Shadowing Program", assignee: "All successors", status: "in-progress", dueDate: "2024-06-30" },
    { activity: "Executive Education Course", assignee: "Dr. Fatima Hassan", status: "completed", dueDate: "2024-01-15" },
    { activity: "Budget Management Training", assignee: "Prof. Mohammed Saeed", status: "planned", dueDate: "2024-09-30" },
    { activity: "Regulatory Compliance Workshop", assignee: "All successors", status: "planned", dueDate: "2024-12-31" },
    { activity: "Community Engagement Project", assignee: "Dr. Khalid Omar", status: "in-progress", dueDate: "2024-08-31" },
  ],
  
  keyCompetencies: [
    { name: "Strategic Leadership", weight: 20 },
    { name: "Educational Excellence", weight: 20 },
    { name: "Staff Development", weight: 15 },
    { name: "Financial Management", weight: 15 },
    { name: "Community Relations", weight: 15 },
    { name: "Regulatory Compliance", weight: 15 },
  ],
};

export default function SuccessionPlanDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const plan = DEMO_SUCCESSION_PLAN;

  const getReadinessBadge = (readiness: string) => {
    switch (readiness) {
      case "ready-now":
        return <Badge className="bg-green-100 text-green-800">Ready Now</Badge>;
      case "ready-1-2-years":
        return <Badge className="bg-yellow-100 text-yellow-800">Ready in 1-2 Years</Badge>;
      case "ready-2-3-years":
        return <Badge className="bg-blue-100 text-blue-800">Ready in 2-3 Years</Badge>;
      default:
        return <Badge variant="secondary">In Development</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/succession")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Succession Plan: {plan.position}</h1>
            <Badge variant={plan.priority === "high" ? "destructive" : "secondary"}>{plan.priority} priority</Badge>
            <Badge>{plan.status}</Badge>
          </div>
          <p className="text-muted-foreground">{plan.department}</p>
        </div>
        <Button variant="outline">Edit Plan</Button>
        <Button>Add Successor</Button>
      </div>

      {/* Current Holder & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Position Holder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">AA</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{plan.currentHolder.name}</h3>
                <p className="text-muted-foreground">{plan.position}</p>
                <div className="flex items-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{plan.currentHolder.yearsInRole} years in role</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Expected retirement: {plan.currentHolder.retirementDate}</span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />{plan.currentHolder.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Succession Timeline</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Clock className="h-12 w-12 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-primary">{plan.timeToSuccession}</p>
            <p className="text-sm text-muted-foreground">until planned transition</p>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Successors Identified</p>
              <p className="text-2xl font-bold">{plan.successors.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="successors">
        <TabsList>
          <TabsTrigger value="successors">Successors ({plan.successors.length})</TabsTrigger>
          <TabsTrigger value="development">Development Plan</TabsTrigger>
          <TabsTrigger value="competencies">Key Competencies</TabsTrigger>
        </TabsList>

        <TabsContent value="successors" className="space-y-4 mt-6">
          {plan.successors.map((successor, index) => (
            <Card key={successor.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="text-center">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback>{successor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold text-primary">{successor.readinessScore}%</div>
                      <div className="text-xs text-muted-foreground">Readiness</div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold">{successor.name}</h3>
                        <p className="text-sm text-muted-foreground">{successor.currentRole}</p>
                      </div>
                      {getReadinessBadge(successor.readiness)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-medium">{successor.yearsExperience} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Education</p>
                        <p className="font-medium">{successor.education}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Strengths</p>
                        <div className="flex flex-wrap gap-1">
                          {successor.strengths.map(s => (
                            <Badge key={s} variant="outline" className="text-green-600">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Development Areas</p>
                        <div className="flex flex-wrap gap-1">
                          {successor.developmentAreas.map(d => (
                            <Badge key={d} variant="outline" className="text-yellow-600">{d}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Development Plan Progress</span>
                        <span>{successor.completedDevelopment}%</span>
                      </div>
                      <Progress value={successor.completedDevelopment} className="h-2" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">View Profile</Button>
                    <Button variant="outline" size="sm">Development Plan</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="development" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Development Activities</CardTitle>
              <CardDescription>Training and development programs for succession candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plan.developmentPlan.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.status === "completed" ? "bg-green-500" :
                        activity.status === "in-progress" ? "bg-yellow-500" : "bg-gray-300"
                      }`} />
                      <div>
                        <p className="font-medium">{activity.activity}</p>
                        <p className="text-sm text-muted-foreground">Assigned to: {activity.assignee}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Due: {activity.dueDate}</p>
                        <Badge variant={
                          activity.status === "completed" ? "default" :
                          activity.status === "in-progress" ? "secondary" : "outline"
                        }>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competencies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Required Competencies for {plan.position}</CardTitle>
              <CardDescription>Key competencies and their weightage for this role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.keyCompetencies.map((comp, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{comp.name}</span>
                      <span className="text-muted-foreground">{comp.weight}%</span>
                    </div>
                    <Progress value={comp.weight * 5} className="h-3" />
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
