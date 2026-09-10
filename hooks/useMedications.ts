import { useMedicationStore, Medication, IntakeRecord } from '@store/medicationStore';
import { useProfileStore } from '@store/profileStore';
import { useAuthStore } from '@store/authStore';
import {
  isMedicationActiveOnDate,
  getScheduledDosesForDay,
  computeAdherence,
} from '@utils/scheduleEngine';
import { isSameDay } from '@utils/dateHelpers';

export function useMedications() {
  const {
    medications,
    intakeHistory,
    addMedication: _addMedication,
    updateMedication: _updateMedication,
    deleteMedication: _deleteMedication,
    recordIntake: _recordIntake,
  } = useMedicationStore();
  const { activeProfileId } = useProfileStore();
  const user = useAuthStore((s) => s.user);

  function addMedication(med: Parameters<typeof _addMedication>[1]) {
    _addMedication(user!.uid, med);
  }
  function updateMedication(id: string, data: Parameters<typeof _updateMedication>[2]) {
    _updateMedication(user!.uid, id, data);
  }
  function deleteMedication(id: string) {
    _deleteMedication(user!.uid, id);
  }
  function recordIntake(record: Parameters<typeof _recordIntake>[1]) {
    _recordIntake(user!.uid, record);
  }

  const profileMedications = medications.filter((m) => m.profileId === activeProfileId);

  const today = new Date();

  const todayMedications = profileMedications.filter(
    (m) =>
      !m.paused &&
      isMedicationActiveOnDate(m, today) &&
      getScheduledDosesForDay(m, today).length > 0,
  );

  const profileIntakeHistory = intakeHistory.filter((r) => r.profileId === activeProfileId);

  function getIntakeForDose(medicationId: string, scheduledAt: string): IntakeRecord | undefined {
    return profileIntakeHistory.find(
      (r) => r.medicationId === medicationId && r.scheduledAt === scheduledAt,
    );
  }

  const adherenceRate =
    profileMedications.length === 0
      ? 100
      : Math.round(
          profileMedications.reduce(
            (sum, m) => sum + computeAdherence(m, profileIntakeHistory, 30),
            0,
          ) / profileMedications.length,
        );

  return {
    medications: profileMedications,
    todayMedications,
    intakeHistory: profileIntakeHistory,
    addMedication,
    updateMedication,
    deleteMedication,
    recordIntake,
    getIntakeForDose,
    adherenceRate,
  };
}
