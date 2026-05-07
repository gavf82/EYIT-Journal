
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

type StrandRow = { area: string; strand: string; step: number | null };

function buildColumns(): [StrandRow[], StrandRow[]] {
  const all: StrandRow[] = [];
  for (const { area, strands } of AREAS_DATA) {
    all.push({ area, strand: "__header__", step: null });
    for (const s of strands) all.push({ area, strand: s.strand, step: s.step });
  }
  const mid = Math.ceil(all.length / 2);
  return [all.slice(0, mid), all.slice(mid)];
}

function Col({ rows }: { rows: StrandRow[] }) {
  return (
    <table className="w-full text-sm border-collapse">
      <tbody>
        {rows.map((row, i) => {
          const color = AREA_COLORS[row.area] ?? "#ccc";
          if (row.strand === "__header__") {
            return (
              <tr key={`h-${row.area}-${i}`}>
                <td
                  colSpan={2}
                  className="py-0.5 px-2.5 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: color, color: "#111" }}
                >
                  {row.area}
                </td>
              </tr>
            );
          }
          return (
            <tr key={row.strand} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
              <td className="py-[3px] px-2.5 text-[12px]">{row.strand}</td>
              <td className="py-[3px] px-2 text-center">
                {row.step !== null ? (
                  <span
                    className="inline-flex items-center justify-center min-w-[2.4rem] rounded px-1.5 py-0 font-semibold tabular-nums text-[11px] border border-border/40"
                    style={{ backgroundColor: color, opacity: 0.85 }}
                  >
                    Step {row.step}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function TwoColumn() {
  const [left, right] = buildColumns();
  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-6">
      <div className="w-full max-w-2xl">
        <h2 className="text-base font-semibold mb-3">Best-fit step by strand</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="grid grid-cols-2 divide-x divide-border">
            <Col rows={left} />
            <Col rows={right} />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
          Weighted average of rated items (E×1 · D×2 · S×3). Hover a badge for full breakdown.
        </p>
      </div>
    </div>
  );
}
