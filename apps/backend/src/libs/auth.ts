import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Google } from "arctic";
import { Lucia } from "lucia";

import { env } from "@/env";
import type { CookieOptions } from "@/types/cookie";

import { db } from "../db";
import { sessionTable, userTable } from "../db/schema/user";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production"
    }
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      emailVerified: attributes.emailVerified,
      photoURL: attributes.photoURL,
      displayName: attributes.displayName,
      disabled: attributes.disabled
    };
  }
});

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    UserId: number;
    DatabaseUserAttributes: {
      email: string;
      emailVerified: boolean;
      photoURL: string | null;
      displayName: string | null;
      disabled: boolean;
    };
  }
}

export function deleteExpiredSessions() {
  return lucia.deleteExpiredSessions();
}

export function createSessionCookie(sessionId: string): CookieOptions {
  const cookie = lucia.createSessionCookie(sessionId);
  return {
    domain: cookie.attributes.domain,
    path: cookie.attributes.path,
    httpOnly: cookie.attributes.httpOnly,
    secure: cookie.attributes.secure,
    sameSite: cookie.attributes.sameSite,
    expires: cookie.attributes.expires,
    maxAge: cookie.attributes.maxAge,
    value: cookie.value
  };
}

export function deleteSessionCookie(): CookieOptions {
  const cookie = lucia.createBlankSessionCookie();
  return {
    domain: cookie.attributes.domain,
    path: cookie.attributes.path,
    httpOnly: cookie.attributes.httpOnly,
    secure: cookie.attributes.secure,
    sameSite: cookie.attributes.sameSite,
    expires: cookie.attributes.expires,
    maxAge: cookie.attributes.maxAge,
    value: cookie.value
  };
}
