import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  Target,
  GraduationCap,
  Star,
  Search,
  Download,
  Crown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for top performers
const topPerformers = [
  {
    id: 1,
    name: "Sarah Al-Mansouri",
    position: "Senior Mathematics Teacher",
    department: "Mathematics",
    avatar: "",
    overallScore: 98,
    careerGrowth: 95,
    performanceReview: 98,
    examScore: 100,
    studentSatisfaction: 96,
    achievements: ["Top Educator 2024", "Innovation Award", "Mentor of the Year"],
    rank: 1,
  },
  {
    id: 2,
    name: "Ahmed Hassan",
    position: "Physics Department Head",
    department: "Science",
    avatar: "",
    overallScore: 96,
    careerGrowth: 92,
    performanceReview: 97,
    examScore: 98,
    studentSatisfaction: 95,
    achievements: ["Leadership Excellence", "Research Award"],
    rank: 2,
  },
  {
    id: 3,
    name: "Fatima Al-Zaabi",
    position: "English Language Specialist",
    department: "Languages",
    avatar: "",
    overallScore: 94,
    careerGrowth: 96,
    performanceReview: 93,
    examScore: 95,
    studentSatisfaction: 92,
    achievements: ["Best Teacher Award", "Curriculum Developer"],
    rank: 3,
  },
  {
    id: 4,
    name: "Mohammed Al-Kaabi",
    position: "Chemistry Teacher",
    department: "Science",
    avatar: "",
    overallScore: 92,
    careerGrowth: 90,
    performanceReview: 94,
    examScore: 93,
    studentSatisfaction: 91,
    achievements: ["Innovation in Teaching"],
    rank: 4,
  },
  {
    id: 5,
    name: "Noura Al-Suwaidi",
    position: "Arabic Language Teacher",
    department: "Languages",
    avatar: "",
    overallScore: 91,
    careerGrowth: 89,
    performanceReview: 92,
    examScore: 92,
    studentSatisfaction: 90,
    achievements: ["Cultural Ambassador"],
    rank: 5,
  },
  {
    id: 6,
    name: "Khalid Al-Shamsi",
    position: "Biology Teacher",
    department: "Science",
    avatar: "",
    overallScore: 89,
    careerGrowth: 88,
    performanceReview: 90,
    examScore: 90,
    studentSatisfaction: 88,
    achievements: ["STEM Excellence"],
    rank: 6,
  },
  {
    id: 7,
    name: "Mariam Al-Hashemi",
    position: "History Teacher",
    department: "Social Studies",
    avatar: "",
    overallScore: 88,
    careerGrowth: 87,
    performanceReview: 89,
    examScore: 89,
    studentSatisfaction: 87,
    achievements: ["Heritage Educator"],
    rank: 7,
  },
  {
    id: 8,
    name: "Rashid Al-Mazrouei",
    position: "Computer Science Teacher",
    department: "Technology",
    avatar: "",
    overallScore: 87,
    careerGrowth: 91,
    performanceReview: 85,
    examScore: 88,
    studentSatisfaction: 85,
    achievements: ["Tech Innovator"],
    rank: 8,
  },
  {
    id: 9,
    name: "Aisha Al-Mansoori",
    position: "Art Teacher",
    department: "Arts",
    avatar: "",
    overallScore: 86,
    careerGrowth: 84,
    performanceReview: 88,
    examScore: 86,
    studentSatisfaction: 86,
    achievements: ["Creative Excellence"],
    rank: 9,
  },
  {
    id: 10,
    name: "Omar Al-Dhaheri",
    position: "Physical Education Teacher",
    department: "Sports",
    avatar: "",
    overallScore: 85,
    careerGrowth: 83,
    performanceReview: 87,
    examScore: 85,
    studentSatisfaction: 85,
    achievements: ["Sports Champion"],
    rank: 10,
  },
];

const categories = [
  { value: "overall", label: "Overall Performance", icon: Trophy },
  { value: "careerGrowth", label: "Career Growth", icon: TrendingUp },
  { value: "performanceReview", label: "Performance Reviews", icon: Star },
  { value: "examScore", label: "Exam Scores", icon: GraduationCap },
  { value: "studentSatisfaction", label: "Student Satisfaction", icon: Users },
];

