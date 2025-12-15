import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bot, Send, Mic, MicOff, Video, VideoOff, Clock, CheckCircle2, 
  AlertCircle, Sparkles, MessageSquare, ArrowRight, Timer, Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "wouter";

// Demo interview questions
const DEMO_QUESTIONS = [
  { id: 1, text: "Tell me about yourself and why you chose teaching as a profession.", type: "general", timeLimit: 120 },
  { id: 2, text: "Describe a challenging classroom situation you faced and how you handled it.", type: "behavioral", timeLimit: 180 },
  { id: 3, text: "How do you differentiate instruction to meet diverse student needs?", type: "competency", timeLimit: 180 },
  { id: 4, text: "A student consistently disrupts class. Walk me through your approach.", type: "situational", timeLimit: 180 },
  { id: 5, text: "How do you incorporate technology in your teaching?", type: "technical", timeLimit: 150 },
  { id: 6, text: "Describe your approach to parent-teacher communication.", type: "behavioral", timeLimit: 150 },
  { id: 7, text: "How do you assess student learning beyond traditional tests?", type: "competency", timeLimit: 180 },
  { id: 8, text: "Where do you see yourself in 5 years as an educator?", type: "general", timeLimit: 120 },
];

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
  timestamp: Date;
  isQuestion?: boolean;
  questionNumber?: number;
}

