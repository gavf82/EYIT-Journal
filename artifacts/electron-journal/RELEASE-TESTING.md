# Release Testing Checklist

Run through this checklist on a clean machine (or a fresh VM) for each platform
before announcing a release to users.  "Clean" means the app has never been
installed on that machine before.

---

## Prerequisites

1. Code-signing certificates are configured (see `CODESIGNING.md`).
2. The release tag matches `package.json` version — the `validate` CI job catches
   mismatches, but double-check before downloading installers.
3. Download the installers from the GitHub Release page on the target machine
   (do not copy from a dev machine — the quarantine/download flag is part of what
   is being tested).

---

## Windows — NSIS installer (`.exe`)

### Building locally (pre-flight)

Before running `electron-builder` on Windows (or to reproduce the CI build
locally), download the VC++ redistributable first:

```bash
# From the repo root:
bash scripts/download-vcredist.sh
```

This saves `artifacts/electron-journal/build/vc_redist.x64.exe` (~25 MB).
The file is `.gitignore`d — it must be present before `pnpm dist` runs.
CI downloads it automatically in the "Download VC++ redistributable" step.

### Installation

- [ ] Download `EYIT-Development-Journal-Setup-x.x.x.exe` from the GitHub Release.
- [ ] Double-click the installer.
- [ ] **VC++ redistributable check**: if the target machine has never had the
      VC++ 2015-2022 x64 runtime installed, the installer's detail view should
      briefly show "Running vc_redist.x64.exe /install /quiet /norestart…"
      before continuing.  On machines where it is already present the step is
      skipped silently.
- [ ] **SmartScreen check**: no "Windows protected your PC" dialog appears.
      If SmartScreen fires, note the publisher name shown — it should match the
      certificate CN.  An OV cert may still trigger SmartScreen until the app
      builds download reputation; an EV cert should not.
- [ ] The NSIS installer wizard opens cleanly.
- [ ] Accept the default installation directory and complete the installation.
- [ ] A desktop shortcut and Start Menu entry are created.

### First launch

- [ ] Launch the app from the desktop shortcut.
- [ ] The main window opens within 5 seconds with no crash dialog.
- [ ] The app title bar shows "EYIT Development Journal" (not "Electron").
- [ ] The app icon in the taskbar and title bar is the EYIT icon, not the default
      Electron icon.
- [ ] Add a child, set a rating, and close the app.  Re-open — the data persists.
- [ ] Open **Settings** and confirm the journal path shown is inside
      `Documents\EYIT Journal\`.

### Updater

- [ ] If an older version was previously released, install that version first and
      then launch — the updater should detect the newer release and show the
      "update available" notification.
- [ ] Clicking "Install update" quits and reinstalls cleanly.

### Uninstall

- [ ] Uninstall via **Add or remove programs** — the app and shortcuts are removed,
      and the journal file in `Documents\EYIT Journal\` is **not** deleted.

---

## macOS — DMG (`.dmg`)

### Installation

- [ ] Download `EYIT-Development-Journal-x.x.x-arm64.dmg` (Apple Silicon) or the
      `x64` variant for Intel, from the GitHub Release.
- [ ] Double-click the DMG.
- [ ] **Gatekeeper check**: no "can't be opened because it is from an unidentified
      developer" dialog appears.  If Gatekeeper fires, open **Terminal** and run
      `spctl --assess -vv /Volumes/EYIT*/EYIT*.app` to see the assessment result;
      a notarized app should report `accepted` with source `Notarized Developer ID`.
- [ ] The DMG mounts and shows the app + Applications alias.
- [ ] Drag the app to Applications.
- [ ] Eject the DMG.

### First launch

- [ ] Open the app from Applications (or Spotlight).
- [ ] **No quarantine prompt** on first launch.
- [ ] The main window opens within 5 seconds with no crash report.
- [ ] The menu bar shows "EYIT Development Journal" as the app name.
- [ ] The Dock icon is the EYIT icon, not the default Electron icon.
- [ ] Add a child, set a rating, and quit (`Cmd+Q`).  Re-open — the data persists.
- [ ] Open **Settings** and confirm the journal path shown is inside
      `~/Documents/EYIT Journal/`.

### Updater

- [ ] Same as the Windows updater test above, applied to macOS.

### Removal

- [ ] Drag the app from Applications to Trash — the journal file in
      `~/Documents/EYIT Journal/` is **not** deleted.

---

## Issues found — resolution guide

| Symptom | Likely cause | Fix |
|---|---|---|
| SmartScreen warning (Windows) | OV cert without download reputation, or cert missing | Use EV cert, or wait for reputation to build |
| Gatekeeper quarantine (macOS) | Missing notarization or signing failed | Check CI logs for notarization errors; verify `APPLE_*` secrets |
| Default Electron icon | `build/icons/` directory missing icon files | Add `icon.ico` (Windows), `icon.icns` (macOS), `icon.png` (Linux) — see `build/icons/README.md` |
| Crash on first launch | Database init error or missing native module | Run with `--enable-logging` flag and check `%APPDATA%\EYIT Development Journal\logs\` (Windows) or `~/Library/Logs/EYIT Development Journal/` (macOS) |
| "Unknown publisher" in installer | Certificate CN mismatch | Ensure the `WIN_CSC_LINK` PFX uses the correct org name |
| Updater URL mismatch | `owner`/`repo` in `electron-builder.yml` wrong | Verify `publish.owner` and `publish.repo` match the actual GitHub repo |
| Journal path wrong on first run | Path logic uses stale env var | Check `getDefaultJournalPath()` in `src/main/index.ts` |

---

## After a clean pass

Once all items are checked on both platforms:

1. Mark the GitHub Release as **Latest** (remove the Draft/Pre-release flag if set).
2. Announce availability in the project channel / release notes.
