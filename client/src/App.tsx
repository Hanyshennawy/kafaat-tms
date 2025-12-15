import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import AvailableExams from "@/pages/exams/AvailableExams";
import TakeExam from "@/pages/exams/TakeExam";
import ExamResults from "@/pages/exams/ExamResults";
import ExamReview from "./pages/exams/ExamReview";
import QuestionsManagement from "./pages/admin/QuestionsManagement";
import QuestionForm from "./pages/admin/QuestionForm";
import QMSAnalytics from "./pages/admin/QMSAnalytics";
import TopPerformers from "./pages/TopPerformers";
import PerformanceTrends from "./pages/PerformanceTrends";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import { OnboardingWizard } from "./components/OnboardingWizard";

// Core pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

// Module 1: Career Progression
import CareerPaths from "./pages/career/CareerPaths";
import CareerPathDetails from "./pages/career/CareerPathDetails";
import Skills from "./pages/career/Skills";
import EmployeeSkills from "./pages/career/EmployeeSkills";
import CareerRecommendations from "./pages/career/CareerRecommendations";

// Module 2: Succession Planning
import SuccessionPlans from "./pages/succession/SuccessionPlans";
import SuccessionPlanDetails from "./pages/succession/SuccessionPlanDetails";
import TalentPools from "./pages/succession/TalentPools";
import LeadershipAssessments from "./pages/succession/LeadershipAssessments";

// Module 3: Workforce Planning
import WorkforceScenarios from "./pages/workforce/WorkforceScenarios";
import WorkforceScenarioDetails from "./pages/workforce/WorkforceScenarioDetails";
import ResourceAllocations from "./pages/workforce/ResourceAllocations";
import WorkforceAlerts from "./pages/workforce/WorkforceAlerts";

// Module 4: Employee Engagement
import Surveys from "./pages/engagement/Surveys";
import SurveyDetails from "./pages/engagement/SurveyDetails";
import TakeSurvey from "./pages/engagement/TakeSurvey";
import EngagementDashboard from "./pages/engagement/EngagementDashboard";
import EngagementActivities from "./pages/engagement/EngagementActivities";

// Module 5: Recruitment
import JobRequisitions from "./pages/recruitment/JobRequisitions";
import RequisitionDetails from "./pages/recruitment/RequisitionDetails";
import Candidates from "./pages/recruitment/Candidates";
import CandidateDetails from "./pages/recruitment/CandidateDetails";
import Interviews from "./pages/recruitment/Interviews";
import RecruitmentDashboard from "./pages/recruitment/RecruitmentDashboard";
import AIInterviewDashboard from "./pages/recruitment/AIInterviewDashboard";
import AIInterviewSession from "./pages/recruitment/AIInterviewSession";
import AIInterviewReport from "./pages/recruitment/AIInterviewReport";
import AIInterviewTemplates from "./pages/recruitment/AIInterviewTemplates";

// Module 6: Performance Management
import PerformanceCycles from "./pages/performance/PerformanceCycles";
import Goals from "./pages/performance/Goals";
import SelfAppraisal from "./pages/performance/SelfAppraisal";
import ManagerReview from "./pages/performance/ManagerReview";
import Feedback360 from "./pages/performance/Feedback360";
import PerformanceDashboard from "./pages/performance/PerformanceDashboard";

// Module 7: Teachers Licensing (UAE traffic license style)
import LicensingDashboard from "./pages/licensing/LicensingDashboard";
import NewLicenseJourney from "./pages/licensing/NewLicenseJourney";
import LicenseRenewal from "./pages/licensing/LicenseRenewal";
import LicenseExam from "./pages/licensing/LicenseExam";
import MyLicenses from "./pages/licensing/MyLicenses";
import CpdRecords from "./pages/licensing/CpdRecords";
import LicenseVerification from "./pages/licensing/LicenseVerification";

