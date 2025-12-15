#!/bin/bash

# ===== RECRUITMENT =====
cat > client/src/pages/recruitment/JobRequisitions.tsx << 'EOF'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Eye, Users } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function JobRequisitions() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newReq, setNewReq] = useState({ jobTitle: "", description: "", numberOfPositions: 1 });
  
  const { data: requisitions, refetch } = trpc.recruitment.getAllRequisitions.useQuery();
  const createRequisition = trpc.recruitment.createRequisition.useMutation({
    onSuccess: () => {
      toast.success("Job requisition created");
      setIsCreateDialogOpen(false);
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-red-600" />
            Job Requisitions
          </h1>
          <p className="text-muted-foreground mt-1">Manage job openings and hiring requests</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Requisition</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Job Requisition</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input placeholder="e.g., Senior Software Engineer" value={newReq.jobTitle} onChange={(e) => setNewReq({ ...newReq, jobTitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Number of Positions</Label>
                <Input type="number" min="1" value={newReq.numberOfPositions} onChange={(e) => setNewReq({ ...newReq, numberOfPositions: parseInt(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Job Description</Label>
                <Textarea placeholder="Describe the role and responsibilities" value={newReq.description} onChange={(e) => setNewReq({ ...newReq, description: e.target.value })} rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createRequisition.mutate(newReq)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Requisitions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{requisitions?.length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Open Positions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{requisitions?.filter(r => r.status === "open").length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">In Progress</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{requisitions?.filter(r => r.status === "in_progress").length || 0}</div></CardContent></Card>
      </div>

      <div className="grid gap-4">
        {requisitions?.map(req => (
          <Card key={req.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {req.jobTitle}
                    <Badge>{req.status}</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{req.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{req.numberOfPositions} positions</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link href={`/recruitment/requisitions/${req.id}`}>
                  <Button variant="outline" size="sm" className="gap-2"><Eye className="h-4 w-4" />View Details</Button>
                </Link>
                <Button variant="outline" size="sm" className="gap-2"><Users className="h-4 w-4" />View Candidates</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

cat > client/src/pages/recruitment/Candidates.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Eye, Mail, Phone } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Candidates() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: candidates } = trpc.recruitment.getAllCandidates.useQuery();

  const filteredCandidates = candidates?.filter(c =>
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-red-600" />
          Candidates
        </h1>
        <p className="text-muted-foreground mt-1">Manage job applicants and candidates</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            <Input placeholder="Search candidates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredCandidates?.map(candidate => (
          <Card key={candidate.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {candidate.fullName}
                    <Badge>{candidate.status}</Badge>
                  </CardTitle>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {candidate.email}
                    </div>
                    {candidate.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {candidate.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/recruitment/candidates/${candidate.id}`}>
                <Button variant="outline" size="sm" className="gap-2"><Eye className="h-4 w-4" />View Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

cat > client/src/pages/recruitment/RecruitmentDashboard.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Calendar, CheckCircle } from "lucide-react";

export default function RecruitmentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recruitment Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of recruitment activities and metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Open Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Across 8 departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">In various stages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Interviews Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Offers Extended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Pending acceptance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
EOF

# ===== PERFORMANCE MANAGEMENT =====
cat > client/src/pages/performance/PerformanceCycles.tsx << 'EOF'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Eye } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function PerformanceCycles() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCycle, setNewCycle] = useState({ name: "", startDate: "", endDate: "" });
  
  const { data: cycles, refetch } = trpc.performanceManagement.getAllCycles.useQuery();
  const createCycle = trpc.performanceManagement.createCycle.useMutation({
    onSuccess: () => {
      toast.success("Performance cycle created");
      setIsCreateDialogOpen(false);
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-indigo-600" />
            Performance Cycles
          </h1>
          <p className="text-muted-foreground mt-1">Manage performance review cycles</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Cycle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Performance Cycle</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Cycle Name *</Label>
                <Input placeholder="e.g., Q1 2025 Performance Review" value={newCycle.name} onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={newCycle.startDate} onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={newCycle.endDate} onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createCycle.mutate({ ...newCycle, startDate: new Date(newCycle.startDate), endDate: new Date(newCycle.endDate) })}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cycles?.map(cycle => (
          <Card key={cycle.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{cycle.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge>{cycle.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="gap-2 w-full"><Eye className="h-4 w-4" />View Details</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

cat > client/src/pages/performance/Goals.tsx << 'EOF'
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Goals() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", targetDate: "" });
  
  const { data: goals, refetch } = trpc.performanceManagement.getAllGoals.useQuery();
  const createGoal = trpc.performanceManagement.createGoal.useMutation({
    onSuccess: () => {
      toast.success("Goal created");
      setIsCreateDialogOpen(false);
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-indigo-600" />
            Goals
          </h1>
          <p className="text-muted-foreground mt-1">Set and track SMART goals</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Goal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Goal</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Goal Title *</Label>
                <Input placeholder="e.g., Increase team productivity by 20%" value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the goal and success criteria" value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input type="date" value={newGoal.targetDate} onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createGoal.mutate({ ...newGoal, targetDate: new Date(newGoal.targetDate) })}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {goals?.map(goal => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                </div>
                <Badge>{goal.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{goal.progress || 0}%</span>
                </div>
                <Progress value={goal.progress || 0} />
                <p className="text-xs text-muted-foreground">
                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

cat > client/src/pages/performance/PerformanceDashboard.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Users, Award } from "lucide-react";

export default function PerformanceDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <p className="text-muted-foreground mt-1">Monitor performance metrics and trends</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Across all employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg. Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Reviews Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Above 90% rating</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
EOF

# ===== TEACHERS LICENSING =====
cat > client/src/pages/licensing/LicensingPortal.tsx << 'EOF'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, FileText, Shield, Award, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";

export default function LicensingPortal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-teal-600">Teachers Licensing Portal</h1>
          <Link href="/"><Button variant="outline">Back to Home</Button></Link>
        </div>
      </header>

      <div className="container mx-auto py-12 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <GraduationCap className="h-16 w-16 text-teal-600 mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4">UAE Teachers Licensing</h2>
          <p className="text-lg text-muted-foreground">
            Complete licensing lifecycle management with blockchain verification for UAE Ministry of Education
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-10 w-10 text-teal-600 mb-2" />
              <CardTitle>Apply for License</CardTitle>
              <CardDescription>Submit a new teaching license application</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/licensing/apply">
                <Button className="w-full gap-2">Apply Now <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Verify License</CardTitle>
              <CardDescription>Verify the authenticity of a teaching license</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/licensing/verify">
                <Button variant="outline" className="w-full gap-2">Verify <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track your license application status</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/licensing/my-applications">
                <Button variant="outline" className="w-full gap-2">View <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Award className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>CPD Records</CardTitle>
              <CardDescription>Manage Continuing Professional Development</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/licensing/cpd">
                <Button variant="outline" className="w-full gap-2">View <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-teal-600 to-blue-600 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Blockchain-Verified Credentials</CardTitle>
            <CardDescription className="text-teal-100">
              All teaching licenses are secured with blockchain technology for tamper-proof verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Secure</h3>
                  <p className="text-sm text-teal-100">Immutable blockchain records</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Verified</h3>
                  <p className="text-sm text-teal-100">Instant verification worldwide</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Transparent</h3>
                  <p className="text-sm text-teal-100">Complete audit trail</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
EOF

cat > client/src/pages/licensing/MyApplications.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function MyApplications() {
  const { data: applications } = trpc.teachersLicensing.getAllApplications.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8 text-teal-600" />
          My Applications
        </h1>
        <p className="text-muted-foreground mt-1">Track your teaching license applications</p>
      </div>

      <div className="grid gap-4">
        {applications?.map(app => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>License Application #{app.id}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge>{app.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/licensing/applications/${app.id}`}>
                <Button variant="outline" size="sm" className="gap-2"><Eye className="h-4 w-4" />View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

cat > client/src/pages/licensing/LicensesManagement.tsx << 'EOF'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Award, Shield } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function LicensesManagement() {
  const { data: licenses } = trpc.teachersLicensing.getAllLicenses.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="h-8 w-8 text-teal-600" />
          Licenses Management
        </h1>
        <p className="text-muted-foreground mt-1">Manage and monitor teaching licenses</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Licenses</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{licenses?.length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{licenses?.filter(l => l.status === "active").length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Expiring Soon</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">5</div></CardContent></Card>
      </div>

      <div className="grid gap-4">
        {licenses?.map(license => (
          <Card key={license.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    License #{license.licenseNumber}
                    <Badge>{license.status}</Badge>
                  </CardTitle>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>Issued: {new Date(license.issueDate).toLocaleDateString()}</p>
                    <p>Expires: {new Date(license.expiryDate).toLocaleDateString()}</p>
                    {license.blockchainHash && (
                      <p className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Blockchain Verified
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/licensing/licenses/${license.id}`}>
                <Button variant="outline" size="sm" className="gap-2"><Eye className="h-4 w-4" />View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

echo "Modules 5, 6, 7 pages created successfully"

