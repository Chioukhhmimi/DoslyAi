import { getDatabase } from '../database';
import type { Medication, IntakeRecord } from '@store/medicationStore';

export async function dbInsertMedication(med: Medication): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO medications
       (id, profile_id, name, dose_quantity, unit, type, schedule, start_date, end_date,
        notes, prescription_image_uri, paused, pill_color,
        refill_reminder_enabled, refill_reminder_days,
        created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      med.id,
      med.profileId,
      med.name,
      med.doseQuantity,
      med.unit,
      med.type,
      JSON.stringify(med.schedule),
      med.startDate,
      med.endDate ?? null,
      med.notes ?? null,
      med.prescriptionImageUri ?? null,
      med.paused ? 1 : 0,
      med.pillColor ?? null,
      med.refillReminderEnabled ? 1 : 0,
      med.refillReminderDays ?? 7,
      med.createdAt,
      med.updatedAt,
    ],
  );
}

export async function dbUpdateMedication(id: string, data: Partial<Medication>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.doseQuantity !== undefined) {
    fields.push('dose_quantity = ?');
    values.push(data.doseQuantity);
  }
  if (data.unit !== undefined) {
    fields.push('unit = ?');
    values.push(data.unit);
  }
  if (data.type !== undefined) {
    fields.push('type = ?');
    values.push(data.type);
  }
  if (data.schedule !== undefined) {
    fields.push('schedule = ?');
    values.push(JSON.stringify(data.schedule));
  }
  if (data.startDate !== undefined) {
    fields.push('start_date = ?');
    values.push(data.startDate);
  }
  if (data.endDate !== undefined) {
    fields.push('end_date = ?');
    values.push(data.endDate ?? null);
  }
  if (data.notes !== undefined) {
    fields.push('notes = ?');
    values.push(data.notes ?? null);
  }
  if (data.prescriptionImageUri !== undefined) {
    fields.push('prescription_image_uri = ?');
    values.push(data.prescriptionImageUri ?? null);
  }
  if (data.paused !== undefined) {
    fields.push('paused = ?');
    values.push(data.paused ? 1 : 0);
  }
  if (data.pillColor !== undefined) {
    fields.push('pill_color = ?');
    values.push(data.pillColor ?? null);
  }
  if (data.refillReminderEnabled !== undefined) {
    fields.push('refill_reminder_enabled = ?');
    values.push(data.refillReminderEnabled ? 1 : 0);
  }
  if (data.refillReminderDays !== undefined) {
    fields.push('refill_reminder_days = ?');
    values.push(data.refillReminderDays);
  }
  if (data.updatedAt !== undefined) {
    fields.push('updated_at = ?');
    values.push(data.updatedAt);
  }

  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE medications SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function dbDeleteMedication(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM medications WHERE id = ?', [id]);
}

export async function dbGetAllMedications(): Promise<Medication[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    profile_id: string;
    name: string;
    dose_quantity: number;
    unit: string;
    type: string;
    schedule: string;
    start_date: string;
    end_date: string | null;
    notes: string | null;
    prescription_image_uri: string | null;
    paused: number;
    pill_color: string | null;
    refill_reminder_enabled: number | null;
    refill_reminder_days: number | null;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM medications ORDER BY created_at ASC');

  return rows.map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    name: r.name,
    doseQuantity: r.dose_quantity,
    unit: r.unit,
    type: r.type as Medication['type'],
    schedule: JSON.parse(r.schedule),
    startDate: r.start_date,
    endDate: r.end_date ?? undefined,
    notes: r.notes ?? undefined,
    prescriptionImageUri: r.prescription_image_uri ?? undefined,
    paused: r.paused === 1,
    pillColor: r.pill_color ?? undefined,
    refillReminderEnabled: r.refill_reminder_enabled === 1,
    refillReminderDays: r.refill_reminder_days ?? 7,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function dbInsertIntakeRecord(record: IntakeRecord): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO intake_records (id, medication_id, profile_id, scheduled_at, taken_at, skipped, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      record.id,
      record.medicationId,
      record.profileId,
      record.scheduledAt,
      record.takenAt ?? null,
      record.skipped ? 1 : 0,
      record.notes ?? null,
    ],
  );
}

export async function dbGetAllIntakeRecords(): Promise<IntakeRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    medication_id: string;
    profile_id: string;
    scheduled_at: string;
    taken_at: string | null;
    skipped: number;
    notes: string | null;
  }>('SELECT * FROM intake_records ORDER BY scheduled_at DESC');

  return rows.map((r) => ({
    id: r.id,
    medicationId: r.medication_id,
    profileId: r.profile_id,
    scheduledAt: r.scheduled_at,
    takenAt: r.taken_at ?? undefined,
    skipped: r.skipped === 1,
    notes: r.notes ?? undefined,
  }));
}

export async function dbDeleteAllMedications(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM medications');
}

export async function dbDeleteAllIntakeRecords(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM intake_records');
}
