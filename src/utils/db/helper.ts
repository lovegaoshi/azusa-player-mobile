// https://github.com/drizzle-team/drizzle-orm/discussions/2557
// src/db/helpers.ts
import { sql, getTableColumns } from 'drizzle-orm';
import {
  getTableConfig,
  SQLiteTable,
  SQLiteUpdateSetSource,
} from 'drizzle-orm/sqlite-core';

export function conflictUpdateSetAllColumns<
  T extends SQLiteTable,
  E extends (keyof T['$inferInsert'])[],
>(table: T, except?: E): SQLiteUpdateSetSource<T> {
  const columns = getTableColumns(table);
  const config = getTableConfig(table);
  const { name: tableName } = config;
  const conflictUpdateSet = Object.entries(columns).reduce(
    (acc, [columnName, columnInfo]) => {
      if (except && except.includes(columnName as E[number])) {
        return acc;
      }
      if (!columnInfo.default) {
        // @ts-ignore
        acc[columnName] = sql.raw(
          `COALESCE("excluded"."${columnInfo.name}", "${tableName}"."${columnInfo.name}")`,
        );
      }
      return acc;
    },
    {},
  ) as SQLiteUpdateSetSource<T>;
  return conflictUpdateSet;
}
