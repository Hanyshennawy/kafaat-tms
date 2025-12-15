import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  FileText, User, GraduationCap, Briefcase, Upload,
  CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Send,
  Shield, Award
} from "lucide-react";
import { toast } from "sonner";

interface FormStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function LicenseApplicationForm() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: FormStep[] = [
    { id: 1, title: "Personal Information", description: "Basic personal details", icon: <User className="h-5 w-5" /> },
    { id: 2, title: "Educational Qualifications", description: "Academic credentials", icon: <GraduationCap className="h-5 w-5" /> },
    { id: 3, title: "Professional Experience", description: "Teaching experience", icon: <Briefcase className="h-5 w-5" /> },
    { id: 4, title: "Documents Upload", description: "Required documents", icon: <Upload className="h-5 w-5" /> },
    { id: 5, title: "Review & Submit", description: "Verify and submit", icon: <Send className="h-5 w-5" /> },
  ];

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    emiratesId: "",
    nationality: "",
    dateOfBirth: "",
    gender: "",
    
    // Educational Qualifications
    highestDegree: "",
    fieldOfStudy: "",
    university: "",
    graduationYear: "",
    teachingCertification: "",
    
    // Professional Experience
    totalExperience: "",
    currentPosition: "",
    currentSchool: "",
    subjectSpecialization: "",
    gradeLevel: "",
    previousExperience: "",
    
    // Documents
    emiratesIdCopy: null as File | null,
    degreeCertificate: null as File | null,
    teachingCertificate: null as File | null,
    experienceLetter: null as File | null,
    passportCopy: null as File | null,
    
    // Agreements
    termsAccepted: false,
    dataConsent: false,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    updateFormData(field, file);
  };

  const calculateProgress = () => {
    return Math.round(((currentStep + 1) / steps.length) * 100);
  };

  const validateCurrentStep = (): boolean => {
    // Basic validation for demo
    switch (currentStep) {
      case 0:
        return !!(formData.firstName && formData.lastName && formData.email && formData.emiratesId);
      case 1:
        return !!(formData.highestDegree && formData.university);
      case 2:
        return !!(formData.totalExperience && formData.subjectSpecialization);
      case 3:
        return true; // Documents optional for demo
      case 4:
        return formData.termsAccepted && formData.dataConsent;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const handleSubmit = async () => {
    if (!formData.termsAccepted || !formData.dataConsent) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    toast.success("License application submitted successfully!");
    navigate("/licensing/my-licenses");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Button variant="ghost" className="mb-2 -ml-2" onClick={() => navigate("/licensing/my-licenses")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Licenses
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileText className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Apply for Teaching License</h1>
            <p className="text-muted-foreground">Complete the form to apply for your UAE teaching license</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Application Progress</span>
            <span className="text-sm text-muted-foreground">{calculateProgress()}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-6">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => idx <= currentStep && setCurrentStep(idx)}
                disabled={idx > currentStep}
                className={`flex flex-col items-center ${
                  idx <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  idx < currentStep
                    ? "bg-green-500 text-white"
                    : idx === currentStep
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {idx < currentStep ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
                </div>
                <span className={`text-xs mt-2 text-center max-w-[80px] ${
                  idx === currentStep ? "font-medium" : "text-muted-foreground"
                }`}>
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[currentStep].icon}
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Personal Information */}
          {currentStep === 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="+971 XX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Emirates ID *</Label>
                <Input
                  placeholder="784-XXXX-XXXXXXX-X"
                  value={formData.emiratesId}
                  onChange={(e) => updateFormData("emiratesId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Select value={formData.nationality} onValueChange={(v) => updateFormData("nationality", v)}>
                  <SelectTrigger><SelectValue placeholder="Select nationality" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uae">UAE</SelectItem>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="pakistan">Pakistan</SelectItem>
                    <SelectItem value="egypt">Egypt</SelectItem>
                    <SelectItem value="jordan">Jordan</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="usa">United States</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => updateFormData("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Educational Qualifications */}
          {currentStep === 1 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Highest Degree *</Label>
                <Select value={formData.highestDegree} onValueChange={(v) => updateFormData("highestDegree", v)}>
                  <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                    <SelectItem value="masters">Master's Degree</SelectItem>
                    <SelectItem value="doctorate">Doctorate (PhD)</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Field of Study</Label>
                <Input
                  placeholder="e.g., Education, Mathematics"
                  value={formData.fieldOfStudy}
                  onChange={(e) => updateFormData("fieldOfStudy", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>University/Institution *</Label>
                <Input
                  placeholder="Enter university name"
                  value={formData.university}
                  onChange={(e) => updateFormData("university", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Graduation Year</Label>
                <Input
                  placeholder="YYYY"
                  value={formData.graduationYear}
                  onChange={(e) => updateFormData("graduationYear", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Teaching Certification</Label>
                <Select value={formData.teachingCertification} onValueChange={(v) => updateFormData("teachingCertification", v)}>
                  <SelectTrigger><SelectValue placeholder="Select certification" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pgce">PGCE</SelectItem>
                    <SelectItem value="bed">B.Ed</SelectItem>
                    <SelectItem value="med">M.Ed</SelectItem>
                    <SelectItem value="tefl">TEFL</SelectItem>
                    <SelectItem value="celta">CELTA</SelectItem>
                    <SelectItem value="none">No Teaching Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Professional Experience */}
          {currentStep === 2 && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Total Teaching Experience *</Label>
                <Select value={formData.totalExperience} onValueChange={(v) => updateFormData("totalExperience", v)}>
                  <SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-2">0-2 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="11-15">11-15 years</SelectItem>
                    <SelectItem value="15+">15+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject Specialization *</Label>
                <Select value={formData.subjectSpecialization} onValueChange={(v) => updateFormData("subjectSpecialization", v)}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arabic">Arabic</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="islamic">Islamic Studies</SelectItem>
                    <SelectItem value="social">Social Studies</SelectItem>
                    <SelectItem value="physical_education">Physical Education</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Current Position</Label>
                <Input
                  placeholder="e.g., Senior Teacher"
                  value={formData.currentPosition}
                  onChange={(e) => updateFormData("currentPosition", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Current School/Institution</Label>
                <Input
                  placeholder="Enter school name"
                  value={formData.currentSchool}
                  onChange={(e) => updateFormData("currentSchool", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Grade Level</Label>
                <Select value={formData.gradeLevel} onValueChange={(v) => updateFormData("gradeLevel", v)}>
                  <SelectTrigger><SelectValue placeholder="Select grade level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">KG / Early Years</SelectItem>
                    <SelectItem value="elementary">Elementary (1-5)</SelectItem>
                    <SelectItem value="middle">Middle School (6-8)</SelectItem>
                    <SelectItem value="high">High School (9-12)</SelectItem>
                    <SelectItem value="all">All Grades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Previous Experience Summary</Label>
                <Textarea
                  placeholder="Briefly describe your teaching experience..."
                  value={formData.previousExperience}
                  onChange={(e) => updateFormData("previousExperience", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 4: Documents Upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Document Requirements</p>
                  <p className="text-sm text-amber-700">
                    Please upload clear, legible copies of all documents. Accepted formats: PDF, JPG, PNG (max 5MB each).
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {[
                  { field: "emiratesIdCopy", label: "Emirates ID Copy", required: true },
                  { field: "degreeCertificate", label: "Degree Certificate (Attested)", required: true },
                  { field: "teachingCertificate", label: "Teaching Certificate", required: false },
                  { field: "experienceLetter", label: "Experience Letter", required: false },
                  { field: "passportCopy", label: "Passport Copy", required: true },
                ].map(({ field, label, required }) => (
                  <div key={field} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="flex items-center gap-1">
                          {label}
                          {required && <span className="text-red-500">*</span>}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(formData as any)[field] 
                            ? `Selected: ${(formData as any)[field].name}` 
                            : "No file selected"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(formData as any)[field] && (
                          <Badge variant="secondary" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Uploaded
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <label className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(field, e)}
                            />
                          </label>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Ready to Submit</p>
                  <p className="text-sm text-green-700">
                    Please review your application details before submitting.
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Emirates ID:</strong> {formData.emiratesId}</p>
                    <p><strong>Nationality:</strong> {formData.nationality}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Degree:</strong> {formData.highestDegree}</p>
                    <p><strong>Field:</strong> {formData.fieldOfStudy}</p>
                    <p><strong>University:</strong> {formData.university}</p>
                    <p><strong>Certification:</strong> {formData.teachingCertification}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Experience:</strong> {formData.totalExperience} years</p>
                    <p><strong>Subject:</strong> {formData.subjectSpecialization}</p>
                    <p><strong>Grade Level:</strong> {formData.gradeLevel}</p>
                    <p><strong>Current School:</strong> {formData.currentSchool}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {[
                      { field: "emiratesIdCopy", label: "Emirates ID" },
                      { field: "degreeCertificate", label: "Degree Certificate" },
                      { field: "passportCopy", label: "Passport" },
                    ].map(({ field, label }) => (
                      <p key={field} className="flex items-center gap-2">
                        {(formData as any)[field] ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        {label}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => updateFormData("termsAccepted", checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="terms" className="cursor-pointer">
                      I accept the Terms and Conditions *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      I confirm that all information provided is accurate and complete.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={formData.dataConsent}
                    onCheckedChange={(checked) => updateFormData("dataConsent", checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consent" className="cursor-pointer">
                      I consent to data processing *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      I agree to the processing of my personal data for license application purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !formData.termsAccepted || !formData.dataConsent}
            className="gap-2"
          >
            <Award className="h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        )}
      </div>
    </div>
  );
}
