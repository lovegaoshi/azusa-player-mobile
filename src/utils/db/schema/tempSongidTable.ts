import { int, sqliteTable } from 'drizzle-orm/sqlite-core';

// this table merely keeps a list of song SQLids to allow a faster innerjoin.
const table = sqliteTable('tempid-table', {
  id: int().primaryKey({ autoIncrement: true }),
  songid: int().unique().notNull(),
});

export default table;
