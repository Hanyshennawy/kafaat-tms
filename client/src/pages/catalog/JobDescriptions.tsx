import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Plus, 
  Search, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  GraduationCap,
  Target,
  Award,
  BookOpen,
  Users,
  Building2,
  TrendingUp,
  Link2,
  FileUp,
  Loader2
} from "lucide-react";

// Demo job descriptions data
const demoJobDescriptions = [
  {
    id: 1,
    title: "Mathematics Teacher",
    department: "Mathematics",
    schoolLevel: "Secondary",
    status: "active",
    lastUpdated: "2024-12-01",
    linkedTo: {
      careerPaths: 2,
      performanceGoals: 5,
      licenses: 1,
      competencies: 8
    },
    requirements: {
      education: "Bachelor's in Mathematics or Education",
      experience: "2+ years teaching experience",
      licenses: ["Teaching License - Mathematics"],
      competencies: ["Curriculum Development", "Classroom Management", "Assessment Design"]
    }
  },
  {
    id: 2,
    title: "Science Department Head",
    department: "Science",
    schoolLevel: "Secondary",
    status: "active",
    lastUpdated: "2024-11-15",
    linkedTo: {
      careerPaths: 3,
      performanceGoals: 8,
      licenses: 2,
      competencies: 12
    },
    requirements: {
      education: "Master's in Science or Education Leadership",
      experience: "5+ years teaching, 2+ years leadership",
      licenses: ["Teaching License - Science", "Department Head Certification"],
      competencies: ["Leadership", "Curriculum Development", "Team Management", "Budget Planning"]
    }
  },
  {
    id: 3,
    title: "Elementary Teacher",
    department: "General Education",
    schoolLevel: "Elementary",
    status: "active",
    lastUpdated: "2024-11-20",
    linkedTo: {
      careerPaths: 2,
      performanceGoals: 6,
      licenses: 1,
      competencies: 10
    },
    requirements: {
      education: "Bachelor's in Elementary Education",
      experience: "1+ years teaching experience",
      licenses: ["Elementary Teaching License"],
      competencies: ["Child Development", "Differentiated Instruction", "Parent Communication"]
    }
  },
  {
    id: 4,
    title: "School Principal",
    department: "Administration",
    schoolLevel: "All Levels",
    status: "active",
    lastUpdated: "2024-10-30",
    linkedTo: {
      careerPaths: 1,
      performanceGoals: 10,
      licenses: 3,
      competencies: 15
    },
    requirements: {
      education: "Master's in Educational Leadership",
      experience: "8+ years in education, 3+ years in leadership",
      licenses: ["Principal License", "Teaching License", "Administrative Certification"],
      competencies: ["Strategic Planning", "School Operations", "Staff Development", "Community Relations"]
    }
  },
  {
    id: 5,
    title: "Special Education Teacher",
    department: "Special Education",
    schoolLevel: "All Levels",
    status: "draft",
    lastUpdated: "2024-12-05",
    linkedTo: {
      careerPaths: 1,
      performanceGoals: 4,
      licenses: 2,
      competencies: 9
    },
    requirements: {
      education: "Bachelor's in Special Education",
      experience: "2+ years with special needs students",
      licenses: ["Special Education License", "Teaching License"],
      competencies: ["IEP Development", "Behavior Management", "Adaptive Teaching"]
    }
  }
];

// Templates for quick creation
const jobTemplates = [
  {
    id: "teacher",
    title: "📚 Classroom Teacher",
    description: "Standard teaching position template",
    color: "bg-blue-500"
  },
  {
    id: "department_head",
    title: "👔 Department Head",
    description: "Subject area leadership position",
    color: "bg-purple-500"
  },
  {
    id: "coordinator",
    title: "📋 Coordinator",
    description: "Academic or program coordinator",
    color: "bg-green-500"
  },
  {
    id: "administrator",
    title: "🏫 Administrator",
    description: "School leadership position",
    color: "bg-amber-500"
  }
];

