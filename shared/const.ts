export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

/**
 * UAE Educator Role Hierarchy for Kafaat TMS
 * These roles are specific to the UAE Ministry of Education structure
 */
export const EDUCATOR_ROLES = [
  // Teaching Track - Classroom Educators
  { value: "assistant_teacher", label: "Assistant Teacher", track: "Teaching", level: 1, description: "Entry-level teaching support role" },
  { value: "teacher", label: "Teacher", track: "Teaching", level: 2, description: "Certified classroom teacher" },
  { value: "teacher_t1", label: "Teacher T1", track: "Teaching", level: 3, description: "Experienced teacher with advanced certification" },
  { value: "expert_teacher", label: "Expert Teacher", track: "Teaching", level: 4, description: "Master teacher with mentoring responsibilities" },
  { value: "head_of_subject_1", label: "Head of Subject 1", track: "Teaching", level: 5, description: "Department head for a subject area" },
  { value: "head_of_subject_2", label: "Head of Subject 2", track: "Teaching", level: 6, description: "Senior department head" },
  { value: "head_of_unit_1", label: "Head of Unit 1", track: "Teaching", level: 7, description: "Academic unit coordinator" },
  { value: "head_of_unit_2", label: "Head of Unit 2", track: "Teaching", level: 8, description: "Senior academic unit coordinator" },
  
  // Leadership Track - School Administration
  { value: "vp_academic", label: "Vice Principal (Academic)", track: "Leadership", level: 9, description: "Academic affairs leadership" },
  { value: "vp_admin", label: "Vice Principal (Admin)", track: "Leadership", level: 9, description: "Administrative affairs leadership" },
  { value: "principal", label: "Principal", track: "Leadership", level: 10, description: "School principal" },
  { value: "expert_principal", label: "Expert Principal", track: "Leadership", level: 11, description: "Senior principal with district responsibilities" },
  
  // Admin Track - School Support Staff
  { value: "admin_assistant", label: "Administrative Assistant", track: "Admin", level: 1, description: "Entry-level administrative support" },
  { value: "admin_officer", label: "Administrative Officer", track: "Admin", level: 2, description: "Administrative coordination" },
  { value: "senior_admin", label: "Senior Administrator", track: "Admin", level: 3, description: "Senior administrative duties" },
  { value: "admin_manager", label: "Administrative Manager", track: "Admin", level: 4, description: "Administrative department management" },
  
  // Specialist Track - Educational Support
  { value: "specialist_1", label: "Specialist Level 1", track: "Specialist", level: 1, description: "Entry-level educational specialist" },
  { value: "specialist_2", label: "Specialist Level 2", track: "Specialist", level: 2, description: "Educational specialist" },
  { value: "senior_specialist", label: "Senior Specialist", track: "Specialist", level: 3, description: "Senior educational specialist" },
  { value: "expert_specialist", label: "Expert Specialist", track: "Specialist", level: 4, description: "Expert-level educational specialist" },
  
  // Counseling & Support Track
  { value: "counselor", label: "School Counselor", track: "Support", level: 2, description: "Student counseling and support" },
  { value: "sen_coordinator", label: "SEN Coordinator", track: "Support", level: 3, description: "Special Educational Needs coordination" },
  { value: "social_worker", label: "Social Worker", track: "Support", level: 2, description: "Student welfare and family liaison" },
] as const;

export type EducatorRole = typeof EDUCATOR_ROLES[number]['value'];
export type EducatorTrack = 'Teaching' | 'Leadership' | 'Admin' | 'Specialist' | 'Support';

/**
 * Subject specializations for UAE curriculum
 */
