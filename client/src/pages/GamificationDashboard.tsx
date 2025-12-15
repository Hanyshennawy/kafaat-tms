import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, Medal, Star, Target, Flame, Crown, Award, TrendingUp,
  Users, Zap, Gift, ChevronRight, Sparkles, Clock
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

// Sample gamification data (will be replaced with tRPC calls)
const sampleProfile = {
  userId: 1,
  totalPoints: 2450,
  currentLevel: 12,
  levelName: "Expert Achiever",
  nextLevelPoints: 3000,
  pointsToNextLevel: 550,
  rank: 5,
  totalUsers: 156,
  currentStreak: 14,
  longestStreak: 28,
  badges: [
    { id: "first_login", name: "Welcome Aboard", icon: "🎉", tier: "bronze", earnedAt: "2024-01-15" },
    { id: "training_master", name: "Training Master", icon: "📚", tier: "gold", earnedAt: "2024-02-20" },
    { id: "team_player", name: "Team Player", icon: "🤝", tier: "silver", earnedAt: "2024-03-05" },
    { id: "goal_crusher", name: "Goal Crusher", icon: "🎯", tier: "gold", earnedAt: "2024-03-15" },
    { id: "perfect_score", name: "Perfect Score", icon: "💯", tier: "platinum", earnedAt: "2024-04-01" },
    { id: "mentor", name: "Mentor", icon: "👨‍🏫", tier: "silver", earnedAt: "2024-04-10" },
  ],
  recentPoints: [
    { event: "Completed Training Course", points: 100, date: "2024-04-20" },
    { event: "Daily Login Streak (14 days)", points: 50, date: "2024-04-19" },
    { event: "Received Peer Recognition", points: 25, date: "2024-04-18" },
    { event: "Achieved Performance Goal", points: 200, date: "2024-04-17" },
    { event: "Completed Assessment", points: 75, date: "2024-04-16" },
  ],
};

const sampleLeaderboard = [
  { rank: 1, name: "Ahmed Al Rashid", department: "Science", points: 3250, badges: 12 },
  { rank: 2, name: "Sara Hassan", department: "Mathematics", points: 3100, badges: 10 },
  { rank: 3, name: "Mohammed Ali", department: "Arabic", points: 2890, badges: 11 },
  { rank: 4, name: "Fatima Khalid", department: "English", points: 2650, badges: 9 },
  { rank: 5, name: "Sulaiman Alkaabi", department: "Administration", points: 2450, badges: 6 },
  { rank: 6, name: "Layla Omar", department: "Social Studies", points: 2300, badges: 8 },
  { rank: 7, name: "Omar Saeed", department: "Physical Education", points: 2150, badges: 7 },
  { rank: 8, name: "Noura Abdullah", department: "Art", points: 2000, badges: 6 },
  { rank: 9, name: "Khalid Ibrahim", department: "ICT", points: 1850, badges: 5 },
  { rank: 10, name: "Maryam Hassan", department: "Science", points: 1700, badges: 4 },
];

const availableBadges = [
  { id: "streak_7", name: "Week Warrior", description: "Login 7 days in a row", icon: "🔥", tier: "bronze", unlocked: true },
  { id: "streak_30", name: "Monthly Master", description: "Login 30 days in a row", icon: "⚡", tier: "gold", unlocked: false },
  { id: "training_5", name: "Learner", description: "Complete 5 training courses", icon: "📖", tier: "bronze", unlocked: true },
  { id: "training_master", name: "Training Master", description: "Complete 20 training courses", icon: "📚", tier: "gold", unlocked: true },
  { id: "perfect_score", name: "Perfect Score", description: "Score 100% on any assessment", icon: "💯", tier: "platinum", unlocked: true },
  { id: "mentor", name: "Mentor", description: "Complete 5 mentoring sessions", icon: "👨‍🏫", tier: "silver", unlocked: true },
  { id: "innovator", name: "Innovator", description: "Submit 3 approved improvement ideas", icon: "💡", tier: "gold", unlocked: false },
  { id: "team_leader", name: "Team Leader", description: "Lead a cross-functional project", icon: "👑", tier: "platinum", unlocked: false },
];

