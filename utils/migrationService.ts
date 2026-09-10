import { userRef, firestore } from '@utils/firebase';
import { getDatabase } from '@db/database';

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

  const batch = firestore().batch();
  const base = userRef(uid);

  batch.set(base.collection('account').doc('data'), {
    language: language ?? 'fr',
    onboardingComplete: onboardingComplete === 'true',
    notificationsEnabled: notificationsEnabled !== 'false',
    quietHoursEnabled: quietHoursEnabled === 'true',
    quietHoursStart: quietHoursStart ?? '22:00',
    quietHoursEnd: quietHoursEnd ?? '07:00',
    biometricLock: biometricLock === 'true',
    activeProfileId: activeProfileId ?? profiles[0]?.id ?? null,
    createdAt: new Date().toISOString(),
  });

  for (const profile of profiles) {
    batch.set(base.collection('profiles').doc(profile.id), profile);
  }

  for (const med of medications) {
    batch.set(base.collection('medications').doc(med.id), med);
  }

  for (const record of intakeRecords) {
    batch.set(base.collection('intake_records').doc(record.id), record);
  }

  await batch.commit();
}
