export const migration_v4 = {
  version: 4,
  up: [
    `ALTER TABLE profiles ADD COLUMN blood_type TEXT`,
    `ALTER TABLE profiles ADD COLUMN weight REAL`,
    `ALTER TABLE profiles ADD COLUMN height REAL`,
    `ALTER TABLE profiles ADD COLUMN allergies TEXT`,
    `ALTER TABLE profiles ADD COLUMN conditions TEXT`,
    `ALTER TABLE profiles ADD COLUMN doctor_name TEXT`,
    `ALTER TABLE profiles ADD COLUMN doctor_phone TEXT`,
    `ALTER TABLE profiles ADD COLUMN emergency_contact TEXT`,
    `ALTER TABLE profiles ADD COLUMN emergency_phone TEXT`,
    `ALTER TABLE profiles ADD COLUMN medical_notes TEXT`,
    `ALTER TABLE medications ADD COLUMN refill_reminder_enabled INTEGER DEFAULT 0`,
    `ALTER TABLE medications ADD COLUMN refill_reminder_days INTEGER DEFAULT 7`,
  ],
};