export default function GamificationDashboard() {
  const { user } = useAuth();
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"weekly" | "monthly" | "allTime">("monthly");

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze": return "bg-amber-700 text-white";
      case "silver": return "bg-slate-400 text-white";
      case "gold": return "bg-yellow-500 text-white";
      case "platinum": return "bg-gradient-to-r from-indigo-500 to-purple-500 text-white";
      default: return "bg-gray-200";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-slate-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-700" />;
      default: return <span className="font-bold text-gray-600">#{rank}</span>;
    }
  };

  const levelProgress = ((sampleProfile.nextLevelPoints - sampleProfile.pointsToNextLevel) / sampleProfile.nextLevelPoints) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Gamification & Achievements
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your progress, earn badges, and compete with colleagues
        </p>
      </div>

      {/* Profile Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white/30">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-white/20 text-white text-2xl">
                    {user?.name?.slice(0, 2).toUpperCase() || "SA"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-1.5">
                  <Star className="h-4 w-4 text-yellow-900" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user?.name || "Sulaiman Alkaabi"}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-white/20 text-white hover:bg-white/30">
                    Level {sampleProfile.currentLevel}
                  </Badge>
                  <span className="text-white/80">{sampleProfile.levelName}</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Level Progress</span>
                    <span>{sampleProfile.nextLevelPoints - sampleProfile.pointsToNextLevel} / {sampleProfile.nextLevelPoints} XP</span>
                  </div>
                  <Progress value={levelProgress} className="h-2 bg-white/20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-3xl font-bold text-yellow-600">{sampleProfile.totalPoints.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Rank #{sampleProfile.rank} of {sampleProfile.totalUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">{sampleProfile.currentStreak} days</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Best: {sampleProfile.longestStreak} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            My Badges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Challenges
          </TabsTrigger>
        </TabsList>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Earned Badges ({sampleProfile.badges.length})
              </CardTitle>
              <CardDescription>
                Badges you've earned through your achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {sampleProfile.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className={`text-4xl mb-2`}>{badge.icon}</div>
                    <p className="font-medium text-sm text-center">{badge.name}</p>
                    <Badge variant="outline" className={`mt-2 ${getTierColor(badge.tier)}`}>
                      {badge.tier}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-500" />
                Available Badges
              </CardTitle>
              <CardDescription>
                Badges you can earn - keep working towards them!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border ${
                      badge.unlocked ? "bg-green-50 border-green-200" : "bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className={`text-3xl ${!badge.unlocked && "grayscale"}`}>{badge.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                      <Badge variant="outline" className={`mt-1 text-xs ${getTierColor(badge.tier)}`}>
                        {badge.tier}
                      </Badge>
                    </div>
                    {badge.unlocked && (
                      <div className="text-green-500">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Leaderboard
                  </CardTitle>
                  <CardDescription>
                    See how you rank against your colleagues
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {(["weekly", "monthly", "allTime"] as const).map((period) => (
                    <Button
                      key={period}
                      variant={leaderboardPeriod === period ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLeaderboardPeriod(period)}
                    >
                      {period === "allTime" ? "All Time" : period.charAt(0).toUpperCase() + period.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sampleLeaderboard.map((entry, index) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      entry.name === (user?.name || "Sulaiman Alkaabi")
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "bg-gray-50"
                    } ${index < 3 ? "ring-2 ring-yellow-200" : ""}`}
                  >
                    <div className="w-10 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {entry.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{entry.name}</p>
                      <p className="text-sm text-muted-foreground">{entry.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{entry.points.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{entry.badges} badges</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Recent Points Earned
              </CardTitle>
              <CardDescription>
                Your latest achievements and point gains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleProfile.recentPoints.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.event}</p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                      +{activity.points} XP
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Active Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">30-Day Learning Sprint</h4>
                      <Badge>+500 XP</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Complete 5 training courses in 30 days
                    </p>
                    <Progress value={60} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">3/5 courses completed</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Recognition Champion</h4>
                      <Badge>+200 XP</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Give recognition to 10 colleagues this month
                    </p>
                    <Progress value={70} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">7/10 recognitions given</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Perfect Attendance</h4>
                      <Badge>+300 XP</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Maintain 100% attendance for the quarter
                    </p>
                    <Progress value={85} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">Day 85 of 100</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Team Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border bg-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Department Excellence</h4>
                      <Badge className="bg-purple-100 text-purple-700">Team</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Highest collective training completion rate
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Your Team:</span>
                      <span className="text-sm">Administration - 78%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Currently in 3rd place
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-orange-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Innovation Week</h4>
                      <Badge className="bg-orange-100 text-orange-700">Event</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Submit improvement ideas - top ideas win prizes!
                    </p>
                    <Button size="sm" className="mt-2">
                      Submit Idea
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