export const SUBJECT_SPECIALIZATIONS = [
  { value: "arabic", label: "Arabic Language", category: "Languages" },
  { value: "english", label: "English Language", category: "Languages" },
  { value: "islamic_studies", label: "Islamic Studies", category: "Religious Studies" },
  { value: "moral_education", label: "Moral Education", category: "Religious Studies" },
  { value: "mathematics", label: "Mathematics", category: "STEM" },
  { value: "physics", label: "Physics", category: "STEM" },
  { value: "chemistry", label: "Chemistry", category: "STEM" },
  { value: "biology", label: "Biology", category: "STEM" },
  { value: "science", label: "General Science", category: "STEM" },
  { value: "computer_science", label: "Computer Science", category: "STEM" },
  { value: "social_studies", label: "Social Studies", category: "Humanities" },
  { value: "uae_studies", label: "UAE Studies", category: "Humanities" },
  { value: "history", label: "History", category: "Humanities" },
  { value: "geography", label: "Geography", category: "Humanities" },
  { value: "physical_education", label: "Physical Education", category: "Electives" },
  { value: "arts", label: "Visual Arts", category: "Electives" },
  { value: "music", label: "Music", category: "Electives" },
  { value: "drama", label: "Drama", category: "Electives" },
  { value: "design_technology", label: "Design & Technology", category: "Electives" },
  { value: "business_studies", label: "Business Studies", category: "Vocational" },
  { value: "economics", label: "Economics", category: "Vocational" },
] as const;

/**
 * Grade levels in UAE education system
 */
export const GRADE_LEVELS = [
  { value: "kg1", label: "KG1", cycle: "Foundation", ageRange: "3-4" },
  { value: "kg2", label: "KG2", cycle: "Foundation", ageRange: "4-5" },
  { value: "grade_1", label: "Grade 1", cycle: "Cycle 1", ageRange: "5-6" },
  { value: "grade_2", label: "Grade 2", cycle: "Cycle 1", ageRange: "6-7" },
  { value: "grade_3", label: "Grade 3", cycle: "Cycle 1", ageRange: "7-8" },
  { value: "grade_4", label: "Grade 4", cycle: "Cycle 1", ageRange: "8-9" },
  { value: "grade_5", label: "Grade 5", cycle: "Cycle 2", ageRange: "9-10" },
  { value: "grade_6", label: "Grade 6", cycle: "Cycle 2", ageRange: "10-11" },
  { value: "grade_7", label: "Grade 7", cycle: "Cycle 2", ageRange: "11-12" },
  { value: "grade_8", label: "Grade 8", cycle: "Cycle 2", ageRange: "12-13" },
  { value: "grade_9", label: "Grade 9", cycle: "Cycle 3", ageRange: "13-14" },
  { value: "grade_10", label: "Grade 10", cycle: "Cycle 3", ageRange: "14-15" },
  { value: "grade_11", label: "Grade 11", cycle: "Cycle 3", ageRange: "15-16" },
  { value: "grade_12", label: "Grade 12", cycle: "Cycle 3", ageRange: "16-17" },
] as const;

/**
 * UAE Emirates
 */
export const UAE_EMIRATES = [
  { value: "abu_dhabi", label: "Abu Dhabi" },
  { value: "dubai", label: "Dubai" },
  { value: "sharjah", label: "Sharjah" },
  { value: "ajman", label: "Ajman" },
  { value: "umm_al_quwain", label: "Umm Al Quwain" },
  { value: "ras_al_khaimah", label: "Ras Al Khaimah" },
  { value: "fujairah", label: "Fujairah" },
] as const;

/**
 * School types in UAE
 */
export const SCHOOL_TYPES = [
  { value: "government", label: "Government School", curriculum: "MOE" },
  { value: "private_moe", label: "Private School (MOE Curriculum)", curriculum: "MOE" },
  { value: "private_american", label: "Private School (American)", curriculum: "American" },
  { value: "private_british", label: "Private School (British)", curriculum: "British" },
  { value: "private_ib", label: "Private School (IB)", curriculum: "IB" },
  { value: "private_indian", label: "Private School (Indian)", curriculum: "CBSE/ICSE" },
  { value: "private_french", label: "Private School (French)", curriculum: "French" },
  { value: "private_german", label: "Private School (German)", curriculum: "German" },
  { value: "charter", label: "Charter School", curriculum: "Various" },
] as const;

