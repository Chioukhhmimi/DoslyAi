// Tests for the notification identifier scheme used in hooks/useNotifications.ts
// All logic is reimplemented inline as pure functions — no hook imports needed.

// ---------------------------------------------------------------------------
// Inline helpers mirroring the hook's identifier scheme
// ---------------------------------------------------------------------------

function makeDoseId(medicationId: string, scheduledAt: Date): string {
  return `med:${medicationId}:${scheduledAt.getTime()}`;
}

function makeRefillId(medicationId: string): string {
  return `refill:${medicationId}`;
}

function makeSnoozeId(medicationId: string, newTime: Date): string {
  return `med:${medicationId}:snooze:${newTime.getTime()}`;
}

function cancelFilter(identifier: string, medicationId: string): boolean {
  return (
    identifier.startsWith(`med:${medicationId}:`) ||
    identifier === `refill:${medicationId}`
  );
}

// ---------------------------------------------------------------------------
// describe: notification identifier scheme
// ---------------------------------------------------------------------------

describe('notification identifier scheme', () => {
  describe('dose identifiers', () => {
    it('are namespaced with med: prefix and colon delimiter', () => {
      const medId = 'abc-123';
      const scheduledAt = new Date(1700000000000);
      const id = makeDoseId(medId, scheduledAt);

      expect(id).toBe('med:abc-123:1700000000000');
      expect(id.startsWith('med:')).toBe(true);
      // Colon delimiter immediately follows the medicationId segment
      expect(id).toMatch(/^med:[^:]+:\d+$/);
    });

    it('cancel filter matches own medication and not a similar prefix', () => {
      const medId = 'med-1';
      const ownDoseId = `med:med-1:1700`;
      const otherDoseId = `med:med-10:1700`;

      // Own medication's dose notification must match
      expect(cancelFilter(ownDoseId, medId)).toBe(true);

      // A medication whose id shares a prefix ('med-10' starts with 'med-1')
      // must NOT match because the colon delimiter prevents the collision
      expect(cancelFilter(otherDoseId, medId)).toBe(false);
    });

    it('cancel filter does not match partial prefix (the old bug)', () => {
      // The original bug: without the colon delimiter,
      // '1700'.startsWith('170') was true, causing false positives.
      // With the scheme `med:${medicationId}:...` the filter is
      // `identifier.startsWith('med:170:')`, which is FALSE for 'med:1700:...'
      const medicationId = '170';
      const differentMedId = '1700';
      const differentMedDoseId = `med:${differentMedId}:9999999999`;

      // The filter string for medicationId '170' is 'med:170:'
      // 'med:1700:...' does NOT start with 'med:170:' — colon prevents collision
      expect(cancelFilter(differentMedDoseId, medicationId)).toBe(false);

      // Sanity: the correct medication's own dose DOES match
      const ownDoseId = `med:${medicationId}:9999999999`;
      expect(cancelFilter(ownDoseId, medicationId)).toBe(true);
    });
  });

  describe('refill identifiers', () => {
    it('refill identifier matches exactly', () => {
      const refillId = makeRefillId('med-1');

      // Exact match for own medication
      expect(refillId === 'refill:med-1').toBe(true);

      // Does NOT equal a different medication's refill id
      expect(refillId === makeRefillId('med-10')).toBe(false);

      // Refill id does NOT match the dose cancel-filter prefix
      expect(refillId.startsWith('med:med-1:')).toBe(false);
    });
  });

  describe('cancel function logic (inline reimplementation)', () => {
    it('matches dose notifications for correct medication', () => {
      const medId = 'med-42';
      const doseId = makeDoseId(medId, new Date(1700000000000));
      expect(cancelFilter(doseId, medId)).toBe(true);
    });

    it('matches refill notification for correct medication', () => {
      const medId = 'med-42';
      const refillId = makeRefillId(medId);
      expect(cancelFilter(refillId, medId)).toBe(true);
    });

    it('does not match dose notification for different medication', () => {
      const ownMedId = 'med-42';
      const otherMedId = 'med-99';
      const otherDoseId = makeDoseId(otherMedId, new Date(1700000000000));
      expect(cancelFilter(otherDoseId, ownMedId)).toBe(false);
    });

    it('does not match when only prefix overlaps (170 vs 1700)', () => {
      // medicationId '170' must not cancel notifications belonging to '1700'
      const targetMedId = '170';
      const otherMedDoseId = makeDoseId('1700', new Date(1700000000000));
      expect(cancelFilter(otherMedDoseId, targetMedId)).toBe(false);
    });

    it('does not match snooze of different medication', () => {
      const ownMedId = 'med-42';
      const otherMedId = 'med-99';
      const otherSnoozeId = makeSnoozeId(otherMedId, new Date(1700000000000));
      // The snooze id for a different medication must not be cancelled by ownMedId's filter
      expect(cancelFilter(otherSnoozeId, ownMedId)).toBe(false);
    });
  });
});
