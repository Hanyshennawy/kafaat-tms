import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Briefcase, Users, Calendar, CheckCircle, TrendingUp, TrendingDown,
  Clock, FileText, UserPlus, Mail, Eye, Star, GraduationCap, Award,
  Building, ChevronRight, AlertCircle, Target, Zap, Send, Download, Printer,
  DollarSign, MapPin, User, Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

// Offer letter templates
const offerTemplates = [
  { id: "standard-teacher", name: "Standard Teacher Offer", icon: "👨‍🏫" },
  { id: "senior-educator", name: "Senior Educator Offer", icon: "🎓" },
  { id: "leadership", name: "Leadership Position", icon: "👔" },
  { id: "contract", name: "Contract Position", icon: "📄" },
];

// Demo candidates for offer
const offerCandidates = [
  { id: 1, name: "Fatima Al-Rashid", position: "Mathematics Teacher", email: "fatima@email.com", score: 95 },
  { id: 2, name: "Omar Saeed", position: "Science Coordinator", email: "omar@email.com", score: 92 },
  { id: 3, name: "Noor Abdullah", position: "Elementary Teacher", email: "noor@email.com", score: 90 },
  { id: 4, name: "Ahmed Hassan", position: "Special Ed Teacher", email: "ahmed@email.com", score: 88 },
];

// Demo data
const pipelineData = [
  { stage: "Applied", count: 156, color: "bg-blue-500" },
  { stage: "Screened", count: 89, color: "bg-cyan-500" },
  { stage: "Interviewed", count: 42, color: "bg-yellow-500" },
  { stage: "Offered", count: 12, color: "bg-orange-500" },
  { stage: "Hired", count: 8, color: "bg-green-500" },
];

const activePositions = [
  { id: 1, title: "Mathematics Teacher", department: "STEM", applicants: 23, daysOpen: 12, priority: "urgent", grade: "9-12" },
  { id: 2, title: "Science Coordinator", department: "Science", applicants: 15, daysOpen: 8, priority: "high", grade: "K-12" },
  { id: 3, title: "Elementary Teacher", department: "Elementary", applicants: 31, daysOpen: 21, priority: "normal", grade: "K-5" },
  { id: 4, title: "Special Education Teacher", department: "Special Ed", applicants: 8, daysOpen: 30, priority: "urgent", grade: "6-8" },
  { id: 5, title: "Physical Education Teacher", department: "PE", applicants: 19, daysOpen: 5, priority: "normal", grade: "K-8" },
];

const upcomingInterviews = [
  { id: 1, candidate: "Sarah Ahmed", position: "Mathematics Teacher", time: "10:00 AM", date: "Today", interviewer: "Dr. Hassan", type: "Panel" },
  { id: 2, candidate: "Mohammed Ali", position: "Science Coordinator", time: "2:00 PM", date: "Today", interviewer: "Ms. Fatima", type: "Technical" },
  { id: 3, candidate: "Layla Khalid", position: "Elementary Teacher", time: "9:30 AM", date: "Tomorrow", interviewer: "Mr. Omar", type: "Demo Lesson" },
  { id: 4, candidate: "Ahmed Hassan", position: "Special Ed Teacher", time: "11:00 AM", date: "Tomorrow", interviewer: "Dr. Aisha", type: "Behavioral" },
];

const topCandidates = [
  { id: 1, name: "Fatima Al-Rashid", position: "Mathematics Teacher", score: 95, experience: "8 years", certification: "Certified", status: "Awaiting Decision" },
  { id: 2, name: "Omar Saeed", position: "Science Coordinator", score: 92, experience: "12 years", certification: "Certified", status: "References Check" },
  { id: 3, name: "Noor Abdullah", position: "Elementary Teacher", score: 90, experience: "5 years", certification: "In Progress", status: "Final Interview" },
];

