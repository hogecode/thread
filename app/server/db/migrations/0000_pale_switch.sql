CREATE TABLE `admin_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`admin_id` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`target_type` varchar(50),
	`target_id` int,
	`description` text,
	`details` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`display_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `message_threads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`participant1_id` int NOT NULL,
	`participant2_id` int NOT NULL,
	`last_message_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `message_threads_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_participants_unique` UNIQUE(`participant1_id`,`participant2_id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message_thread_id` int NOT NULL,
	`sender_id` int NOT NULL,
	`recipient_id` int NOT NULL,
	`content` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`read_at` timestamp,
	`is_deleted` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`thread_id` int NOT NULL,
	`created_by_id` int NOT NULL,
	`content` text NOT NULL,
	`edited_at` timestamp,
	`is_deleted` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `threads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`created_by_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`post_count` int NOT NULL DEFAULT 0,
	`view_count` int NOT NULL DEFAULT 0,
	`last_post_at` timestamp,
	`is_archived` boolean NOT NULL DEFAULT false,
	`is_deleted` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `threads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_follows` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`follower_id` int NOT NULL,
	`following_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_follows_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_follower_following_unique` UNIQUE(`follower_id`,`following_id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`bio` text,
	`profile_image_url` varchar(500),
	`display_name` varchar(100),
	`location` varchar(100),
	`website` varchar(500),
	`post_count` int NOT NULL DEFAULT 0,
	`thread_count` int NOT NULL DEFAULT 0,
	`following_count` int NOT NULL DEFAULT 0,
	`follower_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporter_id` int NOT NULL,
	`target_type` enum('thread','post') NOT NULL,
	`target_id` int NOT NULL,
	`reason` varchar(100) NOT NULL,
	`description` text,
	`status` enum('pending','reviewed','resolved') NOT NULL DEFAULT 'pending',
	`reviewed_at` timestamp,
	`reviewed_by_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(50) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`is_admin` boolean NOT NULL DEFAULT false,
	`email_verified` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `idx_admin_id` ON `admin_logs` (`admin_id`);--> statement-breakpoint
CREATE INDEX `idx_action` ON `admin_logs` (`action`);--> statement-breakpoint
CREATE INDEX `idx_target_type_id` ON `admin_logs` (`target_type`,`target_id`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `admin_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_slug` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_is_active` ON `categories` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_participant1_id` ON `message_threads` (`participant1_id`);--> statement-breakpoint
CREATE INDEX `idx_participant2_id` ON `message_threads` (`participant2_id`);--> statement-breakpoint
CREATE INDEX `idx_message_thread_id` ON `messages` (`message_thread_id`);--> statement-breakpoint
CREATE INDEX `idx_sender_id` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `idx_recipient_id` ON `messages` (`recipient_id`);--> statement-breakpoint
CREATE INDEX `idx_is_read` ON `messages` (`is_read`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_thread_id` ON `posts` (`thread_id`);--> statement-breakpoint
CREATE INDEX `idx_created_by_id` ON `posts` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `idx_is_deleted` ON `posts` (`is_deleted`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `posts` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_category_id` ON `threads` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_created_by_id` ON `threads` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `idx_title` ON `threads` (`title`);--> statement-breakpoint
CREATE INDEX `idx_is_deleted` ON `threads` (`is_deleted`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `threads` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_last_post_at` ON `threads` (`last_post_at`);--> statement-breakpoint
CREATE INDEX `idx_follower_id` ON `user_follows` (`follower_id`);--> statement-breakpoint
CREATE INDEX `idx_following_id` ON `user_follows` (`following_id`);--> statement-breakpoint
CREATE INDEX `idx_reporter_id` ON `user_reports` (`reporter_id`);--> statement-breakpoint
CREATE INDEX `idx_target_type_id` ON `user_reports` (`target_type`,`target_id`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `user_reports` (`status`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `user_reports` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_username` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `idx_is_active` ON `users` (`is_active`);--> statement-breakpoint
ALTER TABLE `admin_logs` ADD CONSTRAINT `admin_logs_admin_id_users_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `message_threads` ADD CONSTRAINT `message_threads_participant1_id_users_id_fk` FOREIGN KEY (`participant1_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `message_threads` ADD CONSTRAINT `message_threads_participant2_id_users_id_fk` FOREIGN KEY (`participant2_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_message_thread_id_message_threads_id_fk` FOREIGN KEY (`message_thread_id`) REFERENCES `message_threads`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_recipient_id_users_id_fk` FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_thread_id_threads_id_fk` FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `threads` ADD CONSTRAINT `threads_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `threads` ADD CONSTRAINT `threads_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_follower_id_users_id_fk` FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_following_id_users_id_fk` FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_reports` ADD CONSTRAINT `user_reports_reporter_id_users_id_fk` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_reports` ADD CONSTRAINT `user_reports_reviewed_by_id_users_id_fk` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;