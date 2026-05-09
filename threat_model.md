# Threat Model

## Project Overview

This repository is a pnpm workspace monorepo for the EYIT Development Journal. The only current production-facing application in the repo snapshot is `artifacts/progress-journal`, a React + Vite web app that lets parents or practitioners record child development observations, dates of birth, progress ratings, history, and review notes. The journal is local-first: sensitive child data is stored in browser-managed persistence and can be exported to or restored from SQLite backup files. The same frontend also exposes a public `/contact` page that submits messages from the browser to Web3Forms.

The repo also contains `artifacts/mockup-sandbox`, which remains development-only and should be ignored unless production reachability is demonstrated. Earlier threat-model references to `artifacts/api-server` are stale for the current repo state and should not drive production scanning.

Assumptions for this scan: the mockup sandbox is never deployed to production, production traffic is protected by platform TLS, and `NODE_ENV` is `production` in deployed environments.

## Assets

- **Child profile data** — names, dates of birth, journal start dates, archive status, and derived age information stored in the browser or backup files. This is personal data about children and should not be exposed to unauthorized parties.
- **Assessment records** — per-statement progress ratings, rating history, stagnant notes, and acknowledgements. These records may reveal sensitive developmental information and must retain integrity.
- **Local backup files** — exported SQLite files contain portable copies of the full journal dataset. These backups are sensitive and also represent an untrusted import format when received from another device or person.
- **Browser-resident journal state** — the app’s privacy model depends on sensitive data remaining in same-origin browser storage and not being disclosed to unrelated third parties.
- **Support inbox and Web3Forms quota** — the public contact form can be abused to flood the support mailbox or consume third-party submission allowance, degrading availability for legitimate users.
- **Offline application shell** — the PWA service worker and cached static assets affect what code runs in the browser and therefore form part of the trusted client runtime.

## Trust Boundaries

- **Browser UI to local persistence** — user input crosses from React components into `localStorage`. Browser storage is not private from other code running in the same origin.
- **Imported backup file to application state** — `.db` files selected through browser file APIs are untrusted input and cross into in-memory and persisted state after parsing.
- **Application export to local files** — trusted in-browser state is serialized into user-managed backup files that may later be re-imported or shared.
- **Browser route params and imported fields to rendering** — child IDs, names, notes, and imported record fields are rendered back into the UI and used to construct internal links and summaries.
- **Browser to third-party contact endpoint** — the public `/contact` page sends attacker-controlled input directly from the browser to Web3Forms using a client-exposed access key, with no application server mediation.
- **Browser to external asset/CDN providers** — the production build may fetch external assets such as Google Fonts and uses a service worker to cache selected resources; those cross-origin fetches must not weaken the journal’s confidentiality model.

## Scan Anchors

- **Production entry points**: `artifacts/progress-journal/src/main.tsx`, `artifacts/progress-journal/src/App.tsx`, `artifacts/progress-journal/vite.config.ts`
- **Highest-risk code areas**: `artifacts/progress-journal/src/lib/store.ts`, `artifacts/progress-journal/src/lib/sqlite.ts`, `artifacts/progress-journal/src/lib/export.ts`, `artifacts/progress-journal/src/pages/home.tsx`, `artifacts/progress-journal/src/pages/child-journal.tsx`, `artifacts/progress-journal/src/pages/settings.tsx`, `artifacts/progress-journal/src/pages/contact.tsx`
- **Public vs authenticated vs admin surfaces**: all journal routes and `/contact` are public within the browser app; there is no server-enforced authenticated or admin surface in the current repo snapshot
- **Usually dev-only / out of scope**: `artifacts/mockup-sandbox/**`, `scripts/**`, generated bundles unless production reachability is shown

## Threat Categories

### Tampering

The application accepts untrusted local input through manual child entry and imported SQLite backups. Imported records must not poison application state, create unsafe object structures, or overwrite unrelated data beyond the explicitly intended merge scope.

### Information Disclosure

The primary security risk remains exposure of child profile and developmental assessment data. Local storage, backup files, rendered summaries, and any third-party resources loaded in the same origin must minimize unnecessary exposure. User-controlled fields imported from backups or entered in forms must not become a script-injection path that reveals data from the same origin.

### Denial of Service

Malformed or oversized backup files can consume browser memory or freeze the tab, so import parsing must stay bounded across all tables and fail closed on invalid data. The public contact form is also an availability surface: because submissions are sent directly from the browser to Web3Forms, abuse controls must not depend solely on client-enforced cooldowns or hidden fields that an attacker can bypass with direct requests.

### Elevation of Privilege

There is no admin-role system today, so classic privilege escalation is limited. The relevant guarantee is that untrusted data from imported files, route params, or contact-form input must not gain the ability to execute script, alter privileged runtime behavior, or access stored journal data beyond what the app explicitly renders.
