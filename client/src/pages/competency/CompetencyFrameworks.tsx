import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Calendar, CheckCircle2, Clock, Archive, Upload, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { BulkUpload, BulkUploadColumn, BulkUploadResult } from "@/components/BulkUpload";

// Bulk upload configuration for competency frameworks/standards
const competencyColumns: BulkUploadColumn[] = [
  { key: "frameworkName", label: "Framework Name", required: true, type: "text", description: "UAE Teacher Standards" },
  { key: "standardCode", label: "Standard Code", required: true, type: "text", description: "TS-001" },
  { key: "standardName", label: "Standard Name", required: true, type: "text", description: "Professional Knowledge" },
  { key: "description", label: "Description", required: true, type: "text", description: "Demonstrates deep subject knowledge" },
  { key: "domain", label: "Domain", required: false, type: "select", options: ["Knowledge", "Practice", "Engagement", "Leadership"], description: "Knowledge" },
  { key: "level", label: "Proficiency Level", required: false, type: "select", options: ["Foundation", "Developing", "Accomplished", "Expert"], description: "Developing" },
  { key: "indicators", label: "Performance Indicators", required: false, type: "text", description: "Evidence of subject mastery" },
];

const competencyExampleData = [
  { frameworkName: "UAE Teacher Standards 2024", standardCode: "TS-001", standardName: "Subject Knowledge", description: "Demonstrates comprehensive knowledge of the subject", domain: "Knowledge", level: "Developing", indicators: "Can explain complex concepts clearly" },
  { frameworkName: "UAE Teacher Standards 2024", standardCode: "TS-002", standardName: "Pedagogical Practice", description: "Uses effective teaching strategies", domain: "Practice", level: "Accomplished", indicators: "Implements differentiated instruction" },
  { frameworkName: "Leadership Framework", standardCode: "LS-001", standardName: "Strategic Vision", description: "Develops and communicates school vision", domain: "Leadership", level: "Expert", indicators: "Creates comprehensive strategic plans" },
];

/**
 * Competency Frameworks Management Page
 * Displays and manages competency frameworks
 */

export default function CompetencyFrameworks() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with tRPC query
  const frameworks = [
    {
      id: 1,
      name: "UAE Teacher Professional Standards Framework 2024",
      description: "Comprehensive framework defining professional standards for teachers in UAE public schools",
      version: "2.0",
      status: "active",
      effectiveDate: "2024-01-01",
      standardsCount: 45,
      educatorsCount: 1250,
    },
    {
      id: 2,
      name: "School Leadership Competency Framework",
      description: "Standards for school principals and educational leaders",
      version: "1.5",
      status: "active",
      effectiveDate: "2023-09-01",
      standardsCount: 32,
      educatorsCount: 180,
    },
    {
      id: 3,
      name: "Digital Pedagogy Competencies",
      description: "Framework for digital teaching and learning competencies",
      version: "1.0",
      status: "active",
      effectiveDate: "2024-03-01",
      standardsCount: 28,
      educatorsCount: 890,
    },
    {
      id: 4,
      name: "UAE Teacher Standards 2020",
      description: "Previous version of teacher professional standards",
      version: "1.0",
      status: "archived",
      effectiveDate: "2020-01-01",
      standardsCount: 38,
      educatorsCount: 0,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4" />;
      case "draft":
        return <Clock className="h-4 w-4" />;
      case "archived":
        return <Archive className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredFrameworks = frameworks.filter(
    (framework) =>
      framework.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      framework.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle bulk upload of competency standards
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
          message: `Standard "${row.standardCode}: ${row.standardName}" imported successfully`,
          data: row
        });
      } catch (error) {
        results.push({
          row: i + 2,
          status: "error",
          message: `Failed to import standard: ${error}`
        });
      }
    }
    
    toast.success(`Imported ${results.filter(r => r.status === "success").length} competency standards`);
    return results;
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Competency Frameworks</h1>
          <p className="text-muted-foreground">
            Manage and view competency frameworks for educators
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BulkUpload
            title="Bulk Upload Competency Standards"
            description="Import competency standards from a CSV file. You can upload standards for existing or new frameworks."
            columns={competencyColumns}
            templateFileName="competency_standards_template"
            onUpload={handleBulkUpload}
            exampleData={competencyExampleData}
            icon={<BookOpen className="h-5 w-5 text-blue-600" />}
            triggerButton={
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Bulk Upload
              </Button>
            }
          />
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Framework
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search frameworks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Frameworks</CardDescription>
            <CardTitle className="text-3xl">{frameworks.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Frameworks</CardDescription>
            <CardTitle className="text-3xl">
              {frameworks.filter((f) => f.status === "active").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Standards</CardDescription>
            <CardTitle className="text-3xl">
              {frameworks.reduce((sum, f) => sum + f.standardsCount, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Educators Assessed</CardDescription>
            <CardTitle className="text-3xl">
              {frameworks.reduce((sum, f) => sum + f.educatorsCount, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Frameworks List */}
      <div className="grid gap-6">
        {filteredFrameworks.map((framework) => (
          <Card key={framework.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{framework.name}</CardTitle>
                    <Badge className={getStatusColor(framework.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(framework.status)}
                        {framework.status}
                      </span>
                    </Badge>
                  </div>
                  <CardDescription>{framework.description}</CardDescription>
                </div>
                <Link href={`/competency/frameworks/${framework.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Version</div>
                  <div className="font-medium">{framework.version}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Effective Date
                  </div>
                  <div className="font-medium">
                    {new Date(framework.effectiveDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Standards
                  </div>
                  <div className="font-medium">{framework.standardsCount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Educators</div>
                  <div className="font-medium">{framework.educatorsCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFrameworks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No frameworks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search query"
                : "Get started by creating your first competency framework"}
            </p>
            {!searchQuery && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Framework
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
