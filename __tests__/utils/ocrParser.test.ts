import { parsePrescription, parseOCRResult } from '../../utils/ocrParser';

// ─── parsePrescription ────────────────────────────────────────────────────────

describe('parsePrescription', () => {
  it('extracts simple French prescription', () => {
    const lines = ['AMOXICILLINE 500mg', 'matin et soir', 'pendant 7 jours'];
    const results = parsePrescription(lines);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('AMOXICILLINE');
    expect(results[0].dosage).toBe('500mg');
    expect(results[0].frequency).toMatch(/matin\s*(?:et|,)?\s*soir/i);
    expect(results[0].duration).toMatch(/pendant\s+7\s*jours/i);
  });

  it('extracts dosage with decimal (Eastern Arabic numeral)', () => {
    // ١٠٠٠ = 1000 in Eastern Arabic numerals
    const lines = ['PARACETAMOL', '١٠٠٠mg trois fois par jour'];
    const results = parsePrescription(lines);

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].dosage).toMatch(/١٠٠٠mg/);
  });

  it('deduplicates same name+dosage appearing twice', () => {
    const lines = [
      'AMOXICILLINE 500mg',
      'matin et soir',
      'AMOXICILLINE 500mg',
      'soir et matin',
    ];
    const results = parsePrescription(lines);

    const amoxResults = results.filter(
      (r) => r.name === 'AMOXICILLINE' && r.dosage === '500mg',
    );
    expect(amoxResults).toHaveLength(1);
  });

  it('returns empty array when no dosage match', () => {
    const lines = ['Some text without dosage'];
    const results = parsePrescription(lines);

    expect(results).toEqual([]);
  });

  it('falls back to full-text scan when no line has dosage but full text does', () => {
    // Neither line alone has a dosage on the line that also has a med name.
    // The line "Prendre 500mg le matin" has a dosage but no CAPS name.
    // The fallback should join all lines and find DOLIPRANE + 500mg together.
    const lines = ['DOLIPRANE', 'Prendre 500mg le matin'];
    const results = parsePrescription(lines);

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe('DOLIPRANE');
    expect(results[0].dosage).toMatch(/500mg/i);
  });

  it('extracts Arabic frequency', () => {
    const lines = ['IBUPROFENE 400mg', 'صباحاً و مساءً'];
    const results = parsePrescription(lines);

    expect(results.length).toBeGreaterThanOrEqual(1);
    // Frequency should contain the Arabic text (full match or partial)
    expect(results[0].frequency).toMatch(/صباحاً/);
  });

  it('returns Médicament inconnu when no CAPS word ≥ 4 chars', () => {
    const lines = ['250mg twice daily'];
    const results = parsePrescription(lines);

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe('Médicament inconnu');
  });

  it('handles multiple medications in prescription', () => {
    const lines = [
      'AMOXICILLINE 500mg',
      'matin et soir',
      'pendant 7 jours',
      'IBUPROFENE 400mg',
      '3 fois par jour',
      'pendant 5 jours',
    ];
    const results = parsePrescription(lines);

    expect(results.length).toBeGreaterThanOrEqual(2);
    const names = results.map((r) => r.name);
    expect(names).toContain('AMOXICILLINE');
    expect(names).toContain('IBUPROFENE');
  });
});

// ─── parseOCRResult ───────────────────────────────────────────────────────────

describe('parseOCRResult', () => {
  it('parses rawText into ParsedPrescription', () => {
    const rawText = 'AMOXICILLINE 500mg\nmatin et soir\npendant 7 jours';
    const result = parseOCRResult(rawText);

    expect(result.medicationName).toBe('AMOXICILLINE');
    expect(result.dosage).toBe('500mg');
    expect(result.frequency).toMatch(/matin\s*(?:et|,)?\s*soir/i);
    expect(result.duration).toMatch(/pendant\s+7\s*jours/i);
    expect(result.rawText).toBe(rawText);
  });

  it('extracts prescribedBy from dr. pattern', () => {
    const rawText = 'AMOXICILLINE 500mg\nDr. Martin Jean';
    const result = parseOCRResult(rawText);

    expect(result.prescribedBy).toBeDefined();
    expect(result.prescribedBy).toMatch(/Dr\.\s*Martin\s*Jean/i);
  });

  it('returns undefined fields when nothing found', () => {
    const rawText = 'no medications here';
    const result = parseOCRResult(rawText);

    expect(result.medicationName).toBeUndefined();
    expect(result.dosage).toBeUndefined();
    expect(result.rawText).toBe(rawText);
  });
});
