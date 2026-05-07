import { pgTable, text, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { childrenTable } from "./children";

export const ratingsTable = pgTable(
  "ratings",
  {
    childId: text("child_id")
      .notNull()
      .references(() => childrenTable.id, { onDelete: "cascade" }),
    ratingKey: text("rating_key").notNull(),
    status: text("status").notNull(),
    updatedAt: text("updated_at").notNull(),
    history: jsonb("history"),
  },
  (table) => [primaryKey({ columns: [table.childId, table.ratingKey] })],
);

export type DbRating = typeof ratingsTable.$inferSelect;
export type InsertDbRating = typeof ratingsTable.$inferInsert;
