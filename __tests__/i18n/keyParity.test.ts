import enJson from '../../i18n/locales/en.json';
import frJson from '../../i18n/locales/fr.json';
import arJson from '../../i18n/locales/ar.json';

// ─── Helper ───────────────────────────────────────────────────────────────────

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      keys.push(...collectKeys(val as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// ─── i18n key parity ──────────────────────────────────────────────────────────

describe('i18n key parity', () => {
  const enKeys = collectKeys(enJson as Record<string, unknown>).sort();
  const frKeys = collectKeys(frJson as Record<string, unknown>).sort();
  const arKeys = collectKeys(arJson as Record<string, unknown>).sort();

  it('FR has all EN keys', () => {
    const missing = enKeys.filter((k) => !frKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it('EN has all FR keys (no extra in FR)', () => {
    const extra = frKeys.filter((k) => !enKeys.includes(k));
    expect(extra).toEqual([]);
  });

  it('AR has all EN keys', () => {
    const missing = enKeys.filter((k) => !arKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it('EN has all AR keys (no extra in AR)', () => {
    const extra = arKeys.filter((k) => !enKeys.includes(k));
    expect(extra).toEqual([]);
  });

  it('all locales have same total key count', () => {
    expect(frKeys.length).toBe(enKeys.length);
    expect(arKeys.length).toBe(enKeys.length);
  });

  it('no locale has empty string values', () => {
    const checkNoEmpty = (
      obj: Record<string, unknown>,
      locale: string,
      path = '',
    ): void => {
      for (const [key, val] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof val === 'string') {
          expect(`${locale}:${fullPath}=${val}`).not.toMatch(/=$/);
        } else if (typeof val === 'object' && val !== null) {
          checkNoEmpty(val as Record<string, unknown>, locale, fullPath);
        }
      }
    };
    checkNoEmpty(enJson as Record<string, unknown>, 'en');
    checkNoEmpty(frJson as Record<string, unknown>, 'fr');
    checkNoEmpty(arJson as Record<string, unknown>, 'ar');
  });
});
