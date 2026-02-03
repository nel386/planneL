import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDb = () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('plannel.db');
  }
  return dbPromise;
};

export const exec = async (sql: string) => {
  const db = await getDb();
  await db.execAsync(sql);
};

export const run = async (sql: string, params: SQLite.SQLiteBindParams = []) => {
  const db = await getDb();
  return db.runAsync(sql, params);
};

export const getAll = async <T>(sql: string, params: SQLite.SQLiteBindParams = []): Promise<T[]> => {
  const db = await getDb();
  return db.getAllAsync<T>(sql, params);
};

export const getFirst = async <T>(sql: string, params: SQLite.SQLiteBindParams = []): Promise<T | null> => {
  const db = await getDb();
  return db.getFirstAsync<T>(sql, params);
};
