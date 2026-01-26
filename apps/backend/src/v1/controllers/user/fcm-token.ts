import * as Sentry from "@sentry/bun";
import { Context } from "elysia";

import { db } from "@/db";
import { FCMTokenTable } from "@/db/schema/fcm-token";
import { UserWithSession } from "@/v1/utils/note/derive-user";
import { CreateFCMToken } from "@/v1/validations/fcm-token";

interface CreateFCMTokenProps extends Context {
  user: UserWithSession;
  body: CreateFCMToken;
}

export async function createFCMToken({
  user,
  status,
  body
}: CreateFCMTokenProps) {
  try {
    const [token] = await db
      .insert(FCMTokenTable)
      .values({ ...body, userId: user.id, sessionId: user.session.id })
      .returning();
    if (!token) return status(500, "Internal Server Error");
    return token;
  } catch (err) {
    console.error("🚀 ~ createFCMToken ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
