#!/bin/bash

# Career Paths page
cat > client/src/pages/career/CareerPaths.tsx << 'EOF'
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, TrendingUp, Eye } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CareerPaths() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPath, setNewPath] = useState({ name: "", description: "" });

  const { data: careerPaths, isLoading, refetch } = trpc.careerProgression.getAllPaths.useQuery();
  const createPath = trpc.careerProgression.createPath.useMutation({
    onSuccess: () => {
      toast.success("Career path created successfully");
      setIsCreateDialogOpen(false);
      setNewPath({ name: "", description: "" });
      refetch();
    },
  });

  const filteredPaths = careerPaths?.filter(path =>
    path.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            Career Paths
          </h1>
          <p className="text-muted-foreground mt-1">Define and manage career progression paths</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Create Career Path</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Career Path</DialogTitle>
              <DialogDescription>Define a new career progression path</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Career Path Name *</Label>
                <Input id="name" placeholder="e.g., Software Engineer Track" value={newPath.name} onChange={(e) => setNewPath({ ...newPath, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the career path" value={newPath.description} onChange={(e) => setNewPath({ ...newPath, description: e.target.value })} rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => createPath.mutate(newPath)} disabled={createPath.isPending}>
                {createPath.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search career paths..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-12">Loading...</div>
        ) : filteredPaths && filteredPaths.length > 0 ? (
          filteredPaths.map((path) => (
            <Card key={path.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{path.name}</CardTitle>
                <CardDescription className="line-clamp-2">{path.description || "No description"}</CardDescription>
                <Badge className="w-fit mt-2">{path.status}</Badge>
              </CardHeader>
              <CardContent>
                <Link href={`/career/paths/${path.id}`}>
                  <Button variant="outline" size="sm" className="gap-2 w-full">
                    <Eye className="h-4 w-4" />View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No career paths found</h3>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 mt-4">
                <Plus className="h-4 w-4" />Create Career Path
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
EOF

echo "Career Paths page created"

# Skills page
cat > client/src/pages/career/Skills.tsx << 'EOF'
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

  const categories = [...new Set(skills?.map(s => s.category).filter(Boolean))];

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
EOF

echo "Skills page created"

