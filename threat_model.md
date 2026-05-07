# Threat Model

## Project Overview

This repository is a pnpm workspace monorepo for the EYIT Development Journal. The main production-facing application is `artifacts/progress-journal`, a React + Vite web app that lets parents or practitioners record child development observations, dates of birth, and progress ratings. The journal is still primarily local-first: sensitive child data is stored in browser-managed persistence and can be exported to or restored from SQLite backup files. The same frontend also exposes a public `/contact` page that submits messages directly from the browser to Web3Forms.

The repo also contains `artifacts/api-server`, an Express service with a health endpoint, Clerk middleware, a Clerk frontend-API proxy route, and authenticated `/api/children` CRUD and ratings routes backed by PostgreSQL via Drizzle. The `mockup-sandbox` artifact is development-only and should be ignored unless production reachability is demonstrated.

Assumptions for this scan: the mockup sandbox is never deployed to production, production traffic is protected by platform TLS, and `NODE_ENV` is `production` in deployed environments.

## Assets

- **Child profile data** — names, dates of birth, journal start dates, archive status, and derived age information stored in the browser, backup files, or optional backend records. This is personal data about children and should not be exposed to unauthorized parties.
- **Assessment records** — per-statement progress ratings, rating history, stagnant notes, and acknowledgements. These records may reveal sensitive developmental information and must retain integrity.
- **Local backup files** — exported SQLite files contain portable copies of the full journal dataset. These backups are sensitive and also represent an untrusted import format when received from another device or person.
- **Authenticated API data** — if `artifacts/api-server` is deployed, the `children` and `ratings` tables become security-relevant multi-user records protected by Clerk identity and server-side ownership checks.
- **Authentication proxy boundary** — the Clerk proxy path and related host/proxy configuration are security-sensitive because mistakes there can weaken sign-in protections or misroute authentication traffic.
- **Support inbox and Web3Forms quota** — the public contact form can be abused to flood the support mailbox or consume third-party submission allowance, degrading availability for legitimate users.
- **Server runtime and logs** — request metadata, auth context, and configuration in the Express server must not leak secrets or personal data.

## Trust Boundaries

- **Browser UI to local persistence** — user input crosses from React components into `localStorage`. Browser storage is not private from other code running in the same origin.
- **Imported backup file to application state** — `.db` files selected through browser file APIs are untrusted input and cross into in-memory and persisted state after parsing.
- **Application export to local files** — trusted in-browser state is serialized into user-managed backup files that may later be re-imported or shared.
- **Browser route params and imported fields to rendering** — child IDs, names, notes, and imported record fields are rendered back into the UI and used to construct internal links and summaries.
- **Browser to third-party contact endpoint** — the public `/contact` page sends attacker-controlled input directly from the browser to Web3Forms using a client-side access key, with no application server mediation.
- **Public internet to Express server** — `artifacts/api-server` accepts unauthenticated HTTP requests, including the Clerk proxy path and health route.
- **Express server to Clerk Frontend API** — proxy requests cross from application-controlled middleware into Clerk infrastructure using sensitive headers such as `Clerk-Secret-Key`, `Clerk-Proxy-Url`, and `X-Forwarded-For`.
- **Express server to PostgreSQL** — authenticated API routes use Drizzle to read and mutate child and rating records; authorization must be enforced before any database access is returned to the caller.

## Scan Anchors

- **Production entry points**: `artifacts/progress-journal/src/main.tsx`, `artifacts/api-server/src/index.ts`
- **Highest-risk code areas**: `artifacts/progress-journal/src/lib/store.ts`, `artifacts/progress-journal/src/lib/sqlite.ts`, `artifacts/progress-journal/src/lib/export.ts`, `artifacts/progress-journal/src/pages/home.tsx`, `artifacts/progress-journal/src/pages/child-journal.tsx`, `artifacts/progress-journal/src/pages/settings.tsx`, `artifacts/progress-journal/src/pages/contact.tsx`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts`, `artifacts/api-server/src/routes/children.ts`, `artifacts/api-server/src/lib/logger.ts`
- **Public vs authenticated vs admin surfaces**: journal pages and `/contact` are public; `/api/children/**` is authenticated through Clerk; there is no admin surface today
- **Usually dev-only / out of scope**: `artifacts/mockup-sandbox/**`, `scripts/**`, generated packages unless production reachability is shown

## Threat Categories

### Spoofing

If the Express server is deployed, the authentication boundary depends on Clerk middleware and the Clerk frontend-API proxy being configured with trusted host and client-IP information. Proxy-related headers, host-derived Clerk configuration, and any future webhook or callback endpoints must only trust values supplied by known infrastructure rather than raw client input.

### Tampering

The application accepts untrusted local input through manual child entry and imported SQLite backups. Imported records must not poison application state, create unsafe object structures, or overwrite unrelated data beyond the explicitly intended merge scope. On the backend, authenticated users must only be able to mutate their own child and rating records.

### Information Disclosure

The primary security risk remains exposure of child profile and developmental assessment data. Local storage, backup files, API responses, and logs must minimize unnecessary exposure. User-controlled fields imported from backups or entered in forms must not become a script-injection path that reveals data from the same origin.

### Denial of Service

Malformed or oversized backup files can consume browser memory or freeze the tab, so import parsing must stay bounded across all tables and fail closed on invalid data. The public contact form is also an availability surface: if abuse protections are weak, attackers can flood the support inbox or exhaust third-party submission quota.

### Elevation of Privilege

There is no admin-role system today, so classic privilege escalation is limited. The relevant guarantee is that untrusted data from imported files, route params, contact-form input, or future API inputs must not gain the ability to execute script, alter privileged runtime behavior, or bypass server-side ownership checks. If the API surface grows, authorization must continue to be enforced on the server rather than assumed from the client.
