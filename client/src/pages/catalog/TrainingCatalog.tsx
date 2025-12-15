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
import { Switch } from "@/components/ui/switch";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle2,
  Clock,
  GraduationCap,
  Users,
  Calendar,
  Video,
  Globe,
  Building2,
  Target,
  Award,
  Play,
  ExternalLink,
  Star,
  TrendingUp
} from "lucide-react";

// Demo training programs
const demoTrainingPrograms = [
  {
    id: 1,
    title: "Classroom Management Masterclass",
    code: "CMM-101",
    category: "Teaching Skills",
    format: "hybrid",
    duration: "16 hours",
    cpdCredits: 16,
    provider: "Internal",
    status: "active",
    enrollments: 45,
    rating: 4.8,
    linkedCompetencies: ["Classroom Management", "Behavior Management", "Student Engagement"],
    description: "Comprehensive training on effective classroom management strategies for all grade levels"
  },
  {
    id: 2,
    title: "Assessment Design Workshop",
    code: "ADW-201",
    category: "Assessment",
    format: "in-person",
    duration: "8 hours",
    cpdCredits: 8,
    provider: "Internal",
    status: "active",
    enrollments: 32,
    rating: 4.6,
    linkedCompetencies: ["Assessment Design", "Curriculum Development"],
    description: "Learn to create effective assessments that measure student learning outcomes"
  },
  {
    id: 3,
    title: "Differentiated Instruction Training",
    code: "DIT-301",
    category: "Teaching Skills",
    format: "online",
    duration: "12 hours",
    cpdCredits: 12,
    provider: "External - Coursera",
    status: "active",
    enrollments: 78,
    rating: 4.5,
    linkedCompetencies: ["Differentiated Instruction", "Special Needs Support"],
    description: "Strategies for meeting diverse learner needs in the classroom"
  },
  {
    id: 4,
    title: "Educational Leadership Program",
    code: "ELP-401",
    category: "Leadership",
    format: "hybrid",
    duration: "40 hours",
    cpdCredits: 40,
    provider: "External - Harvard Online",
    status: "active",
    enrollments: 15,
    rating: 4.9,
    linkedCompetencies: ["Team Leadership", "Strategic Planning", "Change Management"],
    description: "Develop essential leadership skills for school administrators"
  },
  {
    id: 5,
    title: "Technology Integration in Education",
    code: "TIE-102",
    category: "Technology",
    format: "online",
    duration: "10 hours",
    cpdCredits: 10,
    provider: "Internal",
    status: "active",
    enrollments: 120,
    rating: 4.4,
    linkedCompetencies: ["Technology Integration", "Digital Literacy"],
    description: "Master the use of educational technology tools in teaching"
  },
  {
    id: 6,
    title: "Parent Communication Skills",
    code: "PCS-103",
    category: "Communication",
    format: "in-person",
    duration: "4 hours",
    cpdCredits: 4,
    provider: "Internal",
    status: "active",
    enrollments: 55,
    rating: 4.7,
    linkedCompetencies: ["Parent Communication", "Stakeholder Engagement"],
    description: "Effective strategies for parent-teacher communication"
  },
  {
    id: 7,
    title: "Special Education Fundamentals",
    code: "SEF-501",
    category: "Special Education",
    format: "hybrid",
    duration: "24 hours",
    cpdCredits: 24,
    provider: "External - SPED Institute",
    status: "active",
    enrollments: 28,
    rating: 4.8,
    linkedCompetencies: ["Special Needs Support", "IEP Development", "Behavior Management"],
    description: "Foundation course for working with students with special needs"
  },
  {
    id: 8,
    title: "Curriculum Development Workshop",
    code: "CDW-202",
    category: "Curriculum",
    format: "in-person",
    duration: "16 hours",
    cpdCredits: 16,
    provider: "Internal",
    status: "draft",
    enrollments: 0,
    rating: 0,
    linkedCompetencies: ["Curriculum Development", "Lesson Planning"],
    description: "Design and develop effective curricula aligned with standards"
  }
];

// Training categories
const trainingCategories = [
  { value: "Teaching Skills", color: "bg-blue-500" },
  { value: "Assessment", color: "bg-green-500" },
  { value: "Leadership", color: "bg-purple-500" },
  { value: "Technology", color: "bg-cyan-500" },
  { value: "Communication", color: "bg-amber-500" },
  { value: "Special Education", color: "bg-pink-500" },
  { value: "Curriculum", color: "bg-indigo-500" }
];

// Training formats
const trainingFormats = [
  { value: "online", label: "Online", icon: Globe },
  { value: "in-person", label: "In-Person", icon: Building2 },
  { value: "hybrid", label: "Hybrid", icon: Video }
];

