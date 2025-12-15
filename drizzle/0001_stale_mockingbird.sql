CREATE TABLE `placement_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`placement_request_id` int NOT NULL,
	`approver_id` int NOT NULL,
	`approver_role` varchar(100) NOT NULL,
	`approval_level` int NOT NULL,
	`status` enum('pending','approved','rejected','deferred') NOT NULL DEFAULT 'pending',
	`comments` text,
	`decided_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `placement_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `placement_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`request_type` enum('transfer','promotion','position_change','school_change') NOT NULL,
	`current_school_id` int,
	`current_position_id` int,
	`requested_school_id` int,
	`requested_position_id` int,
	`reason` text NOT NULL,
	`preferred_start_date` timestamp,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('draft','submitted','under_review','approved','rejected','cancelled') NOT NULL DEFAULT 'draft',
	`submitted_at` timestamp,
	`reviewed_by` int,
	`reviewed_at` timestamp,
	`review_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `placement_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`arabic_name` varchar(255),
	`school_code` varchar(50) NOT NULL,
	`school_type` enum('public','private','charter') NOT NULL,
	`education_level` enum('kindergarten','primary','middle','secondary','all_levels') NOT NULL,
	`emirate` varchar(50) NOT NULL,
	`city` varchar(100) NOT NULL,
	`address` text,
	`capacity` int,
	`current_staff_count` int DEFAULT 0,
	`principal_id` int,
	`contact_email` varchar(320),
	`contact_phone` varchar(20),
	`status` enum('active','inactive','under_construction') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schools_id` PRIMARY KEY(`id`),
	CONSTRAINT `schools_school_code_unique` UNIQUE(`school_code`)
);
--> statement-breakpoint
CREATE TABLE `staff_placements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`school_id` int NOT NULL,
	`position_id` int NOT NULL,
	`placement_type` enum('new_hire','transfer','promotion','lateral_move','temporary','redeployment') NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`is_temporary` boolean NOT NULL DEFAULT false,
	`is_primary` boolean NOT NULL DEFAULT true,
	`workload_percentage` int NOT NULL DEFAULT 100,
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`notes` text,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_placements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transfer_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` int NOT NULL,
	`from_school_id` int,
	`to_school_id` int NOT NULL,
	`from_position_id` int,
	`to_position_id` int NOT NULL,
	`transfer_type` enum('voluntary','administrative','promotional','disciplinary') NOT NULL,
	`transfer_date` timestamp NOT NULL,
	`reason` text,
	`approved_by` int NOT NULL,
	`approval_date` timestamp NOT NULL,
	`effective_date` timestamp NOT NULL,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transfer_history_id` PRIMARY KEY(`id`)
);
