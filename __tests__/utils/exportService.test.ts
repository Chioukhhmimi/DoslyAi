// Tests for utils/exportService.ts
//
// All external dependencies are handled by jest moduleNameMapper:
//   expo-print            → __tests__/__mocks__/expo-print.ts
//   expo-sharing          → __tests__/__mocks__/expo-sharing.ts
//   expo-file-system/legacy → __tests__/__mocks__/expo-file-system.ts
//   ../i18n               → __tests__/__mocks__/i18n.ts  (t(key) returns key)
//
// The i18n mock's `language` property can be mutated per-test to exercise
// the RTL/LTR branching in exportPDF.

import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { exportCSV, exportPDF, exportJSON } from '../../utils/exportService';

// ---------------------------------------------------------------------------
// Typed access to mocks
// ---------------------------------------------------------------------------

const mockWriteAsStringAsync = FileSystem.writeAsStringAsync as jest.MockedFunction<
  typeof FileSystem.writeAsStringAsync
>;
const mockShareAsync = Sharing.shareAsync as jest.MockedFunction<typeof Sharing.shareAsync>;
const mockPrintToFileAsync = Print.printToFileAsync as jest.MockedFunction<
  typeof Print.printToFileAsync
>;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockMed = {
  id: 'med-1',
  profileId: 'p-1',
  name: 'AMOXICILLINE',
  doseQuantity: 500,
  unit: 'mg',
  type: 'pill',
  paused: false,
  schedule: { frequency: 'daily', times: ['08:00'] },
  startDate: '2024-01-01',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
} as any;

const mockRecord = {
  id: 'rec-1',
  medicationId: 'med-1',
  profileId: 'p-1',
  scheduledAt: '2024-06-15T08:00:00.000Z',
  takenAt: '2024-06-15T08:05:00.000Z',
  skipped: false,
} as any;

const from = new Date('2024-06-01T00:00:00Z');
const to = new Date('2024-06-30T23:59:59Z');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the string written to the mock FileSystem in the most recent call. */
function getCapturedFileContent(): string {
  const calls = mockWriteAsStringAsync.mock.calls;
  return calls[calls.length - 1][1] as string;
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// exportCSV
// ---------------------------------------------------------------------------

describe('exportCSV', () => {
  it('writes a CSV file with correct number of columns in header', async () => {
    await exportCSV([mockMed], [mockRecord], from, to);

    const content = getCapturedFileContent();
    const headerLine = content.split('\n')[0];
    const columns = headerLine.split(',');

    expect(columns).toHaveLength(7);
  });

  it('CSV header has unit column, not duplicate dose', async () => {
    await exportCSV([mockMed], [mockRecord], from, to);

    const content = getCapturedFileContent();
    const headerLine = content.split('\n')[0];
    const columns = headerLine.split(',');

    // Column indices: 0=Date 1=time 2=medication 3=dose 4=unit 5=status 6=notes
    // The i18n mock returns the key itself, so we assert on keys
    expect(columns[3]).toBe('export.dose');
    expect(columns[4]).toBe('export.unit');
    // Column 4 must NOT be a duplicate of column 3
    expect(columns[4]).not.toBe(columns[3]);
  });

  it('filters records outside the date range', async () => {
    const outsideRecord = {
      ...mockRecord,
      id: 'rec-outside',
      scheduledAt: '2024-07-01T08:00:00.000Z', // July → outside June range
    };

    await exportCSV([mockMed], [outsideRecord], from, to);

    const content = getCapturedFileContent();
    const lines = content.split('\n').filter(Boolean);

    // Only the header line; no data rows because the record is out of range
    expect(lines).toHaveLength(1);
  });

  it('marks a taken record correctly', async () => {
    // mockRecord has takenAt set → status should be the 'taken' i18n key
    await exportCSV([mockMed], [mockRecord], from, to);

    const content = getCapturedFileContent();
    const dataLine = content.split('\n')[1];

    expect(dataLine).toContain('history.stats.taken');
  });

  it('marks a missed record correctly (no takenAt, no skipped)', async () => {
    const missedRecord = {
      ...mockRecord,
      takenAt: undefined,
      skipped: false,
    };

    await exportCSV([mockMed], [missedRecord], from, to);

    const content = getCapturedFileContent();
    const dataLine = content.split('\n')[1];

    expect(dataLine).toContain('history.stats.missed');
  });

  it('escapes medication names with commas', async () => {
    const medWithComma = { ...mockMed, name: 'Vitamin D, forte' };

    await exportCSV([medWithComma], [mockRecord], from, to);

    const content = getCapturedFileContent();
    const dataLine = content.split('\n')[1];

    // CSV escaping wraps the value in double quotes
    expect(dataLine).toContain('"Vitamin D, forte"');
  });

  it('calls shareAsync with csv mime type', async () => {
    await exportCSV([mockMed], [mockRecord], from, to);

    expect(mockShareAsync).toHaveBeenCalledTimes(1);
    expect(mockShareAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ mimeType: 'text/csv' }),
    );
  });
});

