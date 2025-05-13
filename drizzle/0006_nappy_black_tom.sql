CREATE TABLE `tempid-table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`songid` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tempid-table_songid_unique` ON `tempid-table` (`songid`);