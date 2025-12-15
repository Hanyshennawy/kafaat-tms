import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ResourceAllocations() {
  const { data: allocations } = trpc.workforcePlanning.getAllResourceAllocations.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resource Allocations</h1>
          <p className="text-muted-foreground mt-1">Manage employee project assignments</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />New Allocation</Button>
      </div>

      <div className="grid gap-4">
        {allocations?.map(allocation => (
          <Card key={allocation.id}>
            <CardHeader>
              <CardTitle className="text-lg">{allocation.projectName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(allocation.startDate).toLocaleDateString()}</span>
                </div>
                <div className="font-medium">{allocation.allocationPercentage}% allocated</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
