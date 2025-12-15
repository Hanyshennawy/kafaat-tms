import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, User, Star, MessageSquare, Target, Award, TrendingUp, CheckCircle2, AlertCircle, Save, Send } from "lucide-react";

const TEAM_MEMBERS = [
  { id: 1, name: "Sara Abdullah", role: "Expert Teacher", department: "Science", selfAppraisalStatus: "completed", rating: null },
  { id: 2, name: "Khalid Omar", role: "Teacher T1", department: "English", selfAppraisalStatus: "completed", rating: 4.2 },
  { id: 3, name: "Noura Ahmed", role: "Teacher", department: "Arabic", selfAppraisalStatus: "pending", rating: null },
  { id: 4, name: "Hassan Ibrahim", role: "Assistant Teacher", department: "Physical Education", selfAppraisalStatus: "completed", rating: 3.8 },
];

const REVIEW_CRITERIA = [
  { id: "teaching", name: "Teaching & Instruction", description: "Quality of lesson delivery, student engagement, and pedagogical skills", weight: 25 },
  { id: "knowledge", name: "Subject Matter Expertise", description: "Depth of subject knowledge and ability to explain complex concepts", weight: 20 },
  { id: "assessment", name: "Assessment & Feedback", description: "Quality of student assessments and constructive feedback", weight: 15 },
  { id: "classroom", name: "Classroom Management", description: "Ability to maintain discipline and create positive learning environment", weight: 15 },
  { id: "collaboration", name: "Collaboration & Teamwork", description: "Working effectively with colleagues and contributing to team goals", weight: 10 },
  { id: "professional", name: "Professional Development", description: "Commitment to continuous learning and skill enhancement", weight: 10 },
  { id: "communication", name: "Communication Skills", description: "Effective communication with students, parents, and colleagues", weight: 5 },
];

export default function ManagerReview() {
  const [selectedTeamMember, setSelectedTeamMember] = useState<typeof TEAM_MEMBERS[0] | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [overallComments, setOverallComments] = useState("");

  const pendingReviews = TEAM_MEMBERS.filter(m => m.selfAppraisalStatus === "completed" && !m.rating);
  const completedReviews = TEAM_MEMBERS.filter(m => m.rating !== null);

  const calculateOverallRating = () => {
    const totalWeight = REVIEW_CRITERIA.reduce((sum, c) => sum + c.weight, 0);
    const weightedSum = REVIEW_CRITERIA.reduce((sum, c) => {
      const rating = ratings[c.id] || 0;
      return sum + (rating * c.weight);
    }, 0);
    return totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : "0.0";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manager Review</h1>
          <p className="text-muted-foreground">Conduct performance reviews for your team members</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          {pendingReviews.length} reviews pending
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Select a team member to review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Tabs defaultValue="pending">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="pending">Pending ({pendingReviews.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedReviews.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="space-y-2 mt-4">
                {pendingReviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">All reviews completed!</p>
                ) : (
                  pendingReviews.map(member => (
                    <div
                      key={member.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${selectedTeamMember?.id === member.id ? "border-primary bg-primary/5" : ""}`}
                      onClick={() => setSelectedTeamMember(member)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
              <TabsContent value="completed" className="space-y-2 mt-4">
                {completedReviews.map(member => (
                  <div key={member.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Badge variant="default" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />{member.rating}
                      </Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card className="lg:col-span-2">
          {!selectedTeamMember ? (
            <CardContent className="flex flex-col items-center justify-center h-96 text-center">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Select a Team Member</h3>
              <p className="text-muted-foreground">Choose a team member from the list to start their review</p>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">{selectedTeamMember.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedTeamMember.name}</CardTitle>
                      <CardDescription>{selectedTeamMember.role} • {selectedTeamMember.department}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Overall Rating</p>
                    <p className="text-3xl font-bold text-primary">{calculateOverallRating()}/5</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rating Criteria */}
                <div className="space-y-4">
                  {REVIEW_CRITERIA.map(criteria => (
                    <div key={criteria.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{criteria.name}</p>
                          <p className="text-sm text-muted-foreground">{criteria.description}</p>
                        </div>
                        <Badge variant="outline">Weight: {criteria.weight}%</Badge>
                      </div>
                      <RadioGroup
                        value={ratings[criteria.id]?.toString() || ""}
                        onValueChange={(value) => setRatings({ ...ratings, [criteria.id]: parseInt(value) })}
                        className="flex gap-4"
                      >
                        {[1, 2, 3, 4, 5].map(rating => (
                          <div key={rating} className="flex items-center space-x-2">
                            <RadioGroupItem value={rating.toString()} id={`${criteria.id}-${rating}`} />
                            <Label htmlFor={`${criteria.id}-${rating}`} className="cursor-pointer">
                              {rating} - {rating === 1 ? "Poor" : rating === 2 ? "Below Avg" : rating === 3 ? "Average" : rating === 4 ? "Good" : "Excellent"}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <Textarea
                        placeholder="Add specific comments for this competency..."
                        value={comments[criteria.id] || ""}
                        onChange={(e) => setComments({ ...comments, [criteria.id]: e.target.value })}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>

                {/* Overall Comments */}
                <div className="space-y-2">
                  <Label className="text-lg font-medium">Overall Comments & Development Recommendations</Label>
                  <Textarea
                    placeholder="Provide overall feedback, strengths, areas for improvement, and development recommendations..."
                    value={overallComments}
                    onChange={(e) => setOverallComments(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline"><Save className="h-4 w-4 mr-2" />Save Draft</Button>
                  <Button><Send className="h-4 w-4 mr-2" />Submit Review</Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
