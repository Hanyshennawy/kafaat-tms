import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { GraduationCap, Plus, Search, Award, TrendingUp, Target, Star, BookOpen, Users, Brain, CheckCircle2 } from "lucide-react";

const SKILL_CATEGORIES = [
  { id: "teaching", name: "Teaching & Pedagogy", icon: GraduationCap },
  { id: "subject", name: "Subject Expertise", icon: BookOpen },
  { id: "technology", name: "EdTech & Digital", icon: Brain },
  { id: "leadership", name: "Leadership", icon: Users },
  { id: "soft", name: "Soft Skills", icon: Star },
];

const MY_SKILLS = [
  { id: 1, name: "Differentiated Instruction", category: "teaching", level: 90, verified: true, endorsements: 12 },
  { id: 2, name: "Mathematics Curriculum", category: "subject", level: 95, verified: true, endorsements: 18 },
  { id: 3, name: "Classroom Management", category: "teaching", level: 85, verified: true, endorsements: 8 },
  { id: 4, name: "Student Assessment", category: "teaching", level: 88, verified: true, endorsements: 10 },
  { id: 5, name: "Google Workspace for Education", category: "technology", level: 80, verified: false, endorsements: 6 },
  { id: 6, name: "Interactive Whiteboard", category: "technology", level: 75, verified: false, endorsements: 4 },
  { id: 7, name: "Team Collaboration", category: "soft", level: 85, verified: true, endorsements: 9 },
  { id: 8, name: "Parent Communication", category: "soft", level: 82, verified: false, endorsements: 5 },
  { id: 9, name: "Mentoring Junior Teachers", category: "leadership", level: 78, verified: false, endorsements: 3 },
];

const RECOMMENDED_SKILLS = [
  { name: "Data-Driven Instruction", category: "teaching", relevance: 95, reason: "High demand for Expert Teacher role" },
  { name: "IB Mathematics", category: "subject", relevance: 88, reason: "School expanding IB program" },
  { name: "Educational Research Methods", category: "teaching", relevance: 82, reason: "Required for curriculum development" },
  { name: "Learning Management Systems", category: "technology", relevance: 78, reason: "Trending skill in education" },
];

const SKILL_GAPS = [
  { skill: "Curriculum Development", required: 85, current: 60, forRole: "Head of Subject" },
  { skill: "Educational Leadership", required: 80, current: 55, forRole: "Head of Subject" },
  { skill: "Budget Management", required: 70, current: 30, forRole: "Head of Subject" },
];

export default function EmployeeSkills() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);

  const filteredSkills = MY_SKILLS.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || skill.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getSkillLevelLabel = (level: number) => {
    if (level >= 90) return "Expert";
    if (level >= 75) return "Advanced";
    if (level >= 50) return "Intermediate";
    return "Beginner";
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 90) return "text-green-600";
    if (level >= 75) return "text-blue-600";
    if (level >= 50) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skills & Competencies</h1>
          <p className="text-muted-foreground">Manage and develop your professional skills</p>
        </div>
        <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Skill</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
              <DialogDescription>Add a skill to your profile</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Skill Name</Label>
                <Input placeholder="e.g., Project-Based Learning" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {SKILL_CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proficiency Level: 75%</Label>
                <Slider defaultValue={[75]} max={100} step={5} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddSkillOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddSkillOpen(false)}>Add Skill</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><GraduationCap className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Skills</p>
                <p className="text-2xl font-bold">{MY_SKILLS.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{MY_SKILLS.filter(s => s.verified).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><Star className="h-5 w-5 text-yellow-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Endorsements</p>
                <p className="text-2xl font-bold">{MY_SKILLS.reduce((sum, s) => sum + s.endorsements, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Level</p>
                <p className="text-2xl font-bold">{Math.round(MY_SKILLS.reduce((sum, s) => sum + s.level, 0) / MY_SKILLS.length)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="myskills">
        <TabsList>
          <TabsTrigger value="myskills">My Skills</TabsTrigger>
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="myskills" className="space-y-4 mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search skills..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {SKILL_CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map(skill => {
              const category = SKILL_CATEGORIES.find(c => c.id === skill.category);
              return (
                <Card key={skill.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {category && <category.icon className="h-5 w-5 text-primary" />}
                        <h4 className="font-medium">{skill.name}</h4>
                      </div>
                      {skill.verified && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />Verified
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={getSkillLevelColor(skill.level)}>{getSkillLevelLabel(skill.level)}</span>
                        <span className="text-muted-foreground">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3" />{skill.endorsements} endorsements
                      </span>
                      <Button variant="ghost" size="sm">Update</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Skill Gaps for Career Goals</CardTitle>
              <CardDescription>Skills you need to develop for your target role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {SKILL_GAPS.map((gap, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{gap.skill}</h4>
                        <p className="text-sm text-muted-foreground">Required for: {gap.forRole}</p>
                      </div>
                      <Badge variant="outline" className="text-red-600">
                        Gap: {gap.required - gap.current}%
                      </Badge>
                    </div>
                    <div className="relative">
                      <Progress value={gap.current} className="h-4" />
                      <div 
                        className="absolute top-0 h-4 border-r-2 border-red-500"
                        style={{ left: `${gap.required}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Current: {gap.current}%</span>
                      <span className="text-red-600">Required: {gap.required}%</span>
                    </div>
                    <Button variant="outline" size="sm">Find Training</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommended" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Recommended Skills</CardTitle>
              <CardDescription>Skills that would benefit your career growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {RECOMMENDED_SKILLS.map((skill, index) => {
                  const category = SKILL_CATEGORIES.find(c => c.id === skill.category);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {category && (
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <category.icon className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">{skill.name}</h4>
                          <p className="text-sm text-muted-foreground">{skill.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{skill.relevance}% match</Badge>
                        <Button size="sm">Add to Skills</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
