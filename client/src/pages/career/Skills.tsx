import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Award } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Skills() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", category: "", description: "" });

  const { data: skills, isLoading, refetch } = trpc.careerProgression.getAllSkills.useQuery();
  const createSkill = trpc.careerProgression.createSkill.useMutation({
    onSuccess: () => {
      toast.success("Skill created successfully");
      setIsCreateDialogOpen(false);
      setNewSkill({ name: "", category: "", description: "" });
      refetch();
    },
  });

  const filteredSkills = skills?.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(skills?.map(s => s.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-blue-600" />
            Skills Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage organizational skills and competencies</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Skill</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Skill Name *</Label>
                <Input placeholder="e.g., Python Programming" value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input placeholder="e.g., Technical" value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Brief description" value={newSkill.description} onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createSkill.mutate(newSkill)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            <Input placeholder="Search skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {categories.map(category => {
          const categorySkills = filteredSkills?.filter(s => s.category === category);
          if (!categorySkills?.length) return null;
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category || "Uncategorized"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map(skill => (
                    <Badge key={skill.id} variant="secondary" className="text-sm py-1 px-3">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
