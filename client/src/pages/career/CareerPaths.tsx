import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Search, TrendingUp, Eye, GraduationCap, Users, Briefcase, 
  Award, BookOpen, Target, ChevronRight, Trash2, Sparkles, Clock,
  Building2, Star, CheckCircle2, Palette, Zap, ArrowRight, AlertTriangle,
  BarChart3, Gauge, Bell, ArrowUpRight, Timer, UserCheck
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Career path track types for educators
const TRACK_TYPES = [
  { value: "teaching", label: "Teaching Track", icon: GraduationCap, color: "bg-blue-500", description: "Classroom teaching excellence" },
  { value: "leadership", label: "Leadership Track", icon: Users, color: "bg-purple-500", description: "School administration & management" },
  { value: "specialist", label: "Specialist Track", icon: Award, color: "bg-green-500", description: "Subject matter expertise" },
  { value: "support", label: "Support Services", icon: Briefcase, color: "bg-orange-500", description: "Student support & counseling" },
];

// Predefined career path templates
const CAREER_TEMPLATES = [
  {
    name: "Classroom Teacher to Department Head",
    description: "Progress from classroom teaching to leading an academic department",
    trackType: "teaching",
    department: "all",
    duration: "5-8 years",
    levels: [
      { title: "Classroom Teacher", yearsRequired: 0, description: "Entry-level teaching position" },
      { title: "Senior Teacher", yearsRequired: 2, description: "Experienced classroom educator" },
      { title: "Lead Teacher", yearsRequired: 4, description: "Mentor and curriculum contributor" },
      { title: "Department Head", yearsRequired: 6, description: "Academic department leadership" },
    ]
  },
  {
    name: "Teacher to School Principal",
    description: "Leadership track from teaching to school administration",
    trackType: "leadership",
    department: "administration",
    duration: "8-12 years",
    levels: [
      { title: "Classroom Teacher", yearsRequired: 0, description: "Foundation teaching experience" },
      { title: "Senior Teacher", yearsRequired: 3, description: "Demonstrated teaching excellence" },
      { title: "Assistant Principal", yearsRequired: 5, description: "School leadership role" },
      { title: "Vice Principal", yearsRequired: 8, description: "Senior administrative position" },
      { title: "Principal", yearsRequired: 10, description: "School head" },
    ]
  },
  {
    name: "Subject Specialist Track",
    description: "Become a recognized expert in your subject area",
    trackType: "specialist",
    department: "curriculum",
    duration: "4-6 years",
    levels: [
      { title: "Subject Teacher", yearsRequired: 0, description: "Teaching specific subject" },
      { title: "Subject Coordinator", yearsRequired: 2, description: "Coordinate subject across grades" },
      { title: "Curriculum Developer", yearsRequired: 4, description: "Design and improve curriculum" },
      { title: "Subject Expert", yearsRequired: 6, description: "District-level subject authority" },
    ]
  },
  {
    name: "Student Counselor Track",
    description: "Career path for student support and guidance",
    trackType: "support",
    department: "student_services",
    duration: "4-7 years",
    levels: [
      { title: "Teacher/Counselor Trainee", yearsRequired: 0, description: "Initial counseling role" },
      { title: "School Counselor", yearsRequired: 2, description: "Full-time student counselor" },
      { title: "Senior Counselor", yearsRequired: 4, description: "Lead counseling initiatives" },
      { title: "Head of Student Services", yearsRequired: 6, description: "Lead all student support" },
    ]
  },
];

// Departments
const DEPARTMENTS = [
  { value: "all", label: "All Departments" },
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "english", label: "English Language" },
  { value: "arabic", label: "Arabic Language" },
  { value: "social_studies", label: "Social Studies" },
  { value: "islamic_studies", label: "Islamic Studies" },
  { value: "physical_education", label: "Physical Education" },
  { value: "arts", label: "Arts & Music" },
  { value: "technology", label: "Technology" },
  { value: "administration", label: "Administration" },
  { value: "student_services", label: "Student Services" },
  { value: "curriculum", label: "Curriculum & Instruction" },
];

