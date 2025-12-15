import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Shield, Calendar, Award, FileText, Download,
  CheckCircle2, AlertCircle, Clock, QrCode, Printer,
  RefreshCw, ExternalLink, Building2, GraduationCap
} from "lucide-react";
import { toast } from "sonner";

export default function LicenseDetails() {
  const params = useParams();
  const [, navigate] = useLocation();

  // Demo license data
  const license = {
    id: params.id || "LIC-2024-001",
    licenseNumber: "UAE-TL-2024-12345",
    type: "UAE Teaching License",
    level: "Level 3 - Expert",
    status: "active",
    
    holder: {
      name: "Sulaiman Alkaabi",
      emiratesId: "784-1985-1234567-1",
      employeeId: "EDU-2024-001",
    },
    
    issuer: {
      name: "Ministry of Education - UAE",
      authority: "Teacher Licensing Division",
    },
    
    dates: {
      issued: "2024-01-15",
      expiry: "2027-01-14",
      lastRenewal: "2024-01-15",
      nextRenewal: "2026-07-14",
    },
    
    specializations: [
      "Mathematics - Secondary",
      "Advanced Mathematics - IB/Cambridge",
    ],
    
    gradeLevels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    
    cpdRequirements: {
      required: 40,
      completed: 32,
      deadline: "2024-12-31",
    },
    
    renewalRequirements: [
      { name: "Complete 40 CPD hours annually", status: "in_progress", progress: 80 },
      { name: "Maintain satisfactory performance rating", status: "completed", progress: 100 },
      { name: "No disciplinary actions", status: "completed", progress: 100 },
      { name: "Valid Emirates ID", status: "completed", progress: 100 },
    ],
    
    blockchainVerification: {
      verified: true,
      hash: "0x7a8b9c...3d4e5f",
      timestamp: "2024-01-15T10:30:00Z",
    },
  };

  const daysUntilExpiry = Math.ceil(
    (new Date(license.dates.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleDownload = () => {
    toast.success("License certificate downloaded");
  };

  const handlePrint = () => {
    toast.success("Preparing license for printing...");
  };

  const handleVerify = () => {
    toast.success("License verified on blockchain");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" className="mb-2 -ml-2" onClick={() => navigate("/licensing/my-licenses")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Licenses
        </Button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{license.type}</h1>
              <p className="text-lg text-muted-foreground">{license.level}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-green-100 text-green-700">{license.status.toUpperCase()}</Badge>
                <Badge variant="outline">{license.licenseNumber}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Renew License
            </Button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="font-semibold">{new Date(license.dates.issued).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Expiry Date</p>
                <p className="font-semibold">{new Date(license.dates.expiry).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className={`h-8 w-8 ${daysUntilExpiry > 365 ? "text-green-600" : daysUntilExpiry > 180 ? "text-amber-600" : "text-red-600"}`} />
              <div>
                <p className="text-sm text-muted-foreground">Days Until Expiry</p>
                <p className="font-semibold">{daysUntilExpiry} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">CPD Hours</p>
                <p className="font-semibold">{license.cpdRequirements.completed}/{license.cpdRequirements.required}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* License Holder */}
          <Card>
            <CardHeader>
              <CardTitle>License Holder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{license.holder.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emirates ID</p>
                  <p className="font-medium">{license.holder.emiratesId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{license.holder.employeeId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Authorized Specializations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {license.specializations.map((spec, idx) => (
                    <Badge key={idx} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Grade Levels</p>
                <div className="flex flex-wrap gap-2">
                  {license.gradeLevels.map((grade, idx) => (
                    <Badge key={idx} variant="outline">{grade}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Renewal Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Renewal Requirements</CardTitle>
              <CardDescription>Complete these requirements to maintain your license</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {license.renewalRequirements.map((req, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {req.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                      <span className={req.status === "completed" ? "text-muted-foreground" : ""}>
                        {req.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{req.progress}%</span>
                  </div>
                  <Progress value={req.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Issuing Authority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Issuing Authority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Building2 className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">{license.issuer.name}</p>
                  <p className="text-sm text-muted-foreground">{license.issuer.authority}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Blockchain Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">Verified on Blockchain</span>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Transaction Hash</p>
                <p className="text-xs font-mono truncate">{license.blockchainVerification.hash}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={handleVerify}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Verify on Chain
              </Button>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Verification</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-32 h-32 mx-auto bg-muted rounded-lg flex items-center justify-center mb-3">
                <QrCode className="h-16 w-16 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Scan to verify this license
              </p>
            </CardContent>
          </Card>

          {/* CPD Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">CPD Hours Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Annual Requirement</span>
                  <span className="font-medium">{license.cpdRequirements.completed}/{license.cpdRequirements.required} hours</span>
                </div>
                <Progress value={(license.cpdRequirements.completed / license.cpdRequirements.required) * 100} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  Deadline: {new Date(license.cpdRequirements.deadline).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
