import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  Clock,
  Calendar,
  AlertTriangle,
  Upload,
  FileText,
  CreditCard,
  Shield,
  Award,
  Bell,
  Zap,
  Target,
  BookOpen,
  Loader2,
  Check,
  X,
  Download,
  Eye
} from "lucide-react";

// Mock license data for renewal
const USER_LICENSES = [
  {
    id: "LIC-2023-00234",
    type: "Teaching License",
    status: "active",
    issueDate: "2023-06-15",
    expiryDate: "2025-06-14",
    daysRemaining: 142,
    autoRenewalEnabled: true,
    cpdHours: { completed: 35, required: 40 },
    renewalFee: 500,
    canAutoRenew: true,
  },
  {
    id: "LIC-2022-00891",
    type: "Specialist License",
    status: "expiring",
    issueDate: "2022-03-20",
    expiryDate: "2024-03-19",
    daysRemaining: 28,
    autoRenewalEnabled: false,
    cpdHours: { completed: 38, required: 40 },
    renewalFee: 600,
    canAutoRenew: false,
  },
];

// Renewal requirements
const RENEWAL_REQUIREMENTS = [
  { id: 1, name: "Minimum 40 CPD Hours", status: "pending", detail: "38/40 hours completed" },
  { id: 2, name: "Valid Emirates ID", status: "met", detail: "Expires Dec 2026" },
  { id: 3, name: "No Disciplinary Actions", status: "met", detail: "Clean record" },
  { id: 4, name: "Active Employment", status: "met", detail: "Verified by employer" },
  { id: 5, name: "Payment of Renewal Fee", status: "pending", detail: "AED 600 due" },
];

