import { useAuth, enableDemoMode, isDemoMode, disableDemoMode } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { useRecentPages } from "@/hooks/useRecentPages";
import { useModuleCompletion } from "@/hooks/useModuleCompletion";
import { 
  LayoutDashboard, 
  LogOut, 
  PanelLeft, 
  Users, 
  Trophy, 
  TrendingUp,
  TrendingUpIcon,
  UsersIcon,
  CalendarRange,
  MessageSquareHeart,
  UserPlus,
  Target,
  GraduationCap,
  FileQuestion,
  BarChart3,
  Settings,
  Bell,
  Search,
  Brain,
  Briefcase,
  ClipboardCheck,
  Building2,
  Shield,
  ShieldCheck,
  User,
  CircleCheck,
  Circle,
  LockKeyhole,
  Play,
  Database,
  FileText,
  Award,
  BookOpen
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { GlobalSearch } from "./GlobalSearch";
import { Badge } from "./ui/badge";
import { Breadcrumb } from "./Breadcrumb";
import { QuickActions } from "./QuickActions";
import { RecentPagesDropdown } from "./RecentPagesDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { Progress } from "./ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// User roles for RBAC
type UserRole = 'admin' | 'hr_manager' | 'manager' | 'employee' | 'teacher';

// Role-based access control for menu items
const roleAccess: Record<string, UserRole[]> = {
  // Admin-only
  '/admin/questions': ['admin'],
  '/admin/qms-analytics': ['admin'],
  '/admin/rbac': ['admin'],
  '/settings': ['admin', 'hr_manager'],
  
  // HR Manager and above
  '/succession/plans': ['admin', 'hr_manager'],
  '/succession/talent-pools': ['admin', 'hr_manager'],
  '/succession/assessments': ['admin', 'hr_manager', 'manager'],
  '/workforce/scenarios': ['admin', 'hr_manager'],
  '/workforce/allocations': ['admin', 'hr_manager'],
  '/workforce/alerts': ['admin', 'hr_manager'],
  '/placement': ['admin', 'hr_manager'],
  '/placement/requests': ['admin', 'hr_manager', 'manager'],
  '/placement/history': ['admin', 'hr_manager'],
  '/placement/directory': ['admin', 'hr_manager', 'manager'],
  '/placement/analytics': ['admin', 'hr_manager'],
  '/recruitment/dashboard': ['admin', 'hr_manager'],
  '/recruitment/requisitions': ['admin', 'hr_manager', 'manager'],
  '/recruitment/candidates': ['admin', 'hr_manager'],
  '/recruitment/interviews': ['admin', 'hr_manager', 'manager'],
  '/recruitment/ai-interview': ['admin', 'hr_manager'],
  '/recruitment/ai-interview/templates': ['admin', 'hr_manager'],
  '/recruitment/ai-interview/session': ['admin', 'hr_manager', 'manager', 'employee'],
  '/recruitment/ai-interview/report': ['admin', 'hr_manager', 'manager'],
  
  // Manager and above
  '/performance/manager-review': ['admin', 'hr_manager', 'manager'],
  '/performance/360-feedback': ['admin', 'hr_manager', 'manager'],
  '/performance/cycles': ['admin', 'hr_manager'],
  
  // Teacher-specific (Licensing)
  '/licensing': ['admin', 'hr_manager', 'teacher'],
  '/licensing/portal': ['admin', 'hr_manager', 'teacher'],
  '/licensing/new-license': ['teacher'],
  '/licensing/renewal': ['teacher'],
  '/licensing/exam': ['teacher'],
  '/licensing/my-licenses': ['admin', 'hr_manager', 'teacher'],
  '/licensing/apply': ['teacher'],
  '/licensing/my-applications': ['teacher'],
  '/licensing/licenses': ['admin', 'hr_manager'],
  '/licensing/cpd': ['teacher'],
  '/licensing/verify': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  
  // All users
  '/dashboard': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/career/paths': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/career/skills': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/career/employee-skills': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/career/recommendations': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/performance/dashboard': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/performance/goals': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/performance/self-appraisal': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/engagement/dashboard': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/engagement/surveys': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/engagement/activities': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/competency/my-competencies': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/competency/frameworks': ['admin', 'hr_manager'],
  '/competency/standards': ['admin', 'hr_manager'],
  '/competency/assessments': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/competency/evidence': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/competency/development-plans': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/psychometric': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/psychometric/take-assessment': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/psychometric/results': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/psychometric/personality': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/psychometric/cognitive': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/psychometric/analytics': ['admin', 'hr_manager'],
  '/psychometric/competency': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/assessments': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/assessments/take': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/assessments/competency': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/assessments/psychometric': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/assessments/results': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/assessments/personality': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/assessments/cognitive': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/assessments/analytics': ['admin', 'hr_manager'],
  '/top-performers': ['admin', 'hr_manager', 'manager', 'employee', 'teacher'],
  '/performance-trends': ['admin', 'hr_manager', 'manager'],
  '/reports': ['admin', 'hr_manager', 'manager'],
};

// Map paths to module IDs for completion tracking
const pathToModuleId: Record<string, string> = {
  '/career': 'career',
  '/succession': 'succession',
  '/performance': 'performance',
  '/workforce': 'workforce',
  '/placement': 'placement',
  '/recruitment': 'recruitment',
  '/engagement': 'engagement',
  '/competency': 'competency',
  '/psychometric': 'assessments',
  '/assessments': 'assessments',
  '/licensing': 'licensing',
};

// Organized menu structure with categories
const menuCategories = [
  {
    category: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    ]
  },
  {
    category: "Talent Development",
    items: [
      { 
        icon: TrendingUpIcon, 
        label: "Career Progression", 
        path: "/career/paths",
        submenu: [
          { label: "Career Paths", path: "/career/paths" },
          { label: "Skills Matrix", path: "/career/skills" },
          { label: "My Skills", path: "/career/employee-skills" },
          { label: "Recommendations", path: "/career/recommendations" },
        ]
      },
      { 
        icon: UsersIcon, 
        label: "Succession Planning", 
        path: "/succession/plans",
        submenu: [
          { label: "Succession Plans", path: "/succession/plans" },
          { label: "Talent Pools", path: "/succession/talent-pools" },
          { label: "Leadership Assessments", path: "/succession/assessments" },
        ]
      },
      { 
        icon: Target, 
        label: "Performance", 
        path: "/performance/dashboard",
        submenu: [
          { label: "Performance Dashboard", path: "/performance/dashboard" },
          { label: "Performance Cycles", path: "/performance/cycles" },
          { label: "Goals", path: "/performance/goals" },
          { label: "Self Appraisal", path: "/performance/self-appraisal" },
          { label: "Manager Review", path: "/performance/manager-review" },
          { label: "360° Feedback", path: "/performance/360-feedback" },
        ]
      },
    ]
  },
  {
    category: "Workforce Management",
    items: [
      { 
        icon: CalendarRange, 
        label: "Workforce Planning", 
        path: "/workforce/scenarios",
        submenu: [
          { label: "Scenarios", path: "/workforce/scenarios" },
          { label: "Resource Allocation", path: "/workforce/allocations" },
          { label: "Workforce Alerts", path: "/workforce/alerts" },
        ]
      },
      { 
        icon: Building2, 
        label: "Staff Placement", 
        path: "/placement",
        submenu: [
          { label: "Dashboard", path: "/placement" },
          { label: "Placement Requests", path: "/placement/requests" },
          { label: "Transfer History", path: "/placement/history" },
          { label: "Staff Directory", path: "/placement/directory" },
          { label: "Analytics", path: "/placement/analytics" },
        ]
      },
      { 
        icon: UserPlus, 
        label: "Recruitment", 
        path: "/recruitment/dashboard",
        submenu: [
          { label: "Recruitment Dashboard", path: "/recruitment/dashboard" },
          { label: "Job Requisitions", path: "/recruitment/requisitions" },
          { label: "Candidates", path: "/recruitment/candidates" },
          { label: "Interviews", path: "/recruitment/interviews" },
          { label: "AI Interview", path: "/recruitment/ai-interview" },
        ]
      },
    ]
  },
  {
    category: "Employee Experience",
    items: [
      { 
        icon: MessageSquareHeart, 
        label: "Engagement", 
        path: "/engagement/dashboard",
        submenu: [
          { label: "Engagement Dashboard", path: "/engagement/dashboard" },
          { label: "Surveys", path: "/engagement/surveys" },
          { label: "Activities", path: "/engagement/activities" },
        ]
      },
      { icon: Trophy, label: "Gamification", path: "/gamification" },
      { icon: TrendingUp, label: "Performance Trends", path: "/performance-trends" },
    ]
  },
  {
    category: "Assessments & Licensing",
    items: [
      { 
        icon: ClipboardCheck, 
        label: "Assessments", 
        path: "/assessments",
        submenu: [
          { label: "Dashboard", path: "/assessments" },
          { label: "Take Assessment", path: "/assessments/take" },
          { label: "Competency Assessment", path: "/assessments/competency" },
          { label: "Psychometric Tests", path: "/assessments/psychometric" },
          { label: "My Results", path: "/assessments/results" },
          { label: "Personality Profile", path: "/assessments/personality" },
          { label: "Cognitive Ability", path: "/assessments/cognitive" },
          { label: "Analytics", path: "/assessments/analytics" },
        ]
      },
      { 
        icon: GraduationCap, 
        label: "Teacher Licensing", 
        path: "/licensing",
        submenu: [
          { label: "Licensing Services", path: "/licensing" },
          { label: "Apply for New License", path: "/licensing/new-license" },
          { label: "License Renewal", path: "/licensing/renewal" },
          { label: "My Licenses", path: "/licensing/my-licenses" },
          { label: "CPD Records", path: "/licensing/cpd" },
          { label: "Verify License", path: "/licensing/verify" },
        ]
      },
    ]
  },
  {
    category: "Catalog",
    items: [
      { 
        icon: Database, 
        label: "Catalog", 
        path: "/catalog/job-descriptions",
        submenu: [
          { label: "Job Descriptions", path: "/catalog/job-descriptions" },
          { label: "Competency Framework", path: "/catalog/competency-framework" },
          { label: "License Types", path: "/catalog/license-types" },
          { label: "Training Programs", path: "/catalog/training" },
        ]
      },
    ]
  },
  {
    category: "Administration",
    items: [
      { 
        icon: FileQuestion, 
        label: "Question Bank", 
        path: "/admin/questions",
        submenu: [
          { label: "Questions Management", path: "/admin/questions" },
          { label: "QMS Analytics", path: "/admin/qms-analytics" },
        ]
      },
      { icon: BarChart3, label: "Analytics Dashboard", path: "/analytics" },
      { icon: Shield, label: "Roles & Permissions", path: "/admin/rbac" },
      { icon: Briefcase, label: "Integrations", path: "/admin/integrations" },
      { icon: Settings, label: "Settings", path: "/settings" },
    ]
  },
];

