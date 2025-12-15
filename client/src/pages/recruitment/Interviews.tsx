import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Calendar, Clock, Video, MapPin, User, Users, Plus, Filter, CheckCircle2, XCircle, AlertCircle,
  CalendarDays, List, RefreshCw, Trash2, Star, Download, Bell, FileText, RotateCcw, Timer, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Available interviewers for multi-select
const AVAILABLE_INTERVIEWERS = [
  { id: "fatima", name: "Dr. Fatima Hassan", role: "Principal" },
  { id: "mohammed", name: "Prof. Mohammed Saeed", role: "VP Academic" },
  { id: "khalid", name: "Dr. Khalid Omar", role: "Head of Subject" },
  { id: "layla", name: "Layla Mohammed", role: "HR Manager" },
  { id: "omar", name: "Omar Ali", role: "Department Head" },
];

// Interview rounds
const INTERVIEW_ROUNDS = [
  { value: "screening", label: "Screening Call" },
  { value: "technical", label: "Technical Interview" },
  { value: "demo", label: "Teaching Demo" },
  { value: "hr", label: "HR Interview" },
  { value: "final", label: "Final Panel" },
];

// Duration options
const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
];

interface Interview {
  id: number;
  candidate: string;
  position: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  round: string;
  interviewers: string[];
  location: string;
  rating?: number;
  feedback?: {
    technicalSkills: number;
    communication: number;
    teachingAbility: number;
    cultureFit: number;
    comments: string;
  };
}

const DEMO_INTERVIEWS: Interview[] = [
  { id: 1, candidate: "Ahmad Al-Rashid", position: "Expert Teacher - Mathematics", date: "2024-01-20", time: "10:00 AM", duration: 60, type: "video", status: "scheduled", round: "technical", interviewers: ["Dr. Fatima Hassan", "Prof. Mohammed Saeed"], location: "Microsoft Teams" },
  { id: 2, candidate: "Sara Abdullah", position: "Head of Subject - Science", date: "2024-01-20", time: "2:00 PM", duration: 45, type: "in-person", status: "scheduled", round: "demo", interviewers: ["Dr. Khalid Omar"], location: "Room 305, Admin Building" },
  { id: 3, candidate: "Noura Ahmed", position: "Teacher T1 - Arabic", date: "2024-01-19", time: "11:00 AM", duration: 30, type: "video", status: "completed", round: "hr", interviewers: ["Layla Mohammed"], location: "Zoom", rating: 4.5, feedback: { technicalSkills: 4, communication: 5, teachingAbility: 5, cultureFit: 4, comments: "Excellent candidate with strong teaching methodology." } },
  { id: 4, candidate: "Hassan Ibrahim", position: "Assistant Teacher - PE", date: "2024-01-18", time: "3:00 PM", duration: 60, type: "in-person", status: "completed", round: "final", interviewers: ["Omar Ali", "Fatima Hassan"], location: "Sports Office", rating: 3.8, feedback: { technicalSkills: 4, communication: 3, teachingAbility: 4, cultureFit: 4, comments: "Good practical skills, needs to improve verbal communication." } },
  { id: 5, candidate: "Mariam Khalil", position: "Teacher - English", date: "2024-01-21", time: "9:00 AM", duration: 45, type: "video", status: "pending", round: "screening", interviewers: [], location: "TBD" },
  { id: 6, candidate: "Khalid Mansour", position: "Senior Teacher - Physics", date: "2024-01-20", time: "11:00 AM", duration: 60, type: "video", status: "scheduled", round: "technical", interviewers: ["Prof. Mohammed Saeed"], location: "Microsoft Teams" },
  { id: 7, candidate: "Aisha Rahman", position: "Teacher - Chemistry", date: "2024-01-22", time: "10:30 AM", duration: 45, type: "in-person", status: "scheduled", round: "demo", interviewers: ["Dr. Khalid Omar", "Dr. Fatima Hassan"], location: "Science Lab" },
];

