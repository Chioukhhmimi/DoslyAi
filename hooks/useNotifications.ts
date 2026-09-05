import Constants from 'expo-constants';
import { Medication } from '@store/medicationStore';
import { getNextDoses } from '@utils/scheduleEngine';
import { useSettingsStore } from '@store/settingsStore';

// expo-notifications crashes Expo Go on import (SDK 53+), so all usage is dynamic
const isExpoGo = Constants.appOwnership === 'expo';

function isInQuietHours(date: Date, start: string, end: string): boolean {
  const h = date.getHours();
  const m = date.getMinutes();
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const minutes = h * 60 + m;
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  if (startMin > endMin) return minutes >= startMin || minutes < endMin;
  return minutes >= startMin && minutes < endMin;
}

export async function requestPermission(): Promise<boolean> {
  if (isExpoGo) return false;
  try {
    const N = await import('expo-notifications');
    const { status } = await N.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleNotificationsForMedication(medication: Medication): Promise<void> {
  if (isExpoGo) return;
  try {
    const N = await import('expo-notifications');
    const { quietHoursEnabled, quietHoursStart, quietHoursEnd } = useSettingsStore.getState();
    const doses = getNextDoses(medication, new Date(), 30);

    await Promise.allSettled(
      doses
        .filter((scheduledAt) => {
          if (!quietHoursEnabled) return true;
          return !isInQuietHours(scheduledAt, quietHoursStart, quietHoursEnd);
        })
        .map((scheduledAt) =>
          N.scheduleNotificationAsync({
            identifier: `${medication.id}_${scheduledAt.getTime()}`,
            content: {
              title: `💊 ${medication.name}`,
              body: `${medication.doseQuantity} ${medication.unit}`,
              data: { medicationId: medication.id, scheduledAt: scheduledAt.toISOString() },
            },
            trigger: { type: 'date' as const, date: scheduledAt },
          }),
        ),
    );

    // Refill reminder: one notification N days before endDate at 09:00
    if (medication.refillReminderEnabled && medication.endDate && medication.refillReminderDays) {
      const endDate = new Date(medication.endDate + 'T09:00:00');
      const reminderDate = new Date(endDate);
      reminderDate.setDate(reminderDate.getDate() - medication.refillReminderDays);
      if (reminderDate > new Date()) {
        await N.scheduleNotificationAsync({
          identifier: `refill_${medication.id}`,
          content: {
            title: `💊 ${medication.name}`,
            body: 'Il est temps de renouveler votre ordonnance.',
            data: { medicationId: medication.id, scheduledAt: medication.endDate },
          },
          trigger: { type: 'date' as const, date: reminderDate },
        });
      }
    }
  } catch {
    // Notifications not available (web, permission denied, etc.)
  }
}

export async function cancelNotificationsForMedication(medicationId: string): Promise<void> {
  if (isExpoGo) return;
  try {
    const N = await import('expo-notifications');
    const scheduled = await N.getAllScheduledNotificationsAsync();
    await Promise.allSettled(
      scheduled
        .filter((n) => n.identifier.startsWith(medicationId))
        .map((n) => N.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    // Notifications not available
  }
}

export async function snoozeDoseNotification(
  medication: Medication,
  scheduledDate: Date,
  minutes: number,
): Promise<void> {
  if (isExpoGo) return;
  try {
    const N = await import('expo-notifications');
    const identifier = `${medication.id}_${scheduledDate.getTime()}`;
    const all = await N.getAllScheduledNotificationsAsync();
    if (all.find((n) => n.identifier === identifier)) {
      await N.cancelScheduledNotificationAsync(identifier);
    }
    const newTime = new Date(Date.now() + minutes * 60 * 1000);
    await N.scheduleNotificationAsync({
      identifier: `${medication.id}_snooze_${newTime.getTime()}`,
      content: {
        title: `💊 ${medication.name}`,
        body: `${medication.doseQuantity} ${medication.unit} — rappel`,
        data: { medicationId: medication.id, scheduledAt: scheduledDate.toISOString() },
      },
      trigger: { type: 'date' as const, date: newTime },
    });
  } catch {
    // Notifications not available
  }
}
