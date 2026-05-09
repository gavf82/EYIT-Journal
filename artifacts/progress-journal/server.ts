import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Trust exactly one hop (the Replit reverse proxy) so req.ip reflects the
// real client address rather than the proxy's address. Setting this to 1
// means Express strips the rightmost X-Forwarded-For entry (the proxy's) and
// returns the next one as req.ip. Clients cannot spoof this because they
// cannot control what the trusted proxy appends on the right.
app.set("trust proxy", 1);

const PORT = Number(process.env.PORT ?? 3000);
const WEB3FORMS_KEY = process.env.WEB3FORMS_KEY;

const allowedOrigins = new Set(
  (process.env.REPLIT_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean)
    .flatMap((d) => [`https://${d}`, `http://${d}`]),
);

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000;

setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_MS;
  for (const [ip, ts] of rateLimitMap) {
    if (ts < cutoff) rateLimitMap.delete(ip);
  }
}, 5 * 60_000).unref();

app.use(express.json({ limit: "16kb" }));

app.post("/api/contact", async (req, res) => {
  if (process.env.NODE_ENV === "production" && allowedOrigins.size > 0) {
    const origin = req.headers.origin ?? "";
    if (!allowedOrigins.has(origin)) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }
  }

  if (!WEB3FORMS_KEY) {
    res.status(503).json({ success: false, message: "Contact form not configured" });
    return;
  }

  // req.ip is derived by Express using the trust proxy setting above.
  // With trust proxy = 1, Express uses the value the Replit reverse proxy
  // inserted into X-Forwarded-For (the rightmost entry), which clients
  // cannot forge because the trusted proxy always appends after them.
  const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";

  const lastSubmit = rateLimitMap.get(ip) ?? 0;
  const elapsed = Date.now() - lastSubmit;
  if (elapsed < RATE_LIMIT_MS) {
    const waitSecs = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
    res.status(429).json({
      success: false,
      message: `Please wait ${waitSecs} seconds before sending another message.`,
    });
    return;
  }

  const body = req.body as Record<string, unknown>;

  if (body.honeypot) {
    res.json({ success: true });
    return;
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !subject || !message) {
    res.status(400).json({ success: false, message: "All fields are required." });
    return;
  }

  try {
    const upstream = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, name, email, subject, message }),
    });

    const data = (await upstream.json()) as { success?: boolean; message?: string };
    if (!upstream.ok || !data.success) {
      throw new Error(data.message ?? "Submission failed. Please try again.");
    }

    rateLimitMap.set(ip, Date.now());
    res.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
    res.status(500).json({ success: false, message: msg });
  }
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "public");
app.use(express.static(distDir));
// Express 5 / path-to-regexp v8 does not accept bare "*" as a route pattern.
// Use a regex to match all remaining GET requests for SPA fallback.
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  process.stderr.write(`Server listening on port ${PORT}\n`);
  if (process.env.NODE_ENV === "production" && allowedOrigins.size === 0) {
    process.stderr.write(
      "WARNING: REPLIT_DOMAINS is not set. Origin validation for /api/contact is disabled.\n" +
      "Set REPLIT_DOMAINS to the comma-separated list of production hostnames to enable it.\n",
    );
  }
  if (!WEB3FORMS_KEY) {
    process.stderr.write(
      "WARNING: WEB3FORMS_KEY is not set. The /api/contact endpoint will return 503.\n",
    );
  }
});