// Flatten for searching - include submenus
const menuItems = menuCategories.flatMap(cat => cat.items);

// Get all menu items including submenus for title lookup
const getAllMenuItems = () => {
  const items: { label: string; path: string }[] = [];
  menuCategories.forEach(cat => {
    cat.items.forEach(item => {
      items.push({ label: item.label, path: item.path });
      if ('submenu' in item && item.submenu) {
        item.submenu.forEach(sub => {
          items.push({ label: sub.label, path: sub.path });
        });
      }
    });
  });
  return items;
};

const allMenuItems = getAllMenuItems();

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="relative">
                <img
                  src={APP_LOGO}
                  alt={APP_TITLE}
                  className="h-20 w-20 rounded-xl object-cover shadow"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{APP_TITLE}</h1>
              <p className="text-sm text-muted-foreground">
                Please sign in to continue
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
              size="lg"
              className="w-full shadow-lg hover:shadow-xl transition-all"
            >
              Sign in
            </Button>
            <Button
              onClick={enableDemoMode}
              size="lg"
              variant="secondary"
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Try Demo Mode
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Demo mode lets you explore all features with sample data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  // Find active menu item from all items including submenus
  const activeMenuItem = allMenuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  const { addRecentPage } = useRecentPages();
  const { getModuleStatus, overallCompletion } = useModuleCompletion();

  // Get user role - in production this would come from auth context
  // For demo, we'll default to admin so all menus are visible
  const userRole: UserRole = (user as any)?.role || 'admin';

  // Function to check if user has access to a path
  const hasAccess = (path: string): boolean => {
    const allowedRoles = roleAccess[path];
    if (!allowedRoles) return true; // If not defined, allow all
    return allowedRoles.includes(userRole);
  };

  // Get module ID from path
  const getModuleIdFromPath = (path: string): string | undefined => {
    for (const [prefix, moduleId] of Object.entries(pathToModuleId)) {
      if (path.startsWith(prefix)) return moduleId;
    }
    return undefined;
  };

  // Track page visits for recent pages
  useEffect(() => {
    if (activeMenuItem) {
      addRecentPage(location, activeMenuItem.label);
    }
  }, [location, activeMenuItem, addRecentPage]);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 pl-2 group-data-[collapsible=icon]:px-0 transition-all w-full">
              {isCollapsed ? (
                <div className="relative h-8 w-8 shrink-0 group">
                  <img
                    src={APP_LOGO}
                    className="h-8 w-8 rounded-md object-cover ring-1 ring-border"
                    alt="Logo"
                  />
                  <button
                    onClick={toggleSidebar}
                    className="absolute inset-0 flex items-center justify-center bg-accent rounded-md ring-1 ring-border opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <PanelLeft className="h-4 w-4 text-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={APP_LOGO}
                      className="h-8 w-8 rounded-md object-cover ring-1 ring-border shrink-0"
                      alt="Logo"
                    />
                    <span className="font-semibold tracking-tight truncate">
                      {APP_TITLE}
                    </span>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className="ml-auto h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                  >
                    <PanelLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                </>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 overflow-y-auto">
            {/* Quick Modules Grid - Always Visible */}
            <div className="px-3 py-3 border-b border-border/50">
              {!isCollapsed && (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Modules</span>
                </div>
              )}
              <div className={`grid ${isCollapsed ? 'grid-cols-1 gap-1' : 'grid-cols-3 gap-2'}`}>
                {[
                  { icon: TrendingUpIcon, label: "Career", path: "/career/paths", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100" },
                  { icon: UsersIcon, label: "Succession", path: "/succession/plans", color: "text-purple-600", bg: "bg-purple-50 hover:bg-purple-100" },
                  { icon: CalendarRange, label: "Workforce", path: "/workforce/scenarios", color: "text-green-600", bg: "bg-green-50 hover:bg-green-100" },
                  { icon: MessageSquareHeart, label: "Engagement", path: "/engagement/dashboard", color: "text-yellow-600", bg: "bg-yellow-50 hover:bg-yellow-100" },
                  { icon: UserPlus, label: "Recruitment", path: "/recruitment/dashboard", color: "text-red-600", bg: "bg-red-50 hover:bg-red-100" },
                  { icon: Target, label: "Performance", path: "/performance/dashboard", color: "text-indigo-600", bg: "bg-indigo-50 hover:bg-indigo-100" },
                  { icon: GraduationCap, label: "Licensing", path: "/licensing", color: "text-teal-600", bg: "bg-teal-50 hover:bg-teal-100" },
                  { icon: ClipboardCheck, label: "Assessments", path: "/assessments", color: "text-pink-600", bg: "bg-pink-50 hover:bg-pink-100" },
                  { icon: Building2, label: "Placement", path: "/placement", color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100" },
                ].map((module) => (
                  <TooltipProvider key={module.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setLocation(module.path)}
                          className={`flex ${isCollapsed ? 'justify-center p-2' : 'flex-col items-center justify-center p-2 rounded-lg'} ${module.bg} transition-all ${location.startsWith(module.path.split('/').slice(0, 2).join('/')) ? 'ring-2 ring-primary/50' : ''}`}
                        >
                          <module.icon className={`h-4 w-4 ${module.color}`} />
                          {!isCollapsed && (
                            <span className={`text-[10px] mt-1 font-medium ${module.color}`}>{module.label}</span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{module.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            {/* Overall Completion Indicator */}
            {!isCollapsed && (
              <div className="px-4 py-3 border-b border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Setup Progress</span>
                  <span className="text-xs font-medium text-primary">{overallCompletion}%</span>
                </div>
                <Progress value={overallCompletion} className="h-1.5" />
              </div>
            )}
            
            {menuCategories.map((category, catIndex) => {
              // Filter items based on role access
              const accessibleItems = category.items.filter(item => hasAccess(item.path));
              if (accessibleItems.length === 0) return null;
              
              return (
              <div key={category.category} className={catIndex > 0 ? "mt-4" : "mt-2"}>
                {/* Category Header */}
                {!isCollapsed && (
                  <div className="px-4 py-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {category.category}
                    </span>
                  </div>
                )}
                {isCollapsed && catIndex > 0 && (
                  <div className="mx-2 my-2 border-t border-border/50" />
                )}
                <SidebarMenu className="px-2 space-y-0.5">
                  {accessibleItems.map(item => {
                    const hasSubmenu = 'submenu' in item && item.submenu;
                    // Filter submenu items based on role
                    const accessibleSubmenu = hasSubmenu 
                      ? item.submenu?.filter(sub => hasAccess(sub.path))
                      : undefined;
                    const isActive = location === item.path || (hasSubmenu && accessibleSubmenu?.some(sub => location === sub.path));
                    const [isExpanded, setIsExpanded] = useState(isActive);
                    
                    // Get module completion status
                    const moduleId = getModuleIdFromPath(item.path);
                    const moduleStatus = moduleId ? getModuleStatus(moduleId) : undefined;
                    
                    return (
                      <div key={item.path} className="space-y-0.5">
                        <SidebarMenuItem>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <SidebarMenuButton
                                  isActive={!hasSubmenu && isActive}
                                  onClick={() => {
                                    if (hasSubmenu) {
                                      setIsExpanded(!isExpanded);
                                    } else {
                                      setLocation(item.path);
                                    }
                                  }}
                                  tooltip={item.label}
                                  className={`h-9 transition-all ${isActive ? 'bg-primary/10 text-primary' : ''}`}
                                >
                                  <item.icon
                                    className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                                  />
                                  <span className={`flex-1 ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
                                  {/* Module Completion Indicator */}
                                  {moduleStatus && !isCollapsed && (
                                    <span className={`text-xs ${
                                      moduleStatus.completion === 100 ? 'text-green-600' :
                                      moduleStatus.completion >= 75 ? 'text-blue-600' :
                                      moduleStatus.completion >= 50 ? 'text-amber-600' :
                                      'text-muted-foreground'
                                    }`}>
                                      {moduleStatus.completion}%
                                    </span>
                                  )}
                                  {hasSubmenu && (
                                    <svg
                                      className={`h-4 w-4 transition-transform text-muted-foreground ${isExpanded ? 'rotate-90' : ''}`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  )}
                                </SidebarMenuButton>
                              </TooltipTrigger>
                              {moduleStatus && isCollapsed && (
                                <TooltipContent side="right">
                                  <div className="text-xs">
                                    <p className="font-medium">{item.label}</p>
                                    <p className="text-muted-foreground">Setup: {moduleStatus.completion}%</p>
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </SidebarMenuItem>
                        
                        {hasSubmenu && isExpanded && !isCollapsed && accessibleSubmenu && (
                          <div className="ml-4 pl-2 border-l border-border/50 space-y-0.5">
                            {accessibleSubmenu.map(subItem => {
                              const isSubActive = location === subItem.path;
                              const subHasAccess = hasAccess(subItem.path);
                              return (
                                <SidebarMenuItem key={subItem.path}>
                                  <SidebarMenuButton
                                    isActive={isSubActive}
                                    onClick={() => subHasAccess && setLocation(subItem.path)}
                                    tooltip={subItem.label}
                                    className={`h-8 text-sm ${
                                      !subHasAccess ? 'opacity-50 cursor-not-allowed' :
                                      isSubActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                                    }`}
                                  >
                                    <span>{subItem.label}</span>
                                    {!subHasAccess && (
                                      <LockKeyhole className="h-3 w-3 ml-auto text-muted-foreground" />
                                    )}
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </SidebarMenu>
              </div>
              );
            })}
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate leading-none">
                        {user?.name || "-"}
                      </p>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {userRole === 'admin' ? 'Admin' : 
                         userRole === 'hr_manager' ? 'HR' :
                         userRole === 'manager' ? 'Manager' :
                         userRole === 'teacher' ? 'Teacher' : 'Employee'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => setLocation('/profile')}
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocation('/settings')}
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {/* Demo Mode Banner */}
        {isDemoMode() && (
          <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span className="font-medium">Demo Mode</span>
              <span className="text-amber-800">— Explore all features with sample data</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={disableDemoMode}
              className="h-7 bg-white/20 border-amber-600 hover:bg-white/30 text-amber-950"
            >
              Exit Demo
            </Button>
          </div>
        )}
        {/* Top Header Bar with Search, Quick Actions, and Notifications */}
        <div className="flex border-b h-14 items-center justify-between bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {isMobile && <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />}
            <span className="tracking-tight text-foreground font-medium hidden sm:inline">
              {activeMenuItem?.label ?? APP_TITLE}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Global Search */}
            <GlobalSearch />
            
            {/* Recent Pages */}
            <RecentPagesDropdown />
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notifications Bell */}
            <Button variant="ghost" size="icon" className="relative" onClick={() => setLocation('/notifications')}>
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                3
              </Badge>
            </Button>
          </div>
        </div>
        <main className="flex-1 p-4">
          {/* Breadcrumb Navigation */}
          <Breadcrumb />
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
