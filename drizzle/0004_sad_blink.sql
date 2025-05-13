ALTER TABLE `lyric-table` RENAME COLUMN "songcid" TO "songId";--> statement-breakpoint
DROP INDEX `lyric-table_songcid_unique`;--> statement-breakpoint
ALTER TABLE `lyric-table` ADD `lyricKey` text NOT NULL;--> statement-breakpoint
ALTER TABLE `lyric-table` ADD `lyricOffset` real NOT NULL;--> statement-breakpoint
ALTER TABLE `lyric-table` ADD `lyric` text NOT NULL;--> statement-breakpoint
ALTER TABLE `lyric-table` ADD `source` text;--> statement-breakpoint
CREATE UNIQUE INDEX `lyric-table_songId_unique` ON `lyric-table` (`songId`);