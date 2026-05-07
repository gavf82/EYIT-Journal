import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const childrenTable = pgTable("children", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id")
    .notNull()
    .references(() => usersTable.clerkUserId, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dob: text("dob").notNull(),
  startDate: text("start_date").notNull(),
  status: text("status").notNull().default("active"),
  archivedAt: text("archived_at"),
  baselineStep: text("baseline_step"),
  isDemo: text("is_demo").default("false"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DbChild = typeof childrenTable.$inferSelect;
export type InsertDbChild = typeof childrenTable.$inferInsert;
