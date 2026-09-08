import { create } from 'zustand';

interface OCRItem {
  name: string;
  dosage: string;
}

interface OCRQueueState {
  queue: OCRItem[];
  setQueue: (items: OCRItem[]) => void;
  shift: () => OCRItem | undefined;
  clear: () => void;
}

export const useOCRQueue = create<OCRQueueState>((set, get) => ({
  queue: [],
  setQueue: (queue) => set({ queue }),
  shift: () => {
    const [first, ...rest] = get().queue;
    set({ queue: rest });
    return first;
  },
  clear: () => set({ queue: [] }),
}));
