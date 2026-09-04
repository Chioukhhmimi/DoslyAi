import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { migration_v1 } from './migrations/v1_initial';
import { migration_v2 } from './migrations/v2_schema_update';
import { migration_v3 } from './migrations/v3_notes_color';
import { migration_v4 } from './migrations/v4_profile_medical';

const ALL_MIGRATIONS = [migration_v1, migration_v2, migration_v3, migration_v4];

let _db: SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (_db) return _db;
  _db = await openDatabaseAsync('meditrack.db');
  await runMigrations(_db);
  return _db;
}

async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY NOT NULL
    );
  `);

  for (const migration of ALL_MIGRATIONS) {
    const applied = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM _migrations WHERE version = ?',
      [migration.version]
    );

    if (!applied) {
      for (const sql of migration.up) {
        await db.execAsync(sql);
      }
      await db.runAsync('INSERT INTO _migrations (version) VALUES (?)', [migration.version]);
    }
  }
}

export async function deleteAllData(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.execAsync('DELETE FROM intake_records');
    await db.execAsync('DELETE FROM medications');
    await db.execAsync('DELETE FROM profiles');
    await db.execAsync("DELETE FROM settings WHERE key != 'onboardingComplete'");
  });
}
