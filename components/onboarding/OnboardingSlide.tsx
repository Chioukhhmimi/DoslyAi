import React from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { Button } from '@components/ui/Button';

import { AppText } from '../ui/AppText';

interface OnboardingSlideProps {
  title: string;
  description: string;
  illustrationColor: string;
  onNext: () => void;
  onSkip: () => void;
  onDotPress?: (index: number) => void;
  isLast?: boolean;
  currentSlide: number;
  totalSlides: number;
}

export function OnboardingSlide({
  title,
  description,
  illustrationColor,
  onNext,
  onSkip,
  onDotPress,
  isLast = false,
  currentSlide,
  totalSlides,
}: OnboardingSlideProps) {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={[styles.illustration, { backgroundColor: illustrationColor }]} />

        <View style={styles.dots}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => onDotPress?.(i + 1)}
              accessibilityRole="button"
              accessibilityLabel={`${t('onboarding.slide')} ${i + 1} ${t('onboarding.of')} ${totalSlides}`}
              accessibilityState={{ selected: i + 1 === currentSlide }}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <View
                style={[styles.dot, i + 1 === currentSlide ? styles.dotActive : styles.dotInactive]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.description}>{description}</AppText>

        <Button
          label={isLast ? t('onboarding.slide3.getStarted') : t('common.continue')}
          onPress={onNext}
          style={styles.btnNext}
        />
        {!isLast && <Button label={t('common.skip')} variant="ghost" onPress={onSkip} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.md },
  illustration: { flex: 1, borderRadius: Radius.xl, marginBottom: Spacing.xl },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.lg, gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 24, backgroundColor: Colors.primary },
  dotInactive: { width: 8, backgroundColor: Colors.border },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  btnNext: { marginBottom: Spacing.sm },
});