// Helper function to check time conflicts
function checkTimeConflict(interviews: Interview[], newDate: string, newTime: string, newDuration: number, excludeId?: number): Interview | null {
  const newStart = new Date(`${newDate} ${newTime}`);
  const newEnd = new Date(newStart.getTime() + newDuration * 60000);
  
  for (const interview of interviews) {
    if (excludeId && interview.id === excludeId) continue;
    if (interview.date !== newDate) continue;
    
    const existingStart = new Date(`${interview.date} ${interview.time}`);
    const existingEnd = new Date(existingStart.getTime() + interview.duration * 60000);
    
    if ((newStart >= existingStart && newStart < existingEnd) || 
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)) {
      return interview;
    }
  }
  return null;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useMemo(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

export default function Interviews() {
  const [interviews, setInterviews] = useState<Interview[]>(DEMO_INTERVIEWS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);
  const [conflictWarning, setConflictWarning] = useState<Interview | null>(null);
  
  // Form state for new interview
  const [newInterview, setNewInterview] = useState({
    candidate: "",
    date: "",
    time: "",
    duration: "60",
    type: "",
    round: "",
    location: "",
    notes: ""
  });
  
  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    technicalSkills: 3,
    communication: 3,
    teachingAbility: 3,
    cultureFit: 3,
    comments: ""
  });
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredInterviews = useMemo(() => {
    return interviews.filter(interview => {
      // Status filter
      if (statusFilter !== "all" && interview.status !== statusFilter) return false;
      
      // Round filter
      if (roundFilter !== "all" && interview.round !== roundFilter) return false;
      
      // Search filter
      if (debouncedSearch && !interview.candidate.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
          !interview.position.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      
      // Date range filter
      if (dateFrom && interview.date < dateFrom) return false;
      if (dateTo && interview.date > dateTo) return false;
      
      return true;
    });
  }, [interviews, statusFilter, roundFilter, debouncedSearch, dateFrom, dateTo]);

  const todayInterviews = interviews.filter(i => i.date === "2024-01-20");
  const upcomingInterviews = interviews.filter(i => i.status === "scheduled");
  const completedInterviews = interviews.filter(i => i.status === "completed");
  const pendingInterviews = interviews.filter(i => i.status === "pending");

  // Handle scheduling new interview
  const handleScheduleInterview = useCallback(() => {
    if (!newInterview.candidate || !newInterview.date || !newInterview.time) return;
    
    // Check for conflicts
    const conflict = checkTimeConflict(interviews, newInterview.date, newInterview.time, parseInt(newInterview.duration));
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }
    
    const interview: Interview = {
      id: Math.max(...interviews.map(i => i.id)) + 1,
      candidate: newInterview.candidate,
      position: "Pending Assignment",
      date: newInterview.date,
      time: newInterview.time,
      duration: parseInt(newInterview.duration),
      type: newInterview.type,
      status: "scheduled",
      round: newInterview.round,
      interviewers: selectedInterviewers.map(id => AVAILABLE_INTERVIEWERS.find(i => i.id === id)?.name || ""),
      location: newInterview.location,
    };
    
    setInterviews([...interviews, interview]);
    setIsScheduleDialogOpen(false);
    setNewInterview({ candidate: "", date: "", time: "", duration: "60", type: "", round: "", location: "", notes: "" });
    setSelectedInterviewers([]);
    setConflictWarning(null);
  }, [newInterview, selectedInterviewers, interviews]);

  // Handle reschedule
  const handleReschedule = useCallback(() => {
    if (!selectedInterview) return;
    
    const conflict = checkTimeConflict(interviews, newInterview.date || selectedInterview.date, newInterview.time || selectedInterview.time, parseInt(newInterview.duration) || selectedInterview.duration, selectedInterview.id);
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }
    
    setInterviews(interviews.map(i => 
      i.id === selectedInterview.id 
        ? { ...i, date: newInterview.date || i.date, time: newInterview.time || i.time, duration: parseInt(newInterview.duration) || i.duration }
        : i
    ));
    setIsRescheduleDialogOpen(false);
    setSelectedInterview(null);
    setConflictWarning(null);
  }, [selectedInterview, newInterview, interviews]);

  // Handle cancel interview
  const handleCancelInterview = useCallback(() => {
    if (!selectedInterview) return;
    setInterviews(interviews.filter(i => i.id !== selectedInterview.id));
    setIsCancelDialogOpen(false);
    setSelectedInterview(null);
  }, [selectedInterview, interviews]);

  // Handle submit feedback
  const handleSubmitFeedback = useCallback(() => {
    if (!selectedInterview) return;
    const avgRating = (feedbackForm.technicalSkills + feedbackForm.communication + feedbackForm.teachingAbility + feedbackForm.cultureFit) / 4;
    setInterviews(interviews.map(i => 
      i.id === selectedInterview.id 
        ? { ...i, status: "completed", rating: avgRating, feedback: { ...feedbackForm } }
        : i
    ));
    setIsFeedbackDialogOpen(false);
    setSelectedInterview(null);
    setFeedbackForm({ technicalSkills: 3, communication: 3, teachingAbility: 3, cultureFit: 3, comments: "" });
  }, [selectedInterview, feedbackForm, interviews]);

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    const headers = ["Candidate", "Position", "Date", "Time", "Duration", "Type", "Round", "Status", "Interviewers", "Location", "Rating"];
    const rows = filteredInterviews.map(i => [
      i.candidate, i.position, i.date, i.time, `${i.duration} min`, i.type, i.round, i.status, i.interviewers.join("; "), i.location, i.rating || ""
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interviews_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }, [filteredInterviews]);

  // Group interviews by date for calendar view
  const interviewsByDate = useMemo(() => {
    const grouped: Record<string, Interview[]> = {};
    filteredInterviews.forEach(interview => {
      if (!grouped[interview.date]) grouped[interview.date] = [];
      grouped[interview.date].push(interview);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredInterviews]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interview Management</h1>
          <p className="text-muted-foreground">Schedule and manage candidate interviews for teaching positions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />Export CSV
          </Button>
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Schedule Interview</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Interview</DialogTitle>
                <DialogDescription>Set up an interview with a candidate for a teaching position</DialogDescription>
              </DialogHeader>
              
              {conflictWarning && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2"
                >
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Time Conflict Detected</p>
                    <p className="text-sm text-yellow-700">
                      Overlaps with interview for {conflictWarning.candidate} at {conflictWarning.time}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setConflictWarning(null)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Candidate *</Label>
                  <Select value={newInterview.candidate} onValueChange={v => setNewInterview({...newInterview, candidate: v})}>
                    <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mariam Khalil">Mariam Khalil - Teacher, English</SelectItem>
                      <SelectItem value="Omar Hassan">Omar Hassan - Expert Teacher, History</SelectItem>
                      <SelectItem value="Fatima Al-Sayed">Fatima Al-Sayed - Teacher, Arabic</SelectItem>
                      <SelectItem value="Ahmed Nasser">Ahmed Nasser - Senior Teacher, Biology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input 
                      type="date" 
                      value={newInterview.date}
                      onChange={e => setNewInterview({...newInterview, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time *</Label>
                    <Input 
                      type="time" 
                      value={newInterview.time}
                      onChange={e => setNewInterview({...newInterview, time: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={newInterview.duration} onValueChange={v => setNewInterview({...newInterview, duration: v})}>
                      <SelectTrigger><Timer className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Interview Round</Label>
                    <Select value={newInterview.round} onValueChange={v => setNewInterview({...newInterview, round: v})}>
                      <SelectTrigger><SelectValue placeholder="Select round" /></SelectTrigger>
                      <SelectContent>
                        {INTERVIEW_ROUNDS.map(round => (
                          <SelectItem key={round.value} value={round.value}>{round.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Interview Type</Label>
                    <Select value={newInterview.type} onValueChange={v => setNewInterview({...newInterview, type: v})}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Call (Microsoft Teams)</SelectItem>
                        <SelectItem value="video-zoom">Video Call (Zoom)</SelectItem>
                        <SelectItem value="video-meet">Video Call (Google Meet)</SelectItem>
                        <SelectItem value="in-person">In-Person</SelectItem>
                        <SelectItem value="phone">Phone Interview</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Location / Meeting Link</Label>
                  <Input 
                    placeholder="Room number or meeting link" 
                    value={newInterview.location}
                    onChange={e => setNewInterview({...newInterview, location: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Interviewers (Multi-select)</Label>
                  <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                    {AVAILABLE_INTERVIEWERS.map(interviewer => (
                      <div key={interviewer.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={interviewer.id}
                          checked={selectedInterviewers.includes(interviewer.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedInterviewers([...selectedInterviewers, interviewer.id]);
                            } else {
                              setSelectedInterviewers(selectedInterviewers.filter(id => id !== interviewer.id));
                            }
                          }}
                        />
                        <label htmlFor={interviewer.id} className="text-sm flex-1 cursor-pointer">
                          <span className="font-medium">{interviewer.name}</span>
                          <span className="text-muted-foreground ml-2">({interviewer.role})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedInterviewers.length > 0 && (
                    <p className="text-xs text-muted-foreground">{selectedInterviewers.length} interviewer(s) selected</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Notes / Special Instructions</Label>
                  <Textarea 
                    placeholder="Any special instructions, focus areas, or questions to cover..." 
                    rows={3}
                    value={newInterview.notes}
                    onChange={e => setNewInterview({...newInterview, notes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsScheduleDialogOpen(false); setConflictWarning(null); }}>Cancel</Button>
                <Button onClick={handleScheduleInterview}>
                  <Bell className="h-4 w-4 mr-2" />Schedule & Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg"><Calendar className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Interviews</p>
                <p className="text-2xl font-bold">{todayInterviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Clock className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingInterviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedInterviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><AlertCircle className="h-5 w-5 text-yellow-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingInterviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Star className="h-5 w-5 text-purple-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {completedInterviews.length > 0 
                    ? (completedInterviews.reduce((sum, i) => sum + (i.rating || 0), 0) / completedInterviews.length).toFixed(1)
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === "list" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-1" />List
              </Button>
              <Button 
                variant={viewMode === "calendar" ? "default" : "outline"} 
                size="sm"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarDays className="h-4 w-4 mr-1" />Calendar
              </Button>
            </div>
            
            <div className="h-6 w-px bg-border" />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={roundFilter} onValueChange={setRoundFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="All Rounds" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rounds</SelectItem>
                {INTERVIEW_ROUNDS.map(round => (
                  <SelectItem key={round.value} value={round.value}>{round.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input 
              placeholder="Search candidate or position..." 
              className="max-w-xs"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            
            <div className="flex items-center gap-2">
              <Input 
                type="date" 
                className="w-36" 
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                placeholder="From"
              />
              <span className="text-muted-foreground">to</span>
              <Input 
                type="date" 
                className="w-36" 
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                placeholder="To"
              />
            </div>
            
            {(statusFilter !== "all" || roundFilter !== "all" || searchQuery || dateFrom || dateTo) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setStatusFilter("all");
                  setRoundFilter("all");
                  setSearchQuery("");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                <RotateCcw className="h-4 w-4 mr-1" />Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interview List or Calendar View */}
      <AnimatePresence mode="wait">
        {viewMode === "list" ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid gap-4"
          >
            {filteredInterviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No interviews found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or schedule a new interview</p>
                </CardContent>
              </Card>
            ) : (
              filteredInterviews.map(interview => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {interview.candidate.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{interview.candidate}</h3>
                              <Badge variant="outline" className="text-xs">
                                {INTERVIEW_ROUNDS.find(r => r.value === interview.round)?.label || interview.round}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{interview.position}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />{interview.date}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />{interview.time}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Timer className="h-3 w-3" />{interview.duration} min
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                {interview.type === "video" || interview.type.includes("video") ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                {interview.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {interview.interviewers.length > 0 && (
                            <div className="flex items-center gap-1 max-w-[200px]">
                              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm text-muted-foreground truncate">{interview.interviewers.join(", ")}</span>
                            </div>
                          )}
                          <Badge variant={
                            interview.status === "scheduled" ? "default" :
                            interview.status === "completed" ? "secondary" : "outline"
                          }>
                            {interview.status === "completed" && interview.rating && (
                              <span className="mr-1">★ {interview.rating.toFixed(1)}</span>
                            )}
                            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                          </Badge>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {interview.status === "scheduled" && (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  {interview.type === "video" || interview.type.includes("video") ? (
                                    <><Video className="h-4 w-4 mr-1" />Join</>
                                  ) : (
                                    <><CheckCircle2 className="h-4 w-4 mr-1" />Check In</>
                                  )}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInterview(interview);
                                    setNewInterview({ ...newInterview, date: interview.date, time: interview.time, duration: String(interview.duration) });
                                    setIsRescheduleDialogOpen(true);
                                  }}
                                >
                                  <RefreshCw className="h-4 w-4 mr-1" />Reschedule
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInterview(interview);
                                    setIsFeedbackDialogOpen(true);
                                  }}
                                >
                                  <FileText className="h-4 w-4 mr-1" />Complete
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedInterview(interview);
                                    setIsCancelDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {interview.status === "completed" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedInterview(interview);
                                  if (interview.feedback) {
                                    setFeedbackForm(interview.feedback);
                                  }
                                  setIsFeedbackDialogOpen(true);
                                }}
                              >
                                <Star className="h-4 w-4 mr-1" />View Feedback
                              </Button>
                            )}
                            {interview.status === "pending" && (
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedInterview(interview);
                                  setIsScheduleDialogOpen(true);
                                }}
                              >
                                <Calendar className="h-4 w-4 mr-1" />Schedule Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="calendar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {interviewsByDate.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">No interviews scheduled</h3>
                  <p className="text-muted-foreground">Schedule a new interview to see it on the calendar</p>
                </CardContent>
              </Card>
            ) : (
              interviewsByDate.map(([date, dateInterviews]) => (
                <Card key={date}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      <Badge variant="secondary">{dateInterviews.length} interview{dateInterviews.length > 1 ? 's' : ''}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {dateInterviews.sort((a, b) => a.time.localeCompare(b.time)).map(interview => (
                      <div 
                        key={interview.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-center min-w-[60px]">
                            <p className="font-semibold text-primary">{interview.time}</p>
                            <p className="text-xs text-muted-foreground">{interview.duration} min</p>
                          </div>
                          <div className="h-8 w-px bg-border" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{interview.candidate}</span>
                              <Badge variant="outline" className="text-xs">
                                {INTERVIEW_ROUNDS.find(r => r.value === interview.round)?.label || interview.round}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{interview.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            interview.status === "scheduled" ? "default" :
                            interview.status === "completed" ? "secondary" : "outline"
                          }>
                            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                          </Badge>
                          {interview.status === "scheduled" && (
                            <Button size="sm" variant="outline">
                              <Video className="h-4 w-4 mr-1" />Join
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Interview</DialogTitle>
            <DialogDescription>
              Rescheduling interview for {selectedInterview?.candidate}
            </DialogDescription>
          </DialogHeader>
          
          {conflictWarning && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2"
            >
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Time Conflict</p>
                <p className="text-sm text-yellow-700">
                  Overlaps with {conflictWarning.candidate} at {conflictWarning.time}
                </p>
              </div>
            </motion.div>
          )}
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>New Date</Label>
                <Input 
                  type="date" 
                  value={newInterview.date}
                  onChange={e => setNewInterview({...newInterview, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>New Time</Label>
                <Input 
                  type="time" 
                  value={newInterview.time}
                  onChange={e => setNewInterview({...newInterview, time: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={newInterview.duration} onValueChange={v => setNewInterview({...newInterview, duration: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsRescheduleDialogOpen(false); setConflictWarning(null); }}>Cancel</Button>
            <Button onClick={handleReschedule}>
              <RefreshCw className="h-4 w-4 mr-2" />Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this interview?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedInterview && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">{selectedInterview.candidate}</p>
                <p className="text-sm text-muted-foreground">{selectedInterview.position}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedInterview.date} at {selectedInterview.time}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Keep Interview</Button>
            <Button variant="destructive" onClick={handleCancelInterview}>
              <Trash2 className="h-4 w-4 mr-2" />Cancel Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedInterview?.status === "completed" ? "Interview Feedback" : "Complete Interview & Submit Feedback"}
            </DialogTitle>
            <DialogDescription>
              {selectedInterview?.candidate} - {selectedInterview?.position}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Technical Skills</Label>
                  <span className="text-sm font-medium">{feedbackForm.technicalSkills}/5</span>
                </div>
                <Slider
                  value={[feedbackForm.technicalSkills]}
                  onValueChange={([v]) => setFeedbackForm({...feedbackForm, technicalSkills: v})}
                  max={5}
                  min={1}
                  step={1}
                  disabled={selectedInterview?.status === "completed"}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Communication</Label>
                  <span className="text-sm font-medium">{feedbackForm.communication}/5</span>
                </div>
                <Slider
                  value={[feedbackForm.communication]}
                  onValueChange={([v]) => setFeedbackForm({...feedbackForm, communication: v})}
                  max={5}
                  min={1}
                  step={1}
                  disabled={selectedInterview?.status === "completed"}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Teaching Ability</Label>
                  <span className="text-sm font-medium">{feedbackForm.teachingAbility}/5</span>
                </div>
                <Slider
                  value={[feedbackForm.teachingAbility]}
                  onValueChange={([v]) => setFeedbackForm({...feedbackForm, teachingAbility: v})}
                  max={5}
                  min={1}
                  step={1}
                  disabled={selectedInterview?.status === "completed"}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Culture Fit</Label>
                  <span className="text-sm font-medium">{feedbackForm.cultureFit}/5</span>
                </div>
                <Slider
                  value={[feedbackForm.cultureFit]}
                  onValueChange={([v]) => setFeedbackForm({...feedbackForm, cultureFit: v})}
                  max={5}
                  min={1}
                  step={1}
                  disabled={selectedInterview?.status === "completed"}
                />
              </div>
            </div>
            
            <div className="bg-primary/5 p-3 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <p className="text-2xl font-bold text-primary">
                {((feedbackForm.technicalSkills + feedbackForm.communication + feedbackForm.teachingAbility + feedbackForm.cultureFit) / 4).toFixed(1)} / 5
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Comments & Notes</Label>
              <Textarea 
                placeholder="Overall impressions, strengths, areas for improvement..."
                rows={4}
                value={feedbackForm.comments}
                onChange={e => setFeedbackForm({...feedbackForm, comments: e.target.value})}
                disabled={selectedInterview?.status === "completed"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsFeedbackDialogOpen(false); setFeedbackForm({ technicalSkills: 3, communication: 3, teachingAbility: 3, cultureFit: 3, comments: "" }); }}>
              {selectedInterview?.status === "completed" ? "Close" : "Cancel"}
            </Button>
            {selectedInterview?.status !== "completed" && (
              <Button onClick={handleSubmitFeedback}>
                <CheckCircle2 className="h-4 w-4 mr-2" />Submit Feedback
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
