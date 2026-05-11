# Changelog

All notable changes to the EYIT Development Journal desktop app are listed here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.0] — 2026-05-11

### Added
- First packaged desktop release for macOS (x64 / arm64), Windows (x64), and Linux (x64 AppImage).
- Full EYIT Development Journal (September 2024) — 7 areas, 18 strands, ~1 058 statements across ~120 steps.
- Multi-child support: add, archive, and switch between children in a single local database.
- Traffic-light rating system — Emerging, Developing, and Secure — with full rating history per statement.
- Age-based step filter: collapses each strand to the step most relevant to the child's current age.
- Per-statement review notes and stagnation acknowledgement workflow.
- Print-optimised summary view mimicking the original PDF layout (A4 landscape).
- SQLite-backed local database stored in the user's Documents folder (`EYIT Journal/journal.db`).
- Rolling startup backups (keeps the five most recent) with one-click restore from Settings.
- Manual full backup export and import from Settings.
- Per-child SQLite export from the child journal page.
- Silent automatic updates via GitHub Releases — the app checks for updates on launch and notifies when one is ready to install.
- Relocatable journal file: move the database to any folder from Settings without losing data.
- Demo child pre-loaded on first launch so users can explore the app before adding real children.