const timePeriods = [
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
  if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
  return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
}

function getRankBadge(rank: number) {
  if (rank === 1) return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">🥇 1st Place</Badge>;
  if (rank === 2) return <Badge className="bg-gradient-to-r from-gray-300 to-gray-500">🥈 2nd Place</Badge>;
  if (rank === 3) return <Badge className="bg-gradient-to-r from-amber-500 to-amber-700">🥉 3rd Place</Badge>;
  return <Badge variant="outline">#{rank}</Badge>;
}

export default function TopPerformers() {
  const [category, setCategory] = useState("overall");
  const [timePeriod, setTimePeriod] = useState("year");
  const [searchQuery, setSearchQuery] = useState("");

  const getScoreByCategory = (performer: typeof topPerformers[0]) => {
    switch (category) {
      case "careerGrowth":
        return performer.careerGrowth;
      case "performanceReview":
        return performer.performanceReview;
      case "examScore":
        return performer.examScore;
      case "studentSatisfaction":
        return performer.studentSatisfaction;
      default:
        return performer.overallScore;
    }
  };

  const filteredPerformers = topPerformers
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.position.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => getScoreByCategory(b) - getScoreByCategory(a));

  const topThree = filteredPerformers.slice(0, 3);
  const restOfPerformers = filteredPerformers.slice(3);

  const selectedCategory = categories.find((c) => c.value === category);
  const CategoryIcon = selectedCategory?.icon || Trophy;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Top Performers Leaderboard
          </h1>
          <p className="text-muted-foreground">Recognizing excellence across the organization</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Leaderboard
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search Employees</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, department, or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-[250px]">
              <label className="text-sm font-medium mb-2 block">Performance Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-[200px]">
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timePeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Indicator */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CategoryIcon className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">
                Showing: <strong>{selectedCategory?.label}</strong> for{" "}
                <strong>{timePeriods.find((p) => p.value === timePeriod)?.label}</strong>
              </span>
            </div>
            <Badge className="bg-yellow-600">
              {filteredPerformers.length} Employees
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topThree.map((performer, index) => (
          <Card
            key={performer.id}
            className={cn(
              "relative overflow-hidden",
              index === 0 && "border-yellow-300 bg-gradient-to-br from-yellow-50 to-white",
              index === 1 && "border-gray-300 bg-gradient-to-br from-gray-50 to-white",
              index === 2 && "border-amber-300 bg-gradient-to-br from-amber-50 to-white"
            )}
          >
            <div className="absolute top-0 right-0 p-4">
              {getRankIcon(performer.rank)}
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                  <AvatarImage src={performer.avatar} />
                  <AvatarFallback className="text-lg font-bold">
                    {performer.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{performer.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {performer.position}
                  </CardDescription>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {performer.department}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Performance Score</span>
                  <span className="text-2xl font-bold text-primary">
                    {getScoreByCategory(performer)}%
                  </span>
                </div>
                <Progress value={getScoreByCategory(performer)} className="h-2" />
              </div>
              <div>
                {getRankBadge(performer.rank)}
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-2">Achievements</p>
                <div className="flex flex-wrap gap-1">
                  {performer.achievements.map((achievement, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rest of Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Rankings</CardTitle>
          <CardDescription>All employees ranked by {selectedCategory?.label.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {restOfPerformers.map((performer) => (
              <div
                key={performer.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                  {getRankIcon(performer.rank)}
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={performer.avatar} />
                  <AvatarFallback>
                    {performer.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{performer.name}</p>
                    {performer.rank <= 10 && (
                      <Badge variant="secondary" className="text-xs">
                        Top 10
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {performer.position} • {performer.department}
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  {performer.achievements.slice(0, 2).map((achievement, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {achievement}
                    </Badge>
                  ))}
                  {performer.achievements.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{performer.achievements.length - 2}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {getScoreByCategory(performer)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90.1%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.3%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Department</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Science</div>
            <p className="text-xs text-muted-foreground">3 top performers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Across all performers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">Sarah Al-Mansouri</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
