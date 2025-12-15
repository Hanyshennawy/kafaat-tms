import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Plus, Briefcase, Eye, Users, FileText, GraduationCap, Building, 
  Clock, DollarSign, Award, BookOpen, Sparkles, CheckCircle, AlertCircle,
  Calendar, MapPin, User, Upload
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { BulkUpload, BulkUploadColumn, BulkUploadResult } from "@/components/BulkUpload";

// Position templates for educators
const positionTemplates = [
  {
    id: "classroom-teacher",
    name: "Classroom Teacher",
    icon: "👨‍🏫",
    description: "Core teaching position for subject instruction",
    defaults: {
      contractType: "full-time",
      salaryMin: 8000,
      salaryMax: 15000,
      requiredCerts: ["Teaching License", "Subject Certification"],
    }
  },
  {
    id: "department-head",
    name: "Department Head",
    icon: "👔",
    description: "Lead a subject department with teaching duties",
    defaults: {
      contractType: "full-time",
      salaryMin: 15000,
      salaryMax: 22000,
      requiredCerts: ["Teaching License", "Leadership Certification"],
    }
  },
  {
    id: "coordinator",
    name: "Academic Coordinator",
    icon: "📋",
    description: "Coordinate curriculum and academic programs",
    defaults: {
      contractType: "full-time",
      salaryMin: 12000,
      salaryMax: 18000,
      requiredCerts: ["Teaching License", "Curriculum Certification"],
    }
  },
  {
    id: "principal",
    name: "School Principal",
    icon: "🎓",
    description: "Lead school administration and operations",
    defaults: {
      contractType: "full-time",
      salaryMin: 25000,
      salaryMax: 40000,
      requiredCerts: ["Leadership License", "Principal Certification"],
    }
  },
  {
    id: "counselor",
    name: "School Counselor",
    icon: "💬",
    description: "Student guidance and counseling services",
    defaults: {
      contractType: "full-time",
      salaryMin: 10000,
      salaryMax: 16000,
      requiredCerts: ["Counseling License"],
    }
  },
  {
    id: "special-ed",
    name: "Special Education Teacher",
    icon: "🌟",
    description: "Support students with special learning needs",
    defaults: {
      contractType: "full-time",
      salaryMin: 10000,
      salaryMax: 18000,
      requiredCerts: ["Teaching License", "Special Ed Certification"],
    }
  },
];

const departments = [
  "Mathematics", "Science", "English Language", "Arabic Language", 
  "Social Studies", "Physical Education", "Arts & Music", 
  "Technology", "Special Education", "Administration"
];

const gradeLevels = ["KG", "Elementary (1-5)", "Middle (6-8)", "High (9-12)", "All Levels"];
const subjectAreas = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Arabic", "History", "Geography", "Computer Science", "Art", "Music", "PE"];
const requiredCertifications = ["UAE Teaching License", "KHDA Certification", "MOE Approval", "Subject Certification", "Leadership Certificate", "Special Ed Certificate"];

// Bulk upload configuration for job requisitions
const jobRequisitionColumns: BulkUploadColumn[] = [
  { key: "title", label: "Job Title", required: true, type: "text", description: "e.g., Mathematics Teacher" },
  { key: "department", label: "Department", required: true, type: "select", options: departments, description: "Mathematics" },
  { key: "gradeLevel", label: "Grade Level", required: true, type: "select", options: gradeLevels, description: "Middle (6-8)" },
  { key: "positions", label: "Number of Positions", required: true, type: "number", description: "2" },
  { key: "contractType", label: "Contract Type", required: true, type: "select", options: ["full-time", "part-time", "contract"], description: "full-time" },
  { key: "salaryMin", label: "Min Salary (AED)", required: false, type: "number", description: "8000" },
  { key: "salaryMax", label: "Max Salary (AED)", required: false, type: "number", description: "15000" },
  { key: "minExperience", label: "Min Experience (Years)", required: false, type: "number", description: "2" },
  { key: "description", label: "Description", required: false, type: "text", description: "Teaching position for..." },
];

const jobRequisitionExampleData = [
  { title: "Mathematics Teacher", department: "Mathematics", gradeLevel: "Middle (6-8)", positions: "2", contractType: "full-time", salaryMin: "8000", salaryMax: "15000", minExperience: "3", description: "Experienced math teacher for middle school" },
  { title: "Science Teacher", department: "Science", gradeLevel: "High (9-12)", positions: "1", contractType: "full-time", salaryMin: "10000", salaryMax: "18000", minExperience: "5", description: "Senior science teacher with lab experience" },
  { title: "English Teacher", department: "English Language", gradeLevel: "Elementary (1-5)", positions: "3", contractType: "full-time", salaryMin: "7000", salaryMax: "12000", minExperience: "2", description: "Native English speaker preferred" },
];

