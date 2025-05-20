import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

const table = sqliteTable('song-table', {
  internalid: int().primaryKey({ autoIncrement: true }),
  id: text().unique().notNull(),
  bvid: text().notNull(),
  name: text().notNull(),
  nameRaw: text().notNull(),
  singer: text().notNull(),
  singerId: text().notNull(),
  cover: text().notNull(),
  coverLowRes: text(),
  lyric: text(),
  lyricOffset: real(),
  parsedName: text().notNull(),
  biliShazamedName: text(),
  page: int(),
  duration: int().notNull(),
  album: text(),
  addedDate: int(),
  source: text(),
  isLive: int({ mode: 'boolean' }),
  liveStatus: int({ mode: 'boolean' }),
  metadataOnLoad: int({ mode: 'boolean' }),
  metadataOnReceived: int({ mode: 'boolean' }),
  order: int(),
  localPath: text(),
});

export default table;
