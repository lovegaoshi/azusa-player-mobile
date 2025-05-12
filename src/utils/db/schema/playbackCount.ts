import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
const table = sqliteTable('playback-count', {
  id: int().primaryKey({ autoIncrement: true }),
  songcid: text().notNull(),
  count: int().notNull(),
  lastPlayed: int(),
});

export default table;
