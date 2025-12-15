import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, TrendingUp, TrendingDown, Users, Building2, Calendar, DollarSign, AlertTriangle, CheckCircle2, Clock, BarChart3 } from "lucide-react";

const DEMO_SCENARIO = {
  id: 1,
  name: "School Expansion 2024-2025",
  description: "Planning scenario for expanding to accommodate 300 additional students across primary and secondary levels",
  status: "active",
  createdDate: "2024-01-01",
  createdBy: "Dr. Fatima Hassan",
  timeframe: "12 months",
  
  currentState: {
    totalStaff: 85,
    teachers: 62,
    adminStaff: 15,
    supportStaff: 8,
    studentTeacherRatio: 18,
    totalStudents: 1116,
  },
  
  projectedState: {
    totalStaff: 102,
    teachers: 76,
    adminStaff: 17,
    supportStaff: 9,
    studentTeacherRatio: 18.6,
    totalStudents: 1416,
  },
  
  staffingGaps: [
    { department: "Mathematics", current: 8, required: 10, gap: 2, priority: "high" },
    { department: "Science", current: 10, required: 12, gap: 2, priority: "high" },
    { department: "English", current: 9, required: 11, gap: 2, priority: "medium" },
    { department: "Arabic", current: 7, required: 8, gap: 1, priority: "medium" },
    { department: "Physical Education", current: 4, required: 5, gap: 1, priority: "low" },
    { department: "Art & Music", current: 3, required: 4, gap: 1, priority: "low" },
  ],
  
  timeline: [
    { phase: "Phase 1: Q1 2024", hires: 5, focus: "Mathematics & Science teachers", status: "in-progress" },
    { phase: "Phase 2: Q2 2024", hires: 4, focus: "English & Arabic teachers", status: "planned" },
    { phase: "Phase 3: Q3 2024", hires: 3, focus: "Specialist & Support staff", status: "planned" },
    { phase: "Phase 4: Q4 2024", hires: 5, focus: "Additional capacity & replacements", status: "planned" },
  ],
  
  budget: {
    totalCost: 2850000,
    salaries: 2400000,
    recruitment: 150000,
    training: 200000,
    contingency: 100000,
  },
  
  risks: [
    { name: "Teacher shortage in STEM subjects", impact: "high", likelihood: "medium", mitigation: "Partner with recruitment agencies" },
    { name: "Budget constraints", impact: "medium", likelihood: "low", mitigation: "Phased hiring approach" },
    { name: "Delayed license approvals", impact: "medium", likelihood: "medium", mitigation: "Early application submission" },
  ],
};

