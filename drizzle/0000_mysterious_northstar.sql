CREATE TABLE `application_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`documentType` varchar(100) NOT NULL,
	`documentName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`verified` boolean NOT NULL DEFAULT false,
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`verificationNotes` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `application_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessment_evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`evidence_type` enum('document','video','observation','artifact','testimony','certificate') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`file_url` varchar(500),
	`file_type` varchar(50),
	`file_size` int,
	`uploaded_by` int NOT NULL,
	`verification_status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`verified_by` int,
	`verified_date` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_evidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessment_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`assessmentType` enum('subject_specialization','professional_pedagogical','combined') NOT NULL,
	`assessmentName` varchar(255) NOT NULL,
	`score` int NOT NULL,
	`maxScore` int NOT NULL,
	`passingScore` int NOT NULL,
	`passed` boolean NOT NULL,
	`takenAt` timestamp NOT NULL DEFAULT (now()),
	`results` json,
	CONSTRAINT `assessment_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessment_rubrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`standard_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`criteria` text,
	`max_score` int DEFAULT 100,
	`passing_score` int DEFAULT 70,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_rubrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`assessmentType` enum('skill_test','personality','culture_fit','cognitive','custom') NOT NULL,
	`assessmentName` varchar(255) NOT NULL,
	`score` int,
	`maxScore` int,
	`passed` boolean,
	`completedAt` timestamp,
	`results` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`changes` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `candidate_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`requisitionId` int NOT NULL,
	`coverLetter` text,
	`status` enum('applied','screening','interview','assessment','offer','hired','rejected','withdrawn') NOT NULL DEFAULT 'applied',
	`currentStage` varchar(100),
	`matchScore` int,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidate_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `candidate_skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidateId` int NOT NULL,
	`skillId` int NOT NULL,
	`proficiencyLevel` enum('beginner','intermediate','advanced','expert') NOT NULL,
	`yearsOfExperience` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `candidate_skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32),
	`resumeUrl` text,
	`linkedinUrl` text,
	`currentCompany` varchar(255),
	`currentPosition` varchar(255),
	`yearsOfExperience` int,
	`education` json,
	`parsedData` json,
	`status` enum('new','screening','interview','assessment','offer','hired','rejected','withdrawn') NOT NULL DEFAULT 'new',
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `career_path_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`careerPathId` int NOT NULL,
	`position` int NOT NULL,
	`roleName` varchar(255) NOT NULL,
	`positionId` int,
	`requiredExperience` int,
	`salaryRangeMin` int,
	`salaryRangeMax` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `career_path_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `career_paths` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`departmentId` int,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `career_paths_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `career_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`recommendedPathId` int NOT NULL,
	`aiScore` int,
	`reasons` json,
	`estimatedTimeMonths` int,
	`requiredEffort` text,
	`status` enum('pending','accepted','rejected','completed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `career_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competency_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`educator_id` int NOT NULL,
	`standard_id` int NOT NULL,
	`assessment_type` enum('self_assessment','peer_review','supervisor_review','external_assessment','portfolio_review') NOT NULL,
	`assessor_id` int,
	`assessment_date` timestamp NOT NULL,
	`score` int,
	`level` enum('not_demonstrated','developing','proficient','advanced','expert'),
	`status` enum('scheduled','in_progress','completed','verified','rejected') NOT NULL DEFAULT 'scheduled',
	`strengths` text,
	`areas_for_improvement` text,
	`recommendations` text,
	`verified_by` int,
	`verified_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competency_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competency_development_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`educator_id` int NOT NULL,
	`standard_id` int NOT NULL,
	`current_level` enum('not_started','developing','proficient','advanced','expert') NOT NULL,
	`target_level` enum('developing','proficient','advanced','expert') NOT NULL,
	`target_date` timestamp,
	`activities` text,
	`resources` text,
	`milestones` text,
	`status` enum('draft','active','completed','cancelled') NOT NULL DEFAULT 'draft',
	`progress` int DEFAULT 0,
	`supervisor_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competency_development_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competency_frameworks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`version` varchar(50),
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`effective_date` timestamp,
	`expiry_date` timestamp,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competency_frameworks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competency_standards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`framework_id` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`level` enum('foundation','intermediate','advanced','expert') NOT NULL,
	`weight` int DEFAULT 1,
	`criteria` text,
	`evidence_requirements` text,
	`parent_id` int,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competency_standards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cpd_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherId` int NOT NULL,
	`activityName` varchar(255) NOT NULL,
	`activityType` varchar(100) NOT NULL,
	`provider` varchar(255),
	`hours` int NOT NULL,
	`completedAt` timestamp NOT NULL,
	`certificateUrl` text,
	`verified` boolean NOT NULL DEFAULT false,
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cpd_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`parentId` int,
	`headId` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `educator_competencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`educator_id` int NOT NULL,
	`standard_id` int NOT NULL,
	`current_level` enum('not_started','developing','proficient','advanced','expert') NOT NULL DEFAULT 'not_started',
	`target_level` enum('developing','proficient','advanced','expert'),
	`status` enum('in_progress','achieved','expired','under_review') NOT NULL DEFAULT 'in_progress',
	`achieved_date` timestamp,
	`expiry_date` timestamp,
	`last_assessed_date` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `educator_competencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`skillId` int NOT NULL,
	`proficiencyLevel` enum('beginner','intermediate','advanced','expert') NOT NULL,
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagement_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`activityType` enum('course_completion','survey_participation','workshop','event','team_building') NOT NULL,
	`activityName` varchar(255) NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `engagement_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagement_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`score` int NOT NULL,
	`factors` json,
	`sentiment` enum('very_negative','negative','neutral','positive','very_positive'),
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `engagement_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attempt_id` int NOT NULL,
	`question_id` int NOT NULL,
	`selected_option_id` int,
	`answer_text` text,
	`is_correct` boolean,
	`points_earned` int,
	`time_spent` int,
	`answered_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exam_id` int NOT NULL,
	`candidate_id` int NOT NULL,
	`attempt_number` int NOT NULL,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`submitted_at` timestamp,
	`status` enum('in_progress','submitted','graded','expired') NOT NULL DEFAULT 'in_progress',
	`score` int,
	`percentage` int,
	`passed` boolean,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exam_id` int NOT NULL,
	`question_id` int NOT NULL,
	`question_order` int NOT NULL,
	`points` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attempt_id` int NOT NULL,
	`candidate_id` int NOT NULL,
	`exam_id` int NOT NULL,
	`total_questions` int NOT NULL,
	`questions_answered` int NOT NULL,
	`correct_answers` int NOT NULL,
	`incorrect_answers` int NOT NULL,
	`skipped_questions` int NOT NULL,
	`total_points` int NOT NULL,
	`points_earned` int NOT NULL,
	`percentage` int NOT NULL,
	`passed` boolean NOT NULL,
	`grade` varchar(10),
	`time_spent` int,
	`feedback` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`license_application_id` int,
	`question_bank_id` int,
	`exam_type` enum('initial','renewal','upgrade','remedial') NOT NULL,
	`total_questions` int NOT NULL,
	`total_points` int NOT NULL,
	`passing_score` int NOT NULL,
	`duration` int NOT NULL,
	`start_time` timestamp,
	`end_time` timestamp,
	`is_adaptive` boolean NOT NULL DEFAULT false,
	`shuffle_questions` boolean NOT NULL DEFAULT true,
	`shuffle_options` boolean NOT NULL DEFAULT true,
	`max_attempts` int NOT NULL DEFAULT 3,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedback_360` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`cycleId` int NOT NULL,
	`feedbackFrom` int,
	`relationship` enum('peer','subordinate','manager','self','other') NOT NULL,
	`isAnonymous` boolean NOT NULL DEFAULT false,
	`rating` int,
	`comments` text,
	`strengths` text,
	`developmentAreas` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_360_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goalId` int NOT NULL,
	`progressPercentage` int NOT NULL,
	`notes` text,
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `goal_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`cycleId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`goalType` enum('individual','team','departmental','organizational') NOT NULL,
	`kpi` varchar(255),
	`targetValue` int,
	`currentValue` int,
	`unit` varchar(50),
	`deadline` timestamp,
	`status` enum('draft','active','completed','cancelled','overdue') NOT NULL DEFAULT 'draft',
	`alignedWithGoalId` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`interviewType` enum('phone_screen','technical','behavioral','panel','final') NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`duration` int,
	`location` varchar(255),
	`meetingLink` text,
	`interviewerId` int NOT NULL,
	`status` enum('scheduled','completed','cancelled','rescheduled') NOT NULL DEFAULT 'scheduled',
	`feedback` text,
	`rating` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_postings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requisitionId` int NOT NULL,
	`platform` varchar(100) NOT NULL,
	`externalUrl` text,
	`postedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`status` enum('active','expired','removed') NOT NULL DEFAULT 'active',
	CONSTRAINT `job_postings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `job_requisitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`departmentId` int NOT NULL,
	`positionId` int,
	`numberOfPositions` int NOT NULL DEFAULT 1,
	`salaryRangeMin` int,
	`salaryRangeMax` int,
	`budget` int,
	`requiredSkills` json,
	`requiredQualifications` text,
	`status` enum('draft','pending_approval','approved','posted','filled','cancelled') NOT NULL DEFAULT 'draft',
	`expiresAt` timestamp,
	`createdBy` int NOT NULL,
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `job_requisitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leadership_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`assessmentType` varchar(100) NOT NULL,
	`score` int NOT NULL,
	`maxScore` int NOT NULL,
	`assessedBy` int NOT NULL,
	`assessedAt` timestamp NOT NULL DEFAULT (now()),
	`feedback` text,
	`recommendations` text,
	CONSTRAINT `leadership_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `license_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicantId` int NOT NULL,
	`licenseTypeId` int NOT NULL,
	`tierId` int NOT NULL,
	`applicationNumber` varchar(100) NOT NULL,
	`personalInfo` json,
	`educationInfo` json,
	`experienceInfo` json,
	`status` enum('draft','submitted','under_review','documents_pending','approved','rejected','withdrawn') NOT NULL DEFAULT 'draft',
	`submittedAt` timestamp,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `license_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `license_applications_applicationNumber_unique` UNIQUE(`applicationNumber`)
);
--> statement-breakpoint
CREATE TABLE `license_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`licenseId` int NOT NULL,
	`eventType` enum('issued','renewed','suspended','reinstated','revoked','expired') NOT NULL,
	`eventDate` timestamp NOT NULL DEFAULT (now()),
	`performedBy` int,
	`notes` text,
	`blockchainHash` varchar(255),
	`previousStatus` varchar(50),
	`newStatus` varchar(50),
	CONSTRAINT `license_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `license_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`licenseTypeId` int NOT NULL,
	`tierName` varchar(100) NOT NULL,
	`tierLevel` int NOT NULL,
	`experienceRequired` int,
	`cpdRequired` int,
	`requirements` json,
	`validityYears` int NOT NULL DEFAULT 3,
	`fee` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `license_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `license_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`requirements` json,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `license_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `license_types_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `licenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicantId` int NOT NULL,
	`applicationId` int,
	`licenseNumber` varchar(100) NOT NULL,
	`licenseTypeId` int NOT NULL,
	`tierId` int NOT NULL,
	`issueDate` timestamp NOT NULL,
	`expiryDate` timestamp NOT NULL,
	`status` enum('active','expired','suspended','revoked','renewed') NOT NULL DEFAULT 'active',
	`qrCode` text,
	`blockchainHash` varchar(255),
	`issuedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `licenses_id` PRIMARY KEY(`id`),
	CONSTRAINT `licenses_licenseNumber_unique` UNIQUE(`licenseNumber`)
);
--> statement-breakpoint
CREATE TABLE `manager_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`cycleId` int NOT NULL,
	`managerId` int NOT NULL,
	`overallRating` int NOT NULL,
	`strengths` text,
	`areasForImprovement` text,
	`feedback` text,
	`recommendations` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manager_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`actionUrl` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_cycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`cycleType` enum('annual','semi_annual','quarterly','continuous') NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`status` enum('planning','active','review','completed','archived') NOT NULL DEFAULT 'planning',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `performance_cycles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`cycleId` int NOT NULL,
	`dimension` varchar(100) NOT NULL,
	`rating` int NOT NULL,
	`maxRating` int NOT NULL DEFAULT 5,
	`ratedBy` int NOT NULL,
	`ratedAt` timestamp NOT NULL DEFAULT (now()),
	`comments` text,
	CONSTRAINT `performance_ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`departmentId` int,
	`level` int,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `positions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question_banks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`license_type_id` int,
	`license_tier_id` int,
	`job_role` varchar(100),
	`subject_area` varchar(100),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `question_banks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `question_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question_id` int NOT NULL,
	`option_text` text NOT NULL,
	`is_correct` boolean NOT NULL DEFAULT false,
	`option_order` int NOT NULL,
	`explanation` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `question_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question_bank_id` int,
	`question_text` text NOT NULL,
	`question_context` text,
	`question_type` enum('multiple_choice','true_false','short_answer','essay','scenario') NOT NULL,
	`difficulty_level` enum('basic','intermediate','advanced','expert') NOT NULL,
	`points` int NOT NULL DEFAULT 1,
	`explanation` text,
	`tags` text,
	`is_ai_generated` boolean NOT NULL DEFAULT false,
	`ai_generation_prompt` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ratableType` varchar(100) NOT NULL,
	`ratableId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`review` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recruitment_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requisitionId` int NOT NULL,
	`metricType` enum('time_to_hire','cost_per_hire','source_effectiveness','diversity','quality_of_hire') NOT NULL,
	`metricValue` int,
	`metricData` json,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recruitment_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportType` varchar(100) NOT NULL,
	`reportName` varchar(255) NOT NULL,
	`module` varchar(100) NOT NULL,
	`parameters` json,
	`fileUrl` text,
	`fileKey` varchar(255),
	`status` enum('generating','completed','failed') NOT NULL DEFAULT 'generating',
	`generatedBy` int NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resource_allocations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`allocationPercentage` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`status` enum('planned','active','completed','cancelled') NOT NULL DEFAULT 'planned',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resource_allocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role_skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`positionId` int NOT NULL,
	`skillId` int NOT NULL,
	`proficiencyLevel` enum('beginner','intermediate','advanced','expert') NOT NULL,
	`isRequired` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `role_skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `self_appraisals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`cycleId` int NOT NULL,
	`content` json NOT NULL,
	`achievements` text,
	`challenges` text,
	`developmentNeeds` text,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `self_appraisals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skill_gaps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`skillId` int NOT NULL,
	`currentLevel` enum('none','beginner','intermediate','advanced','expert') NOT NULL,
	`requiredLevel` enum('beginner','intermediate','advanced','expert') NOT NULL,
	`gapLevel` int NOT NULL,
	`recommendedTraining` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skill_gaps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `succession_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`criticalPositionId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','inactive','completed') NOT NULL DEFAULT 'active',
	`reviewDate` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `succession_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `successors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`successionPlanId` int NOT NULL,
	`employeeId` int NOT NULL,
	`readinessScore` int,
	`developmentProgress` int,
	`strengths` text,
	`developmentAreas` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `successors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `survey_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`responseId` int NOT NULL,
	`questionId` int NOT NULL,
	`answerText` text,
	`answerValue` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `survey_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `survey_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surveyId` int NOT NULL,
	`questionText` text NOT NULL,
	`questionType` enum('multiple_choice','likert_scale','open_ended','rating','yes_no') NOT NULL,
	`options` json,
	`isRequired` boolean NOT NULL DEFAULT false,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `survey_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `survey_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`surveyId` int NOT NULL,
	`employeeId` int,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `survey_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surveys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`surveyType` enum('pulse','quarterly','annual','exit','custom') NOT NULL,
	`targetAudience` json,
	`status` enum('draft','active','closed','archived') NOT NULL DEFAULT 'draft',
	`isAnonymous` boolean NOT NULL DEFAULT false,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `surveys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `talent_pool_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`poolId` int NOT NULL,
	`employeeId` int NOT NULL,
	`readinessLevel` enum('not_ready','developing','ready_now','ready_plus') NOT NULL,
	`developmentPlan` text,
	`addedBy` int NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `talent_pool_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `talent_pools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`criteria` json,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `talent_pools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('super_admin','hr_manager','department_manager','employee','licensing_officer','recruiter') NOT NULL DEFAULT 'employee',
	`emiratesId` varchar(64),
	`phone` varchar(32),
	`departmentId` int,
	`positionId` int,
	`managerId` int,
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `workforce_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertType` enum('skill_shortage','over_allocation','resource_conflict','attrition_risk') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`message` text NOT NULL,
	`affectedDepartmentId` int,
	`affectedEmployeeId` int,
	`resolved` boolean NOT NULL DEFAULT false,
	`resolvedBy` int,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workforce_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workforce_projections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioId` int NOT NULL,
	`departmentId` int NOT NULL,
	`currentHeadcount` int NOT NULL,
	`projectedHeadcount` int NOT NULL,
	`timeframeMonths` int NOT NULL,
	`skillsRequired` json,
	`gap` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workforce_projections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workforce_scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`scenarioType` enum('expansion','downsizing','merger','restructuring','custom') NOT NULL,
	`parameters` json,
	`status` enum('draft','active','completed','archived') NOT NULL DEFAULT 'draft',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workforce_scenarios_id` PRIMARY KEY(`id`)
);