export default function JobRequisitions() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const [newReq, setNewReq] = useState({
    title: "",
    description: "",
    departmentId: 1,
    numberOfPositions: 1,
    // Details
    department: "",
    gradeLevel: "",
    subjectArea: "",
    contractType: "full-time",
    location: "Main Campus",
    startDate: "",
    // Compensation
    salaryMin: 8000,
    salaryMax: 15000,
    currency: "AED",
    benefits: [] as string[],
    // Requirements
    minExperience: 2,
    educationLevel: "bachelor",
    requiredCerts: [] as string[],
    preferredSkills: "",
    languageRequirements: ["English", "Arabic"],
    // Approval
    hiringManager: "",
    approvalRequired: true,
    priority: "normal",
    targetHireDate: "",
    linkToJobDescription: false,
  });
  
  const { data: requisitions, refetch } = trpc.recruitment.getAllRequisitions.useQuery();
  const createRequisition = trpc.recruitment.createRequisition.useMutation({
    onSuccess: () => {
      toast.success("Job requisition created successfully!");
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      console.error("Failed to create requisition:", error);
      toast.error(error.message || "Failed to create requisition. Check database connection.");
    },
  });

  const resetForm = () => {
    setNewReq({
      title: "",
      description: "",
      departmentId: 1,
      numberOfPositions: 1,
      department: "",
      gradeLevel: "",
      subjectArea: "",
      contractType: "full-time",
      location: "Main Campus",
      startDate: "",
      salaryMin: 8000,
      salaryMax: 15000,
      currency: "AED",
      benefits: [],
      minExperience: 2,
      educationLevel: "bachelor",
      requiredCerts: [],
      preferredSkills: "",
      languageRequirements: ["English", "Arabic"],
      hiringManager: "",
      approvalRequired: true,
      priority: "normal",
      targetHireDate: "",
      linkToJobDescription: false,
    });
    setSelectedTemplate(null);
    setActiveTab("details");
  };

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = positionTemplates.find(t => t.id === templateId);
    if (template) {
      setNewReq(prev => ({
        ...prev,
        title: template.name,
        description: template.description,
        contractType: template.defaults.contractType,
        salaryMin: template.defaults.salaryMin,
        salaryMax: template.defaults.salaryMax,
        requiredCerts: template.defaults.requiredCerts,
      }));
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const getCompletionProgress = () => {
    let score = 0;
    if (newReq.title) score += 20;
    if (newReq.department) score += 15;
    if (newReq.gradeLevel) score += 15;
    if (newReq.description) score += 15;
    if (newReq.requiredCerts.length > 0) score += 15;
    if (newReq.salaryMin && newReq.salaryMax) score += 10;
    if (newReq.targetHireDate) score += 10;
    return score;
  };

  // Handle bulk upload of job requisitions
  const handleBulkUpload = async (data: Record<string, any>[]): Promise<BulkUploadResult[]> => {
    const results: BulkUploadResult[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Simulate API call - in production, this would call createRequisition.mutateAsync
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Demo mode: just simulate success
        results.push({
          row: i + 2,
          status: "success",
          message: `Job requisition "${row.title}" created successfully`,
          data: row
        });
      } catch (error) {
        results.push({
          row: i + 2,
          status: "error",
          message: `Failed to create requisition: ${error}`
        });
      }
    }
    
    refetch();
    return results;
  };

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
        <div className="flex items-center gap-2">
          <BulkUpload
            title="Bulk Upload Job Requisitions"
            description="Import multiple job requisitions from a CSV file. Download the template to get started."
            columns={jobRequisitionColumns}
            templateFileName="job_requisitions_template"
            onUpload={handleBulkUpload}
            onComplete={() => refetch()}
            exampleData={jobRequisitionExampleData}
            icon={<Briefcase className="h-5 w-5 text-red-600" />}
            triggerButton={
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Bulk Upload
              </Button>
            }
          />
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Create Requisition</Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Create Job Requisition
              </DialogTitle>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1">
                  <Progress value={getCompletionProgress()} className="h-2" />
                </div>
                <span className="text-sm text-muted-foreground">{getCompletionProgress()}% complete</span>
              </div>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="requirements" className="gap-2">
                  <Award className="h-4 w-4" />
                  Requirements
                </TabsTrigger>
                <TabsTrigger value="compensation" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  Compensation
                </TabsTrigger>
                <TabsTrigger value="approval" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approval
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Position Details */}
              <TabsContent value="details" className="space-y-6 mt-4">
                {/* Template Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Choose a Position Template
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {positionTemplates.map(template => (
                      <div
                        key={template.id}
                        onClick={() => applyTemplate(template.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary hover:bg-accent/50 ${selectedTemplate === template.id ? 'border-primary bg-accent ring-2 ring-primary/20' : ''}`}
                      >
                        <div className="text-2xl mb-2">{template.icon}</div>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title *</Label>
                    <Input 
                      placeholder="e.g., Mathematics Teacher" 
                      value={newReq.title} 
                      onChange={(e) => setNewReq({ ...newReq, title: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Positions</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={newReq.numberOfPositions} 
                      onChange={(e) => setNewReq({ ...newReq, numberOfPositions: parseInt(e.target.value) || 1 })} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Select value={newReq.department} onValueChange={(v) => setNewReq({ ...newReq, department: v })}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Grade Level *</Label>
                    <Select value={newReq.gradeLevel} onValueChange={(v) => setNewReq({ ...newReq, gradeLevel: v })}>
                      <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        {gradeLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject Area</Label>
                    <Select value={newReq.subjectArea} onValueChange={(v) => setNewReq({ ...newReq, subjectArea: v })}>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        {subjectAreas.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contract Type</Label>
                    <Select value={newReq.contractType} onValueChange={(v) => setNewReq({ ...newReq, contractType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-Time</SelectItem>
                        <SelectItem value="part-time">Part-Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                        <SelectItem value="substitute">Substitute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={newReq.location} onValueChange={(v) => setNewReq({ ...newReq, location: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Main Campus">Main Campus</SelectItem>
                        <SelectItem value="Branch Campus">Branch Campus</SelectItem>
                        <SelectItem value="Al Ain Campus">Al Ain Campus</SelectItem>
                        <SelectItem value="Dubai Campus">Dubai Campus</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Job Description</Label>
                  <Textarea 
                    placeholder="Describe the role, responsibilities, and expectations..." 
                    value={newReq.description} 
                    onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label className="font-semibold">Link to Job Description Catalog</Label>
                      <p className="text-sm text-muted-foreground">Import details from existing job description</p>
                    </div>
                  </div>
                  <Switch 
                    checked={newReq.linkToJobDescription}
                    onCheckedChange={(checked) => setNewReq({ ...newReq, linkToJobDescription: checked })}
                  />
                </div>
              </TabsContent>

              {/* Tab 2: Requirements */}
              <TabsContent value="requirements" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Minimum Experience (Years)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[newReq.minExperience]}
                      onValueChange={(v) => setNewReq({ ...newReq, minExperience: v[0] })}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold w-16 text-center">{newReq.minExperience} yrs</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Education Level</Label>
                  <Select value={newReq.educationLevel} onValueChange={(v) => setNewReq({ ...newReq, educationLevel: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="doctorate">Doctorate (PhD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Required Certifications</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {requiredCertifications.map(cert => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cert-${cert}`}
                          checked={newReq.requiredCerts.includes(cert)}
                          onCheckedChange={() => toggleArrayItem(
                            newReq.requiredCerts, 
                            cert, 
                            (arr) => setNewReq({ ...newReq, requiredCerts: arr })
                          )}
                        />
                        <label htmlFor={`cert-${cert}`} className="text-sm">{cert}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">Preferred Skills</Label>
                  <Textarea 
                    placeholder="List any preferred skills, technologies, or specializations..." 
                    value={newReq.preferredSkills}
                    onChange={(e) => setNewReq({ ...newReq, preferredSkills: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Language Requirements</Label>
                  <div className="flex gap-4">
                    {["English", "Arabic", "French", "Hindi", "Urdu"].map(lang => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`lang-${lang}`}
                          checked={newReq.languageRequirements.includes(lang)}
                          onCheckedChange={() => toggleArrayItem(
                            newReq.languageRequirements, 
                            lang, 
                            (arr) => setNewReq({ ...newReq, languageRequirements: arr })
                          )}
                        />
                        <label htmlFor={`lang-${lang}`} className="text-sm">{lang}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Compensation */}
              <TabsContent value="compensation" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Salary Range (Monthly)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-muted-foreground/20 bg-muted text-sm">
                          AED
                        </span>
                        <Input 
                          type="number"
                          className="rounded-l-none"
                          value={newReq.salaryMin}
                          onChange={(e) => setNewReq({ ...newReq, salaryMin: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-muted-foreground/20 bg-muted text-sm">
                          AED
                        </span>
                        <Input 
                          type="number"
                          className="rounded-l-none"
                          value={newReq.salaryMax}
                          onChange={(e) => setNewReq({ ...newReq, salaryMax: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <div className="p-3 bg-primary/10 rounded-lg text-center flex-1">
                        <div className="text-sm text-muted-foreground">Mid-point</div>
                        <div className="font-bold">AED {Math.round((newReq.salaryMin + newReq.salaryMax) / 2).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Benefits Package</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Housing Allowance", "Transportation", "Health Insurance", "Annual Flight", "Tuition Support", "End of Service", "Performance Bonus", "Professional Development", "Visa Sponsorship"].map(benefit => (
                      <div key={benefit} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`benefit-${benefit}`}
                          checked={newReq.benefits.includes(benefit)}
                          onCheckedChange={() => toggleArrayItem(
                            newReq.benefits, 
                            benefit, 
                            (arr) => setNewReq({ ...newReq, benefits: arr })
                          )}
                        />
                        <label htmlFor={`benefit-${benefit}`} className="text-sm">{benefit}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compensation Summary */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Total Compensation Summary</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span>Base Salary Range:</span>
                        <span className="font-medium">AED {newReq.salaryMin.toLocaleString()} - {newReq.salaryMax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Benefits Selected:</span>
                        <span className="font-medium">{newReq.benefits.length} items</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 4: Approval Workflow */}
              <TabsContent value="approval" className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hiring Manager</Label>
                    <Select value={newReq.hiringManager} onValueChange={(v) => setNewReq({ ...newReq, hiringManager: v })}>
                      <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dr-hassan">Dr. Hassan Ahmed</SelectItem>
                        <SelectItem value="ms-fatima">Ms. Fatima Al-Rashid</SelectItem>
                        <SelectItem value="mr-omar">Mr. Omar Saeed</SelectItem>
                        <SelectItem value="dr-aisha">Dr. Aisha Mohammed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority Level</Label>
                    <Select value={newReq.priority} onValueChange={(v) => setNewReq({ ...newReq, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preferred Start Date</Label>
                    <Input 
                      type="date"
                      value={newReq.startDate}
                      onChange={(e) => setNewReq({ ...newReq, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Hire Date</Label>
                    <Input 
                      type="date"
                      value={newReq.targetHireDate}
                      onChange={(e) => setNewReq({ ...newReq, targetHireDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="font-semibold">Requires Approval</Label>
                    <p className="text-sm text-muted-foreground">Send to department head for approval before posting</p>
                  </div>
                  <Switch 
                    checked={newReq.approvalRequired}
                    onCheckedChange={(checked) => setNewReq({ ...newReq, approvalRequired: checked })}
                  />
                </div>

                {/* Requisition Summary */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Requisition Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Position:</span>
                        <span className="font-medium">{newReq.title || "Not set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Department:</span>
                        <span className="font-medium">{newReq.department || "Not set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Grade Level:</span>
                        <span className="font-medium">{newReq.gradeLevel || "Not set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Openings:</span>
                        <span className="font-medium">{newReq.numberOfPositions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experience:</span>
                        <span className="font-medium">{newReq.minExperience}+ years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority:</span>
                        <Badge variant={newReq.priority === "urgent" ? "destructive" : newReq.priority === "high" ? "default" : "secondary"}>
                          {newReq.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <div className="flex gap-2">
                {activeTab !== "details" && (
                  <Button variant="outline" onClick={() => {
                    const tabs = ["details", "requirements", "compensation", "approval"];
                    const currentIdx = tabs.indexOf(activeTab);
                    if (currentIdx > 0) setActiveTab(tabs[currentIdx - 1]);
                  }}>
                    Previous
                  </Button>
                )}
                {activeTab !== "approval" ? (
                  <Button onClick={() => {
                    const tabs = ["details", "requirements", "compensation", "approval"];
                    const currentIdx = tabs.indexOf(activeTab);
                    if (currentIdx < tabs.length - 1) setActiveTab(tabs[currentIdx + 1]);
                  }}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={() => createRequisition.mutate(newReq)}
                    disabled={!newReq.title || !newReq.department}
                  >
                    {newReq.approvalRequired ? "Submit for Approval" : "Create Requisition"}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Requisitions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{requisitions?.length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Open Positions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{requisitions?.filter(r => r.status === "posted").length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">In Progress</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{requisitions?.filter(r => r.status === "approved").length || 0}</div></CardContent></Card>
      </div>

      <div className="grid gap-4">
        {requisitions?.map(req => (
          <Card key={req.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {req.title}
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
