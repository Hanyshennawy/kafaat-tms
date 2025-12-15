/**
 * Demo Data for testing without database connection
 * This provides sample data for all modules when the database is unavailable
 */

// ============================================================================
// DEMO DATA: CAREER PROGRESSION
// ============================================================================

export const demoCareerPaths = [
  {
    id: 1,
    name: "Software Engineering Track",
    description: "From junior developer to technical architect",
    departmentId: 1,
    status: "published" as const,
    createdBy: 1,
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: 2,
    name: "Teaching Leadership Track",
    description: "From classroom teacher to school principal",
    departmentId: 2,
    status: "published" as const,
    createdBy: 1,
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-02-01"),
  },
  {
    id: 3,
    name: "HR Management Track",
    description: "Career progression in human resources",
    departmentId: 3,
    status: "draft" as const,
    createdBy: 1,
    createdAt: new Date("2025-03-10"),
    updatedAt: new Date("2025-03-10"),
  },
];

export const demoSkills = [
  { id: 1, name: "JavaScript", category: "Technical", description: "Frontend and backend development" },
  { id: 2, name: "Leadership", category: "Soft Skills", description: "Team leadership and management" },
  { id: 3, name: "Curriculum Design", category: "Education", description: "Educational curriculum development" },
  { id: 4, name: "Data Analysis", category: "Technical", description: "Statistical analysis and reporting" },
  { id: 5, name: "Project Management", category: "Management", description: "Planning and executing projects" },
];

// ============================================================================
// DEMO DATA: SUCCESSION PLANNING
// ============================================================================

export const demoSuccessionPlans = [
  {
    id: 1,
    criticalPositionId: 1,
    name: "CTO Succession Plan",
    description: "Prepare successors for Chief Technology Officer role",
    status: "active" as const,
    targetDate: new Date("2026-06-01"),
    createdBy: 1,
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-20"),
  },
  {
    id: 2,
    criticalPositionId: 2,
    name: "School Principal Pipeline",
    description: "Develop future school leaders",
    status: "active" as const,
    targetDate: new Date("2026-09-01"),
    createdBy: 1,
    createdAt: new Date("2025-02-15"),
    updatedAt: new Date("2025-02-15"),
  },
];

export const demoTalentPools = [
  { id: 1, name: "High Potential Leaders", description: "Top performers ready for leadership roles", status: "active" as const },
  { id: 2, name: "Technical Experts", description: "Deep technical expertise pool", status: "active" as const },
  { id: 3, name: "Teaching Excellence", description: "Outstanding educators for advancement", status: "active" as const },
];

// ============================================================================
// DEMO DATA: WORKFORCE PLANNING
// ============================================================================

export const demoWorkforceScenarios = [
  {
    id: 1,
    name: "Expansion 2026",
    description: "Workforce planning for 15% growth scenario",
    scenarioType: "growth" as const,
    baselineHeadcount: 500,
    targetHeadcount: 575,
    timeframeMonths: 12,
    status: "active" as const,
    createdBy: 1,
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: 2,
    name: "Digital Transformation",
    description: "Workforce restructuring for tech adoption",
    scenarioType: "restructuring" as const,
    baselineHeadcount: 500,
    targetHeadcount: 520,
    timeframeMonths: 18,
    status: "draft" as const,
    createdBy: 1,
    createdAt: new Date("2025-02-05"),
    updatedAt: new Date("2025-02-05"),
  },
];

// ============================================================================
// DEMO DATA: EMPLOYEE ENGAGEMENT
// ============================================================================

export const demoSurveys = [
  {
    id: 1,
    title: "Q4 2025 Employee Engagement Survey",
    description: "Quarterly engagement pulse check",
    type: "engagement" as const,
    status: "active" as const,
    startDate: new Date("2025-10-01"),
    endDate: new Date("2025-10-31"),
    isAnonymous: true,
    createdBy: 1,
    createdAt: new Date("2025-09-15"),
    updatedAt: new Date("2025-09-15"),
  },
  {
    id: 2,
    title: "Remote Work Satisfaction Survey",
    description: "Assess remote work experience",
    type: "satisfaction" as const,
    status: "completed" as const,
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-06-15"),
    isAnonymous: true,
    createdBy: 1,
    createdAt: new Date("2025-05-20"),
    updatedAt: new Date("2025-06-20"),
  },
];

