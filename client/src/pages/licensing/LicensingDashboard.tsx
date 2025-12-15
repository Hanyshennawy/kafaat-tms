import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, FileText, RefreshCw, Award, ArrowRight, 
  Shield, CheckCircle2, Clock, AlertCircle, Plus, ChevronRight,
  BookOpen, ClipboardCheck, Upload, Star, TrendingUp, Users,
  Calendar, Bell, ExternalLink, Sparkles, Play
} from "lucide-react";
import { Link } from "wouter";

// Service types available
const licenseServices = [
  {
    id: "new-license",
    title: "New License Issuance",
    description: "Apply for a new teaching license. Complete required training courses and pass the licensing exam.",
    icon: Plus,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    borderColor: "border-teal-200 hover:border-teal-400",
    path: "/licensing/new-license",
    steps: ["Apply", "Training", "Exam", "Verification", "Issuance"],
    duration: "4-6 weeks",
    requirements: "Degree certificate, Teaching qualification, Experience letter"
  },
  {
    id: "renewal",
    title: "License Renewal",
    description: "Renew your existing teaching license. Auto-renewal available for eligible educators.",
    icon: RefreshCw,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200 hover:border-blue-400",
    path: "/licensing/renewal",
    steps: ["Eligibility Check", "CPD Verification", "Document Upload", "Approval"],
    duration: "3-5 days",
    requirements: "Valid license, CPD hours completed, Updated documents"
  },
  {
    id: "upgrade",
    title: "License Upgrade",
    description: "Upgrade your license category or add new subject specializations.",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200 hover:border-purple-400",
    path: "/licensing/upgrade",
    steps: ["Select Category", "Additional Training", "Assessment", "Issuance"],
    duration: "2-4 weeks",
    requirements: "Current license, Additional qualifications, Experience proof"
  },
  {
    id: "replacement",
    title: "License Replacement",
    description: "Request a replacement for lost, stolen, or damaged license cards.",
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-200 hover:border-orange-400",
    path: "/licensing/replacement",
    steps: ["Report", "Verification", "Payment", "Reissue"],
    duration: "2-3 days",
    requirements: "Police report (if stolen), ID verification"
  }
];

// Demo user license data
const userLicenses = [
  {
    id: "LIC-2024-001",
    type: "Teaching License",
    category: "Secondary Education",
    subject: "Mathematics",
    status: "active",
    issueDate: "2023-03-15",
    expiryDate: "2026-03-14",
    blockchainVerified: true,
    autoRenewalEnabled: true,
    cpdProgress: 85,
    daysToExpiry: 456
  }
];

// Demo active applications
const activeApplications = [
  {
    id: "APP-2024-123",
    type: "License Upgrade",
    status: "in_progress",
    currentStep: 2,
    totalSteps: 4,
    stepName: "Additional Training",
    submittedDate: "2024-12-01",
    lastUpdated: "2024-12-10"
  }
];

// Notifications
const notifications = [
  { id: 1, type: "warning", message: "CPD hours requirement: 15 hours remaining before renewal", date: "2024-12-13" },
  { id: 2, type: "info", message: "New training course available: Digital Assessment Methods", date: "2024-12-10" },
  { id: 3, type: "success", message: "Your license has been auto-verified for renewal eligibility", date: "2024-12-05" }
];

