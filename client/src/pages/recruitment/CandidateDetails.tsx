import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, User, GraduationCap, Briefcase, FileText,
  Mail, Phone, MapPin, Calendar, Star, CheckCircle2,
  XCircle, Clock, MessageSquare, Download, Send,
  Award, BookOpen, Users, Building2
} from "lucide-react";
import { toast } from "sonner";

// UAE Educator Role Hierarchy
const EDUCATOR_ROLES = [
  // Teaching Track
  { value: "assistant_teacher", label: "Assistant Teacher", track: "Teaching", level: 1 },
  { value: "teacher", label: "Teacher", track: "Teaching", level: 2 },
  { value: "teacher_t1", label: "Teacher T1", track: "Teaching", level: 3 },
  { value: "expert_teacher", label: "Expert Teacher", track: "Teaching", level: 4 },
  { value: "head_of_subject_1", label: "Head of Subject 1", track: "Teaching", level: 5 },
  { value: "head_of_subject_2", label: "Head of Subject 2", track: "Teaching", level: 6 },
  { value: "head_of_unit_1", label: "Head of Unit 1", track: "Teaching", level: 7 },
  { value: "head_of_unit_2", label: "Head of Unit 2", track: "Teaching", level: 8 },
  // Leadership Track
  { value: "vp_academic", label: "Vice Principal (Academic)", track: "Leadership", level: 9 },
  { value: "principal", label: "Principal", track: "Leadership", level: 10 },
  { value: "expert_principal", label: "Expert Principal", track: "Leadership", level: 11 },
  // Admin Track
  { value: "admin_assistant", label: "Administrative Assistant", track: "Admin", level: 1 },
  { value: "admin_officer", label: "Administrative Officer", track: "Admin", level: 2 },
  { value: "senior_admin", label: "Senior Administrator", track: "Admin", level: 3 },
  { value: "admin_manager", label: "Administrative Manager", track: "Admin", level: 4 },
  // Specialist Track
  { value: "specialist_1", label: "Specialist Level 1", track: "Specialist", level: 1 },
  { value: "specialist_2", label: "Specialist Level 2", track: "Specialist", level: 2 },
  { value: "senior_specialist", label: "Senior Specialist", track: "Specialist", level: 3 },
  { value: "expert_specialist", label: "Expert Specialist", track: "Specialist", level: 4 },
];

interface InterviewNote {
  id: number;
  interviewer: string;
  date: string;
  type: string;
  rating: number;
  notes: string;
}

