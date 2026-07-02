import { drizzle } from "drizzle-orm/postgres-js";

import { sqlClient } from "./client";
import * as FCMTokenSchema from "./schema/fcm-token";
import * as noteSchema from "./schema/note";
import * as userSchema from "./schema/user";

export const db = drizzle({
  schema: {
    ...userSchema,
    ...noteSchema,
    ...FCMTokenSchema
  },
  client: sqlClient
  // logger: process.env.NODE_ENV === "development" ? true : false
});
