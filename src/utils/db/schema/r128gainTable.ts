import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

const table = sqliteTable('r128gain-table', {
  id: int().primaryKey({ autoIncrement: true }),
  songcid: text().unique().notNull(),
  r128gain: real(),
});

export default table;