export default function JobDescriptions() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    schoolLevel: "",
    description: "",
    responsibilities: "",
    education: "",
    experience: "",
    licenses: [] as string[],
    competencies: [] as string[],
    salaryBand: "",
    employmentType: "full-time"
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Pre-fill based on template
    const templates: Record<string, Partial<typeof formData>> = {
      teacher: {
        title: "",
        department: "",
        schoolLevel: "Secondary",
        description: "Responsible for delivering high-quality instruction to students...",
        responsibilities: "• Plan and deliver engaging lessons\n• Assess student progress\n• Maintain classroom management\n• Communicate with parents\n• Participate in professional development",
        education: "Bachelor's degree in Education or subject area",
        experience: "2+ years of teaching experience preferred",
        employmentType: "full-time"
      },
      department_head: {
        title: "",
        department: "",
        schoolLevel: "Secondary",
        description: "Lead and manage the academic department, ensuring curriculum alignment and teacher development...",
        responsibilities: "• Lead department teachers\n• Oversee curriculum development\n• Manage department budget\n• Conduct teacher evaluations\n• Coordinate with administration",
        education: "Master's degree in Education or subject area",
        experience: "5+ years teaching experience, 2+ years in leadership",
        employmentType: "full-time"
      },
      coordinator: {
        title: "",
        department: "",
        schoolLevel: "All Levels",
        description: "Coordinate academic programs and support teaching staff...",
        responsibilities: "• Coordinate program activities\n• Support teacher development\n• Manage resources\n• Track program outcomes\n• Report to administration",
        education: "Bachelor's degree in Education",
        experience: "3+ years in education",
        employmentType: "full-time"
      },
      administrator: {
        title: "",
        department: "Administration",
        schoolLevel: "All Levels",
        description: "Provide leadership for school operations and academic excellence...",
        responsibilities: "• Lead school vision and strategy\n• Manage school operations\n• Oversee staff development\n• Engage with community\n• Ensure regulatory compliance",
        education: "Master's degree in Educational Leadership",
        experience: "8+ years in education, 3+ in leadership",
        employmentType: "full-time"
      }
    };
    if (templates[templateId]) {
      setFormData({ ...formData, ...templates[templateId] });
    }
    setActiveTab("details");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const simulateAIExtraction = () => {
    setIsExtracting(true);
    setExtractionProgress(0);
    
    const interval = setInterval(() => {
      setExtractionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExtracting(false);
          // Simulate extracted data
          setFormData({
            title: "Mathematics Teacher",
            department: "Mathematics",
            schoolLevel: "Secondary",
            description: "The Mathematics Teacher is responsible for delivering comprehensive mathematics instruction to secondary school students, fostering critical thinking and problem-solving skills.",
            responsibilities: "• Develop and implement engaging lesson plans aligned with curriculum standards\n• Assess student progress through various evaluation methods\n• Differentiate instruction to meet diverse learning needs\n• Maintain accurate records of student performance\n• Collaborate with colleagues on curriculum development\n• Participate in professional development activities",
            education: "Bachelor's degree in Mathematics or Mathematics Education",
            experience: "Minimum 2 years of teaching experience at secondary level",
            licenses: ["UAE Teaching License - Mathematics", "KHDA Teacher Certification"],
            competencies: ["Curriculum Development", "Assessment Design", "Classroom Management", "Differentiated Instruction", "Educational Technology"],
            salaryBand: "AED 12,000 - 18,000",
            employmentType: "full-time"
          });
          setIsUploadOpen(false);
          setIsCreateOpen(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const filteredJobs = demoJobDescriptions.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"><Clock className="w-3 h-3 mr-1" /> Draft</Badge>;
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"><AlertCircle className="w-3 h-3 mr-1" /> Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Job Descriptions Catalog
          </h1>
          <p className="text-muted-foreground mt-1">
            Central repository for all position descriptions - the foundation for career paths, performance, and licensing
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  AI-Powered Document Upload
                </DialogTitle>
                <DialogDescription>
                  Upload a job description document (PDF, Word) and our AI will extract all the details automatically
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Drop your document here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-2">Supports PDF, DOC, DOCX</p>
                  </label>
                </div>
                
                {uploadedFile && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {isExtracting && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm font-medium">Extracting information...</span>
                    </div>
                    <Progress value={extractionProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      AI is analyzing your document and extracting competencies, requirements, and more...
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                <Button 
                  onClick={simulateAIExtraction}
                  disabled={!uploadedFile || isExtracting}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract with AI
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Job Description</DialogTitle>
                <DialogDescription>
                  Define position requirements that will automatically link to career paths, performance goals, and licensing
                </DialogDescription>
              </DialogHeader>

              {/* Templates Section */}
              {!selectedTemplate && activeTab === "details" && (
                <div className="py-4">
                  <h3 className="text-sm font-medium mb-3">Quick Start Templates</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {jobTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className="p-4 rounded-lg border-2 hover:border-primary/50 transition-all text-left group"
                      >
                        <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center text-white text-xl mb-2`}>
                          {template.title.split(" ")[0]}
                        </div>
                        <h4 className="font-medium text-sm">{template.title.slice(3)}</h4>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">or start from scratch</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Basic Details</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="competencies">Competencies</TabsTrigger>
                  <TabsTrigger value="linkages">Module Links</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Position Title *</Label>
                      <Input 
                        id="title" 
                        placeholder="e.g., Mathematics Teacher" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Select value={formData.department} onValueChange={(v) => setFormData({...formData, department: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Arabic">Arabic</SelectItem>
                          <SelectItem value="Islamic Studies">Islamic Studies</SelectItem>
                          <SelectItem value="Social Studies">Social Studies</SelectItem>
                          <SelectItem value="Physical Education">Physical Education</SelectItem>
                          <SelectItem value="Arts">Arts</SelectItem>
                          <SelectItem value="Special Education">Special Education</SelectItem>
                          <SelectItem value="Administration">Administration</SelectItem>
                          <SelectItem value="General Education">General Education</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolLevel">School Level *</Label>
                      <Select value={formData.schoolLevel} onValueChange={(v) => setFormData({...formData, schoolLevel: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Early Years">Early Years (KG)</SelectItem>
                          <SelectItem value="Elementary">Elementary (1-5)</SelectItem>
                          <SelectItem value="Middle">Middle School (6-8)</SelectItem>
                          <SelectItem value="Secondary">Secondary (9-12)</SelectItem>
                          <SelectItem value="All Levels">All Levels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentType">Employment Type</Label>
                      <Select value={formData.employmentType} onValueChange={(v) => setFormData({...formData, employmentType: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="temporary">Temporary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Position Summary</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe the main purpose and scope of this role..."
                      className="min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsibilities">Key Responsibilities</Label>
                    <Textarea 
                      id="responsibilities" 
                      placeholder="• List main responsibilities&#10;• One per line..."
                      className="min-h-[120px]"
                      value={formData.responsibilities}
                      onChange={(e) => setFormData({...formData, responsibilities: e.target.value})}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="requirements" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education Requirements</Label>
                    <Textarea 
                      id="education" 
                      placeholder="Required degrees, certifications, academic qualifications..."
                      className="min-h-[80px]"
                      value={formData.education}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Requirements</Label>
                    <Textarea 
                      id="experience" 
                      placeholder="Years of experience, type of experience required..."
                      className="min-h-[80px]"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Required Licenses</Label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
                      {formData.licenses.map((license, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1">
                          <Award className="h-3 w-3" />
                          {license}
                          <button 
                            onClick={() => setFormData({
                              ...formData, 
                              licenses: formData.licenses.filter((_, i) => i !== idx)
                            })}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                      <Select onValueChange={(v) => {
                        if (!formData.licenses.includes(v)) {
                          setFormData({...formData, licenses: [...formData.licenses, v]});
                        }
                      }}>
                        <SelectTrigger className="w-[200px] h-7">
                          <SelectValue placeholder="+ Add license" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UAE Teaching License">UAE Teaching License</SelectItem>
                          <SelectItem value="KHDA Teacher Certification">KHDA Teacher Certification</SelectItem>
                          <SelectItem value="Principal License">Principal License</SelectItem>
                          <SelectItem value="Special Education License">Special Education License</SelectItem>
                          <SelectItem value="Department Head Certification">Department Head Certification</SelectItem>
                          <SelectItem value="Counselor License">Counselor License</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryBand">Salary Band (Optional)</Label>
                    <Input 
                      id="salaryBand" 
                      placeholder="e.g., AED 12,000 - 18,000"
                      value={formData.salaryBand}
                      onChange={(e) => setFormData({...formData, salaryBand: e.target.value})}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="competencies" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Required Competencies</Label>
                    <p className="text-sm text-muted-foreground">
                      Select competencies from the competency framework that are required for this position
                    </p>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[100px]">
                      {formData.competencies.map((comp, idx) => (
                        <Badge key={idx} variant="outline" className="gap-1 bg-primary/5">
                          <Target className="h-3 w-3" />
                          {comp}
                          <button 
                            onClick={() => setFormData({
                              ...formData, 
                              competencies: formData.competencies.filter((_, i) => i !== idx)
                            })}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Teaching & Instruction</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        {["Curriculum Development", "Lesson Planning", "Classroom Management", "Assessment Design", "Differentiated Instruction"].map(comp => (
                          <Button
                            key={comp}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm h-8"
                            onClick={() => {
                              if (!formData.competencies.includes(comp)) {
                                setFormData({...formData, competencies: [...formData.competencies, comp]});
                              }
                            }}
                          >
                            <Plus className="h-3 w-3 mr-2" />
                            {comp}
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Leadership & Management</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        {["Team Leadership", "Strategic Planning", "Budget Management", "Staff Development", "Change Management"].map(comp => (
                          <Button
                            key={comp}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-sm h-8"
                            onClick={() => {
                              if (!formData.competencies.includes(comp)) {
                                setFormData({...formData, competencies: [...formData.competencies, comp]});
                              }
                            }}
                          >
                            <Plus className="h-3 w-3 mr-2" />
                            {comp}
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="linkages" className="space-y-4 mt-4">
                  <div className="bg-muted/50 p-4 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <Link2 className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Automatic Module Integration</h4>
                        <p className="text-sm text-muted-foreground">
                          Once saved, this job description will be available across other modules for seamless integration
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          Career Progression
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          This position will be available when creating career paths and progression tracks
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200 dark:border-green-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-500" />
                          Performance Goals
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Requirements will be used to suggest relevant performance goals
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-200 dark:border-purple-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-purple-500" />
                          Teacher Licensing
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Required licenses will appear in educator licensing requirements
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-amber-200 dark:border-amber-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Users className="h-4 w-4 text-amber-500" />
                          Succession Planning
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Position requirements will inform succession readiness criteria
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  setSelectedTemplate(null);
                  setFormData({
                    title: "",
                    department: "",
                    schoolLevel: "",
                    description: "",
                    responsibilities: "",
                    education: "",
                    experience: "",
                    licenses: [],
                    competencies: [],
                    salaryBand: "",
                    employmentType: "full-time"
                  });
                }}>
                  Cancel
                </Button>
                <Button variant="outline">Save as Draft</Button>
                <Button>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save & Publish
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Positions</p>
                <p className="text-2xl font-bold">{demoJobDescriptions.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{demoJobDescriptions.filter(j => j.status === 'active').length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-amber-600">{demoJobDescriptions.filter(j => j.status === 'draft').length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{new Set(demoJobDescriptions.map(j => j.department)).size}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search job descriptions..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Mathematics">Mathematics</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Administration">Administration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job Descriptions List */}
      <div className="space-y-4">
        {filteredJobs.map(job => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    {getStatusBadge(job.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {job.schoolLevel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Updated {job.lastUpdated}
                    </span>
                  </div>

                  {/* Linked Modules */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                      {job.linkedTo.careerPaths} Career Paths
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Target className="h-3 w-3 text-green-500" />
                      {job.linkedTo.performanceGoals} Performance Goals
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Award className="h-3 w-3 text-purple-500" />
                      {job.linkedTo.licenses} Licenses
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <BookOpen className="h-3 w-3 text-amber-500" />
                      {job.linkedTo.competencies} Competencies
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
