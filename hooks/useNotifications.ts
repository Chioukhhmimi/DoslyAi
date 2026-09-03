import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Medication } from '@store/medicationStore';
import { getNextDoses } from '@utils/scheduleEngine';
import { useSettingsStore } from '@store/settingsStore';

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
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleNotificationsForMedication(medication: Medication): Promise<void> {
  try {
    const { quietHoursEnabled, quietHoursStart, quietHoursEnd } = useSettingsStore.getState();
    const doses = getNextDoses(medication, new Date(), 30);

    await Promise.allSettled(
      doses
        .filter((scheduledAt) => {
          if (!quietHoursEnabled) return true;
          return !isInQuietHours(scheduledAt, quietHoursStart, quietHoursEnd);
        })
        .map((scheduledAt) =>
          Notifications.scheduleNotificationAsync({
            identifier: `${medication.id}_${scheduledAt.getTime()}`,
            content: {
              title: `💊 ${medication.name}`,
              body: `${medication.doseQuantity} ${medication.unit}`,
              data: { medicationId: medication.id, scheduledAt: scheduledAt.toISOString() },
            },
            trigger: { type: SchedulableTriggerInputTypes.DATE, date: scheduledAt },
          })
        )
    );
  } catch {
    // Notifications not available (web, permission denied, etc.)
  }
}

export async function cancelNotificationsForMedication(medicationId: string): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.allSettled(
      scheduled
        .filter((n) => n.identifier.startsWith(medicationId))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
    );
  } catch {
    // Notifications not available
  }
}

export async function snoozeDoseNotification(
  medication: Medication,
  scheduledDate: Date,
  minutes: number
): Promise<void> {
  try {
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
        data: { medicationId: medication.id, scheduledAt: scheduledDate.toISOString() },
      },
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: newTime },
    });
  } catch {
    // Notifications not available
  }
}
