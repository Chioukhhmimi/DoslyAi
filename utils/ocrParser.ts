export interface ParsedMedication {
  name: string;
  dosage: string;
  frequency?: string;
  duration?: string;
  rawLines: string[];
}

// ─── Regex patterns for French prescriptions ────────────────────────────────

const DOSAGE_RE =
  /(\d+(?:[.,]\d+)?)\s*(mg|ml|g|µg|mcg|UI|cp|comprimés?|gélules?|gouttes?|sachets?)/gi;

const FREQUENCY_RE =
  /(\d+\s*[x×]\s*\/?\s*j(?:our)?|\d+\s*fois?\s*(?:par\s*)?(?:jour|j)\b|matin\s*(?:et|,)?\s*(?:midi\s*(?:et|,)?\s*)?soir|soir\s*et\s*matin|\b\d-\d(?:-\d)?\b|\bonce\s+daily\b|\btwice\s+daily\b)/gi;

const DURATION_RE =
  /(?:pendant|durant|pour|during|for)\s+(\d+)\s*(jours?|semaines?|mois|days?|weeks?|months?)/gi;

const DOCTOR_RE = /(?:dr\.?|docteur|médecin)\s+([a-zA-ZÀ-ÿ\u0600-\u06FF\s\-]{2,30})/gi;

// Medication name: ALL-CAPS word ≥ 4 chars (standard French Rx formatting)
const MED_NAME_RE = /\b([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ]{4,})\b/g;

// ─── Helpers ────────────────────────────────────────────────────────────────

function firstMatch(text: string, re: RegExp): string | undefined {
  re.lastIndex = 0;
  const m = re.exec(text);
  return m ? m[0].trim() : undefined;
}

function extractName(line: string): string | undefined {
  MED_NAME_RE.lastIndex = 0;
  const names: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = MED_NAME_RE.exec(line)) !== null) {
    names.push(m[1]);
  }
  return names.length > 0 ? names.join(' ') : undefined;
}

function extractDosage(text: string): string {
  DOSAGE_RE.lastIndex = 0;
  const m = DOSAGE_RE.exec(text);
  return m ? m[0].trim() : '';
}

function hasDosage(line: string): boolean {
  DOSAGE_RE.lastIndex = 0;
  return DOSAGE_RE.test(line);
}

// ─── Main parser ─────────────────────────────────────────────────────────────

export function parsePrescription(lines: string[]): ParsedMedication[] {
  const results: ParsedMedication[] = [];
  const fullText = lines.join('\n');

  // Group lines into blocks: a block starts when we detect a dosage line
  // and collects the line before (possible name) and after (possible frequency/duration)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !hasDosage(line)) continue;

    const blockLines: string[] = [];

    // Line before → likely medication name
    if (i > 0 && lines[i - 1].trim()) blockLines.push(lines[i - 1].trim());

    // Current line (contains dosage)
    blockLines.push(line);

    // Up to 2 lines after → frequency / duration
    for (let j = i + 1; j <= i + 2 && j < lines.length; j++) {
      if (lines[j].trim()) blockLines.push(lines[j].trim());
    }

    const blockText = blockLines.join(' ');

    // Extract name: prefer the line before dosage, else search current line
    const nameLine = blockLines.length > 1 ? blockLines[0] : line;
    const name = extractName(nameLine) ?? extractName(line) ?? 'Médicament inconnu';

    const dosage = extractDosage(blockText);
    const frequency = firstMatch(blockText, FREQUENCY_RE);
    const duration = firstMatch(blockText, DURATION_RE);

    // Avoid duplicates (same name + dosage already added)
    const isDup = results.some((r) => r.name === name && r.dosage === dosage);
    if (!isDup && dosage) {
      results.push({ name, dosage, frequency, duration, rawLines: blockLines });
    }
  }

  // Fallback: if nothing found, try extracting any ALL-CAPS name + any dosage from full text
  if (results.length === 0) {
    const name = extractName(fullText);
    const dosage = extractDosage(fullText);
    if (name && dosage) {
      const frequency = firstMatch(fullText, FREQUENCY_RE);
      const duration = firstMatch(fullText, DURATION_RE);
      results.push({ name, dosage, frequency, duration, rawLines: lines });
    }
  }

  return results;
}

// Keep backward-compatible export for any existing imports
export interface ParsedPrescription {
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  prescribedBy?: string;
  rawText: string;
}

export function parseOCRResult(rawText: string): ParsedPrescription {
  const lines = rawText.split('\n').filter(Boolean);
  const meds = parsePrescription(lines);
  const first = meds[0];
  const prescribedBy = firstMatch(rawText, DOCTOR_RE);
  return {
    medicationName: first?.name,
    dosage: first?.dosage,
    frequency: first?.frequency,
    duration: first?.duration,
    prescribedBy,
    rawText,
  };
}
