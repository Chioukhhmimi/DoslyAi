import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontFamily, TypeScale, TypeVariant } from '@constants/typography';
import { Colors } from '@constants/colors';

interface AppTextProps extends TextProps {
  variant?: TypeVariant;
  color?: string;
}

export function AppText({ variant = 'body', color, style, children, ...props }: AppTextProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const scale = TypeScale[variant];
  const fontFamily = resolveFontFamily(scale.weight, isArabic);

  const { weight: _weight, ...scaleStyle } = scale;

  return (
    <Text
      style={[
        scaleStyle,
        { fontFamily, color: color ?? Colors.textPrimary },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

function resolveFontFamily(weight: string, isArabic: boolean): string {
  if (isArabic) {
    const ar = FontFamily.arabic;
    if (weight === 'medium') return ar.medium;
    if (weight === 'bold' || weight === 'semibold' || weight === 'extrabold') return ar.bold;
    return ar.regular;
  }
  const la = FontFamily.latin;
  if (weight === 'medium')    return la.medium;
  if (weight === 'semibold')  return la.semibold;
  if (weight === 'bold')      return la.bold;
  if (weight === 'extrabold') return la.extrabold;
  return la.regular;
}
