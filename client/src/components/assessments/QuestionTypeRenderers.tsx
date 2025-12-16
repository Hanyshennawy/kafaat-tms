/**
 * QUESTION TYPE RENDERERS
 * 
 * Components for rendering different question types in assessments:
 * - Multiple Choice (MCQ)
 * - True/False
 * - Likert Scale
 * - Rating Scale
 * - Scenario-Based
 * - Forced Choice
 * - Ranking
 * - Matching
 * - Fill in the Blank
 * - Short Answer
 * - Essay
 * - Open Ended
 * - Situational Judgment
 * - Ipsative Pair
 * - Ipsative Quad
 * - Semantic Differential
 * - Behavioral Anchor
 * - Conditional Reasoning
 * - Case Study
 * - Video Response
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { GripVertical, ChevronUp, ChevronDown, Video, Mic, Upload } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface QuestionOption {
  id: string;
  text: string;
  value?: number;
  isCorrect?: boolean;
  dimension?: string;
  trait?: string;
}

export interface Question {
  id: number;
  questionType: string;
  questionText: string;
  scenario?: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  difficulty: string;
  dimension?: string;
  framework?: string;
  timeLimit?: number;
  points: number;
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  pairs?: Array<{ left: string; right: string }>;
  blanks?: string[];
  caseStudyContent?: string;
}

export interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  showFeedback?: boolean;
}

// ============================================================================
// MAIN RENDERER
// ============================================================================

export function QuestionRenderer(props: QuestionRendererProps) {
  const { question } = props;

  switch (question.questionType) {
    case "mcq":
      return <MultipleChoiceQuestion {...props} />;
    case "true_false":
      return <TrueFalseQuestion {...props} />;
    case "likert":
      return <LikertScaleQuestion {...props} />;
    case "rating_scale":
      return <RatingScaleQuestion {...props} />;
    case "scenario":
      return <ScenarioBasedQuestion {...props} />;
    case "forced_choice":
      return <ForcedChoiceQuestion {...props} />;
    case "ranking":
      return <RankingQuestion {...props} />;
    case "matching":
      return <MatchingQuestion {...props} />;
    case "fill_blank":
      return <FillBlankQuestion {...props} />;
    case "short_answer":
      return <ShortAnswerQuestion {...props} />;
    case "essay":
      return <EssayQuestion {...props} />;
    case "open_ended":
      return <OpenEndedQuestion {...props} />;
    case "situational_judgment":
      return <SituationalJudgmentQuestion {...props} />;
    case "ipsative_pair":
      return <IpsativePairQuestion {...props} />;
    case "ipsative_quad":
      return <IpsativeQuadQuestion {...props} />;
    case "semantic_differential":
      return <SemanticDifferentialQuestion {...props} />;
    case "behavioral_anchor":
      return <BehavioralAnchorQuestion {...props} />;
    case "conditional_reasoning":
      return <ConditionalReasoningQuestion {...props} />;
    case "case_study":
      return <CaseStudyQuestion {...props} />;
    case "video_response":
      return <VideoResponseQuestion {...props} />;
    default:
      return <DefaultQuestion {...props} />;
  }
}

// ============================================================================
// MULTIPLE CHOICE QUESTION
// ============================================================================

function MultipleChoiceQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
        {question.options?.map((option) => (
          <div 
            key={option.id} 
            className={cn(
              "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
              value === option.id ? "border-primary bg-primary/5" : "hover:bg-accent"
            )}
            onClick={() => !disabled && onChange(option.id)}
          >
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              <span className="font-medium mr-2">{option.id}.</span>
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

// ============================================================================
// TRUE/FALSE QUESTION
// ============================================================================

function TrueFalseQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <div className="flex gap-4">
        <Button
          variant={value === "true" ? "default" : "outline"}
          className="flex-1 h-16 text-lg"
          onClick={() => !disabled && onChange("true")}
          disabled={disabled}
        >
          True
        </Button>
        <Button
          variant={value === "false" ? "default" : "outline"}
          className="flex-1 h-16 text-lg"
          onClick={() => !disabled && onChange("false")}
          disabled={disabled}
        >
          False
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// LIKERT SCALE QUESTION
// ============================================================================

function LikertScaleQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  const options = question.options || [
    { id: "1", text: "Strongly Disagree", value: 1 },
    { id: "2", text: "Disagree", value: 2 },
    { id: "3", text: "Neutral", value: 3 },
    { id: "4", text: "Agree", value: 4 },
    { id: "5", text: "Strongly Agree", value: 5 }
  ];

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <div className="flex justify-between gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => !disabled && onChange(option.id)}
            disabled={disabled}
            className={cn(
              "flex-1 p-4 border rounded-lg text-center transition-all",
              value === option.id 
                ? "border-primary bg-primary text-primary-foreground" 
                : "hover:bg-accent"
            )}
          >
            <div className="text-2xl font-bold mb-1">{option.value || option.id}</div>
            <div className="text-xs">{option.text}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// RATING SCALE QUESTION
// ============================================================================

function RatingScaleQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  const min = question.scaleMin ?? 1;
  const max = question.scaleMax ?? 10;
  const currentValue = value ?? Math.floor((max - min) / 2) + min;

  return (
    <div className="space-y-6">
      <p className="text-lg font-medium">{question.questionText}</p>
      <div className="space-y-4">
        <Slider
          value={[currentValue]}
          onValueChange={([v]) => !disabled && onChange(v)}
          min={min}
          max={max}
          step={1}
          disabled={disabled}
          className="py-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{question.scaleLabels?.min || min}</span>
          <span className="text-2xl font-bold text-primary">{currentValue}</span>
          <span>{question.scaleLabels?.max || max}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SCENARIO-BASED QUESTION
// ============================================================================

function ScenarioBasedQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      {question.scenario && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="italic">{question.scenario}</p>
          </CardContent>
        </Card>
      )}
      <p className="text-lg font-medium">{question.questionText}</p>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
        {question.options?.map((option) => (
          <div 
            key={option.id} 
            className={cn(
              "flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
              value === option.id ? "border-primary bg-primary/5" : "hover:bg-accent"
            )}
            onClick={() => !disabled && onChange(option.id)}
          >
            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              <span className="font-medium mr-2">{option.id}.</span>
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

// ============================================================================
// FORCED CHOICE QUESTION
// ============================================================================

function ForcedChoiceQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <p className="text-sm text-muted-foreground">
        Select the option that BEST describes you, even if neither is perfect.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {question.options?.map((option) => (
          <button
            key={option.id}
            onClick={() => !disabled && onChange(option.id)}
            disabled={disabled}
            className={cn(
              "p-6 border-2 rounded-lg text-left transition-all",
              value === option.id 
                ? "border-primary bg-primary/5 ring-2 ring-primary" 
                : "hover:border-primary/50 hover:bg-accent"
            )}
          >
            <div className="font-medium">{option.text}</div>
            {option.trait && (
              <Badge variant="secondary" className="mt-2">{option.trait}</Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// RANKING QUESTION
// ============================================================================

function RankingQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  const [items, setItems] = useState(() => {
    if (Array.isArray(value)) return value;
    return question.options?.map(o => o.id) || [];
  });

  const moveItem = (index: number, direction: "up" | "down") => {
    if (disabled) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <p className="text-sm text-muted-foreground">
        Drag or use arrows to rank items from most important (top) to least important (bottom).
      </p>
      <div className="space-y-2">
        {items.map((itemId, index) => {
          const option = question.options?.find(o => o.id === itemId);
          return (
            <div
              key={itemId}
              className="flex items-center gap-3 p-4 border rounded-lg bg-card"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                {index + 1}
              </Badge>
              <span className="flex-1">{option?.text || itemId}</span>
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveItem(index, "up")}
                  disabled={disabled || index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveItem(index, "down")}
                  disabled={disabled || index === items.length - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MATCHING QUESTION
// ============================================================================

function MatchingQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  const matches = value || {};
  const pairs = question.pairs || [];
  const rightItems = pairs.map(p => p.right);

  const handleMatch = (left: string, right: string) => {
    if (disabled) return;
    onChange({ ...matches, [left]: right });
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Items</h4>
          {pairs.map((pair, index) => (
            <div key={index} className="p-4 border rounded-lg bg-card">
              <span className="font-medium mr-2">{index + 1}.</span>
              {pair.left}
              {matches[pair.left] && (
                <Badge className="ml-2">{matches[pair.left]}</Badge>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Match With</h4>
          {rightItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                const unmatched = pairs.find(p => !matches[p.left]);
                if (unmatched) handleMatch(unmatched.left, item);
              }}
              disabled={disabled || Object.values(matches).includes(item)}
              className={cn(
                "w-full p-4 border rounded-lg text-left transition-colors",
                Object.values(matches).includes(item) 
                  ? "opacity-50 bg-muted" 
                  : "hover:bg-accent"
              )}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FILL IN THE BLANK QUESTION
// ============================================================================

function FillBlankQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  const blanks = value || {};
  const parts = question.questionText.split(/___+/);

  const handleBlankChange = (index: number, newValue: string) => {
    if (disabled) return;
    onChange({ ...blanks, [index]: newValue });
  };

  return (
    <div className="space-y-4">
      <div className="text-lg font-medium leading-relaxed">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <Input
                className="inline-block w-40 mx-1 align-baseline"
                value={blanks[index] || ""}
                onChange={(e) => handleBlankChange(index, e.target.value)}
                disabled={disabled}
                placeholder={`Blank ${index + 1}`}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SHORT ANSWER QUESTION
// ============================================================================

function ShortAnswerQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type your answer here..."
        className="text-lg py-6"
      />
    </div>
  );
}

// ============================================================================
// ESSAY QUESTION
// ============================================================================

function EssayQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  const wordCount = (value || "").split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <div className="space-y-2">
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Write your essay response here..."
          className="min-h-[300px]"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Word count: {wordCount}</span>
          {question.points && <span>Points: {question.points}</span>}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// OPEN ENDED QUESTION
// ============================================================================

function OpenEndedQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Share your thoughts..."
        className="min-h-[150px]"
      />
    </div>
  );
}

// ============================================================================
// SITUATIONAL JUDGMENT QUESTION
// ============================================================================

function SituationalJudgmentQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  const [mostLikely, setMostLikely] = useState(value?.mostLikely || "");
  const [leastLikely, setLeastLikely] = useState(value?.leastLikely || "");

  const handleChange = (type: "mostLikely" | "leastLikely", optionId: string) => {
    if (disabled) return;
    const newValue = {
      mostLikely: type === "mostLikely" ? optionId : mostLikely,
      leastLikely: type === "leastLikely" ? optionId : leastLikely
    };
    if (type === "mostLikely") setMostLikely(optionId);
    if (type === "leastLikely") setLeastLikely(optionId);
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      {question.scenario && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="italic">{question.scenario}</p>
          </CardContent>
        </Card>
      )}
      <p className="text-lg font-medium">{question.questionText}</p>
      <p className="text-sm text-muted-foreground">
        Select the action you are MOST likely and LEAST likely to take.
      </p>
      <div className="space-y-2">
        {question.options?.map((option) => (
          <div
            key={option.id}
            className={cn(
              "flex items-center justify-between p-4 border rounded-lg",
              (mostLikely === option.id || leastLikely === option.id) && "bg-accent"
            )}
          >
            <span className="flex-1">
              <span className="font-medium mr-2">{option.id}.</span>
              {option.text}
            </span>
            <div className="flex gap-2">
              <Button
                variant={mostLikely === option.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleChange("mostLikely", option.id)}
                disabled={disabled || leastLikely === option.id}
              >
                Most
              </Button>
              <Button
                variant={leastLikely === option.id ? "destructive" : "outline"}
                size="sm"
                onClick={() => handleChange("leastLikely", option.id)}
                disabled={disabled || mostLikely === option.id}
              >
                Least
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// IPSATIVE PAIR QUESTION
// ============================================================================

function IpsativePairQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <p className="text-sm text-muted-foreground">
        Which statement describes you better?
      </p>
      <div className="grid grid-cols-2 gap-4">
        {question.options?.slice(0, 2).map((option) => (
          <button
            key={option.id}
            onClick={() => !disabled && onChange(option.id)}
            disabled={disabled}
            className={cn(
              "p-6 border-2 rounded-lg text-left transition-all min-h-[120px]",
              value === option.id 
                ? "border-primary bg-primary/5 ring-2 ring-primary" 
                : "hover:border-primary/50"
            )}
          >
            <p>{option.text}</p>
            {option.dimension && (
              <Badge variant="secondary" className="mt-3">{option.dimension}</Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// IPSATIVE QUAD QUESTION
// ============================================================================

function IpsativeQuadQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  const selected = value || { most: "", least: "" };

  const handleSelect = (optionId: string, type: "most" | "least") => {
    if (disabled) return;
    const newValue = { ...selected, [type]: optionId };
    if (type === "most" && selected.least === optionId) newValue.least = "";
    if (type === "least" && selected.most === optionId) newValue.most = "";
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <p className="text-sm text-muted-foreground">
        Select which statement is MOST like you and which is LEAST like you.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {question.options?.slice(0, 4).map((option) => (
          <div
            key={option.id}
            className={cn(
              "p-4 border rounded-lg transition-all",
              selected.most === option.id && "border-green-500 bg-green-50",
              selected.least === option.id && "border-red-500 bg-red-50"
            )}
          >
            <p className="text-sm mb-3">{option.text}</p>
            <div className="flex gap-2">
              <Button
                variant={selected.most === option.id ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => handleSelect(option.id, "most")}
                disabled={disabled}
              >
                Most
              </Button>
              <Button
                variant={selected.least === option.id ? "destructive" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => handleSelect(option.id, "least")}
                disabled={disabled}
              >
                Least
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SEMANTIC DIFFERENTIAL QUESTION
// ============================================================================

function SemanticDifferentialQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  const pairs = question.pairs || [
    { left: "Passive", right: "Active" },
    { left: "Weak", right: "Strong" }
  ];
  const responses = value || {};

  const handleChange = (index: number, rating: number) => {
    if (disabled) return;
    onChange({ ...responses, [index]: rating });
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <div className="space-y-6">
        {pairs.map((pair, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>{pair.left}</span>
              <span>{pair.right}</span>
            </div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleChange(index, rating)}
                  disabled={disabled}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all",
                    responses[index] === rating 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "hover:border-primary"
                  )}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// BEHAVIORAL ANCHOR QUESTION
// ============================================================================

function BehavioralAnchorQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      <p className="text-sm text-muted-foreground">
        Select the behavior level that best describes your typical approach.
      </p>
      <div className="space-y-2">
        {question.options?.map((option, index) => (
          <button
            key={option.id}
            onClick={() => !disabled && onChange(option.id)}
            disabled={disabled}
            className={cn(
              "w-full p-4 border rounded-lg text-left transition-all flex items-start gap-4",
              value === option.id 
                ? "border-primary bg-primary/5" 
                : "hover:bg-accent"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0",
              value === option.id ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              {5 - index}
            </div>
            <div>
              <p className="font-medium">{option.text}</p>
              {option.dimension && (
                <Badge variant="secondary" className="mt-1">{option.dimension}</Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CONDITIONAL REASONING QUESTION
// ============================================================================

function ConditionalReasoningQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      {question.scenario && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Context</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-900">{question.scenario}</p>
          </CardContent>
        </Card>
      )}
      <p className="text-lg font-medium">{question.questionText}</p>
      <p className="text-sm text-muted-foreground">
        Based on the logic presented, which conclusion follows?
      </p>
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
        {question.options?.map((option) => (
          <div 
            key={option.id} 
            className={cn(
              "flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors",
              value === option.id ? "border-primary bg-primary/5" : "hover:bg-accent"
            )}
            onClick={() => !disabled && onChange(option.id)}
          >
            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

// ============================================================================
// CASE STUDY QUESTION
// ============================================================================

function CaseStudyQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      {question.caseStudyContent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Case Study</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {question.caseStudyContent}
            </div>
          </CardContent>
        </Card>
      )}
      {question.scenario && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p>{question.scenario}</p>
          </CardContent>
        </Card>
      )}
      <p className="text-lg font-medium">{question.questionText}</p>
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Analyze the case and provide your response..."
        className="min-h-[200px]"
      />
    </div>
  );
}

// ============================================================================
// VIDEO RESPONSE QUESTION
// ============================================================================

function VideoResponseQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(!!value);

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.questionText}</p>
      {question.scenario && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="italic">{question.scenario}</p>
          </CardContent>
        </Card>
      )}
      <div className="border-2 border-dashed rounded-lg p-8 text-center">
        {hasRecording ? (
          <div className="space-y-4">
            <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
              <Video className="h-16 w-16 text-white/50" />
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => setHasRecording(false)} disabled={disabled}>
                Re-record
              </Button>
              <Button variant="outline" disabled={disabled}>
                Preview
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Video className="h-16 w-16 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Record a video response to this question
            </p>
            <div className="flex justify-center gap-2">
              <Button 
                onClick={() => {
                  setIsRecording(true);
                  setTimeout(() => {
                    setIsRecording(false);
                    setHasRecording(true);
                    onChange({ recorded: true, timestamp: Date.now() });
                  }, 2000);
                }}
                disabled={disabled || isRecording}
              >
                {isRecording ? (
                  <>
                    <Mic className="h-4 w-4 mr-2 animate-pulse" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              <Button variant="outline" disabled={disabled}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// DEFAULT QUESTION
// ============================================================================

function DefaultQuestion({ question, value, onChange, disabled }: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      <Badge variant="outline">{question.questionType}</Badge>
      <p className="text-lg font-medium">{question.questionText}</p>
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter your response..."
        className="min-h-[100px]"
      />
    </div>
  );
}

export default QuestionRenderer;
