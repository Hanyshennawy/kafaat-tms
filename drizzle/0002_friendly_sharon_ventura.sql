CREATE TABLE `cognitive_ability_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`educator_id` int NOT NULL,
	`verbal_reasoning` int,
	`numerical_reasoning` int,
	`abstract_reasoning` int,
	`spatial_reasoning` int,
	`logical_reasoning` int,
	`memory_capacity` int,
	`processing_speed` int,
	`problem_solving` int,
	`overall_iq` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cognitive_ability_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personality_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`result_id` int NOT NULL,
	`educator_id` int NOT NULL,
	`openness` int,
	`conscientiousness` int,
	`extraversion` int,
	`agreeableness` int,
	`neuroticism` int,
	`emotional_stability` int,
	`social_skills` int,
	`adaptability` int,
	`leadership_potential` int,
	`profile_summary` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `personality_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `psychometric_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`educator_id` int NOT NULL,
	`test_type_id` int NOT NULL,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	`status` enum('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress',
	`time_spent` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `psychometric_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `psychometric_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question_id` int NOT NULL,
	`option_text` varchar(500) NOT NULL,
	`score_value` int NOT NULL,
	`order_index` int NOT NULL,
	CONSTRAINT `psychometric_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `psychometric_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`test_type_id` int NOT NULL,
	`question_text` text NOT NULL,
	`question_type` enum('likert','multiple_choice','true_false','rating') NOT NULL,
	`trait_measured` varchar(100),
	`dimension` varchar(100),
	`is_reverse_coded` boolean DEFAULT false,
	`order_index` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `psychometric_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `psychometric_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`question_id` int NOT NULL,
	`selected_option_id` int,
	`response_value` int,
	`response_time` int,
	`answered_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `psychometric_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `psychometric_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessment_id` int NOT NULL,
	`educator_id` int NOT NULL,
	`test_type_id` int NOT NULL,
	`overall_score` int,
	`percentile_rank` int,
	`interpretation` text,
	`strengths` text,
	`development_areas` text,
	`recommendations` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `psychometric_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `psychometric_test_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('personality','cognitive','emotional_intelligence','behavioral','teaching_style') NOT NULL,
	`description` text,
	`purpose` text,
	`duration` int,
	`question_count` int,
	`scoring_method` enum('likert_scale','multiple_choice','true_false','rating_scale') NOT NULL,
	`status` enum('active','inactive','draft') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `psychometric_test_types_id` PRIMARY KEY(`id`)
);
