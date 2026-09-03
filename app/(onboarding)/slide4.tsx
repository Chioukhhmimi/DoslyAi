import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { OnboardingSlide } from '@components/onboarding/OnboardingSlide';
import { useSettingsStore } from '@store/settingsStore';
import { requestPermission } from '@hooks/useNotifications';

export default function Slide4() {
  const { t } = useTranslation();
  const router = useRouter();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  async function handleActivate() {
    await requestPermission();
    completeOnboarding();
    router.replace('/profile/new');
  }

  function handleSkip() {
    completeOnboarding();
    router.replace('/profile/new');
  }

  return (
    <OnboardingSlide
      title={t('onboarding.slide4.title')}
      description={t('onboarding.slide4.description')}
      illustrationColor="#EFF6FF"
      onNext={handleActivate}
      onSkip={handleSkip}
      isLast
      currentSlide={4}
      totalSlides={4}
    />
  );
}
