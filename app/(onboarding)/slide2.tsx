import React from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingSlide } from '@components/onboarding/OnboardingSlide';

export default function Slide2() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <OnboardingSlide
      title={t('onboarding.slide2.title')}
      description={t('onboarding.slide2.description')}
      illustrationColor="#FEF9C3"
      onNext={() => router.push('/(onboarding)/slide3')}
      onSkip={() => router.push('/(onboarding)/slide3')}
      currentSlide={2}
      totalSlides={4}
    />
  );
}
