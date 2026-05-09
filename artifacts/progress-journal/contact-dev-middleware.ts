import type { IncomingMessage, ServerResponse } from "http";

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000;

setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_MS;
  for (const [ip, ts] of rateLimitMap) {
    if (ts < cutoff) rateLimitMap.delete(ip);
  }
}, 5 * 60_000).unref();

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>);
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

export function contactApiMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) {
  if (req.url !== "/api/contact" || req.method !== "POST") {
    next();
    return;
  }

  const WEB3FORMS_KEY = process.env.WEB3FORMS_KEY;
  if (!WEB3FORMS_KEY) {
    sendJson(res, 503, { success: false, message: "Contact form not configured" });
    return;
  }

  readJsonBody(req)
    .then(async (body) => {
      if (body.honeypot) {
        sendJson(res, 200, { success: true });
        return;
      }

      // In the Vite dev server there is no reverse proxy in front, so the
      // socket remoteAddress is the real client address. Using the socket
      // address (rather than any X-Forwarded-For value) prevents spoofing.
      const ip =
        (req.socket as { remoteAddress?: string }).remoteAddress ?? "unknown";

      const lastSubmit = rateLimitMap.get(ip) ?? 0;
      const elapsed = Date.now() - lastSubmit;
      if (elapsed < RATE_LIMIT_MS) {
        const waitSecs = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
        sendJson(res, 429, {
          success: false,
          message: `Please wait ${waitSecs} seconds before sending another message.`,
        });
        return;
      }

      const name = typeof body.name === "string" ? body.name.trim() : "";
      const email = typeof body.email === "string" ? body.email.trim() : "";
      const subject = typeof body.subject === "string" ? body.subject.trim() : "";
      const message = typeof body.message === "string" ? body.message.trim() : "";

      if (!name || !email || !subject || !message) {
        sendJson(res, 400, { success: false, message: "All fields are required." });
        return;
      }

      try {
        // Forward the browser's Origin as Referer so Web3Forms can identify
        // the submitting domain. Without this, server-side requests arrive
        // with no Referer and Web3Forms may block them as unknown domains.
        const originHeader = (req.headers as Record<string, string | undefined>)["origin"] ?? "";
        const upstream = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(originHeader ? { Referer: originHeader } : {}),
          },
          body: JSON.stringify({ access_key: WEB3FORMS_KEY, name, email, subject, message }),
        });

        const data = (await upstream.json()) as { success?: boolean; message?: string };
        if (!upstream.ok || !data.success) {
          throw new Error(data.message ?? "Submission failed. Please try again.");
        }

        rateLimitMap.set(ip, Date.now());
        sendJson(res, 200, { success: true });
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        sendJson(res, 500, { success: false, message: msg });
      }
    })
    .catch(() => {
      sendJson(res, 500, { success: false, message: "Something went wrong. Please try again." });
    });
}
