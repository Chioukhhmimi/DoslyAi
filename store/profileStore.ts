import { create } from 'zustand';
import type { QueryDocumentSnapshot, DocumentData } from '@react-native-firebase/firestore';
import { userRef } from '@utils/firebase';

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

  hydrate: (uid: string) => Promise<void>;
  addProfile: (uid: string, data: Omit<Profile, 'id' | 'createdAt'>) => Promise<void>;
  updateProfile: (uid: string, id: string, data: Partial<Profile>) => Promise<void>;
  deleteProfile: (uid: string, id: string) => Promise<void>;
  setActiveProfile: (uid: string, id: string) => Promise<void>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfileId: null,
  hydrated: false,

  hydrate: async (uid) => {
    try {
      const snap = await userRef(uid).collection('profiles').get();
      const profiles = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => d.data() as Profile);

      const accountSnap = await userRef(uid).collection('account').doc('data').get();
      const activeProfileId: string | null =
        (accountSnap.data()?.activeProfileId as string) ?? profiles[0]?.id ?? null;

      set({ profiles, activeProfileId, hydrated: true });

      const currentActiveId = get().activeProfileId;
      if (currentActiveId && !profiles.find((p: Profile) => p.id === currentActiveId)) {
        set({ activeProfileId: profiles[0]?.id ?? null });
      }
    } catch (e) {
      console.error('[ProfileStore] hydrate failed:', e);
    }
  },

  addProfile: async (uid, data) => {
    try {
      const newProfile: Profile = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      await userRef(uid).collection('profiles').doc(newProfile.id).set(newProfile);
      const activeProfileId = get().activeProfileId ?? newProfile.id;
      await userRef(uid)
        .collection('account')
        .doc('data')
        .set({ activeProfileId }, { merge: true });
      set((state) => ({ profiles: [...state.profiles, newProfile], activeProfileId }));
    } catch (e) {
      console.error('[ProfileStore] addProfile failed:', e);
    }
  },

  updateProfile: async (uid, id, data) => {
    try {
      await userRef(uid).collection('profiles').doc(id).update(data);
      set((state) => ({
        profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...data } : p)),
      }));
    } catch (e) {
      console.error('[ProfileStore] updateProfile failed:', e);
    }
  },

  deleteProfile: async (uid, id) => {
    try {
      await userRef(uid).collection('profiles').doc(id).delete();
      const state = get();
      const remaining = state.profiles.filter((p) => p.id !== id);
      const activeProfileId =
        state.activeProfileId === id ? (remaining[0]?.id ?? null) : state.activeProfileId;
      if (activeProfileId) {
        await userRef(uid)
          .collection('account')
          .doc('data')
          .set({ activeProfileId }, { merge: true });
      }
      set({ profiles: remaining, activeProfileId });
    } catch (e) {
      console.error('[ProfileStore] deleteProfile failed:', e);
    }
  },

  setActiveProfile: async (uid, id) => {
    try {
      await userRef(uid)
        .collection('account')
        .doc('data')
        .set({ activeProfileId: id }, { merge: true });
      set({ activeProfileId: id });
    } catch (e) {
      console.error('[ProfileStore] setActiveProfile failed:', e);
    }
  },

  reset: () => set({ profiles: [], activeProfileId: null, hydrated: false }),
}));
