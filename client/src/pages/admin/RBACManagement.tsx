import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Users, 
  Key, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Copy,
  Check,
  X,
  ChevronRight,
  ShieldCheck,
  UserCog,
  Lock,
  Unlock,
  Eye,
  Settings,
  AlertTriangle,
  Crown,
  Briefcase,
  GraduationCap,
  Building2,
  FileText,
  BarChart3,
  UserPlus,
  Save,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

// Permission Categories with icons
const PERMISSION_CATEGORIES = {
  "User Management": {
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    permissions: [
      { id: "users:read", label: "View Users", description: "View user profiles and directory" },
      { id: "users:create", label: "Create Users", description: "Add new users to the system" },
      { id: "users:update", label: "Update Users", description: "Modify user information" },
      { id: "users:delete", label: "Delete Users", description: "Remove users from the system" },
    ]
  },
  "Career Progression": {
    icon: ChevronRight,
    color: "text-green-600",
    bg: "bg-green-50",
    permissions: [
      { id: "career:read", label: "View Career Paths", description: "Access career progression data" },
      { id: "career:manage", label: "Manage Career Paths", description: "Create and modify career paths" },
    ]
  },
  "Succession Planning": {
    icon: Crown,
    color: "text-amber-600",
    bg: "bg-amber-50",
    permissions: [
      { id: "succession:read", label: "View Succession Plans", description: "Access succession planning data" },
      { id: "succession:manage", label: "Manage Succession", description: "Create and modify succession plans" },
    ]
  },
  "Workforce Planning": {
    icon: Building2,
    color: "text-purple-600",
    bg: "bg-purple-50",
    permissions: [
      { id: "workforce:read", label: "View Workforce Data", description: "Access workforce planning information" },
      { id: "workforce:manage", label: "Manage Workforce", description: "Create scenarios and allocations" },
    ]
  },
  "Employee Engagement": {
    icon: Users,
    color: "text-pink-600",
    bg: "bg-pink-50",
    permissions: [
      { id: "engagement:read", label: "View Engagement Data", description: "Access engagement metrics" },
      { id: "engagement:manage", label: "Manage Engagement", description: "Configure engagement features" },
      { id: "surveys:create", label: "Create Surveys", description: "Design and publish surveys" },
      { id: "surveys:respond", label: "Respond to Surveys", description: "Submit survey responses" },
    ]
  },
  "Recruitment": {
    icon: UserPlus,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    permissions: [
      { id: "recruitment:read", label: "View Recruitment", description: "Access job postings and pipeline" },
      { id: "recruitment:manage", label: "Manage Recruitment", description: "Post jobs and manage hiring" },
      { id: "candidates:view", label: "View Candidates", description: "Access candidate profiles" },
      { id: "candidates:manage", label: "Manage Candidates", description: "Update candidate status" },
    ]
  },
  "Performance Management": {
    icon: BarChart3,
    color: "text-orange-600",
    bg: "bg-orange-50",
    permissions: [
      { id: "performance:read", label: "View Performance", description: "Access performance data" },
      { id: "performance:manage", label: "Manage Performance", description: "Configure performance cycles" },
      { id: "performance:self_appraisal", label: "Self Appraisal", description: "Submit self-assessments" },
      { id: "performance:manager_review", label: "Manager Review", description: "Review team performance" },
      { id: "performance:360_feedback", label: "360° Feedback", description: "Participate in peer reviews" },
    ]
  },
  "Teachers Licensing": {
    icon: GraduationCap,
    color: "text-teal-600",
    bg: "bg-teal-50",
    permissions: [
      { id: "licensing:read", label: "View Licenses", description: "Access licensing information" },
      { id: "licensing:manage", label: "Manage Licenses", description: "Approve and manage licenses" },
      { id: "licensing:apply", label: "Apply for License", description: "Submit license applications" },
      { id: "licensing:verify", label: "Verify Licenses", description: "Verify license authenticity" },
    ]
  },
  "Competency Assessments": {
    icon: FileText,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    permissions: [
      { id: "competency:read", label: "View Competencies", description: "Access competency data" },
      { id: "competency:manage", label: "Manage Competencies", description: "Create and modify frameworks" },
      { id: "competency:self_assess", label: "Self Assessment", description: "Submit self-assessments" },
    ]
  },
  "Staff Placement": {
    icon: Building2,
    color: "text-rose-600",
    bg: "bg-rose-50",
    permissions: [
      { id: "placement:read", label: "View Placements", description: "Access placement data" },
      { id: "placement:manage", label: "Manage Placements", description: "Approve transfers and placements" },
      { id: "placement:request", label: "Request Placement", description: "Submit placement requests" },
    ]
  },
  "Psychometric Assessments": {
    icon: Briefcase,
    color: "text-violet-600",
    bg: "bg-violet-50",
    permissions: [
      { id: "psychometric:read", label: "View Assessments", description: "Access assessment results" },
      { id: "psychometric:manage", label: "Manage Assessments", description: "Configure assessments" },
      { id: "psychometric:take", label: "Take Assessments", description: "Complete assessments" },
    ]
  },
  "Reports & Analytics": {
    icon: BarChart3,
    color: "text-slate-600",
    bg: "bg-slate-50",
    permissions: [
      { id: "reports:view", label: "View Reports", description: "Access standard reports" },
      { id: "reports:generate", label: "Generate Reports", description: "Create custom reports" },
      { id: "analytics:view", label: "View Analytics", description: "Access analytics dashboards" },
    ]
  },
  "System Administration": {
    icon: Settings,
    color: "text-red-600",
    bg: "bg-red-50",
    permissions: [
      { id: "system:manage", label: "System Settings", description: "Configure system settings" },
      { id: "audit:view", label: "View Audit Logs", description: "Access audit trail" },
    ]
  },
};

