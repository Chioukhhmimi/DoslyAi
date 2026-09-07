import { Medication, IntakeRecord } from '@store/medicationStore';
import { startOfDay, addDays, getDayOfWeek, parseHHmm, isSameDay } from '@utils/dateHelpers';

function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);
}

export function getScheduledDosesForDay(medication: Medication, date: Date): Date[] {
  if (!isMedicationActiveOnDate(medication, date)) return [];

  const { schedule } = medication;
  const day = startOfDay(date);

  if (schedule.frequency === 'weekly') {
    const dow = getDayOfWeek(date);
    if (!schedule.daysOfWeek?.includes(dow)) return [];
  }

  if (schedule.frequency === 'interval') {
    const start = new Date(medication.startDate + 'T00:00:00');
    const diff = daysBetween(start, date);
    if (diff < 0 || diff % (schedule.intervalDays ?? 1) !== 0) return [];
  }

  if (schedule.frequency === 'pattern') {
    const pattern = schedule.pattern ?? [1];
    const start = new Date(medication.startDate + 'T00:00:00');
    const diff = daysBetween(start, date);
    if (diff < 0 || pattern[diff % pattern.length] !== 1) return [];
  }

  return schedule.times.map((t) => {
    const { hours, minutes } = parseHHmm(t);
    const d = new Date(day);
    d.setHours(hours, minutes, 0, 0);
    return d;
  });
}

export function getNextDoses(medication: Medication, fromDate: Date, count: number): Date[] {
  const results: Date[] = [];
  let current = new Date(fromDate);
  let iterations = 0;

  while (results.length < count && iterations < 365) {
    const doses = getScheduledDosesForDay(medication, current);
    for (const dose of doses) {
      if (dose > fromDate && results.length < count) results.push(dose);
    }
    current = addDays(current, 1);
    iterations++;
  }

  return results;
}

export function isMedicationActiveOnDate(medication: Medication, date: Date): boolean {
  const start = new Date(medication.startDate + 'T00:00:00');
  if (date < startOfDay(start)) return false;
  if (medication.endDate) {
    const end = new Date(medication.endDate + 'T23:59:59');
    if (date > end) return false;
  }
  return true;
}

export function generateTodayIntakeRecords(
  medication: Medication,
  existingRecords: IntakeRecord[],
): Omit<IntakeRecord, 'id'>[] {
  const today = new Date();
  const doses = getScheduledDosesForDay(medication, today);

  return doses
    .filter((dose) => {
      const isoStr = dose.toISOString();
      return !existingRecords.some(
        (r) => r.medicationId === medication.id && r.scheduledAt === isoStr,
      );
    })
    .map((dose) => ({
      medicationId: medication.id,
      profileId: medication.profileId,
      scheduledAt: dose.toISOString(),
    }));
}

export function computeAdherence(
  medication: Medication,
  intakeRecords: IntakeRecord[],
  days: number,
): number {
  const today = new Date();
  let expected = 0;
  let taken = 0;

  for (let i = days - 1; i >= 0; i--) {
    const day = addDays(today, -i);
    const doses = getScheduledDosesForDay(medication, day);
    expected += doses.length;

    for (const dose of doses) {
      const record = intakeRecords.find(
        (r) =>
          r.medicationId === medication.id &&
          isSameDay(r.scheduledAt, dose) &&
          r.takenAt &&
          !r.skipped,
      );
      if (record) taken++;
    }
  }

  if (expected === 0) return 100;
  return Math.round((taken / expected) * 100);
}
