import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Briefcase, Calendar, ChevronRight, 
  UserPlus, FileText, Clock, CheckCircle, XCircle,
  Search, Filter, Video, Mail, Phone, Star, Sparkles
} from "lucide-react";
import { Link } from "wouter";

interface RecruiterDashboardProps {
  userName: string;
}

export function RecruiterDashboard({ userName }: RecruiterDashboardProps) {
  // Recruiter metrics
  const recruiterStats = {
    openPositions: 18,
    totalCandidates: 245,
    newApplications: 34,
    interviewsThisWeek: 12,
    offersExtended: 5,
    hiredThisMonth: 8,
    timeToHire: 23,
    offerAcceptanceRate: 85,
  };

  // Pipeline overview
  const pipelineData = [
    { stage: "Applied", count: 78, color: "bg-blue-500" },
    { stage: "Screening", count: 45, color: "bg-yellow-500" },
    { stage: "Interview", count: 28, color: "bg-purple-500" },
    { stage: "Offer", count: 12, color: "bg-green-500" },
  ];

  // Upcoming interviews
  const upcomingInterviews = [
    {
      candidate: "Sarah Ahmed",
      position: "Senior Teacher",
      time: "Today, 2:00 PM",
      type: "video",
      initials: "SA"
    },
    {
      candidate: "Mohammed Ali",
      position: "Administrator",
      time: "Today, 4:30 PM",
      type: "in-person",
      initials: "MA"
    },
    {
      candidate: "Fatima Hassan",
      position: "Science Teacher",
      time: "Tomorrow, 10:00 AM",
      type: "video",
      initials: "FH"
    },
  ];

  // Pending tasks
  const pendingTasks = [
    {
      id: 1,
      icon: FileText,
      title: "Review Applications",
      description: "New applications waiting for screening",
      link: "/recruitment/candidates",
      count: 34,
      priority: "high",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 2,
      icon: Calendar,
      title: "Schedule Interviews",
      description: "Candidates ready for interviews",
      link: "/recruitment/interviews",
      count: 15,
      priority: "medium",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      id: 3,
      icon: UserPlus,
      title: "Onboarding Tasks",
      description: "New hires pending onboarding",
      link: "/recruitment/candidates",
      count: 8,
      priority: "medium",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: 4,
      icon: Mail,
      title: "Send Offers",
      description: "Approved offers to be sent",
      link: "/recruitment/candidates",
      count: 3,
      priority: "high",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
  ];

  // Quick actions
  const quickActions = [
    { icon: Briefcase, label: "Post Job", link: "/recruitment/requisitions", color: "text-blue-600" },
    { icon: Search, label: "Search Candidates", link: "/recruitment/candidates", color: "text-purple-600" },
    { icon: Calendar, label: "Interviews", link: "/recruitment/interviews", color: "text-green-600" },
    { icon: Filter, label: "Dashboard", link: "/recruitment/dashboard", color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recruitment Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}</p>
        </div>
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          <Users className="h-3 w-3 mr-1" />
          Recruiter
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recruiterStats.openPositions}</div>
            <p className="text-xs text-muted-foreground">Across departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Applications</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recruiterStats.newApplications}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recruiterStats.interviewsThisWeek}</div>
            <p className="text-xs text-muted-foreground">Scheduled this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offer Rate</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recruiterStats.offerAcceptanceRate}%</div>
            <p className="text-xs text-muted-foreground">Acceptance rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Pending Tasks */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Action Items
            </CardTitle>
            <CardDescription>Tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.map((task) => (
              <Link key={task.id} href={task.link}>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border">
                  <div className={`p-2 rounded-lg ${task.bgColor}`}>
                    <task.icon className={`h-5 w-5 ${task.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{task.title}</p>
                      <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                        {task.count}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Candidate Pipeline
            </CardTitle>
            <CardDescription>{recruiterStats.totalCandidates} total active candidates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineData.map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <span className="text-sm font-bold">{stage.count}</span>
                </div>
                <Progress 
                  value={(stage.count / recruiterStats.totalCandidates) * 100} 
                  className={`h-2 [&>div]:${stage.color}`} 
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Interviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingInterviews.map((interview, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar>
                  <AvatarFallback>{interview.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{interview.candidate}</p>
                  <p className="text-xs text-muted-foreground">{interview.position}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {interview.type === "video" ? (
                        <><Video className="h-3 w-3 mr-1" /> Video</>
                      ) : (
                        <><Users className="h-3 w-3 mr-1" /> In-person</>
                      )}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{interview.time}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">Join</Button>
              </div>
            ))}
            <Link href="/recruitment/interviews">
              <Button variant="ghost" className="w-full">View All Interviews</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Hired This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{recruiterStats.hiredThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-teal-600" />
              Offers Extended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recruiterStats.offersExtended}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Avg Time to Hire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recruiterStats.timeToHire} days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Total Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recruiterStats.totalCandidates}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
