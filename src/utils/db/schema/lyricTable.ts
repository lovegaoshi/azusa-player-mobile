import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const table = sqliteTable('lyric-table', {
  id: int().primaryKey({ autoIncrement: true }),
  songcid: text().unique().notNull(),
});

export default table;
