import {
  InferInsertModel,
  InferSelectModel,
  relations,
  sql
} from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

import { userTable } from "./user";

export const noteCategory = ["general", "important"] as const;

export const noteCategoryEnum = pgEnum("note_category", noteCategory);

export type NoteCategory = (typeof noteCategoryEnum.enumValues)[number];

export const noteTable = pgTable(
  "note",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    text: text("text").notNull(),
    category: noteCategoryEnum("category").notNull().default("general"),
    isComplete: boolean("is_complete").notNull().default(false),

    userId: integer("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
      mode: "date"
    }).default(sql`NULL`),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  (t) => [index("user_idx").on(t.userId)]
);

export type Note = InferSelectModel<typeof noteTable>;
export type CreateNote = InferInsertModel<typeof noteTable>;

export const noteRelations = relations(noteTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [noteTable.userId],
    references: [userTable.id]
  }),
  sharedWith: many(notesToUsersTable)
}));

export const notesToUsersTable = pgTable(
  "notes_to_users",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    noteId: uuid("note_id")
      .notNull()
      .references(() => noteTable.id, { onDelete: "cascade" })
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.noteId] })
  })
);

export type NotesToUsers = InferSelectModel<typeof notesToUsersTable>;
export type CreateNotesToUsers = InferInsertModel<typeof notesToUsersTable>;

export const notesToUsersRelations = relations(
  notesToUsersTable,
  ({ one }) => ({
    note: one(noteTable, {
      fields: [notesToUsersTable.noteId],
      references: [noteTable.id]
    }),
    user: one(userTable, {
      fields: [notesToUsersTable.userId],
      references: [userTable.id]
    })
  })
);
