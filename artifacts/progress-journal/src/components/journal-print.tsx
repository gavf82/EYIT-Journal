import { JOURNAL, AREA_COLORS, type JournalArea, type JournalStrand } from "../data/journal";
import { getRatingKey, type Rating, type HistoryEntry } from "../lib/store";
import { type StepVisibility } from "../lib/progress";
import { type StagnantItem } from "../lib/stagnation";

// Compact date: "27/04/25" — used in journal tables.
export function formatEntryDate(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(2);
    return `${dd}/${mm}/${yy}`;
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Summary journal — only rated items
// ---------------------------------------------------------------------------

export interface RatedItemRow {
  key: string;
  text: string;
  status: "emerging" | "developing" | "secure";
  updatedAt: string;
  history?: HistoryEntry[];
}

export interface StepBlock {
  stepNumber: number;
  ageRange: string;
  items: RatedItemRow[];
}

export function collectStrandBlocks(
  area: JournalArea,
  aIdx: number,
  strand: JournalStrand,
  sIdx: number,
  childId: string,
  ratings: Record<string, Rating>,
  visibility: StepVisibility,
): StepBlock[] {
  const visibleSet = visibility?.get(`${aIdx}::${sIdx}`) ?? null;

  const allBlocks: StepBlock[] = [];
  strand.steps.forEach((step, stIdx) => {
    if (!step.items || step.note) return;
    const inAgeRange = visibleSet ? visibleSet.has(stIdx) : true;
    if (!inAgeRange) return;
    const items: RatedItemRow[] = [];
    step.items.forEach((item) => {
      const r = ratings[getRatingKey(childId, aIdx, sIdx, stIdx, item.key)];
      const s = r?.status;
      if (s === "emerging" || s === "developing" || s === "secure") {
        items.push({ key: item.key, text: item.text, status: s, updatedAt: r!.updatedAt, history: r!.history });
      }
    });
    items.sort((a, b) => a.key.localeCompare(b.key));
    allBlocks.push({ stepNumber: step.number, ageRange: step.ageRange, items });
  });

  allBlocks.sort((a, b) => a.stepNumber - b.stepNumber);

  const withItems = allBlocks.filter((b) => b.items.length > 0);
  if (withItems.length === 0) return [];

  const first = withItems[0].stepNumber;
  const last = withItems[withItems.length - 1].stepNumber;
  return allBlocks.filter((b) => b.stepNumber >= first && b.stepNumber <= last);
}

export function StrandTable({
  area,
  strand,
  blocks,
  stagnantKeys,
}: {
  area: JournalArea;
  strand: JournalStrand;
  blocks: StepBlock[];
  stagnantKeys?: Set<string>;
}) {
  return (
    <section
      className="journal-strand"
      data-testid={`strand-table-${strand.name}`}
      style={{ "--area-color": AREA_COLORS[area.area] ?? "#f6c344" } as React.CSSProperties}
    >
      <div className="print-corner">EYIT September 2024</div>
      <div className="journal-strand-header">
        <span className="font-semibold">{area.area}: </span>
        <span className="uppercase tracking-wide">{strand.name}</span>
      </div>
      {blocks.map((block) => (
        <table key={block.stepNumber} className="journal-step-table">
          <colgroup>
            <col className="journal-col-text" />
            <col className="journal-col-status" />
            <col className="journal-col-status" />
            <col className="journal-col-status" />
          </colgroup>
          <thead>
            <tr className="journal-step-row">
              <th scope="col" className="text-left">
                Step {block.stepNumber} ({block.ageRange})
              </th>
              <th scope="col" className="text-center">Emerging</th>
              <th scope="col" className="text-center">Developing</th>
              <th scope="col" className="text-center">Secure</th>
            </tr>
          </thead>
          <tbody>
            {block.items.map((it) => {
              const sk = `${area.area}::${strand.name}::${block.stepNumber}::${it.key}`;
              const isStagnant = stagnantKeys?.has(sk) ?? false;

              function stageDate(s: "emerging" | "developing" | "secure"): string | null {
                if (it.status === s) return it.updatedAt;
                const h = it.history?.find((e) => e.status === s);
                return h?.date ?? null;
              }

              const eDate = stageDate("emerging");
              const dDate = stageDate("developing");
              const sDate = stageDate("secure");

              return (
                <tr key={it.key}>
                  <td>
                    <span className="font-semibold mr-1">{it.key})</span>
                    {it.text}
                  </td>
                  <td className="text-center text-xs tabular-nums">
                    {eDate ? (
                      <span className={isStagnant && it.status === "emerging" ? "stagnant-date" : undefined}>
                        {formatEntryDate(eDate)}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-center text-xs tabular-nums">
                    {dDate ? (
                      <span className={isStagnant && it.status === "developing" ? "stagnant-date" : undefined}>
                        {formatEntryDate(dDate)}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-center text-xs tabular-nums">
                    {sDate ? formatEntryDate(sDate) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ))}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Full Development Journal — all steps, all items, for LA submission
// ---------------------------------------------------------------------------

export interface FullDJItemRow {
  key: string;
  text: string;
  status: "emerging" | "developing" | "secure" | null;
  updatedAt: string | null;
  history?: HistoryEntry[];
}

export interface FullDJStepBlock {
  stepNumber: number;
  ageRange: string;
  items: FullDJItemRow[];
}

export function collectFullDJBlocks(
  area: JournalArea,
  aIdx: number,
  strand: JournalStrand,
  sIdx: number,
  childId: string,
  ratings: Record<string, Rating>,
): FullDJStepBlock[] {
  const blocks: FullDJStepBlock[] = [];
  strand.steps.forEach((step, stIdx) => {
    if (!step.items || step.note) return;
    const items: FullDJItemRow[] = step.items.map((item) => {
      const r = ratings[getRatingKey(childId, aIdx, sIdx, stIdx, item.key)];
      const s = r?.status ?? null;
      return {
        key: item.key,
        text: item.text,
        status: s as "emerging" | "developing" | "secure" | null,
        updatedAt: r?.updatedAt ?? null,
        history: r?.history,
      };
    });
    if (items.length > 0) {
      blocks.push({ stepNumber: step.number, ageRange: step.ageRange, items });
    }
  });
  return blocks;
}

export function FullDJStrandTable({
  area,
  strand,
  blocks,
  stagnantKeys,
}: {
  area: JournalArea;
  strand: JournalStrand;
  blocks: FullDJStepBlock[];
  stagnantKeys?: Set<string>;
}) {
  return (
    <section
      className="journal-strand"
      style={{ "--area-color": AREA_COLORS[area.area] ?? "#f6c344" } as React.CSSProperties}
    >
      <div className="print-corner">EYIT September 2024</div>
      <div className="journal-strand-header">
        <span className="font-semibold">{area.area}: </span>
        <span className="uppercase tracking-wide">{strand.name}</span>
      </div>
      {blocks.map((block) => (
        <table key={block.stepNumber} className="journal-step-table">
          <colgroup>
            <col className="journal-col-text" />
            <col className="journal-col-status" />
            <col className="journal-col-status" />
            <col className="journal-col-status" />
          </colgroup>
          <thead>
            <tr className="journal-step-row">
              <th scope="col" className="text-left">
                Step {block.stepNumber} ({block.ageRange})
              </th>
              <th scope="col" className="text-center">Emerging</th>
              <th scope="col" className="text-center">Developing</th>
              <th scope="col" className="text-center">Secure</th>
            </tr>
          </thead>
          <tbody>
            {block.items.map((it) => {
              const sk = `${area.area}::${strand.name}::${block.stepNumber}::${it.key}`;
              const isStagnant = stagnantKeys?.has(sk) ?? false;

              function stageDate(s: "emerging" | "developing" | "secure"): string | null {
                if (it.status === s) return it.updatedAt;
                const h = it.history?.find((e) => e.status === s);
                return h?.date ?? null;
              }

              const eDate = it.status ? stageDate("emerging") : null;
              const dDate = it.status ? stageDate("developing") : null;
              const sDate = it.status ? stageDate("secure") : null;

              return (
                <tr key={it.key}>
                  <td>
                    <span className="font-semibold mr-1">{it.key})</span>
                    {it.text}
                  </td>
                  <td className="text-center text-xs tabular-nums">
                    {eDate ? (
                      <span className={isStagnant && it.status === "emerging" ? "stagnant-date" : undefined}>
                        {formatEntryDate(eDate)}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-center text-xs tabular-nums">
                    {dDate ? (
                      <span className={isStagnant && it.status === "developing" ? "stagnant-date" : undefined}>
                        {formatEntryDate(dDate)}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-center text-xs tabular-nums">
                    {sDate ? formatEntryDate(sDate) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ))}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Print-only stagnation review page
// ---------------------------------------------------------------------------

export function PrintStagnationPage({ stagnantItems }: { stagnantItems: StagnantItem[] }) {
  if (stagnantItems.length === 0) return null;
  return (
    <section className="hidden print:block" style={{ pageBreakAfter: "always", breakAfter: "page", marginBottom: 0 }}>
      <div className="print-corner">EYIT September 2024</div>
      <h2 style={{ fontSize: "14pt", fontWeight: 700, marginBottom: "0.5cm", marginTop: "0.3cm" }}>
        Areas without progression
      </h2>
      <p style={{ fontSize: "9pt", color: "#555", marginBottom: "0.4cm" }}>
        The following items have been rated Emerging or Developing for 6 or more months with no change.
        Corresponding dates are highlighted in the journal record.
      </p>
      {Array.from(
        stagnantItems.reduce((map, it) => {
          map.set(it.areaName, [...(map.get(it.areaName) ?? []), it]);
          return map;
        }, new Map<string, StagnantItem[]>()),
      ).map(([areaName, items]) => (
        <div key={areaName} style={{ marginBottom: "0.35cm" }}>
          <p style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #ccc", paddingBottom: "2px", marginBottom: "0.2cm" }}>
            {areaName}
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt" }}>
            <colgroup>
              <col style={{ width: "18%" }} />
              <col style={{ width: "42%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "#f3f3f3" }}>
                <th style={{ textAlign: "left", padding: "2px 4px", fontWeight: 600 }}>Strand · Step</th>
                <th style={{ textAlign: "left", padding: "2px 4px", fontWeight: 600 }}>Statement</th>
                <th style={{ textAlign: "center", padding: "2px 4px", fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: "center", padding: "2px 4px", fontWeight: 600 }}>Rated</th>
                <th style={{ textAlign: "center", padding: "2px 4px", fontWeight: 600 }}>Months</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={`${it.strandName}::${it.stepNumber}::${it.itemKey}`} style={{ borderBottom: "1px solid #e8e8e8" }}>
                  <td style={{ padding: "2px 4px", verticalAlign: "top" }}>
                    <span style={{ fontWeight: 600 }}>{it.strandName}</span>
                    <br />
                    <span style={{ color: "#555" }}>Step {it.stepNumber} ({it.ageRange})</span>
                  </td>
                  <td style={{ padding: "2px 4px", verticalAlign: "top" }}>
                    <span style={{ fontWeight: 600 }}>{it.itemKey})</span> {it.itemText}
                  </td>
                  <td style={{ textAlign: "center", padding: "2px 4px", verticalAlign: "top" }}>
                    <span style={{
                      background: it.status === "emerging" ? "hsl(5 72% 66% / 30%)" : "hsl(38 88% 62% / 30%)",
                      fontWeight: 700,
                      padding: "0 4px",
                      borderRadius: "2px",
                      WebkitPrintColorAdjust: "exact",
                      printColorAdjust: "exact",
                    } as React.CSSProperties}>
                      {it.status === "emerging" ? "E" : "D"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: "2px 4px", verticalAlign: "top" }}>
                    <span style={{ background: "hsl(38 88% 62% / 28%)", fontWeight: 700, padding: "0 3px", borderRadius: "2px", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}>
                      {formatEntryDate(it.updatedAt)}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: "2px 4px", verticalAlign: "top", color: "#b45309" }}>
                    {it.monthsStale} mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
