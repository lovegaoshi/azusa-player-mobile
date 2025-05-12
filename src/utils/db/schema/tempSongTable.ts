import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// this table merely keeps a list of songcids to allow a faster innerjoin.
const table = sqliteTable('temp-table', {
  id: int().primaryKey({ autoIncrement: true }),
  songcid: text().unique().notNull(),
});

export default table;
