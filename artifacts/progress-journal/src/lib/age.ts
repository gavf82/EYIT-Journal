/**
 * Age helpers for matching a child's age to step ranges.
 *
 * Step ageRange examples observed in the data:
 *   "0-3 months", "12-16 months", "30-36months",
 *   "35 – 41 months", "50-60 months+"
 */

export function ageInMonths(dob: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (now.getDate() < d.getDate()) months -= 1;
  return Math.max(0, months);
}

export function formatAge(dob: string): string {
  const m = ageInMonths(dob);
  if (m === null) return "";
  const years = Math.floor(m / 12);
  const months = m % 12;
  if (years === 0) return `${months} mo`;
  if (months === 0) return `${years} yr`;
  return `${years} yr ${months} mo`;
}

/**
 * Parse a step ageRange string into [lowerMonths, upperMonths].
 * Returns null when the string can't be understood.
 * "+" upper bounds are treated as Infinity.
 */
export function parseAgeRange(ageRange: string): [number, number] | null {
  if (!ageRange) return null;
  // Normalise: en/em dashes → "-", remove "months" word, collapse spaces.
  const normalised = ageRange
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/months?/gi, "")
    .trim();

  const plus = /\+\s*$/.test(normalised);
  const cleaned = normalised.replace(/\+\s*$/, "").trim();

  // Match "<num> - <num>" or single "<num>"
  const range = cleaned.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    const lower = Number(range[1]);
    const upper = plus ? Infinity : Number(range[2]);
    return [lower, upper];
  }
  const single = cleaned.match(/^(\d+)$/);
  if (single) {
    const n = Number(single[1]);
    return [n, plus ? Infinity : n];
  }
  return null;
}

/**
 * Returns true if a step's age range actually contains the child's age.
 * Both bounds are inclusive; "+" ranges have an upper bound of Infinity.
 *
 * This means a strand with a gap in its step ages (e.g. Word Reading jumps
 * from 0-3 months to 21-25 months) will correctly show *nothing* for a child
 * aged 4–20 months, rather than falling back to Step 1 (0-3 months).
 *
 * If the age range can't be parsed, every step is considered relevant (fail-open).
 */
export function stepMatchesAge(ageRange: string, childMonths: number | null): boolean {
  if (childMonths === null) return true;
  const parsed = parseAgeRange(ageRange);
  if (!parsed) return true;
  const [lower, upper] = parsed;
  return lower <= childMonths && childMonths <= upper;
}