export default function TrainingCatalog() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("details");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    category: "",
    format: "online",
    duration: "",
    durationUnit: "hours",
    cpdCredits: 0,
    provider: "internal",
    externalProvider: "",
    description: "",
    objectives: "",
    targetAudience: [] as string[],
    prerequisites: "",
    linkedCompetencies: [] as string[],
    linkedLicenses: [] as string[],
    materials: "",
    assessmentMethod: ""
  });

  const getFormatBadge = (format: string) => {
    const fmt = trainingFormats.find(f => f.value === format);
    if (!fmt) return <Badge>{format}</Badge>;
    const Icon = fmt.icon;
    return (
      <Badge variant="outline" className="gap-1">
        <Icon className="h-3 w-3" />
        {fmt.label}
      </Badge>
    );
  };

  const getCategoryColor = (category: string) => {
    return trainingCategories.find(c => c.value === category)?.color || "bg-gray-500";
  };

  const filteredPrograms = demoTrainingPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || program.category === categoryFilter;
    const matchesFormat = formatFilter === "all" || program.format === formatFilter;
    return matchesSearch && matchesCategory && matchesFormat;
  });

  const totalCpdCredits = demoTrainingPrograms.reduce((acc, p) => acc + p.cpdCredits, 0);
  const totalEnrollments = demoTrainingPrograms.reduce((acc, p) => acc + p.enrollments, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Training Catalog
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage professional development programs and CPD-eligible training
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Training
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Training Program</DialogTitle>
              <DialogDescription>
                Add a new training program to the catalog
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="linkages">Linkages</TabsTrigger>
                <TabsTrigger value="delivery">Delivery</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Training Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., Classroom Management Masterclass"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code *</Label>
                    <Input 
                      id="code" 
                      placeholder="e.g., CMM-101"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainingCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                              {cat.value}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="format">Format *</Label>
                    <Select value={formData.format} onValueChange={(v) => setFormData({...formData, format: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {trainingFormats.map(fmt => (
                          <SelectItem key={fmt.value} value={fmt.value}>
                            <div className="flex items-center gap-2">
                              <fmt.icon className="h-4 w-4" />
                              {fmt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number"
                        min="1"
                        placeholder="16"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        className="w-20"
                      />
                      <Select value={formData.durationUnit} onValueChange={(v) => setFormData({...formData, durationUnit: v})}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>CPD Credits</Label>
                    <Input 
                      type="number"
                      min="0"
                      placeholder="16"
                      value={formData.cpdCredits}
                      onChange={(e) => setFormData({...formData, cpdCredits: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={formData.provider} onValueChange={(v) => setFormData({...formData, provider: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="external">External</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.provider === "external" && (
                  <div className="space-y-2">
                    <Label htmlFor="externalProvider">External Provider Name</Label>
                    <Input 
                      id="externalProvider" 
                      placeholder="e.g., Coursera, Harvard Online"
                      value={formData.externalProvider}
                      onChange={(e) => setFormData({...formData, externalProvider: e.target.value})}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe what this training covers..."
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="objectives">Learning Objectives</Label>
                  <Textarea 
                    id="objectives" 
                    placeholder="By the end of this training, participants will be able to:&#10;• Objective 1&#10;• Objective 2"
                    className="min-h-[120px]"
                    value={formData.objectives}
                    onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
                    {formData.targetAudience.map((audience, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {audience}
                        <button 
                          onClick={() => setFormData({
                            ...formData,
                            targetAudience: formData.targetAudience.filter((_, i) => i !== idx)
                          })}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(v) => {
                    if (!formData.targetAudience.includes(v)) {
                      setFormData({...formData, targetAudience: [...formData.targetAudience, v]});
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add target audience..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teachers">Teachers</SelectItem>
                      <SelectItem value="Senior Teachers">Senior Teachers</SelectItem>
                      <SelectItem value="Department Heads">Department Heads</SelectItem>
                      <SelectItem value="Coordinators">Coordinators</SelectItem>
                      <SelectItem value="Vice Principals">Vice Principals</SelectItem>
                      <SelectItem value="Principals">Principals</SelectItem>
                      <SelectItem value="All Educators">All Educators</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Textarea 
                    id="prerequisites" 
                    placeholder="Any prior knowledge or experience required..."
                    value={formData.prerequisites}
                    onChange={(e) => setFormData({...formData, prerequisites: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="materials">Training Materials</Label>
                  <Textarea 
                    id="materials" 
                    placeholder="What materials will be provided or required..."
                    value={formData.materials}
                    onChange={(e) => setFormData({...formData, materials: e.target.value})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="linkages" className="space-y-4 mt-4">
                <div className="bg-muted/50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">
                    Link this training to competencies and licenses so it can be recommended automatically for development plans
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Linked Competencies</Label>
                  <p className="text-sm text-muted-foreground">
                    Which competencies does this training help develop?
                  </p>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
                    {formData.linkedCompetencies.map((comp, idx) => (
                      <Badge key={idx} variant="outline" className="gap-1 bg-primary/5">
                        <Target className="h-3 w-3" />
                        {comp}
                        <button 
                          onClick={() => setFormData({
                            ...formData,
                            linkedCompetencies: formData.linkedCompetencies.filter((_, i) => i !== idx)
                          })}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(v) => {
                    if (!formData.linkedCompetencies.includes(v)) {
                      setFormData({...formData, linkedCompetencies: [...formData.linkedCompetencies, v]});
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Link to competency..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Classroom Management">Classroom Management</SelectItem>
                      <SelectItem value="Curriculum Development">Curriculum Development</SelectItem>
                      <SelectItem value="Assessment Design">Assessment Design</SelectItem>
                      <SelectItem value="Differentiated Instruction">Differentiated Instruction</SelectItem>
                      <SelectItem value="Technology Integration">Technology Integration</SelectItem>
                      <SelectItem value="Team Leadership">Team Leadership</SelectItem>
                      <SelectItem value="Parent Communication">Parent Communication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Linked Licenses</Label>
                  <p className="text-sm text-muted-foreground">
                    Which license requirements does this training fulfill?
                  </p>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
                    {formData.linkedLicenses.map((license, idx) => (
                      <Badge key={idx} variant="outline" className="gap-1 bg-amber-500/10">
                        <Award className="h-3 w-3" />
                        {license}
                        <button 
                          onClick={() => setFormData({
                            ...formData,
                            linkedLicenses: formData.linkedLicenses.filter((_, i) => i !== idx)
                          })}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(v) => {
                    if (!formData.linkedLicenses.includes(v)) {
                      setFormData({...formData, linkedLicenses: [...formData.linkedLicenses, v]});
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Link to license..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UAE Teaching License">UAE Teaching License CPD</SelectItem>
                      <SelectItem value="KHDA Certification">KHDA Certification CPD</SelectItem>
                      <SelectItem value="Principal License">Principal License CPD</SelectItem>
                      <SelectItem value="Special Education License">Special Education License CPD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="delivery" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="assessment">Assessment Method</Label>
                  <Textarea 
                    id="assessment" 
                    placeholder="How will participants be assessed?&#10;• Quiz&#10;• Practical project&#10;• Reflection paper"
                    className="min-h-[100px]"
                    value={formData.assessmentMethod}
                    onChange={(e) => setFormData({...formData, assessmentMethod: e.target.value})}
                  />
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Completion Certificate</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Issue certificate upon completion
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">CPD Record</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Automatically add to participant's CPD record
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button variant="outline">Save as Draft</Button>
              <Button>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Publish Training
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Training Programs</p>
                <p className="text-2xl font-bold">{demoTrainingPrograms.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total CPD Credits</p>
                <p className="text-2xl font-bold text-green-600">{totalCpdCredits}</p>
              </div>
              <Award className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enrollments</p>
                <p className="text-2xl font-bold text-blue-600">{totalEnrollments}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-amber-600">4.7</p>
              </div>
              <Star className="h-8 w-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search training programs..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {trainingCategories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.value}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={formatFilter} onValueChange={setFormatFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            {trainingFormats.map(fmt => (
              <SelectItem key={fmt.value} value={fmt.value}>{fmt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Training Programs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map(program => (
          <Card key={program.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <Badge className={`${getCategoryColor(program.category)} text-white`}>
                  {program.category}
                </Badge>
                {getFormatBadge(program.format)}
              </div>
              <CardTitle className="text-base line-clamp-2">{program.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span className="font-mono text-xs bg-muted px-1 rounded">{program.code}</span>
                <span>•</span>
                <span>{program.provider}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {program.description}
              </p>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-muted/50 rounded-lg">
                  <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium">{program.duration}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <Award className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">CPD</p>
                  <p className="text-sm font-medium">{program.cpdCredits} hrs</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Enrolled</p>
                  <p className="text-sm font-medium">{program.enrollments}</p>
                </div>
              </div>

              {program.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium">{program.rating}</span>
                  <span className="text-sm text-muted-foreground">rating</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {program.linkedCompetencies.slice(0, 3).map((comp, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">{comp}</Badge>
                ))}
                {program.linkedCompetencies.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{program.linkedCompetencies.length - 3}</Badge>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
