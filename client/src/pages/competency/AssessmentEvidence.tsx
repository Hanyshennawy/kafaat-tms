import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp } from "lucide-react";

export default function AssessmentEvidence() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Assessment Evidence</h1>
      <p className="text-muted-foreground mb-8">
        Upload and manage evidence for competency assessments
      </p>
      <Card>
        <CardContent className="py-12 text-center">
          <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="mb-2">Assessment Evidence</CardTitle>
          <CardDescription>
            Evidence upload and verification interface
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
