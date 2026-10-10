import type { Logout } from "@cinememo/schemas/user";
import * as Sentry from "@sentry/bun";
import { and, eq } from "drizzle-orm";
import { Context } from "elysia";

import { db } from "@/db";
import { FCMTokenTable } from "@/db/schema/fcm-token";
import { deleteSessionCookie, lucia } from "@/libs/auth";
import { VerifyJwtAsync } from "@/libs/jwt";
import { Cookie } from "@/types/cookie";

interface LogoutProps extends Context {
  bearer: string | undefined;
  body: Logout;
  cookie: Cookie;
}

export async function logout({ bearer, status, body, cookie }: LogoutProps) {
  if (!bearer) return status(401, "Unauthorized");
  try {
    const sessionId = await VerifyJwtAsync(bearer);

    if (typeof sessionId !== "string") {
      return status(500, "Internal Server Error");
    }

    const { user } = await lucia.validateSession(sessionId);

    if (!user) return status(401, "Unauthorized");

    await lucia.invalidateSession(sessionId);
    cookie.session.set(deleteSessionCookie());

    if (body?.deviceId) {
      await db
        .delete(FCMTokenTable)
        .where(
          and(
            eq(FCMTokenTable.userId, user.id),
            eq(FCMTokenTable.deviceId, body.deviceId)
          )
        );
    }

    return { message: "Logout successful" };
  } catch (err) {
    console.error("🚀 ~ logout ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}

export async function logoutAll({ bearer, status }: Omit<LogoutProps, "body">) {
  if (!bearer) return status(401, "Unauthorized");
  try {
    const sessionId = await VerifyJwtAsync(bearer);

    if (typeof sessionId !== "string") {
      return status(500, "Internal Server Error");
    }

    const { user } = await lucia.validateSession(sessionId);

    if (!user) return status(401, "Unauthorized");

    await lucia.invalidateUserSessions(user.id);
    await db.delete(FCMTokenTable).where(eq(FCMTokenTable.userId, user.id));
    return { message: "Logout successful" };
  } catch (err) {
    console.error("🚀 ~ logoutAll ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
