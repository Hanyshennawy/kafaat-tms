import { useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Settings,
  Shield,
  Check,
  Lock,
  Search,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

// ============================================================================
// TYPES
// ============================================================================

interface SaasAppCard {
  id: number;
  appCode: string;
  name: string;
  displayName: string;
  shortDescription: string;
  category: string;
  tags: string[];
  iconUrl: string | null;
  primaryColor: string;
  status: "active" | "maintenance" | "coming_soon" | "deprecated";
  features: string[];
  isEnabled: boolean;
  actions: {
    id: string;
    label: string;
    icon: string;
    url: string;
    variant: "primary" | "secondary" | "outline";
  }[];
}

// ============================================================================
// APP CARD COMPONENT
// ============================================================================

interface AppCardProps {
  app: SaasAppCard;
  viewMode: "grid" | "list";
}

function AppCard({ app, viewMode }: AppCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusBadge = () => {
    switch (app.status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Maintenance</Badge>;
      case "coming_soon":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Coming Soon</Badge>;
      case "deprecated":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Deprecated</Badge>;
    }
  };

  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case "ExternalLink":
        return <ExternalLink className="h-4 w-4" />;
      case "Settings":
        return <Settings className="h-4 w-4" />;
      case "Shield":
        return <Shield className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center p-4 gap-4">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${app.primaryColor}20` }}
            >
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: app.primaryColor }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{app.displayName}</h3>
                {getStatusBadge()}
                {!app.isEnabled && (
                  <Badge variant="outline" className="text-muted-foreground">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {app.shortDescription}
              </p>
            </div>

            {/* Tags */}
            <div className="hidden md:flex gap-1 shrink-0">
              {app.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              {app.isEnabled ? (
                app.actions.slice(0, 2).map((action) => (
                  <Link key={action.id} href={action.url}>
                    <Button
                      size="sm"
                      variant={action.variant === "primary" ? "default" : "outline"}
                    >
                      {getActionIcon(action.icon)}
                      <span className="ml-1 hidden sm:inline">{action.label}</span>
                    </Button>
                  </Link>
                ))
              ) : (
                <Button size="sm" variant="outline" disabled>
                  <Lock className="h-4 w-4 mr-1" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={`h-full transition-all duration-200 ${
          isHovered ? "shadow-lg scale-[1.02]" : ""
        } ${!app.isEnabled ? "opacity-75" : ""}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${app.primaryColor}20` }}
            >
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: app.primaryColor }}
              />
            </div>

            {/* Status */}
            <div className="flex gap-1">
              {getStatusBadge()}
              {!app.isEnabled && (
                <Badge variant="outline" className="text-muted-foreground">
                  <Lock className="h-3 w-3" />
                </Badge>
              )}
            </div>
          </div>

          <CardTitle className="mt-3 text-lg">{app.displayName}</CardTitle>
          <CardDescription className="line-clamp-2">
            {app.shortDescription}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Features */}
          <div className="space-y-1">
            {app.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-3 w-3 text-green-500" />
                <span className="truncate">{feature}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {app.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {app.isEnabled ? (
              <>
                {app.actions.slice(0, 1).map((action) => (
                  <Link key={action.id} href={action.url} className="flex-1">
                    <Button className="w-full" size="sm">
                      {getActionIcon(action.icon)}
                      <span className="ml-2">{action.label}</span>
                    </Button>
                  </Link>
                ))}
                {app.actions.length > 1 && (
                  <Link href={app.actions[1].url}>
                    <Button size="sm" variant="outline">
                      {getActionIcon(app.actions[1].icon)}
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Button className="w-full" size="sm" variant="outline" disabled>
                <Lock className="h-4 w-4 mr-2" />
                Upgrade to Access
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// MARKETPLACE PAGE
// ============================================================================

export default function MarketplaceCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch apps from API
  const { data: apps, isLoading: appsLoading } = trpc.catalog.getAllApps.useQuery();
  const { data: categories } = trpc.catalog.getCategories.useQuery();

  // Filter apps
  const filteredApps = apps?.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || app.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group by category for tabbed view
  const appsByCategory = filteredApps?.reduce(
    (acc, app) => {
      if (!acc[app.category]) {
        acc[app.category] = [];
      }
      acc[app.category].push(app);
      return acc;
    },
    {} as Record<string, SaasAppCard[]>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Application Catalog</h1>
        <p className="text-muted-foreground mt-1">
          Explore and manage your talent management applications
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex border rounded-lg">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-r-none"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-l-none"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{filteredApps?.length || 0} applications</span>
        <span>•</span>
        <span>{filteredApps?.filter((a) => a.isEnabled).length || 0} enabled</span>
        <span>•</span>
        <span>{filteredApps?.filter((a) => !a.isEnabled).length || 0} locked</span>
      </div>

      {/* Loading State */}
      {appsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardHeader>
                <div className="h-12 w-12 bg-muted rounded-lg" />
                <div className="h-5 w-32 bg-muted rounded mt-3" />
                <div className="h-4 w-full bg-muted rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Apps Grid/List */}
      {!appsLoading && viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredApps?.map((app) => (
            <AppCard key={app.id} app={app} viewMode="grid" />
          ))}
        </div>
      )}

      {!appsLoading && viewMode === "list" && (
        <div className="space-y-2">
          {filteredApps?.map((app) => (
            <AppCard key={app.id} app={app} viewMode="list" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!appsLoading && filteredApps?.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No applications found</h3>
            <p className="mt-1">Try adjusting your search or filter criteria</p>
          </div>
        </Card>
      )}

      {/* Category Tabs (Alternative View) - Currently disabled
      {appsByCategory && Object.keys(appsByCategory).length > 0 && (
        <Tabs defaultValue={Object.keys(appsByCategory)[0]} className="mt-8">
          <TabsList>
            {Object.keys(appsByCategory).map((category) => (
              <TabsTrigger key={category} value={category}>
                {category} ({appsByCategory[category]?.length ?? 0})
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(appsByCategory).map(([category, categoryApps]) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryApps.map((app) => (
                  <AppCard key={app.id} app={app} viewMode="grid" />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
      */}
    </div>
  );
}
