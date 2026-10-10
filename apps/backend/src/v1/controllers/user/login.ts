import type { LoginUser, User } from "@cinememo/schemas/user";
import * as Sentry from "@sentry/bun";
import { eq } from "drizzle-orm";
import type { Context } from "elysia";

import { db } from "@/db";
import { userTable } from "@/db/schema/user";
import { createSessionCookie, lucia } from "@/libs/auth";
import { BgQueue } from "@/libs/background-worker";
import { SaveDeviceProps } from "@/libs/background/save-device";
import { signJwtAsync } from "@/libs/jwt";
import { Cookie } from "@/types/cookie";

interface LoginUserProps extends Context {
  body: LoginUser;
  ip?: string;
  cookie: Cookie;
}

export async function loginUser({
  body,
  status,
  request,
  ip,
  cookie
}: LoginUserProps) {
  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, body.email));

  if (!user || !user.hashedPassword) {
    return status(400, "Invalid email or password");
  }

  if (user.disabled) {
    return status(403, "Your account has been disabled");
  }

  const validPassword = await Bun.password.verify(
    body.password,
    user.hashedPassword
  );

  if (!validPassword) {
    return status(400, "Invalid email or password");
  }

  const session = await lucia.createSession(user.id, {});

  try {
    await db
      .update(userTable)
      .set({ lastSignInAt: new Date() })
      .where(eq(userTable.id, user.id));

    const sessionToken = await signJwtAsync(session.id);
    cookie.session.set(createSessionCookie(session.id));

    await BgQueue.add("saveDevice", {
      ip,
      ua: request.headers.get("user-agent") ?? undefined,
      userId: user.id,
      sessionId: session.id,
      device: body.device
    } satisfies SaveDeviceProps).catch((err) => {
      console.log("🚀 ~ loginUser saveDevice ~ err", err);
      Sentry.captureException(err);
    });

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL,
      displayName: user.displayName,
      sessionToken
    } satisfies User & { sessionToken: string };
  } catch (err) {
    console.error("🚀 ~ loginUser ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
