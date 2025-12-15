import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, MapPin, Award, Heart, Plus, Filter, Star, ThumbsUp, MessageCircle, Share2 } from "lucide-react";

const DEMO_ACTIVITIES = [
  {
    id: 1,
    title: "Teacher Appreciation Day Celebration",
    type: "recognition",
    date: "2024-02-05",
    time: "3:00 PM - 5:00 PM",
    location: "School Auditorium",
    participants: 85,
    maxParticipants: 100,
    status: "upcoming",
    description: "Annual celebration honoring our dedicated educators with awards and performances",
    organizer: "HR Department",
    likes: 45,
    comments: 12,
  },
  {
    id: 2,
    title: "Staff Wellness Workshop",
    type: "wellness",
    date: "2024-01-25",
    time: "2:00 PM - 4:00 PM",
    location: "Conference Room A",
    participants: 32,
    maxParticipants: 40,
    status: "upcoming",
    description: "Workshop on stress management and work-life balance for educators",
    organizer: "Wellness Committee",
    likes: 28,
    comments: 8,
  },
  {
    id: 3,
    title: "Department Team Building Day",
    type: "team-building",
    date: "2024-01-18",
    time: "9:00 AM - 3:00 PM",
    location: "Offsite - Beach Resort",
    participants: 25,
    maxParticipants: 30,
    status: "completed",
    description: "Fun team activities and bonding exercises for Science & Math departments",
    organizer: "Department Heads",
    likes: 52,
    comments: 18,
  },
  {
    id: 4,
    title: "Monthly Staff Birthday Celebration",
    type: "celebration",
    date: "2024-01-31",
    time: "12:30 PM - 1:30 PM",
    location: "Staff Lounge",
    participants: 60,
    maxParticipants: 100,
    status: "upcoming",
    description: "Celebrating all January birthdays with cake and refreshments",
    organizer: "Social Committee",
    likes: 35,
    comments: 5,
  },
  {
    id: 5,
    title: "Professional Learning Community Meeting",
    type: "professional",
    date: "2024-01-22",
    time: "3:30 PM - 5:00 PM",
    location: "Library",
    participants: 18,
    maxParticipants: 25,
    status: "upcoming",
    description: "Collaborative session on innovative teaching strategies",
    organizer: "Academic Affairs",
    likes: 22,
    comments: 7,
  },
];

const ACTIVITY_TYPES = [
  { value: "recognition", label: "Recognition", icon: Award, color: "bg-yellow-100 text-yellow-800" },
  { value: "wellness", label: "Wellness", icon: Heart, color: "bg-pink-100 text-pink-800" },
  { value: "team-building", label: "Team Building", icon: Users, color: "bg-blue-100 text-blue-800" },
  { value: "celebration", label: "Celebration", icon: Star, color: "bg-purple-100 text-purple-800" },
  { value: "professional", label: "Professional", icon: Calendar, color: "bg-green-100 text-green-800" },
];

export default function EngagementActivities() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredActivities = typeFilter === "all" 
    ? DEMO_ACTIVITIES 
    : DEMO_ACTIVITIES.filter(a => a.type === typeFilter);

  const getActivityType = (type: string) => ACTIVITY_TYPES.find(t => t.value === type);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Engagement Activities</h1>
          <p className="text-muted-foreground">Staff events, celebrations, and engagement programs</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Create Activity</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Activity</DialogTitle>
              <DialogDescription>Plan a new engagement activity for staff</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Activity Title</Label>
                <Input placeholder="Enter activity name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Participants</Label>
                  <Input type="number" placeholder="e.g., 50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Enter venue" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the activity..." rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Create Activity</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Calendar className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{DEMO_ACTIVITIES.filter(a => a.status === "upcoming").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><Users className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
                <p className="text-2xl font-bold">{DEMO_ACTIVITIES.reduce((sum, a) => sum + a.participants, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><ThumbsUp className="h-5 w-5 text-yellow-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total Engagement</p>
                <p className="text-2xl font-bold">{DEMO_ACTIVITIES.reduce((sum, a) => sum + a.likes, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Award className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{DEMO_ACTIVITIES.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Type Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant={typeFilter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setTypeFilter("all")}
            >
              All Activities
            </Button>
            {ACTIVITY_TYPES.map(type => (
              <Button
                key={type.value}
                variant={typeFilter === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(type.value)}
                className="flex items-center gap-1"
              >
                <type.icon className="h-4 w-4" />
                {type.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Tabs defaultValue="grid">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActivities.map(activity => {
              const activityType = getActivityType(activity.type);
              return (
                <Card key={activity.id} className="overflow-hidden">
                  <div className={`h-2 ${activityType?.color.split(" ")[0] || "bg-gray-100"}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={activityType?.color}>{activityType?.label}</Badge>
                      <Badge variant={activity.status === "upcoming" ? "default" : "secondary"}>
                        {activity.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{activity.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{activity.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{activity.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{activity.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{activity.participants}/{activity.maxParticipants} participants</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />{activity.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />{activity.comments}
                        </span>
                      </div>
                      {activity.status === "upcoming" ? (
                        <Button size="sm">Join</Button>
                      ) : (
                        <Button variant="outline" size="sm">View Photos</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>Calendar view coming soon</p>
                <p className="text-sm">Switch to Grid View to see activities</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
