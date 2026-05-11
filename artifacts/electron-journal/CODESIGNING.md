# Code-Signing Setup Guide

The release workflow (`.github/workflows/release.yml`) and `electron-builder.yml` are
already fully configured to sign and notarize installers.  The only remaining step is
to obtain the certificates and store them as GitHub Actions secrets on the
`gavf82/EYIT-Journal` repository.

Once all secrets are in place, push a tag (`git tag v1.x.x && git push --tags`) and the
workflow will produce signed installers that install without SmartScreen or Gatekeeper
warnings.

---

## Windows — OV or EV Code-Signing Certificate

### 1. Purchase the certificate

Buy an **OV (Organization Validation)** or **EV (Extended Validation)** certificate from
a Microsoft-trusted CA.  Recommended providers:

| Provider | Notes |
|---|---|
| [DigiCert](https://www.digicert.com/signing/code-signing-certificates) | EV available on hardware token or cloud HSM |
| [Sectigo](https://sectigo.com/ssl-certificates-tls/code-signing) | Competitive OV pricing |
| [GlobalSign](https://www.globalsign.com/en/code-signing-certificate/) | Well-known CA |

> **EV vs OV**: EV certificates grant immediate SmartScreen reputation (no warning on
> first install).  OV certificates suppress the "Unknown Publisher" dialog but may still
> trigger SmartScreen until the app builds a download reputation.  EV certificates must
> be delivered on a hardware token or cloud HSM — you cannot export the private key.

### 2. Export the PFX (OV only)

For OV certificates the CA delivers a `.pfx` / `.p12` file directly.  Skip this step
for EV (see note below).

```bash
# If you have a .cer + private key pair, combine them:
openssl pkcs12 -export -in certificate.cer -inkey private.key -out certificate.pfx
```

### 3. Base64-encode the PFX

```bash
# macOS / Linux
base64 -i certificate.pfx | tr -d '\n' > certificate.pfx.b64

# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("certificate.pfx")) | Out-File -NoNewline certificate.pfx.b64
```

### 4. Add GitHub Actions secrets

Go to **GitHub → gavf82/EYIT-Journal → Settings → Secrets and variables → Actions**
and create:

| Secret name | Value |
|---|---|
| `WIN_CSC_LINK` | Contents of `certificate.pfx.b64` (the base64 string) |
| `WIN_CSC_KEY_PASSWORD` | Password you set when exporting the PFX |

> **EV certificates on hardware tokens**: electron-builder cannot use a hardware token
> in a headless CI environment.  Use a cloud HSM signing service such as
> [DigiCert KeyLocker](https://www.digicert.com/signing/keylocker) or
> [SSL.com eSigner](https://www.ssl.com/esigner/) and follow their GitHub Actions
> integration guide instead of the `WIN_CSC_LINK` approach.

---

## macOS — Developer ID Application Certificate

### 1. Enrol in the Apple Developer Program

- Cost: **USD 99 / year**
- Enrol at <https://developer.apple.com/programs/enroll/>
- Individual membership is sufficient for a Developer ID certificate.

### 2. Create a Developer ID Application certificate

1. Open **Xcode → Settings → Accounts**, sign in with your Apple ID, and click
   **Manage Certificates**.
2. Click **+** and choose **Developer ID Application**.
3. Alternatively, use the Apple Developer portal:
   <https://developer.apple.com/account/resources/certificates/add>

### 3. Export the .p12

1. In **Keychain Access**, find the certificate under **My Certificates**.
2. Right-click → **Export** → choose `.p12` format.
3. Set a strong export password — you will need it for `CSC_KEY_PASSWORD`.

### 4. Base64-encode the .p12

```bash
base64 -i DeveloperID.p12 | tr -d '\n' > DeveloperID.p12.b64
```

### 5. Generate an app-specific password for notarization

1. Sign in at <https://appleid.apple.com>.
2. Go to **Sign-In and Security → App-Specific Passwords → Generate**.
3. Label it something like "EYIT Journal CI".

### 6. Find your Team ID

Your 10-character Team ID is shown in the Apple Developer portal under
**Membership → Team ID**, or in Xcode under **Settings → Accounts → (your account) →
Team ID**.

### 7. Add GitHub Actions secrets

| Secret name | Value |
|---|---|
| `CSC_LINK` | Contents of `DeveloperID.p12.b64` |
| `CSC_KEY_PASSWORD` | Export password you set in step 3 |
| `APPLE_ID` | Your Apple ID email (e.g. `you@example.com`) |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password from step 5 |
| `APPLE_TEAM_ID` | Your 10-character Team ID from step 6 |

---

## Verifying the setup

1. Bump the version in `artifacts/electron-journal/package.json`.
2. Commit and push, then create a matching tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. Watch the **Actions** tab on GitHub — the `Release` workflow will run across Linux,
   Windows, and macOS runners.
4. Download the Windows `.exe` installer and the macOS `.dmg` from the resulting GitHub
   Release and install them on clean machines to confirm no security warnings appear.

---

## What the workflow does automatically

- `WIN_CSC_LINK` / `WIN_CSC_KEY_PASSWORD` absent → Windows build proceeds **unsigned**
  (SmartScreen warning appears).
- `CSC_LINK` / `CSC_KEY_PASSWORD` absent → macOS build proceeds **unsigned**
  (Gatekeeper quarantine warning appears).
- All macOS secrets present → electron-builder signs *and* notarizes the `.dmg`
  automatically via Apple's notary service.
