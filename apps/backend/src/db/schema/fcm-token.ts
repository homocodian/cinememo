import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { index, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

import { sessionTable, userTable } from "./user";

export const FCMTokenTable = pgTable(
  "fcm_token",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessionTable.id, { onDelete: "cascade" }),
    deviceId: text("device_id").notNull(),
    token: text("token").notNull()
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.deviceId] }),
    index("fcm_token_session_idx").on(t.sessionId)
  ]
);

export type FCMToken = InferSelectModel<typeof FCMTokenTable>;
export type CreateFCMToken = InferInsertModel<typeof FCMTokenTable>;

export const FCMTokenRelations = relations(FCMTokenTable, ({ one }) => ({
  user: one(userTable, {
    fields: [FCMTokenTable.userId],
    references: [userTable.id]
  })
}));
