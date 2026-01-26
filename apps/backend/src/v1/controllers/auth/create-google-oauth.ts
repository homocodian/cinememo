import * as Sentry from "@sentry/bun";
import { and, eq } from "drizzle-orm";
import { Context } from "elysia";

import { db } from "@/db";
import { UserTable, oauthAccountTable, userTable } from "@/db/schema/user";
import { lucia } from "@/libs/auth";
import { BgQueue } from "@/libs/background-worker";
import { SaveDeviceProps } from "@/libs/background/save-device";
import { signJwtAsync } from "@/libs/jwt";
import { Prettify } from "@/types/prettify";
import { OAuthBodySchema, OAuthUserSchema } from "@/v1/validations/auth";
import { UserSchema } from "@/v1/validations/user";

interface CreateGoogleOAuthProps extends Context {
  body: OAuthBodySchema;
  ip: string;
}

export async function createGoogleOAuth({
  ip,
  body,
  status,
  request
}: CreateGoogleOAuthProps) {
  try {
    const { user, error: dbError } = await db.transaction(async (trx) => {
      const [existingUser] = await trx
        .select()
        .from(oauthAccountTable)
        .where(
          and(
            eq(oauthAccountTable.providerId, "google"),
            eq(oauthAccountTable.providerUserId, body.user.id)
          )
        )
        .innerJoin(userTable, eq(oauthAccountTable.userId, userTable.id));

      if (!existingUser) {
        const [createdUser] = await trx
          .insert(userTable)
          .values({
            ...body.user,
            id: undefined,
            disabled: false
          })
          .returning();

        if (!createdUser) {
          trx.rollback();
          return { user: null, error: "Failed to create user" };
        }

        const [createdOauthAccount] = await trx
          .insert(oauthAccountTable)
          .values({
            providerId: "google",
            providerUserId: body.user.id,
            userId: createdUser.id
          })
          .returning();

        if (!createdOauthAccount) {
          trx.rollback();
          return { user: null, error: "Failed to create oauth account" };
        }

        return { user: createdUser, error: null };
      } else {
        const [updatedUser] = await trx
          .update(userTable)
          .set(getUserPropToUpdate(existingUser.user, body.user))
          .where(eq(userTable.id, existingUser.user.id))
          .returning();

        if (!updatedUser) {
          trx.rollback();
          return { user: null, error: "Failed to update user" };
        }

        return { user: updatedUser, error: null };
      }
    });

    if (!user) {
      return status(500, dbError);
    }

    const session = await lucia.createSession(user.id, {});

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

    const sessionUser = {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL,
      displayName: user.displayName,
      sessionToken: sessionToken
    } satisfies UserSchema & { sessionToken: string };

    return sessionUser;
  } catch (err) {
    if ((err as any)?.code === "23505") {
      return status(400, "User already exists");
    }

    return status("Internal Server Error");
  }
}

type UserPropToUpdate = Partial<
  Pick<UserTable, "emailVerified" | "photoURL" | "displayName" | "lastSignInAt">
>;

function getUserPropToUpdate(user: UserTable, googleUser: OAuthUserSchema) {
  const propsToUpdate: Prettify<UserPropToUpdate> = {};

  if (!user.emailVerified === false) {
    propsToUpdate.emailVerified = googleUser.emailVerified;
  }

  if (!user.displayName) {
    propsToUpdate.displayName = googleUser.displayName;
  }

  if (!user.photoURL) {
    propsToUpdate.photoURL = googleUser.photoURL;
  }

  propsToUpdate.lastSignInAt = new Date();

  return propsToUpdate;
}
