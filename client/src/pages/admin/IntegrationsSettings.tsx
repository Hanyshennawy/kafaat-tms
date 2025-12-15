import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, CheckCircle, XCircle, AlertTriangle, ExternalLink, RefreshCw,
  Shield, Key, Link2, Plug, Server, Database, Lock, Cloud
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

// Integration status data (will be replaced with tRPC calls)
const integrations = [
  {
    id: "uaepass",
    name: "UAE Pass",
    description: "UAE National Digital Identity for Single Sign-On",
    category: "authentication",
    status: "disabled",
    configured: false,
    icon: Shield,
    requiredFor: ["SSO", "Identity Verification"],
    documentation: "https://docs.uaepass.ae",
  },
  {
    id: "azuread",
    name: "Azure Active Directory",
    description: "Microsoft Azure AD for enterprise authentication",
    category: "authentication",
    status: "disabled",
    configured: false,
    icon: Cloud,
    requiredFor: ["Enterprise SSO", "User Management"],
    documentation: "https://docs.microsoft.com/azure/active-directory",
  },
  {
    id: "examus",
    name: "Examus Proctoring",
    description: "AI-powered exam proctoring and monitoring",
    category: "assessment",
    status: "disabled",
    configured: false,
    icon: Shield,
    requiredFor: ["Remote Exams", "Assessment Integrity"],
    documentation: "https://examus.com/docs",
  },
  {
    id: "trustell",
    name: "TrusTell Blockchain",
    description: "Blockchain verification for licenses and credentials",
    category: "verification",
    status: "disabled",
    configured: false,
    icon: Lock,
    requiredFor: ["License Verification", "Credential Authenticity"],
    documentation: "https://trustell.ae/docs",
  },
  {
    id: "almanhal",
    name: "Al Manhal",
    description: "Integration with MOE teacher records system",
    category: "moe",
    status: "disabled",
    configured: false,
    icon: Database,
    requiredFor: ["Teacher Profiles", "Historical Records"],
    documentation: null,
  },
  {
    id: "bayanati",
    name: "Bayanati",
    description: "UAE Government HR system integration",
    category: "moe",
    status: "disabled",
    configured: false,
    icon: Server,
    requiredFor: ["HR Data Sync", "Employee Records"],
    documentation: null,
  },
  {
    id: "payment",
    name: "Payment Gateway (Stripe)",
    description: "Online payment processing for license fees",
    category: "payments",
    status: "disabled",
    configured: false,
    icon: Key,
    requiredFor: ["License Payments", "Subscription Billing"],
    documentation: "https://stripe.com/docs",
  },
  {
    id: "openai",
    name: "OpenAI API",
    description: "AI-powered features and recommendations",
    category: "ai",
    status: "active",
    configured: true,
    icon: Plug,
    requiredFor: ["Career Recommendations", "Resume Parsing", "Analytics"],
    documentation: "https://platform.openai.com/docs",
  },
  {
    id: "email",
    name: "Email Service (SMTP)",
    description: "Email notifications and communications",
    category: "notifications",
    status: "disabled",
    configured: false,
    icon: Link2,
    requiredFor: ["Email Notifications", "Reports Delivery"],
    documentation: null,
  },
  {
    id: "sms",
    name: "SMS Gateway",
    description: "SMS notifications for OTP and alerts",
    category: "notifications",
    status: "disabled",
    configured: false,
    icon: Link2,
    requiredFor: ["OTP Verification", "SMS Alerts"],
    documentation: null,
  },
];

const categories = [
  { id: "all", name: "All Integrations" },
  { id: "authentication", name: "Authentication" },
  { id: "assessment", name: "Assessment" },
  { id: "verification", name: "Verification" },
  { id: "moe", name: "MOE Systems" },
  { id: "payments", name: "Payments" },
  { id: "ai", name: "AI Services" },
  { id: "notifications", name: "Notifications" },
];

export default function IntegrationsSettings() {
  const { user } = useAuth();

  const getStatusBadge = (status: string, configured: boolean) => {
    if (status === "active" && configured) {
      return (
        <Badge className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    if (status === "error") {
      return (
        <Badge className="bg-red-100 text-red-700">
          <XCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      );
    }
    if (status === "pending" || !configured) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Not Configured
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700">
        <XCircle className="h-3 w-3 mr-1" />
        Disabled
      </Badge>
    );
  };

  const activeCount = integrations.filter(i => i.status === "active" && i.configured).length;
  const totalCount = integrations.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            Integrations
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage external service connections and APIs
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold text-green-600">{activeCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disabled</p>
                <p className="text-3xl font-bold text-gray-600">{totalCount - activeCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{totalCount}</p>
              </div>
              <Plug className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health</p>
                <p className="text-3xl font-bold text-green-600">100%</p>
              </div>
              <Shield className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Categories */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-2 p-2">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {integrations
                .filter(i => category.id === "all" || i.category === category.id)
                .map((integration) => {
                  const IconComponent = integration.icon;
                  return (
                    <Card key={integration.id}>
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              integration.status === "active" ? "bg-green-100" : "bg-gray-100"
                            }`}>
                              <IconComponent className={`h-5 w-5 ${
                                integration.status === "active" ? "text-green-600" : "text-gray-600"
                              }`} />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{integration.name}</CardTitle>
                              {getStatusBadge(integration.status, integration.configured)}
                            </div>
                          </div>
                          <Switch 
                            checked={integration.status === "active" && integration.configured}
                            disabled={!integration.configured}
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-3">
                          {integration.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {integration.requiredFor.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Configure
                          </Button>
                          {integration.documentation && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={integration.documentation} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Docs
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Configuration Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Integration Configuration</h3>
              <p className="text-sm text-blue-700 mt-1">
                Most integrations are currently disabled for testing purposes. To enable an integration:
              </p>
              <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>Obtain the required API credentials from the service provider</li>
                <li>Set the environment variables in your deployment configuration</li>
                <li>Enable the integration using the toggle switch above</li>
                <li>Test the connection using the "Test Connection" button</li>
              </ol>
              <p className="text-sm text-blue-700 mt-2">
                Refer to the documentation for each integration for specific setup instructions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
