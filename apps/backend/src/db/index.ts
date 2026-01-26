import { drizzle } from "drizzle-orm/bun-sql";

import * as FCMTokenSchema from "./schema/fcm-token";
import * as noteSchema from "./schema/note";
import * as userSchema from "./schema/user";

const connectionString = process.env.DATABASE_URL!;

export const db = drizzle(connectionString, {
  schema: {
    ...userSchema,
    ...noteSchema,
    ...FCMTokenSchema
  }
  // logger: process.env.NODE_ENV === "development" ? true : false
});

export type DB = typeof db;
