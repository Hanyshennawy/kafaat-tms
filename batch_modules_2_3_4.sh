#!/bin/bash

# ===== SUCCESSION PLANNING =====
cat > client/src/pages/succession/SuccessionPlans.tsx << 'EOF'
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Eye } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function SuccessionPlans() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({ criticalPositionId: 0, name: "", description: "" });
  
  const { data: plans, refetch } = trpc.successionPlanning.getAllPlans.useQuery();
  const { data: positions } = trpc.organization.getAllPositions.useQuery();
  const createPlan = trpc.successionPlanning.createPlan.useMutation({
    onSuccess: () => {
      toast.success("Succession plan created");
      setIsCreateDialogOpen(false);
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-purple-600" />
            Succession Plans
          </h1>
          <p className="text-muted-foreground mt-1">Manage leadership pipeline and succession planning</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Plan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Succession Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Plan Name *</Label>
                <Input placeholder="e.g., CTO Succession Plan" value={newPlan.name} onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Plan description" value={newPlan.description} onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createPlan.mutate(newPlan)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Plans</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{plans?.length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active Plans</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{plans?.filter(p => p.status === "active").length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Completed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{plans?.filter(p => p.status === "completed").length || 0}</div></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {plans?.map(plan => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </div>
                <Badge>{plan.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/succession/plans/${plan.id}`}>
                <Button variant="outline" size="sm" className="gap-2 w-full"><Eye className="h-4 w-4" />View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

cat > client/src/pages/succession/TalentPools.tsx << 'EOF'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function TalentPools() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPool, setNewPool] = useState({ name: "", description: "" });
  
  const { data: pools, refetch } = trpc.successionPlanning.getAllTalentPools.useQuery();
  const createPool = trpc.successionPlanning.createTalentPool.useMutation({
    onSuccess: () => {
      toast.success("Talent pool created");
      setIsCreateDialogOpen(false);
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Talent Pools</h1>
          <p className="text-muted-foreground mt-1">Manage high-potential employee groups</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Pool</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Talent Pool</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pool Name *</Label>
                <Input placeholder="e.g., Leadership Pipeline" value={newPool.name} onChange={(e) => setNewPool({ ...newPool, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Pool description" value={newPool.description} onChange={(e) => setNewPool({ ...newPool, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createPool.mutate(newPool)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pools?.map(pool => (
          <Card key={pool.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {pool.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{pool.description}</p>
              <Button variant="outline" size="sm" className="mt-4 w-full">Manage Members</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

# ===== WORKFORCE PLANNING =====
cat > client/src/pages/workforce/WorkforceScenarios.tsx << 'EOF'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, BarChart3, Eye } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function WorkforceScenarios() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newScenario, setNewScenario] = useState({ name: "", description: "", scenarioType: "expansion" as const });
  
  const { data: scenarios, refetch } = trpc.workforcePlanning.getAllScenarios.useQuery();
  const createScenario = trpc.workforcePlanning.createScenario.useMutation({
    onSuccess: () => {
      toast.success("Scenario created");
      setIsCreateDialogOpen(false);
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-green-600" />
            Workforce Scenarios
          </h1>
          <p className="text-muted-foreground mt-1">Model and simulate workforce planning scenarios</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Scenario</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Workforce Scenario</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Scenario Name *</Label>
                <Input placeholder="e.g., Q1 2025 Expansion" value={newScenario.name} onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Scenario Type</Label>
                <Select value={newScenario.scenarioType} onValueChange={(v: any) => setNewScenario({ ...newScenario, scenarioType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expansion">Expansion</SelectItem>
                    <SelectItem value="downsizing">Downsizing</SelectItem>
                    <SelectItem value="merger">Merger</SelectItem>
                    <SelectItem value="restructuring">Restructuring</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Scenario description" value={newScenario.description} onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createScenario.mutate(newScenario)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {scenarios?.map(scenario => (
          <Card key={scenario.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{scenario.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
                </div>
                <Badge>{scenario.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link href={`/workforce/scenarios/${scenario.id}`}>
                  <Button variant="outline" size="sm" className="gap-2"><Eye className="h-4 w-4" />View</Button>
                </Link>
                <Button variant="outline" size="sm">Simulate</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

cat > client/src/pages/workforce/ResourceAllocations.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ResourceAllocations() {
  const { data: allocations } = trpc.workforcePlanning.getAllResourceAllocations.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resource Allocations</h1>
          <p className="text-muted-foreground mt-1">Manage employee project assignments</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />New Allocation</Button>
      </div>

      <div className="grid gap-4">
        {allocations?.map(allocation => (
          <Card key={allocation.id}>
            <CardHeader>
              <CardTitle className="text-lg">{allocation.projectName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(allocation.startDate).toLocaleDateString()}</span>
                </div>
                <div className="font-medium">{allocation.allocationPercentage}% allocated</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

# ===== EMPLOYEE ENGAGEMENT =====
cat > client/src/pages/engagement/Surveys.tsx << 'EOF'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, Eye } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Surveys() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSurvey, setNewSurvey] = useState({ title: "", description: "", surveyType: "pulse" as const });
  
  const { data: surveys, refetch } = trpc.employeeEngagement.getAllSurveys.useQuery();
  const createSurvey = trpc.employeeEngagement.createSurvey.useMutation({
    onSuccess: () => {
      toast.success("Survey created");
      setIsCreateDialogOpen(false);
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-yellow-600" />
            Employee Surveys
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage employee engagement surveys</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Survey</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Survey</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Survey Title *</Label>
                <Input placeholder="e.g., Q1 Engagement Survey" value={newSurvey.title} onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Survey Type</Label>
                <Select value={newSurvey.surveyType} onValueChange={(v: any) => setNewSurvey({ ...newSurvey, surveyType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pulse">Pulse Survey</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="exit">Exit Survey</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Survey description" value={newSurvey.description} onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createSurvey.mutate(newSurvey)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {surveys?.map(survey => (
          <Card key={survey.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{survey.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{survey.description}</p>
                </div>
                <Badge>{survey.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/engagement/surveys/${survey.id}`}>
                <Button variant="outline" size="sm" className="gap-2 w-full"><Eye className="h-4 w-4" />View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

cat > client/src/pages/engagement/EngagementDashboard.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, MessageSquare, Award } from "lucide-react";

export default function EngagementDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Engagement Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor employee engagement metrics and trends</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2/10</div>
            <p className="text-xs text-muted-foreground">+0.5 from last quarter</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participation Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">1,045 responses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Active Surveys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 closing soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4" />
              Recognition Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450</div>
            <p className="text-xs text-muted-foreground">Distributed this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart visualization will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
EOF

echo "Modules 2, 3, 4 pages created successfully"

