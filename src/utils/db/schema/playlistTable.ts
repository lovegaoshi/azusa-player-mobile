import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const table = sqliteTable('playlist-table', {
  internalid: int().primaryKey({ autoIncrement: true }),
  id: text().unique().notNull(),
  title: text().notNull(),
  type: text().notNull(),
  lastSubscribed: int().notNull(),
  // this is a list of song internal ids!!
  songList: text().notNull(),
  // json string of the rest
  settings: text().notNull(),
});

export default table;
