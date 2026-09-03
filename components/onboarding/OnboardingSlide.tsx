import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { Button } from '@components/ui/Button';

interface OnboardingSlideProps {
  title: string;
  description: string;
  illustrationColor: string;
  onNext: () => void;
  onSkip: () => void;
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
            <View
              key={i}
              style={[styles.dot, i + 1 === currentSlide ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <Button
          label={isLast ? t('onboarding.slide3.getStarted') : t('common.continue')}
          onPress={onNext}
          style={styles.btnNext}
        />
        {!isLast && (
          <Button label={t('common.skip')} variant="ghost" onPress={onSkip} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.background },
  container:   { flex: 1, padding: Spacing.md },
  illustration: { flex: 1, borderRadius: Radius.xl, marginBottom: Spacing.xl },
  dots:        { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.lg, gap: 6 },
  dot:         { height: 8, borderRadius: 4 },
  dotActive:   { width: 24, backgroundColor: Colors.primary },
  dotInactive: { width: 8,  backgroundColor: Colors.border },
  title:       { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  description: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24, marginBottom: Spacing.xl },
  btnNext:     { marginBottom: Spacing.sm },
});