// Get all permissions as a flat array
const ALL_PERMISSIONS = Object.values(PERMISSION_CATEGORIES).flatMap(cat => cat.permissions);

// System Roles with their default permissions
const SYSTEM_ROLES = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full system access with all permissions",
    isSystem: true,
    color: "bg-red-100 text-red-800",
    icon: Crown,
    userCount: 2,
    permissions: ALL_PERMISSIONS.map(p => p.id),
  },
  {
    id: "hr_manager",
    name: "HR Manager",
    description: "Human resources operations and staff management",
    isSystem: true,
    color: "bg-blue-100 text-blue-800",
    icon: Users,
    userCount: 5,
    permissions: [
      "users:read", "users:create", "users:update",
      "career:read", "career:manage",
      "succession:read", "succession:manage",
      "workforce:read", "workforce:manage",
      "engagement:read", "engagement:manage", "surveys:create",
      "recruitment:read", "recruitment:manage", "candidates:view", "candidates:manage",
      "performance:read", "performance:manage",
      "competency:read", "competency:manage",
      "placement:read", "placement:manage",
      "psychometric:read", "psychometric:manage",
      "reports:view", "reports:generate", "analytics:view",
    ],
  },
  {
    id: "department_manager",
    name: "Department Manager",
    description: "Department oversight and team management",
    isSystem: true,
    color: "bg-purple-100 text-purple-800",
    icon: Briefcase,
    userCount: 12,
    permissions: [
      "users:read",
      "career:read",
      "succession:read",
      "workforce:read",
      "engagement:read", "surveys:create", "surveys:respond",
      "recruitment:read", "candidates:view",
      "performance:read", "performance:manager_review", "performance:360_feedback",
      "competency:read",
      "placement:read",
      "psychometric:read",
      "reports:view", "analytics:view",
    ],
  },
  {
    id: "employee",
    name: "Employee",
    description: "Standard employee self-service access",
    isSystem: true,
    color: "bg-green-100 text-green-800",
    icon: Users,
    userCount: 156,
    permissions: [
      "career:read",
      "surveys:respond",
      "performance:self_appraisal", "performance:360_feedback",
      "licensing:apply",
      "competency:self_assess",
      "placement:request",
      "psychometric:take",
    ],
  },
  {
    id: "licensing_officer",
    name: "Licensing Officer",
    description: "Teacher licensing and certification management",
    isSystem: true,
    color: "bg-teal-100 text-teal-800",
    icon: GraduationCap,
    userCount: 3,
    permissions: [
      "users:read",
      "licensing:read", "licensing:manage", "licensing:verify",
      "reports:view",
    ],
  },
  {
    id: "recruiter",
    name: "Recruiter",
    description: "Recruitment and candidate management",
    isSystem: true,
    color: "bg-cyan-100 text-cyan-800",
    icon: UserPlus,
    userCount: 4,
    permissions: [
      "users:read",
      "recruitment:read", "recruitment:manage", "candidates:view", "candidates:manage",
      "reports:view",
    ],
  },
];

