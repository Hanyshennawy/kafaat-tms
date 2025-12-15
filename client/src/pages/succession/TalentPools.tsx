import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function TalentPools() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPool, setNewPool] = useState({ name: "", description: "" });
  
  const { data: pools, refetch } = trpc.successionPlanning.getAllTalentPools.useQuery();
  const createPool = trpc.successionPlanning.createTalentPool.useMutation({
    onSuccess: () => {
      toast.success("Talent pool created");
      setIsCreateDialogOpen(false);
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Talent Pools</h1>
          <p className="text-muted-foreground mt-1">Manage high-potential employee groups</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Pool</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Talent Pool</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pool Name *</Label>
                <Input placeholder="e.g., Leadership Pipeline" value={newPool.name} onChange={(e) => setNewPool({ ...newPool, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Pool description" value={newPool.description} onChange={(e) => setNewPool({ ...newPool, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createPool.mutate(newPool)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pools?.map(pool => (
          <Card key={pool.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {pool.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{pool.description}</p>
              <Button variant="outline" size="sm" className="mt-4 w-full">Manage Members</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