export default function AIInterviewSession() {
  const { accessCode } = useParams();
  const [sessionState, setSessionState] = useState<"intro" | "interview" | "completed">("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [candidateName] = useState("Candidate");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = DEMO_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / DEMO_QUESTIONS.length) * 100;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Timer effect
  useEffect(() => {
    if (sessionState === "interview" && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState, currentQuestionIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = () => {
    setSessionState("interview");
    setTotalTime(25 * 60); // 25 minutes total
    
    // Add welcome message
    setMessages([
      {
        id: 1,
        sender: "ai",
        text: "Welcome to your AI Interview! I'm here to learn more about you and your teaching experience. Please answer each question thoughtfully - take your time, and feel free to provide detailed examples. Let's begin!",
        timestamp: new Date(),
      }
    ]);
    
    // Ask first question after delay
    setTimeout(() => {
      askQuestion(0);
    }, 2000);
  };

  const askQuestion = (index: number) => {
    if (index >= DEMO_QUESTIONS.length) {
      completeInterview();
      return;
    }
    
    const question = DEMO_QUESTIONS[index];
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: "ai",
        text: question.text,
        timestamp: new Date(),
        isQuestion: true,
        questionNumber: index + 1,
      }]);
      setIsTyping(false);
      setTimeRemaining(question.timeLimit);
    }, 1500);
  };

  const handleSubmitResponse = () => {
    if (!userInput.trim()) return;
    
    // Add user response
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      sender: "user",
      text: userInput,
      timestamp: new Date(),
    }]);
    
    setUserInput("");
    
    // Simulate AI processing
    setIsTyping(true);
    setTimeout(() => {
      // Add acknowledgment
      const acknowledgments = [
        "Thank you for sharing that. ",
        "That's a thoughtful response. ",
        "I appreciate your detailed answer. ",
        "Interesting perspective. ",
      ];
      const ack = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
      
      if (currentQuestionIndex < DEMO_QUESTIONS.length - 1) {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          sender: "ai",
          text: `${ack}Let's move on to the next question.`,
          timestamp: new Date(),
        }]);
        
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeout(() => {
          askQuestion(currentQuestionIndex + 1);
        }, 1500);
      } else {
        completeInterview();
      }
      setIsTyping(false);
    }, 2000);
  };

  const completeInterview = () => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: "ai",
        text: "Thank you for completing this interview! I've gathered all the information needed. Your responses have been recorded and will be analyzed by our AI system. The hiring team will review your results and reach out with next steps. Best of luck!",
        timestamp: new Date(),
      }]);
      setIsTyping(false);
      setSessionState("completed");
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitResponse();
    }
  };

  // Intro Screen
  if (sessionState === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl w-fit mb-4">
                <Bot className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-2xl">Welcome to Your AI Interview</CardTitle>
              <CardDescription>
                Ministry of Education - Teacher Screening Assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  About This Interview
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• This is an AI-powered interview simulation</li>
                  <li>• Duration: Approximately 25 minutes</li>
                  <li>• 8 questions covering teaching competencies</li>
                  <li>• Your responses will be analyzed by our AI system</li>
                  <li>• Results will be shared with the hiring team</li>
                </ul>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">25 min</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <MessageSquare className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">8</p>
                  <p className="text-xs text-muted-foreground">Questions</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <Brain className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-medium">AI</p>
                  <p className="text-xs text-muted-foreground">Analysis</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Before You Begin
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Find a quiet, well-lit location</li>
                  <li>• Ensure stable internet connection</li>
                  <li>• Have your camera and microphone ready</li>
                  <li>• Allow sufficient time to complete without interruption</li>
                </ul>
              </div>
              
              <Button 
                onClick={startInterview}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                size="lg"
              >
                Start Interview
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Access Code: {accessCode || "AI-INT-2024-003"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Completed Screen
  if (sessionState === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl w-fit mb-4">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-2xl">Interview Completed!</CardTitle>
              <CardDescription>
                Thank you for participating in the AI Interview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg text-center">
                <p className="text-lg font-medium text-green-700 dark:text-green-300">
                  Your responses have been recorded successfully
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Our AI system is now analyzing your interview
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">8/8</p>
                  <p className="text-sm text-muted-foreground">Questions Answered</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">26 min</p>
                  <p className="text-sm text-muted-foreground">Total Duration</p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">What Happens Next?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. AI analysis of your responses (instant)</li>
                  <li>2. Report generation for hiring team</li>
                  <li>3. HR review within 2-3 business days</li>
                  <li>4. You'll receive an email with next steps</li>
                </ul>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                You may now close this window. Good luck!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Interview Screen
  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">AI Interview in Progress</h1>
              <p className="text-sm text-muted-foreground">Teacher Screening Assessment</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Progress:</span>
              <Progress value={progress} className="w-32 h-2" />
              <span className="text-sm font-medium">{currentQuestionIndex}/{DEMO_QUESTIONS.length}</span>
            </div>
            
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              timeRemaining < 30 ? 'bg-red-100 text-red-700' : 'bg-muted'
            }`}>
              <Timer className="h-4 w-4" />
              <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                onClick={() => setIsRecording(!isRecording)}
              >
                {isRecording ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={isCameraOn ? "outline" : "secondary"}
                size="icon"
                onClick={() => setIsCameraOn(!isCameraOn)}
              >
                {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full p-4 gap-4 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className={
                        message.sender === 'ai' 
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                          : 'bg-blue-500 text-white'
                      }>
                        {message.sender === 'ai' ? <Bot className="h-4 w-4" /> : candidateName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`rounded-2xl p-4 ${
                      message.sender === 'ai' 
                        ? message.isQuestion 
                          ? 'bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800'
                          : 'bg-gray-100 dark:bg-gray-700'
                        : 'bg-blue-500 text-white'
                    }`}>
                      {message.isQuestion && (
                        <Badge className="mb-2 bg-purple-600">
                          Question {message.questionNumber} of {DEMO_QUESTIONS.length}
                        </Badge>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
            <div className="flex gap-2">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response here..."
                className="min-h-[80px] resize-none"
                disabled={isTyping || sessionState !== "interview"}
              />
              <Button
                onClick={handleSubmitResponse}
                disabled={!userInput.trim() || isTyping}
                className="h-auto bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to submit, Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Side Panel - Video Preview */}
        <div className="w-72 flex flex-col gap-4">
          {/* Video Preview */}
          <Card>
            <CardContent className="p-3">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                {isCameraOn ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
                    <div className="relative z-10 text-center">
                      <Avatar className="h-16 w-16 mx-auto mb-2">
                        <AvatarFallback className="text-2xl bg-blue-500 text-white">
                          {candidateName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-white text-sm">Camera Preview</p>
                    </div>
                    {isRecording && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        REC
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-400">
                    <VideoOff className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Camera Off</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Question Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Current Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentQuestion?.type}</Badge>
                <span className="text-xs text-muted-foreground">
                  {currentQuestionIndex + 1} of {DEMO_QUESTIONS.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Be specific with examples</li>
                <li>• Use STAR method for behavioral questions</li>
                <li>• Take your time to think</li>
                <li>• Speak clearly and confidently</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
