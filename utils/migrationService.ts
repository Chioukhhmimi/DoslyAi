import { userRef, firestore } from '@utils/firebase';
import { getDatabase } from '@db/database';

const CHUNK_SIZE = 499;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function commitInChunks(writes: Array<{ ref: any; data: object }>): Promise<void> {
  for (let i = 0; i < writes.length; i += CHUNK_SIZE) {
    const chunk = writes.slice(i, i + CHUNK_SIZE);
    const batch = firestore.batch();
    for (const { ref, data } of chunk) {
      batch.set(ref, data);
    }
    await batch.commit();
  }
}

export async function migrateLocalDataToFirestore(uid: string): Promise<void> {
  await getDatabase();

  const { dbGetAllProfiles } = await import('@db/models/profileModel');
  const { dbGetAllMedications, dbGetAllIntakeRecords } = await import('@db/models/medicationModel');
  const { dbGetSetting } = await import('@db/models/settingsModel');

  const [profiles, medications, intakeRecords] = await Promise.all([
    dbGetAllProfiles(),
    dbGetAllMedications(),
    dbGetAllIntakeRecords(),
  ]);

  const [language, onboardingComplete, notificationsEnabled, quietHoursEnabled,
    quietHoursStart, quietHoursEnd, biometricLock, activeProfileId] = await Promise.all([
    dbGetSetting('language'),
    dbGetSetting('onboardingComplete'),
    dbGetSetting('notificationsEnabled'),
    dbGetSetting('quietHoursEnabled'),
    dbGetSetting('quietHoursStart'),
    dbGetSetting('quietHoursEnd'),
    dbGetSetting('biometricLock'),
    dbGetSetting('activeProfileId'),
  ]);

  const base = userRef(uid);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const writes: Array<{ ref: any; data: object }> = [];

  writes.push({
    ref: base.collection('account').doc('data'),
    data: {
      language: language ?? 'fr',
      onboardingComplete: onboardingComplete === 'true',
      notificationsEnabled: notificationsEnabled !== 'false',
      quietHoursEnabled: quietHoursEnabled === 'true',
      quietHoursStart: quietHoursStart ?? '22:00',
      quietHoursEnd: quietHoursEnd ?? '07:00',
      biometricLock: biometricLock === 'true',
      activeProfileId: activeProfileId ?? profiles[0]?.id ?? null,
      createdAt: new Date().toISOString(),
    },
  });

  for (const profile of profiles) {
    writes.push({ ref: base.collection('profiles').doc(profile.id), data: profile });
  }

  for (const med of medications) {
    writes.push({ ref: base.collection('medications').doc(med.id), data: med });
  }

  for (const record of intakeRecords) {
    writes.push({ ref: base.collection('intake_records').doc(record.id), data: record });
  }

  await commitInChunks(writes);
}

export async function deleteAllUserFirestoreData(uid: string): Promise<void> {
  const base = userRef(uid);
  const batch = firestore.batch();

  const [profilesSnap, medsSnap, intakeSnap] = await Promise.all([
    base.collection('profiles').get(),
    base.collection('medications').get(),
    base.collection('intake_records').get(),
  ]);

  for (const doc of profilesSnap.docs) batch.delete(doc.ref);
  for (const doc of medsSnap.docs) batch.delete(doc.ref);
  for (const doc of intakeSnap.docs) batch.delete(doc.ref);
  batch.delete(base.collection('account').doc('data'));

  await batch.commit();
}
