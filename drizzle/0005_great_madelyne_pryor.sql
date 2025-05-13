CREATE TABLE `playlist-table` (
	`internalid` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`lastSubscribed` integer NOT NULL,
	`songList` text NOT NULL,
	`settings` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `playlist-table_id_unique` ON `playlist-table` (`id`);--> statement-breakpoint
CREATE TABLE `song-table` (
	`internalid` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`bvid` text NOT NULL,
	`name` text NOT NULL,
	`nameRaw` text NOT NULL,
	`singer` text NOT NULL,
	`singerId` text NOT NULL,
	`cover` text NOT NULL,
	`coverLowRes` text,
	`lyric` text,
	`lyricOffset` real,
	`parsedName` text NOT NULL,
	`biliShazamedName` text,
	`page` integer,
	`duration` integer NOT NULL,
	`album` text,
	`addedDate` integer,
	`source` text,
	`isLive` integer,
	`liveStatus` integer,
	`metadataOnLoad` integer,
	`metadataOnReceived` integer,
	`order` integer,
	`localPath` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `song-table_id_unique` ON `song-table` (`id`);