import React from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingSlide } from '@components/onboarding/OnboardingSlide';
import { useSettingsStore } from '@store/settingsStore';

export default function Slide3() {
  const router = useRouter();
  const { t } = useTranslation();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  function handleSkip() {
    completeOnboarding();
    router.replace('/profile/new');
  }

  return (
    <OnboardingSlide
      title={t('onboarding.slide3.title')}
      description={t('onboarding.slide3.description')}
      illustrationColor="#DCFCE7"
      onNext={() => router.push('/(onboarding)/slide4')}
      onSkip={handleSkip}
      isLast={false}
      currentSlide={3}
      totalSlides={4}
    />
  );
}
