; Custom NSIS installer fragment for EYIT Development Journal
;
; Silently installs the Microsoft Visual C++ 2015-2022 x64 Redistributable
; before the app is installed, but only when it is not already present.
;
; better-sqlite3 compiles a native .node binary that links against
; VCRUNTIME140.dll, VCRUNTIME140_1.dll, and MSVCP140.dll.  On machines that
; have never had the VC++ runtime installed (fresh PCs, classroom machines,
; Microsoft-Store-only machines) loading the native module causes a silent
; main-process crash — no window appears and the user has no feedback.
;
; Detection method: the VC++ 2015-2022 x64 redistributable writes
;   HKLM\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64 → Installed = 1
; when it is present.  If that key/value is absent or not equal to 1 the
; installer runs vc_redist.x64.exe /install /quiet /norestart and waits for
; it to complete before continuing.
;
; The vc_redist.x64.exe binary is placed in build/ and copied into the
; installer via the extraResources entry in electron-builder.yml.  It is NOT
; committed to git — download it with scripts/download-vcredist.sh (or the
; equivalent CI step) before running electron-builder.

!macro customInstall
  DetailPrint "Checking for Visual C++ 2015-2022 x64 Redistributable..."

  ; NSIS installers run as 32-bit processes.  Without SetRegView 64, reads of
  ; HKLM\SOFTWARE\... are silently redirected to HKLM\SOFTWARE\WOW6432Node\...
  ; on 64-bit systems, which would miss the key that the x64 VC++ runtime
  ; writes to the native (64-bit) hive.  Switch to 64-bit view for detection,
  ; then restore the default so subsequent NSIS operations are unaffected.
  SetRegView 64

  ; Read the registry key that the VC++ 2015-2022 x64 redist writes on install.
  ; ClearErrors first so we can distinguish a missing key from a zero value.
  ClearErrors
  ReadRegDWORD $0 HKLM "SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" "Installed"

  ; Restore the default registry view before any branching to guarantee it is
  ; always reset even if we goto an early label.
  SetRegView lastused

  ${If} ${Errors}
    DetailPrint "VC++ redistributable registry key not found — installing..."
    Goto InstallRedist
  ${ElseIf} $0 <> 1
    DetailPrint "VC++ redistributable not marked as installed (Installed=$0) — installing..."
    Goto InstallRedist
  ${Else}
    DetailPrint "VC++ redistributable already installed — skipping."
    Goto SkipRedist
  ${EndIf}

  InstallRedist:
    ; vc_redist.x64.exe is staged by electron-builder into $INSTDIR\resources\
    ; via the win.extraResources entry in electron-builder.yml.
    DetailPrint "Running vc_redist.x64.exe /install /quiet /norestart ..."
    ExecWait '"$INSTDIR\resources\vc_redist.x64.exe" /install /quiet /norestart' $1
    ${If} $1 == 0
      DetailPrint "VC++ redistributable installed successfully (exit code 0)."
    ${ElseIf} $1 == 3010
      ; 3010 = ERROR_SUCCESS_REBOOT_REQUIRED — the runtime was installed but a
      ; reboot is needed.  The app will still work on the current session because
      ; the DLLs are already on disk; we surface the exit code for transparency.
      DetailPrint "VC++ redistributable installed; a reboot may be required (exit code 3010)."
    ${Else}
      DetailPrint "VC++ redistributable installer exited with code $1."
      DetailPrint "The app may not launch if the runtime is missing."
    ${EndIf}
    ; Remove the redistributable binary from the installed resources directory
    ; — it is only needed at install time, not at runtime.
    Delete "$INSTDIR\resources\vc_redist.x64.exe"

  SkipRedist:
!macroend