// Demo custom roles
const CUSTOM_ROLES_INITIAL = [
  {
    id: "school_principal",
    name: "School Principal",
    description: "School-level administrative access",
    isSystem: false,
    color: "bg-amber-100 text-amber-800",
    icon: Building2,
    userCount: 8,
    permissions: [
      "users:read",
      "career:read", "career:manage",
      "succession:read",
      "engagement:read", "surveys:create", "surveys:respond",
      "performance:read", "performance:manager_review",
      "placement:read", "placement:request",
      "reports:view", "analytics:view",
    ],
  },
  {
    id: "assessment_coordinator",
    name: "Assessment Coordinator",
    description: "Manages competency and psychometric assessments",
    isSystem: false,
    color: "bg-violet-100 text-violet-800",
    icon: FileText,
    userCount: 3,
    permissions: [
      "users:read",
      "competency:read", "competency:manage",
      "psychometric:read", "psychometric:manage",
      "reports:view",
    ],
  },
];

// Demo users for role assignment
const DEMO_USERS = [
  { id: 1, name: "Ahmad Al-Rashid", email: "ahmad.rashid@adek.ae", department: "Administration", currentRole: "super_admin", avatar: "AR" },
  { id: 2, name: "Fatima Hassan", email: "fatima.h@adek.ae", department: "HR Department", currentRole: "hr_manager", avatar: "FH" },
  { id: 3, name: "Mohammed Saeed", email: "m.saeed@adek.ae", department: "Academic Affairs", currentRole: "department_manager", avatar: "MS" },
  { id: 4, name: "Sara Abdullah", email: "sara.a@adek.ae", department: "Licensing Office", currentRole: "licensing_officer", avatar: "SA" },
  { id: 5, name: "Khalid Omar", email: "khalid.o@adek.ae", department: "Recruitment", currentRole: "recruiter", avatar: "KO" },
  { id: 6, name: "Noura Ahmed", email: "noura.a@adek.ae", department: "Science", currentRole: "employee", avatar: "NA" },
  { id: 7, name: "Hassan Ibrahim", email: "hassan.i@adek.ae", department: "Mathematics", currentRole: "employee", avatar: "HI" },
  { id: 8, name: "Layla Mohammed", email: "layla.m@adek.ae", department: "English", currentRole: "employee", avatar: "LM" },
  { id: 9, name: "Omar Khalid", email: "omar.k@adek.ae", department: "Al Noor School", currentRole: "school_principal", avatar: "OK" },
  { id: 10, name: "Aisha Yusuf", email: "aisha.y@adek.ae", department: "Assessment Center", currentRole: "assessment_coordinator", avatar: "AY" },
];

