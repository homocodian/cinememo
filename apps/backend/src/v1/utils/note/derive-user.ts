import { Context } from "elysia";
import { Session, User } from "lucia";

import { createSessionCookie, lucia } from "@/libs/auth";
import { VerifyJwtAsync } from "@/libs/jwt";
import { Cookie } from "@/types/cookie";
import { Prettify } from "@/types/prettify";

export type UserWithSession = User & { session: Session };

export async function deriveUser({
  status,
  bearer,
  cookie
}: Context & {
  bearer?: string;
  cookie: Cookie;
}) {
  const cookieSessionId = cookie.session.value;
  if (!cookieSessionId && !bearer) return status(401, "Unauthorized");
  const sessionId =
    cookieSessionId || ((await VerifyJwtAsync(bearer as string)) as string);

  const { user, session } = await lucia.validateSession(sessionId);

  if (!user) {
    return status(401, "Unauthorized");
  }

  if (user.disabled) {
    return status(403, "Your account has been disabled");
  }

  if (session.fresh) {
    cookie.session.set(createSessionCookie(session.id));
  }

  const prettyUser = { ...user, session } as Prettify<UserWithSession>;

  return { user: prettyUser };
}
