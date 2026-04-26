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
- **Progress**: `src/lib/progress.ts` rolls up counts at step / strand / area / overall level.
- **Export/import**: per-child JSON & CSV from journal page; full backup JSON from Settings.
- **Print**: `/child/:id/summary` is print-styled (`.no-print` hides controls).
- **No backend**: no API calls, no auth, no DB.
- **Source PDF**: `attached_assets/EYIT_Development_Journal_2024_*.pdf` (parser at `/tmp/eyit/parse.mjs`, intermediate JSON at `/tmp/eyit/eyit.json`).

