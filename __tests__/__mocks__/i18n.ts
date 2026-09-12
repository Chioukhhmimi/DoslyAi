// Minimal i18n mock — t(key) returns the key so tests assert on keys not translated strings
const i18n = {
  t: (key: string, opts?: Record<string, unknown>) => {
    if (opts) {
      return Object.entries(opts).reduce(
        (s, [k, v]) => s.replace(new RegExp(`{{${k}}}`, 'g'), String(v)),
        key,
      );
    }
    return key;
  },
  language: 'fr',
  changeLanguage: jest.fn().mockResolvedValue(undefined),
};

export default i18n;
