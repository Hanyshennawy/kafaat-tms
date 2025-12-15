import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Plus, Calendar, Clock, Award, FileText, CheckCircle2, AlertCircle, Upload, ExternalLink, Filter } from "lucide-react";

const CPD_CATEGORIES = [
  { id: "pedagogical", name: "Pedagogical Skills", required: 20, completed: 15 },
  { id: "subject", name: "Subject Matter Expertise", required: 15, completed: 12 },
  { id: "technology", name: "Educational Technology", required: 10, completed: 10 },
  { id: "leadership", name: "Leadership & Management", required: 10, completed: 5 },
  { id: "wellbeing", name: "Student Wellbeing", required: 5, completed: 5 },
];

const CPD_RECORDS = [
  { id: 1, title: "Advanced Teaching Strategies Workshop", category: "Pedagogical Skills", provider: "UAE Ministry of Education", date: "2024-01-10", hours: 8, status: "approved", certificate: true },
  { id: 2, title: "Digital Learning Tools Certification", category: "Educational Technology", provider: "Google for Education", date: "2024-01-05", hours: 10, status: "approved", certificate: true },
  { id: 3, title: "Classroom Management Masterclass", category: "Pedagogical Skills", provider: "British Council", date: "2023-12-15", hours: 6, status: "approved", certificate: true },
  { id: 4, title: "STEM Education Conference", category: "Subject Matter Expertise", provider: "ADEK", date: "2023-12-01", hours: 12, status: "approved", certificate: true },
  { id: 5, title: "Inclusive Education Training", category: "Student Wellbeing", provider: "KHDA", date: "2023-11-20", hours: 5, status: "approved", certificate: true },
  { id: 6, title: "Department Head Leadership Program", category: "Leadership & Management", provider: "Internal Training", date: "2024-01-12", hours: 5, status: "pending", certificate: false },
];

export default function CpdRecords() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const totalRequired = CPD_CATEGORIES.reduce((sum, c) => sum + c.required, 0);
  const totalCompleted = CPD_CATEGORIES.reduce((sum, c) => sum + c.completed, 0);
  const progressPercentage = Math.round((totalCompleted / totalRequired) * 100);

  const filteredRecords = categoryFilter === "all" 
    ? CPD_RECORDS 
    : CPD_RECORDS.filter(r => r.category === categoryFilter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CPD Records</h1>
          <p className="text-muted-foreground">Track your Continuing Professional Development hours and certifications</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add CPD Activity</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Record CPD Activity</DialogTitle>
              <DialogDescription>Add a new professional development activity to your record</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Activity Title</Label>
                <Input placeholder="e.g., Teaching Strategies Workshop" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {CPD_CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CPD Hours</Label>
                  <Input type="number" placeholder="Hours completed" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Provider/Organization</Label>
                <Input placeholder="e.g., Ministry of Education" />
              </div>
              <div className="space-y-2">
                <Label>Date Completed</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Brief description of the activity..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Certificate (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload certificate or proof of completion</p>
                  <Button variant="outline" size="sm" className="mt-2">Choose File</Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Submit for Approval</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Annual CPD Progress</CardTitle>
              <CardDescription>Track your progress towards the annual CPD requirement</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{totalCompleted}/{totalRequired}</p>
              <p className="text-sm text-muted-foreground">hours completed</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-4" />
          <p className="text-sm text-muted-foreground mt-2">
            {progressPercentage >= 100 ? (
              <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" />Annual CPD requirement met!</span>
            ) : (
              <span className="flex items-center gap-1"><AlertCircle className="h-4 w-4 text-yellow-500" />{totalRequired - totalCompleted} hours remaining to meet annual requirement</span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {CPD_CATEGORIES.map(category => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <Badge variant={category.completed >= category.required ? "default" : "secondary"}>
                  {category.completed}/{category.required}h
                </Badge>
              </div>
              <p className="text-sm font-medium">{category.name}</p>
              <Progress value={(category.completed / category.required) * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CPD Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>CPD Activity Log</CardTitle>
              <CardDescription>All recorded professional development activities</CardDescription>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CPD_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Certificate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map(record => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.title}</TableCell>
                  <TableCell><Badge variant="outline">{record.category}</Badge></TableCell>
                  <TableCell>{record.provider}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {record.hours}h
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.status === "approved" ? "default" : "secondary"}>
                      {record.status === "approved" ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" />Approved</>
                      ) : (
                        "Pending"
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.certificate ? (
                      <Button variant="ghost" size="sm"><FileText className="h-4 w-4 mr-1" />View</Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upcoming Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended CPD Opportunities</CardTitle>
          <CardDescription>Based on your current progress and development needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Educational Leadership Certificate", category: "Leadership & Management", provider: "UAE MOE", date: "Feb 15, 2024", hours: 8, link: "#" },
              { title: "Differentiated Instruction Workshop", category: "Pedagogical Skills", provider: "British Council", date: "Feb 20, 2024", hours: 5, link: "#" },
              { title: "Data-Driven Teaching Strategies", category: "Subject Matter Expertise", provider: "ADEK", date: "Mar 1, 2024", hours: 6, link: "#" },
            ].map((opp, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{opp.category}</Badge>
                  <span className="text-sm text-muted-foreground">{opp.hours}h</span>
                </div>
                <h4 className="font-medium">{opp.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{opp.provider} • {opp.date}</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />Learn More
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
