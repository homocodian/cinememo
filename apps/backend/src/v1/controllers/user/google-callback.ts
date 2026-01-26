import * as Sentry from "@sentry/bun";
import { OAuth2RequestError } from "arctic";
import { and, eq } from "drizzle-orm";
import { Context } from "elysia";
import * as z from "zod";

import { db } from "@/db";
import { UserTable, oauthAccountTable, userTable } from "@/db/schema/user";
import { env } from "@/env";
import { google, lucia } from "@/libs/auth";
import { BgQueue } from "@/libs/background-worker";
import { SaveDeviceProps } from "@/libs/background/save-device";
import { signJwtAsync } from "@/libs/jwt";
import { parseJson } from "@/libs/parse-json";
import { Prettify } from "@/types/prettify";
import {
  DeviceSchema,
  OAuthQuerySchema,
  UserSchema,
  deviceSchema
} from "@/v1/validations/user";

interface GoogleCallbackProps extends Omit<Context, "query"> {
  query: OAuthQuerySchema;
}

const googleUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  verified_email: z.boolean().optional().default(false),
  name: z.string().optional(),
  picture: z.string().optional()
});

export async function googleCallback({
  cookie,
  request,
  redirect
}: GoogleCallbackProps) {
  const codeVerifierCookie: string | null =
    (cookie?.google_oauth_code_verifier?.value as string) ?? null;
  const stateCookie = cookie?.google_oauth_state?.value ?? null;
  const deviceCookie = cookie?.device?.value ?? null;
  // request origin uri
  const callbackURL = cookie?.callback?.value ?? env.CLIENT_URL + "/login";
  const redirectURL: string =
    (cookie?.redirect?.value as string) ??
    env.CLIENT_URL + "/login/google/callback";
  // request origin ip
  const ip: string | null = cookie.ip?.value as string;

  cookie?.google_oauth_state?.remove();
  cookie?.google_oauth_code_verifier?.remove();
  cookie?.device?.remove();
  cookie?.callback?.remove();
  cookie?.redirect?.remove();
  cookie?.ip?.remove();

  const jsonDevice = parseJson(deviceCookie);

  const searchParams = new URL(request.url).searchParams;
  const state = searchParams.get("state");
  const code = searchParams.get("code");

  // verify state
  if (!state || !codeVerifierCookie || !code || state !== stateCookie) {
    return redirect(
      `${callbackURL}?error=${encodeURIComponent("Invalid state or codeVerifier")}`
    );
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      codeVerifierCookie
    );
    const googleUserResponse = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`
        }
      }
    );

    if (!googleUserResponse.ok) {
      console.log(googleUserResponse?.text);
      console.log(
        "🚀 ~ googleUserResponse:",
        await googleUserResponse.json().catch(console.error)
      );
      return redirect(
        `${callbackURL}?error=${encodeURIComponent("Failed to fetch user info from google")}`
      );
    }

    const { data: googleUserResult, error: googleUserDataError } =
      await parseJson(googleUserResponse);

    if (googleUserDataError || !googleUserResult) {
      return redirect(
        `${callbackURL}?error=${encodeURIComponent(googleUserDataError)}`
      );
    }

    const googleUser = googleUserSchema.parse(googleUserResult);

    const { user, error: dbError } = await db.transaction(async (trx) => {
      const [existingUser] = await trx
        .select()
        .from(oauthAccountTable)
        .where(
          and(
            eq(oauthAccountTable.providerId, "google"),
            eq(oauthAccountTable.providerUserId, googleUser.id)
          )
        )
        .innerJoin(userTable, eq(oauthAccountTable.userId, userTable.id));

      if (!existingUser) {
        const [createdUser] = await trx
          .insert(userTable)
          .values({
            email: googleUser.email,
            emailVerified: googleUser.verified_email,
            disabled: false,
            displayName: googleUser.name,
            photoURL: googleUser.picture
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
            providerUserId: googleUser.id,
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
          .set(getUserPropToUpdate(existingUser.user, googleUser))
          .where(eq(userTable.id, existingUser.user.id))
          .returning();

        if (!updatedUser) {
          trx.rollback();
          return { user: null, error: "Failed to update user" };
        }

        return { user: updatedUser, error: null };
      }
    });

    if (dbError || !user) {
      return redirect(
        `${callbackURL}?error=${encodeURIComponent(dbError ?? "Failed to create user")}`
      );
    }

    const session = await lucia.createSession(user.id, {});

    const sessionToken = await signJwtAsync(session.id);

    const parsedDevice = deviceSchema.parse(jsonDevice.data);

    await BgQueue.add("saveDevice", {
      ip,
      ua: request.headers.get("user-agent") ?? undefined,
      userId: user.id,
      sessionId: session.id,
      device: parsedDevice ? (deviceCookie as DeviceSchema) : undefined
    } satisfies SaveDeviceProps).catch((err) => {
      console.log("🚀 ~ loginUser saveDevice ~ err", err);
      Sentry.captureException(err);
    });

    const sessionUser = {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL,
      displayName: user.displayName
    } satisfies UserSchema;

    return redirect(
      `${redirectURL}?sessionToken=${sessionToken}&user=${encodeURIComponent(JSON.stringify(sessionUser))}`
    );
  } catch (err) {
    console.log("🚀 googleCallback ~ err:", err);
    Sentry.captureException(err);

    if (err instanceof OAuth2RequestError) {
      // bad verification code, invalid credentials, etc
      return redirect(
        `${callbackURL}?error=${encodeURIComponent("invalid verification code")}`
      );
    }

    if ((err as any)?.code === "23505") {
      return redirect(
        `${callbackURL}?error=${encodeURIComponent("Email already exists, please use different account")}`
      );
    }

    return redirect(
      `${callbackURL}?error=${encodeURIComponent("internal server error")}`
    );
  }
}

type UserPropToUpdate = Partial<
  Pick<UserTable, "emailVerified" | "photoURL" | "displayName" | "lastSignInAt">
>;

function getUserPropToUpdate(
  user: UserTable,
  googleUser: z.infer<typeof googleUserSchema>
) {
  const propsToUpdate: Prettify<UserPropToUpdate> = {};

  if (!user.emailVerified === false) {
    propsToUpdate.emailVerified = googleUser.verified_email;
  }

  if (!user.displayName) {
    propsToUpdate.displayName = googleUser.name;
  }

  if (!user.photoURL) {
    propsToUpdate.photoURL = googleUser.picture;
  }

  propsToUpdate.lastSignInAt = new Date();

  return propsToUpdate;
}
