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
    const all: Array<{ medication: Medication; scheduledAt: Date; intakeRecord: IntakeRecord | undefined }> = [];

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

    return all
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
      .slice(0, count);
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

  return { getUpcomingDoses, todaySummary };
}
