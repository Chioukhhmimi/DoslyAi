import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Medication, IntakeRecord } from '@store/medicationStore';
import { formatDate } from '@utils/dateHelpers';

function escapeCSV(value: string | number | undefined | null): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportCSV(
  medications: Medication[],
  records: IntakeRecord[],
  fromDate: Date,
  toDate: Date,
): Promise<void> {
  const filtered = records.filter((r) => {
    const d = new Date(r.scheduledAt);
    return d >= fromDate && d <= toDate;
  });

  const header = ['Date', 'Heure', 'Médicament', 'Dose', 'Unité', 'Statut', 'Notes'].join(',');

  const rows = filtered.map((r) => {
    const med = medications.find((m) => m.id === r.medicationId);
    const d = new Date(r.scheduledAt);
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const status = r.takenAt ? 'Pris' : r.skipped ? 'Passé' : 'Manqué';
    return [
      escapeCSV(date),
      escapeCSV(time),
      escapeCSV(med?.name ?? ''),
      escapeCSV(med?.doseQuantity ?? ''),
      escapeCSV(med?.unit ?? ''),
      escapeCSV(status),
      escapeCSV(r.notes ?? ''),
    ].join(',');
  });

  const csv = [header, ...rows].join('\n');
  const path = `${FileSystem.cacheDirectory}meditrack_export.csv`;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Exporter CSV' });
}

export async function exportPDF(
  medications: Medication[],
  records: IntakeRecord[],
  fromDate: Date,
  toDate: Date,
): Promise<void> {
  const filtered = records.filter((r) => {
    const d = new Date(r.scheduledAt);
    return d >= fromDate && d <= toDate;
  });

  const taken = filtered.filter((r) => !!r.takenAt).length;
  const skipped = filtered.filter((r) => !!r.skipped).length;
  const missed = filtered.filter((r) => !r.takenAt && !r.skipped).length;
  const pct = filtered.length > 0 ? Math.round((taken / filtered.length) * 100) : 100;

  const rows = filtered
    .map((r) => {
      const med = medications.find((m) => m.id === r.medicationId);
      const d = new Date(r.scheduledAt);
      const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const status = r.takenAt
        ? '<span style="color:#15803D">Pris</span>'
        : r.skipped
          ? '<span style="color:#92400E">Passé</span>'
          : '<span style="color:#DC2626">Manqué</span>';
      return `<tr><td>${date}</td><td>${time}</td><td>${med?.name ?? ''}</td><td>${med?.doseQuantity ?? ''} ${med?.unit ?? ''}</td><td>${status}</td><td>${r.notes ?? ''}</td></tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body { font-family: sans-serif; padding: 24px; color: #111; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
  .stats { display: flex; gap: 20px; margin-bottom: 20px; }
  .stat { text-align: center; }
  .stat-value { font-size: 24px; font-weight: bold; }
  .stat-label { font-size: 12px; color: #666; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f3f4f6; padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb; }
  td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
</style></head><body>
<h1>MediTrack — Rapport d'observance</h1>
<p class="subtitle">${formatDate(fromDate.toISOString().split('T')[0])} – ${formatDate(toDate.toISOString().split('T')[0])}</p>
<div class="stats">
  <div class="stat"><div class="stat-value">${pct}%</div><div class="stat-label">Observance</div></div>
  <div class="stat"><div class="stat-value" style="color:#15803D">${taken}</div><div class="stat-label">Pris</div></div>
  <div class="stat"><div class="stat-value" style="color:#DC2626">${missed}</div><div class="stat-label">Manqués</div></div>
  <div class="stat"><div class="stat-value" style="color:#92400E">${skipped}</div><div class="stat-label">Passés</div></div>
</div>
<table><thead><tr><th>Date</th><th>Heure</th><th>Médicament</th><th>Dose</th><th>Statut</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
</body></html>`;

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Exporter PDF' });
}

export async function exportJSON(
  medications: Medication[],
  records: IntakeRecord[],
  fromDate: Date,
  toDate: Date,
): Promise<void> {
  const filtered = records.filter((r) => {
    const d = new Date(r.scheduledAt);
    return d >= fromDate && d <= toDate;
  });

  const medIds = new Set(filtered.map((r) => r.medicationId));
  const referencedMeds = medications.filter((m) => medIds.has(m.id));

  const payload = {
    exportedAt: new Date().toISOString(),
    medications: referencedMeds,
    records: filtered,
  };

  const path = `${FileSystem.cacheDirectory}meditrack_export.json`;
  await FileSystem.writeAsStringAsync(path, JSON.stringify(payload, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Exporter JSON' });
}
