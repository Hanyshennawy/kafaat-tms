import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  GraduationCap,
  ClipboardCheck,
  Award,
  CheckCircle,
  Circle,
  ArrowLeft,
  ArrowRight,
  Upload,
  BookOpen,
  Timer,
  AlertCircle,
  Play,
  Lock,
  Unlock,
  FileCheck,
  Building2,
  User,
  Calendar,
  Clock,
  Target,
  Loader2
} from "lucide-react";

// Journey Steps (static - defines the process flow)
const JOURNEY_STEPS = [
  { id: 1, name: "Eligibility Check", icon: FileCheck, description: "Verify your qualifications" },
  { id: 2, name: "Required Courses", icon: BookOpen, description: "Complete mandatory training" },
  { id: 3, name: "Theory Exam", icon: ClipboardCheck, description: "Pass the licensing exam" },
  { id: 4, name: "Document Verification", icon: FileText, description: "Submit required documents" },
  { id: 5, name: "License Issuance", icon: Award, description: "Receive your license" },
];

export default function NewLicenseJourney() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLicenseType, setSelectedLicenseType] = useState<number | null>(null);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    emiratesId: "",
    email: "",
    phone: "",
    currentPosition: "",
    yearsExperience: "0",
    highestQualification: "bachelors",
    institution: "",
  });

  // Fetch license types from database
  const { data: licenseTypes = [], isLoading: typesLoading } = trpc.teachersLicensing.getAllLicenseTypes.useQuery();
  
  // Fetch required courses for selected license type
  const { data: requiredCourses = [], isLoading: coursesLoading } = trpc.teachersLicensing.getCoursesForLicense.useQuery(
    { licenseTypeId: selectedLicenseType! },
    { enabled: !!selectedLicenseType }
  );
  
  // Eligibility check mutation
  const checkEligibilityMutation = trpc.teachersLicensing.checkEligibility.useMutation({
    onSuccess: (result) => {
      setIsEligible(result.eligible);
      setIsChecking(false);
      if (result.eligible) {
        toast.success("Congratulations! You are eligible for this license.");
      } else {
        toast.error("You do not meet all requirements. " + (result.missingRequirements?.join(", ") || ""));
      }
    },
    onError: (error) => {
      setIsChecking(false);
      toast.error("Failed to check eligibility: " + error.message);
    }
  });

  // Compute user progress from courses data
  const userProgress = {
    coursesCompleted: requiredCourses.filter((c: any) => c.status === "completed").length,
    totalCourses: requiredCourses.length || 5,
    examPassed: false, // Would come from exam results
    examAttempts: 0,
    documentsSubmitted: false,
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "locked";
  };

  const handleEligibilityCheck = async () => {
    if (!selectedLicenseType) {
      toast.error("Please select a license type first");
      return;
    }
    setIsChecking(true);
    checkEligibilityMutation.mutate({
      licenseTypeId: selectedLicenseType,
      qualification: formData.highestQualification,
      yearsExperience: parseInt(formData.yearsExperience) || 0,
    });
  };

  const handleContinueToNext = () => {
    if (currentStep < JOURNEY_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setLocation("/licensing");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderEligibilityStep();
      case 2:
        return renderCoursesStep();
      case 3:
        return renderExamStep();
      case 4:
        return renderDocumentsStep();
      case 5:
        return renderIssuanceStep();
      default:
        return null;
    }
  };
  
  // Get selected license type object
  const selectedLicense = licenseTypes.find((l: any) => l.id === selectedLicenseType);

  const renderEligibilityStep = () => (
    <div className="space-y-6">
      {/* License Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select License Type</CardTitle>
          <CardDescription>Choose the type of license you want to apply for</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {typesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading license types...</span>
            </div>
          ) : licenseTypes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No license types available</p>
          ) : (
            licenseTypes.map((license: any) => (
              <div
                key={license.id}
                onClick={() => setSelectedLicenseType(license.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedLicenseType === license.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{license.name}</h4>
                    {selectedLicenseType === license.id && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{license.description || 'Professional teaching license'}</p>
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Training Required
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      2-3 Hour Exam
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Fee Applies
                    </span>
                  </div>
                </div>
              </div>
              {selectedLicenseType === license.id && license.requirements && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Requirements:</p>
                  <p className="text-sm text-muted-foreground">{license.requirements}</p>
                </div>
              )}
            </div>
          ))
          )}
        </CardContent>
      </Card>

      {/* Applicant Information */}
      {selectedLicenseType && (
        <Card>
          <CardHeader>
            <CardTitle>Applicant Information</CardTitle>
            <CardDescription>Verify your personal and professional details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={formData.fullName} 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emiratesId">Emirates ID</Label>
                <Input 
                  id="emiratesId" 
                  value={formData.emiratesId}
                  onChange={(e) => setFormData({...formData, emiratesId: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentPosition">Current Position</Label>
                <Input 
                  id="currentPosition" 
                  value={formData.currentPosition}
                  onChange={(e) => setFormData({...formData, currentPosition: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input 
                  id="yearsExperience" 
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Highest Qualification</Label>
                <Select 
                  value={formData.highestQualification}
                  onValueChange={(value) => setFormData({...formData, highestQualification: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                    <SelectItem value="masters">Master's Degree</SelectItem>
                    <SelectItem value="doctorate">Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Current Institution</Label>
                <Input 
                  id="institution" 
                  value={formData.institution}
                  onChange={(e) => setFormData({...formData, institution: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleEligibilityCheck} 
              disabled={isChecking || isEligible === true}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Eligibility...
                </>
              ) : isEligible ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Eligible - Continue to Next Step
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Check Eligibility
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {isEligible && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-800">You're Eligible!</h4>
                <p className="text-sm text-green-700 mt-1">
                  Based on your qualifications and experience, you meet the requirements for the{" "}
                  {selectedLicense?.name || 'selected license'}.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleContinueToNext} className="w-full" size="lg">
              Continue to Required Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );

  const renderCoursesStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Required Training Courses</CardTitle>
              <CardDescription>Complete all mandatory courses before taking the exam</CardDescription>
            </div>
            <Badge variant="outline" className="text-base">
              {userProgress.coursesCompleted}/{userProgress.totalCourses} Completed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={userProgress.totalCourses > 0 ? (userProgress.coursesCompleted / userProgress.totalCourses) * 100 : 0} 
            className="h-3 mb-6"
          />

          {coursesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading courses...</span>
            </div>
          ) : requiredCourses.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No courses available for this license type</p>
          ) : (
          <div className="space-y-4">
            {requiredCourses.map((course: any, index: number) => (
              <div
                key={course.id}
                className={`p-4 border rounded-lg ${
                  course.status === "completed" 
                    ? "bg-green-50 border-green-200" 
                    : course.status === "in_progress"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      course.status === "completed" 
                        ? "bg-green-100" 
                        : course.status === "in_progress"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}>
                      {course.status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : course.status === "in_progress" ? (
                        <Play className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Course {index + 1}</span>
                        {course.status === "completed" && course.score && (
                          <Badge variant="secondary" className="text-green-600 bg-green-100">
                            Score: {course.score}%
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium">{course.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        <Timer className="inline h-3 w-3 mr-1" />
                        {course.duration}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {course.status === "completed" ? (
                      <Badge className="bg-green-100 text-green-700">Completed</Badge>
                    ) : course.status === "in_progress" ? (
                      <div className="space-y-2">
                        <Badge className="bg-blue-100 text-blue-700">{course.progress || 0}% Progress</Badge>
                        <Button size="sm" className="block w-full">
                          <Play className="h-3 w-3 mr-1" />
                          Continue
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="secondary">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>
                {course.status === "in_progress" && (
                  <div className="mt-3">
                    <Progress value={course.progress || 0} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <Separator />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>You must complete all courses with a minimum score of 70% to proceed to the exam.</span>
          </div>
          {userProgress.coursesCompleted === userProgress.totalCourses && (
            <Button onClick={handleContinueToNext} className="w-full">
              All Courses Completed - Proceed to Exam
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );

  const renderExamStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Licensing Examination</CardTitle>
          <CardDescription>Pass the theory exam to proceed with your license application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exam Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Timer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">2 Hours</p>
              <p className="text-sm text-blue-600">Duration</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-700">70%</p>
              <p className="text-sm text-purple-600">Passing Score</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <ClipboardCheck className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-700">50</p>
              <p className="text-sm text-orange-600">Questions</p>
            </div>
          </div>

          <Separator />

          {/* Exam Status */}
          {!userProgress.examPassed ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Exam Guidelines</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Multiple choice and scenario-based questions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Based on UAE education regulations and best practices
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    You can retake the exam after 7 days if you fail
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Maximum 3 attempts allowed
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Attempts Used</p>
                    <p className="text-sm text-yellow-700">{userProgress.examAttempts} of 3 attempts</p>
                  </div>
                </div>
                <Badge variant="outline">{3 - userProgress.examAttempts} remaining</Badge>
              </div>

              <Button 
                onClick={() => setLocation("/licensing/exam")} 
                className="w-full"
                size="lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Examination
              </Button>
            </div>
          ) : (
            <div className="p-6 bg-green-50 rounded-lg text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800">Examination Passed!</h3>
              <p className="text-green-700 mt-2">
                Congratulations! You scored 85% on your licensing exam.
              </p>
              <Button onClick={handleContinueToNext} className="mt-4">
                Continue to Document Verification
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Verification</CardTitle>
          <CardDescription>Upload required documents for verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Emirates ID (Front & Back)", required: true, uploaded: true },
            { name: "Passport Copy", required: true, uploaded: true },
            { name: "Educational Certificates", required: true, uploaded: false },
            { name: "Experience Letters", required: true, uploaded: false },
            { name: "Good Conduct Certificate", required: true, uploaded: false },
            { name: "Medical Fitness Certificate", required: false, uploaded: false },
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {doc.uploaded ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.required ? "Required" : "Optional"}
                  </p>
                </div>
              </div>
              {doc.uploaded ? (
                <Badge className="bg-green-100 text-green-700">Uploaded</Badge>
              ) : (
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={handleContinueToNext} className="w-full" disabled={true}>
            <FileText className="mr-2 h-4 w-4" />
            Submit for Verification (2/5 uploaded)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const renderIssuanceStep = () => (
    <div className="space-y-6">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto p-4 bg-green-100 rounded-full w-fit">
            <Award className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">License Issuance</CardTitle>
          <CardDescription>Your application is being processed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-4">Application Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-700">Application ID</span>
                <span className="font-mono font-bold">LIC-2024-00847</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700">License Type</span>
                <span className="font-semibold">Teaching License</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700">Status</span>
                <Badge className="bg-yellow-100 text-yellow-700">Under Review</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-700">Expected Completion</span>
                <span className="font-semibold">5-7 business days</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="font-medium">Eligibility</p>
              <p className="text-sm text-green-600">Verified</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="font-medium">Courses</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="font-medium">Exam</p>
              <p className="text-sm text-green-600">Passed</p>
            </div>
          </div>

          <Separator />

          <div className="text-left">
            <h4 className="font-semibold mb-3">What happens next?</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                Your documents will be verified by the licensing authority
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                You will receive an email notification when your license is ready
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                Download your digital license from your profile
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">4.</span>
                Physical license card will be mailed to your registered address
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => setLocation("/licensing")}>
            Back to Dashboard
          </Button>
          <Button className="flex-1" onClick={() => setLocation("/licensing/my-licenses")}>
            View My Licenses
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleGoBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New License Application</h1>
          <p className="text-muted-foreground">Complete all steps to receive your professional license</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {JOURNEY_STEPS.map((step, index) => {
              const status = getStepStatus(step.id);
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        status === "completed"
                          ? "bg-green-500 text-white"
                          : status === "current"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {status === "completed" ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <p className={`text-xs mt-2 text-center max-w-[80px] ${
                      status === "current" ? "font-semibold text-primary" : "text-muted-foreground"
                    }`}>
                      {step.name}
                    </p>
                  </div>
                  {index < JOURNEY_STEPS.length - 1 && (
                    <div
                      className={`h-1 w-16 mx-2 ${
                        status === "completed" ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      {currentStep > 1 && currentStep < 5 && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous Step
          </Button>
          {(currentStep === 2 && userProgress.coursesCompleted === userProgress.totalCourses) ||
           (currentStep === 3 && userProgress.examPassed) ||
           (currentStep === 4) ? (
            <Button onClick={handleContinueToNext}>
              Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