// ============================================================================
// DEMO DATA: RECRUITMENT
// ============================================================================

export const demoRequisitions = [
  {
    id: 1,
    title: "Senior Software Engineer",
    description: "Looking for experienced software engineers to join our growing team",
    departmentId: 1,
    positionId: 1,
    requestedBy: 1,
    approvedBy: 2,
    status: "approved" as const,
    priority: "high" as const,
    numberOfPositions: 2,
    salaryRangeMin: 120000,
    salaryRangeMax: 180000,
    jobDescription: "Looking for experienced software engineers",
    requirements: "5+ years experience in TypeScript/React",
    requiredSkills: ["TypeScript", "React", "Node.js", "SQL"],
    targetStartDate: new Date("2025-02-01"),
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-05"),
  },
  {
    id: 2,
    title: "Mathematics Teacher",
    description: "Secondary school mathematics teacher for Al Ain region",
    departmentId: 2,
    positionId: 3,
    requestedBy: 3,
    approvedBy: 2,
    status: "open" as const,
    priority: "medium" as const,
    numberOfPositions: 3,
    salaryRangeMin: 55000,
    salaryRangeMax: 75000,
    jobDescription: "Secondary school mathematics teacher",
    requirements: "Teaching license required",
    requiredSkills: ["Mathematics", "Curriculum Design", "Classroom Management"],
    targetStartDate: new Date("2025-09-01"),
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-20"),
  },
];

