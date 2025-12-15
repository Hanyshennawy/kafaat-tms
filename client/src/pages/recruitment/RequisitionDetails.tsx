import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2, Calendar, Clock, Users, Briefcase, GraduationCap, DollarSign, MapPin, CheckCircle2, User, FileText } from "lucide-react";

const DEMO_REQUISITION = {
  id: "REQ-2024-001",
  title: "Expert Teacher - Mathematics",
  department: "Mathematics Department",
  school: "Al Noor Academy",
  location: "Abu Dhabi, UAE",
  status: "open",
  priority: "high",
  createdDate: "2024-01-05",
  targetHireDate: "2024-02-15",
  requestedBy: "Dr. Fatima Hassan",
  approvedBy: "Ahmad Al-Rashid (Principal)",
  
  positions: 2,
  applicants: 24,
  shortlisted: 8,
  interviewed: 4,
  offered: 1,
  
  requirements: {
    education: "Master's degree in Mathematics or Mathematics Education",
    experience: "Minimum 5 years teaching experience at secondary level",
    license: "Valid UAE Teaching License (T1 or Expert level)",
    languages: ["English (Fluent)", "Arabic (Preferred)"],
    skills: ["Curriculum Development", "Differentiated Instruction", "Assessment Design", "EdTech Integration", "Student Mentoring"],
    certifications: ["PGCE or equivalent teaching qualification", "IB certification (preferred)"],
  },
  
  responsibilities: [
    "Teach Mathematics to Grades 9-12 students",
    "Develop and implement engaging lesson plans aligned with UAE curriculum",
    "Assess student progress and provide constructive feedback",
    "Mentor junior teachers and contribute to department initiatives",
    "Participate in professional development activities",
    "Collaborate with parents and guardians on student progress",
  ],
  
  compensation: {
    salaryRange: "AED 18,000 - 25,000 / month",
    housing: "Housing allowance provided",
    benefits: ["Health insurance", "Annual flight allowance", "End of service gratuity", "Professional development budget"],
  },
  
  candidates: [
    { id: 1, name: "Ahmad Al-Rashid", status: "offered", score: 92 },
    { id: 2, name: "Sara Abdullah", status: "interviewed", score: 88 },
    { id: 3, name: "Mohammed Hassan", status: "interviewed", score: 85 },
    { id: 4, name: "Noura Ahmed", status: "interviewed", score: 82 },
    { id: 5, name: "Khalid Omar", status: "shortlisted", score: 78 },
  ],
};

export default function RequisitionDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const req = DEMO_REQUISITION;

  const pipelineProgress = Math.round((req.offered / req.positions) * 100);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/recruitment/requisitions")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{req.title}</h1>
            <Badge variant="outline">{req.id}</Badge>
            <Badge variant={req.priority === "high" ? "destructive" : "secondary"}>{req.priority} priority</Badge>
            <Badge className="bg-green-100 text-green-800">{req.status}</Badge>
          </div>
          <p className="text-muted-foreground">{req.department} • {req.school}</p>
        </div>
        <Button variant="outline">Edit Requisition</Button>
        <Button>View Candidates</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{req.positions}</p>
            <p className="text-sm text-muted-foreground">Positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{req.applicants}</p>
            <p className="text-sm text-muted-foreground">Applicants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{req.shortlisted}</p>
            <p className="text-sm text-muted-foreground">Shortlisted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{req.interviewed}</p>
            <p className="text-sm text-muted-foreground">Interviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{req.offered}</p>
            <p className="text-sm text-muted-foreground">Offers Made</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Hiring Progress</span>
            <span className="text-sm text-muted-foreground">{req.offered} of {req.positions} positions filled</span>
          </div>
          <Progress value={pipelineProgress} className="h-3" />
        </CardContent>
      </Card>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="candidates">Candidates ({req.candidates.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Position Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">School</p>
                    <p className="font-medium">{req.school}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{req.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{req.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Target Hire Date</p>
                    <p className="font-medium">{req.targetHireDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compensation & Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Salary Range</p>
                    <p className="font-medium">{req.compensation.salaryRange}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Benefits Package</p>
                  <div className="flex flex-wrap gap-2">
                    {req.compensation.benefits.map(benefit => (
                      <Badge key={benefit} variant="outline" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />{benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{req.compensation.housing}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {req.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" />Qualifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Education</p>
                  <p className="font-medium">{req.requirements.education}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium">{req.requirements.experience}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Requirement</p>
                  <p className="font-medium">{req.requirements.license}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Certifications</p>
                  <ul className="space-y-1">
                    {req.requirements.certifications.map(cert => (
                      <li key={cert} className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />{cert}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills & Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {req.requirements.skills.map(skill => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {req.requirements.languages.map(lang => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Pipeline</CardTitle>
              <CardDescription>Candidates in the hiring process for this position</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {req.candidates.map(candidate => (
                  <div key={candidate.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{candidate.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">Score: {candidate.score}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        candidate.status === "offered" ? "default" :
                        candidate.status === "interviewed" ? "secondary" : "outline"
                      }>
                        {candidate.status}
                      </Badge>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Requisition Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "Jan 5, 2024", event: "Requisition created", by: req.requestedBy },
                  { date: "Jan 6, 2024", event: "Approved by Principal", by: req.approvedBy },
                  { date: "Jan 7, 2024", event: "Job posted on career portal", by: "System" },
                  { date: "Jan 10, 2024", event: "First applications received", by: "System" },
                  { date: "Jan 15, 2024", event: "Shortlisting completed", by: "HR Team" },
                  { date: "Jan 18, 2024", event: "Interviews started", by: "Interview Panel" },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-32 text-sm text-muted-foreground">{item.date}</div>
                    <div className="flex-1">
                      <p className="font-medium">{item.event}</p>
                      <p className="text-sm text-muted-foreground">by {item.by}</p>
                    </div>
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
