import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Search, Filter, MoreHorizontal, Shield, Mail, Phone, Building2, Upload } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { BulkUpload, BulkUploadColumn, BulkUploadResult } from "@/components/BulkUpload";

// Bulk upload configuration for staff members
const staffColumns: BulkUploadColumn[] = [
  { key: "name", label: "Full Name", required: true, type: "text", description: "Ahmed Al-Rashid" },
  { key: "email", label: "Email", required: true, type: "email", description: "ahmed.rashid@school.ae" },
  { key: "role", label: "Role", required: true, type: "text", description: "Teacher" },
  { key: "department", label: "Department", required: true, type: "text", description: "Mathematics" },
  { key: "phone", label: "Phone", required: false, type: "text", description: "+971-50-123-4567" },
  { key: "school", label: "School", required: false, type: "text", description: "Al Noor Academy" },
  { key: "emiratesId", label: "Emirates ID", required: false, type: "text", description: "784-XXXX-XXXXXXX-X" },
  { key: "startDate", label: "Start Date", required: false, type: "date", description: "2024-01-15" },
];

const staffExampleData = [
  { name: "Ahmed Al-Rashid", email: "ahmed.rashid@school.ae", role: "Principal", department: "Administration", phone: "+971-50-123-4567", school: "Al Noor Academy", emiratesId: "784-1990-1234567-1", startDate: "2020-08-15" },
  { name: "Fatima Hassan", email: "fatima.h@school.ae", role: "Teacher", department: "Mathematics", phone: "+971-55-234-5678", school: "Al Noor Academy", emiratesId: "784-1985-2345678-2", startDate: "2021-09-01" },
  { name: "Mohammed Saeed", email: "m.saeed@school.ae", role: "Head of Subject", department: "Science", phone: "+971-52-345-6789", school: "Al Noor Academy", emiratesId: "784-1988-3456789-3", startDate: "2019-08-20" },
];

const DEMO_USERS = [
  { id: 1, name: "Ahmad Al-Rashid", email: "ahmad.rashid@school.ae", role: "Principal", department: "Administration", status: "active", phone: "+971-50-123-4567", school: "Al Noor Academy" },
  { id: 2, name: "Fatima Hassan", email: "fatima.h@school.ae", role: "VP Academic", department: "Academic Affairs", status: "active", phone: "+971-50-234-5678", school: "Al Noor Academy" },
  { id: 3, name: "Mohammed Saeed", email: "m.saeed@school.ae", role: "Head of Subject (Math)", department: "Mathematics", status: "active", phone: "+971-50-345-6789", school: "Al Noor Academy" },
  { id: 4, name: "Sara Abdullah", email: "sara.a@school.ae", role: "Expert Teacher", department: "Science", status: "active", phone: "+971-50-456-7890", school: "Al Noor Academy" },
  { id: 5, name: "Khalid Omar", email: "khalid.o@school.ae", role: "Teacher T1", department: "English", status: "active", phone: "+971-50-567-8901", school: "Al Noor Academy" },
  { id: 6, name: "Noura Ahmed", email: "noura.a@school.ae", role: "Teacher", department: "Arabic", status: "pending", phone: "+971-50-678-9012", school: "Al Noor Academy" },
  { id: 7, name: "Hassan Ibrahim", email: "hassan.i@school.ae", role: "Assistant Teacher", department: "Physical Education", status: "active", phone: "+971-50-789-0123", school: "Al Noor Academy" },
  { id: 8, name: "Layla Mohammed", email: "layla.m@school.ae", role: "School Counselor", department: "Student Services", status: "active", phone: "+971-50-890-1234", school: "Al Noor Academy" },
];

const ROLES = [
  "Principal", "Expert Principal", "VP Academic", "Head of Unit 1", "Head of Unit 2",
  "Head of Subject 1", "Head of Subject 2", "Expert Teacher", "Teacher T1", "Teacher",
  "Assistant Teacher", "School Leader", "Admin Officer", "HR Specialist", "Finance Officer",
  "IT Support", "School Counselor", "Librarian"
];

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredUsers = DEMO_USERS.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle bulk upload of staff members
  const handleBulkUpload = async (data: Record<string, any>[]): Promise<BulkUploadResult[]> => {
    const results: BulkUploadResult[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        
        results.push({
          row: i + 2,
          status: "success",
          message: `Staff member "${row.name}" added successfully`,
          data: row
        });
      } catch (error) {
        results.push({
          row: i + 2,
          status: "error",
          message: `Failed to add staff member: ${error}`
        });
      }
    }
    
    toast.success(`Imported ${results.filter(r => r.status === "success").length} staff members`);
    return results;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage educators and administrative staff across schools</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkUpload
            title="Bulk Upload Staff Members"
            description="Import multiple staff members from a CSV file. Includes teachers, administrators, and support staff."
            columns={staffColumns}
            templateFileName="staff_members_template"
            onUpload={handleBulkUpload}
            exampleData={staffExampleData}
            icon={<Users className="h-5 w-5 text-primary" />}
            triggerButton={
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Bulk Upload
              </Button>
            }
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="h-4 w-4 mr-2" />Add Staff Member</Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>Add a new educator or administrative staff to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@school.ae" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role} value={role.toLowerCase()}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administration</SelectItem>
                    <SelectItem value="academic">Academic Affairs</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="arabic">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+971-50-XXX-XXXX" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Add Staff Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{DEMO_USERS.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><Shield className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{DEMO_USERS.filter(u => u.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><Users className="h-5 w-5 text-yellow-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{DEMO_USERS.filter(u => u.status === "pending").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Building2 className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Schools</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Filter by role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES.slice(0, 10).map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>View and manage all school staff members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />{user.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem>View Performance</DropdownMenuItem>
                        <DropdownMenuItem>Manage Permissions</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
