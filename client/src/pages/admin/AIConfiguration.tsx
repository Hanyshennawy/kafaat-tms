/**
 * AI CONFIGURATION MANAGEMENT PAGE
 * 
 * Comprehensive UI for managing:
 * - AI model configurations and prompts
 * - Knowledge base entries
 * - Assessment frameworks
 * - Question templates
 * - Question generation
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Brain, Settings, Database, FileText, Sparkles, Plus, Save, Trash2, 
  Edit, Copy, Eye, ChevronRight, Loader2, Check, AlertCircle, RefreshCw,
  BookOpen, Code, Wand2, Upload, Download, Search, Filter, BarChart3
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

// ============================================================================
// TYPES
// ============================================================================

interface AIConfig {
  id: number;
  name: string;
  configType: string;
  modelProvider: string;
  modelName: string;
  temperature: string;
  maxTokens: number;
  systemPrompt: string;
  status: string;
  isDefault: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AIConfigurationPage() {
  const [activeTab, setActiveTab] = useState("configurations");
  const { toast } = useToast();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Configuration Center
          </h1>
          <p className="text-muted-foreground">
            Customize AI models, prompts, knowledge base, and question generation settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Config
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full mb-6">
          <TabsTrigger value="configurations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            AI Configurations
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="frameworks" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Frameworks
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Generate Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configurations">
          <AIConfigurationsTab />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeBaseTab />
        </TabsContent>

        <TabsContent value="frameworks">
          <FrameworksTab />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="generate">
          <QuestionGenerationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// AI CONFIGURATIONS TAB
// ============================================================================

function AIConfigurationsTab() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const { toast } = useToast();
  
  const { data: configurations = [], refetch, isLoading } = trpc.aiConfig.getAllConfigurations.useQuery();
  const createMutation = trpc.aiConfig.createConfiguration.useMutation({
    onSuccess: () => {
      toast({ title: "Configuration created successfully" });
      refetch();
      setShowCreateDialog(false);
    }
  });
  const deleteMutation = trpc.aiConfig.deleteConfiguration.useMutation({
    onSuccess: () => {
      toast({ title: "Configuration deleted" });
      refetch();
    }
  });

  const configTypes = [
    { value: "psychometric_generation", label: "Psychometric Question Generation" },
    { value: "competency_generation", label: "Competency Question Generation" },
    { value: "cognitive_generation", label: "Cognitive Test Generation" },
    { value: "interview_generation", label: "Interview Question Generation" },
    { value: "assessment_scoring", label: "Assessment Scoring" },
    { value: "report_generation", label: "Report Generation" }
  ];

  const modelOptions = [
    { provider: "together", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", label: "Llama 3.3 70B (Recommended)" },
    { provider: "together", model: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo", label: "Llama 3.1 405B (Highest Quality)" },
    { provider: "together", model: "meta-llama/Llama-3.2-3B-Instruct-Turbo", label: "Llama 3.2 3B (Fast)" },
    { provider: "together", model: "mistralai/Mixtral-8x22B-Instruct-v0.1", label: "Mixtral 8x22B" },
    { provider: "openai", model: "gpt-4o", label: "GPT-4o (OpenAI)" },
    { provider: "anthropic", model: "claude-3-opus-20240229", label: "Claude 3 Opus" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">AI Model Configurations</h2>
          <p className="text-muted-foreground">Configure AI models, prompts, and parameters for different use cases</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create AI Configuration</DialogTitle>
              <DialogDescription>
                Configure AI model settings and prompts for question generation
              </DialogDescription>
            </DialogHeader>
            <ConfigurationForm 
              configTypes={configTypes}
              modelOptions={modelOptions}
              onSubmit={async (data) => {
                await createMutation.mutateAsync(data);
              }}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : configurations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Configurations Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first AI configuration to start generating questions
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Configuration
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {configurations.map((config: any) => (
            <Card key={config.id} className={config.status !== "active" ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    {config.isDefault && <Badge>Default</Badge>}
                    <Badge variant={config.status === "active" ? "default" : "secondary"}>
                      {config.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteMutation.mutate({ id: config.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{config.configType}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <p className="font-medium">{config.modelName.split('/').pop()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Provider:</span>
                    <p className="font-medium capitalize">{config.modelProvider}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temperature:</span>
                    <p className="font-medium">{config.temperature}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Tokens:</span>
                    <p className="font-medium">{config.maxTokens}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-muted-foreground text-sm">System Prompt:</span>
                  <p className="text-sm mt-1 p-2 bg-muted rounded-md line-clamp-2">
                    {config.systemPrompt}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CONFIGURATION FORM
// ============================================================================

interface ConfigFormProps {
  configTypes: { value: string; label: string }[];
  modelOptions: { provider: string; model: string; label: string }[];
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  initialData?: any;
}

function ConfigurationForm({ configTypes, modelOptions, onSubmit, isLoading, initialData }: ConfigFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    configType: initialData?.configType || "psychometric_generation",
    modelProvider: initialData?.modelProvider || "together",
    modelName: initialData?.modelName || "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    temperature: initialData?.temperature || 0.7,
    maxTokens: initialData?.maxTokens || 4096,
    topP: initialData?.topP || 0.9,
    systemPrompt: initialData?.systemPrompt || "",
    contextInstructions: initialData?.contextInstructions || "",
    qualityThreshold: initialData?.qualityThreshold || 7,
    isDefault: initialData?.isDefault || false
  });

  const handleModelChange = (value: string) => {
    const option = modelOptions.find(o => o.model === value);
    if (option) {
      setFormData(prev => ({
        ...prev,
        modelName: option.model,
        modelProvider: option.provider as any
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const defaultPrompts: Record<string, string> = {
    psychometric_generation: `You are an expert industrial-organizational psychologist with deep expertise in psychometric assessment design. You specialize in creating valid, reliable assessment items following the methodologies of leading assessment providers (SHL, Hogan, Gallup, DISC).

Your questions must:
1. Measure specific psychological constructs reliably
2. Avoid obvious "correct" answers to prevent faking
3. Use scenario-based and forced-choice formats when appropriate
4. Include behavioral anchors for clarity
5. Be culturally appropriate for UAE educational context
6. Follow psychometric best practices for validity`,

    competency_generation: `You are an expert educator assessment designer for the UAE Ministry of Education (MOE). You specialize in creating competency-based assessments aligned with the National Educators' Competency Framework.

Your questions must:
1. Directly assess the specified competency standard
2. Use realistic UAE educational scenarios
3. Include multiple competency levels (foundation to expert)
4. Align with MOE professional standards
5. Reflect UAE cultural values and educational priorities
6. Provide clear behavioral indicators`,

    cognitive_generation: `You are an expert in cognitive assessment design with expertise in measuring reasoning abilities for educational professionals.

Your questions must:
1. Measure specific cognitive abilities (verbal, numerical, abstract reasoning)
2. Be appropriately timed for the difficulty level
3. Have clear, unambiguous correct answers
4. Progress in difficulty within sets
5. Be free from cultural bias`
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Configuration Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Psychometric Question Generator v1"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="configType">Configuration Type</Label>
          <Select value={formData.configType} onValueChange={(v) => {
            setFormData(prev => ({ 
              ...prev, 
              configType: v,
              systemPrompt: defaultPrompts[v] || prev.systemPrompt
            }));
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {configTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">AI Model</Label>
        <Select value={formData.modelName} onValueChange={handleModelChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modelOptions.map(option => (
              <SelectItem key={option.model} value={option.model}>
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{option.provider}</Badge>
                  {option.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Temperature: {formData.temperature}</Label>
          <Slider
            value={[formData.temperature]}
            onValueChange={([v]) => setFormData(prev => ({ ...prev, temperature: v }))}
            min={0}
            max={1}
            step={0.1}
          />
          <p className="text-xs text-muted-foreground">Lower = more deterministic, Higher = more creative</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxTokens">Max Tokens</Label>
          <Input
            id="maxTokens"
            type="number"
            value={formData.maxTokens}
            onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
            min={100}
            max={32000}
          />
        </div>
        <div className="space-y-2">
          <Label>Quality Threshold: {formData.qualityThreshold}/10</Label>
          <Slider
            value={[formData.qualityThreshold]}
            onValueChange={([v]) => setFormData(prev => ({ ...prev, qualityThreshold: v }))}
            min={1}
            max={10}
            step={1}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="systemPrompt">System Prompt</Label>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => setFormData(prev => ({ 
              ...prev, 
              systemPrompt: defaultPrompts[prev.configType] || "" 
            }))}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Load Default
          </Button>
        </div>
        <Textarea
          id="systemPrompt"
          value={formData.systemPrompt}
          onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
          placeholder="Enter the system prompt that defines how the AI should behave..."
          className="min-h-[200px] font-mono text-sm"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contextInstructions">Additional Context Instructions (Optional)</Label>
        <Textarea
          id="contextInstructions"
          value={formData.contextInstructions}
          onChange={(e) => setFormData(prev => ({ ...prev, contextInstructions: e.target.value }))}
          placeholder="Add any additional instructions or context..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={(v) => setFormData(prev => ({ ...prev, isDefault: v }))}
        />
        <Label htmlFor="isDefault">Set as default for this configuration type</Label>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Configuration
        </Button>
      </DialogFooter>
    </form>
  );
}

// ============================================================================
// KNOWLEDGE BASE TAB
// ============================================================================

function KnowledgeBaseTab() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  
  const { data: knowledgeItems = [], refetch, isLoading } = trpc.aiConfig.getAllKnowledgeBase.useQuery();
  const createMutation = trpc.aiConfig.createKnowledgeBase.useMutation({
    onSuccess: () => {
      toast({ title: "Knowledge base entry created" });
      refetch();
      setShowCreateDialog(false);
    }
  });
  const deleteMutation = trpc.aiConfig.deleteKnowledgeBase.useMutation({
    onSuccess: () => {
      toast({ title: "Entry deleted" });
      refetch();
    }
  });

  const [newEntry, setNewEntry] = useState({
    name: "",
    knowledgeType: "competency_framework" as const,
    category: "",
    content: "",
    source: "",
    version: "",
    priority: 0
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Knowledge Base</h2>
          <p className="text-muted-foreground">Manage domain knowledge used for AI-powered question generation</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Knowledge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Knowledge Base Entry</DialogTitle>
              <DialogDescription>
                Add domain knowledge, frameworks, or methodologies for AI context
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newEntry.name}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., UAE National Competency Framework"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={newEntry.knowledgeType} 
                    onValueChange={(v: any) => setNewEntry(prev => ({ ...prev, knowledgeType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competency_framework">Competency Framework</SelectItem>
                      <SelectItem value="psychometric_methodology">Psychometric Methodology</SelectItem>
                      <SelectItem value="assessment_rubric">Assessment Rubric</SelectItem>
                      <SelectItem value="question_template">Question Template</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={newEntry.category}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Education"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Input
                    value={newEntry.source}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="e.g., UAE MOE"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input
                    value={newEntry.version}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g., 2024.1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Paste or type the knowledge content here..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Priority: {newEntry.priority}</Label>
                <Slider
                  value={[newEntry.priority]}
                  onValueChange={([v]) => setNewEntry(prev => ({ ...prev, priority: v }))}
                  min={0}
                  max={10}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">Higher priority content is used first in AI context</p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => createMutation.mutate(newEntry)}
                disabled={createMutation.isPending || !newEntry.name || !newEntry.content}
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : knowledgeItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Knowledge Base Entries</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add competency frameworks, methodologies, or other domain knowledge
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Knowledge
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {knowledgeItems.map((item: any) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge variant="outline">{item.knowledgeType.replace(/_/g, ' ')}</Badge>
                    <Badge variant={item.status === "active" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteMutation.mutate({ id: item.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{item.category || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source:</span>
                    <p className="font-medium">{item.source || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Version:</span>
                    <p className="font-medium">{item.version || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority:</span>
                    <p className="font-medium">{item.priority}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FRAMEWORKS TAB
// ============================================================================

function FrameworksTab() {
  const { data: builtInFrameworks } = trpc.aiConfig.getBuiltInFrameworks.useQuery();
  const { data: customFrameworks = [] } = trpc.aiConfig.getAllFrameworks.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Assessment Frameworks</h2>
        <p className="text-muted-foreground">Built-in and custom frameworks for psychometric and competency assessments</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Psychometric Frameworks (Built-in)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {builtInFrameworks?.psychometric && Object.entries(builtInFrameworks.psychometric).map(([key, framework]: [string, any]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {framework.name}
                    <Badge variant="secondary">Built-in</Badge>
                  </CardTitle>
                  <CardDescription>{framework.methodology}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Dimensions:</p>
                    <div className="flex flex-wrap gap-1">
                      {framework.dimensions.map((dim: any) => (
                        <Badge key={dim.code} variant="outline">
                          {dim.code}: {dim.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Competency Framework (Built-in)
          </h3>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {builtInFrameworks?.competency?.name || "National Educators' Competency Framework"}
                <Badge variant="secondary">Built-in</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {builtInFrameworks?.competency?.domains?.map((domain: any) => (
                  <div key={domain.code} className="space-y-2">
                    <h4 className="font-medium">{domain.code}: {domain.name}</h4>
                    <ul className="space-y-1">
                      {domain.standards.map((std: any) => (
                        <li key={std.code} className="text-sm text-muted-foreground">
                          {std.code}: {std.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Custom Frameworks
            </h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Framework
            </Button>
          </div>
          {customFrameworks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Custom Frameworks</h3>
                <p className="text-muted-foreground text-center">
                  Create custom assessment frameworks for specialized needs
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {customFrameworks.map((framework: any) => (
                <Card key={framework.id}>
                  <CardHeader>
                    <CardTitle>{framework.name}</CardTitle>
                    <CardDescription>{framework.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TEMPLATES TAB
// ============================================================================

function TemplatesTab() {
  const { data: questionTypeConfigs } = trpc.aiConfig.getQuestionTypeConfigs.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Question Templates</h2>
        <p className="text-muted-foreground">Reusable templates for different question types</p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Supported Question Types</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {questionTypeConfigs && Object.entries(questionTypeConfigs).map(([type, config]: [string, any]) => (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {config.name}
                  <Badge variant="outline">{type}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground mb-2">{config.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">
                    {config.scoringMethod}
                  </Badge>
                  {config.optionsRequired && (
                    <Badge variant="secondary">
                      {config.minOptions}-{config.maxOptions} options
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// QUESTION GENERATION TAB
// ============================================================================

function QuestionGenerationTab() {
  const { toast } = useToast();
  const [generationConfig, setGenerationConfig] = useState({
    category: "psychometric" as const,
    frameworkCode: "big_five",
    dimension: "",
    questionTypes: ["scenario", "forced_choice", "likert"],
    count: 10,
    difficulty: "mixed" as const,
    includeValidityChecks: true,
    includeAntiFaking: true,
    customPrompt: ""
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  const generateMutation = trpc.aiConfig.generateQuestions.useMutation({
    onSuccess: (data) => {
      setGeneratedQuestions(data.questions);
      toast({ 
        title: "Questions Generated!", 
        description: `Successfully generated ${data.count} questions` 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Generation Failed", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const { data: builtInFrameworks } = trpc.aiConfig.getBuiltInFrameworks.useQuery();

  const questionTypeOptions = [
    { value: "mcq", label: "Multiple Choice" },
    { value: "true_false", label: "True/False" },
    { value: "likert", label: "Likert Scale" },
    { value: "scenario", label: "Scenario-Based" },
    { value: "forced_choice", label: "Forced Choice" },
    { value: "ranking", label: "Ranking" },
    { value: "situational_judgment", label: "Situational Judgment" },
    { value: "ipsative_pair", label: "Ipsative Pair" },
    { value: "ipsative_quad", label: "Ipsative Quad" },
    { value: "semantic_differential", label: "Semantic Differential" },
    { value: "behavioral_anchor", label: "Behavioral Anchor" },
    { value: "short_answer", label: "Short Answer" },
    { value: "essay", label: "Essay" },
    { value: "case_study", label: "Case Study" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">AI Question Generator</h2>
        <p className="text-muted-foreground">Generate professional-grade assessment questions using AI</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={generationConfig.category} 
                  onValueChange={(v: any) => setGenerationConfig(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="psychometric">Psychometric</SelectItem>
                    <SelectItem value="competency">Competency</SelectItem>
                    <SelectItem value="cognitive">Cognitive</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Framework</Label>
                <Select 
                  value={generationConfig.frameworkCode} 
                  onValueChange={(v) => setGenerationConfig(prev => ({ ...prev, frameworkCode: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="big_five">Big Five (OCEAN)</SelectItem>
                    <SelectItem value="hogan">Hogan HPI</SelectItem>
                    <SelectItem value="disc">DISC</SelectItem>
                    <SelectItem value="eq">Emotional Intelligence</SelectItem>
                    <SelectItem value="shl">SHL OPQ32</SelectItem>
                    <SelectItem value="gallup">Gallup Strengths</SelectItem>
                    <SelectItem value="leadership">Leadership Competency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Types (Select multiple)</Label>
              <div className="grid grid-cols-3 gap-2">
                {questionTypeOptions.map(option => (
                  <div key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={option.value}
                      checked={generationConfig.questionTypes.includes(option.value)}
                      onChange={(e) => {
                        setGenerationConfig(prev => ({
                          ...prev,
                          questionTypes: e.target.checked
                            ? [...prev.questionTypes, option.value]
                            : prev.questionTypes.filter(t => t !== option.value)
                        }));
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={option.value} className="text-sm font-normal">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Number of Questions: {generationConfig.count}</Label>
                <Slider
                  value={[generationConfig.count]}
                  onValueChange={([v]) => setGenerationConfig(prev => ({ ...prev, count: v }))}
                  min={1}
                  max={50}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select 
                  value={generationConfig.difficulty} 
                  onValueChange={(v: any) => setGenerationConfig(prev => ({ ...prev, difficulty: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="validityChecks"
                  checked={generationConfig.includeValidityChecks}
                  onCheckedChange={(v) => setGenerationConfig(prev => ({ ...prev, includeValidityChecks: v }))}
                />
                <Label htmlFor="validityChecks">Include validity checks</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="antiFaking"
                  checked={generationConfig.includeAntiFaking}
                  onCheckedChange={(v) => setGenerationConfig(prev => ({ ...prev, includeAntiFaking: v }))}
                />
                <Label htmlFor="antiFaking">Apply anti-faking measures</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom Instructions (Optional)</Label>
              <Textarea
                value={generationConfig.customPrompt}
                onChange={(e) => setGenerationConfig(prev => ({ ...prev, customPrompt: e.target.value }))}
                placeholder="Add any specific instructions for question generation..."
                className="min-h-[100px]"
              />
            </div>

            <Button 
              className="w-full" 
              onClick={() => generateMutation.mutate(generationConfig)}
              disabled={generateMutation.isPending || generationConfig.questionTypes.length === 0}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate {generationConfig.count} Questions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Questions Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Generated Questions
              {generatedQuestions.length > 0 && (
                <Badge>{generatedQuestions.length} questions</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Configure settings and generate questions to preview them here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {generatedQuestions.map((question, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{question.questionType}</Badge>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{question.difficulty}</Badge>
                            <Badge variant="secondary">Q: {question.qualityScore}/10</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm">
                        {question.scenario && (
                          <div className="mb-2 p-2 bg-muted rounded-md italic">
                            {question.scenario}
                          </div>
                        )}
                        <p className="font-medium mb-2">{question.questionText}</p>
                        {question.options && question.options.length > 0 && (
                          <ul className="space-y-1 pl-4">
                            {question.options.map((opt: any) => (
                              <li key={opt.id} className="flex items-center gap-2">
                                <span className="font-medium">{opt.id}.</span>
                                <span>{opt.text}</span>
                                {opt.isCorrect && <Check className="h-4 w-4 text-green-500" />}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-2 flex gap-1">
                          <Badge variant="outline" className="text-xs">{question.dimension}</Badge>
                          {question.traitMeasured && (
                            <Badge variant="outline" className="text-xs">{question.traitMeasured}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
