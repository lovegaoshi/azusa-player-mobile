CREATE TABLE `abrepeat-table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`songcid` text NOT NULL,
	`a` real,
	`b` real
);
--> statement-breakpoint
CREATE TABLE `lyric-table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`songcid` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `r128gain-table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`songcid` text NOT NULL,
	`r128gain` real
);