export default function WorkforceScenarioDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const scenario = DEMO_SCENARIO;

  const staffIncrease = scenario.projectedState.totalStaff - scenario.currentState.totalStaff;
  const studentIncrease = scenario.projectedState.totalStudents - scenario.currentState.totalStudents;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/workforce/planning")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{scenario.name}</h1>
            <Badge variant={scenario.status === "active" ? "default" : "secondary"}>{scenario.status}</Badge>
          </div>
          <p className="text-muted-foreground">{scenario.description}</p>
        </div>
        <Button variant="outline">Edit Scenario</Button>
        <Button>Apply Scenario</Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Staff Increase</p>
                <p className="text-2xl font-bold text-green-600">+{staffIncrease}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Student Growth</p>
                <p className="text-2xl font-bold text-blue-600">+{studentIncrease}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">AED {(scenario.budget.totalCost / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Timeframe</p>
                <p className="text-2xl font-bold">{scenario.timeframe}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staffing">Staffing Plan</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current vs Projected */}
            <Card>
              <CardHeader>
                <CardTitle>Current State</CardTitle>
                <CardDescription>Existing workforce composition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span>Total Staff</span><span className="font-bold">{scenario.currentState.totalStaff}</span></div>
                <div className="flex justify-between"><span>Teachers</span><span className="font-bold">{scenario.currentState.teachers}</span></div>
                <div className="flex justify-between"><span>Admin Staff</span><span className="font-bold">{scenario.currentState.adminStaff}</span></div>
                <div className="flex justify-between"><span>Support Staff</span><span className="font-bold">{scenario.currentState.supportStaff}</span></div>
                <div className="flex justify-between"><span>Student:Teacher Ratio</span><span className="font-bold">{scenario.currentState.studentTeacherRatio}:1</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500" />Projected State</CardTitle>
                <CardDescription>Workforce after scenario implementation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span>Total Staff</span><span className="font-bold text-green-600">{scenario.projectedState.totalStaff} (+{staffIncrease})</span></div>
                <div className="flex justify-between"><span>Teachers</span><span className="font-bold text-green-600">{scenario.projectedState.teachers} (+{scenario.projectedState.teachers - scenario.currentState.teachers})</span></div>
                <div className="flex justify-between"><span>Admin Staff</span><span className="font-bold text-green-600">{scenario.projectedState.adminStaff} (+{scenario.projectedState.adminStaff - scenario.currentState.adminStaff})</span></div>
                <div className="flex justify-between"><span>Support Staff</span><span className="font-bold text-green-600">{scenario.projectedState.supportStaff} (+{scenario.projectedState.supportStaff - scenario.currentState.supportStaff})</span></div>
                <div className="flex justify-between"><span>Student:Teacher Ratio</span><span className="font-bold">{scenario.projectedState.studentTeacherRatio}:1</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staffing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Staffing Gaps</CardTitle>
              <CardDescription>Current gaps and hiring requirements by department</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Current Staff</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Gap</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenario.staffingGaps.map(dept => (
                    <TableRow key={dept.department}>
                      <TableCell className="font-medium">{dept.department}</TableCell>
                      <TableCell>{dept.current}</TableCell>
                      <TableCell>{dept.required}</TableCell>
                      <TableCell className="text-red-600">-{dept.gap}</TableCell>
                      <TableCell>
                        <Badge variant={dept.priority === "high" ? "destructive" : dept.priority === "medium" ? "secondary" : "outline"}>
                          {dept.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-32">
                        <Progress value={(dept.current / dept.required) * 100} className="h-2" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Timeline</CardTitle>
              <CardDescription>Phased hiring plan over the scenario period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scenario.timeline.map((phase, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${phase.status === "in-progress" ? "bg-yellow-500" : phase.status === "completed" ? "bg-green-500" : "bg-gray-300"}`} />
                    <div className="flex-1">
                      <p className="font-medium">{phase.phase}</p>
                      <p className="text-sm text-muted-foreground">{phase.focus}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={phase.status === "in-progress" ? "default" : "outline"}>{phase.status}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">{phase.hires} hires planned</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Allocation</CardTitle>
              <CardDescription>Cost breakdown for the scenario implementation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Staff Salaries (Annual)", amount: scenario.budget.salaries, percentage: 84 },
                  { name: "Training & Development", amount: scenario.budget.training, percentage: 7 },
                  { name: "Recruitment Costs", amount: scenario.budget.recruitment, percentage: 5 },
                  { name: "Contingency Reserve", amount: scenario.budget.contingency, percentage: 4 },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="font-medium">AED {item.amount.toLocaleString()}</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">{item.percentage}% of total</p>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Budget</span>
                    <span>AED {scenario.budget.totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>Identified risks and mitigation strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scenario.risks.map((risk, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-5 w-5 ${risk.impact === "high" ? "text-red-500" : "text-yellow-500"}`} />
                        <h4 className="font-medium">{risk.name}</h4>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={risk.impact === "high" ? "destructive" : "secondary"}>Impact: {risk.impact}</Badge>
                        <Badge variant="outline">Likelihood: {risk.likelihood}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground"><strong>Mitigation:</strong> {risk.mitigation}</p>
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
