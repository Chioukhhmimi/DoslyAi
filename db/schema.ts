/**
 * Database schema for expo-sqlite (local offline-first storage).
 *
 * WatermelonDB (@nozbe/watermelondb) is installed but requires a custom
 * Expo Dev Client build to use its native SQLite adapter. For managed
 * Expo workflow, expo-sqlite is the safe default.
 *
 * TODO: Implement SQLite table creation and migration runner using
 *       expo-sqlite's SQLiteDatabase API (useSQLiteContext / openDatabaseAsync).
 */

export const DB_NAME = 'meditrack.db';

export const SCHEMA_VERSION = 1;

export const CREATE_PROFILES_TABLE = `
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    date_of_birth TEXT,
    relationship TEXT,
    avatar_uri TEXT,
    created_at TEXT NOT NULL
  );
`;

export const CREATE_MEDICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY NOT NULL,
    profile_id TEXT NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    type TEXT NOT NULL,
    schedule TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    notes TEXT,
    prescription_image_uri TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
  );
`;

export const CREATE_INTAKE_RECORDS_TABLE = `
  CREATE TABLE IF NOT EXISTS intake_records (
    id TEXT PRIMARY KEY NOT NULL,
    medication_id TEXT NOT NULL,
    profile_id TEXT NOT NULL,
    scheduled_at TEXT NOT NULL,
    taken_at TEXT,
    skipped INTEGER DEFAULT 0,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
  );
`;

export const ALL_TABLES = [
  CREATE_PROFILES_TABLE,
  CREATE_MEDICATIONS_TABLE,
  CREATE_INTAKE_RECORDS_TABLE,
];
