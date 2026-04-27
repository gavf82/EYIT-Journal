# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### `progress-journal` — EYIT Development Journal (web)

Frontend-only React + Vite app at `artifacts/progress-journal` (preview path `/`).
Lets parents/practitioners log a child's progress against the
EYIT Development Journal (September 2024). Supports multiple children.
Each statement can be marked **Emerging**, **Developing**, or **Secure**, or left blank.

- **Routing**: `wouter` (`/`, `/child/:id`, `/child/:id/summary`, `/settings`).
- **State**: localStorage via `src/lib/store.ts`. Shape: `{ children: Child[]; ratings: Record<string, Rating> }`. Rating key format: `${childId}::${areaIdx}::${strandIdx}::${stepIdx}::${itemKey}`.
- **Curriculum data**: `src/data/journal.ts` (~236 KB, generated from the source PDF). 7 areas → 18 strands → ~120 steps → 1058 statements. Steps with `note: true` are informational only.
- **Progress**: `src/lib/progress.ts` rolls up counts at step / strand / area / overall level. Optional `StepVisibility` map (built by `buildStepVisibility` in the same module) constrains counts to a subset of step indices per `${areaIdx}::${strandIdx}` key.
- **Status palette**: Traffic-light system in soft pastels — Emerging = pastel red (`hsl(5 72% 66%)`), Developing = pastel amber (`hsl(38 88% 62%)`), Secure = pastel green (`hsl(130 45% 55%)`). Defined as CSS vars `--status-emerging` / `--status-developing` / `--status-secure` in `src/index.css`. Tinted backgrounds use `/0.15`–`/0.22` alpha and the matching dark text shades (`hsl(5 60% 32%)`, `hsl(30 70% 28%)`, `hsl(130 55% 22%)`).
- **Age filter**: When on, each strand collapses to exactly one "current" step — the higher of (a) the highest step whose `ageRange` covers the child's age in months, or (b) the highest step that already has any rating. Steps within each strand render highest→lowest. All counts (overall / area / strand / step pills) reflect only the visible steps.
- **Export/import**: per-child JSON & CSV from journal page; full backup JSON from Settings.
- **Print**: `/child/:id/summary` mimics the original PDF layout — **A4 landscape** with `1.4cm × 1.8cm` page margins (set via `@page` in `src/index.css`). Output starts with a print-only cover page (child name / DOB / journal start date / generated date / overall rated count), then one strand per page. Each strand is a `.journal-strand-header` yellow title bar ("Area: STRAND") followed by one `.journal-step-table` per step that has any ratings — header row "Step N (age) | Emerging | Developing | Secure", then one row per **rated** item (lettered, ✓ in the correct column). Unrated items and steps with zero ratings are omitted. Each `.journal-step-table` uses `break-inside: avoid` so a single step never splits across pages; if a strand has more step tables than fit, the next step table starts on a fresh page. Screen view also shows summary stats and a "by area" grid (both `no-print`).
- **No backend**: no API calls, no auth, no DB.
- **Source PDF**: `attached_assets/EYIT_Development_Journal_2024_*.pdf` (parser at `/tmp/eyit/parse.mjs`, intermediate JSON at `/tmp/eyit/eyit.json`).

