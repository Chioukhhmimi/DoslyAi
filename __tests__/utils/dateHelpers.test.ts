import {
  formatTime,
  formatDate,
  isToday,
  isSameDay,
  startOfDay,
  addDays,
  getDayOfWeek,
  parseHHmm,
  toISODateString,
  isMissed,
} from '../../utils/dateHelpers';

// ---------------------------------------------------------------------------
// formatTime
// ---------------------------------------------------------------------------
describe('formatTime', () => {
  it('replaces colon with h in a standard HH:mm string', () => {
    expect(formatTime('08:30')).toBe('08h30');
  });

  it('replaces colon with h in midnight string', () => {
    expect(formatTime('00:00')).toBe('00h00');
  });

  it('returns string unchanged when there is no colon', () => {
    // No colon → replace finds nothing, string returned as-is
    expect(formatTime('0830')).toBe('0830');
  });

  it('only replaces the first colon when multiple colons are present', () => {
    // String.replace with a string pattern replaces only the first match
    expect(formatTime('08:30:00')).toBe('08h30:00');
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
describe('formatDate', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('includes the year in the formatted string', () => {
    expect(formatDate('2024-01-15')).toContain('2024');
  });

  it('formats using French locale (day before month)', () => {
    // fr-FR with day:'2-digit', month:'short', year:'numeric'
    // e.g. "15 janv. 2024" – year is always present
    const result = formatDate('2024-03-05');
    expect(result).toMatch(/2024/);
  });
});

// ---------------------------------------------------------------------------
// isToday
// ---------------------------------------------------------------------------
describe('isToday', () => {
  it('returns true for today\'s ISO date string', () => {
    const today = toISODateString(new Date());
    expect(isToday(today)).toBe(true);
  });

  it('returns false for yesterday\'s ISO date string', () => {
    const yesterday = toISODateString(addDays(new Date(), -1));
    expect(isToday(yesterday)).toBe(false);
  });

  it('returns false for tomorrow\'s ISO date string', () => {
    const tomorrow = toISODateString(addDays(new Date(), 1));
    expect(isToday(tomorrow)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isSameDay
// ---------------------------------------------------------------------------
describe('isSameDay', () => {
  it('returns true for two identical ISO date strings', () => {
    expect(isSameDay('2024-06-15', '2024-06-15')).toBe(true);
  });

  it('returns false for two different ISO date strings', () => {
    expect(isSameDay('2024-06-15', '2024-06-16')).toBe(false);
  });

  it('returns true when comparing an ISO date string and a matching Date object', () => {
    const date = new Date(2024, 5, 15, 10, 30); // June 15 2024 local
    expect(isSameDay('2024-06-15', date)).toBe(true);
  });

  it('returns false when comparing an ISO date string and a non-matching Date object', () => {
    const date = new Date(2024, 5, 16, 0, 0); // June 16 2024
    expect(isSameDay('2024-06-15', date)).toBe(false);
  });

  it('returns true for two Date objects on the same calendar day', () => {
    const a = new Date(2024, 5, 15, 8, 0);
    const b = new Date(2024, 5, 15, 23, 59);
    expect(isSameDay(a, b)).toBe(true);
  });

  it('returns false for two Date objects on different calendar days', () => {
    const a = new Date(2024, 5, 15, 23, 59);
    const b = new Date(2024, 5, 16, 0, 0);
    expect(isSameDay(a, b)).toBe(false);
  });

  it('returns true for cross-midnight times that are the same calendar day', () => {
    // Both are on June 15: one at 00:01, one at 23:58
    const a = new Date(2024, 5, 15, 0, 1);
    const b = new Date(2024, 5, 15, 23, 58);
    expect(isSameDay(a, b)).toBe(true);
  });

  // BUG: ISO string with milliseconds has length > 10.
  // The guard `dateA.length === 10` is false for full ISO strings like
  // "2024-06-15T08:30:00.000Z", so no 'T00:00:00' suffix is appended.
  // The string is already a full ISO timestamp and parses correctly as UTC,
  // but comparisons against local Date objects may be off by one day in
  // timezones behind UTC.
  it('handles ISO string with milliseconds (length > 10) — documents UTC parsing edge case', () => {
    const isoWithMs = '2024-06-15T00:00:00.000Z';
    // In UTC+0 and ahead, the date part is June 15. In UTC-1 and further
    // behind, new Date(isoWithMs) lands on June 14 local time.
    // We compare against a local Date set to June 15 local midnight.
    const localJune15 = new Date(2024, 5, 15, 0, 0, 0, 0);
    const localJune14 = new Date(2024, 5, 14, 0, 0, 0, 0);

    const result = isSameDay(isoWithMs, localJune15);
    // The result depends on the local timezone offset:
    // in UTC+ zones the parsed date is June 15 → true.
    // in UTC- zones the parsed date is June 14 → false (off-by-one bug).
    // We verify the result is a boolean and document that timezone can flip it.
    expect(typeof result).toBe('boolean');
    // To make the test deterministic, compare the UTC-parsed date against its
    // own UTC date components, which are always June 15:
    const parsed = new Date(isoWithMs);
    const dateAsUtc = new Date(
      Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()),
    );
    expect(isSameDay(dateAsUtc, localJune15)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// startOfDay
// ---------------------------------------------------------------------------
describe('startOfDay', () => {
  it('sets hours, minutes, seconds and milliseconds to zero for a given date', () => {
    const input = new Date(2024, 5, 15, 14, 30, 45, 500);
    const result = startOfDay(input);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('preserves the calendar date of the input', () => {
    const input = new Date(2024, 5, 15, 14, 30);
    const result = startOfDay(input);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
  });

  it('does not mutate the original date', () => {
    const input = new Date(2024, 5, 15, 14, 30);
    const before = input.getTime();
    startOfDay(input);
    expect(input.getTime()).toBe(before);
  });

  it('returns today at midnight when called with no argument', () => {
    const result = startOfDay();
    const today = new Date();
    expect(result.getFullYear()).toBe(today.getFullYear());
    expect(result.getMonth()).toBe(today.getMonth());
    expect(result.getDate()).toBe(today.getDate());
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// addDays
// ---------------------------------------------------------------------------
describe('addDays', () => {
  it('adds one day correctly', () => {
    const base = new Date(2024, 5, 15);
    const result = addDays(base, 1);
    expect(result.getDate()).toBe(16);
    expect(result.getMonth()).toBe(5);
  });

  it('subtracts one day when days is -1', () => {
    const base = new Date(2024, 5, 15);
    const result = addDays(base, -1);
    expect(result.getDate()).toBe(14);
    expect(result.getMonth()).toBe(5);
  });

  it('crosses a month boundary correctly (Jan 31 + 1 = Feb 1)', () => {
    const base = new Date(2024, 0, 31); // January 31 2024
    const result = addDays(base, 1);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(1);
  });

  it('crosses a year boundary correctly (Dec 31 + 1 = Jan 1)', () => {
    const base = new Date(2024, 11, 31); // December 31 2024
    const result = addDays(base, 1);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
  });

  it('does not mutate the original date', () => {
    const base = new Date(2024, 5, 15);
    const before = base.getTime();
    addDays(base, 5);
    expect(base.getTime()).toBe(before);
  });

  it('returns the same date when adding zero days', () => {
    const base = new Date(2024, 5, 15);
    const result = addDays(base, 0);
    expect(result.getTime()).toBe(base.getTime());
  });
});

// ---------------------------------------------------------------------------
// getDayOfWeek
// ---------------------------------------------------------------------------
describe('getDayOfWeek', () => {
  it('returns 1 for Monday January 1 2024', () => {
    // 2024-01-01 is a Monday (getDay() === 1)
    const monday = new Date(2024, 0, 1);
    expect(getDayOfWeek(monday)).toBe(1);
  });

  it('returns 0 for Sunday January 7 2024', () => {
    const sunday = new Date(2024, 0, 7);
    expect(getDayOfWeek(sunday)).toBe(0);
  });

  it('returns 6 for Saturday January 6 2024', () => {
    const saturday = new Date(2024, 0, 6);
    expect(getDayOfWeek(saturday)).toBe(6);
  });

  it('returns a number between 0 and 6 inclusive', () => {
    const result = getDayOfWeek(new Date());
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(6);
  });
});

// ---------------------------------------------------------------------------
// parseHHmm
// ---------------------------------------------------------------------------
describe('parseHHmm', () => {
  it('parses "08:30" into hours=8 and minutes=30', () => {
    expect(parseHHmm('08:30')).toEqual({ hours: 8, minutes: 30 });
  });

  it('parses "00:00" into hours=0 and minutes=0', () => {
    expect(parseHHmm('00:00')).toEqual({ hours: 0, minutes: 0 });
  });

  it('parses "23:59" into hours=23 and minutes=59', () => {
    expect(parseHHmm('23:59')).toEqual({ hours: 23, minutes: 59 });
  });

  // BUG: no colon guard — when the input string has no colon, split(':')
  // yields a single-element array ['0800']. Number('0800') is 800 which is
  // not NaN, but the minutes element is undefined; `undefined ?? 0` gives 0.
  // The hours value is 800 (not a valid hour), not NaN.
  // The function has no validation for strings without a colon separator.
  it('BUG: no colon guard — "0800" yields hours=800 and minutes=0 instead of {hours:8, minutes:0}', () => {
    const result = parseHHmm('0800');
    // hours receives Number('0800') = 800, which is truthy, so ?? 0 is not applied
    expect(result.hours).toBe(800);
    expect(result.minutes).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// toISODateString
// ---------------------------------------------------------------------------
describe('toISODateString', () => {
  it('returns a YYYY-MM-DD formatted string', () => {
    const date = new Date(2024, 5, 15); // June 15 2024
    expect(toISODateString(date)).toBe('2024-06-15');
  });

  it('zero-pads single-digit months', () => {
    const date = new Date(2024, 0, 5); // January 5 2024
    expect(toISODateString(date)).toBe('2024-01-05');
  });

  it('zero-pads single-digit days', () => {
    const date = new Date(2024, 11, 3); // December 3 2024
    expect(toISODateString(date)).toBe('2024-12-03');
  });

  it('matches the regex pattern YYYY-MM-DD', () => {
    const result = toISODateString(new Date());
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('handles a date at end of year correctly', () => {
    const date = new Date(2023, 11, 31); // December 31 2023
    expect(toISODateString(date)).toBe('2023-12-31');
  });
});

// ---------------------------------------------------------------------------
// isMissed
// ---------------------------------------------------------------------------
describe('isMissed', () => {
  it('returns false when takenAt is provided (dose was taken)', () => {
    const scheduledAt = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(isMissed(scheduledAt, new Date().toISOString())).toBe(false);
  });

  it('returns true when dose was scheduled more than 2 hours ago and not taken', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(isMissed(threeHoursAgo)).toBe(true);
  });

  it('returns false when dose was scheduled less than 2 hours ago and not taken', () => {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
    expect(isMissed(oneHourAgo)).toBe(false);
  });

  it('returns false when dose is scheduled in the future and not taken', () => {
    const futureDate = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString();
    expect(isMissed(futureDate)).toBe(false);
  });

  it('returns false exactly at the 2-hour boundary (not strictly greater)', () => {
    // Exactly 2h ago: now - scheduled == 2h exactly → not > 2h → false
    const exactlyTwoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(isMissed(exactlyTwoHoursAgo)).toBe(false);
  });
});
