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
  Award, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle2,
  Clock,
  GraduationCap,
  Shield,
  Calendar,
  FileText,
  AlertTriangle,
  RefreshCcw,
  Building2,
  Globe,
  BookOpen
} from "lucide-react";

// Demo license types
const demoLicenseTypes = [
  {
    id: 1,
    name: "UAE Teaching License",
    code: "UTL",
    authority: "Ministry of Education",
    category: "teaching",
    validityPeriod: "3 years",
    renewalRequired: true,
    cpdRequired: 40,
    status: "active",
    applicableRoles: ["Teacher", "Senior Teacher", "Lead Teacher"],
    requirements: [
      "Bachelor's degree in Education or subject area",
      "2+ years teaching experience",
      "Background check clearance",
      "Medical fitness certificate"
    ],
    documents: ["Degree certificate", "Experience letters", "Passport copy", "Emirates ID"]
  },
  {
    id: 2,
    name: "KHDA Teacher Certification",
    code: "KHDA-TC",
    authority: "KHDA",
    category: "teaching",
    validityPeriod: "2 years",
    renewalRequired: true,
    cpdRequired: 30,
    status: "active",
    applicableRoles: ["Teacher", "Senior Teacher"],
    requirements: [
      "Valid teaching qualification",
      "School sponsorship",
      "English proficiency (if applicable)"
    ],
    documents: ["Qualification certificates", "School letter", "Passport copy"]
  },
  {
    id: 3,
    name: "Principal License",
    code: "PL",
    authority: "Ministry of Education",
    category: "leadership",
    validityPeriod: "5 years",
    renewalRequired: true,
    cpdRequired: 60,
    status: "active",
    applicableRoles: ["Principal", "Vice Principal"],
    requirements: [
      "Master's degree in Educational Leadership",
      "8+ years in education",
      "3+ years in leadership role",
      "Leadership assessment completion"
    ],
    documents: ["Advanced degree", "Leadership experience proof", "Assessment results"]
  },
  {
    id: 4,
    name: "Special Education License",
    code: "SEL",
    authority: "Ministry of Education",
    category: "specialist",
    validityPeriod: "3 years",
    renewalRequired: true,
    cpdRequired: 50,
    status: "active",
    applicableRoles: ["Special Education Teacher", "Learning Support Specialist"],
    requirements: [
      "Degree in Special Education",
      "Specialized training certification",
      "Experience with special needs students"
    ],
    documents: ["Specialized degree", "Training certificates", "Experience letters"]
  },
  {
    id: 5,
    name: "Department Head Certification",
    code: "DHC",
    authority: "Ministry of Education",
    category: "leadership",
    validityPeriod: "3 years",
    renewalRequired: true,
    cpdRequired: 45,
    status: "active",
    applicableRoles: ["Department Head", "Subject Coordinator"],
    requirements: [
      "Teaching license (active)",
      "5+ years teaching experience",
      "Leadership training completion"
    ],
    documents: ["Teaching license copy", "Experience proof", "Training certificate"]
  },
  {
    id: 6,
    name: "School Counselor License",
    code: "SCL",
    authority: "Ministry of Education",
    category: "specialist",
    validityPeriod: "3 years",
    renewalRequired: true,
    cpdRequired: 40,
    status: "active",
    applicableRoles: ["School Counselor", "Student Advisor"],
    requirements: [
      "Master's in Counseling or Psychology",
      "Counseling certification",
      "Supervised practice hours"
    ],
    documents: ["Counseling degree", "Certification", "Practice log"]
  }
];

// License categories
const licenseCategories = [
  { value: "teaching", label: "Teaching", icon: GraduationCap, color: "bg-blue-500" },
  { value: "leadership", label: "Leadership", icon: Shield, color: "bg-purple-500" },
  { value: "specialist", label: "Specialist", icon: Award, color: "bg-green-500" },
  { value: "administrative", label: "Administrative", icon: Building2, color: "bg-amber-500" }
];

