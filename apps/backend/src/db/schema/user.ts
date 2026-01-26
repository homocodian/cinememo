import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";

import { FCMTokenTable } from "./fcm-token";
import { noteTable, notesToUsersTable } from "./note";

export const deviceType = pgEnum("device_type", [
  "UNKNOWN",
  "PHONE",
  "TABLET",
  "DESKTOP",
  "TV"
]);

export const deviceTypeList = deviceType.enumValues;

export const userTable = pgTable(
  "user",
  {
    id: serial("id").notNull().primaryKey(),
    email: text("email").notNull().unique(),
    hashedPassword: text("hashed_password"),
    emailVerified: boolean("email_verified").notNull().default(false),
    displayName: text("display_name"),
    photoURL: text("photo_url"),
    disabled: boolean("disabled").notNull().default(false),

    lastSignInAt: timestamp("last_sign_in_at", {
      withTimezone: true,
      mode: "date"
    })
      .notNull()
      .defaultNow(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date"
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date"
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  (t) => [index("email_idx").on(t.email)]
);

export type UserTable = InferSelectModel<typeof userTable>;
export type CreateUserTable = InferInsertModel<typeof userTable>;

export const sessionTable = pgTable("session", {
  id: text("id").notNull().primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),

  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date"
  }).notNull(),

  lastUsedAt: timestamp("last_used_at", {
    withTimezone: true,
    mode: "string"
  })
    .notNull()
    .defaultNow()
});

export const emailVerificationCodeTable = pgTable(
  "email_verification_code",
  {
    id: serial("id").notNull().primaryKey(),
    code: text("code").notNull(),
    userId: integer("user_id").unique().notNull(),
    email: text("emai").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date"
    }).notNull()
  },
  (t) => ({
    emailVerificationCodeUserIdx: index("email_verification_code_user_idx").on(
      t.userId
    )
  })
);

export const passwordResetTokenTable = pgTable(
  "password_reset_token",
  {
    tokenHash: text("token_hash").notNull().primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date"
    }).notNull()
  },
  (t) => ({
    passwordResetTokneUserIdx: index("password_reset_token_user_idx").on(
      t.userId
    )
  })
);

export const oauthAccountTable = pgTable(
  "oauth_account",
  {
    providerId: text("provider_id").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade"
      })
  },
  (t) => ({
    pk: primaryKey({ columns: [t.providerId, t.providerUserId] })
  })
);

export const oAuthAccountRelations = relations(
  oauthAccountTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [oauthAccountTable.userId],
      references: [userTable.id]
    })
  })
);

export const userRelations = relations(userTable, ({ many }) => ({
  notes: many(noteTable),
  sharedNotes: many(notesToUsersTable),
  oauthAccounts: many(oauthAccountTable),
  FCMTokens: many(FCMTokenTable)
}));

export const deviceTable = pgTable(
  "device",
  {
    id: serial("id").notNull().primaryKey(),
    ip: text("ip"),
    userId: integer("user_id")
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade"
      }),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessionTable.id, {
        onDelete: "cascade"
      }),
    type: deviceType("type").notNull().default("UNKNOWN"),
    os: text("os"),
    name: text("name"),
    model: text("model"),
    osVersion: text("os_version"),
    city: text("city"),
    state: text("state"),
    country: text("country"),
    timezone: text("timezone"),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow()
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.sessionId] })
  })
);

export type DeviceTable = InferSelectModel<typeof deviceTable>;
