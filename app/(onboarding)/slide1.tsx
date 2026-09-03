import React from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { OnboardingSlide } from '@components/onboarding/OnboardingSlide';
import { Colors } from '@constants/colors';

export default function Slide1() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <OnboardingSlide
      title={t('onboarding.slide1.title')}
      description={t('onboarding.slide1.description')}
      illustrationColor={Colors.primaryLight}
      onNext={() => router.push('/(onboarding)/slide2')}
      onSkip={() => router.push('/(onboarding)/slide3')}
      currentSlide={1}
      totalSlides={4}
    />
  );
}