export default function CandidateDetails() {
  const params = useParams();
  const [, navigate] = useLocation();
  const [newNote, setNewNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("screening");

  // Demo candidate data - focused on educator recruitment
  const candidate = {
    id: params.id || "1",
    name: "Fatima Al Hashemi",
    email: "fatima.alhashemi@email.com",
    phone: "+971 50 123 4567",
    location: "Dubai, UAE",
    nationality: "UAE",
    emiratesId: "784-1990-1234567-1",
    appliedDate: "2024-11-15",
    status: "screening",
    
    // Position Applied
    position: {
      title: "Expert Teacher - Mathematics",
      department: "Secondary Education",
      school: "Al Noor International School",
      roleType: "expert_teacher",
      track: "Teaching",
    },
    
    // Education
    education: [
      {
        degree: "Master of Education",
        field: "Mathematics Education",
        institution: "UAE University",
        year: "2018",
        gpa: "3.8/4.0",
      },
      {
        degree: "Bachelor of Science",
        field: "Mathematics",
        institution: "American University of Sharjah",
        year: "2014",
        gpa: "3.6/4.0",
      },
    ],
    
    // Teaching Certifications
    certifications: [
      { name: "UAE Teaching License - Level 3", issuer: "MOE UAE", year: "2023", status: "active" },
      { name: "Cambridge IGCSE Mathematics", issuer: "Cambridge Assessment", year: "2022", status: "active" },
      { name: "IB Mathematics Certification", issuer: "IBO", year: "2021", status: "active" },
    ],
    
    // Experience
    experience: [
      {
        title: "Senior Mathematics Teacher",
        school: "Dubai International Academy",
        duration: "2020 - Present",
        years: 4,
        responsibilities: [
          "Teaching IGCSE and IB Mathematics to grades 9-12",
          "Mentoring junior teachers",
          "Curriculum development for advanced mathematics",
          "Leading mathematics department initiatives",
        ],
      },
      {
        title: "Mathematics Teacher",
        school: "GEMS Wellington Academy",
        duration: "2016 - 2020",
        years: 4,
        responsibilities: [
          "Teaching mathematics to grades 7-10",
          "Developing differentiated learning materials",
          "Coordinating with parents on student progress",
        ],
      },
    ],
    
    // Skills & Competencies
    skills: [
      { name: "Curriculum Development", level: 90 },
      { name: "Differentiated Instruction", level: 85 },
      { name: "Student Assessment", level: 88 },
      { name: "Educational Technology", level: 82 },
      { name: "Classroom Management", level: 95 },
      { name: "Parent Communication", level: 80 },
    ],
    
    // Application Score
    applicationScore: 87,
    screeningScore: 92,
    interviewScore: 85,
  };

  const interviewNotes: InterviewNote[] = [
    {
      id: 1,
      interviewer: "Dr. Ahmed Hassan",
      date: "2024-11-20",
      type: "Technical Interview",
      rating: 4.5,
      notes: "Excellent subject knowledge. Demonstrated strong pedagogical skills and innovative teaching methods. Very impressive track record with IB students.",
    },
    {
      id: 2,
      interviewer: "Sarah Al Maktoum",
      date: "2024-11-22",
      type: "HR Interview",
      rating: 4.2,
      notes: "Great communication skills and cultural fit. Shows genuine passion for education. Strong alignment with school values.",
    },
  ];

  const timeline = [
    { date: "2024-11-15", event: "Application Received", status: "completed" },
    { date: "2024-11-16", event: "Resume Screening", status: "completed" },
    { date: "2024-11-18", event: "Initial Phone Screening", status: "completed" },
    { date: "2024-11-20", event: "Technical Interview", status: "completed" },
    { date: "2024-11-22", event: "HR Interview", status: "completed" },
    { date: "2024-11-25", event: "Teaching Demo", status: "current" },
    { date: "TBD", event: "Reference Check", status: "pending" },
    { date: "TBD", event: "Final Decision", status: "pending" },
  ];

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    toast.success(`Candidate status updated to ${status}`);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error("Please enter a note");
      return;
    }
    toast.success("Note added successfully");
    setNewNote("");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      new: { color: "bg-blue-100 text-blue-700", label: "New" },
      screening: { color: "bg-purple-100 text-purple-700", label: "Screening" },
      interview: { color: "bg-amber-100 text-amber-700", label: "Interview" },
      offer: { color: "bg-green-100 text-green-700", label: "Offer" },
      hired: { color: "bg-emerald-100 text-emerald-700", label: "Hired" },
      rejected: { color: "bg-red-100 text-red-700", label: "Rejected" },
    };
    const { color, label } = variants[status] || variants.new;
    return <Badge className={color}>{label}</Badge>;
  };

  const totalExperience = candidate.experience.reduce((sum, exp) => sum + exp.years, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" className="mb-2 -ml-2" onClick={() => navigate("/recruitment/candidates")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg bg-indigo-100 text-indigo-700">
                {candidate.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{candidate.name}</h1>
              <p className="text-muted-foreground">
                Applying for: {candidate.position.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(candidate.status)}
                <Badge variant="outline">{candidate.position.track} Track</Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="screening">Screening</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download CV
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send Offer
          </Button>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Application Score</p>
                <p className="text-2xl font-bold">{candidate.applicationScore}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={candidate.applicationScore} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Screening Score</p>
                <p className="text-2xl font-bold">{candidate.screeningScore}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Progress value={candidate.screeningScore} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interview Score</p>
                <p className="text-2xl font-bold">{candidate.interviewScore}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <Progress value={candidate.interviewScore} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Experience</p>
                <p className="text-2xl font-bold">{totalExperience} Years</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{candidate.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{candidate.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{candidate.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nationality</p>
                        <p className="font-medium">{candidate.nationality}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.education.map((edu, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground">{edu.field}</p>
                        <p className="text-sm">{edu.institution}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{edu.year}</span>
                          <span>GPA: {edu.gpa}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills & Competencies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.skills.map((skill, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{skill.name}</span>
                        <span className="font-medium">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Teaching Experience
                  </CardTitle>
                  <CardDescription>
                    {totalExperience} years of teaching experience in UAE schools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {candidate.experience.map((exp, idx) => (
                    <div key={idx} className="relative pl-6 pb-6 border-l-2 border-muted last:pb-0">
                      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{exp.title}</h4>
                            <p className="text-sm text-indigo-600">{exp.school}</p>
                          </div>
                          <Badge variant="secondary">{exp.duration}</Badge>
                        </div>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {exp.responsibilities.map((resp, rIdx) => (
                            <li key={rIdx}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Teaching Certifications & Licenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Award className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {cert.issuer} • {cert.year}
                          </p>
                        </div>
                      </div>
                      <Badge className={cert.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {cert.status === "active" ? "Active" : "Expired"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interviews Tab */}
            <TabsContent value="interviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Interview Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interviewNotes.map((note) => (
                    <div key={note.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{note.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {note.interviewer} • {new Date(note.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Math.round(note.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium">{note.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm">{note.notes}</p>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-3">
                    <Label>Add Interview Note</Label>
                    <Textarea
                      placeholder="Enter your notes about this candidate..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleAddNote}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Position Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Position Applied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold">{candidate.position.title}</p>
                <p className="text-sm text-muted-foreground">{candidate.position.department}</p>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">School</span>
                  <span className="font-medium">{candidate.position.school}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role Type</span>
                  <Badge variant="outline">
                    {EDUCATOR_ROLES.find(r => r.value === candidate.position.roleType)?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Track</span>
                  <span>{candidate.position.track}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`mt-0.5 ${
                      item.status === "completed"
                        ? "text-green-500"
                        : item.status === "current"
                        ? "text-blue-500"
                        : "text-gray-300"
                    }`}>
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : item.status === "current" ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-current" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        item.status === "pending" ? "text-muted-foreground" : ""
                      }`}>
                        {item.event}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Request Teaching Demo
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                <XCircle className="h-4 w-4 mr-2" />
                Reject Candidate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
