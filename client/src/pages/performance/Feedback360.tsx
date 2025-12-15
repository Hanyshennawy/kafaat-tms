import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Users, MessageSquare, Star, TrendingUp, Send,
  CheckCircle2, Clock, UserCircle, GraduationCap,
  Briefcase, Target, Award
} from "lucide-react";
import { toast } from "sonner";

interface FeedbackRequest {
  id: number;
  requester: string;
  role: string;
  relationship: string;
  status: "pending" | "completed";
  dueDate: string;
}

interface CompetencyRating {
  name: string;
  selfRating: number;
  peerRating: number;
  managerRating: number;
  subordinateRating: number;
}

export default function Feedback360() {
  const [activeTab, setActiveTab] = useState("overview");
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("");

  // Demo feedback requests
  const pendingRequests: FeedbackRequest[] = [
    { id: 1, requester: "Ahmed Al Rashid", role: "Head of Subject", relationship: "manager", status: "pending", dueDate: "2024-12-20" },
    { id: 2, requester: "Fatima Hassan", role: "Expert Teacher", relationship: "peer", status: "pending", dueDate: "2024-12-22" },
    { id: 3, requester: "Omar Khalid", role: "Teacher", relationship: "subordinate", status: "pending", dueDate: "2024-12-25" },
  ];

  const completedFeedback = [
    { id: 4, requester: "Sarah Al Maktoum", role: "Teacher T1", relationship: "peer", completedDate: "2024-11-15" },
    { id: 5, requester: "Mohammed Ali", role: "Assistant Teacher", relationship: "subordinate", completedDate: "2024-11-10" },
  ];

  // Demo competency ratings
  const competencyRatings: CompetencyRating[] = [
    { name: "Teaching Excellence", selfRating: 4.2, peerRating: 4.0, managerRating: 4.5, subordinateRating: 4.3 },
    { name: "Student Engagement", selfRating: 4.5, peerRating: 4.2, managerRating: 4.3, subordinateRating: 4.6 },
    { name: "Curriculum Development", selfRating: 3.8, peerRating: 4.0, managerRating: 3.9, subordinateRating: 4.0 },
    { name: "Collaboration", selfRating: 4.0, peerRating: 4.4, managerRating: 4.2, subordinateRating: 4.1 },
    { name: "Leadership", selfRating: 3.5, peerRating: 3.8, managerRating: 4.0, subordinateRating: 4.2 },
    { name: "Communication", selfRating: 4.3, peerRating: 4.5, managerRating: 4.4, subordinateRating: 4.3 },
  ];

  const overallScores = {
    self: 4.05,
    peers: 4.15,
    manager: 4.22,
    subordinates: 4.25,
    overall: 4.17,
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim() || !selectedRating) {
      toast.error("Please provide a rating and feedback");
      return;
    }
    toast.success("Feedback submitted successfully");
    setFeedbackText("");
    setSelectedRating("");
  };

  const getRelationshipIcon = (rel: string) => {
    switch (rel) {
      case "manager": return <Briefcase className="h-4 w-4" />;
      case "peer": return <Users className="h-4 w-4" />;
      case "subordinate": return <GraduationCap className="h-4 w-4" />;
      default: return <UserCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-indigo-600" />
            360° Feedback
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive feedback from managers, peers, and subordinates
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Overall Score: <span className="font-bold ml-1">{overallScores.overall}</span>/5.0
        </Badge>
      </div>

      {/* Score Overview Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Self Assessment", score: overallScores.self, icon: UserCircle, color: "text-blue-600" },
          { label: "Peer Feedback", score: overallScores.peers, icon: Users, color: "text-green-600" },
          { label: "Manager Review", score: overallScores.manager, icon: Briefcase, color: "text-purple-600" },
          { label: "Team Feedback", score: overallScores.subordinates, icon: GraduationCap, color: "text-amber-600" },
          { label: "Overall", score: overallScores.overall, icon: Star, color: "text-indigo-600" },
        ].map((item, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6 text-center">
              <item.icon className={`h-8 w-8 mx-auto ${item.color} mb-2`} />
              <p className="text-2xl font-bold">{item.score.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="give">Give Feedback</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competency Ratings by Source</CardTitle>
              <CardDescription>Compare self-assessment with feedback from others</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {competencyRatings.map((comp, idx) => {
                  const avg = (comp.selfRating + comp.peerRating + comp.managerRating + comp.subordinateRating) / 4;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{comp.name}</span>
                        <span className="text-sm text-muted-foreground">Avg: {avg.toFixed(1)}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Self</span>
                            <span>{comp.selfRating}</span>
                          </div>
                          <Progress value={comp.selfRating * 20} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Peers</span>
                            <span>{comp.peerRating}</span>
                          </div>
                          <Progress value={comp.peerRating * 20} className="h-2 [&>div]:bg-green-500" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Manager</span>
                            <span>{comp.managerRating}</span>
                          </div>
                          <Progress value={comp.managerRating * 20} className="h-2 [&>div]:bg-purple-500" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Team</span>
                            <span>{comp.subordinateRating}</span>
                          </div>
                          <Progress value={comp.subordinateRating * 20} className="h-2 [&>div]:bg-amber-500" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Requests Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{request.requester.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{request.requester}</h4>
                      <p className="text-sm text-muted-foreground">{request.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="gap-1">
                      {getRelationshipIcon(request.relationship)}
                      {request.relationship}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Due: {request.dueDate}</p>
                    </div>
                    <Button size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Provide Feedback
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Give Feedback Tab */}
        <TabsContent value="give" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provide Feedback</CardTitle>
              <CardDescription>Select a colleague and provide constructive feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Overall Rating</Label>
                <RadioGroup value={selectedRating} onValueChange={setSelectedRating} className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                      <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 cursor-pointer">
                        {rating}
                        <Star className={`h-4 w-4 ${parseInt(selectedRating) >= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Detailed Feedback</Label>
                <Textarea
                  placeholder="Provide specific examples and constructive feedback..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={6}
                />
              </div>
              <Button onClick={handleSubmitFeedback}>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {completedFeedback.map((feedback) => (
            <Card key={feedback.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{feedback.requester.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{feedback.requester}</h4>
                      <p className="text-sm text-muted-foreground">{feedback.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-100 text-green-700 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </Badge>
                    <p className="text-sm text-muted-foreground">{feedback.completedDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
