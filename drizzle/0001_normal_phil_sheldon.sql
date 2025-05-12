CREATE TABLE `temp-table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`songcid` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `playback-count` ADD `lastPlayed` integer;