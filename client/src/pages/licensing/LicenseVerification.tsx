import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QrCode, Search, Shield, CheckCircle2, XCircle, AlertCircle, User, Calendar, GraduationCap, Building2, Camera, Upload } from "lucide-react";

interface VerificationResult {
  status: "valid" | "expired" | "suspended" | "not_found";
  license?: {
    number: string;
    holderName: string;
    type: string;
    level: string;
    subjects: string[];
    issuedDate: string;
    expiryDate: string;
    school: string;
    emirate: string;
    cpdHoursCompleted: number;
    cpdHoursRequired: number;
  };
}

export default function LicenseVerification() {
  const [searchMethod, setSearchMethod] = useState<"number" | "qr">("number");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      if (licenseNumber.toLowerCase().includes("exp")) {
        setVerificationResult({
          status: "expired",
          license: {
            number: licenseNumber.toUpperCase(),
            holderName: "Ahmad Mohammed",
            type: "Teaching License",
            level: "Teacher T1",
            subjects: ["Mathematics", "Physics"],
            issuedDate: "2021-01-15",
            expiryDate: "2023-01-15",
            school: "Al Noor Academy",
            emirate: "Abu Dhabi",
            cpdHoursCompleted: 40,
            cpdHoursRequired: 60,
          }
        });
      } else if (licenseNumber.toLowerCase().includes("sus")) {
        setVerificationResult({ status: "suspended" });
      } else if (licenseNumber.length > 5) {
        setVerificationResult({
          status: "valid",
          license: {
            number: licenseNumber.toUpperCase() || "TL-2024-UAE-123456",
            holderName: "Fatima Hassan Al-Rashid",
            type: "Teaching License",
            level: "Expert Teacher",
            subjects: ["English Language", "English Literature"],
            issuedDate: "2023-06-15",
            expiryDate: "2026-06-15",
            school: "Emirates International School",
            emirate: "Dubai",
            cpdHoursCompleted: 55,
            cpdHoursRequired: 60,
          }
        });
      } else {
        setVerificationResult({ status: "not_found" });
      }
      setIsSearching(false);
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Valid</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1"><XCircle className="h-3 w-3" />Expired</Badge>;
      case "suspended":
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">Not Found</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Teaching License Verification</h1>
        <p className="text-muted-foreground">Verify the authenticity and status of teaching licenses issued in the UAE</p>
      </div>

      {/* Search Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Verify a License</CardTitle>
          <CardDescription>Enter the license number or scan the QR code on the license</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={searchMethod} onValueChange={(v) => setSearchMethod(v as "number" | "qr")}>
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="number" className="flex items-center gap-2">
                <Search className="h-4 w-4" />License Number
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />QR Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="number" className="mt-6">
              <div className="flex gap-4 max-w-lg mx-auto">
                <div className="flex-1">
                  <Input
                    placeholder="Enter license number (e.g., TL-2024-UAE-123456)"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="text-center"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching || !licenseNumber}>
                  {isSearching ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="mt-6">
              <div className="max-w-lg mx-auto">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Scan the QR code on the teaching license</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline"><Camera className="h-4 w-4 mr-2" />Use Camera</Button>
                    <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Upload Image</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Verification Result</CardTitle>
              {getStatusBadge(verificationResult.status)}
            </div>
          </CardHeader>
          <CardContent>
            {verificationResult.status === "not_found" ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>License Not Found</AlertTitle>
                <AlertDescription>
                  No teaching license was found matching the provided number. Please check the number and try again.
                </AlertDescription>
              </Alert>
            ) : verificationResult.status === "suspended" ? (
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">License Suspended</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  This teaching license has been suspended. Contact the licensing authority for more information.
                </AlertDescription>
              </Alert>
            ) : verificationResult.license ? (
              <div className="space-y-6">
                {verificationResult.status === "expired" && (
                  <Alert variant="destructive" className="mb-4">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>License Expired</AlertTitle>
                    <AlertDescription>
                      This teaching license expired on {verificationResult.license.expiryDate}. The holder needs to renew their license.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg"><User className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="text-sm text-muted-foreground">License Holder</p>
                        <p className="font-medium">{verificationResult.license.holderName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg"><Shield className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="text-sm text-muted-foreground">License Number</p>
                        <p className="font-medium font-mono">{verificationResult.license.number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg"><GraduationCap className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="text-sm text-muted-foreground">License Level</p>
                        <p className="font-medium">{verificationResult.license.level}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg"><Building2 className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current School</p>
                        <p className="font-medium">{verificationResult.license.school}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg"><Calendar className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valid Period</p>
                        <p className="font-medium">{verificationResult.license.issuedDate} to {verificationResult.license.expiryDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Teaching Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {verificationResult.license.subjects.map(subject => (
                          <Badge key={subject} variant="outline">{subject}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CPD Progress */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">CPD Hours Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {verificationResult.license.cpdHoursCompleted} / {verificationResult.license.cpdHoursRequired} hours
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (verificationResult.license.cpdHoursCompleted / verificationResult.license.cpdHoursRequired) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Information */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            This verification service is provided by the UAE Ministry of Education. For any discrepancies or issues, 
            please contact the Teacher Licensing Department at <a href="mailto:licensing@moe.gov.ae" className="text-primary hover:underline">licensing@moe.gov.ae</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
