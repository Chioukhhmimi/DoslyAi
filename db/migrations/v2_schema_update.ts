export const migration_v2 = {
  version: 2,
  up: [
    `PRAGMA foreign_keys = OFF`,
    `CREATE TABLE medications_new (
       id TEXT PRIMARY KEY NOT NULL,
       profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
       name TEXT NOT NULL,
       dose_quantity REAL NOT NULL DEFAULT 1,
       unit TEXT NOT NULL DEFAULT 'comprimé(s)',
       type TEXT NOT NULL,
       schedule TEXT NOT NULL,
       start_date TEXT NOT NULL,
       end_date TEXT,
       notes TEXT,
       prescription_image_uri TEXT,
       paused INTEGER NOT NULL DEFAULT 0,
       created_at TEXT NOT NULL,
       updated_at TEXT NOT NULL
     )`,
    // Migrate existing data: old dosage string becomes unit, dose_quantity defaults to 1
    `INSERT INTO medications_new (id, profile_id, name, dose_quantity, unit, type, schedule, start_date, end_date, notes, prescription_image_uri, paused, created_at, updated_at)
     SELECT id, profile_id, name, 1, dosage, type, schedule, start_date, end_date, notes, prescription_image_uri, 0, created_at, created_at FROM medications`,
    `DROP TABLE medications`,
    `ALTER TABLE medications_new RENAME TO medications`,
    `PRAGMA foreign_keys = ON`,
  ],
};
