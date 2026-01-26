import * as Sentry from "@sentry/bun";
import { eq } from "drizzle-orm";
import { Context } from "elysia";

import { db } from "@/db";
import { userTable } from "@/db/schema/user";
import { lucia } from "@/libs/auth";
import { BgQueue } from "@/libs/background-worker";
import { SaveDeviceProps } from "@/libs/background/save-device";
import { signJwtAsync } from "@/libs/jwt";
import { LoginUser, UserSchema } from "@/v1/validations/user";

interface LoginUserProps extends Context {
  body: LoginUser;
  ip?: string;
}

export async function loginUser({ body, status, request, ip }: LoginUserProps) {
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
    } satisfies UserSchema & { sessionToken: string };
  } catch (err) {
    console.error("🚀 ~ loginUser ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
