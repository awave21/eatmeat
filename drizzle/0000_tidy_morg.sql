CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`idempotency_key` text NOT NULL,
	`created_at` text NOT NULL,
	`delivery_date` text NOT NULL,
	`customer` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`items` text NOT NULL,
	`quantity` integer NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'test' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_idempotency_key_unique` ON `orders` (`idempotency_key`);