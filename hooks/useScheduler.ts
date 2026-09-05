import { Medication, IntakeRecord } from '@store/medicationStore';
import { useMedications } from '@hooks/useMedications';
import { getNextDoses, getScheduledDosesForDay } from '@utils/scheduleEngine';
import { isMissed } from '@utils/dateHelpers';

export function useScheduler() {
  const { todayMedications, intakeHistory, getIntakeForDose } = useMedications();

  function getUpcomingDoses(count: number): Array<{
    medication: Medication;
    scheduledAt: Date;
    intakeRecord: IntakeRecord | undefined;
  }> {
    const now = new Date();
    const all: Array<{
      medication: Medication;
      scheduledAt: Date;
      intakeRecord: IntakeRecord | undefined;
    }> = [];

    for (const med of todayMedications) {
      const next = getNextDoses(med, now, count);
      for (const scheduledAt of next) {
        all.push({
          medication: med,
          scheduledAt,
          intakeRecord: getIntakeForDose(med.id, scheduledAt.toISOString()),
        });
      }
    }

    return all.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()).slice(0, count);
  }

  const todaySummary = (() => {
    const today = new Date();
    let total = 0;
    let taken = 0;
    let missed = 0;
    let pending = 0;

    for (const med of todayMedications) {
      const doses = getScheduledDosesForDay(med, today);
      for (const dose of doses) {
        total++;
        const record = getIntakeForDose(med.id, dose.toISOString());
        if (record?.takenAt) {
          taken++;
        } else if (record?.skipped || isMissed(dose.toISOString(), record?.takenAt)) {
          missed++;
        } else {
          pending++;
        }
      }
    }

    return { total, taken, missed, pending };
  })();

  const streak = (() => {
    const today = new Date();
    let days = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);

      let allTaken = true;
      let hasDoses = false;

      for (const med of todayMedications) {
        const doses = getScheduledDosesForDay(med, d);
        for (const dose of doses) {
          hasDoses = true;
          const record = getIntakeForDose(med.id, dose.toISOString());
          if (!record?.takenAt) { allTaken = false; break; }
        }
        if (!allTaken) break;
      }

      if (!hasDoses) break;
      if (!allTaken) break;
      days++;
    }
    return days;
  })();

  return { getUpcomingDoses, todaySummary, streak };
}
