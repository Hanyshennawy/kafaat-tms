import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Building2, TrendingUp, Settings, ChevronRight, 
  Shield, BarChart3, Database, Globe, Activity,
  Server, Lock, AlertTriangle, CheckCircle, Cpu,
  CreditCard, FileText, UserCog, Zap, Layers
} from "lucide-react";
import { Link } from "wouter";

interface SuperAdminDashboardProps {
  userName: string;
}

export function SuperAdminDashboard({ userName }: SuperAdminDashboardProps) {
  // System-wide metrics
  const systemStats = {
    totalOrganizations: 45,
    totalUsers: 12500,
    activeUsers: 8420,
    totalTeachers: 4200,
    licensedTeachers: 3950,
    systemUptime: 99.9,
    apiRequests: "2.4M",
    storageUsed: 78,
    pendingIssues: 3,
    activeTenants: 42,
  };

  // Organization overview
  const topOrganizations = [
    { name: "Ministry of Education", users: 3500, status: "active", type: "Government" },
    { name: "ADEK", users: 2200, status: "active", type: "Authority" },
    { name: "KHDA", users: 1800, status: "active", type: "Authority" },
    { name: "Private Schools Group", users: 1500, status: "active", type: "Private" },
  ];

  // System health
  const systemHealth = [
    { service: "API Gateway", status: "healthy", latency: "45ms" },
    { service: "Database", status: "healthy", latency: "12ms" },
    { service: "Authentication", status: "healthy", latency: "23ms" },
    { service: "File Storage", status: "warning", latency: "180ms" },
  ];

  // Admin tasks
  const adminTasks = [
    {
      id: 1,
      icon: AlertTriangle,
      title: "System Alerts",
      description: "Review system alerts and warnings",
      link: "/admin/integrations",
      count: 3,
      priority: "high",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      id: 2,
      icon: Building2,
      title: "Pending Organizations",
      description: "New organization registrations",
      link: "/organization",
      count: 5,
      priority: "medium",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      icon: UserCog,
      title: "User Access Requests",
      description: "Role upgrade requests pending",
      link: "/admin/rbac",
      count: 12,
      priority: "medium",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      id: 4,
      icon: CreditCard,
      title: "Billing Issues",
      description: "Payment failures to review",
      link: "/pricing",
      count: 2,
      priority: "high",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
  ];

  // Quick actions
  const quickActions = [
    { icon: Building2, label: "Organizations", link: "/organization", color: "text-blue-600" },
    { icon: Users, label: "User Management", link: "/users", color: "text-purple-600" },
    { icon: Settings, label: "Integrations", link: "/admin/integrations", color: "text-gray-600" },
    { icon: BarChart3, label: "Analytics", link: "/analytics", color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground">Welcome back, {userName}</p>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Shield className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalOrganizations}</div>
            <p className="text-xs text-green-600">{systemStats.activeTenants} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{systemStats.activeUsers.toLocaleString()} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licensed Teachers</CardTitle>
            <FileText className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.licensedTeachers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">of {systemStats.totalTeachers.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.apiRequests}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.systemUptime}%</div>
            <p className="text-xs text-green-600">Excellent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Admin Tasks */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
            <CardDescription>Items requiring admin attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {adminTasks.map((task) => (
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
            <CardTitle>Quick Access</CardTitle>
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
        {/* Top Organizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top Organizations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topOrganizations.map((org, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{org.users.toLocaleString()}</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    service.status === 'healthy' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {service.status === 'healthy' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <span className="font-medium text-sm">{service.service}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{service.latency}</span>
                  <Badge variant="outline" className={
                    service.status === 'healthy' 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-yellow-50 text-yellow-700'
                  }>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={systemStats.storageUsed} className="h-2 mb-2" />
            <p className="text-sm font-bold">{systemStats.storageUsed}% used</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-600" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={45} className="h-2 mb-2" />
            <p className="text-sm font-bold">45% average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,247</p>
            <p className="text-xs text-muted-foreground">Current connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-600" />
              Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
