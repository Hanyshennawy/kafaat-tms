import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Award,
  Download,
  Eye,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  QrCode,
  Share2,
  Printer,
  FileText,
  Shield,
  Building2,
  GraduationCap,
  ArrowLeft,
  History,
  ExternalLink,
  Copy,
  Mail
} from "lucide-react";

// Mock license data
const USER_LICENSES = [
  {
    id: "LIC-2023-00234",
    type: "Teaching License",
    category: "General Education",
    status: "active",
    issueDate: "2023-06-15",
    expiryDate: "2025-06-14",
    issuer: "UAE Ministry of Education",
    holderName: "Ahmed Al Mansouri",
    emiratesId: "784-1990-1234567-1",
    institution: "Dubai International Academy",
    subjects: ["Mathematics", "Physics"],
    level: "Secondary (Grades 9-12)",
    cpdHours: { completed: 35, required: 40 },
    autoRenewal: true,
    verificationUrl: "https://verify.moe.gov.ae/LIC-2023-00234",
    digitalCertificate: true,
  },
  {
    id: "LIC-2022-00891",
    type: "Specialist License",
    category: "Special Education",
    status: "expiring",
    issueDate: "2022-03-20",
    expiryDate: "2024-03-19",
    issuer: "UAE Ministry of Education",
    holderName: "Ahmed Al Mansouri",
    emiratesId: "784-1990-1234567-1",
    institution: "Dubai International Academy",
    subjects: ["Special Education Needs"],
    level: "All Grades",
    cpdHours: { completed: 38, required: 40 },
    autoRenewal: false,
    verificationUrl: "https://verify.moe.gov.ae/LIC-2022-00891",
    digitalCertificate: true,
  },
  {
    id: "LIC-2020-00456",
    type: "Teaching License",
    category: "General Education",
    status: "expired",
    issueDate: "2020-01-10",
    expiryDate: "2022-01-09",
    issuer: "UAE Ministry of Education",
    holderName: "Ahmed Al Mansouri",
    emiratesId: "784-1990-1234567-1",
    institution: "Al Khaleej National School",
    subjects: ["Mathematics"],
    level: "Primary (Grades 1-5)",
    cpdHours: { completed: 40, required: 40 },
    autoRenewal: false,
    verificationUrl: null,
    digitalCertificate: false,
  },
];

// License history/activity
const LICENSE_ACTIVITY = [
  { date: "2024-01-15", action: "CPD Hours Updated", details: "Completed 5 hours of professional development", license: "LIC-2023-00234" },
  { date: "2023-12-10", action: "Renewal Reminder Sent", details: "Automatic reminder for upcoming renewal", license: "LIC-2022-00891" },
  { date: "2023-11-20", action: "Auto-Renewal Enabled", details: "Enabled automatic renewal feature", license: "LIC-2023-00234" },
  { date: "2023-06-15", action: "License Issued", details: "New teaching license issued", license: "LIC-2023-00234" },
  { date: "2023-05-28", action: "Exam Passed", details: "Successfully passed licensing examination", license: "LIC-2023-00234" },
];

