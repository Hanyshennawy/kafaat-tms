import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, Target, ChevronRight, Clock, Sparkles, Play,
  BookOpen, Heart, GraduationCap, Users, MessageSquare, 
  Lightbulb, CheckCircle2, ArrowRight, ClipboardCheck
} from "lucide-react";
import { useLocation, useSearch } from "wouter";

// Assessment type configuration
const assessmentTypes = {
  competency: {
    id: "competency",
    title: "Competency Assessment (ACI)",
    subtitle: "AI-Powered Educator Competency Evaluation",
    description: "Comprehensive assessment based on the ACI Educator Competency Framework. AI-generated questions evaluate your professional competencies across multiple domains.",
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30 hover:border-primary",
    duration: "45-60 min",
    questions: "32 questions",
    features: [
      "AI-generated questions based on your job role",
      "5-point rating scale (1=Never to 5=Always)",
      "4 competency domains evaluated",
      "Personalized development recommendations",
      "Gap analysis and action plan",
    ],
    domains: [
      "Teaching & Learning",
      "Student Support & Wellbeing",
      "Professional Growth & Leadership",
      "Technology & Innovation"
    ],
    path: "/assessments/competency"
  },
  psychometric: {
    id: "psychometric",
    title: "Psychometric Assessments",
    subtitle: "Personality, Cognitive & Behavioral Evaluations",
    description: "Suite of scientifically-validated psychometric tests including personality traits, emotional intelligence, teaching style, and cognitive abilities.",
    icon: Brain,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    borderColor: "border-pink-200 hover:border-pink-400",
    duration: "Varies by test",
    questions: "8 test types available",
    features: [
      "Big Five Personality Assessment",
      "Emotional Intelligence (EQ) evaluation",
      "Teaching Style Inventory",
      "Instructional Leadership assessment",
      "Cognitive Ability testing",
    ],
    tests: [
      { name: "Personality (Big Five)", duration: "25 min", icon: Brain },
      { name: "Emotional Intelligence", duration: "20 min", icon: Heart },
      { name: "Teaching Style", duration: "15 min", icon: BookOpen },
      { name: "Leadership", duration: "20 min", icon: GraduationCap },
      { name: "Classroom Management", duration: "15 min", icon: Users },
      { name: "Growth Mindset", duration: "10 min", icon: Lightbulb },
      { name: "Communication Style", duration: "12 min", icon: MessageSquare },
    ],
    path: "/assessments/psychometric/take"
  }
};

