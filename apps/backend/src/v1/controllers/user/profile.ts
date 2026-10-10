import type { User } from "@cinememo/schemas/user";
import * as Sentry from "@sentry/bun";
import { Context } from "elysia";

import { lucia } from "@/libs/auth";
import { BgQueue } from "@/libs/background-worker";
import { UpdateSessionLastUsedAtProps } from "@/libs/background/update-session-last-used";
import { VerifyJwtAsync } from "@/libs/jwt";
import { Cookie } from "@/types/cookie";

interface GetProfileProps extends Context {
  cookie: Cookie;
}

export async function getProfile({ status, cookie }: GetProfileProps) {
  try {
    // const sessionId = await VerifyJwtAsync(bearer);
    const sessionId = cookie.session.value;
    console.log("sessionId: ", sessionId);

    if (typeof sessionId !== "string") {
      return status(500, "Internal Server Error");
    }

    const { session, user } = await lucia.validateSession(sessionId);

    if (!session || !user) {
      return status(401, "Unauthorized");
    }

    if (user.disabled) {
      return status(403, "Your account has been disabled");
    }

    await BgQueue.add("updateSessionLastUsedAt", {
      sessionId: session.id,
      lastUsedAt: new Date().toISOString()
    } satisfies UpdateSessionLastUsedAtProps).catch(() => {});

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL,
      displayName: user.displayName
    } satisfies User;
  } catch (err) {
    console.log("🚀 ~ getProfile ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