export default function MyLicenses() {
  const [, setLocation] = useLocation();
  const [selectedLicense, setSelectedLicense] = useState(USER_LICENSES[0]);
  const [activeTab, setActiveTab] = useState("details");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "expiring":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expiring Soon
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCopyVerificationUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Verification URL copied to clipboard");
  };

  const handleDownloadCertificate = (licenseId: string) => {
    toast.success(`Downloading certificate for ${licenseId}`);
  };

  const handleShareLicense = (licenseId: string) => {
    toast.success(`Share options opened for ${licenseId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/licensing")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Licenses</h1>
            <p className="text-muted-foreground">View and manage your professional licenses</p>
          </div>
        </div>
        <Button onClick={() => setLocation("/licensing/new-license")}>
          <Award className="h-4 w-4 mr-2" />
          Apply for New License
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {USER_LICENSES.filter(l => l.status === "active").length}
                </p>
                <p className="text-sm text-muted-foreground">Active Licenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {USER_LICENSES.filter(l => l.status === "expiring").length}
                </p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">73/80</p>
                <p className="text-sm text-muted-foreground">Total CPD Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <History className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{USER_LICENSES.length}</p>
                <p className="text-sm text-muted-foreground">Total Licenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* License List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-lg">Your Licenses</h3>
          {USER_LICENSES.map((license) => (
            <Card
              key={license.id}
              onClick={() => setSelectedLicense(license)}
              className={`cursor-pointer transition-all ${
                selectedLicense.id === license.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:border-gray-300"
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    license.status === "active" 
                      ? "bg-green-100" 
                      : license.status === "expiring" 
                      ? "bg-yellow-100" 
                      : "bg-gray-100"
                  }`}>
                    <Award className={`h-6 w-6 ${
                      license.status === "active" 
                        ? "text-green-600" 
                        : license.status === "expiring" 
                        ? "text-yellow-600" 
                        : "text-gray-400"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{license.type}</h4>
                        <p className="text-sm text-muted-foreground">{license.id}</p>
                      </div>
                      {getStatusBadge(license.status)}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(license.expiryDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                      {license.status !== "expired" && (
                        <span className={`${
                          getDaysRemaining(license.expiryDate) < 30 ? "text-red-500" : "text-green-500"
                        }`}>
                          {getDaysRemaining(license.expiryDate)} days
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* License Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedLicense.type}
                    {getStatusBadge(selectedLicense.status)}
                  </CardTitle>
                  <CardDescription>{selectedLicense.id}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedLicense.digitalCertificate && (
                    <Button variant="outline" size="sm" onClick={() => handleDownloadCertificate(selectedLicense.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleShareLicense(selectedLicense.id)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6 space-y-6">
                  {/* Digital Certificate Preview */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-blue-200">
                    <div className="text-center mb-4">
                      <Shield className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-bold text-blue-800">{selectedLicense.type}</h3>
                      <p className="text-blue-600">{selectedLicense.category}</p>
                    </div>
                    <Separator className="my-4" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">This certifies that</p>
                      <p className="text-xl font-bold text-blue-800">{selectedLicense.holderName}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        is licensed to practice as an educator in the United Arab Emirates
                      </p>
                    </div>
                    <div className="flex justify-center mt-4">
                      <QrCode className="h-16 w-16 text-blue-400" />
                    </div>
                  </div>

                  {/* License Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">License Holder</p>
                        <p className="font-medium">{selectedLicense.holderName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Emirates ID</p>
                        <p className="font-medium">{selectedLicense.emiratesId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Institution</p>
                        <p className="font-medium">{selectedLicense.institution}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Subjects</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedLicense.subjects.map((subject) => (
                            <Badge key={subject} variant="secondary">{subject}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Issue Date</p>
                        <p className="font-medium">
                          {new Date(selectedLicense.issueDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expiry Date</p>
                        <p className={`font-medium ${
                          selectedLicense.status === "expired" ? "text-red-600" : ""
                        }`}>
                          {new Date(selectedLicense.expiryDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Grade Level</p>
                        <p className="font-medium">{selectedLicense.level}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Issuing Authority</p>
                        <p className="font-medium">{selectedLicense.issuer}</p>
                      </div>
                    </div>
                  </div>

                  {/* CPD Progress */}
                  {selectedLicense.status !== "expired" && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">CPD Hours Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {selectedLicense.cpdHours.completed}/{selectedLicense.cpdHours.required} hours
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              selectedLicense.cpdHours.completed >= selectedLicense.cpdHours.required
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (selectedLicense.cpdHours.completed / selectedLicense.cpdHours.required) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        {selectedLicense.cpdHours.completed < selectedLicense.cpdHours.required && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {selectedLicense.cpdHours.required - selectedLicense.cpdHours.completed} more hours required for renewal
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Auto-Renewal Status */}
                  {selectedLicense.status !== "expired" && (
                    <div className={`p-4 rounded-lg flex items-center justify-between ${
                      selectedLicense.autoRenewal ? "bg-green-50" : "bg-gray-50"
                    }`}>
                      <div className="flex items-center gap-3">
                        <RefreshCw className={`h-5 w-5 ${
                          selectedLicense.autoRenewal ? "text-green-600" : "text-gray-400"
                        }`} />
                        <div>
                          <p className="font-medium">Auto-Renewal</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedLicense.autoRenewal
                              ? "Your license will renew automatically"
                              : "Auto-renewal is not enabled"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={selectedLicense.autoRenewal ? "default" : "secondary"}>
                        {selectedLicense.autoRenewal ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="verification" className="mt-6 space-y-6">
                  {selectedLicense.verificationUrl ? (
                    <>
                      <div className="p-6 bg-gray-50 rounded-lg text-center">
                        <QrCode className="h-32 w-32 mx-auto text-gray-600 mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Scan this QR code to verify the license
                        </p>
                        <Badge variant="secondary">{selectedLicense.id}</Badge>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Verification URL</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 p-2 bg-gray-100 rounded text-sm truncate">
                            {selectedLicense.verificationUrl}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyVerificationUrl(selectedLicense.verificationUrl!)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <a href={selectedLicense.verificationUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold">Share Verification</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="justify-start">
                            <Mail className="h-4 w-4 mr-2" />
                            Email to Employer
                          </Button>
                          <Button variant="outline" className="justify-start">
                            <Printer className="h-4 w-4 mr-2" />
                            Print Certificate
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <XCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h4 className="font-semibold text-gray-500">Verification Not Available</h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        This license has expired and verification is no longer available.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <div className="space-y-4">
                    {LICENSE_ACTIVITY.filter(a => a.license === selectedLicense.id).length > 0 ? (
                      LICENSE_ACTIVITY.filter(a => a.license === selectedLicense.id).map((activity, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <History className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{activity.action}</p>
                              <span className="text-sm text-muted-foreground">
                                {new Date(activity.date).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{activity.details}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-muted-foreground">No recent activity for this license</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex gap-4">
              {selectedLicense.status === "expiring" && (
                <Button className="flex-1" onClick={() => setLocation("/licensing/renewal")}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renew License
                </Button>
              )}
              {selectedLicense.status === "expired" && (
                <Button className="flex-1" onClick={() => setLocation("/licensing/new-license")}>
                  <Award className="h-4 w-4 mr-2" />
                  Apply for New License
                </Button>
              )}
              {selectedLicense.digitalCertificate && (
                <Button variant="outline" className="flex-1" onClick={() => handleDownloadCertificate(selectedLicense.id)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
