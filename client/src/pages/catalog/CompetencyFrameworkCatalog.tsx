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
import { Slider } from "@/components/ui/slider";
import { 
  Target, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  ChevronRight,
  Layers,
  CheckCircle2,
  Clock,
  GraduationCap,
  Award,
  BookOpen,
  Users,
  Star,
  BarChart3,
  Sparkles
} from "lucide-react";

// Demo competency domains
const demoDomains = [
  {
    id: 1,
    name: "Teaching & Instruction",
    description: "Core competencies related to classroom teaching and student instruction",
    color: "bg-blue-500",
    competencies: [
      { id: 1, name: "Curriculum Development", level: "Advanced", indicators: 5 },
      { id: 2, name: "Lesson Planning", level: "Intermediate", indicators: 4 },
      { id: 3, name: "Classroom Management", level: "Advanced", indicators: 6 },
      { id: 4, name: "Assessment Design", level: "Intermediate", indicators: 4 },
      { id: 5, name: "Differentiated Instruction", level: "Advanced", indicators: 5 },
    ]
  },
  {
    id: 2,
    name: "Leadership & Management",
    description: "Competencies for educational leaders and administrators",
    color: "bg-purple-500",
    competencies: [
      { id: 6, name: "Strategic Planning", level: "Expert", indicators: 6 },
      { id: 7, name: "Team Leadership", level: "Advanced", indicators: 5 },
      { id: 8, name: "Change Management", level: "Advanced", indicators: 4 },
      { id: 9, name: "Staff Development", level: "Intermediate", indicators: 4 },
      { id: 10, name: "Budget Management", level: "Intermediate", indicators: 3 },
    ]
  },
  {
    id: 3,
    name: "Student Support",
    description: "Competencies focused on student wellbeing and development",
    color: "bg-green-500",
    competencies: [
      { id: 11, name: "Student Counseling", level: "Advanced", indicators: 5 },
      { id: 12, name: "Parent Communication", level: "Intermediate", indicators: 4 },
      { id: 13, name: "Special Needs Support", level: "Advanced", indicators: 6 },
      { id: 14, name: "Behavior Management", level: "Intermediate", indicators: 4 },
    ]
  },
  {
    id: 4,
    name: "Professional Development",
    description: "Competencies related to continuous learning and growth",
    color: "bg-amber-500",
    competencies: [
      { id: 15, name: "Self-Reflection", level: "Intermediate", indicators: 3 },
      { id: 16, name: "Mentoring", level: "Advanced", indicators: 4 },
      { id: 17, name: "Research Skills", level: "Intermediate", indicators: 3 },
      { id: 18, name: "Technology Integration", level: "Advanced", indicators: 5 },
    ]
  },
  {
    id: 5,
    name: "Communication & Collaboration",
    description: "Interpersonal and communication competencies",
    color: "bg-pink-500",
    competencies: [
      { id: 19, name: "Verbal Communication", level: "Advanced", indicators: 4 },
      { id: 20, name: "Written Communication", level: "Intermediate", indicators: 3 },
      { id: 21, name: "Team Collaboration", level: "Advanced", indicators: 4 },
      { id: 22, name: "Stakeholder Engagement", level: "Intermediate", indicators: 4 },
    ]
  }
];

// Proficiency levels
const proficiencyLevels = [
  { value: "foundational", label: "Foundational", description: "Basic understanding and awareness", color: "bg-slate-500" },
  { value: "developing", label: "Developing", description: "Growing capability with guidance", color: "bg-blue-500" },
  { value: "intermediate", label: "Intermediate", description: "Competent and independent", color: "bg-green-500" },
  { value: "advanced", label: "Advanced", description: "Highly skilled, can mentor others", color: "bg-purple-500" },
  { value: "expert", label: "Expert", description: "Mastery level, thought leader", color: "bg-amber-500" },
];

