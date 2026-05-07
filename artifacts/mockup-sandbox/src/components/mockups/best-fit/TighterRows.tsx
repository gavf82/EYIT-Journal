
const AREA_COLORS: Record<string, string> = {
  "Communication and Language": "#f4a261",
  "Personal, Social and Emotional Development": "#e76f51",
  "Physical Development": "#2a9d8f",
  "Literacy": "#457b9d",
  "Mathematics": "#8338ec",
  "Understanding the World": "#3a86ff",
  "Expressive Arts and Design": "#e63946",
};

const DATA = [
  { area: "Communication and Language", strand: "Listening, Attention and Understanding", step: 5 },
  { area: "Communication and Language", strand: "Speaking", step: 4 },
  { area: "Personal, Social and Emotional Development", strand: "Self-Regulation", step: 3 },
  { area: "Personal, Social and Emotional Development", strand: "Managing Self", step: 4 },
  { area: "Personal, Social and Emotional Development", strand: "Building Relationships", step: 5 },
  { area: "Physical Development", strand: "Gross Motor Skills", step: 6 },
  { area: "Physical Development", strand: "Fine Motor Skills", step: 4 },
  { area: "Literacy", strand: "Comprehension", step: 3 },
  { area: "Literacy", strand: "Word Reading", step: 2 },
  { area: "Literacy", strand: "Writing", step: null },
  { area: "Mathematics", strand: "Number", step: 5 },
  { area: "Mathematics", strand: "Numerical Patterns", step: 4 },
  { area: "Understanding the World", strand: "Past and Present", step: 3 },
  { area: "Understanding the World", strand: "People, Culture and Communities", step: 4 },
  { area: "Understanding the World", strand: "The Natural World", step: 5 },
  { area: "Expressive Arts and Design", strand: "Creating with Materials", step: 6 },
  { area: "Expressive Arts and Design", strand: "Being Imaginative and Expressive", step: 5 },
];

const AREAS = Array.from(new Set(DATA.map(d => d.area)));

export function TighterRows() {
  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-6">
      <div className="w-full max-w-lg">
        <h2 className="text-base font-semibold mb-3">Best-fit step by strand</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-[11px] text-muted-foreground uppercase tracking-wide border-b border-border">
                <th className="text-left py-1 px-3 font-medium w-[65%]">Strand</th>
                <th className="text-center py-1 px-3 font-medium">Best-fit Step</th>
              </tr>
            </thead>
            <tbody>
              {AREAS.map(area => {
                const rows = DATA.filter(d => d.area === area && d.step !== null);
                if (rows.length === 0) return null;
                const color = AREA_COLORS[area] ?? "#ccc";
                return (
                  <>
                    <tr key={area}>
                      <td
                        colSpan={2}
                        className="py-0.5 px-3 text-[11px] font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: color, color: "#111" }}
                      >
                        {area}
                      </td>
                    </tr>
                    {rows.map(row => (
                      <tr key={row.strand} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-[3px] px-3 text-[12px]">{row.strand}</td>
                        <td className="py-[3px] px-3 text-center">
                          <span
                            className="inline-flex items-center justify-center min-w-[2.4rem] rounded px-1.5 py-0 font-semibold tabular-nums text-[11px] border border-border/40"
                            style={{ backgroundColor: color, opacity: 0.85 }}
                          >
                            Step {row.step}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
          Weighted average of rated items (E×1 · D×2 · S×3). Hover a badge for full breakdown.
        </p>
      </div>
    </div>
  );
}