export default function AssessmentSelector() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const preselectedType = new URLSearchParams(search).get("type");
  
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    preselectedType ? [preselectedType] : []
  );

  const toggleSelection = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleStartAssessment = () => {
    if (selectedTypes.length === 0) return;
    
    if (selectedTypes.length === 1) {
      // Single selection - go directly to that assessment
      if (selectedTypes[0] === 'competency') {
        setLocation("/assessments/competency?start=true");
      } else {
        setLocation("/assessments/psychometric/take");
      }
    } else {
      // Both selected - start with competency first
      setLocation("/assessments/competency?start=true&next=psychometric");
    }
  };

  const isSelected = (type: string) => selectedTypes.includes(type);

  return (
    <div className="container py-8 max-w-5xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
          <ClipboardCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Take Assessment</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the type of assessment you want to complete. You can select one or both assessment types.
        </p>
      </div>

      {/* Selection Cards */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Competency Assessment Card */}
        <Card 
          className={`cursor-pointer transition-all ${
            isSelected('competency') 
              ? 'border-2 border-primary ring-2 ring-primary/20' 
              : 'border-2 border-transparent hover:border-primary/30'
          }`}
          onClick={() => toggleSelection('competency')}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${assessmentTypes.competency.bgColor}`}>
                <Target className={`h-8 w-8 ${assessmentTypes.competency.color}`} />
              </div>
              <Checkbox 
                checked={isSelected('competency')} 
                onCheckedChange={() => toggleSelection('competency')}
                className="h-6 w-6"
              />
            </div>
            <CardTitle className="mt-4">{assessmentTypes.competency.title}</CardTitle>
            <CardDescription>{assessmentTypes.competency.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {assessmentTypes.competency.description}
            </p>
            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{assessmentTypes.competency.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                <span>{assessmentTypes.competency.questions}</span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <Label className="text-sm font-medium">What's Assessed:</Label>
              <div className="flex flex-wrap gap-2">
                {assessmentTypes.competency.domains.map((domain, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {domain}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium">Features:</Label>
              <ul className="space-y-1">
                {assessmentTypes.competency.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Badge 
              variant={isSelected('competency') ? 'default' : 'outline'}
              className="w-full justify-center py-2"
            >
              {isSelected('competency') ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Selected
                </>
              ) : (
                'Click to Select'
              )}
            </Badge>
          </CardFooter>
        </Card>

        {/* Psychometric Assessment Card */}
        <Card 
          className={`cursor-pointer transition-all ${
            isSelected('psychometric') 
              ? 'border-2 border-pink-500 ring-2 ring-pink-200' 
              : 'border-2 border-transparent hover:border-pink-300'
          }`}
          onClick={() => toggleSelection('psychometric')}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${assessmentTypes.psychometric.bgColor}`}>
                <Brain className={`h-8 w-8 ${assessmentTypes.psychometric.color}`} />
              </div>
              <Checkbox 
                checked={isSelected('psychometric')} 
                onCheckedChange={() => toggleSelection('psychometric')}
                className="h-6 w-6"
              />
            </div>
            <CardTitle className="mt-4">{assessmentTypes.psychometric.title}</CardTitle>
            <CardDescription>{assessmentTypes.psychometric.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {assessmentTypes.psychometric.description}
            </p>
            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{assessmentTypes.psychometric.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                <span>{assessmentTypes.psychometric.questions}</span>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Available Tests:</Label>
              <div className="grid grid-cols-2 gap-2">
                {assessmentTypes.psychometric.tests.slice(0, 6).map((test, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <test.icon className="h-4 w-4 text-pink-500" />
                    <span className="text-muted-foreground">{test.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium">Features:</Label>
              <ul className="space-y-1">
                {assessmentTypes.psychometric.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Badge 
              variant={isSelected('psychometric') ? 'default' : 'outline'}
              className={`w-full justify-center py-2 ${
                isSelected('psychometric') ? 'bg-pink-600 hover:bg-pink-600' : ''
              }`}
            >
              {isSelected('psychometric') ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Selected
                </>
              ) : (
                'Click to Select'
              )}
            </Badge>
          </CardFooter>
        </Card>
      </div>

      {/* Selection Summary & Start Button */}
      <Card className="bg-muted/50">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">
                {selectedTypes.length === 0 && "Select an assessment type to continue"}
                {selectedTypes.length === 1 && `Ready to start: ${
                  selectedTypes[0] === 'competency' ? 'Competency Assessment' : 'Psychometric Assessment'
                }`}
                {selectedTypes.length === 2 && "Ready to start: Both Assessments"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedTypes.length === 0 && "Choose one or both assessment types above"}
                {selectedTypes.length === 1 && selectedTypes[0] === 'competency' && 
                  "AI will generate personalized questions based on your role"
                }
                {selectedTypes.length === 1 && selectedTypes[0] === 'psychometric' && 
                  "You'll select which specific test to take next"
                }
                {selectedTypes.length === 2 && 
                  "You'll complete the Competency Assessment first, then Psychometric tests"
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              {selectedTypes.length === 2 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  <ArrowRight className="h-4 w-4" />
                  <Brain className="h-4 w-4 text-pink-600" />
                </div>
              )}
              <Button 
                size="lg" 
                disabled={selectedTypes.length === 0}
                onClick={handleStartAssessment}
                className="gap-2 min-w-[160px]"
              >
                {selectedTypes.includes('competency') && !selectedTypes.includes('psychometric') && (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Start Assessment
                  </>
                )}
                {selectedTypes.includes('psychometric') && !selectedTypes.includes('competency') && (
                  <>
                    <Play className="h-4 w-4" />
                    Choose Test
                  </>
                )}
                {selectedTypes.length === 2 && (
                  <>
                    <Play className="h-4 w-4" />
                    Start Both
                  </>
                )}
                {selectedTypes.length === 0 && (
                  <>
                    Select to Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="mt-8 p-6 rounded-lg bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          💡 Which assessment should I take?
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Take Competency Assessment if you want to:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Evaluate your teaching competency level</li>
              <li>• Identify strengths and development areas</li>
              <li>• Get AI-powered recommendations</li>
              <li>• Create a professional development plan</li>
            </ul>
          </div>
          <div>
            <strong>Take Psychometric Assessment if you want to:</strong>
            <ul className="mt-1 space-y-1">
              <li>• Understand your personality traits</li>
              <li>• Discover your teaching style</li>
              <li>• Measure emotional intelligence</li>
              <li>• Assess leadership potential</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
