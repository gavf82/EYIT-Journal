
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

export function ChipGrid() {
  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-6">
      <div className="w-full max-w-lg">
        <h2 className="text-base font-semibold mb-3">Best-fit step by strand</h2>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          {AREAS_DATA.map(({ area, strands }) => {
            const color = AREA_COLORS[area] ?? "#ccc";
            const rated = strands.filter(s => s.step !== null);
            if (rated.length === 0) return null;
            return (
              <div key={area}>
                <div
                  className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded mb-1.5 inline-block"
                  style={{ backgroundColor: color, color: "#111" }}
                >
                  {area}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {strands.map(({ strand, step }) => (
                    <div
                      key={strand}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 pl-2.5 pr-1.5 py-1 text-[11px]"
                    >
                      <span className="text-foreground/80 leading-none">{strand}</span>
                      {step !== null ? (
                        <span
                          className="rounded-full px-1.5 py-0.5 font-semibold tabular-nums text-[10px] leading-none"
                          style={{ backgroundColor: color, color: "#111", opacity: 0.9 }}
                        >
                          {step}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">—</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
          Weighted average of rated items (E×1 · D×2 · S×3). Numbers show best-fit step.
        </p>
      </div>
    </div>
  );
}
