import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Clerk proxy must come before body parsers (streams raw bytes)
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// Lock CORS to known trusted origins.
// In production, REPLIT_DOMAINS is comma-separated list of deployment domains.
// In development, allow the Replit picard preview domain and localhost.
const allowedOrigins: (string | RegExp)[] = process.env.REPLIT_DOMAINS
  ? process.env.REPLIT_DOMAINS.split(",").map((d) => `https://${d.trim()}`)
  : [/\.picard\.replit\.dev$/, /^https?:\/\/localhost(:\d+)?$/];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) {
        // Same-origin or server-to-server: allow
        callback(null, true);
        return;
      }
      const allowed = allowedOrigins.some((o) =>
        o instanceof RegExp ? o.test(origin) : o === origin,
      );
      callback(allowed ? null : new Error("Not allowed by CORS"), allowed);
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CLERK_PUBLISHABLE_KEY is the server-side copy of the publishable key (same value as
// VITE_CLERK_PUBLISHABLE_KEY but without the Vite prefix, which is only for frontend bundles).
// Both are provisioned together by setupClerkWhitelabelAuth().
app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY ?? process.env.VITE_CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

export default app;
