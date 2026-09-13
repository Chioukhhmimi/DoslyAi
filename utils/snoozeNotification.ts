import { Medication } from '@store/medicationStore';
import i18n from '../i18n';

export async function snoozeDoseNotification(
  medication: Medication,
  scheduledDate: Date,
  minutes: number,
): Promise<void> {
  let Notifications: typeof import('expo-notifications');
  try {
    Notifications = await import('expo-notifications');
  } catch {
    return; // expo-notifications unavailable in Expo Go
  }

  const identifier = `med:${medication.id}:${scheduledDate.getTime()}`;
  const all = await Notifications.getAllScheduledNotificationsAsync();
  if (all.find((n) => n.identifier === identifier)) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
  const newTime = new Date(Date.now() + minutes * 60 * 1000);
  await Notifications.scheduleNotificationAsync({
    identifier: `med:${medication.id}:snooze:${newTime.getTime()}`,
    content: {
      title: `💊 ${medication.name}`,
      body: `${medication.doseQuantity} ${medication.unit} — ${i18n.t('medication.confirm.snoozeTitle')}`,
      data: {
        medicationId: medication.id,
        scheduledAt: scheduledDate.toISOString(),
      },
    },
    trigger: { type: 'date', date: newTime } as any,
  });
}