// Color options for visual identification
const PATH_COLORS = [
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
  { value: "teal", label: "Teal", class: "bg-teal-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
];

// Initial state for new career path
const initialPathState = {
  name: "",
  description: "",
  trackType: "",
  department: "",
  duration: "",
  targetRole: "",
  startingPosition: "",
  requiredCertifications: "",
  cpdHoursPerLevel: 40,
  gradeScope: "",
  pathColor: "blue",
  status: "draft",
  isPublic: true,
  levels: [
    { title: "", yearsRequired: 0, description: "", skills: "", certifications: "" }
  ],
  coreCompetencies: [""],
};

export default function CareerPaths() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPath, setNewPath] = useState(initialPathState);
  const [activeTab, setActiveTab] = useState("basics");
  const [showTemplates, setShowTemplates] = useState(true);

  const { data: careerPaths, isLoading, refetch } = trpc.careerProgression.getAllPaths.useQuery();
  const createPath = trpc.careerProgression.createPath.useMutation({
    onSuccess: () => {
      toast.success("Career path created successfully!");
      setIsCreateDialogOpen(false);
      setNewPath(initialPathState);
      setActiveTab("basics");
      setShowTemplates(true);
      refetch();
    },
  });

  const filteredPaths = careerPaths?.filter(path =>
    path.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const applyTemplate = (template: typeof CAREER_TEMPLATES[0]) => {
    setNewPath({
      ...newPath,
      name: template.name,
      description: template.description,
      trackType: template.trackType,
      department: template.department,
      duration: template.duration,
      levels: template.levels.map(l => ({ ...l, skills: "", certifications: "" })),
    });
    setShowTemplates(false);
    toast.success("Template applied! Customize as needed.");
  };

  const addLevel = () => {
    setNewPath({
      ...newPath,
      levels: [...newPath.levels, { title: "", yearsRequired: 0, description: "", skills: "", certifications: "" }]
    });
  };

  const updateLevel = (index: number, field: string, value: any) => {
    const updated = [...newPath.levels];
    updated[index] = { ...updated[index], [field]: value };
    setNewPath({ ...newPath, levels: updated });
  };

  const removeLevel = (index: number) => {
    if (newPath.levels.length > 1) {
      const updated = newPath.levels.filter((_, i) => i !== index);
      setNewPath({ ...newPath, levels: updated });
    }
  };

  const addCompetency = () => {
    setNewPath({ ...newPath, coreCompetencies: [...newPath.coreCompetencies, ""] });
  };

  const updateCompetency = (index: number, value: string) => {
    const updated = [...newPath.coreCompetencies];
    updated[index] = value;
    setNewPath({ ...newPath, coreCompetencies: updated });
  };

  const removeCompetency = (index: number) => {
    const updated = newPath.coreCompetencies.filter((_, i) => i !== index);
    setNewPath({ ...newPath, coreCompetencies: updated });
  };

  const handleCreate = () => {
    if (!newPath.name.trim()) {
      toast.error("Please enter a career path name");
      return;
    }
    createPath.mutate({ name: newPath.name, description: newPath.description });
  };

  const getTrackInfo = (trackValue: string) => {
    return TRACK_TYPES.find(t => t.value === trackValue) || TRACK_TYPES[0];
  };

  const getColorClass = (colorValue: string) => {
    return PATH_COLORS.find(c => c.value === colorValue)?.class || "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            Career Paths
          </h1>
          <p className="text-muted-foreground mt-1">Define and manage career progression paths for educators</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setNewPath(initialPathState);
            setActiveTab("basics");
            setShowTemplates(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Career Path</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Create New Career Path
              </DialogTitle>
              <DialogDescription>
                Define a career progression path with levels, requirements, and competencies
              </DialogDescription>
            </DialogHeader>

            {/* Career Path Templates */}
            {showTemplates && (
              <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Quick Start Templates</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
                    Start from scratch
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {CAREER_TEMPLATES.map((template, index) => {
                    const track = getTrackInfo(template.trackType);
                    return (
                      <button
                        key={index}
                        onClick={() => applyTemplate(template)}
                        className="text-left p-3 rounded-lg border bg-white hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`h-8 w-8 rounded-lg ${track.color} flex items-center justify-center flex-shrink-0`}>
                            <track.icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{template.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{template.duration} • {template.levels.length} levels</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tabs for organized form */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basics" className="text-xs">Basics</TabsTrigger>
                <TabsTrigger value="levels" className="text-xs">Levels</TabsTrigger>
                <TabsTrigger value="requirements" className="text-xs">Requirements</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
              </TabsList>

              {/* Tab 1: Basic Information */}
              <TabsContent value="basics" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Career Path Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    placeholder="e.g., Classroom Teacher to Department Head" 
                    value={newPath.name} 
                    onChange={(e) => setNewPath({ ...newPath, name: e.target.value })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe this career path, its purpose, and who it's designed for..." 
                    value={newPath.description} 
                    onChange={(e) => setNewPath({ ...newPath, description: e.target.value })} 
                    rows={3} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Track Type</Label>
                    <Select value={newPath.trackType} onValueChange={(value) => setNewPath({ ...newPath, trackType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select track type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRACK_TYPES.map((track) => (
                          <SelectItem key={track.value} value={track.value}>
                            <div className="flex items-center gap-2">
                              <div className={`h-4 w-4 rounded ${track.color} flex items-center justify-center`}>
                                <track.icon className="h-2.5 w-2.5 text-white" />
                              </div>
                              <div>
                                <span>{track.label}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={newPath.department} onValueChange={(value) => setNewPath({ ...newPath, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Starting Position
                    </Label>
                    <Input 
                      placeholder="e.g., Classroom Teacher" 
                      value={newPath.startingPosition} 
                      onChange={(e) => setNewPath({ ...newPath, startingPosition: e.target.value })} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Target Role
                    </Label>
                    <Input 
                      placeholder="e.g., Department Head" 
                      value={newPath.targetRole} 
                      onChange={(e) => setNewPath({ ...newPath, targetRole: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Estimated Duration
                    </Label>
                    <Select value={newPath.duration} onValueChange={(value) => setNewPath({ ...newPath, duration: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2 years">1-2 years</SelectItem>
                        <SelectItem value="2-4 years">2-4 years</SelectItem>
                        <SelectItem value="3-5 years">3-5 years</SelectItem>
                        <SelectItem value="5-8 years">5-8 years</SelectItem>
                        <SelectItem value="8-12 years">8-12 years</SelectItem>
                        <SelectItem value="10+ years">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Path Color
                    </Label>
                    <Select value={newPath.pathColor} onValueChange={(value) => setNewPath({ ...newPath, pathColor: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PATH_COLORS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={`h-4 w-4 rounded-full ${color.class}`} />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Career Levels */}
              <TabsContent value="levels" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Career Progression Levels</Label>
                    <p className="text-sm text-muted-foreground">Define the stages in this career path</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addLevel}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Level
                  </Button>
                </div>

                {/* Visual Path Preview */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 overflow-x-auto">
                  {newPath.levels.map((level, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`px-3 py-1.5 rounded-lg ${getColorClass(newPath.pathColor)} text-white text-xs font-medium whitespace-nowrap`}>
                        {level.title || `Level ${index + 1}`}
                      </div>
                      {index < newPath.levels.length - 1 && (
                        <ArrowRight className="h-4 w-4 mx-1 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {newPath.levels.map((level, index) => (
                    <Card key={index} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-6 w-6 rounded-full ${getColorClass(newPath.pathColor)} flex items-center justify-center text-white text-xs font-bold`}>
                              {index + 1}
                            </div>
                            <span className="font-medium text-sm">Level {index + 1}</span>
                          </div>
                          {newPath.levels.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => removeLevel(index)} className="h-7 w-7 text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2 space-y-1">
                            <Label className="text-xs">Position Title</Label>
                            <Input
                              placeholder="e.g., Senior Teacher"
                              value={level.title}
                              onChange={(e) => updateLevel(index, "title", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Years Required</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={level.yearsRequired}
                              onChange={(e) => updateLevel(index, "yearsRequired", parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Input
                            placeholder="Brief description of this level"
                            value={level.description}
                            onChange={(e) => updateLevel(index, "description", e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Key Skills</Label>
                            <Input
                              placeholder="e.g., Leadership, Mentoring"
                              value={level.skills}
                              onChange={(e) => updateLevel(index, "skills", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Required Certifications</Label>
                            <Input
                              placeholder="e.g., Teaching License Level 2"
                              value={level.certifications}
                              onChange={(e) => updateLevel(index, "certifications", e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Tab 3: Requirements & Competencies */}
              <TabsContent value="requirements" className="space-y-4 mt-4">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-green-900">Educator Requirements</p>
                      <p className="text-xs text-green-700 mt-1">
                        Define certifications, CPD requirements, and competencies for this path
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Grade Level Scope</Label>
                    <Select value={newPath.gradeScope} onValueChange={(value) => setNewPath({ ...newPath, gradeScope: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="kg">Kindergarten</SelectItem>
                        <SelectItem value="elementary">Elementary (1-5)</SelectItem>
                        <SelectItem value="middle">Middle School (6-8)</SelectItem>
                        <SelectItem value="high">High School (9-12)</SelectItem>
                        <SelectItem value="kg-elementary">KG to Elementary</SelectItem>
                        <SelectItem value="middle-high">Middle to High School</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      CPD Hours Per Level
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={newPath.cpdHoursPerLevel}
                      onChange={(e) => setNewPath({ ...newPath, cpdHoursPerLevel: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Required Certifications (Overall)</Label>
                  <Textarea 
                    placeholder="List certifications required for this career path (e.g., Teaching License, Subject Certification, Leadership Training)" 
                    value={newPath.requiredCertifications} 
                    onChange={(e) => setNewPath({ ...newPath, requiredCertifications: e.target.value })} 
                    rows={2} 
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Core Competencies
                    </Label>
                    <Button variant="outline" size="sm" onClick={addCompetency}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Competency
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newPath.coreCompetencies.map((competency, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 text-xs font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <Input
                          placeholder={`e.g., Classroom Management, Curriculum Design`}
                          value={competency}
                          onChange={(e) => updateCompetency(index, e.target.value)}
                          className="flex-1"
                        />
                        {newPath.coreCompetencies.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeCompetency(index)} className="h-8 w-8 text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Settings */}
              <TabsContent value="settings" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newPath.status} onValueChange={(value) => setNewPath({ ...newPath, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-400" />
                          Draft - Not visible to employees
                        </div>
                      </SelectItem>
                      <SelectItem value="published">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          Published - Visible and available
                        </div>
                      </SelectItem>
                      <SelectItem value="archived">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          Archived - Hidden but preserved
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Public Visibility</p>
                      <p className="text-xs text-muted-foreground">Allow all employees to view this career path</p>
                    </div>
                  </div>
                  <Switch 
                    checked={newPath.isPublic} 
                    onCheckedChange={(checked) => setNewPath({ ...newPath, isPublic: checked })} 
                  />
                </div>

                <Separator />

                {/* Career Path Summary */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <p className="font-medium text-sm">Career Path Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Track Type:</span>
                      <span>{newPath.trackType ? getTrackInfo(newPath.trackType).label : "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{newPath.duration || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Levels:</span>
                      <span>{newPath.levels.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CPD Hours/Level:</span>
                      <span>{newPath.cpdHoursPerLevel}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Competencies:</span>
                      <span>{newPath.coreCompetencies.filter(c => c.trim()).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={newPath.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                        {newPath.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createPath.isPending} className="gap-2">
                {createPath.isPending ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Create Career Path
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{careerPaths?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Paths</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{careerPaths?.filter((p: any) => p.status === 'published').length || 0}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-600">{careerPaths?.filter((p: any) => p.status === 'draft').length || 0}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
              <Clock className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">156</p>
                <p className="text-xs text-muted-foreground">Educators Enrolled</p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NEW: Progress & Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Career Path Progress Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Educators at Each Stage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { stage: "Entry Level", count: 45, total: 156, color: "bg-blue-500" },
              { stage: "Mid-Level", count: 62, total: 156, color: "bg-green-500" },
              { stage: "Senior Level", count: 35, total: 156, color: "bg-purple-500" },
              { stage: "Leadership", count: 14, total: 156, color: "bg-orange-500" },
            ].map((item) => (
              <div key={item.stage} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.stage}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${(item.count / item.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skill Gap Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="h-4 w-4 text-orange-600" />
              Skill Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { skill: "Leadership & Management", gap: 35, status: "high" },
              { skill: "Digital Pedagogy", gap: 28, status: "high" },
              { skill: "Curriculum Development", gap: 15, status: "medium" },
              { skill: "Student Assessment", gap: 8, status: "low" },
            ].map((item) => (
              <div key={item.skill} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm">{item.skill}</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-1.5 rounded-full ${
                        item.status === 'high' ? 'bg-red-500' :
                        item.status === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.gap}%` }}
                    />
                  </div>
                </div>
                <Badge variant="outline" className={`ml-2 text-xs ${
                  item.status === 'high' ? 'text-red-600' :
                  item.status === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {item.gap}% gap
                </Badge>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2">
              <Target className="h-3 w-3 mr-1" />
              View Full Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Time to Promotion Estimates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4 text-green-600" />
              Avg. Time to Promotion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { path: "Teaching Track", time: "2.5 yrs", trend: "down", change: "-3 months" },
              { path: "Leadership Track", time: "4.2 yrs", trend: "up", change: "+2 months" },
              { path: "Specialist Track", time: "3.1 yrs", trend: "down", change: "-1 month" },
            ].map((item) => (
              <div key={item.path} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{item.path}</p>
                  <p className="text-xs text-muted-foreground">{item.time} avg</p>
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  item.trend === 'down' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.trend === 'down' ? (
                    <ArrowUpRight className="h-3 w-3 rotate-180" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3" />
                  )}
                  {item.change}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Milestone Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              Recent Career Milestones
            </CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[
              { name: "Sarah Ahmed", milestone: "Promoted to Senior Teacher", date: "Today", avatar: "SA" },
              { name: "Mohammed Ali", milestone: "Completed Leadership Certification", date: "Yesterday", avatar: "MA" },
              { name: "Fatima Hassan", milestone: "Started Department Head Track", date: "2 days ago", avatar: "FH" },
              { name: "Omar Khalid", milestone: "Achieved 100% CPD Hours", date: "3 days ago", avatar: "OK" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border min-w-[280px] bg-gradient-to-r from-green-50 to-transparent">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
                  {item.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.milestone}</p>
                  <p className="text-xs text-green-600">{item.date}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search career paths..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-12">Loading...</div>
        ) : filteredPaths && filteredPaths.length > 0 ? (
          filteredPaths.map((path) => (
            <Card key={path.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{path.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{path.description || "No description"}</CardDescription>
                  </div>
                </div>
                <Badge className="w-fit mt-2" variant={path.status === 'published' ? 'default' : 'secondary'}>
                  {path.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <Link href={`/career/paths/${path.id}`}>
                  <Button variant="outline" size="sm" className="gap-2 w-full">
                    <Eye className="h-4 w-4" />View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Career Paths Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first career path to help educators visualize their growth
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />Create Career Path
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
