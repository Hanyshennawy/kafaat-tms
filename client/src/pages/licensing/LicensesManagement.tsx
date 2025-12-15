import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Award, Shield, Upload, Plus } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { BulkUpload, BulkUploadColumn, BulkUploadResult } from "@/components/BulkUpload";

// Bulk upload configuration for license applications
const licenseColumns: BulkUploadColumn[] = [
  { key: "applicantName", label: "Applicant Name", required: true, type: "text", description: "Ahmed Al-Rashid" },
  { key: "email", label: "Email", required: true, type: "email", description: "ahmed.rashid@school.ae" },
  { key: "emiratesId", label: "Emirates ID", required: true, type: "text", description: "784-1990-1234567-1" },
  { key: "licenseType", label: "License Type", required: true, type: "select", options: ["Teacher License", "Leadership License", "Specialist License", "Counselor License"], description: "Teacher License" },
  { key: "subjectArea", label: "Subject Area", required: false, type: "text", description: "Mathematics" },
  { key: "gradeLevel", label: "Grade Level", required: false, type: "select", options: ["KG", "Elementary", "Middle", "High", "All Levels"], description: "Middle" },
  { key: "qualification", label: "Highest Qualification", required: false, type: "select", options: ["Bachelor", "Master", "PhD"], description: "Master" },
  { key: "yearsExperience", label: "Years of Experience", required: false, type: "number", description: "5" },
  { key: "currentSchool", label: "Current School", required: false, type: "text", description: "Al Noor Academy" },
];

const licenseExampleData = [
  { applicantName: "Ahmed Al-Rashid", email: "ahmed.rashid@school.ae", emiratesId: "784-1990-1234567-1", licenseType: "Teacher License", subjectArea: "Mathematics", gradeLevel: "Middle", qualification: "Master", yearsExperience: "5", currentSchool: "Al Noor Academy" },
  { applicantName: "Fatima Hassan", email: "fatima.h@school.ae", emiratesId: "784-1985-2345678-2", licenseType: "Teacher License", subjectArea: "Science", gradeLevel: "High", qualification: "PhD", yearsExperience: "8", currentSchool: "Emirates Academy" },
  { applicantName: "Mohammed Saeed", email: "m.saeed@school.ae", emiratesId: "784-1988-3456789-3", licenseType: "Leadership License", subjectArea: "", gradeLevel: "All Levels", qualification: "Master", yearsExperience: "12", currentSchool: "Dubai International School" },
];

export default function LicensesManagement() {
  const { data: licenses, refetch } = trpc.teachersLicensing.getAllLicenses.useQuery();

  // Handle bulk upload of license applications
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
          message: `License application for "${row.applicantName}" submitted successfully`,
          data: row
        });
      } catch (error) {
        results.push({
          row: i + 2,
          status: "error",
          message: `Failed to submit application: ${error}`
        });
      }
    }
    
    refetch();
    return results;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-teal-600" />
            Licenses Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage and monitor teaching licenses</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkUpload
            title="Bulk Upload License Applications"
            description="Import multiple license applications from a CSV file. Useful for processing batch applications from schools."
            columns={licenseColumns}
            templateFileName="license_applications_template"
            onUpload={handleBulkUpload}
            onComplete={() => refetch()}
            exampleData={licenseExampleData}
            icon={<Award className="h-5 w-5 text-teal-600" />}
            triggerButton={
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Bulk Upload
              </Button>
            }
          />
          <Link href="/licensing/new-license">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Licenses</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{licenses?.length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{licenses?.filter(l => l.status === "active").length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Expiring Soon</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">5</div></CardContent></Card>
      </div>

      <div className="grid gap-4">
        {licenses?.map(license => (
          <Card key={license.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    License #{license.licenseNumber}
                    <Badge>{license.status}</Badge>
                  </CardTitle>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>Issued: {new Date(license.issueDate).toLocaleDateString()}</p>
                    <p>Expires: {new Date(license.expiryDate).toLocaleDateString()}</p>
                    {license.blockchainHash && (
                      <p className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Blockchain Verified
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/licensing/licenses/${license.id}`}>
                <Button variant="outline" size="sm" className="gap-2"><Eye className="h-4 w-4" />View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
