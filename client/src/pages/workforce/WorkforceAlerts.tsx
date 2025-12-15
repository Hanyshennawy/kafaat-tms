import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Bell, CheckCircle2, Clock, Users, Calendar, Award, TrendingDown, Building2, Filter, Settings, X } from "lucide-react";

const DEMO_ALERTS = [
  { id: 1, type: "critical", category: "licensing", title: "5 Teaching Licenses Expiring Soon", description: "5 educators have licenses expiring within the next 30 days", date: "2024-01-15", school: "Al Noor Academy", action: "View Educators", resolved: false },
  { id: 2, type: "critical", category: "staffing", title: "Math Department Understaffed", description: "Mathematics department is 2 teachers below required staffing level", date: "2024-01-14", school: "Al Noor Academy", action: "Create Requisition", resolved: false },
  { id: 3, type: "warning", category: "performance", title: "Low Performance Scores Detected", description: "3 educators scored below expectations in recent evaluations", date: "2024-01-13", school: "Emirates School", action: "View Details", resolved: false },
  { id: 4, type: "warning", category: "cpd", title: "CPD Hours Deadline Approaching", description: "12 educators have not completed required CPD hours this quarter", date: "2024-01-12", school: "Al Noor Academy", action: "Send Reminders", resolved: false },
  { id: 5, type: "info", category: "succession", title: "Succession Gap Identified", description: "No successor identified for VP Academic position", date: "2024-01-11", school: "Al Noor Academy", action: "Plan Succession", resolved: false },
  { id: 6, type: "info", category: "retirement", title: "Upcoming Retirements", description: "2 senior educators eligible for retirement in 2024", date: "2024-01-10", school: "Al Noor Academy", action: "View Timeline", resolved: false },
  { id: 7, type: "critical", category: "licensing", title: "Expired License - Immediate Action Required", description: "1 educator has an expired teaching license", date: "2024-01-09", school: "Emirates School", action: "Contact Educator", resolved: true },
];

const ALERT_SETTINGS = [
  { id: "license-expiry", name: "License Expiry Alerts", description: "Notify when teaching licenses are expiring", enabled: true },
  { id: "staffing-levels", name: "Staffing Level Alerts", description: "Alert when departments are understaffed", enabled: true },
  { id: "performance", name: "Performance Alerts", description: "Notify about low performance evaluations", enabled: true },
  { id: "cpd-reminders", name: "CPD Hour Reminders", description: "Remind about incomplete CPD requirements", enabled: true },
  { id: "succession", name: "Succession Planning", description: "Alert about succession gaps", enabled: false },
  { id: "retirement", name: "Retirement Notices", description: "Upcoming retirement notifications", enabled: true },
];

export default function WorkforceAlerts() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [showResolved, setShowResolved] = useState(false);
  const [alertSettings, setAlertSettings] = useState(ALERT_SETTINGS);

  const filteredAlerts = DEMO_ALERTS.filter(alert => {
    if (!showResolved && alert.resolved) return false;
    if (typeFilter === "all") return true;
    return alert.type === typeFilter;
  });

  const criticalCount = DEMO_ALERTS.filter(a => a.type === "critical" && !a.resolved).length;
  const warningCount = DEMO_ALERTS.filter(a => a.type === "warning" && !a.resolved).length;
  const infoCount = DEMO_ALERTS.filter(a => a.type === "info" && !a.resolved).length;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning": return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "licensing": return <Award className="h-4 w-4" />;
      case "staffing": return <Users className="h-4 w-4" />;
      case "performance": return <TrendingDown className="h-4 w-4" />;
      case "cpd": return <Calendar className="h-4 w-4" />;
      case "succession": return <Users className="h-4 w-4" />;
      case "retirement": return <Clock className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workforce Alerts</h1>
          <p className="text-muted-foreground">Monitor critical staffing and compliance notifications</p>
        </div>
        <Button variant="outline"><Settings className="h-4 w-4 mr-2" />Alert Settings</Button>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Info</p>
                <p className="text-2xl font-bold text-blue-600">{infoCount}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">{DEMO_ALERTS.filter(a => a.resolved).length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="settings">Notification Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4 mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Alerts</SelectItem>
                    <SelectItem value="critical">Critical Only</SelectItem>
                    <SelectItem value="warning">Warnings</SelectItem>
                    <SelectItem value="info">Information</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch 
                    id="show-resolved" 
                    checked={showResolved} 
                    onCheckedChange={setShowResolved} 
                  />
                  <Label htmlFor="show-resolved">Show resolved</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert List */}
          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <Card key={alert.id} className={alert.resolved ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getAlertIcon(alert.type)}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{alert.title}</h3>
                          {alert.resolved && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getCategoryIcon(alert.category)}
                            {alert.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />{alert.school}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{alert.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.resolved && (
                        <>
                          <Button size="sm">{alert.action}</Button>
                          <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure which alerts you want to receive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertSettings.map(setting => (
                  <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{setting.name}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch 
                      checked={setting.enabled}
                      onCheckedChange={(checked) => {
                        setAlertSettings(alertSettings.map(s => 
                          s.id === setting.id ? { ...s, enabled: checked } : s
                        ));
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