export default function LicenseTypesCatalog() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("details");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    authority: "",
    category: "",
    validityPeriod: "3",
    validityUnit: "years",
    renewalRequired: true,
    cpdRequired: 40,
    requirements: [] as string[],
    documents: [] as string[],
    applicableRoles: [] as string[],
    description: ""
  });

  const [newRequirement, setNewRequirement] = useState("");
  const [newDocument, setNewDocument] = useState("");

  const getCategoryBadge = (category: string) => {
    const cat = licenseCategories.find(c => c.value === category);
    if (!cat) return <Badge>{category}</Badge>;
    return (
      <Badge className={`${cat.color} text-white`}>
        <cat.icon className="h-3 w-3 mr-1" />
        {cat.label}
      </Badge>
    );
  };

  const filteredLicenses = demoLicenseTypes.filter(license => {
    const matchesSearch = license.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || license.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({...formData, requirements: [...formData.requirements, newRequirement.trim()]});
      setNewRequirement("");
    }
  };

  const addDocument = () => {
    if (newDocument.trim()) {
      setFormData({...formData, documents: [...formData.documents, newDocument.trim()]});
      setNewDocument("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-7 w-7 text-primary" />
            License Types Catalog
          </h1>
          <p className="text-muted-foreground mt-1">
            Define educator license types, requirements, and renewal criteria
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add License Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create License Type</DialogTitle>
              <DialogDescription>
                Define a new license type with its requirements and criteria
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Basic Details</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="documents">Documents & Roles</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">License Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g., UAE Teaching License"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">License Code *</Label>
                    <Input 
                      id="code" 
                      placeholder="e.g., UTL"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authority">Issuing Authority *</Label>
                    <Select value={formData.authority} onValueChange={(v) => setFormData({...formData, authority: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select authority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ministry of Education">Ministry of Education (UAE)</SelectItem>
                        <SelectItem value="KHDA">KHDA (Dubai)</SelectItem>
                        <SelectItem value="ADEK">ADEK (Abu Dhabi)</SelectItem>
                        <SelectItem value="SPEA">SPEA (Sharjah)</SelectItem>
                        <SelectItem value="International">International Body</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {licenseCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe this license type and its purpose..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Validity Period</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number"
                        min="1"
                        value={formData.validityPeriod}
                        onChange={(e) => setFormData({...formData, validityPeriod: e.target.value})}
                        className="w-20"
                      />
                      <Select value={formData.validityUnit} onValueChange={(v) => setFormData({...formData, validityUnit: v})}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="years">Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>CPD Hours Required (per year)</Label>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.cpdRequired}
                      onChange={(e) => setFormData({...formData, cpdRequired: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="renewal">Renewal Required</Label>
                    <p className="text-sm text-muted-foreground">
                      License holders must renew before expiry
                    </p>
                  </div>
                  <Switch 
                    id="renewal"
                    checked={formData.renewalRequired}
                    onCheckedChange={(checked) => setFormData({...formData, renewalRequired: checked})}
                  />
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Eligibility Requirements</Label>
                  <p className="text-sm text-muted-foreground">
                    Define what educators need to qualify for this license
                  </p>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a requirement..."
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                    />
                    <Button onClick={addRequirement}>Add</Button>
                  </div>
                  <div className="space-y-2 mt-3">
                    {formData.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="flex-1">{req}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setFormData({
                            ...formData,
                            requirements: formData.requirements.filter((_, i) => i !== idx)
                          })}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {formData.requirements.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No requirements added yet
                      </p>
                    )}
                  </div>
                </div>

                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Common Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {[
                      "Bachelor's degree in relevant field",
                      "Valid background check clearance",
                      "Medical fitness certificate",
                      "English proficiency (IELTS/TOEFL)",
                      "Teaching experience verification"
                    ].map(req => (
                      <Button
                        key={req}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm h-8"
                        onClick={() => {
                          if (!formData.requirements.includes(req)) {
                            setFormData({...formData, requirements: [...formData.requirements, req]});
                          }
                        }}
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        {req}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Required Documents</Label>
                  <p className="text-sm text-muted-foreground">
                    Documents that applicants must submit
                  </p>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a document..."
                      value={newDocument}
                      onChange={(e) => setNewDocument(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addDocument()}
                    />
                    <Button onClick={addDocument}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.documents.map((doc, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 py-2 px-3">
                        <FileText className="h-3 w-3" />
                        {doc}
                        <button 
                          onClick={() => setFormData({
                            ...formData,
                            documents: formData.documents.filter((_, i) => i !== idx)
                          })}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      Common Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {[
                      "Passport copy",
                      "Emirates ID",
                      "Degree certificate",
                      "Experience letters",
                      "Police clearance",
                      "Medical certificate",
                      "Transcripts",
                      "Photos"
                    ].map(doc => (
                      <Button
                        key={doc}
                        variant="outline"
                        size="sm"
                        className="h-7"
                        onClick={() => {
                          if (!formData.documents.includes(doc)) {
                            setFormData({...formData, documents: [...formData.documents, doc]});
                          }
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {doc}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>Applicable Roles</Label>
                  <p className="text-sm text-muted-foreground">
                    Job roles that require this license
                  </p>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
                    {formData.applicableRoles.map((role, idx) => (
                      <Badge key={idx} variant="outline" className="gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {role}
                        <button 
                          onClick={() => setFormData({
                            ...formData,
                            applicableRoles: formData.applicableRoles.filter((_, i) => i !== idx)
                          })}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(v) => {
                    if (!formData.applicableRoles.includes(v)) {
                      setFormData({...formData, applicableRoles: [...formData.applicableRoles, v]});
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add applicable role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Senior Teacher">Senior Teacher</SelectItem>
                      <SelectItem value="Lead Teacher">Lead Teacher</SelectItem>
                      <SelectItem value="Department Head">Department Head</SelectItem>
                      <SelectItem value="Vice Principal">Vice Principal</SelectItem>
                      <SelectItem value="Principal">Principal</SelectItem>
                      <SelectItem value="Special Education Teacher">Special Education Teacher</SelectItem>
                      <SelectItem value="School Counselor">School Counselor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create License Type
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
                <p className="text-sm text-muted-foreground">Total License Types</p>
                <p className="text-2xl font-bold">{demoLicenseTypes.length}</p>
              </div>
              <Award className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Teaching</p>
                <p className="text-2xl font-bold text-blue-600">{demoLicenseTypes.filter(l => l.category === 'teaching').length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leadership</p>
                <p className="text-2xl font-bold text-purple-600">{demoLicenseTypes.filter(l => l.category === 'leadership').length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Specialist</p>
                <p className="text-2xl font-bold text-green-600">{demoLicenseTypes.filter(l => l.category === 'specialist').length}</p>
              </div>
              <Award className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search license types..." 
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
            {licenseCategories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* License Types Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredLicenses.map(license => (
          <Card key={license.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${
                    license.category === 'teaching' ? 'bg-blue-500' :
                    license.category === 'leadership' ? 'bg-purple-500' :
                    license.category === 'specialist' ? 'bg-green-500' : 'bg-amber-500'
                  }`}>
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{license.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-muted px-1 rounded">{license.code}</span>
                      <span>•</span>
                      <span>{license.authority}</span>
                    </CardDescription>
                  </div>
                </div>
                {getCategoryBadge(license.category)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-muted/50 rounded-lg">
                  <Calendar className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Validity</p>
                  <p className="text-sm font-medium">{license.validityPeriod}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <BookOpen className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">CPD/Year</p>
                  <p className="text-sm font-medium">{license.cpdRequired} hrs</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg">
                  <RefreshCcw className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Renewal</p>
                  <p className="text-sm font-medium">{license.renewalRequired ? 'Required' : 'No'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Applicable Roles:</p>
                <div className="flex flex-wrap gap-1">
                  {license.applicableRoles.map((role, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{role}</Badge>
                  ))}
                </div>
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
