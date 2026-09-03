import { Medication } from '@store/medicationStore';

export async function snoozeDoseNotification(
  medication: Medication,
  scheduledDate: Date,
  minutes: number
): Promise<void> {
  let Notifications: typeof import('expo-notifications');
  try {
    Notifications = await import('expo-notifications');
  } catch {
    return; // expo-notifications unavailable in Expo Go
  }

  const identifier = `${medication.id}_${scheduledDate.getTime()}`;
  const all = await Notifications.getAllScheduledNotificationsAsync();
  if (all.find((n) => n.identifier === identifier)) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
  const newTime = new Date(Date.now() + minutes * 60 * 1000);
  await Notifications.scheduleNotificationAsync({
    identifier: `${medication.id}_snooze_${newTime.getTime()}`,
    content: {
      title: `💊 ${medication.name}`,
      body: `${medication.doseQuantity} ${medication.unit} — rappel`,
      data: {
        medicationId: medication.id,
        scheduledAt: scheduledDate.toISOString(),
      },
    },
    trigger: { date: newTime } as any,
  });
}
