import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

const table = sqliteTable('lyric-table', {
  id: int().primaryKey({ autoIncrement: true }),
  songId: text().unique().notNull(),
  lyricKey: text().notNull(),
  lyricOffset: real().notNull(),
  lyric: text().notNull(),
  source: text(),
});

export default table;