export default function RBACManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customRoles, setCustomRoles] = useState(CUSTOM_ROLES_INITIAL);
  const [users, setUsers] = useState(DEMO_USERS);
  
  // Dialog states
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [isViewPermissionsOpen, setIsViewPermissionsOpen] = useState(false);
  
  // Form states
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });
  const [editingRole, setEditingRole] = useState<typeof CUSTOM_ROLES_INITIAL[0] | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  const allRoles = [...SYSTEM_ROLES, ...customRoles];
  
  const filteredRoles = allRoles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    
    const roleId = newRole.name.toLowerCase().replace(/\s+/g, "_");
    const newCustomRole = {
      id: roleId,
      name: newRole.name,
      description: newRole.description,
      isSystem: false,
      color: "bg-gray-100 text-gray-800",
      icon: Shield,
      userCount: 0,
      permissions: newRole.permissions,
    };
    
    setCustomRoles([...customRoles, newCustomRole]);
    setNewRole({ name: "", description: "", permissions: [] });
    setIsCreateRoleOpen(false);
    
    toast.success(`Custom role "${newRole.name}" has been created successfully.`);
  };
  
  const handleUpdateRole = () => {
    if (!editingRole) return;
    
    setCustomRoles(customRoles.map(role =>
      role.id === editingRole.id ? editingRole : role
    ));
    setIsEditRoleOpen(false);
    setEditingRole(null);
    
    toast.success("Role permissions have been updated successfully.");
  };
  
  const handleDeleteRole = (roleId: string) => {
    setCustomRoles(customRoles.filter(role => role.id !== roleId));
    toast.success("Custom role has been removed.");
  };
  
  const handleAssignRole = (userId: number, newRoleId: string) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, currentRole: newRoleId } : user
    ));
    setIsAssignRoleOpen(false);
    
    toast.success("User role has been updated successfully.");
  };
  
  const togglePermission = (permissionId: string, isEdit: boolean = false) => {
    if (isEdit && editingRole) {
      const newPermissions = editingRole.permissions.includes(permissionId)
        ? editingRole.permissions.filter(p => p !== permissionId)
        : [...editingRole.permissions, permissionId];
      setEditingRole({ ...editingRole, permissions: newPermissions });
    } else {
      const newPermissions = newRole.permissions.includes(permissionId)
        ? newRole.permissions.filter(p => p !== permissionId)
        : [...newRole.permissions, permissionId];
      setNewRole({ ...newRole, permissions: newPermissions });
    }
  };
  
  const selectAllInCategory = (categoryPermissions: string[], isEdit: boolean = false) => {
    if (isEdit && editingRole) {
      const allSelected = categoryPermissions.every(p => editingRole.permissions.includes(p));
      const newPermissions = allSelected
        ? editingRole.permissions.filter(p => !categoryPermissions.includes(p))
        : Array.from(new Set([...editingRole.permissions, ...categoryPermissions]));
      setEditingRole({ ...editingRole, permissions: newPermissions });
    } else {
      const allSelected = categoryPermissions.every(p => newRole.permissions.includes(p));
      const newPermissions = allSelected
        ? newRole.permissions.filter(p => !categoryPermissions.includes(p))
        : Array.from(new Set([...newRole.permissions, ...categoryPermissions]));
      setNewRole({ ...newRole, permissions: newPermissions });
    }
  };
  
  const getRoleById = (roleId: string) => allRoles.find(r => r.id === roleId);
  
  const getPermissionCount = (roleId: string) => {
    const role = getRoleById(roleId);
    return role?.permissions.length || 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles, permissions, and access control for your organization
          </p>
        </div>
        <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Create New Custom Role
              </DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions tailored to your organization's needs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role Name *</Label>
                  <Input
                    placeholder="e.g., Department Coordinator"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Brief description of this role"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Permissions</Label>
                  <Badge variant="secondary">
                    {newRole.permissions.length} / {ALL_PERMISSIONS.length} selected
                  </Badge>
                </div>
                
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {Object.entries(PERMISSION_CATEGORIES).map(([category, { icon: Icon, color, bg, permissions }]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${bg}`}>
                              <Icon className={`h-4 w-4 ${color}`} />
                            </div>
                            <span className="font-medium">{category}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectAllInCategory(permissions.map(p => p.id))}
                          >
                            {permissions.every(p => newRole.permissions.includes(p.id)) ? "Deselect All" : "Select All"}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 ml-8">
                          {permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                newRole.permissions.includes(permission.id)
                                  ? "bg-primary/5 border-primary"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => togglePermission(permission.id)}
                            >
                              <Checkbox
                                checked={newRole.permissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{permission.label}</p>
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateRole}>
                <Check className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allRoles.length}</p>
                <p className="text-sm text-muted-foreground">Total Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{SYSTEM_ROLES.length}</p>
                <p className="text-sm text-muted-foreground">System Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <UserCog className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customRoles.length}</p>
                <p className="text-sm text-muted-foreground">Custom Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-lg">
                <Key className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ALL_PERMISSIONS.length}</p>
                <p className="text-sm text-muted-foreground">Total Permissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles Management
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Assignments
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permission Matrix
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* System Roles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              System Roles
              <Badge variant="secondary" className="ml-2">{SYSTEM_ROLES.length}</Badge>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SYSTEM_ROLES.filter(role =>
                role.name.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((role) => {
                const Icon = role.icon;
                return (
                  <Card key={role.id} className="relative overflow-hidden">
                    <div className="absolute top-0 right-0">
                      <Badge variant="outline" className="rounded-none rounded-bl-lg">
                        <Lock className="h-3 w-3 mr-1" />
                        System
                      </Badge>
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${role.color.replace('text-', 'bg-').replace('-800', '-100')}`}>
                          <Icon className={`h-5 w-5 ${role.color.split(' ')[1]}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{role.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {role.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{role.userCount} users</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <span>{role.permissions.length} permissions</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRole(role.id);
                            setIsViewPermissionsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Custom Roles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Unlock className="h-5 w-5 text-muted-foreground" />
              Custom Roles
              <Badge variant="secondary" className="ml-2">{customRoles.length}</Badge>
            </h3>
            {customRoles.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Custom Roles Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create custom roles to define specific permissions for your organization
                  </p>
                  <Button onClick={() => setIsCreateRoleOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Custom Role
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customRoles.filter(role =>
                  role.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((role) => {
                  const Icon = role.icon;
                  return (
                    <Card key={role.id} className="relative overflow-hidden">
                      <div className="absolute top-0 right-0">
                        <Badge className="rounded-none rounded-bl-lg bg-purple-100 text-purple-800">
                          Custom
                        </Badge>
                      </div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${role.color.replace('text-', 'bg-').replace('-800', '-100')}`}>
                            <Icon className={`h-5 w-5 ${role.color.split(' ')[1]}`} />
                          </div>
                          <div>
                            <CardTitle className="text-base">{role.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              {role.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{role.userCount} users</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Key className="h-4 w-4 text-muted-foreground" />
                              <span>{role.permissions.length} permissions</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingRole(role);
                                setIsEditRoleOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteRole(role.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* User Assignments Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
              <CardDescription>
                View and manage role assignments for all users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const role = getRoleById(user.currentRole);
                    const Icon = role?.icon || Users;
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {user.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          <Badge className={role?.color || "bg-gray-100 text-gray-800"}>
                            <Icon className="h-3 w-3 mr-1" />
                            {role?.name || user.currentRole}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {getPermissionCount(user.currentRole)} permissions
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit2 className="h-4 w-4 mr-2" />
                                Change Role
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Change Role for {user.name}</DialogTitle>
                                <DialogDescription>
                                  Select a new role to assign to this user
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Current Role</Label>
                                  <Badge className={role?.color || "bg-gray-100 text-gray-800"}>
                                    {role?.name || user.currentRole}
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  <Label>New Role</Label>
                                  <Select
                                    defaultValue={user.currentRole}
                                    onValueChange={(value) => handleAssignRole(user.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <div className="p-2 text-xs font-medium text-muted-foreground">System Roles</div>
                                      {SYSTEM_ROLES.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                          {r.name}
                                        </SelectItem>
                                      ))}
                                      {customRoles.length > 0 && (
                                        <>
                                          <Separator className="my-2" />
                                          <div className="p-2 text-xs font-medium text-muted-foreground">Custom Roles</div>
                                          {customRoles.map((r) => (
                                            <SelectItem key={r.id} value={r.id}>
                                              {r.name}
                                            </SelectItem>
                                          ))}
                                        </>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permission Matrix Tab */}
        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Complete overview of all permissions across all roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background min-w-[200px]">Permission</TableHead>
                      {allRoles.map((role) => (
                        <TableHead key={role.id} className="text-center min-w-[100px]">
                          <div className="flex flex-col items-center gap-1">
                            <Badge className={role.color} variant="outline">
                              {role.name}
                            </Badge>
                            {role.isSystem && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(PERMISSION_CATEGORIES).map(([category, { icon: Icon, color, permissions }]) => (
                      <>
                        <TableRow key={category} className="bg-muted/30">
                          <TableCell colSpan={allRoles.length + 1} className="sticky left-0 bg-muted/30">
                            <div className="flex items-center gap-2 font-medium">
                              <Icon className={`h-4 w-4 ${color}`} />
                              {category}
                            </div>
                          </TableCell>
                        </TableRow>
                        {permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell className="sticky left-0 bg-background">
                              <div>
                                <p className="text-sm font-medium">{permission.label}</p>
                                <p className="text-xs text-muted-foreground">{permission.id}</p>
                              </div>
                            </TableCell>
                            {allRoles.map((role) => (
                              <TableCell key={role.id} className="text-center">
                                {role.permissions.includes(permission.id) ? (
                                  <div className="flex justify-center">
                                    <div className="p-1 rounded-full bg-green-100">
                                      <Check className="h-4 w-4 text-green-600" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-center">
                                    <div className="p-1 rounded-full bg-gray-100">
                                      <X className="h-4 w-4 text-gray-400" />
                                    </div>
                                  </div>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Edit Role: {editingRole?.name}
            </DialogTitle>
            <DialogDescription>
              Modify permissions for this custom role
            </DialogDescription>
          </DialogHeader>
          {editingRole && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role Name</Label>
                  <Input
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={editingRole.description}
                    onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Permissions</Label>
                  <Badge variant="secondary">
                    {editingRole.permissions.length} / {ALL_PERMISSIONS.length} selected
                  </Badge>
                </div>
                
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {Object.entries(PERMISSION_CATEGORIES).map(([category, { icon: Icon, color, bg, permissions }]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded ${bg}`}>
                              <Icon className={`h-4 w-4 ${color}`} />
                            </div>
                            <span className="font-medium">{category}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => selectAllInCategory(permissions.map(p => p.id), true)}
                          >
                            {permissions.every(p => editingRole.permissions.includes(p.id)) ? "Deselect All" : "Select All"}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 ml-8">
                          {permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                editingRole.permissions.includes(permission.id)
                                  ? "bg-primary/5 border-primary"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => togglePermission(permission.id, true)}
                            >
                              <Checkbox
                                checked={editingRole.permissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id, true)}
                              />
                              <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{permission.label}</p>
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateRole}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Permissions Dialog */}
      <Dialog open={isViewPermissionsOpen} onOpenChange={setIsViewPermissionsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Permissions for {getRoleById(selectedRole || "")?.name}
            </DialogTitle>
            <DialogDescription>
              View all permissions assigned to this system role
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {Object.entries(PERMISSION_CATEGORIES).map(([category, { icon: Icon, color, bg, permissions }]) => {
                  const rolePerms = getRoleById(selectedRole)?.permissions || [];
                  const categoryPerms = permissions.filter(p => rolePerms.includes(p.id));
                  
                  if (categoryPerms.length === 0) return null;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${bg}`}>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <span className="font-medium">{category}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {categoryPerms.length}/{permissions.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 ml-8">
                        {categoryPerms.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{permission.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewPermissionsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
