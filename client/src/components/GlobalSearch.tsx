/**
 * Global Search Component (Cmd+K / Ctrl+K)
 * 
 * Provides quick access to all features, pages, and data.
 * Supports fuzzy search across multiple entity types.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Command,
  FileText,
  Users,
  Briefcase,
  Target,
  GraduationCap,
  TrendingUp,
  MessageSquare,
  Settings,
  User,
  Bell,
  BarChart2,
  Calendar,
  Clock,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: SearchCategory;
  icon: React.ElementType;
  path: string;
  keywords?: string[];
  badge?: string;
  recent?: boolean;
}

type SearchCategory =
  | "page"
  | "action"
  | "employee"
  | "career"
  | "performance"
  | "licensing"
  | "recruitment"
  | "setting";

// ============================================================================
// SEARCH DATA
// ============================================================================

const allSearchItems: SearchResult[] = [
  // Quick Actions
  { id: "action-new-goal", title: "Create New Goal", description: "Add a performance goal", category: "action", icon: Target, path: "/performance/goals", badge: "Quick" },
  { id: "action-new-survey", title: "Create Survey", description: "Create engagement survey", category: "action", icon: MessageSquare, path: "/engagement/surveys", badge: "Quick" },
  { id: "action-post-job", title: "Post New Job", description: "Create job requisition", category: "action", icon: Briefcase, path: "/recruitment/requisitions", badge: "Quick" },
  { id: "action-add-employee", title: "Add Employee", description: "Register new employee", category: "action", icon: Users, path: "/users", badge: "Quick" },

  // Dashboard & Main Pages
  { id: "page-dashboard", title: "Dashboard", description: "Main dashboard overview", category: "page", icon: BarChart2, path: "/dashboard", keywords: ["home", "overview", "stats"] },
  { id: "page-notifications", title: "Notifications", description: "View all notifications", category: "page", icon: Bell, path: "/notifications" },
  { id: "page-profile", title: "My Profile", description: "View and edit your profile", category: "page", icon: User, path: "/profile" },
  { id: "page-reports", title: "Reports", description: "Analytics and reports", category: "page", icon: FileText, path: "/reports" },

  // Career Progression
  { id: "career-paths", title: "Career Paths", description: "Browse career progressions", category: "career", icon: TrendingUp, path: "/career/paths", keywords: ["promotion", "growth"] },
  { id: "career-skills", title: "Skills Management", description: "Manage skills and competencies", category: "career", icon: Star, path: "/career/skills" },
  { id: "career-recommendations", title: "Career Recommendations", description: "AI-powered suggestions", category: "career", icon: Zap, path: "/career/recommendations" },
  { id: "career-employee-skills", title: "Employee Skills", description: "Track employee skills", category: "career", icon: Users, path: "/career/employee-skills" },

  // Performance Management
  { id: "perf-dashboard", title: "Performance Dashboard", description: "Performance overview", category: "performance", icon: Target, path: "/performance/dashboard" },
  { id: "perf-cycles", title: "Performance Cycles", description: "Manage review cycles", category: "performance", icon: Calendar, path: "/performance/cycles" },
  { id: "perf-goals", title: "Goals", description: "Track goals and OKRs", category: "performance", icon: Target, path: "/performance/goals", keywords: ["okr", "objective"] },
  { id: "perf-self-appraisal", title: "Self Appraisal", description: "Submit self review", category: "performance", icon: User, path: "/performance/self-appraisal" },
  { id: "perf-360", title: "360° Feedback", description: "Peer feedback", category: "performance", icon: Users, path: "/performance/360-feedback" },

  // Teachers Licensing
  { id: "lic-portal", title: "Licensing Portal", description: "Public licensing portal", category: "licensing", icon: GraduationCap, path: "/licensing/portal" },
  { id: "lic-apply", title: "Apply for License", description: "Submit license application", category: "licensing", icon: FileText, path: "/licensing/apply", badge: "Apply" },
  { id: "lic-my-apps", title: "My Applications", description: "Track your applications", category: "licensing", icon: Clock, path: "/licensing/my-applications" },
  { id: "lic-management", title: "Licenses Management", description: "Manage all licenses", category: "licensing", icon: Settings, path: "/licensing/licenses" },
  { id: "lic-verify", title: "Verify License", description: "Verify a teaching license", category: "licensing", icon: Search, path: "/licensing/verify" },
  { id: "lic-cpd", title: "CPD Records", description: "Continuing professional development", category: "licensing", icon: TrendingUp, path: "/licensing/cpd" },

  // Recruitment
  { id: "rec-dashboard", title: "Recruitment Dashboard", description: "Hiring overview", category: "recruitment", icon: Briefcase, path: "/recruitment/dashboard" },
  { id: "rec-jobs", title: "Job Requisitions", description: "Open positions", category: "recruitment", icon: Briefcase, path: "/recruitment/requisitions", keywords: ["job", "vacancy", "opening"] },
  { id: "rec-candidates", title: "Candidates", description: "Applicant tracking", category: "recruitment", icon: Users, path: "/recruitment/candidates" },
  { id: "rec-interviews", title: "Interviews", description: "Interview scheduling", category: "recruitment", icon: Calendar, path: "/recruitment/interviews" },

  // Engagement
  { id: "eng-dashboard", title: "Engagement Dashboard", description: "Employee engagement", category: "page", icon: MessageSquare, path: "/engagement/dashboard" },
  { id: "eng-surveys", title: "Surveys", description: "Employee surveys", category: "page", icon: FileText, path: "/engagement/surveys" },
  { id: "eng-activities", title: "Engagement Activities", description: "Team activities", category: "page", icon: Users, path: "/engagement/activities" },

  // Succession & Workforce
  { id: "succ-plans", title: "Succession Plans", description: "Leadership pipeline", category: "page", icon: Users, path: "/succession/plans" },
  { id: "succ-talent", title: "Talent Pools", description: "High potential employees", category: "page", icon: Star, path: "/succession/talent-pools" },
  { id: "wf-scenarios", title: "Workforce Scenarios", description: "Workforce planning", category: "page", icon: BarChart2, path: "/workforce/scenarios" },

  // Staff Placement
  { id: "place-dashboard", title: "Placement Dashboard", description: "Staff placement", category: "page", icon: Users, path: "/placement" },
  { id: "place-requests", title: "Placement Requests", description: "Transfer requests", category: "page", icon: FileText, path: "/placement/requests" },
  { id: "place-directory", title: "Staff Directory", description: "Employee directory", category: "page", icon: Users, path: "/placement/directory" },

  // Competency & Psychometric
  { id: "comp-frameworks", title: "Competency Frameworks", description: "Competency models", category: "page", icon: Target, path: "/competency/frameworks" },
  { id: "comp-my", title: "My Competencies", description: "Your competency profile", category: "page", icon: User, path: "/competency/my-competencies" },
  { id: "psych-dashboard", title: "Psychometric Assessments", description: "Personality tests", category: "page", icon: BarChart2, path: "/psychometric" },

  // Settings
  { id: "set-org", title: "Organization Settings", description: "Configure organization", category: "setting", icon: Settings, path: "/organization-settings" },
  { id: "set-users", title: "Users Management", description: "Manage users", category: "setting", icon: Users, path: "/users" },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kafaat-recent-searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter results based on query
  const filteredResults = query.trim()
    ? allSearchItems.filter((item) => {
        const searchText = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchText) ||
          item.description?.toLowerCase().includes(searchText) ||
          item.keywords?.some((k) => k.toLowerCase().includes(searchText)) ||
          item.category.toLowerCase().includes(searchText)
        );
      })
    : allSearchItems.slice(0, 8); // Show top items when no query

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredResults.length - 1
        );
      } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredResults[selectedIndex]);
      }
    },
    [filteredResults, selectedIndex]
  );

  // Handle selection
  const handleSelect = (item: SearchResult) => {
    // Save to recent searches
    const newRecent = [item.title, ...recentSearches.filter((s) => s !== item.title)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem("kafaat-recent-searches", JSON.stringify(newRecent));

    // Navigate
    setLocation(item.path);
    setOpen(false);
    setQuery("");
  };

  // Group results by category
  const groupedResults = filteredResults.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<SearchCategory, SearchResult[]>);

  const categoryLabels: Record<SearchCategory, string> = {
    action: "Quick Actions",
    page: "Pages",
    employee: "Employees",
    career: "Career",
    performance: "Performance",
    licensing: "Licensing",
    recruitment: "Recruitment",
    setting: "Settings",
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-background border rounded">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-2xl gap-0 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center border-b px-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, features, employees..."
              className="border-0 focus-visible:ring-0 text-lg py-6"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs bg-muted rounded">ESC</kbd>
          </div>

          {/* Results */}
          <ScrollArea className="max-h-[400px]">
            <div className="p-2">
              {filteredResults.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No results found for "{query}"</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category} className="mb-4">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {categoryLabels[category as SearchCategory]}
                    </div>
                    {items.map((item, index) => {
                      const globalIndex = filteredResults.indexOf(item);
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            globalIndex === selectedIndex
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              globalIndex === selectedIndex
                                ? "bg-primary-foreground/20"
                                : "bg-muted"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge
                                  variant={
                                    globalIndex === selectedIndex
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p
                                className={`text-sm truncate ${
                                  globalIndex === selectedIndex
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                          <ArrowRight
                            className={`h-4 w-4 ${
                              globalIndex === selectedIndex
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground bg-muted/50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-background border rounded">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded">↵</kbd>
                to select
              </span>
            </div>
            <span>Kafaat TMS</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GlobalSearch;
