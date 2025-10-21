CREATE TABLE `song-download-table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`songcid` text NOT NULL,
	`downloadPath` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `song-download-table_songcid_unique` ON `song-download-table` (`songcid`);