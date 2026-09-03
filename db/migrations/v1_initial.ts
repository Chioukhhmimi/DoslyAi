export const migration_v1 = {
  version: 1,
  up: [
    `CREATE TABLE IF NOT EXISTS profiles (
       id TEXT PRIMARY KEY NOT NULL,
       name TEXT NOT NULL,
       date_of_birth TEXT,
       relationship TEXT,
       avatar_uri TEXT,
       created_at TEXT NOT NULL
     )`,
    `CREATE TABLE IF NOT EXISTS medications (
       id TEXT PRIMARY KEY NOT NULL,
       profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
       name TEXT NOT NULL,
       dosage TEXT NOT NULL,
       type TEXT NOT NULL,
       schedule TEXT NOT NULL,
       start_date TEXT NOT NULL,
       end_date TEXT,
       notes TEXT,
       prescription_image_uri TEXT,
       created_at TEXT NOT NULL
     )`,
    `CREATE TABLE IF NOT EXISTS intake_records (
       id TEXT PRIMARY KEY NOT NULL,
       medication_id TEXT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
       profile_id TEXT NOT NULL,
       scheduled_at TEXT NOT NULL,
       taken_at TEXT,
       skipped INTEGER DEFAULT 0
     )`,
    `CREATE TABLE IF NOT EXISTS settings (
       key TEXT PRIMARY KEY NOT NULL,
       value TEXT NOT NULL
     )`,
  ],
};
