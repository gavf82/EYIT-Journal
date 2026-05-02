import { JOURNAL } from "../data/journal";
import { getRatingKey, type Rating } from "./store";
import { type StepVisibility } from "./progress";

export interface StagnantItem {
  areaName: string;
  strandName: string;
  stepNumber: number;
  ageRange: string;
  itemKey: string;
  itemText: string;
  status: "emerging" | "developing";
  updatedAt: string;
  monthsStale: number;
  reviewNote?: string;
}

export function monthsBetween(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

export function computeStagnantItems(
  childId: string,
  ratings: Record<string, Rating>,
  visibility: StepVisibility,
): StagnantItem[] {
  const now = new Date();
  const result: StagnantItem[] = [];

  JOURNAL.forEach((area, aIdx) => {
    area.strands.forEach((strand, sIdx) => {
      const visibleSet = visibility?.get(`${aIdx}::${sIdx}`) ?? null;
      strand.steps.forEach((step, stIdx) => {
        if (!step.items || step.note) return;
        if (visibleSet && !visibleSet.has(stIdx)) return;
        step.items.forEach((item) => {
          const r = ratings[getRatingKey(childId, aIdx, sIdx, stIdx, item.key)];
          if (!r || !r.status || r.status === "secure") return;
          const updated = new Date(r.updatedAt);
          if (isNaN(updated.getTime())) return;
          const months = monthsBetween(updated, now);
          if (months < 6) return;
          result.push({
            areaName: area.area,
            strandName: strand.name,
            stepNumber: step.number,
            ageRange: step.ageRange,
            itemKey: item.key,
            itemText: item.text,
            status: r.status as "emerging" | "developing",
            updatedAt: r.updatedAt,
            monthsStale: months,
          });
        });
      });
    });
  });

  result.sort((a, b) =>
    b.monthsStale - a.monthsStale ||
    a.areaName.localeCompare(b.areaName) ||
    a.strandName.localeCompare(b.strandName),
  );
  return result;
}
