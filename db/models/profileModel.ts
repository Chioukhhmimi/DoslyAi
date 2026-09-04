import { getDatabase } from '../database';
import type { Profile } from '@store/profileStore';

export async function dbInsertProfile(profile: Profile): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO profiles
       (id, name, date_of_birth, relationship, avatar_uri,
        blood_type, weight, height, allergies, conditions,
        doctor_name, doctor_phone, emergency_contact, emergency_phone,
        medical_notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profile.id, profile.name,
      profile.dateOfBirth ?? null, profile.relationship ?? null, profile.avatarUri ?? null,
      profile.bloodType ?? null,
      profile.weight ?? null, profile.height ?? null,
      profile.allergies ? JSON.stringify(profile.allergies) : null,
      profile.conditions ? JSON.stringify(profile.conditions) : null,
      profile.doctorName ?? null, profile.doctorPhone ?? null,
      profile.emergencyContact ?? null, profile.emergencyPhone ?? null,
      profile.medicalNotes ?? null,
      profile.createdAt,
    ]
  );
}

export async function dbUpdateProfile(id: string, data: Partial<Profile>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined)             { fields.push('name = ?');              values.push(data.name); }
  if (data.dateOfBirth !== undefined)      { fields.push('date_of_birth = ?');     values.push(data.dateOfBirth ?? null); }
  if (data.relationship !== undefined)     { fields.push('relationship = ?');      values.push(data.relationship ?? null); }
  if (data.avatarUri !== undefined)        { fields.push('avatar_uri = ?');        values.push(data.avatarUri ?? null); }
  if (data.bloodType !== undefined)        { fields.push('blood_type = ?');        values.push(data.bloodType ?? null); }
  if (data.weight !== undefined)           { fields.push('weight = ?');            values.push(data.weight ?? null); }
  if (data.height !== undefined)           { fields.push('height = ?');            values.push(data.height ?? null); }
  if (data.allergies !== undefined)        { fields.push('allergies = ?');         values.push(data.allergies ? JSON.stringify(data.allergies) : null); }
  if (data.conditions !== undefined)       { fields.push('conditions = ?');        values.push(data.conditions ? JSON.stringify(data.conditions) : null); }
  if (data.doctorName !== undefined)       { fields.push('doctor_name = ?');       values.push(data.doctorName ?? null); }
  if (data.doctorPhone !== undefined)      { fields.push('doctor_phone = ?');      values.push(data.doctorPhone ?? null); }
  if (data.emergencyContact !== undefined) { fields.push('emergency_contact = ?'); values.push(data.emergencyContact ?? null); }
  if (data.emergencyPhone !== undefined)   { fields.push('emergency_phone = ?');   values.push(data.emergencyPhone ?? null); }
  if (data.medicalNotes !== undefined)     { fields.push('medical_notes = ?');     values.push(data.medicalNotes ?? null); }

  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function dbDeleteProfile(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM profiles WHERE id = ?', [id]);
}

export async function dbGetAllProfiles(): Promise<Profile[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string; name: string; date_of_birth: string | null;
    relationship: string | null; avatar_uri: string | null;
    blood_type: string | null; weight: number | null; height: number | null;
    allergies: string | null; conditions: string | null;
    doctor_name: string | null; doctor_phone: string | null;
    emergency_contact: string | null; emergency_phone: string | null;
    medical_notes: string | null; created_at: string;
  }>('SELECT * FROM profiles ORDER BY created_at ASC');

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    dateOfBirth:       r.date_of_birth ?? undefined,
    relationship:      r.relationship ?? undefined,
    avatarUri:         r.avatar_uri ?? undefined,
    bloodType:         r.blood_type ?? undefined,
    weight:            r.weight ?? undefined,
    height:            r.height ?? undefined,
    allergies:         r.allergies ? JSON.parse(r.allergies) : undefined,
    conditions:        r.conditions ? JSON.parse(r.conditions) : undefined,
    doctorName:        r.doctor_name ?? undefined,
    doctorPhone:       r.doctor_phone ?? undefined,
    emergencyContact:  r.emergency_contact ?? undefined,
    emergencyPhone:    r.emergency_phone ?? undefined,
    medicalNotes:      r.medical_notes ?? undefined,
    createdAt:         r.created_at,
  }));
}
