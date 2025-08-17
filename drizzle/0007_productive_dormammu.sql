CREATE TABLE `song-beat-table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`songcid` text NOT NULL,
	`beat` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `song-beat-table_songcid_unique` ON `song-beat-table` (`songcid`);