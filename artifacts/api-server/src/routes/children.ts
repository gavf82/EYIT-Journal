import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, childrenTable, ratingsTable, usersTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";
import type { Request, Response } from "express";
import {
  CreateChildBody,
  UpdateChildParams,
  UpdateChildBody,
  DeleteChildParams,
  GetChildRatingsParams,
  UpsertChildRatingsParams,
  UpsertChildRatingsBody,
} from "@workspace/api-zod";

const router = Router();

async function ensureUser(clerkUserId: string) {
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  if (existing.length === 0) {
    await db.insert(usersTable).values({
      id: clerkUserId,
      clerkUserId,
    });
  }
}

function dbChildToApi(row: typeof childrenTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    dob: row.dob,
    startDate: row.startDate,
    status: row.status,
    archivedAt: row.archivedAt ?? undefined,
    baselineStep: row.baselineStep != null ? Number(row.baselineStep) : undefined,
    isDemo: row.isDemo === "true",
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const { clerkUserId } = req as AuthenticatedRequest;
  await ensureUser(clerkUserId);
  const rows = await db
    .select()
    .from(childrenTable)
    .where(eq(childrenTable.clerkUserId, clerkUserId));
  res.json(rows.map(dbChildToApi));
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { clerkUserId } = req as AuthenticatedRequest;
  await ensureUser(clerkUserId);

  const parsed = CreateChildBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    return;
  }
  const body = parsed.data;

  const now = new Date();

  const [inserted] = await db
    .insert(childrenTable)
    .values({
      id: body.id,
      clerkUserId,
      name: body.name,
      dob: body.dob,
      startDate: body.startDate,
      status: body.status ?? "active",
      archivedAt: body.archivedAt ?? null,
      baselineStep: body.baselineStep != null ? String(body.baselineStep) : null,
      isDemo: body.isDemo ? "true" : "false",
      createdAt: body.createdAt ? new Date(body.createdAt) : now,
      updatedAt: body.updatedAt ? new Date(body.updatedAt) : now,
    })
    .onConflictDoNothing()
    .returning();

  if (!inserted) {
    const existing = await db
      .select()
      .from(childrenTable)
      .where(and(eq(childrenTable.id, body.id), eq(childrenTable.clerkUserId, clerkUserId)))
      .limit(1);
    if (existing[0]) {
      res.status(201).json(dbChildToApi(existing[0]));
      return;
    }
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.status(201).json(dbChildToApi(inserted));
});

router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  const { clerkUserId } = req as AuthenticatedRequest;

  const paramsParsed = UpdateChildParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid child id" });
    return;
  }
  const id = paramsParsed.data.id;

  const existing = await db
    .select()
    .from(childrenTable)
    .where(and(eq(childrenTable.id, id), eq(childrenTable.clerkUserId, clerkUserId)))
    .limit(1);

  if (!existing[0]) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  const bodyParsed = UpdateChildBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body", details: bodyParsed.error.flatten() });
    return;
  }
  const body = bodyParsed.data;

  const updates: Partial<typeof childrenTable.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (body.name !== undefined) updates.name = body.name;
  if (body.dob !== undefined) updates.dob = body.dob;
  if (body.startDate !== undefined) updates.startDate = body.startDate;
  if (body.status !== undefined) updates.status = body.status;
  if ("archivedAt" in body) updates.archivedAt = body.archivedAt ?? null;
  if ("baselineStep" in body)
    updates.baselineStep = body.baselineStep != null ? String(body.baselineStep) : null;
  if ("isDemo" in body) updates.isDemo = body.isDemo ? "true" : "false";

  const [updated] = await db
    .update(childrenTable)
    .set(updates)
    .where(and(eq(childrenTable.id, id), eq(childrenTable.clerkUserId, clerkUserId)))
    .returning();

  res.json(dbChildToApi(updated));
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const { clerkUserId } = req as AuthenticatedRequest;

  const paramsParsed = DeleteChildParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid child id" });
    return;
  }
  const id = paramsParsed.data.id;

  const existing = await db
    .select()
    .from(childrenTable)
    .where(and(eq(childrenTable.id, id), eq(childrenTable.clerkUserId, clerkUserId)))
    .limit(1);

  if (!existing[0]) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  await db
    .delete(childrenTable)
    .where(and(eq(childrenTable.id, id), eq(childrenTable.clerkUserId, clerkUserId)));

  res.status(204).send();
});

router.get("/:id/ratings", requireAuth, async (req: Request, res: Response) => {
  const { clerkUserId } = req as AuthenticatedRequest;

  const paramsParsed = GetChildRatingsParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid child id" });
    return;
  }
  const id = paramsParsed.data.id;

  const child = await db
    .select()
    .from(childrenTable)
    .where(and(eq(childrenTable.id, id), eq(childrenTable.clerkUserId, clerkUserId)))
    .limit(1);

  if (!child[0]) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  const ratings = await db
    .select()
    .from(ratingsTable)
    .where(eq(ratingsTable.childId, id));

  const ratingsMap: Record<string, { status: string; updatedAt: string; history?: unknown[] }> = {};
  for (const r of ratings) {
    ratingsMap[r.ratingKey] = {
      status: r.status,
      updatedAt: r.updatedAt,
      history: Array.isArray(r.history) ? (r.history as unknown[]) : undefined,
    };
  }

  res.json(ratingsMap);
});

router.put("/:id/ratings", requireAuth, async (req: Request, res: Response) => {
  const { clerkUserId } = req as AuthenticatedRequest;

  const paramsParsed = UpsertChildRatingsParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid child id" });
    return;
  }
  const id = paramsParsed.data.id;

  const child = await db
    .select()
    .from(childrenTable)
    .where(and(eq(childrenTable.id, id), eq(childrenTable.clerkUserId, clerkUserId)))
    .limit(1);

  if (!child[0]) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  const bodyParsed = UpsertChildRatingsBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid request body", details: bodyParsed.error.flatten() });
    return;
  }
  const body = bodyParsed.data;

  const values: (typeof ratingsTable.$inferInsert)[] = Object.entries(body).map(
    ([key, rating]) => ({
      childId: id,
      ratingKey: key,
      status: rating.status,
      updatedAt: rating.updatedAt,
      history: rating.history ?? null,
    }),
  );

  // Replace-set: atomically delete all existing ratings for this child
  // and re-insert the full payload. This ensures deleted ratings are removed.
  await db.transaction(async (tx) => {
    await tx.delete(ratingsTable).where(eq(ratingsTable.childId, id));
    if (values.length > 0) {
      await tx.insert(ratingsTable).values(values);
    }
  });

  const updated = await db
    .select()
    .from(ratingsTable)
    .where(eq(ratingsTable.childId, id));

  const ratingsMap: Record<string, { status: string; updatedAt: string; history?: unknown[] }> = {};
  for (const r of updated) {
    ratingsMap[r.ratingKey] = {
      status: r.status,
      updatedAt: r.updatedAt,
      history: Array.isArray(r.history) ? (r.history as unknown[]) : undefined,
    };
  }

  res.json(ratingsMap);
});

export default router;
