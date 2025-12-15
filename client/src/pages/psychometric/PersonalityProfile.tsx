import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

export default function PersonalityProfile() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Personality Profile</h1>
      <p className="text-muted-foreground mb-8">
        Your comprehensive personality trait analysis
      </p>

      <Card>
        <CardContent className="py-12 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="mb-2">Personality Profile</CardTitle>
          <CardDescription>
            Big Five personality traits and detailed analysis
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
