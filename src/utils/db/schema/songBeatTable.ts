import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const table = sqliteTable('song-beat-table', {
  id: int().primaryKey({ autoIncrement: true }),
  songcid: text().unique().notNull(),
  beat: text().notNull(),
});

export default table;
