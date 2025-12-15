import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AssessmentAnalytics() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Assessment Analytics</h1>
      <p className="text-muted-foreground mb-8">
        Comprehensive analytics on psychometric assessments
      </p>

      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="mb-2">Assessment Analytics</CardTitle>
          <CardDescription>
            Trends, comparisons, and insights from psychometric data
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
