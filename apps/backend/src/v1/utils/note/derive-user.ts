import { Context } from "elysia";
import { Session, User } from "lucia";

import { lucia } from "@/libs/auth";
import { VerifyJwtAsync } from "@/libs/jwt";
import { Prettify } from "@/types/prettify";

export type UserWithSession = User & { session: Session };

export async function deriveUser({
  status,
  bearer
}: Context & { bearer?: string }) {
  if (!bearer) return status(401, "Unauthorized");

  const sessionId = await VerifyJwtAsync(bearer);
  if (typeof sessionId !== "string") return status(401, "Unauthorized");

  const { user, session } = await lucia.validateSession(sessionId);

  if (!user) return status(401, "Unauthorized");

  if (user.disabled) {
    return status(403, "Your account has been disabled");
  }

  const prettyUser = { ...user, session } as Prettify<UserWithSession>;

  return { user: prettyUser };
}
