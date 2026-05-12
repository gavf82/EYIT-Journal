// No-op Windows code signing script for CI builds without a certificate.
//
// electron-builder 24.x always calls app-builder.exe during the Windows
// sign step — even when WIN_CSC_LINK is absent — and that binary crashes
// on GitHub Actions Windows runners.  Pointing win.sign here bypasses the
// app-builder call entirely.
//
// When a real certificate is available, set WIN_CSC_LINK / WIN_CSC_KEY_PASSWORD
// as GitHub secrets and replace this file with proper signtool integration.

exports.default = async function sign(configuration) {
  if (!process.env.WIN_CSC_LINK) {
    console.log(
      "WIN_CSC_LINK not set — skipping Windows code signing (CI build)."
    );
    return;
  }
  // Placeholder: add signtool / AzureSignTool call here when a cert is ready.
  console.log("WIN_CSC_LINK present but custom sign script has no signer configured.");
};
