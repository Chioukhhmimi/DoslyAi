import { create } from 'zustand';
import type { QueryDocumentSnapshot, DocumentData } from '@react-native-firebase/firestore';
import { userRef } from '@utils/firebase';

export type FrequencyType = 'daily' | 'weekly' | 'interval' | 'pattern';
export type MedicationType = 'pill' | 'syrup' | 'injection' | 'supplement' | 'other';

export interface MedicationSchedule {
  times: string[];
  frequency: FrequencyType;
  daysOfWeek?: number[];
  intervalDays?: number;
  pattern?: number[];
}

export interface Medication {
  id: string;
  profileId: string;
  name: string;
  doseQuantity: number;
  unit: string;
  type: MedicationType;
  schedule: MedicationSchedule;
  startDate: string;
  endDate?: string;
  notes?: string;
  prescriptionImageUri?: string;
  paused: boolean;
  pillColor?: string;
  refillReminderEnabled?: boolean;
  refillReminderDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeRecord {
  id: string;
  medicationId: string;
  profileId: string;
  scheduledAt: string;
  takenAt?: string;
  skipped?: boolean;
  notes?: string;
}

export type NewMedication = Omit<Medication, 'id' | 'createdAt' | 'updatedAt' | 'paused'>;

interface MedicationState {
  medications: Medication[];
  intakeHistory: IntakeRecord[];
  hydrated: boolean;

  hydrate: (uid: string) => Promise<void>;
  addMedication: (uid: string, med: NewMedication) => Promise<void>;
  updateMedication: (uid: string, id: string, data: Partial<Medication>) => Promise<void>;
  deleteMedication: (uid: string, id: string) => Promise<void>;
  recordIntake: (uid: string, record: Omit<IntakeRecord, 'id'>) => Promise<void>;
  getMedicationsForProfile: (profileId: string) => Medication[];
  reset: () => void;
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [],
  intakeHistory: [],
  hydrated: false,

  hydrate: async (uid) => {
    try {
      const [medsSnap, intakeSnap] = await Promise.all([
        userRef(uid).collection('medications').get(),
        userRef(uid).collection('intake_records').get(),
      ]);
      const medications = medsSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.data() as Medication);
      const intakeHistory = intakeSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.data() as IntakeRecord);
      set({ medications, intakeHistory, hydrated: true });
    } catch (e) {
      console.error('[MedicationStore] hydrate failed:', e);
    }
  },

  addMedication: async (uid, med) => {
    try {
      const now = new Date().toISOString();
      const newMed: Medication = {
        ...med,
        id: crypto.randomUUID(),
        paused: false,
        createdAt: now,
        updatedAt: now,
      };
      await userRef(uid).collection('medications').doc(newMed.id).set(newMed);
      set((state) => ({ medications: [...state.medications, newMed] }));
    } catch (e) {
      console.error('[MedicationStore] addMedication failed:', e);
    }
  },

  updateMedication: async (uid, id, data) => {
    try {
      const patch = { ...data, updatedAt: new Date().toISOString() };
      await userRef(uid).collection('medications').doc(id).update(patch);
      set((state) => ({
        medications: state.medications.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      }));
    } catch (e) {
      console.error('[MedicationStore] updateMedication failed:', e);
    }
  },

  deleteMedication: async (uid, id) => {
    try {
      await userRef(uid).collection('medications').doc(id).delete();
      set((state) => ({ medications: state.medications.filter((m) => m.id !== id) }));
    } catch (e) {
      console.error('[MedicationStore] deleteMedication failed:', e);
    }
  },

  recordIntake: async (uid, record) => {
    try {
      const newRecord: IntakeRecord = { ...record, id: crypto.randomUUID() };
      await userRef(uid).collection('intake_records').doc(newRecord.id).set(newRecord);
      set((state) => ({ intakeHistory: [...state.intakeHistory, newRecord] }));
    } catch (e) {
      console.error('[MedicationStore] recordIntake failed:', e);
    }
  },

  getMedicationsForProfile: (profileId) =>
    get().medications.filter((m) => m.profileId === profileId),

  reset: () => set({ medications: [], intakeHistory: [], hydrated: false }),
}));