export const demoCandidates = [
  {
    id: 1,
    firstName: "Ahmed",
    lastName: "Al-Rashid",
    email: "ahmed.rashid@email.com",
    phone: "+971501234567",
    currentPosition: "Software Developer",
    yearsOfExperience: 6,
    education: ["BSc Computer Science", "MSc Software Engineering"],
    status: "interviewing" as const,
    source: "LinkedIn",
    appliedAt: new Date("2025-01-10"),
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Mohammed",
    email: "sarah.m@email.com",
    phone: "+971502345678",
    currentPosition: "Junior Teacher",
    yearsOfExperience: 3,
    education: ["Bachelor of Education"],
    status: "screening" as const,
    source: "Job Portal",
    appliedAt: new Date("2025-01-15"),
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
];

// ============================================================================
// DEMO DATA: PERFORMANCE MANAGEMENT
// ============================================================================

export const demoPerformanceCycles = [
  {
    id: 1,
    name: "2025 Annual Review",
    description: "Annual performance review cycle",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    status: "active" as const,
    createdBy: 1,
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: 2,
    name: "Q1 2025 Goals",
    description: "First quarter goal setting and tracking",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-03-31"),
    status: "completed" as const,
    createdBy: 1,
    createdAt: new Date("2024-12-15"),
    updatedAt: new Date("2025-04-01"),
  },
];

// ============================================================================
// DEMO DATA: TEACHERS LICENSING
// ============================================================================

export const demoLicenseApplications = [
  {
    id: 1,
    applicantId: 5,
    licenseTypeId: 1,
    licenseTierId: 2,
    status: "under_review" as const,
    applicationDate: new Date("2025-01-08"),
    submittedAt: new Date("2025-01-08"),
    reviewerNotes: "Documents verified, pending interview",
    createdAt: new Date("2025-01-08"),
    updatedAt: new Date("2025-01-12"),
  },
  {
    id: 2,
    applicantId: 6,
    licenseTypeId: 2,
    licenseTierId: 1,
    status: "approved" as const,
    applicationDate: new Date("2025-01-02"),
    submittedAt: new Date("2025-01-02"),
    reviewerNotes: "All requirements met",
    createdAt: new Date("2025-01-02"),
    updatedAt: new Date("2025-01-10"),
  },
];

export const demoLicenses = [
  {
    id: 1,
    applicationId: 2,
    holderId: 6,
    licenseTypeId: 2,
    licenseTierId: 1,
    licenseNumber: "TL-2025-00001",
    status: "active" as const,
    issueDate: new Date("2025-01-10"),
    expiryDate: new Date("2028-01-10"),
    blockchainHash: "0x1234...abcd",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: 2,
    applicationId: 1,
    holderId: 5,
    licenseTypeId: 1,
    licenseTierId: 2,
    licenseNumber: "TL-2025-00002",
    status: "active" as const,
    issueDate: new Date("2025-01-15"),
    expiryDate: new Date("2028-01-15"),
    blockchainHash: "0x5678...efgh",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
];

// ============================================================================
// DEMO DATA: NOTIFICATIONS
// ============================================================================

export const demoNotifications = [
  {
    id: 1,
    userId: 1,
    title: "Performance Review Due",
    message: "Your Q4 self-appraisal is due in 5 days",
    type: "reminder" as const,
    priority: "high" as const,
    isRead: false,
    createdAt: new Date("2025-12-10"),
  },
  {
    id: 2,
    userId: 1,
    title: "New Training Available",
    message: "Leadership Development Program is now open for enrollment",
    type: "info" as const,
    priority: "medium" as const,
    isRead: false,
    createdAt: new Date("2025-12-09"),
  },
  {
    id: 3,
    userId: 1,
    title: "Goal Completed",
    message: "Congratulations! You completed your Q3 project milestone",
    type: "success" as const,
    priority: "low" as const,
    isRead: true,
    createdAt: new Date("2025-12-05"),
  },
];

// ============================================================================
// DEMO DATA: DEPARTMENTS & POSITIONS
// ============================================================================

export const demoDepartments = [
  { id: 1, name: "Information Technology", description: "IT and software development", headId: 2 },
  { id: 2, name: "Education", description: "Teaching and curriculum", headId: 3 },
  { id: 3, name: "Human Resources", description: "HR and talent management", headId: 4 },
  { id: 4, name: "Administration", description: "General administration", headId: 5 },
];

export const demoPositions = [
  { id: 1, title: "Software Engineer", departmentId: 1, level: 3, salaryGradeId: 5 },
  { id: 2, title: "Senior Software Engineer", departmentId: 1, level: 4, salaryGradeId: 7 },
  { id: 3, title: "Teacher", departmentId: 2, level: 2, salaryGradeId: 4 },
  { id: 4, title: "Senior Teacher", departmentId: 2, level: 3, salaryGradeId: 5 },
  { id: 5, title: "HR Specialist", departmentId: 3, level: 2, salaryGradeId: 4 },
];

// ============================================================================
// DEMO DATA: COMPETENCY ASSESSMENTS
// ============================================================================

export const demoCompetencyFrameworks = [
  {
    id: 1,
    name: "UAE Teaching Standards",
    description: "National professional standards for teachers in UAE",
    version: "2.0",
    status: "active" as const,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-06-15"),
  },
  {
    id: 2,
    name: "Leadership Competencies",
    description: "Core competencies for school leaders",
    version: "1.5",
    status: "active" as const,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-09-01"),
  },
];

// ============================================================================
// DEMO DATA: PLACEMENT & MOBILITY
// ============================================================================

export const demoPlacementRequests = [
  {
    id: 1,
    employeeId: 10,
    requestType: "transfer" as const,
    fromDepartmentId: 2,
    toDepartmentId: 2,
    fromLocationId: 1,
    toLocationId: 3,
    reason: "Family relocation",
    status: "pending" as const,
    createdAt: new Date("2025-12-01"),
    updatedAt: new Date("2025-12-01"),
  },
  {
    id: 2,
    employeeId: 15,
    requestType: "promotion" as const,
    fromDepartmentId: 1,
    toDepartmentId: 1,
    reason: "Career advancement",
    status: "approved" as const,
    createdAt: new Date("2025-11-15"),
    updatedAt: new Date("2025-11-25"),
  },
];

// ============================================================================
// DEMO DATA: PSYCHOMETRIC ASSESSMENTS
// ============================================================================

export const demoPsychometricAssessments = [
  {
    id: 1,
    name: "Big Five Personality Assessment",
    type: "personality" as const,
    description: "Measures five major personality traits",
    duration: 30,
    status: "active" as const,
  },
  {
    id: 2,
    name: "Cognitive Ability Test",
    type: "cognitive" as const,
    description: "Measures problem-solving and reasoning abilities",
    duration: 45,
    status: "active" as const,
  },
  {
    id: 3,
    name: "Emotional Intelligence Assessment",
    type: "emotional" as const,
    description: "Measures emotional awareness and regulation",
    duration: 25,
    status: "active" as const,
  },
];
