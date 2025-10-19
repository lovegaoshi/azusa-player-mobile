import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const table = sqliteTable('song-download-table', {
  id: int().primaryKey({ autoIncrement: true }),
  songcid: text().unique().notNull(),
  downloadPath: text().notNull(),
});

export default table;
