CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`email_verified_at` datetime,
	`approved_at` datetime,
	`verification_code` varchar(6),
	`verification_code_expires_at` datetime,
	`created_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.403',
	`updated_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.403',
	`deleted_at` datetime,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` enum('CLIENTE','RECEPCIONISTA','VETERINARIO','ADMINISTRADOR') NOT NULL,
	`description` varchar(255),
	`requires_approval` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.443',
	`updated_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.443',
	`deleted_at` datetime,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`role_id` int NOT NULL,
	`assigned_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.470',
	`approved_at` datetime,
	`approved_by` int,
	`revoked_at` datetime,
	`revoked_by` int,
	CONSTRAINT `user_roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`phone` varchar(20) NOT NULL,
	`address` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.511',
	`updated_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.511',
	`deleted_at` datetime,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`license_number` varchar(100) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.528',
	`updated_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.528',
	`deleted_at` datetime,
	CONSTRAINT `vets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.606',
	`updated_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.606',
	`deleted_at` datetime,
	CONSTRAINT `specialties_id` PRIMARY KEY(`id`),
	CONSTRAINT `specialties_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `pets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`species` varchar(100) NOT NULL,
	`breed` varchar(100),
	`color` varchar(100),
	`birth_date` date,
	`weight` decimal(5,2),
	`status` enum('ACTIVA','HOSPITALIZADA','FALLECIDA') NOT NULL DEFAULT 'ACTIVA',
	`created_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.661',
	`updated_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.661',
	`deleted_at` datetime,
	CONSTRAINT `pets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(500),
	`price` decimal(10,2) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.677',
	`updated_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.677',
	`deleted_at` datetime,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`id_measurement` int NOT NULL,
	`id_category` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`expiring_date` date,
	`min_stock` int NOT NULL DEFAULT 0,
	`stock` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.739',
	`updated_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.739',
	`deleted_at` datetime,
	CONSTRAINT `supplies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.725',
	`updated_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.725',
	`deleted_at` datetime,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `measurement_units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit` varchar(100) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.739',
	`updated_at` datetime NOT NULL DEFAULT '2026-05-20 01:58:28.739',
	`deleted_at` datetime,
	CONSTRAINT `measurement_units_id` PRIMARY KEY(`id`),
	CONSTRAINT `measurement_units_unit_unique` UNIQUE(`unit`)
);
--> statement-breakpoint
CREATE TABLE `vet_specialties` (
	`vet_id` int NOT NULL,
	`specialty_id` int NOT NULL,
	CONSTRAINT `vet_specialties_vet_id_specialty_id_pk` PRIMARY KEY(`vet_id`,`specialty_id`)
);
--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vets` ADD CONSTRAINT `vets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pets` ADD CONSTRAINT `pets_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplies` ADD CONSTRAINT `supplies_id_measurement_measurement_units_id_fk` FOREIGN KEY (`id_measurement`) REFERENCES `measurement_units`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `supplies` ADD CONSTRAINT `supplies_id_category_categories_id_fk` FOREIGN KEY (`id_category`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vet_specialties` ADD CONSTRAINT `vet_specialties_vet_id_vets_id_fk` FOREIGN KEY (`vet_id`) REFERENCES `vets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vet_specialties` ADD CONSTRAINT `vet_specialties_specialty_id_specialties_id_fk` FOREIGN KEY (`specialty_id`) REFERENCES `specialties`(`id`) ON DELETE no action ON UPDATE no action;