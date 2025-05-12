CREATE UNIQUE INDEX `abrepeat-table_songcid_unique` ON `abrepeat-table` (`songcid`);--> statement-breakpoint
CREATE UNIQUE INDEX `lyric-table_songcid_unique` ON `lyric-table` (`songcid`);--> statement-breakpoint
CREATE UNIQUE INDEX `playback-count_songcid_unique` ON `playback-count` (`songcid`);--> statement-breakpoint
CREATE UNIQUE INDEX `r128gain-table_songcid_unique` ON `r128gain-table` (`songcid`);--> statement-breakpoint
CREATE UNIQUE INDEX `temp-table_songcid_unique` ON `temp-table` (`songcid`);