// Module 8: Educator's Competency Assessments
import CompetencyFrameworks from "./pages/competency/CompetencyFrameworks";
import CompetencyStandards from "./pages/competency/CompetencyStandards";
import MyCompetencies from "./pages/competency/MyCompetencies";
import CompetencyAssessments from "./pages/competency/CompetencyAssessments";
import AssessmentEvidence from "./pages/competency/AssessmentEvidence";
import DevelopmentPlans from "./pages/competency/DevelopmentPlans";

// Module 9: Staff Placement & Mobility
import PlacementDashboard from "./pages/placement/PlacementDashboard";
import PlacementRequests from "./pages/placement/PlacementRequests";
import TransferHistory from "./pages/placement/TransferHistory";
import StaffDirectory from "./pages/placement/StaffDirectory";
import PlacementAnalytics from "./pages/placement/PlacementAnalytics";

// Module 10: Assessments (Competency + Psychometric)
import AssessmentsDashboard from "./pages/assessments/AssessmentsDashboard";
import AssessmentSelector from "./pages/assessments/AssessmentSelector";
import PsychometricDashboard from "./pages/psychometric/PsychometricDashboard";
import TakeAssessment from "./pages/psychometric/TakeAssessment";
import AssessmentResults from "./pages/psychometric/AssessmentResults";
import PersonalityProfile from "./pages/psychometric/PersonalityProfile";
import CognitiveAbility from "./pages/psychometric/CognitiveAbility";
import AssessmentAnalytics from "./pages/psychometric/AssessmentAnalytics";
import CompetencyAssessment from "./pages/psychometric/CompetencyAssessment";

// Cross-cutting
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import UserProfile from "./pages/UserProfile";
import UsersManagement from "./pages/UsersManagement";
import OrganizationSettings from "./pages/OrganizationSettings";
import Settings from "./pages/Settings";

// Gamification & Analytics
import GamificationDashboard from "./pages/GamificationDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import IntegrationsSettings from "./pages/admin/IntegrationsSettings";
import RBACManagement from "./pages/admin/RBACManagement";

// Marketplace & SaaS
import MarketplaceCatalog from "./pages/MarketplaceCatalog";
import Signup from "./pages/Signup";
import Pricing from "./pages/Pricing";

