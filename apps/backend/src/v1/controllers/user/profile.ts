import * as Sentry from "@sentry/bun";
import { Context } from "elysia";

import { lucia } from "@/libs/auth";
import { BgQueue } from "@/libs/background-worker";
import { UpdateSessionLastUsedAtProps } from "@/libs/background/update-session-last-used";
import { VerifyJwtAsync } from "@/libs/jwt";
import { UserSchema } from "@/v1/validations/user";

interface GetProfileProps extends Context {
  bearer: string | undefined;
}

export async function getProfile({ bearer, status }: GetProfileProps) {
  if (!bearer) return status(401, "Unauthorized");
  try {
    const sessionId = await VerifyJwtAsync(bearer);

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
    } satisfies UserSchema;
  } catch (err) {
    console.log("🚀 ~ getProfile ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
