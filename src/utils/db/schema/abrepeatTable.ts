import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

const table = sqliteTable('abrepeat-table', {
  id: int().primaryKey({ autoIncrement: true }),
  songcid: text().unique().notNull(),
  a: real(),
  b: real(),
  aAbs: real(),
  bAbs: real(),
});

export default table;
