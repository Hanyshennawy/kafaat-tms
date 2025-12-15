import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2, Users, MapPin, Globe, Palette, Bell,
  Shield, Save, Plus, Trash2, Edit2, Check, X
} from "lucide-react";
import { toast } from "sonner";

interface Department {
  id: number;
  name: string;
  code: string;
  head: string;
  employeeCount: number;
  status: "active" | "inactive";
}

export default function OrganizationSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<number | null>(null);
  const [newDepartment, setNewDepartment] = useState({ name: "", code: "", head: "" });
  const [showAddDepartment, setShowAddDepartment] = useState(false);

  const [orgSettings, setOrgSettings] = useState({
    // General
    name: "Ministry of Education - UAE",
    legalName: "Ministry of Education",
    registrationNumber: "MOE-UAE-001",
    website: "https://www.moe.gov.ae",
    email: "info@moe.gov.ae",
    phone: "+971 2 123 4567",
    
    // Address
    country: "UAE",
    emirate: "Abu Dhabi",
    city: "Abu Dhabi",
    address: "Ministry of Education Building, Khalifa City",
    poBox: "123456",
    
    // Branding
    primaryColor: "#1e40af",
    secondaryColor: "#3b82f6",
    logoUrl: "",
    
    // Localization
    defaultLanguage: "en",
    timezone: "Asia/Dubai",
    dateFormat: "DD/MM/YYYY",
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    weeklyDigest: true,
    
    // Compliance
    gdprConsent: true,
    dataRetentionDays: 365,
    tdraCompliance: true,
  });

  const [departments, setDepartments] = useState<Department[]>([
    { id: 1, name: "Human Resources", code: "HR", head: "Sarah Al Maktoum", employeeCount: 45, status: "active" },
    { id: 2, name: "Curriculum Development", code: "CUR", head: "Ahmed Hassan", employeeCount: 32, status: "active" },
    { id: 3, name: "School Operations", code: "OPS", head: "Fatima Al Shamsi", employeeCount: 120, status: "active" },
    { id: 4, name: "Teacher Training", code: "TRN", head: "Mohammed Al Rashid", employeeCount: 28, status: "active" },
    { id: 5, name: "Quality Assurance", code: "QA", head: "Layla Ahmed", employeeCount: 15, status: "active" },
    { id: 6, name: "IT & Digital Learning", code: "IT", head: "Omar Khalid", employeeCount: 22, status: "active" },
  ]);

  const updateSettings = (field: string, value: any) => {
    setOrgSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Organization settings saved successfully");
  };

  const handleAddDepartment = () => {
    if (!newDepartment.name || !newDepartment.code) {
      toast.error("Please fill in department name and code");
      return;
    }
    const newId = Math.max(...departments.map(d => d.id)) + 1;
    setDepartments(prev => [...prev, {
      id: newId,
      name: newDepartment.name,
      code: newDepartment.code,
      head: newDepartment.head || "Not Assigned",
      employeeCount: 0,
      status: "active",
    }]);
    setNewDepartment({ name: "", code: "", head: "" });
    setShowAddDepartment(false);
    toast.success("Department added successfully");
  };

  const handleDeleteDepartment = (id: number) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    toast.success("Department deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8 text-indigo-600" />
            Organization Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization profile, departments, and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="departments" className="gap-2">
            <Users className="h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input
                  value={orgSettings.name}
                  onChange={(e) => updateSettings("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Legal Name</Label>
                <Input
                  value={orgSettings.legalName}
                  onChange={(e) => updateSettings("legalName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input
                  value={orgSettings.registrationNumber}
                  onChange={(e) => updateSettings("registrationNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={orgSettings.website}
                  onChange={(e) => updateSettings("website", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={orgSettings.email}
                  onChange={(e) => updateSettings("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={orgSettings.phone}
                  onChange={(e) => updateSettings("phone", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={orgSettings.country} onValueChange={(v) => updateSettings("country", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UAE">United Arab Emirates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Emirate</Label>
                <Select value={orgSettings.emirate} onValueChange={(v) => updateSettings("emirate", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                    <SelectItem value="Dubai">Dubai</SelectItem>
                    <SelectItem value="Sharjah">Sharjah</SelectItem>
                    <SelectItem value="Ajman">Ajman</SelectItem>
                    <SelectItem value="Umm Al Quwain">Umm Al Quwain</SelectItem>
                    <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                    <SelectItem value="Fujairah">Fujairah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={orgSettings.city}
                  onChange={(e) => updateSettings("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>PO Box</Label>
                <Input
                  value={orgSettings.poBox}
                  onChange={(e) => updateSettings("poBox", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Textarea
                  value={orgSettings.address}
                  onChange={(e) => updateSettings("address", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Localization
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Default Language</Label>
                <Select value={orgSettings.defaultLanguage} onValueChange={(v) => updateSettings("defaultLanguage", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={orgSettings.timezone} onValueChange={(v) => updateSettings("timezone", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select value={orgSettings.dateFormat} onValueChange={(v) => updateSettings("dateFormat", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Departments</CardTitle>
                  <CardDescription>Manage your organizational structure</CardDescription>
                </div>
                <Button onClick={() => setShowAddDepartment(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Department
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddDepartment && (
                <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-4">Add New Department</h4>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label>Department Name</Label>
                      <Input
                        placeholder="e.g., Finance"
                        value={newDepartment.name}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input
                        placeholder="e.g., FIN"
                        value={newDepartment.code}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, code: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department Head</Label>
                      <Input
                        placeholder="Head name"
                        value={newDepartment.head}
                        onChange={(e) => setNewDepartment(prev => ({ ...prev, head: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button onClick={handleAddDepartment}>
                        <Check className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddDepartment(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">{dept.code}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{dept.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Head: {dept.head} • {dept.employeeCount} employees
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={dept.status === "active" ? "default" : "secondary"}>
                        {dept.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDepartment(dept.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Customize your organization's visual identity</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={orgSettings.primaryColor}
                    onChange={(e) => updateSettings("primaryColor", e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={orgSettings.primaryColor}
                    onChange={(e) => updateSettings("primaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={orgSettings.secondaryColor}
                    onChange={(e) => updateSettings("secondaryColor", e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={orgSettings.secondaryColor}
                    onChange={(e) => updateSettings("secondaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>Upload your organization logo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your logo here, or click to browse
                </p>
                <Button variant="outline">Upload Logo</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how your organization receives notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={orgSettings.emailNotifications}
                  onCheckedChange={(checked) => updateSettings("emailNotifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={orgSettings.smsNotifications}
                  onCheckedChange={(checked) => updateSettings("smsNotifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary report</p>
                </div>
                <Switch
                  checked={orgSettings.weeklyDigest}
                  onCheckedChange={(checked) => updateSettings("weeklyDigest", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data & Compliance</CardTitle>
              <CardDescription>Manage data protection and regulatory compliance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>GDPR Compliance</Label>
                  <p className="text-sm text-muted-foreground">Enable GDPR-compliant data handling</p>
                </div>
                <Switch
                  checked={orgSettings.gdprConsent}
                  onCheckedChange={(checked) => updateSettings("gdprConsent", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>TDRA Compliance</Label>
                  <p className="text-sm text-muted-foreground">UAE Telecommunications Regulatory Authority compliance</p>
                </div>
                <Switch
                  checked={orgSettings.tdraCompliance}
                  onCheckedChange={(checked) => updateSettings("tdraCompliance", checked)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Data Retention Period (days)</Label>
                <Input
                  type="number"
                  value={orgSettings.dataRetentionDays}
                  onChange={(e) => updateSettings("dataRetentionDays", parseInt(e.target.value))}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  How long to retain user data before automatic deletion
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="font-medium">GDPR</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Compliant</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="font-medium">TDRA</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Compliant</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Data Protection</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
