import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Eye, Mail, Phone, Upload, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { BulkUpload, BulkUploadColumn, BulkUploadResult } from "@/components/BulkUpload";

// Bulk upload configuration for candidates/applicants
const candidateColumns: BulkUploadColumn[] = [
  { key: "firstName", label: "First Name", required: true, type: "text", description: "Ahmed" },
  { key: "lastName", label: "Last Name", required: true, type: "text", description: "Al Rashid" },
  { key: "email", label: "Email", required: true, type: "email", description: "ahmed.rashid@email.com" },
  { key: "phone", label: "Phone", required: false, type: "text", description: "+971-50-123-4567" },
  { key: "position", label: "Applied Position", required: true, type: "text", description: "Mathematics Teacher" },
  { key: "experience", label: "Years of Experience", required: false, type: "number", description: "5" },
  { key: "education", label: "Education Level", required: false, type: "select", options: ["High School", "Bachelor", "Master", "PhD"], description: "Master" },
  { key: "currentEmployer", label: "Current Employer", required: false, type: "text", description: "ABC School" },
  { key: "expectedSalary", label: "Expected Salary (AED)", required: false, type: "number", description: "12000" },
  { key: "source", label: "Source", required: false, type: "select", options: ["LinkedIn", "Referral", "Job Portal", "Direct", "Career Fair"], description: "LinkedIn" },
];

const candidateExampleData = [
  { firstName: "Ahmed", lastName: "Al Rashid", email: "ahmed.rashid@email.com", phone: "+971-50-123-4567", position: "Mathematics Teacher", experience: "5", education: "Master", currentEmployer: "Al Noor School", expectedSalary: "12000", source: "LinkedIn" },
  { firstName: "Fatima", lastName: "Hassan", email: "fatima.h@email.com", phone: "+971-55-234-5678", position: "Science Teacher", experience: "3", education: "Bachelor", currentEmployer: "Emirates Academy", expectedSalary: "10000", source: "Referral" },
  { firstName: "Mohammed", lastName: "Khan", email: "m.khan@email.com", phone: "+971-52-345-6789", position: "English Teacher", experience: "8", education: "Master", currentEmployer: "Dubai International School", expectedSalary: "15000", source: "Job Portal" },
];

export default function Candidates() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: candidates, refetch } = trpc.recruitment.getAllCandidates.useQuery();

  const filteredCandidates = candidates?.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle bulk upload of candidates
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
          message: `Candidate "${row.firstName} ${row.lastName}" added successfully`,
          data: row
        });
      } catch (error) {
        results.push({
          row: i + 2,
          status: "error",
          message: `Failed to add candidate: ${error}`
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
            <Users className="h-8 w-8 text-red-600" />
            Candidates
          </h1>
          <p className="text-muted-foreground mt-1">Manage job applicants and candidates</p>
        </div>
        <div className="flex items-center gap-2">
          <BulkUpload
            title="Bulk Upload Candidates"
            description="Import multiple job candidates/applicants from a CSV file."
            columns={candidateColumns}
            templateFileName="candidates_template"
            onUpload={handleBulkUpload}
            onComplete={() => refetch()}
            exampleData={candidateExampleData}
            icon={<Users className="h-5 w-5 text-red-600" />}
            triggerButton={
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Bulk Upload
              </Button>
            }
          />
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Candidate
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            <Input placeholder="Search candidates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredCandidates?.map(candidate => (
          <Card key={candidate.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {candidate.firstName} {candidate.lastName}
                    <Badge>{candidate.status}</Badge>
                  </CardTitle>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {candidate.email}
                    </div>
                    {candidate.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {candidate.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={`/recruitment/candidates/${candidate.id}`}>
                <Button variant="outline" size="sm" className="gap-2"><Eye className="h-4 w-4" />View Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
