import { getDatabase } from '../database';

export async function dbGetSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}

export async function dbSetSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
}

export async function dbDeleteAllSettings(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM settings');
}
