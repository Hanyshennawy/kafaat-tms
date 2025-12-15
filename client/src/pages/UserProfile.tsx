import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  User, Mail, Phone, MapPin, Building2, GraduationCap,
  Award, Calendar, Edit2, Save, Camera, Shield, BookOpen,
  Briefcase, Star, TrendingUp, Target
} from "lucide-react";
import { toast } from "sonner";

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Demo educator profile
  const [profile, setProfile] = useState({
    firstName: "Sulaiman",
    lastName: "Alkaabi",
    email: "s.binkaab@gmail.com",
    phone: "+971 50 123 4567",
    emiratesId: "784-1985-1234567-1",
    nationality: "UAE",
    dateOfBirth: "1985-03-15",
    
    // Professional
    employeeId: "EDU-2024-001",
    role: "Expert Teacher",
    roleTrack: "Teaching",
    department: "Mathematics",
    school: "Al Noor International School",
    joiningDate: "2018-09-01",
    
    // Address
    emirate: "Dubai",
    city: "Dubai",
    address: "Al Barsha 1, Villa 45",
  });

  const stats = {
    yearsOfService: 6,
    licensesHeld: 3,
    certificationsEarned: 8,
    cpdHoursCompleted: 156,
    performanceRating: 4.5,
    goalsCompleted: 12,
  };

  const licenses = [
    { name: "UAE Teaching License - Level 3", status: "active", expiry: "2025-12-31" },
    { name: "Cambridge IGCSE Mathematics", status: "active", expiry: "2024-06-30" },
  ];

  const certifications = [
    { name: "Master of Education", issuer: "UAE University", year: "2015" },
    { name: "IB Mathematics Certification", issuer: "IBO", year: "2020" },
    { name: "Educational Leadership", issuer: "KHDA", year: "2022" },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-700">
                  {profile.firstName[0]}{profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" variant="secondary" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
                  <p className="text-muted-foreground">{profile.role} • {profile.department}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-indigo-100 text-indigo-700">{profile.roleTrack} Track</Badge>
                    <Badge variant="outline">{profile.employeeId}</Badge>
                  </div>
                </div>
                <Button onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={isSaving}>
                  {isEditing ? (
                    <><Save className="h-4 w-4 mr-2" />{isSaving ? "Saving..." : "Save Changes"}</>
                  ) : (
                    <><Edit2 className="h-4 w-4 mr-2" />Edit Profile</>
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {profile.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {profile.phone}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {profile.school}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Joined {new Date(profile.joiningDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Briefcase className="h-8 w-8 mx-auto text-indigo-600 mb-2" />
            <p className="text-2xl font-bold">{stats.yearsOfService}</p>
            <p className="text-xs text-muted-foreground">Years of Service</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold">{stats.licensesHeld}</p>
            <p className="text-xs text-muted-foreground">Active Licenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 mx-auto text-amber-600 mb-2" />
            <p className="text-2xl font-bold">{stats.certificationsEarned}</p>
            <p className="text-xs text-muted-foreground">Certifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{stats.cpdHoursCompleted}</p>
            <p className="text-xs text-muted-foreground">CPD Hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{stats.performanceRating}</p>
            <p className="text-xs text-muted-foreground">Performance Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold">{stats.goalsCompleted}</p>
            <p className="text-xs text-muted-foreground">Goals Completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="licenses">Licenses & Certs</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={profile.firstName} disabled={!isEditing} onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={profile.lastName} disabled={!isEditing} onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.email} disabled={!isEditing} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={profile.phone} disabled={!isEditing} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Emirates ID</Label>
                <Input value={profile.emiratesId} disabled />
              </div>
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input value={profile.nationality} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input value={profile.employeeId} disabled />
              </div>
              <div className="space-y-2">
                <Label>Current Role</Label>
                <Input value={profile.role} disabled />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={profile.department} disabled />
              </div>
              <div className="space-y-2">
                <Label>School</Label>
                <Input value={profile.school} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Licenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {licenses.map((license, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{license.name}</p>
                      <p className="text-sm text-muted-foreground">Expires: {license.expiry}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{license.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {certifications.map((cert, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-muted-foreground">{cert.issuer} • {cert.year}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