// Catalog
import JobDescriptions from "./pages/catalog/JobDescriptions";
import CompetencyFrameworkCatalog from "./pages/catalog/CompetencyFrameworkCatalog";
import LicenseTypesCatalog from "./pages/catalog/LicenseTypesCatalog";
import TrainingCatalog from "./pages/catalog/TrainingCatalog";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/signup" component={Signup} />
      <Route path="/pricing" component={Pricing} />
      
      {/* Protected routes with dashboard layout */}
      <Route path="/dashboard">
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      
      {/* Teacher Licensing (UAE traffic license style) */}
      <Route path="/licensing">
        <DashboardLayout>
          <LicensingDashboard />
        </DashboardLayout>
      </Route>
      <Route path="/licensing/new-license">
        <DashboardLayout>
          <NewLicenseJourney />
        </DashboardLayout>
      </Route>
      <Route path="/licensing/renewal">
        <DashboardLayout>
          <LicenseRenewal />
        </DashboardLayout>
      </Route>
      <Route path="/licensing/exam">
        <DashboardLayout>
          <LicenseExam />
        </DashboardLayout>
      </Route>
      <Route path="/licensing/my-licenses">
        <DashboardLayout>
          <MyLicenses />
        </DashboardLayout>
      </Route>
      <Route path="/licensing/cpd">
        <DashboardLayout>
          <CpdRecords />
        </DashboardLayout>
      </Route>
      <Route path="/licensing/verify">
        <DashboardLayout>
          <LicenseVerification />
        </DashboardLayout>
      </Route>
      
      {/* Career Progression */}
      <Route path="/career/paths">
        <DashboardLayout>
          <CareerPaths />
        </DashboardLayout>
      </Route>
      <Route path="/career/paths/:id">
        <DashboardLayout>
          <CareerPathDetails />
        </DashboardLayout>
      </Route>
      <Route path="/career/skills">
        <DashboardLayout>
          <Skills />
        </DashboardLayout>
      </Route>
      <Route path="/career/employee-skills">
        <DashboardLayout>
          <EmployeeSkills />
        </DashboardLayout>
      </Route>
      <Route path="/career/recommendations">
        <DashboardLayout>
          <CareerRecommendations />
        </DashboardLayout>
      </Route>
      
      {/* Succession Planning */}
      <Route path="/succession/plans">
        <DashboardLayout>
          <SuccessionPlans />
        </DashboardLayout>
      </Route>
      <Route path="/succession/plans/:id">
        <DashboardLayout>
          <SuccessionPlanDetails />
        </DashboardLayout>
      </Route>
      <Route path="/succession/talent-pools">
        <DashboardLayout>
          <TalentPools />
        </DashboardLayout>
      </Route>
      <Route path="/succession/assessments">
        <DashboardLayout>
          <LeadershipAssessments />
        </DashboardLayout>
      </Route>
      
      {/* Workforce Planning */}
      <Route path="/workforce/scenarios">
        <DashboardLayout>
          <WorkforceScenarios />
        </DashboardLayout>
      </Route>
      <Route path="/workforce/scenarios/:id">
        <DashboardLayout>
          <WorkforceScenarioDetails />
        </DashboardLayout>
      </Route>
      <Route path="/workforce/allocations">
        <DashboardLayout>
          <ResourceAllocations />
        </DashboardLayout>
      </Route>
      <Route path="/workforce/alerts">
        <DashboardLayout>
          <WorkforceAlerts />
        </DashboardLayout>
      </Route>
      
      {/* Employee Engagement */}
      <Route path="/engagement/surveys">
        <DashboardLayout>
          <Surveys />
        </DashboardLayout>
      </Route>
      <Route path="/engagement/surveys/:id">
        <DashboardLayout>
          <SurveyDetails />
        </DashboardLayout>
      </Route>
      <Route path="/engagement/surveys/:id/take">
        <DashboardLayout>
          <TakeSurvey />
        </DashboardLayout>
      </Route>
      <Route path="/engagement/dashboard">
        <DashboardLayout>
          <EngagementDashboard />
        </DashboardLayout>
      </Route>
      <Route path="/engagement/activities">
        <DashboardLayout>
          <EngagementActivities />
        </DashboardLayout>
      </Route>
      
      {/* Recruitment */}
      <Route path="/recruitment/requisitions">
        <DashboardLayout>
          <JobRequisitions />
        </DashboardLayout>
      </Route>
      <Route path="/recruitment/requisitions/:id">
        <DashboardLayout>
          <RequisitionDetails />
        </DashboardLayout>
      </Route>
      <Route path="/recruitment/candidates">
        <DashboardLayout>
          <Candidates />
        </DashboardLayout>
      </Route>
      <Route path="/recruitment/candidates/:id">
        <DashboardLayout>
          <CandidateDetails />
        </DashboardLayout>
      </Route>
      <Route path="/recruitment/interviews">
        <DashboardLayout>
          <Interviews />
        </DashboardLayout>
      </Route>
      <Route path="/recruitment/dashboard">
        <DashboardLayout>
          <RecruitmentDashboard />
        </DashboardLayout>
      </Route>
      
      {/* AI Interview Simulation */}
      <Route path="/recruitment/ai-interview">
        <DashboardLayout>
          <AIInterviewDashboard />
        </DashboardLayout>
      </Route>
      <Route path="/recruitment/ai-interview/templates">
        <DashboardLayout>
          <AIInterviewTemplates />
        </DashboardLayout>
      </Route>
      <Route path="/recruitment/ai-interview/session/:id">
        <DashboardLayout>
          <AIInterviewSession />
        </DashboardLayout>
      </Route>
      <Route path="/recruitment/ai-interview/report/:id">
        <DashboardLayout>
          <AIInterviewReport />
        </DashboardLayout>
      </Route>
      
      {/* Performance Management */}
      <Route path="/performance/cycles">
        <DashboardLayout>
          <PerformanceCycles />
        </DashboardLayout>
      </Route>
      <Route path="/performance/goals">
        <DashboardLayout>
          <Goals />
        </DashboardLayout>
      </Route>
      <Route path="/performance/self-appraisal">
        <DashboardLayout>
          <SelfAppraisal />
        </DashboardLayout>
      </Route>
      <Route path="/performance/manager-review">
        <DashboardLayout>
          <ManagerReview />
        </DashboardLayout>
      </Route>
      <Route path="/performance/360-feedback">
        <DashboardLayout>
          <Feedback360 />
        </DashboardLayout>
      </Route>
      <Route path="/performance/dashboard">
        <DashboardLayout>
          <PerformanceDashboard />
        </DashboardLayout>
      </Route>
      

      
      {/* Cross-cutting */}
      <Route path="/notifications">
        <DashboardLayout>
          <Notifications />
        </DashboardLayout>
      </Route>
      <Route path="/reports">
        <DashboardLayout>
          <Reports />
        </DashboardLayout>
      </Route>
      <Route path="/profile">
        <DashboardLayout>
          <UserProfile />
        </DashboardLayout>
      </Route>
      <Route path="/users">
        <DashboardLayout>
          <UsersManagement />
        </DashboardLayout>
      </Route>
      <Route path="/organization">
        <DashboardLayout>
          <OrganizationSettings />
        </DashboardLayout>
      </Route>
      <Route path="/organization-settings">
        <DashboardLayout>
          <OrganizationSettings />
        </DashboardLayout>
      </Route>
      <Route path="/settings">
        <Settings />
      </Route>
            <Route path={"/exams"} component={AvailableExams} />
      <Route path="/exams/take/:id" component={TakeExam} />
      <Route path="/exams/results/:attemptId" component={ExamResults} />
      <Route path="/exams/review/:attemptId" component={ExamReview} />
      <Route path="/admin/questions" component={QuestionsManagement} />
      <Route path="/admin/questions/new" component={QuestionForm} />
      <Route path="/admin/questions/edit/:id" component={QuestionForm} />
      <Route path="/admin/qms-analytics" component={QMSAnalytics} />
      <Route path="/admin/rbac">
        <DashboardLayout>
          <RBACManagement />
        </DashboardLayout>
      </Route>
      <Route path="/top-performers" component={TopPerformers} />
      <Route path="/performance-trends" component={PerformanceTrends} />
      
      {/* Module 8: Competency Assessments */}
      <Route path="/competency/frameworks" component={CompetencyFrameworks} />
      <Route path="/competency/standards" component={CompetencyStandards} />
      <Route path="/competency/my-competencies" component={MyCompetencies} />
      <Route path="/competency/assessments" component={CompetencyAssessments} />
      <Route path="/competency/evidence" component={AssessmentEvidence} />
      <Route path="/competency/development-plans" component={DevelopmentPlans} />
      
      {/* Module 9: Staff Placement & Mobility */}
      <Route path="/placement">
        <DashboardLayout>
          <PlacementDashboard />
        </DashboardLayout>
      </Route>
      <Route path="/placement/requests">
        <DashboardLayout>
          <PlacementRequests />
        </DashboardLayout>
      </Route>
      <Route path="/placement/history">
        <DashboardLayout>
          <TransferHistory />
        </DashboardLayout>
      </Route>
      <Route path="/placement/directory">
        <DashboardLayout>
          <StaffDirectory />
        </DashboardLayout>
      </Route>
      <Route path="/placement/analytics">
        <DashboardLayout>
          <PlacementAnalytics />
        </DashboardLayout>
      </Route>
      
      {/* Module 10: Assessments (Unified Dashboard) */}
      <Route path="/assessments">
        <DashboardLayout>
          <AssessmentsDashboard />
        </DashboardLayout>
      </Route>
      <Route path="/assessments/take">
        <DashboardLayout>
          <AssessmentSelector />
        </DashboardLayout>
      </Route>
      <Route path="/assessments/competency">
        <DashboardLayout>
          <CompetencyAssessment />
        </DashboardLayout>
      </Route>
      <Route path="/assessments/psychometric">
        <DashboardLayout>
          <PsychometricDashboard />
        </DashboardLayout>
      </Route>
      <Route path="/assessments/psychometric/take">
        <DashboardLayout>
          <TakeAssessment />
        </DashboardLayout>
      </Route>
      <Route path="/assessments/results">
        <DashboardLayout>
          <AssessmentResults />
        </DashboardLayout>
      </Route>
      <Route path="/assessments/personality">
        <DashboardLayout>
          <PersonalityProfile />
        </DashboardLayout>
      </Route>
      <Route path="/assessments/cognitive">
        <DashboardLayout>
          <CognitiveAbility />
        </DashboardLayout>
      </Route>
      <Route path="/assessments/analytics">
        <DashboardLayout>
          <AssessmentAnalytics />
        </DashboardLayout>
      </Route>
      
      {/* Legacy Psychometric routes (redirect support) */}
      <Route path="/psychometric">
        <DashboardLayout>
          <PsychometricDashboard />
        </DashboardLayout>
      </Route>
      <Route path="/psychometric/take-assessment">
        <DashboardLayout>
          <TakeAssessment />
        </DashboardLayout>
      </Route>
      <Route path="/psychometric/results">
        <DashboardLayout>
          <AssessmentResults />
        </DashboardLayout>
      </Route>
      <Route path="/psychometric/personality">
        <DashboardLayout>
          <PersonalityProfile />
        </DashboardLayout>
      </Route>
      <Route path="/psychometric/cognitive">
        <DashboardLayout>
          <CognitiveAbility />
        </DashboardLayout>
      </Route>
      <Route path="/psychometric/analytics">
        <DashboardLayout>
          <AssessmentAnalytics />
        </DashboardLayout>
      </Route>
      <Route path="/psychometric/competency">
        <DashboardLayout>
          <CompetencyAssessment />
        </DashboardLayout>
      </Route>
      
      {/* Gamification & Analytics */}
      <Route path="/gamification">
        <DashboardLayout>
          <GamificationDashboard />
        </DashboardLayout>
      </Route>
      <Route path="/analytics">
        <DashboardLayout>
          <AnalyticsDashboard />
        </DashboardLayout>
      </Route>
      <Route path="/admin/integrations">
        <DashboardLayout>
          <IntegrationsSettings />
        </DashboardLayout>
      </Route>
      
      {/* Catalog */}
      <Route path="/catalog/job-descriptions">
        <DashboardLayout>
          <JobDescriptions />
        </DashboardLayout>
      </Route>
      <Route path="/catalog/competency-framework">
        <DashboardLayout>
          <CompetencyFrameworkCatalog />
        </DashboardLayout>
      </Route>
      <Route path="/catalog/license-types">
        <DashboardLayout>
          <LicenseTypesCatalog />
        </DashboardLayout>
      </Route>
      <Route path="/catalog/training">
        <DashboardLayout>
          <TrainingCatalog />
        </DashboardLayout>
      </Route>
      
      {/* SaaS Marketplace */}
      <Route path="/marketplace" component={MarketplaceCatalog} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <TooltipProvider>
          <Toaster />
          <Router />
          {/* Onboarding wizard for new users */}
          <OnboardingWizard />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