export default function LicenseRenewal() {
  const [, setLocation] = useLocation();
  const [selectedLicense, setSelectedLicense] = useState(USER_LICENSES[1]); // Default to expiring one
  const [autoRenewal, setAutoRenewal] = useState(selectedLicense.autoRenewalEnabled);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>(["Emirates ID", "Employment Letter"]);
  const [activeTab, setActiveTab] = useState("manual");

  const handleAutoRenewalToggle = (enabled: boolean) => {
    setAutoRenewal(enabled);
    if (enabled) {
      toast.success("Auto-renewal enabled. Your license will renew automatically before expiry.");
    } else {
      toast.info("Auto-renewal disabled. You'll need to renew manually.");
    }
  };

  const handleDocUpload = (docName: string) => {
    if (!uploadedDocs.includes(docName)) {
      setUploadedDocs([...uploadedDocs, docName]);
      toast.success(`${docName} uploaded successfully`);
    }
  };

  const handleSubmitRenewal = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    toast.success("Renewal application submitted successfully!");
    setLocation("/licensing");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case "expiring":
        return <Badge className="bg-yellow-100 text-yellow-700">Expiring Soon</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-700">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/licensing")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">License Renewal</h1>
          <p className="text-muted-foreground">Renew your professional licenses</p>
        </div>
      </div>

      {/* License Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${
                    license.status === "active" ? "bg-green-100" : "bg-yellow-100"
                  }`}>
                    <Award className={`h-6 w-6 ${
                      license.status === "active" ? "text-green-600" : "text-yellow-600"
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{license.type}</h3>
                    <p className="text-sm text-muted-foreground">{license.id}</p>
                  </div>
                </div>
                {getStatusBadge(license.status)}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expires</span>
                  <span className="font-medium">
                    {new Date(license.expiryDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Days Remaining</span>
                  <span className={`font-medium ${
                    license.daysRemaining < 30 ? "text-red-600" : "text-green-600"
                  }`}>
                    {license.daysRemaining} days
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CPD Hours</span>
                  <span className="font-medium">
                    {license.cpdHours.completed}/{license.cpdHours.required}
                  </span>
                </div>
              </div>

              {selectedLicense.id === license.id && (
                <div className="mt-4 pt-4 border-t flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary">Selected for Renewal</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Renewal Options */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal Options</CardTitle>
          <CardDescription>Choose how you want to renew your license</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="auto" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Auto-Renewal
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Manual Renewal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="auto" className="mt-6 space-y-6">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-800">Hassle-Free Auto-Renewal</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Enable auto-renewal to automatically renew your license 30 days before expiry.
                      We'll verify your CPD hours, check eligibility, and process payment automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Auto-Renewal</p>
                      <p className="text-sm text-muted-foreground">
                        Renew automatically before expiry
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={autoRenewal}
                    onCheckedChange={handleAutoRenewalToggle}
                    disabled={!selectedLicense.canAutoRenew}
                  />
                </div>

                {!selectedLicense.canAutoRenew && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Auto-Renewal Not Available</p>
                      <p className="text-sm text-yellow-700">
                        Your CPD hours are incomplete. Complete the required hours to enable auto-renewal.
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-4 border rounded-lg space-y-3">
                  <h5 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Auto-Renewal Requirements
                  </h5>
                  <div className="space-y-2">
                    {[
                      { label: "CPD Hours Complete", met: selectedLicense.cpdHours.completed >= selectedLicense.cpdHours.required },
                      { label: "Valid Payment Method", met: true },
                      { label: "No Pending Issues", met: true },
                      { label: "Active Employment", met: true },
                    ].map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {req.met ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={req.met ? "text-green-700" : "text-red-700"}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="mt-6 space-y-6">
              {/* Requirements Checklist */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Renewal Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {RENEWAL_REQUIREMENTS.map((req) => (
                    <div
                      key={req.id}
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        req.status === "met" ? "bg-green-50" : "bg-yellow-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {req.status === "met" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium">{req.name}</p>
                          <p className="text-sm text-muted-foreground">{req.detail}</p>
                        </div>
                      </div>
                      <Badge
                        variant={req.status === "met" ? "default" : "secondary"}
                        className={req.status === "met" ? "bg-green-100 text-green-700" : ""}
                      >
                        {req.status === "met" ? "Complete" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* CPD Hours Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">CPD Hours Progress</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setLocation("/training")}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Courses
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {selectedLicense.cpdHours.completed}/{selectedLicense.cpdHours.required}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {selectedLicense.cpdHours.required - selectedLicense.cpdHours.completed} hours remaining
                      </span>
                    </div>
                    <Progress
                      value={(selectedLicense.cpdHours.completed / selectedLicense.cpdHours.required) * 100}
                      className="h-3"
                    />
                    {selectedLicense.cpdHours.completed < selectedLicense.cpdHours.required && (
                      <p className="text-sm text-yellow-600 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Complete remaining CPD hours to renew your license
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Document Upload */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Supporting Documents</CardTitle>
                  <CardDescription>Upload required documents for renewal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Emirates ID", required: true },
                    { name: "Employment Letter", required: true },
                    { name: "CPD Certificates", required: true },
                    { name: "Good Conduct Certificate", required: false },
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {uploadedDocs.includes(doc.name) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.required ? "Required" : "Optional"}
                          </p>
                        </div>
                      </div>
                      {uploadedDocs.includes(doc.name) ? (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Badge className="bg-green-100 text-green-700">Uploaded</Badge>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDocUpload(doc.name)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Renewal Fee</span>
                      <span className="font-medium">AED {selectedLicense.renewalFee}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Processing Fee</span>
                      <span>AED 25</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>AED {selectedLicense.renewalFee + 25}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleSubmitRenewal}
                    disabled={isProcessing || selectedLicense.cpdHours.completed < selectedLicense.cpdHours.required}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay & Submit Renewal
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h4 className="font-semibold">Validity Period</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Renewed license valid for 2 years
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h4 className="font-semibold">Processing Time</h4>
            <p className="text-sm text-muted-foreground mt-1">
              3-5 business days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Download className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h4 className="font-semibold">Digital License</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Available immediately upon approval
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
