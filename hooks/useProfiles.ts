import { useProfileStore, Profile } from '@store/profileStore';
import { useAuthStore } from '@store/authStore';

export function useProfiles() {
  const {
    profiles,
    activeProfileId,
    addProfile: _addProfile,
    updateProfile: _updateProfile,
    deleteProfile: _deleteProfile,
    setActiveProfile: _setActiveProfile,
  } = useProfileStore();
  const user = useAuthStore((s) => s.user);

  const activeProfile: Profile | null = profiles.find((p) => p.id === activeProfileId) ?? null;

  function addProfile(data: Parameters<typeof _addProfile>[1]) {
    _addProfile(user!.uid, data);
  }
  function updateProfile(id: string, data: Parameters<typeof _updateProfile>[2]) {
    _updateProfile(user!.uid, id, data);
  }
  function deleteProfile(id: string) {
    _deleteProfile(user!.uid, id);
  }
  function setActiveProfile(id: string) {
    _setActiveProfile(user!.uid, id);
  }

  return {
    profiles,
    activeProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    hasProfiles: profiles.length > 0,
  };
}
