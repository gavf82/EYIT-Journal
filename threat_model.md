# Threat Model

## Project Overview

This repository is a pnpm workspace monorepo for the EYIT Development Journal. The production-relevant application is `artifacts/progress-journal`, a React + Vite web app that lets parents or practitioners record child development observations, dates of birth, and progress ratings. It is a local-first application with no production backend calls today; data is stored in the browser and can be exported to or restored from SQLite backup files. The repo also contains `artifacts/api-server`, an Express server with only a health endpoint today, plus a `mockup-sandbox` artifact that is development-only and should be ignored unless production reachability is demonstrated.

Assumptions for this scan: the mockup sandbox is never deployed to production, production traffic is protected by platform TLS, and `NODE_ENV` is `production` in deployed environments.

## Assets

- **Child profile data** — names, dates of birth, journal start dates, and derived age information stored in the browser or backup files. This is personal data about children and should not be exposed to unauthorized parties.
- **Assessment records** — per-statement progress ratings and rating history. These records may reveal sensitive developmental information and must retain integrity.
- **Local backup files** — exported SQLite files that contain the full journal dataset. They are portable copies of the sensitive records above and are easy to leak if mishandled.
- **Application availability and integrity** — the browser app must not allow malformed local data imports to corrupt the journal state or make the UI unsafe to use.
- **Server runtime and logs** — if `artifacts/api-server` is deployed, request logs and server configuration become security-relevant even though the current route surface is minimal.

## Trust Boundaries

- **Browser UI to local persistence** — user input crosses from the React UI into `localStorage` and exported backup files. The browser storage layer is not private from other code running in the same origin.
- **Imported file to application state** — `.db` files opened through the browser file APIs are untrusted input and cross into the in-memory and persisted store after parsing.
- **Browser route params and query state to rendering** — child IDs, names, and imported record fields are rendered back into the UI and used to construct internal links.
- **Frontend bundle to optional API server** — the shared client and API libraries can issue network requests if the placeholder server grows into a real backend.
- **Public internet to Express server** — `artifacts/api-server` accepts unauthenticated HTTP requests. Even the current `/api/healthz` route must avoid leaking internals, logging secrets, or enabling unsafe defaults that become exploitable as routes are added.

## Scan Anchors

- **Production entry points**: `artifacts/progress-journal/src/main.tsx`, `artifacts/api-server/src/index.ts`
- **Highest-risk code areas**: `artifacts/progress-journal/src/lib/store.ts`, `artifacts/progress-journal/src/lib/sqlite.ts`, `artifacts/progress-journal/src/lib/export.ts`, `artifacts/progress-journal/src/pages/home.tsx`, `artifacts/progress-journal/src/pages/settings.tsx`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/lib/logger.ts`
- **Public vs authenticated vs admin surfaces**: all current production routes are effectively public/local-only; there is no auth boundary and no admin surface today
- **Usually dev-only / out of scope**: `artifacts/mockup-sandbox/**`, `scripts/**`, generated type packages unless production reachability is shown

## Threat Categories

### Tampering

The application accepts untrusted local input through manual child entry and imported SQLite backups. Imported records must not be able to poison application state, create unsafe object structures, or overwrite unrelated data beyond the explicitly merged journal content. Backup parsing and merge logic must validate file structure and preserve data integrity when replacing or combining children and ratings.

### Information Disclosure

The primary security risk in this project is exposure of child profile and developmental assessment data. The application stores data in browser-managed persistence and exports full backups to local files, so the system must minimize unnecessary exposure, avoid leaking records through logs or client-side injection, and treat exported files as sensitive. If the API server is expanded later, responses and logs must avoid exposing cookies, auth headers, or personal data.

### Denial of Service

Because the app imports and parses local backup files in the browser, malformed or oversized files could consume memory or crash the tab. The application should keep file parsing bounded and fail closed on invalid backups so that untrusted local files cannot make the journal unusable.

### Elevation of Privilege

There is no user-role system today, so classic privilege escalation is limited. The relevant guarantee is that untrusted data from imported files, route params, or future API inputs must not gain the ability to execute script, alter privileged runtime behavior, or access resources outside the intended journal data model. If the Express server later gains authenticated routes, authorization checks must be added server-side rather than assumed from the client.
