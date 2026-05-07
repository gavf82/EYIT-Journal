
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const AREA_COLORS: Record<string, string> = {
  "Communication and Language": "#f4a261",
  "Personal, Social and Emotional Development": "#e76f51",
  "Physical Development": "#2a9d8f",
  "Literacy": "#457b9d",
  "Mathematics": "#8338ec",
  "Understanding the World": "#3a86ff",
  "Expressive Arts and Design": "#e63946",
};

const AREAS_DATA = [
  {
    area: "Communication and Language",
    strands: [
      { strand: "Listening, Attention and Understanding", step: 5 },
      { strand: "Speaking", step: 4 },
    ],
  },
  {
    area: "Personal, Social and Emotional Development",
    strands: [
      { strand: "Self-Regulation", step: 3 },
      { strand: "Managing Self", step: 4 },
      { strand: "Building Relationships", step: 5 },
    ],
  },
  {
    area: "Physical Development",
    strands: [
      { strand: "Gross Motor Skills", step: 6 },
      { strand: "Fine Motor Skills", step: 4 },
    ],
  },
  {
    area: "Literacy",
    strands: [
      { strand: "Comprehension", step: 3 },
      { strand: "Word Reading", step: 2 },
      { strand: "Writing", step: null },
    ],
  },
  {
    area: "Mathematics",
    strands: [
      { strand: "Number", step: 5 },
      { strand: "Numerical Patterns", step: 4 },
    ],
  },
  {
    area: "Understanding the World",
    strands: [
      { strand: "Past and Present", step: 3 },
      { strand: "People, Culture and Communities", step: 4 },
      { strand: "The Natural World", step: 5 },
    ],
  },
  {
    area: "Expressive Arts and Design",
    strands: [
      { strand: "Creating with Materials", step: 6 },
      { strand: "Being Imaginative and Expressive", step: 5 },
    ],
  },
];

function avgStep(strands: { step: number | null }[]) {
  const rated = strands.filter(s => s.step !== null) as { step: number }[];
  if (rated.length === 0) return null;
  return Math.round(rated.reduce((sum, s) => sum + s.step, 0) / rated.length);
}

export function Collapsible() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-6">
      <div className="w-full max-w-lg">
        <h2 className="text-base font-semibold mb-3">Best-fit step by strand</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm divide-y divide-border">
          {AREAS_DATA.map(({ area, strands }) => {
            const color = AREA_COLORS[area] ?? "#ccc";
            const isOpen = open === area;
            const avg = avgStep(strands);
            return (
              <div key={area}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : area)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isOpen
                      ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    }
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0"
                      style={{ backgroundColor: color, color: "#111" }}
                    >
                      {area}
                    </span>
                  </div>
                  {avg !== null && !isOpen && (
                    <span
                      className="text-[11px] font-semibold tabular-nums rounded px-1.5 py-0.5 border border-border/40 shrink-0"
                      style={{ backgroundColor: color, opacity: 0.75 }}
                    >
                      avg Step {avg}
                    </span>
                  )}
                </button>
                {isOpen && (
                  <table className="w-full text-sm border-collapse border-t border-border/40 bg-muted/10">
                    <tbody>
                      {strands.map(({ strand, step }) => (
                        <tr key={strand} className="border-b border-border/20 last:border-0">
                          <td className="py-1 pl-8 pr-3 text-[12px]">{strand}</td>
                          <td className="py-1 px-3 text-right">
                            {step !== null ? (
                              <span
                                className="inline-flex items-center justify-center min-w-[2.4rem] rounded px-1.5 py-0 font-semibold tabular-nums text-[11px] border border-border/40"
                                style={{ backgroundColor: color, opacity: 0.85 }}
                              >
                                Step {step}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
          Weighted average of rated items (E×1 · D×2 · S×3). Expand an area to see strands.
        </p>
      </div>
    </div>
  );
}
