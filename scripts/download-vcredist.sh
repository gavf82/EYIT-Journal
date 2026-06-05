#!/usr/bin/env bash
# download-vcredist.sh — fetch the Microsoft Visual C++ 2015-2022 x64
# Redistributable and save it to artifacts/electron-journal/build/.
#
# Run this before building the Windows installer with electron-builder:
#
#   bash scripts/download-vcredist.sh
#   pnpm --filter @workspace/electron-journal dist
#
# The resulting build/vc_redist.x64.exe is listed in .gitignore and must
# be downloaded fresh in CI (see the GitHub Actions workflow steps below).
#
# Microsoft's official permalink for the VS 2022 (14.x) x64 redist:
#   https://aka.ms/vs/17/release/vc_redist.x64.exe
# This URL always resolves to the latest patched build of the runtime.

set -euo pipefail

DEST="artifacts/electron-journal/build/vc_redist.x64.exe"
URL="https://aka.ms/vs/17/release/vc_redist.x64.exe"

if [ -f "$DEST" ]; then
  echo "vc_redist.x64.exe already present at $DEST — skipping download."
  exit 0
fi

echo "Downloading VC++ 2015-2022 x64 redistributable..."
echo "  Source : $URL"
echo "  Target : $DEST"

curl -fL --retry 3 --retry-delay 5 -o "$DEST" "$URL"

SIZE=$(du -sh "$DEST" | cut -f1)
echo "Done. $DEST ($SIZE)"
