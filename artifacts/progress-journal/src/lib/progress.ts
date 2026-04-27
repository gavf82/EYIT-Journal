import { JOURNAL, JournalArea, JournalStrand, JournalStep, Status } from "../data/journal";
import { StoreState, getRatingKey } from "./store";
import { stepMatchesAge } from "./age";

/**
 * Maps `${aIdx}::${sIdx}` → set of step indices visible for that strand.
 * `null` means "no filter — every step is visible".
 */
export type StepVisibility = Map<string, Set<number>> | null;

function strandKey(aIdx: number, sIdx: number) {
  return `${aIdx}::${sIdx}`;
}

function isVisible(v: StepVisibility, aIdx: number, sIdx: number, stIdx: number): boolean {
  if (!v) return true;
  const set = v.get(strandKey(aIdx, sIdx));
  if (!set) return false;
  return set.has(stIdx);
}

/**
 * Determine which steps are visible for one strand given the child's age and
 * any existing ratings.
 *
 * - When the age filter is OFF (or the child's age is unknown), every step
 *   is visible.
 * - When ON, we collapse to a single "current" step per strand: the highest
 *   step whose lower age bound is ≤ the child's age in months, OR the
 *   highest step that already has any rating, whichever is later.
 */
export function visibleStepIndicesForStrand(
  strand: JournalStrand,
  childId: string,
  aIdx: number,
  sIdx: number,
  childMonths: number | null,
  ratings: StoreState["ratings"],
  ageFilterOn: boolean,
): Set<number> {
  if (!ageFilterOn || childMonths === null) {
    return new Set(strand.steps.map((_, i) => i));
  }
  let currentIdx = -1;
  strand.steps.forEach((step, i) => {
    if (stepMatchesAge(step.ageRange, childMonths)) {
      currentIdx = Math.max(currentIdx, i);
    }
  });
  let highestRated = -1;
  strand.steps.forEach((step, i) => {
    if (step.items) {
      for (const item of step.items) {
        const key = getRatingKey(childId, aIdx, sIdx, i, item.key);
        if (ratings[key]) {
          highestRated = Math.max(highestRated, i);
          break;
        }
      }
    }
  });
  const focus = Math.max(currentIdx, highestRated);
  if (focus < 0) return new Set();
  return new Set([focus]);
}

export function buildStepVisibility(
  childId: string,
  childMonths: number | null,
  ratings: StoreState["ratings"],
  ageFilterOn: boolean,
): StepVisibility {
  if (!ageFilterOn || childMonths === null) return null;
  const map = new Map<string, Set<number>>();
  JOURNAL.forEach((area, aIdx) => {
    area.strands.forEach((strand, sIdx) => {
      map.set(
        strandKey(aIdx, sIdx),
        visibleStepIndicesForStrand(
          strand,
          childId,
          aIdx,
          sIdx,
          childMonths,
          ratings,
          ageFilterOn,
        ),
      );
    });
  });
  return map;
}

export interface ProgressCounts {
  total: number;
  emerging: number;
  developing: number;
  secure: number;
  unset: number;
  rated: number;
  percentRated: number;
  percentSecure: number;
  weightedScore: number;
}

const EMPTY: ProgressCounts = {
  total: 0,
  emerging: 0,
  developing: 0,
  secure: 0,
  unset: 0,
  rated: 0,
  percentRated: 0,
  percentSecure: 0,
  weightedScore: 0,
};

function blank(): ProgressCounts {
  return { ...EMPTY };
}

function finalize(c: ProgressCounts): ProgressCounts {
  c.unset = Math.max(0, c.total - c.rated);
  c.percentRated = c.total === 0 ? 0 : Math.round((c.rated / c.total) * 100);
  c.percentSecure = c.total === 0 ? 0 : Math.round((c.secure / c.total) * 100);
  // Weighted score: emerging=1, developing=2, secure=3, max = total*3
  const points = c.emerging * 1 + c.developing * 2 + c.secure * 3;
  const max = c.total * 3;
  c.weightedScore = max === 0 ? 0 : Math.round((points / max) * 100);
  return c;
}

export function countStep(
  childId: string,
  aIdx: number,
  sIdx: number,
  stIdx: number,
  step: JournalStep,
  ratings: StoreState["ratings"],
): ProgressCounts {
  const c = blank();
  if (!step.items || step.note) return finalize(c);
  for (const item of step.items) {
    c.total += 1;
    const key = getRatingKey(childId, aIdx, sIdx, stIdx, item.key);
    const r = ratings[key];
    if (!r) continue;
    c.rated += 1;
    if (r.status === "emerging") c.emerging += 1;
    else if (r.status === "developing") c.developing += 1;
    else if (r.status === "secure") c.secure += 1;
  }
  return finalize(c);
}

export function countStrand(
  childId: string,
  aIdx: number,
  sIdx: number,
  strand: JournalStrand,
  ratings: StoreState["ratings"],
  visibility: StepVisibility = null,
): ProgressCounts {
  const c = blank();
  strand.steps.forEach((step, stIdx) => {
    if (!isVisible(visibility, aIdx, sIdx, stIdx)) return;
    const sc = countStep(childId, aIdx, sIdx, stIdx, step, ratings);
    c.total += sc.total;
    c.rated += sc.rated;
    c.emerging += sc.emerging;
    c.developing += sc.developing;
    c.secure += sc.secure;
  });
  return finalize(c);
}

export function countArea(
  childId: string,
  aIdx: number,
  area: JournalArea,
  ratings: StoreState["ratings"],
  visibility: StepVisibility = null,
): ProgressCounts {
  const c = blank();
  area.strands.forEach((strand, sIdx) => {
    const sc = countStrand(childId, aIdx, sIdx, strand, ratings, visibility);
    c.total += sc.total;
    c.rated += sc.rated;
    c.emerging += sc.emerging;
    c.developing += sc.developing;
    c.secure += sc.secure;
  });
  return finalize(c);
}

export function countAll(
  childId: string,
  ratings: StoreState["ratings"],
  visibility: StepVisibility = null,
): ProgressCounts {
  const c = blank();
  JOURNAL.forEach((area, aIdx) => {
    const ac = countArea(childId, aIdx, area, ratings, visibility);
    c.total += ac.total;
    c.rated += ac.rated;
    c.emerging += ac.emerging;
    c.developing += ac.developing;
    c.secure += ac.secure;
  });
  return finalize(c);
}

export const STATUS_COLORS: Record<Exclude<Status, null> | "unset", string> = {
  emerging: "var(--color-status-emerging)",
  developing: "var(--color-status-developing)",
  secure: "var(--color-status-secure)",
  unset: "var(--color-status-unset)",
};

export const STATUS_LABELS: Record<Exclude<Status, null>, string> = {
  emerging: "Emerging",
  developing: "Developing",
  secure: "Secure",
};

export const STATUS_DESCRIPTIONS: Record<Exclude<Status, null>, string> = {
  emerging: "Just starting to show signs of this skill",
  developing: "Developing this skill with support",
  secure: "Confidently and consistently demonstrates this skill",
};
