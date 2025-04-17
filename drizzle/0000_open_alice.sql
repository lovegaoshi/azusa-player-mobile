CREATE TABLE `playback-count` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`songcid` text NOT NULL,
	`count` integer NOT NULL
);