// ---------------------------------------------------------------------------
// exportPDF
// ---------------------------------------------------------------------------

describe('exportPDF', () => {
  // The i18n mock lives at __tests__/__mocks__/i18n.ts.
  // The moduleNameMapper routes `../i18n` imports to that same file,
  // so mutating `i18n.language` here affects the exportService module.
  // We import it with a relative path that resolves to the actual mock file.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const i18n = require('../__mocks__/i18n').default;

  afterEach(() => {
    // Restore default language after each test
    i18n.language = 'fr';
  });

  it('includes RTL direction for Arabic locale', async () => {
    i18n.language = 'ar';

    await exportPDF([mockMed], [mockRecord], from, to);

    const { html } = mockPrintToFileAsync.mock.calls[0][0] as { html: string };
    expect(html).toContain('dir="rtl"');
  });

  it('includes LTR direction for French locale', async () => {
    i18n.language = 'fr';

    await exportPDF([mockMed], [mockRecord], from, to);

    const { html } = mockPrintToFileAsync.mock.calls[0][0] as { html: string };
    expect(html).toContain('dir="ltr"');
  });

  it('HTML-escapes medication names with HTML special characters', async () => {
    const medWithHtml = { ...mockMed, name: 'Med<script>' };

    await exportPDF([medWithHtml], [mockRecord], from, to);

    const { html } = mockPrintToFileAsync.mock.calls[0][0] as { html: string };
    expect(html).toContain('&lt;script&gt;');
    // Raw unescaped tag must NOT appear in the output
    expect(html).not.toContain('<script>');
  });

  it('calls printToFileAsync and shareAsync', async () => {
    await exportPDF([mockMed], [mockRecord], from, to);

    expect(mockPrintToFileAsync).toHaveBeenCalledTimes(1);
    expect(mockShareAsync).toHaveBeenCalledTimes(1);
    expect(mockShareAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ mimeType: 'application/pdf' }),
    );
  });
});

// ---------------------------------------------------------------------------
// exportJSON
// ---------------------------------------------------------------------------

describe('exportJSON', () => {
  it('writes valid JSON with medications and records', async () => {
    await exportJSON([mockMed], [mockRecord], from, to);

    const raw = getCapturedFileContent();
    const parsed = JSON.parse(raw);

    expect(parsed).toHaveProperty('medications');
    expect(parsed).toHaveProperty('records');
    expect(Array.isArray(parsed.medications)).toBe(true);
    expect(Array.isArray(parsed.records)).toBe(true);
  });

  it('only includes medications referenced by records in the date range', async () => {
    const unreferencedMed = { ...mockMed, id: 'med-unreferenced' };

    await exportJSON([mockMed, unreferencedMed], [mockRecord], from, to);

    const raw = getCapturedFileContent();
    const parsed = JSON.parse(raw);

    // Only med-1 is referenced by the record; med-unreferenced must be absent
    expect(parsed.medications).toHaveLength(1);
    expect(parsed.medications[0].id).toBe('med-1');
  });

  it('includes an exportedAt timestamp', async () => {
    await exportJSON([mockMed], [mockRecord], from, to);

    const raw = getCapturedFileContent();
    const parsed = JSON.parse(raw);

    expect(parsed).toHaveProperty('exportedAt');
    // Must be a parseable ISO timestamp
    expect(() => new Date(parsed.exportedAt)).not.toThrow();
    expect(new Date(parsed.exportedAt).toISOString()).toBe(parsed.exportedAt);
  });
});
