import { Platform } from 'react-native';

export const FontFamily = {
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium:  Platform.OS === 'ios' ? 'System' : 'Roboto',
  bold:    Platform.OS === 'ios' ? 'System' : 'Roboto',
} as const;

export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  xxxl: 32,
} as const;

export const LineHeight = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.8,
} as const;
