import { useTranslation } from 'react-i18next';
import { RTL_LANGUAGES } from '../i18n';

export function useIsRTL(): boolean {
  const { i18n } = useTranslation();
  return RTL_LANGUAGES.includes(i18n.language);
}