export default function CompetencyFrameworkCatalog() {
  const [isCreateDomainOpen, setIsCreateDomainOpen] = useState(false);
  const [isCreateCompetencyOpen, setIsCreateCompetencyOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("details");

  // Domain form state
  const [domainForm, setDomainForm] = useState({
    name: "",
    description: "",
    color: "bg-blue-500"
  });

  // Competency form state
  const [competencyForm, setCompetencyForm] = useState({
    name: "",
    description: "",
    domain: "",
    targetLevel: "intermediate",
    indicators: [] as { level: string; description: string }[],
    assessmentCriteria: "",
    developmentActivities: ""
  });

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      "Foundational": "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
      "Developing": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      "Intermediate": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      "Advanced": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      "Expert": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
    };
    return <Badge className={colors[level] || ""}>{level}</Badge>;
  };

  const filteredDomains = demoDomains.filter(domain =>
    domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.competencies.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalCompetencies = demoDomains.reduce((acc, d) => acc + d.competencies.length, 0);
  const totalIndicators = demoDomains.reduce((acc, d) => acc + d.competencies.reduce((a, c) => a + c.indicators, 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-7 w-7 text-primary" />
            Competency Framework
          </h1>
          <p className="text-muted-foreground mt-1">
            Define and manage educator competencies, proficiency levels, and behavioral indicators
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDomainOpen} onOpenChange={setIsCreateDomainOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Layers className="h-4 w-4 mr-2" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Competency Domain</DialogTitle>
                <DialogDescription>
                  Domains are categories that group related competencies together
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="domainName">Domain Name *</Label>
                  <Input 
                    id="domainName" 
                    placeholder="e.g., Teaching & Instruction"
                    value={domainForm.name}
                    onChange={(e) => setDomainForm({...domainForm, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domainDesc">Description</Label>
                  <Textarea 
                    id="domainDesc" 
                    placeholder="Describe what competencies this domain covers..."
                    value={domainForm.description}
                    onChange={(e) => setDomainForm({...domainForm, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Domain Color</Label>
                  <div className="flex gap-2">
                    {["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-amber-500", "bg-pink-500", "bg-red-500", "bg-teal-500"].map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${color} ${domainForm.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                        onClick={() => setDomainForm({...domainForm, color})}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDomainOpen(false)}>Cancel</Button>
                <Button>Create Domain</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateCompetencyOpen} onOpenChange={setIsCreateCompetencyOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Competency
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Competency</DialogTitle>
                <DialogDescription>
                  Define a competency with proficiency levels and behavioral indicators
                </DialogDescription>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Basic Details</TabsTrigger>
                  <TabsTrigger value="indicators">Proficiency Indicators</TabsTrigger>
                  <TabsTrigger value="development">Development</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="compName">Competency Name *</Label>
                      <Input 
                        id="compName" 
                        placeholder="e.g., Curriculum Development"
                        value={competencyForm.name}
                        onChange={(e) => setCompetencyForm({...competencyForm, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compDomain">Domain *</Label>
                      <Select value={competencyForm.domain} onValueChange={(v) => setCompetencyForm({...competencyForm, domain: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {demoDomains.map(domain => (
                            <SelectItem key={domain.id} value={domain.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${domain.color}`} />
                                {domain.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compDesc">Description</Label>
                    <Textarea 
                      id="compDesc" 
                      placeholder="Describe what this competency encompasses..."
                      className="min-h-[100px]"
                      value={competencyForm.description}
                      onChange={(e) => setCompetencyForm({...competencyForm, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target Proficiency Level</Label>
                    <div className="space-y-3">
                      {proficiencyLevels.map((level) => (
                        <label
                          key={level.value}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            competencyForm.targetLevel === level.value ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="targetLevel"
                            value={level.value}
                            checked={competencyForm.targetLevel === level.value}
                            onChange={(e) => setCompetencyForm({...competencyForm, targetLevel: e.target.value})}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full ${level.color}`} />
                          <div className="flex-1">
                            <p className="font-medium">{level.label}</p>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
                          </div>
                          {competencyForm.targetLevel === level.value && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="indicators" className="space-y-4 mt-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Behavioral Indicators</h4>
                        <p className="text-sm text-muted-foreground">
                          Define observable behaviors that demonstrate each proficiency level
                        </p>
                      </div>
                    </div>
                  </div>

                  {proficiencyLevels.map((level) => (
                    <Card key={level.value}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${level.color}`} />
                          {level.label} Level Indicators
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea 
                          placeholder={`Describe observable behaviors for ${level.label} level...`}
                          className="min-h-[80px]"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="development" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="assessment">Assessment Criteria</Label>
                    <Textarea 
                      id="assessment" 
                      placeholder="How will this competency be assessed?&#10;• Observation&#10;• Portfolio evidence&#10;• Student feedback..."
                      className="min-h-[100px]"
                      value={competencyForm.assessmentCriteria}
                      onChange={(e) => setCompetencyForm({...competencyForm, assessmentCriteria: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="development">Development Activities</Label>
                    <Textarea 
                      id="development" 
                      placeholder="Suggested activities to develop this competency...&#10;• Training courses&#10;• Mentoring&#10;• Self-study..."
                      className="min-h-[100px]"
                      value={competencyForm.developmentActivities}
                      onChange={(e) => setCompetencyForm({...competencyForm, developmentActivities: e.target.value})}
                    />
                  </div>

                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        Related Training (from Training Catalog)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Link relevant training programs from your catalog
                      </p>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select training programs..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classroom-mgmt">Classroom Management Masterclass</SelectItem>
                          <SelectItem value="assessment">Assessment Design Workshop</SelectItem>
                          <SelectItem value="diff-instruction">Differentiated Instruction Training</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsCreateCompetencyOpen(false)}>Cancel</Button>
                <Button>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Competency
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
                <p className="text-sm text-muted-foreground">Domains</p>
                <p className="text-2xl font-bold">{demoDomains.length}</p>
              </div>
              <Layers className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Competencies</p>
                <p className="text-2xl font-bold">{totalCompetencies}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Indicators</p>
                <p className="text-2xl font-bold">{totalIndicators}</p>
              </div>
              <Star className="h-8 w-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Proficiency Levels</p>
                <p className="text-2xl font-bold">{proficiencyLevels.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search domains or competencies..." 
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Competency Domains */}
      <div className="grid gap-6">
        {filteredDomains.map(domain => (
          <Card key={domain.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${domain.color} rounded-lg flex items-center justify-center text-white`}>
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>{domain.name}</CardTitle>
                    <CardDescription>{domain.description}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {domain.competencies.map(comp => (
                  <div 
                    key={comp.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${domain.color}`} />
                      <span className="font-medium">{comp.name}</span>
                      {getLevelBadge(comp.level)}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {comp.indicators} indicators
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-3" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Competency to {domain.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
