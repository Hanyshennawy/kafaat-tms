import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  UserPlus,
  FileText,
  Target,
  ClipboardList,
  MessageSquare,
  GraduationCap,
  Zap,
  Users,
  TrendingUp,
  Calendar,
  Award,
  MapPin,
  BarChart3,
  Building,
  BookOpen,
  Bot,
} from "lucide-react";
import { useLocation } from "wouter";

export function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      group: "Recruitment",
      items: [
        { 
          icon: UserPlus, 
          label: "New Job Requisition", 
          path: "/recruitment/requisitions",
          description: "Create a new job posting"
        },
        { 
          icon: FileText, 
          label: "Add Candidate", 
          path: "/recruitment/candidates",
          description: "Register a new candidate"
        },
        { 
          icon: Calendar, 
          label: "Schedule Interview", 
          path: "/recruitment/interviews",
          description: "Schedule candidate interview"
        },
        { 
          icon: Bot, 
          label: "AI Interview", 
          path: "/recruitment/ai-interview",
          description: "Start AI-powered interview"
        },
      ]
    },
    {
      group: "Performance",
      items: [
        { 
          icon: Target, 
          label: "Create Goal", 
          path: "/performance/goals",
          description: "Set a new performance goal"
        },
        { 
          icon: ClipboardList, 
          label: "Start Review", 
          path: "/performance/self-appraisal",
          description: "Begin self-appraisal"
        },
      ]
    },
    {
      group: "Engagement",
      items: [
        { 
          icon: MessageSquare, 
          label: "Create Survey", 
          path: "/engagement/surveys",
          description: "Design a new survey"
        },
        { 
          icon: Award, 
          label: "Give Recognition", 
          path: "/engagement/recognition",
          description: "Recognize a colleague"
        },
      ]
    },
    {
      group: "Licensing",
      items: [
        { 
          icon: GraduationCap, 
          label: "Apply for License", 
          path: "/licensing/new-license",
          description: "Start license application"
        },
        { 
          icon: BookOpen, 
          label: "CPD Activities", 
          path: "/licensing/cpd",
          description: "Log professional development"
        },
      ]
    },
    {
      group: "Career & Succession",
      items: [
        { 
          icon: TrendingUp, 
          label: "View Career Path", 
          path: "/career/paths",
          description: "Explore career progressions"
        },
        { 
          icon: Users, 
          label: "Succession Planning", 
          path: "/succession",
          description: "View succession pipeline"
        },
      ]
    },
    {
      group: "Assessments & Placement",
      items: [
        { 
          icon: BarChart3, 
          label: "Take Assessment", 
          path: "/assessments/take",
          description: "Start competency assessment"
        },
        { 
          icon: MapPin, 
          label: "Staff Placement", 
          path: "/placement",
          description: "View placement dashboard"
        },
      ]
    },
    {
      group: "Workforce",
      items: [
        { 
          icon: Building, 
          label: "Workforce Planning", 
          path: "/workforce",
          description: "View workforce analytics"
        },
      ]
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
          <Zap className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Actions</span>
          <Plus className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-h-[70vh] overflow-y-auto">
        {actions.map((group, groupIndex) => (
          <div key={group.group}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-xs font-semibold text-primary uppercase tracking-wider">
              {group.group}
            </DropdownMenuLabel>
            {group.items.map((item) => (
              <DropdownMenuItem 
                key={item.path + item.label}
                onClick={() => setLocation(item.path)}
                className="cursor-pointer py-2.5 hover:bg-primary/5"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-medium text-sm">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
