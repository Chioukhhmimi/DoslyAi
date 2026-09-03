import { getDatabase } from '../database';
import type { Profile } from '@store/profileStore';

export async function dbInsertProfile(profile: Profile): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO profiles (id, name, date_of_birth, relationship, avatar_uri, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [profile.id, profile.name, profile.dateOfBirth ?? null, profile.relationship ?? null, profile.avatarUri ?? null, profile.createdAt]
  );
}

export async function dbUpdateProfile(id: string, data: Partial<Profile>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (data.name !== undefined)         { fields.push('name = ?');          values.push(data.name); }
  if (data.dateOfBirth !== undefined)  { fields.push('date_of_birth = ?'); values.push(data.dateOfBirth ?? null); }
  if (data.relationship !== undefined) { fields.push('relationship = ?');  values.push(data.relationship ?? null); }
  if (data.avatarUri !== undefined)    { fields.push('avatar_uri = ?');    values.push(data.avatarUri ?? null); }

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
    relationship: string | null; avatar_uri: string | null; created_at: string;
  }>('SELECT * FROM profiles ORDER BY created_at ASC');

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    dateOfBirth: r.date_of_birth ?? undefined,
    relationship: r.relationship ?? undefined,
    avatarUri: r.avatar_uri ?? undefined,
    createdAt: r.created_at,
  }));
}
