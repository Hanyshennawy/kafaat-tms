import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function CompetencyStandards() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Competency Standards</h1>
      <p className="text-muted-foreground mb-8">
        View and manage competency standards within frameworks
      </p>
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="mb-2">Competency Standards</CardTitle>
          <CardDescription>
            Detailed competency standards management interface
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
