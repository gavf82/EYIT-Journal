import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

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
});
