import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function CognitiveAbility() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Cognitive Ability Assessment</h1>
      <p className="text-muted-foreground mb-8">
        Cognitive ability test results and analysis
      </p>

      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="mb-2">Cognitive Ability Scores</CardTitle>
          <CardDescription>
            Verbal, numerical, and abstract reasoning scores
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
