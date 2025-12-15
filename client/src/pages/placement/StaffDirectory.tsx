import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Users, Search, Filter, Building2, Mail, Phone, MapPin, 
  ArrowRightLeft, Eye, MoreHorizontal, GraduationCap, Calendar,
  Star, Briefcase, Clock, ChevronRight, Download, Grid, List
} from "lucide-react";
import { useState } from "react";

export default function StaffDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSchool, setFilterSchool] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // Stats
  const stats = {
    totalStaff: 1245,
    activeEducators: 1180,
    departments: 12,
    schools: 28
  };

  // Schools list
  const schools = [
    { id: "s1", name: "Al Noor International School", region: "Dubai" },
    { id: "s2", name: "Emirates National School", region: "Abu Dhabi" },
    { id: "s3", name: "GEMS Wellington Academy", region: "Dubai" },
    { id: "s4", name: "Sharjah American School", region: "Sharjah" },
    { id: "s5", name: "Al Ain English School", region: "Al Ain" },
  ];

  // Departments
  const departments = [
    "Mathematics", "Science", "English", "Arabic", "Social Studies", 
    "Physical Education", "Art", "Music", "Special Education", "Administration"
  ];

  // Staff data
  const staffMembers = [
    { 
      id: 1, 
      name: "Ahmad Al-Rashid", 
      position: "Senior Math Teacher",
      department: "Mathematics",
      school: "Al Noor International School",
      region: "Dubai",
      email: "ahmad.rashid@edu.ae",
      phone: "+971 50 123 4567",
      yearsExp: 12,
      rating: 4.8,
      status: "active",
      joinDate: "2018-08-15",
      certifications: 4
    },
    { 
      id: 2, 
      name: "Sarah Johnson", 
      position: "Science Department Head",
      department: "Science",
      school: "Emirates National School",
      region: "Abu Dhabi",
      email: "sarah.j@edu.ae",
      phone: "+971 50 234 5678",
      yearsExp: 15,
      rating: 4.9,
      status: "active",
      joinDate: "2015-01-10",
      certifications: 6
    },
    { 
      id: 3, 
      name: "Fatima Hassan", 
      position: "English Teacher",
      department: "English",
      school: "GEMS Wellington Academy",
      region: "Dubai",
      email: "fatima.h@edu.ae",
      phone: "+971 50 345 6789",
      yearsExp: 8,
      rating: 4.6,
      status: "active",
      joinDate: "2020-09-01",
      certifications: 3
    },
    { 
      id: 4, 
      name: "Mohammed Ali", 
      position: "Arabic Teacher",
      department: "Arabic",
      school: "Sharjah American School",
      region: "Sharjah",
      email: "m.ali@edu.ae",
      phone: "+971 50 456 7890",
      yearsExp: 10,
      rating: 4.7,
      status: "active",
      joinDate: "2019-03-20",
      certifications: 5
    },
    { 
      id: 5, 
      name: "Layla Ahmed", 
      position: "Art Teacher",
      department: "Art",
      school: "Al Ain English School",
      region: "Al Ain",
      email: "layla.a@edu.ae",
      phone: "+971 50 567 8901",
      yearsExp: 6,
      rating: 4.5,
      status: "on-leave",
      joinDate: "2021-08-25",
      certifications: 2
    },
    { 
      id: 6, 
      name: "Omar Khalid", 
      position: "PE Teacher",
      department: "Physical Education",
      school: "Al Noor International School",
      region: "Dubai",
      email: "omar.k@edu.ae",
      phone: "+971 50 678 9012",
      yearsExp: 7,
      rating: 4.4,
      status: "active",
      joinDate: "2020-01-15",
      certifications: 3
    },
    { 
      id: 7, 
      name: "Noor Al-Maktoum", 
      position: "School Counselor",
      department: "Administration",
      school: "Emirates National School",
      region: "Abu Dhabi",
      email: "noor.m@edu.ae",
      phone: "+971 50 789 0123",
      yearsExp: 9,
      rating: 4.8,
      status: "active",
      joinDate: "2019-09-01",
      certifications: 4
    },
    { 
      id: 8, 
      name: "Khalid Al-Farsi", 
      position: "Music Teacher",
      department: "Music",
      school: "GEMS Wellington Academy",
      region: "Dubai",
      email: "khalid.f@edu.ae",
      phone: "+971 50 890 1234",
      yearsExp: 5,
      rating: 4.3,
      status: "active",
      joinDate: "2022-08-20",
      certifications: 2
    },
  ];

  // Filter staff
  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          staff.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSchool = filterSchool === "all" || staff.school === filterSchool;
    const matchesDept = filterDepartment === "all" || staff.department === filterDepartment;
    return matchesSearch && matchesSchool && matchesDept;
  });

  // Group by department for tab view
  const staffByDepartment = departments.reduce((acc, dept) => {
    acc[dept] = staffMembers.filter(s => s.department === dept);
    return acc;
  }, {} as Record<string, typeof staffMembers>);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "on-leave": return <Badge className="bg-amber-100 text-amber-700">On Leave</Badge>;
      case "transferred": return <Badge className="bg-blue-100 text-blue-700">Transferred</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Staff Directory</h1>
          <p className="text-muted-foreground">
            Complete directory of staff with placement information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Staff
            </CardDescription>
            <CardTitle className="text-3xl">{stats.totalStaff}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Active Educators
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.activeEducators}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Departments
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.departments}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Schools
            </CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.schools}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, position, or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterSchool} onValueChange={setFilterSchool}>
              <SelectTrigger className="w-[200px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map(school => (
                  <SelectItem key={school.id} value={school.name}>{school.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[180px]">
                <Briefcase className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg">
              <Button 
                variant={viewMode === "list" ? "secondary" : "ghost"} 
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "grid" ? "secondary" : "ghost"} 
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredStaff.length} of {staffMembers.length} staff members
        </p>
      </div>

      {/* Staff List/Grid */}
      {viewMode === "list" ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredStaff.map((staff) => (
                <div key={staff.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{staff.name}</h4>
                      {getStatusBadge(staff.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{staff.position}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {staff.school}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {staff.region}
                      </span>
                    </div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium">{staff.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{staff.yearsExp} years exp.</p>
                  </div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{staff.email}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{staff.phone}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedStaff(staff)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Staff Profile</DialogTitle>
                          <DialogDescription>Detailed information and placement history</DialogDescription>
                        </DialogHeader>
                        {selectedStaff && (
                          <div className="space-y-6">
                            <div className="flex items-start gap-4">
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-medium">
                                {selectedStaff.name.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold">{selectedStaff.name}</h3>
                                <p className="text-muted-foreground">{selectedStaff.position}</p>
                                <div className="flex gap-2 mt-2">
                                  {getStatusBadge(selectedStaff.status)}
                                  <Badge variant="outline">{selectedStaff.department}</Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <Building2 className="h-4 w-4" />
                                    Current School
                                  </div>
                                  <p className="font-medium">{selectedStaff.school}</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <MapPin className="h-4 w-4" />
                                    Region
                                  </div>
                                  <p className="font-medium">{selectedStaff.region}</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <Calendar className="h-4 w-4" />
                                    Join Date
                                  </div>
                                  <p className="font-medium">{new Date(selectedStaff.joinDate).toLocaleDateString()}</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <Star className="h-4 w-4" />
                                    Performance Rating
                                  </div>
                                  <p className="font-medium">{selectedStaff.rating}/5.0</p>
                                </CardContent>
                              </Card>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1">
                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                Request Transfer
                              </Button>
                              <Button variant="outline" className="flex-1">
                                <Clock className="mr-2 h-4 w-4" />
                                View History
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map((staff) => (
            <Card key={staff.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{staff.name}</h4>
                    <p className="text-sm text-muted-foreground">{staff.position}</p>
                    {getStatusBadge(staff.status)}
                  </div>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{staff.school}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{staff.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      {staff.rating}
                    </span>
                    <span className="text-muted-foreground">{staff.yearsExp} yrs exp</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Profile
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
