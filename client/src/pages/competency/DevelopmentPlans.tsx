import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function DevelopmentPlans() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Development Plans</h1>
      <p className="text-muted-foreground mb-8">
        Create and manage competency development plans
      </p>
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="mb-2">Development Plans</CardTitle>
          <CardDescription>
            Competency development planning interface
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
