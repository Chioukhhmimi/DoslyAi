import { create } from 'zustand';
import {
  dbGetAllMedications,
  dbInsertMedication,
  dbUpdateMedication,
  dbDeleteMedication,
  dbGetAllIntakeRecords,
  dbInsertIntakeRecord,
} from '@db/models/medicationModel';

export type FrequencyType = 'daily' | 'weekly' | 'interval' | 'pattern';
export type MedicationType = 'pill' | 'syrup' | 'injection' | 'supplement' | 'other';

export interface MedicationSchedule {
  times: string[];
  frequency: FrequencyType;
  daysOfWeek?: number[];   // weekly: 0=Sun … 6=Sat
  intervalDays?: number;   // interval: every N days from startDate
  pattern?: number[];      // pattern: repeating bit array e.g. [1,1,0]
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

  hydrate: () => Promise<void>;
  addMedication: (med: NewMedication) => void;
  updateMedication: (id: string, data: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  recordIntake: (record: Omit<IntakeRecord, 'id'>) => void;
  getMedicationsForProfile: (profileId: string) => Medication[];
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [],
  intakeHistory: [],
  hydrated: false,

  hydrate: async () => {
    const [medications, intakeHistory] = await Promise.all([
      dbGetAllMedications(),
      dbGetAllIntakeRecords(),
    ]);
    set({ medications, intakeHistory, hydrated: true });
  },

  addMedication: (med) => {
    const now = new Date().toISOString();
    const newMed: Medication = { ...med, id: Date.now().toString(), paused: false, createdAt: now, updatedAt: now };
    dbInsertMedication(newMed);
    set((state) => ({ medications: [...state.medications, newMed] }));
  },

  updateMedication: (id, data) => {
    const patch = { ...data, updatedAt: new Date().toISOString() };
    dbUpdateMedication(id, patch);
    set((state) => ({
      medications: state.medications.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  },

  deleteMedication: (id) => {
    dbDeleteMedication(id);
    set((state) => ({ medications: state.medications.filter((m) => m.id !== id) }));
  },

  recordIntake: (record) => {
    const newRecord: IntakeRecord = { ...record, id: Date.now().toString() };
    dbInsertIntakeRecord(newRecord);
    set((state) => ({ intakeHistory: [...state.intakeHistory, newRecord] }));
  },

  getMedicationsForProfile: (profileId) =>
    get().medications.filter((m) => m.profileId === profileId),
}));
