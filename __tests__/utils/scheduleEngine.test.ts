import {
  isMedicationActiveOnDate,
  getScheduledDosesForDay,
  getNextDoses,
  computeAdherence,
} from '../../utils/scheduleEngine';
import { toISODateString, addDays } from '../../utils/dateHelpers';

// ---------------------------------------------------------------------------
// Medication factory
// ---------------------------------------------------------------------------

// Inline the Medication shape to avoid importing Firebase-dependent store types.
// Cast to `any` at call sites where TypeScript would otherwise complain.
type FrequencyType = 'daily' | 'weekly' | 'interval' | 'pattern';
type MedicationType = 'pill' | 'syrup' | 'injection' | 'supplement' | 'other';

interface MedicationSchedule {
  times: string[];
  frequency: FrequencyType;
  daysOfWeek?: number[];
  intervalDays?: number;
  pattern?: number[];
}

interface Medication {
  id: string;
  profileId: string;
  name: string;
  type: MedicationType;
  doseQuantity: number;
  unit: string;
  schedule: MedicationSchedule;
  startDate: string;
  endDate?: string;
  paused: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IntakeRecord {
  id: string;
  medicationId: string;
  profileId: string;
  scheduledAt: string;
  takenAt?: string;
  skipped?: boolean;
  notes?: string;
}

function makeMed(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'med-1',
    profileId: 'p-1',
    name: 'TestMed',
    type: 'pill',
    doseQuantity: 1,
    unit: 'mg',
    schedule: {
      frequency: 'daily',
      times: ['08:00'],
      daysOfWeek: [],
      intervalDays: 1,
      pattern: [],
    },
    startDate: '2024-01-01',
    endDate: undefined,
    paused: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

// Helper: build a local Date at midnight for a given YYYY-MM-DD string.
function localDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

// Helper: build an IntakeRecord that counts as "taken" for a given dose Date.
function makeTakenRecord(
  medicationId: string,
  doseDate: Date,
  profileId = 'p-1',
): IntakeRecord {
  return {
    id: `ir-${doseDate.getTime()}`,
    medicationId,
    profileId,
    scheduledAt: doseDate.toISOString(),
    takenAt: doseDate.toISOString(),
    skipped: false,
  };
}

// ---------------------------------------------------------------------------
// isMedicationActiveOnDate
// ---------------------------------------------------------------------------
describe('isMedicationActiveOnDate', () => {
  it('is active on the startDate itself', () => {
    const med = makeMed({ startDate: '2024-06-01' });
    expect(isMedicationActiveOnDate(med as any, localDate('2024-06-01'))).toBe(true);
  });

  it('is active for a date after startDate when endDate is undefined', () => {
    const med = makeMed({ startDate: '2024-06-01' });
    expect(isMedicationActiveOnDate(med as any, localDate('2024-06-15'))).toBe(true);
  });

  it('is inactive for a date before startDate', () => {
    const med = makeMed({ startDate: '2024-06-01' });
    expect(isMedicationActiveOnDate(med as any, localDate('2024-05-31'))).toBe(false);
  });

  it('is inactive for a date after endDate', () => {
    const med = makeMed({ startDate: '2024-06-01', endDate: '2024-06-30' });
    expect(isMedicationActiveOnDate(med as any, localDate('2024-07-01'))).toBe(false);
  });

  it('is active on the endDate itself', () => {
    const med = makeMed({ startDate: '2024-06-01', endDate: '2024-06-30' });
    // endDate is parsed as 'T23:59:59', so a date at midnight on endDate is within range
    expect(isMedicationActiveOnDate(med as any, localDate('2024-06-30'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getScheduledDosesForDay
// ---------------------------------------------------------------------------
describe('getScheduledDosesForDay', () => {
  describe('daily frequency', () => {
    it('returns one Date per scheduled time with correct hours and minutes', () => {
      const med = makeMed({
        startDate: '2024-01-01',
        schedule: { frequency: 'daily', times: ['08:00', '20:30'], daysOfWeek: [], intervalDays: 1, pattern: [] },
      });
      const date = localDate('2024-06-15');
      const doses = getScheduledDosesForDay(med as any, date);
      expect(doses).toHaveLength(2);
      expect(doses[0].getHours()).toBe(8);
      expect(doses[0].getMinutes()).toBe(0);
      expect(doses[1].getHours()).toBe(20);
      expect(doses[1].getMinutes()).toBe(30);
    });

    it('returns [] for a date before startDate (inactive)', () => {
      const med = makeMed({ startDate: '2024-06-01' });
      expect(getScheduledDosesForDay(med as any, localDate('2024-05-31'))).toEqual([]);
    });

    it('returns [] for a date after endDate (inactive)', () => {
      const med = makeMed({ startDate: '2024-01-01', endDate: '2024-01-31' });
      expect(getScheduledDosesForDay(med as any, localDate('2024-02-01'))).toEqual([]);
    });
  });

  describe('weekly frequency', () => {
    // 2024-01-01 is a Monday → getDay() === 1
    it('returns doses when the date matches a scheduled day of week', () => {
      const med = makeMed({
        startDate: '2024-01-01',
        schedule: { frequency: 'weekly', times: ['09:00'], daysOfWeek: [1], intervalDays: 1, pattern: [] },
      });
      const monday = localDate('2024-01-01');
      const doses = getScheduledDosesForDay(med as any, monday);
      expect(doses).toHaveLength(1);
      expect(doses[0].getHours()).toBe(9);
    });

    it('returns [] when the date does not match any scheduled day of week', () => {
      const med = makeMed({
        startDate: '2024-01-01',
        schedule: { frequency: 'weekly', times: ['09:00'], daysOfWeek: [1], intervalDays: 1, pattern: [] },
      });
      // 2024-01-02 is a Tuesday → getDay() === 2, not in [1]
      const tuesday = localDate('2024-01-02');
      expect(getScheduledDosesForDay(med as any, tuesday)).toEqual([]);
    });
  });

  describe('interval frequency', () => {
    // startDate = 2024-01-01, intervalDays = 2
    // day 0 (2024-01-01) → diff=0, 0%2===0 → doses
    // day 1 (2024-01-02) → diff=1, 1%2!==0 → []
    // day 2 (2024-01-03) → diff=2, 2%2===0 → doses
    it('returns doses on startDate (diff=0)', () => {
      const med = makeMed({
        startDate: '2024-01-01',
        schedule: { frequency: 'interval', times: ['08:00'], daysOfWeek: [], intervalDays: 2, pattern: [] },
      });
      expect(getScheduledDosesForDay(med as any, localDate('2024-01-01'))).toHaveLength(1);
    });

    it('returns [] on day 1 (not a multiple of intervalDays=2)', () => {
      const med = makeMed({
        startDate: '2024-01-01',
        schedule: { frequency: 'interval', times: ['08:00'], daysOfWeek: [], intervalDays: 2, pattern: [] },
      });
      expect(getScheduledDosesForDay(med as any, localDate('2024-01-02'))).toEqual([]);
    });

    it('returns doses on day 2 (diff=2, multiple of intervalDays=2)', () => {
      const med = makeMed({
        startDate: '2024-01-01',
        schedule: { frequency: 'interval', times: ['08:00'], daysOfWeek: [], intervalDays: 2, pattern: [] },
      });
      expect(getScheduledDosesForDay(med as any, localDate('2024-01-03'))).toHaveLength(1);
    });
  });

  describe('pattern frequency', () => {
    // pattern [1, 0, 1] starting 2024-01-01
    // day 0 (Jan 1) → pattern[0]=1 → doses
    // day 1 (Jan 2) → pattern[1]=0 → []
    // day 2 (Jan 3) → pattern[2]=1 → doses
    // day 3 (Jan 4) → pattern[3%3]=pattern[0]=1 → doses  (wraps around)
    it('returns doses on day 0 (pattern[0]=1)', () => {
      const med = makeMed({
        startDate: '2024-01-01',
        schedule: { frequency: 'pattern', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [1, 0, 1] },
      });
      expect(getScheduledDosesForDay(med as any, localDate('2024-01-01'))).toHaveLength(1);
    });

    it('returns [] on day 1 (pattern[1]=0)', () => {
      const med = makeMed({
        startDate: '2024-01-01',
        schedule: { frequency: 'pattern', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [1, 0, 1] },
      });
      expect(getScheduledDosesForDay(med as any, localDate('2024-01-02'))).toEqual([]);
    });

    it('returns doses on day 2 (pattern[2]=1)', () => {
      const med = makeMed({
        startDate: '2024-01-01',
        schedule: { frequency: 'pattern', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [1, 0, 1] },
      });
      expect(getScheduledDosesForDay(med as any, localDate('2024-01-03'))).toHaveLength(1);
    });

    it('returns [] on day 3 when pattern wraps and pattern[0]=1 ... actually wraps to 1', () => {
      // day3: diff=3, 3%3=0, pattern[0]=1 → doses
      const med = makeMed({
        startDate: '2024-01-01',
        schedule: { frequency: 'pattern', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [1, 0, 1] },
      });
      // day 3 wraps to pattern[0] = 1 → has doses
      expect(getScheduledDosesForDay(med as any, localDate('2024-01-04'))).toHaveLength(1);
    });

    it('returns [] on day 4 when pattern wraps and pattern[1]=0', () => {
      // day4: diff=4, 4%3=1, pattern[1]=0 → []
      const med = makeMed({
        startDate: '2024-01-01',
        schedule: { frequency: 'pattern', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [1, 0, 1] },
      });
      expect(getScheduledDosesForDay(med as any, localDate('2024-01-05'))).toEqual([]);
    });
  });

  describe('paused medication', () => {
    it('still returns doses for a paused medication (paused is UI-only, engine ignores it)', () => {
      const med = makeMed({ paused: true });
      const date = localDate('2024-06-15');
      const doses = getScheduledDosesForDay(med as any, date);
      expect(doses).toHaveLength(1);
    });
  });
});

// ---------------------------------------------------------------------------
// getNextDoses
// ---------------------------------------------------------------------------
describe('getNextDoses', () => {
  it('returns the requested count of future doses for a daily medication', () => {
    const med = makeMed({
      startDate: '2024-01-01',
      schedule: { frequency: 'daily', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [] },
    });
    // fromDate is well in the past so there are plenty of future doses
    const fromDate = new Date(2024, 5, 15, 7, 0, 0); // June 15 2024 07:00 — before 08:00 that day
    const doses = getNextDoses(med as any, fromDate, 3);
    expect(doses).toHaveLength(3);
    // All doses must be strictly after fromDate
    doses.forEach((d) => expect(d.getTime()).toBeGreaterThan(fromDate.getTime()));
  });

  it('skips doses that are at or before fromDate', () => {
    const med = makeMed({
      startDate: '2024-01-01',
      schedule: { frequency: 'daily', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [] },
    });
    // fromDate is after 08:00 on June 15 — the June 15 dose must be skipped
    const fromDate = new Date(2024, 5, 15, 9, 0, 0);
    const doses = getNextDoses(med as any, fromDate, 2);
    expect(doses).toHaveLength(2);
    // First dose must be on June 16
    expect(doses[0].getDate()).toBe(16);
    expect(doses[0].getMonth()).toBe(5);
  });

  it('returns [] for a medication whose endDate is in the past', () => {
    const med = makeMed({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });
    const fromDate = new Date(2024, 5, 15); // June 2024 — after endDate
    const doses = getNextDoses(med as any, fromDate, 3);
    expect(doses).toEqual([]);
  });

  it('returns fewer than count doses when not enough remain before expiry', () => {
    // Only 2 days remain (Feb 1 and Feb 2), medication ends Feb 2
    const med = makeMed({
      startDate: '2024-02-01',
      endDate: '2024-02-02',
      schedule: { frequency: 'daily', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [] },
    });
    const fromDate = new Date(2024, 1, 1, 7, 0); // Feb 1 07:00 — before 08:00
    const doses = getNextDoses(med as any, fromDate, 5);
    expect(doses.length).toBeLessThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// computeAdherence
// ---------------------------------------------------------------------------
describe('computeAdherence', () => {
  // Use a startDate well enough in the past so all days in the window have doses.
  // Today's date inside Jest is the real current date; we anchor startDate to
  // ensure the medication is active for the full window.
  const START_DATE = '2020-01-01'; // far enough in the past for any test window

  it('returns 100 when all scheduled doses have been taken', () => {
    const med = makeMed({
      startDate: START_DATE,
      schedule: { frequency: 'daily', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [] },
    });
    // Build intake records for the past 3 days (today included)
    const today = new Date();
    const records: IntakeRecord[] = [];
    for (let i = 2; i >= 0; i--) {
      const day = addDays(today, -i);
      // Build a dose Date matching what the engine will produce (local midnight + 8h)
      const dose = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 8, 0, 0, 0);
      records.push(makeTakenRecord('med-1', dose));
    }
    expect(computeAdherence(med as any, records as any, 3)).toBe(100);
  });

  it('returns 0 when no doses have been taken', () => {
    const med = makeMed({
      startDate: START_DATE,
      schedule: { frequency: 'daily', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [] },
    });
    expect(computeAdherence(med as any, [], 3)).toBe(0);
  });

  it('returns 50 when half of the scheduled doses have been taken', () => {
    const med = makeMed({
      startDate: START_DATE,
      schedule: { frequency: 'daily', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [] },
    });
    const today = new Date();
    const records: IntakeRecord[] = [];
    // 2-day window: i=1 (yesterday) and i=0 (today). Take only yesterday's dose.
    const twoDaysAgo = addDays(today, -1); // yesterday — corresponds to i=1 in the engine loop
    const dose = new Date(
      twoDaysAgo.getFullYear(),
      twoDaysAgo.getMonth(),
      twoDaysAgo.getDate(),
      8,
      0,
      0,
      0,
    );
    records.push(makeTakenRecord('med-1', dose));
    // 1 taken out of 2 expected → 50%
    expect(computeAdherence(med as any, records as any, 2)).toBe(50);
  });

  it('returns 100 when no doses are scheduled (expected=0)', () => {
    // Use a medication that has already expired so no doses fall in the window
    const med = makeMed({
      startDate: '2020-01-01',
      endDate: '2020-01-31',
      schedule: { frequency: 'daily', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [] },
    });
    // Window is last 3 days — all well after endDate → expected=0 → 100
    expect(computeAdherence(med as any, [], 3)).toBe(100);
  });

  it('counts only takenAt records (skipped records do not count)', () => {
    const med = makeMed({
      startDate: START_DATE,
      schedule: { frequency: 'daily', times: ['08:00'], daysOfWeek: [], intervalDays: 1, pattern: [] },
    });
    const today = new Date();
    // Create a skipped record for yesterday
    const yesterday = addDays(today, -1);
    const dose = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
      8,
      0,
      0,
      0,
    );
    const skippedRecord: IntakeRecord = {
      id: 'ir-skipped',
      medicationId: 'med-1',
      profileId: 'p-1',
      scheduledAt: dose.toISOString(),
      takenAt: dose.toISOString(),
      skipped: true, // skipped=true means it should NOT be counted
    };
    // 1 day window, 1 dose expected, 0 non-skipped taken → 0%
    expect(computeAdherence(med as any, [skippedRecord] as any, 1)).toBe(0);
  });
});
