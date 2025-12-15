import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Calendar, FileText, CheckCircle2, Clock, AlertCircle, XCircle, GraduationCap, Briefcase, Building2, Upload, MessageSquare } from "lucide-react";

const DEMO_APPLICATION = {
  id: "APP-2024-001",
  applicantName: "Ahmad Mohammed Al-Rashid",
  email: "ahmad.m@email.com",
  phone: "+971-50-123-4567",
  emirateId: "784-XXXX-XXXXXXX-X",
  nationality: "UAE",
  
  licenseType: "Teaching License",
  licenseLevel: "Teacher T1",
  subjects: ["Mathematics", "Physics"],
  
  status: "under-review",
  submittedDate: "2024-01-10",
  lastUpdated: "2024-01-15",
  estimatedCompletion: "2024-01-25",
  
  currentStep: 3,
  steps: [
    { id: 1, name: "Application Submitted", status: "completed", date: "2024-01-10" },
    { id: 2, name: "Documents Verified", status: "completed", date: "2024-01-12" },
    { id: 3, name: "Background Check", status: "in-progress", date: null },
    { id: 4, name: "Committee Review", status: "pending", date: null },
    { id: 5, name: "License Issued", status: "pending", date: null },
  ],
  
  education: [
    { degree: "Master of Education", institution: "UAE University", year: 2020, verified: true },
    { degree: "Bachelor of Science - Mathematics", institution: "American University of Sharjah", year: 2017, verified: true },
  ],
  
  experience: [
    { role: "Mathematics Teacher", school: "Al Noor Academy", period: "2020 - Present", years: 4, verified: true },
    { role: "Teaching Assistant", school: "Emirates International School", period: "2018 - 2020", years: 2, verified: true },
  ],
  
  documents: [
    { name: "Emirates ID Copy", status: "verified", uploadDate: "2024-01-10" },
    { name: "Passport Copy", status: "verified", uploadDate: "2024-01-10" },
    { name: "Degree Certificates", status: "verified", uploadDate: "2024-01-10" },
    { name: "Experience Letters", status: "verified", uploadDate: "2024-01-10" },
    { name: "Police Clearance Certificate", status: "pending", uploadDate: "2024-01-11" },
    { name: "Medical Fitness Certificate", status: "verified", uploadDate: "2024-01-11" },
  ],
  
  notes: [
    { date: "2024-01-15", author: "Review Team", message: "Background check initiated with relevant authorities." },
    { date: "2024-01-12", author: "Document Verification", message: "All submitted documents have been verified successfully." },
    { date: "2024-01-10", author: "System", message: "Application received and assigned for processing." },
  ],
};

export default function ApplicationDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const app = DEMO_APPLICATION;

  const progressPercentage = (app.currentStep / app.steps.length) * 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "under-review": return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case "approved": return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in-progress": return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/licensing/applications")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">License Application</h1>
            <Badge variant="outline">{app.id}</Badge>
            {getStatusBadge(app.status)}
          </div>
          <p className="text-muted-foreground">Submitted on {app.submittedDate}</p>
        </div>
        <Button variant="outline">Download PDF</Button>
        <Button variant="outline">Contact Applicant</Button>
      </div>

      {/* Progress Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Application Progress</CardTitle>
          <CardDescription>Estimated completion: {app.estimatedCompletion}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-2 mb-6" />
          <div className="flex justify-between">
            {app.steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center text-center" style={{ width: `${100 / app.steps.length}%` }}>
                <div className="mb-2">{getStepIcon(step.status)}</div>
                <p className={`text-sm font-medium ${step.status === "completed" ? "text-green-600" : step.status === "in-progress" ? "text-yellow-600" : "text-muted-foreground"}`}>
                  {step.name}
                </p>
                {step.date && <p className="text-xs text-muted-foreground">{step.date}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applicant Info */}
        <Card>
          <CardHeader>
            <CardTitle>Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl">AM</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{app.applicantName}</h3>
                <p className="text-sm text-muted-foreground">{app.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{app.phone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Nationality</span><span>{app.nationality}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Emirates ID</span><span>{app.emirateId}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* License Details */}
        <Card>
          <CardHeader>
            <CardTitle>License Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">License Type</span><span className="font-medium">{app.licenseType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Level</span><Badge>{app.licenseLevel}</Badge></div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Teaching Subjects</p>
              <div className="flex flex-wrap gap-2">
                {app.subjects.map(subject => (
                  <Badge key={subject} variant="outline">{subject}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span>{app.submittedDate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Updated</span><span>{app.lastUpdated}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Est. Completion</span><span className="font-medium text-primary">{app.estimatedCompletion}</span></div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="education">
        <TabsList>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="documents">Documents ({app.documents.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({app.notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="education" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" />Education History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {app.education.map((edu, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</p>
                    </div>
                    {edu.verified && <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Teaching Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {app.experience.map((exp, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg"><Building2 className="h-5 w-5" /></div>
                      <div>
                        <h4 className="font-medium">{exp.role}</h4>
                        <p className="text-sm text-muted-foreground">{exp.school} • {exp.period}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{exp.years} years</Badge>
                      {exp.verified && <p className="text-xs text-green-600 mt-1"><CheckCircle2 className="h-3 w-3 inline mr-1" />Verified</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Submitted Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {app.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">Uploaded: {doc.uploadDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={doc.status === "verified" ? "default" : "secondary"}>
                        {doc.status === "verified" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {doc.status}
                      </Badge>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Processing Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {app.notes.map((note, index) => (
                  <div key={index} className="p-4 border-l-4 border-primary bg-muted/50 rounded-r-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{note.author}</span>
                      <span className="text-xs text-muted-foreground">{note.date}</span>
                    </div>
                    <p className="text-sm">{note.message}</p>
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
