import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const table = sqliteTable('lyric-table', {
  id: int().primaryKey({ autoIncrement: true }),
  songcid: text().notNull(),
});

export default table;
