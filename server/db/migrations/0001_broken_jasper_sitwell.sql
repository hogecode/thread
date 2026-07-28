CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`session_id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_session_id_unique` UNIQUE(`session_id`),
	CONSTRAINT `idx_session_id_unique` UNIQUE(`session_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_expires_at` ON `sessions` (`expires_at`);--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;