export default function LicensingDashboard() {
  const [activeTab, setActiveTab] = useState("services");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "expiring_soon": return "bg-yellow-100 text-yellow-700";
      case "expired": return "bg-red-100 text-red-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-teal-600" />
            Teacher Licensing Services
          </h1>
          <p className="text-muted-foreground">
            Complete licensing lifecycle management with blockchain verification
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/licensing/verify">
            <Button variant="outline" className="gap-2">
              <Shield className="h-4 w-4" />
              Verify License
            </Button>
          </Link>
          <Link href="/licensing/my-licenses">
            <Button className="gap-2">
              <Award className="h-4 w-4" />
              My Licenses
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Licenses</p>
                <p className="text-2xl font-bold text-green-600">{userLicenses.filter(l => l.status === "active").length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Applications</p>
                <p className="text-2xl font-bold text-blue-600">{activeApplications.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPD Progress</p>
                <p className="text-2xl font-bold text-purple-600">85%</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Days to Renewal</p>
                <p className="text-2xl font-bold text-teal-600">456</p>
              </div>
              <div className="p-3 rounded-full bg-teal-100">
                <Calendar className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <Card className="mb-8 border-l-4 border-l-yellow-500 bg-yellow-50/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800">Important Notifications</p>
                <ul className="mt-2 space-y-1">
                  {notifications.slice(0, 2).map(n => (
                    <li key={n.id} className="text-sm text-yellow-700 flex items-center gap-2">
                      {n.type === "warning" && <AlertCircle className="h-3 w-3" />}
                      {n.type === "info" && <Bell className="h-3 w-3" />}
                      {n.type === "success" && <CheckCircle2 className="h-3 w-3" />}
                      {n.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="services" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="my-licenses" className="gap-2">
            <Award className="h-4 w-4" />
            My Licenses
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2">
            <FileText className="h-4 w-4" />
            My Applications
          </TabsTrigger>
          <TabsTrigger value="cpd" className="gap-2">
            <BookOpen className="h-4 w-4" />
            CPD Records
          </TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {licenseServices.map(service => (
              <Card 
                key={service.id} 
                className={`border-2 transition-all cursor-pointer ${service.borderColor}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${service.bgColor}`}>
                      <service.icon className={`h-8 w-8 ${service.color}`} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {service.duration}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Process Steps */}
                    <div>
                      <p className="text-sm font-medium mb-2">Process Steps:</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {service.steps.map((step, idx) => (
                          <div key={idx} className="flex items-center">
                            <Badge variant="secondary" className="text-xs">
                              {idx + 1}. {step}
                            </Badge>
                            {idx < service.steps.length - 1 && (
                              <ChevronRight className="h-3 w-3 text-muted-foreground mx-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Requirements */}
                    <div>
                      <p className="text-sm font-medium mb-1">Requirements:</p>
                      <p className="text-sm text-muted-foreground">{service.requirements}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={service.path} className="w-full">
                    <Button className="w-full gap-2">
                      <Play className="h-4 w-4" />
                      Start Service
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Link href="/licensing/verify">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <span>Verify License</span>
                  </Button>
                </Link>
                <Link href="/licensing/cpd">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                    <span>Add CPD Hours</span>
                  </Button>
                </Link>
                <Link href="/licensing/my-applications">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <FileText className="h-6 w-6 text-orange-600" />
                    <span>Track Application</span>
                  </Button>
                </Link>
                <Link href="/catalog/training">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <GraduationCap className="h-6 w-6 text-teal-600" />
                    <span>Training Courses</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Licenses Tab */}
        <TabsContent value="my-licenses" className="space-y-6">
          {userLicenses.length > 0 ? (
            userLicenses.map(license => (
              <Card key={license.id} className="overflow-hidden">
                <div className="flex">
                  {/* License Card Visual */}
                  <div className="w-64 bg-gradient-to-br from-teal-600 to-blue-600 p-6 text-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <GraduationCap className="h-8 w-8" />
                        <span className="font-bold">UAE MOE</span>
                      </div>
                      <p className="text-sm opacity-80">Teaching License</p>
                      <p className="text-xl font-bold mt-1">{license.id}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-70">Valid Until</p>
                      <p className="font-semibold">{new Date(license.expiryDate).toLocaleDateString()}</p>
                    </div>
                    {license.blockchainVerified && (
                      <div className="flex items-center gap-1 mt-2 text-xs">
                        <Shield className="h-3 w-3" />
                        <span>Blockchain Verified</span>
                      </div>
                    )}
                  </div>
                  
                  {/* License Details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{license.type}</h3>
                        <p className="text-muted-foreground">{license.category} - {license.subject}</p>
                      </div>
                      <Badge className={getStatusColor(license.status)}>
                        {license.status === "active" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {license.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Issue Date</p>
                        <p className="font-medium">{new Date(license.issueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expiry Date</p>
                        <p className="font-medium">{new Date(license.expiryDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Days Remaining</p>
                        <p className="font-medium text-green-600">{license.daysToExpiry} days</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>CPD Progress for Renewal</span>
                        <span className="font-medium">{license.cpdProgress}%</span>
                      </div>
                      <Progress value={license.cpdProgress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {license.autoRenewalEnabled && (
                          <Badge variant="secondary" className="gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Auto-Renewal Enabled
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <ExternalLink className="h-4 w-4" />
                          Download
                        </Button>
                        <Link href={`/licensing/license/${license.id}`}>
                          <Button size="sm" className="gap-1">
                            View Details
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Licenses Yet</h3>
                <p className="text-muted-foreground mb-4">Apply for your first teaching license</p>
                <Link href="/licensing/new-license">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Apply for New License
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          {activeApplications.length > 0 ? (
            activeApplications.map(app => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {app.type}
                        <Badge className={getStatusColor(app.status)}>
                          {app.status.replace("_", " ")}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Application ID: {app.id} • Submitted: {new Date(app.submittedDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress: Step {app.currentStep} of {app.totalSteps}</span>
                      <span className="font-medium">{app.stepName}</span>
                    </div>
                    <Progress value={(app.currentStep / app.totalSteps) * 100} className="h-3" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(app.lastUpdated).toLocaleDateString()}
                    </p>
                    <Link href={`/licensing/application/${app.id}`}>
                      <Button className="gap-2">
                        Continue Application
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Active Applications</h3>
                <p className="text-muted-foreground mb-4">Start a new application from our services</p>
                <Button variant="outline" onClick={() => setActiveTab("services")}>
                  View Services
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CPD Tab - Link to existing */}
        <TabsContent value="cpd" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Continuing Professional Development
              </CardTitle>
              <CardDescription>
                Track your CPD hours to maintain license eligibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Annual Progress: 47/60 hours</span>
                  <span className="text-muted-foreground">78% complete</span>
                </div>
                <Progress value={78} className="h-3" />
              </div>
              <Link href="/licensing/cpd">
                <Button className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Full CPD Records
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Blockchain Verification Banner */}
      <Card className="mt-8 bg-gradient-to-r from-teal-600 to-blue-600 text-white border-0">
        <CardContent className="py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-white/20">
                <Shield className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Blockchain-Verified Credentials</h3>
                <p className="text-teal-100">All licenses secured with immutable blockchain records for worldwide verification</p>
              </div>
            </div>
            <Link href="/licensing/verify">
              <Button variant="secondary" className="gap-2">
                <Shield className="h-4 w-4" />
                Verify a License
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