const departmentHiring = [
  { dept: "Mathematics", openings: 4, hired: 2, target: 6 },
  { dept: "Science", openings: 3, hired: 1, target: 4 },
  { dept: "English", openings: 2, hired: 2, target: 4 },
  { dept: "Elementary", openings: 5, hired: 3, target: 8 },
  { dept: "Special Ed", openings: 3, hired: 0, target: 3 },
];

const hiringVelocity = [
  { month: "Jul", days: 45 },
  { month: "Aug", days: 42 },
  { month: "Sep", days: 38 },
  { month: "Oct", days: 35 },
  { month: "Nov", days: 32 },
  { month: "Dec", days: 28 },
];

export default function RecruitmentDashboard() {
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [offerTab, setOfferTab] = useState("candidate");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [offerData, setOfferData] = useState({
    candidateId: "",
    candidateName: "",
    candidateEmail: "",
    position: "",
    department: "",
    startDate: "",
    salaryAmount: 12000,
    currency: "AED",
    contractType: "full-time",
    contractDuration: "2 years",
    probationPeriod: "3 months",
    benefits: {
      housing: true,
      transport: true,
      healthInsurance: true,
      annualFlight: true,
      tuitionSupport: false,
    },
    customMessage: "",
    expiryDays: 7,
    sendImmediately: false,
  });

  const maxPipeline = Math.max(...pipelineData.map(p => p.count));
  const maxVelocity = Math.max(...hiringVelocity.map(h => h.days));

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent": return <Badge variant="destructive">Urgent</Badge>;
      case "high": return <Badge className="bg-orange-500">High</Badge>;
      default: return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const selectCandidate = (candidateId: string) => {
    const candidate = offerCandidates.find(c => c.id.toString() === candidateId);
    if (candidate) {
      setOfferData(prev => ({
        ...prev,
        candidateId: candidateId,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        position: candidate.position,
      }));
    }
  };

  const generateOfferLetter = () => {
    toast.success(`Offer letter generated for ${offerData.candidateName}!`);
    if (offerData.sendImmediately) {
      toast.success(`Offer sent to ${offerData.candidateEmail}`);
    }
    setIsOfferDialogOpen(false);
    resetOfferForm();
  };

  const generateOfferHTML = () => {
    const benefitsList = [];
    if (offerData.benefits.housing) benefitsList.push("Housing Allowance");
    if (offerData.benefits.transport) benefitsList.push("Transportation Allowance");
    if (offerData.benefits.healthInsurance) benefitsList.push("Comprehensive Health Insurance");
    if (offerData.benefits.annualFlight) benefitsList.push("Annual Flight Allowance");
    if (offerData.benefits.tuitionSupport) benefitsList.push("Tuition Support for Dependents");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Offer Letter - ${offerData.candidateName}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #1e40af; margin: 0; font-size: 28px; }
          .header h2 { color: #374151; margin: 10px 0 0; font-size: 18px; }
          .date { margin-bottom: 20px; }
          .details-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .details-box p { margin: 8px 0; }
          .details-box strong { display: inline-block; width: 150px; }
          ul { margin: 10px 0; padding-left: 25px; }
          li { margin: 5px 0; }
          .signature { margin-top: 60px; }
          .custom-message { border-left: 4px solid #1e40af; padding-left: 15px; font-style: italic; margin: 20px 0; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KAFAAT EDUCATION</h1>
          <h2>Employment Offer Letter</h2>
        </div>
        
        <p class="date">Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <p>Dear <strong>${offerData.candidateName || "[Candidate Name]"}</strong>,</p>
        
        <p>
          We are pleased to offer you the position of <strong>${offerData.position || "[Position]"}</strong> in our 
          ${offerData.department ? `${offerData.department} department` : "organization"}. We were impressed with your 
          qualifications and believe you will be a valuable addition to our team.
        </p>

        <div class="details-box">
          <p><strong>Position:</strong> ${offerData.position || "[Position]"}</p>
          <p><strong>Department:</strong> ${offerData.department || "[Department]"}</p>
          <p><strong>Start Date:</strong> ${offerData.startDate ? new Date(offerData.startDate).toLocaleDateString() : "[Start Date]"}</p>
          <p><strong>Monthly Salary:</strong> AED ${offerData.salaryAmount.toLocaleString()}</p>
          <p><strong>Contract Duration:</strong> ${offerData.contractDuration}</p>
          <p><strong>Probation Period:</strong> ${offerData.probationPeriod}</p>
        </div>

        <p><strong>Benefits:</strong></p>
        <ul>
          ${benefitsList.map(b => `<li>${b}</li>`).join('')}
        </ul>

        ${offerData.customMessage ? `<p class="custom-message">${offerData.customMessage}</p>` : ''}

        <p>
          This offer is valid for <strong>${offerData.expiryDays} days</strong> from the date of this letter. 
          Please sign and return the enclosed copy to confirm your acceptance.
        </p>

        <p>We look forward to welcoming you to our team!</p>

        <div class="signature">
          <p>Sincerely,</p>
          <p style="margin-top: 40px;"><strong>Human Resources Department</strong></p>
          <p>Kafaat Education</p>
        </div>
      </body>
      </html>
    `;
  };

  const downloadOfferPDF = () => {
    const html = generateOfferHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Wait for content to load then trigger print dialog (which allows Save as PDF)
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          toast.success("PDF download dialog opened");
        }, 250);
      };
    } else {
      toast.error("Please allow pop-ups to download PDF");
    }
  };

  const printOfferLetter = () => {
    const html = generateOfferHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    } else {
      toast.error("Please allow pop-ups to print");
    }
  };

  const resetOfferForm = () => {
    setOfferData({
      candidateId: "",
      candidateName: "",
      candidateEmail: "",
      position: "",
      department: "",
      startDate: "",
      salaryAmount: 12000,
      currency: "AED",
      contractType: "full-time",
      contractDuration: "2 years",
      probationPeriod: "3 months",
      benefits: {
        housing: true,
        transport: true,
        healthInsurance: true,
        annualFlight: true,
        tuitionSupport: false,
      },
      customMessage: "",
      expiryDays: 7,
      sendImmediately: false,
    });
    setSelectedTemplate(null);
    setOfferTab("candidate");
  };

  return (
    <div className="space-y-6">
      {/* Offer Letter Dialog */}
      <Dialog open={isOfferDialogOpen} onOpenChange={(open) => { setIsOfferDialogOpen(open); if (!open) resetOfferForm(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Generate Offer Letter
            </DialogTitle>
          </DialogHeader>

          <Tabs value={offerTab} onValueChange={setOfferTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="candidate" className="gap-2">
                <User className="h-4 w-4" />
                Candidate
              </TabsTrigger>
              <TabsTrigger value="compensation" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Compensation
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Select Candidate */}
            <TabsContent value="candidate" className="space-y-6 mt-4">
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  Choose Template
                </Label>
                <div className="grid grid-cols-4 gap-3">
                  {offerTemplates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all text-center hover:border-primary hover:bg-accent/50 ${selectedTemplate === template.id ? 'border-primary bg-accent ring-2 ring-primary/20' : ''}`}
                    >
                      <div className="text-2xl mb-1">{template.icon}</div>
                      <h4 className="font-medium text-xs">{template.name}</h4>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Select Candidate *</Label>
                <Select value={offerData.candidateId} onValueChange={selectCandidate}>
                  <SelectTrigger><SelectValue placeholder="Choose a candidate" /></SelectTrigger>
                  <SelectContent>
                    {offerCandidates.map(candidate => (
                      <SelectItem key={candidate.id} value={candidate.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{candidate.name}</span>
                          <Badge variant="secondary" className="text-xs">{candidate.position}</Badge>
                          <span className="text-green-600 text-xs">Score: {candidate.score}%</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {offerData.candidateName && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {offerData.candidateName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{offerData.candidateName}</h4>
                        <p className="text-sm text-muted-foreground">{offerData.candidateEmail}</p>
                        <Badge className="mt-1">{offerData.position}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={offerData.department} onValueChange={(v) => setOfferData({ ...offerData, department: v })}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Elementary">Elementary</SelectItem>
                      <SelectItem value="Special Education">Special Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Proposed Start Date</Label>
                  <Input 
                    type="date"
                    value={offerData.startDate}
                    onChange={(e) => setOfferData({ ...offerData, startDate: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Compensation Details */}
            <TabsContent value="compensation" className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Salary</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-muted-foreground/20 bg-muted text-sm">
                      AED
                    </span>
                    <Input 
                      type="number"
                      className="rounded-l-none"
                      value={offerData.salaryAmount}
                      onChange={(e) => setOfferData({ ...offerData, salaryAmount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Contract Type</Label>
                  <Select value={offerData.contractType} onValueChange={(v) => setOfferData({ ...offerData, contractType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="contract">Fixed-Term Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contract Duration</Label>
                  <Select value={offerData.contractDuration} onValueChange={(v) => setOfferData({ ...offerData, contractDuration: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 year">1 Year</SelectItem>
                      <SelectItem value="2 years">2 Years</SelectItem>
                      <SelectItem value="3 years">3 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Probation Period</Label>
                  <Select value={offerData.probationPeriod} onValueChange={(v) => setOfferData({ ...offerData, probationPeriod: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 month">1 Month</SelectItem>
                      <SelectItem value="3 months">3 Months</SelectItem>
                      <SelectItem value="6 months">6 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Benefits Package</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "housing", label: "Housing Allowance", amount: "AED 5,000/month" },
                    { key: "transport", label: "Transportation", amount: "AED 1,500/month" },
                    { key: "healthInsurance", label: "Health Insurance", amount: "Family coverage" },
                    { key: "annualFlight", label: "Annual Flight", amount: "Home country" },
                    { key: "tuitionSupport", label: "Tuition Support", amount: "Up to 2 children" },
                  ].map(benefit => (
                    <div key={benefit.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="font-medium">{benefit.label}</Label>
                        <p className="text-xs text-muted-foreground">{benefit.amount}</p>
                      </div>
                      <Switch 
                        checked={offerData.benefits[benefit.key as keyof typeof offerData.benefits]}
                        onCheckedChange={(checked) => setOfferData({
                          ...offerData,
                          benefits: { ...offerData.benefits, [benefit.key]: checked }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Custom Message (Optional)</Label>
                <Textarea 
                  placeholder="Add a personal message to the offer letter..."
                  value={offerData.customMessage}
                  onChange={(e) => setOfferData({ ...offerData, customMessage: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Tab 3: Preview & Send */}
            <TabsContent value="preview" className="space-y-6 mt-4">
              <Card className="border-2 border-dashed">
                <CardHeader className="text-center border-b bg-muted/30">
                  <div className="text-2xl font-bold text-primary mb-2">KAFAAT EDUCATION</div>
                  <CardTitle>Employment Offer Letter</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-sm">
                  <p>Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  
                  <p>Dear <strong>{offerData.candidateName || "[Candidate Name]"}</strong>,</p>
                  
                  <p>
                    We are pleased to offer you the position of <strong>{offerData.position || "[Position]"}</strong> in our 
                    {offerData.department ? ` ${offerData.department} department` : " organization"}. We were impressed with your 
                    qualifications and believe you will be a valuable addition to our team.
                  </p>

                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p><strong>Position:</strong> {offerData.position || "[Position]"}</p>
                    <p><strong>Department:</strong> {offerData.department || "[Department]"}</p>
                    <p><strong>Start Date:</strong> {offerData.startDate ? new Date(offerData.startDate).toLocaleDateString() : "[Start Date]"}</p>
                    <p><strong>Monthly Salary:</strong> AED {offerData.salaryAmount.toLocaleString()}</p>
                    <p><strong>Contract Duration:</strong> {offerData.contractDuration}</p>
                    <p><strong>Probation Period:</strong> {offerData.probationPeriod}</p>
                  </div>

                  <p><strong>Benefits:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    {offerData.benefits.housing && <li>Housing Allowance</li>}
                    {offerData.benefits.transport && <li>Transportation Allowance</li>}
                    {offerData.benefits.healthInsurance && <li>Comprehensive Health Insurance</li>}
                    {offerData.benefits.annualFlight && <li>Annual Flight Allowance</li>}
                    {offerData.benefits.tuitionSupport && <li>Tuition Support for Dependents</li>}
                  </ul>

                  {offerData.customMessage && (
                    <p className="italic border-l-4 border-primary pl-4">{offerData.customMessage}</p>
                  )}

                  <p>
                    This offer is valid for <strong>{offerData.expiryDays} days</strong> from the date of this letter. 
                    Please sign and return the enclosed copy to confirm your acceptance.
                  </p>

                  <p>We look forward to welcoming you to our team!</p>

                  <div className="pt-8">
                    <p>Sincerely,</p>
                    <p className="font-semibold mt-4">Human Resources Department</p>
                    <p>Kafaat Education</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="font-semibold">Send Immediately</Label>
                  <p className="text-sm text-muted-foreground">Email offer to candidate upon generation</p>
                </div>
                <Switch 
                  checked={offerData.sendImmediately}
                  onCheckedChange={(checked) => setOfferData({ ...offerData, sendImmediately: checked })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Offer Expiry (Days)</Label>
                  <Select value={offerData.expiryDays.toString()} onValueChange={(v) => setOfferData({ ...offerData, expiryDays: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="5">5 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsOfferDialogOpen(false)}>Cancel</Button>
            <div className="flex gap-2">
              {offerTab === "preview" && (
                <>
                  <Button variant="outline" className="gap-2" onClick={downloadOfferPDF}>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={printOfferLetter}>
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                </>
              )}
              {offerTab !== "preview" ? (
                <Button onClick={() => {
                  if (offerTab === "candidate") setOfferTab("compensation");
                  else if (offerTab === "compensation") setOfferTab("preview");
                }}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={generateOfferLetter}
                  disabled={!offerData.candidateName}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {offerData.sendImmediately ? "Generate & Send" : "Generate Offer"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            Recruitment Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Overview of recruitment activities and metrics</p>
        </div>
        <div className="flex gap-2">
          <Link href="/recruitment/requisitions">
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              View All Positions
            </Button>
          </Link>
          <Link href="/recruitment/requisitions">
            <Button className="gap-2">
              <Briefcase className="h-4 w-4" />
              Post New Position
            </Button>
          </Link>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              Open Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Across 8 departments</p>
              </div>
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                +3
              </div>
            </div>
            <Progress value={80} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-1">24 of 30 target positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Active Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">In various stages</p>
              </div>
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                +24
              </div>
            </div>
            <div className="flex gap-1 mt-3">
              {pipelineData.slice(0, 4).map((stage, idx) => (
                <div key={idx} className={`h-2 flex-1 rounded ${stage.color}`} style={{ opacity: 0.3 + (idx * 0.15) }} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">57% conversion to interview</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              Interviews Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                +5
              </div>
            </div>
            <Progress value={60} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-1">18 of 30 weekly target</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Offers Extended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">Pending acceptance</p>
              </div>
              <div className="flex items-center text-yellow-600 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                5 days avg
              </div>
            </div>
            <Progress value={85} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-1">85% acceptance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline and Velocity Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recruitment Pipeline Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recruitment Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pipelineData.map((stage, idx) => (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{stage.count}</span>
                      {idx > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({Math.round((stage.count / pipelineData[idx - 1].count) * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-8 bg-muted rounded-lg overflow-hidden">
                    <div 
                      className={`h-full ${stage.color} transition-all flex items-center justify-end pr-2`}
                      style={{ width: `${(stage.count / maxPipeline) * 100}%` }}
                    >
                      {stage.count > 20 && <span className="text-white text-xs font-medium">{stage.count}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Conversion Rate</span>
              <span className="font-bold text-green-600">5.1% (Applied → Hired)</span>
            </div>
          </CardContent>
        </Card>

        {/* Hiring Velocity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Time-to-Hire Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 gap-2">
              {hiringVelocity.map((month) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium">{month.days}d</span>
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${(month.days / maxVelocity) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">28 days</div>
                <div className="text-xs text-muted-foreground">Current Avg</div>
              </div>
              <div>
                <div className="text-lg font-bold">35 days</div>
                <div className="text-xs text-muted-foreground">Target</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">-17 days</div>
                <div className="text-xs text-muted-foreground">vs Last Quarter</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions and Interviews Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Positions Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Active Positions
            </CardTitle>
            <Link href="/recruitment/requisitions">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activePositions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{position.title}</span>
                      {getPriorityBadge(position.priority)}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        Grade {position.grade}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{position.applicants}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {position.daysOpen} days open
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Interviews
            </CardTitle>
            <Link href="/recruitment/interviews">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {interview.candidate.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{interview.candidate}</div>
                    <div className="text-xs text-muted-foreground">{interview.position}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{interview.time}</div>
                    <div className="text-xs text-muted-foreground">{interview.date}</div>
                  </div>
                  <Badge variant="outline">{interview.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Candidates and Department Hiring */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Candidates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCandidates.map((candidate, idx) => (
                <div key={candidate.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                    {idx + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{candidate.name}</div>
                    <div className="text-xs text-muted-foreground">{candidate.position} • {candidate.experience}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{candidate.score}%</div>
                    <Badge variant={candidate.certification === "Certified" ? "default" : "secondary"} className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {candidate.certification}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hiring by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Hiring by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentHiring.map((dept) => (
                <div key={dept.dept} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dept.dept}</span>
                    <span className="text-muted-foreground">
                      {dept.hired} hired / {dept.openings} open / {dept.target} target
                    </span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                    <div 
                      className="bg-green-500 transition-all"
                      style={{ width: `${(dept.hired / dept.target) * 100}%` }}
                    />
                    <div 
                      className="bg-yellow-500 transition-all"
                      style={{ width: `${(dept.openings / dept.target) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>Hired</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span>Open Positions</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-muted" />
                <span>Remaining Target</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Educator Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Actions */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link href="/recruitment/requisitions">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span className="text-xs">Post Position</span>
              </Button>
            </Link>
            <Link href="/recruitment/candidates">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-xs">Review Apps</span>
              </Button>
            </Link>
            <Link href="/recruitment/interviews">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <span className="text-xs">Schedule</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="w-full h-auto py-4 flex flex-col gap-2"
              onClick={() => setIsOfferDialogOpen(true)}
            >
              <FileText className="h-5 w-5 text-green-600" />
              <span className="text-xs">Offer Letter</span>
            </Button>
          </CardContent>
        </Card>

        {/* Educator-Specific Metrics */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Educator Recruitment Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">78%</div>
                <div className="text-xs text-muted-foreground mt-1">Certified Candidates</div>
                <Progress value={78} className="mt-2 h-1" />
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">6.2</div>
                <div className="text-xs text-muted-foreground mt-1">Avg. Years Experience</div>
                <Progress value={62} className="mt-2 h-1" />
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">85%</div>
                <div className="text-xs text-muted-foreground mt-1">Subject Match Rate</div>
                <Progress value={85} className="mt-2 h-1" />
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">4.2</div>
                <div className="text-xs text-muted-foreground mt-1">Avg. Interview Score</div>
                <Progress value={84} className="mt-2 h-1" />
              </div>
            </div>
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Coverage Gaps:</span>
                <Badge variant="outline" className="ml-2">Special Education (-3)</Badge>
                <Badge variant="outline">Mathematics (-2)</Badge>
                <Badge variant="outline">Arabic Language (-1)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
