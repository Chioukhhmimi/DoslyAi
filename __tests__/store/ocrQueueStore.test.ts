// Tests for store/ocrQueueStore.ts
// The store exports `useOCRQueue` — a Zustand store usable directly without React.

import { useOCRQueue } from '../../store/ocrQueueStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const item1 = { name: 'AMOXICILLINE', dosage: '500mg' };
const item2 = { name: 'PARACETAMOL', dosage: '1000mg' };
const item3 = { name: 'IBUPROFEN', dosage: '400mg' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ocrQueueStore', () => {
  beforeEach(() => {
    useOCRQueue.getState().clear();
  });

  it('setQueue replaces the queue', () => {
    useOCRQueue.getState().setQueue([item1, item2]);
    expect(useOCRQueue.getState().queue).toEqual([item1, item2]);

    // Calling setQueue again replaces (not appends) the queue
    useOCRQueue.getState().setQueue([item3]);
    expect(useOCRQueue.getState().queue).toEqual([item3]);
  });

  it('shift removes and returns the first item', () => {
    useOCRQueue.getState().setQueue([item1, item2, item3]);

    const removed = useOCRQueue.getState().shift();

    expect(removed).toEqual(item1);
    expect(useOCRQueue.getState().queue).toEqual([item2, item3]);
  });

  it('shift returns undefined on an empty queue', () => {
    // Queue is already empty after beforeEach clear()
    const result = useOCRQueue.getState().shift();
    expect(result).toBeUndefined();
  });

  it('clear empties the queue', () => {
    useOCRQueue.getState().setQueue([item1, item2]);
    useOCRQueue.getState().clear();
    expect(useOCRQueue.getState().queue).toEqual([]);
  });

  it('shift on a single-item queue leaves the queue empty', () => {
    useOCRQueue.getState().setQueue([item1]);

    const removed = useOCRQueue.getState().shift();

    expect(removed).toEqual(item1);
    expect(useOCRQueue.getState().queue).toHaveLength(0);
  });
});
