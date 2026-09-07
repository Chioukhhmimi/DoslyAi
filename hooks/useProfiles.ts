import { useProfileStore, Profile } from '@store/profileStore';

export function useProfiles() {
  const { profiles, activeProfileId, addProfile, updateProfile, deleteProfile, setActiveProfile } =
    useProfileStore();

  const activeProfile: Profile | null = profiles.find((p) => p.id === activeProfileId) ?? null;

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
