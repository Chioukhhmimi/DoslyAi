import { create } from 'zustand';
import {
  dbGetAllProfiles,
  dbInsertProfile,
  dbUpdateProfile,
  dbDeleteProfile,
} from '@db/models/profileModel';
import { dbGetSetting, dbSetSetting } from '@db/models/settingsModel';

export interface Profile {
  id: string;
  name: string;
  dateOfBirth?: string;
  relationship?: string;
  avatarUri?: string;
  bloodType?: string;
  weight?: number;
  height?: number;
  allergies?: string[];
  conditions?: string[];
  doctorName?: string;
  doctorPhone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  createdAt: string;
}

interface ProfileState {
  profiles: Profile[];
  activeProfileId: string | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  addProfile: (profile: Omit<Profile, 'id' | 'createdAt'>) => void;
  updateProfile: (id: string, data: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfileId: null,
  hydrated: false,

  hydrate: async () => {
    const profiles = await dbGetAllProfiles();
    const activeProfileId = await dbGetSetting('activeProfileId');
    set({ profiles, activeProfileId, hydrated: true });
  },

  addProfile: (data) => {
    const newProfile: Profile = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const activeProfileId = state.activeProfileId ?? newProfile.id;
      dbInsertProfile(newProfile);
      dbSetSetting('activeProfileId', activeProfileId);
      return { profiles: [...state.profiles, newProfile], activeProfileId };
    });
  },

  updateProfile: (id, data) => {
    set((state) => {
      dbUpdateProfile(id, data);
      return {
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...data } : p)),
      };
    });
  },

  deleteProfile: (id) => {
    set((state) => {
      dbDeleteProfile(id);
      const remaining = state.profiles.filter((p) => p.id !== id);
      const activeProfileId =
        state.activeProfileId === id ? (remaining[0]?.id ?? null) : state.activeProfileId;
      if (activeProfileId) dbSetSetting('activeProfileId', activeProfileId);
      return { profiles: remaining, activeProfileId };
    });
  },

  setActiveProfile: (id) => {
    dbSetSetting('activeProfileId', id);
    set({ activeProfileId: id });
  },
}));
