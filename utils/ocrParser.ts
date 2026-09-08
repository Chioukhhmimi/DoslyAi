export interface ParsedMedication {
  name: string;
  dosage: string;
  frequency?: string;
  duration?: string;
  rawLines: string[];
}

// ─── Regex patterns ──────────────────────────────────────────────────────────

// Matches Western (0-9) and Eastern Arabic numerals (٠-٩ = \u0660-\u0669)
const NUM = '[0-9\u0660-\u0669]';

const DOSAGE_RE = new RegExp(
  `(${NUM}+(?:[.,]${NUM}+)?)\\s*(mg|ml|g|µg|mcg|UI|cp|comprimés?|gélules?|gouttes?|sachets?)`,
  'gi',
);

// French frequency
const FREQUENCY_FR_RE =
  /(\d+\s*[x×]\s*\/?\s*j(?:our)?|\d+\s*fois?\s*(?:par\s*)?(?:jour|j)\b|matin\s*(?:et|,)?\s*(?:midi\s*(?:et|,)?\s*)?soir|soir\s*et\s*matin|\b\d-\d(?:-\d)?\b|\bonce\s+daily\b|\btwice\s+daily\b)/gi;

// Arabic frequency: صباحاً و مساءً, مرتين يومياً, ثلاث مرات, etc.
const FREQUENCY_AR_RE =
  /صباحاً\s*و\s*مساءً|مرتين\s*(?:في\s*اليوم|يومياً)|ثلاث\s*مرات\s*(?:في\s*اليوم|يومياً)?|مرة\s*واحدة\s*(?:في\s*اليوم|يومياً)|كل\s*\d+\s*ساعات?|صباحاً|مساءً|ظهراً|يومياً/g;

// French duration
const DURATION_FR_RE =
  /(?:pendant|durant|pour|during|for)\s+(\d+)\s*(jours?|semaines?|mois|days?|weeks?|months?)/gi;

// Arabic duration: لمدة X يوم/أيام/أسبوع/أسابيع/شهر/أشهر
const DURATION_AR_RE = new RegExp(
  `لمدة\\s+(${NUM}+)\\s*(أيام?|يوم|أسابيع?|أسبوع|أشهر?|شهر)`,
  'g',
);

const DOCTOR_RE = /(?:dr\.?|docteur|médecin)\s+([a-zA-ZÀ-ÿ\u0600-\u06FF\s\-]{2,30})/gi;

// Medication name: ALL-CAPS Latin word ≥ 4 chars (standard FR + AR Maghreb Rx format —
// drug names stay in Latin script even on Arabic prescriptions)
const MED_NAME_RE = /\b([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ]{4,})\b/g;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function firstMatch(text: string, ...patterns: RegExp[]): string | undefined {
  for (const re of patterns) {
    re.lastIndex = 0;
    const m = re.exec(text);
    if (m) return m[0].trim();
  }
  return undefined;
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

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parsePrescription(lines: string[]): ParsedMedication[] {
  const results: ParsedMedication[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !hasDosage(line)) continue;

    const blockLines: string[] = [];

    if (i > 0 && lines[i - 1].trim()) blockLines.push(lines[i - 1].trim());
    blockLines.push(line);
    for (let j = i + 1; j <= i + 2 && j < lines.length; j++) {
      if (lines[j].trim()) blockLines.push(lines[j].trim());
    }

    const blockText = blockLines.join(' ');
    const nameLine = blockLines.length > 1 ? blockLines[0] : line;
    const name = extractName(nameLine) ?? extractName(line) ?? 'Médicament inconnu';
    const dosage = extractDosage(blockText);
    const frequency = firstMatch(blockText, FREQUENCY_FR_RE, FREQUENCY_AR_RE);
    const duration = firstMatch(blockText, DURATION_FR_RE, DURATION_AR_RE);

    const isDup = results.some((r) => r.name === name && r.dosage === dosage);
    if (!isDup && dosage) {
      results.push({ name, dosage, frequency, duration, rawLines: blockLines });
    }
  }

  // Fallback: try extracting from full text if nothing found
  if (results.length === 0) {
    const fullText = lines.join('\n');
    const name = extractName(fullText);
    const dosage = extractDosage(fullText);
    if (name && dosage) {
      const frequency = firstMatch(fullText, FREQUENCY_FR_RE, FREQUENCY_AR_RE);
      const duration = firstMatch(fullText, DURATION_FR_RE, DURATION_AR_RE);
      results.push({ name, dosage, frequency, duration, rawLines: lines });
    }
  }

  return results;
}

// ─── Backward-compatible exports ──────────────────────────────────────────────

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
  DOCTOR_RE.lastIndex = 0;
  const dm = DOCTOR_RE.exec(rawText);
  const prescribedBy = dm ? dm[0].trim() : undefined;
  return {
    medicationName: first?.name,
    dosage: first?.dosage,
    frequency: first?.frequency,
    duration: first?.duration,
    prescribedBy,
    rawText,
  };
}
