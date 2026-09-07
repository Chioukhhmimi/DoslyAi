export function formatTime(hhmm: string): string {
  return hhmm.replace(':', 'h');
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function isToday(isoDate: string): boolean {
  return isSameDay(isoDate, new Date());
}

export function isSameDay(dateA: string | Date, dateB: string | Date): boolean {
  const a =
    typeof dateA === 'string' ? new Date(dateA + (dateA.length === 10 ? 'T00:00:00' : '')) : dateA;
  const b =
    typeof dateB === 'string' ? new Date(dateB + (dateB.length === 10 ? 'T00:00:00' : '')) : dateB;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(date?: Date): Date {
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

export function parseHHmm(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(':').map(Number);
  return { hours: h ?? 0, minutes: m ?? 0 };
}

export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isMissed(scheduledAt: string, takenAt?: string): boolean {
  if (takenAt) return false;
  const scheduled = new Date(scheduledAt);
  const now = new Date();
  return now.getTime() - scheduled.getTime() > 2 * 60 * 60 * 1000;
}
