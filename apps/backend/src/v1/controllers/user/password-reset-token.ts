import * as Sentry from "@sentry/bun";
import { eq } from "drizzle-orm";
import { Context } from "elysia";
import { isWithinExpirationDate } from "oslo";
import { sha256 } from "oslo/crypto";
import { encodeHex } from "oslo/encoding";

import { db } from "@/db";
import { passwordResetTokenTable, userTable } from "@/db/schema/user";
import { lucia } from "@/libs/auth";
import { signJwtAsync } from "@/libs/jwt";
import { validatePassword } from "@/libs/password-validation";
import { PasswordResetToken } from "@/v1/validations/user";

interface PasswordResetTokenProps extends Omit<Context, "params"> {
  body: PasswordResetToken;
  params: {
    token?: string;
  };
}

export async function passwordResetToken({
  body,
  status,
  params
}: PasswordResetTokenProps) {
  if (!validatePassword(body.password)) {
    return status(400, "Invalid password");
  }

  const verificationToken = params?.token;

  if (!verificationToken) {
    return status(400, "Invalid verification token");
  }

  const tokenHash = encodeHex(
    await sha256(new TextEncoder().encode(verificationToken))
  );

  const [token] = await db
    .select()
    .from(passwordResetTokenTable)
    .where(eq(passwordResetTokenTable.tokenHash, tokenHash));

  if (token) {
    await db
      .delete(passwordResetTokenTable)
      .where(eq(passwordResetTokenTable.tokenHash, tokenHash));
  }

  if (!token || !isWithinExpirationDate(token.expiresAt)) {
    return status(400, "Invalid or expired verification token");
  }

  await lucia.invalidateUserSessions(token.userId);

  const hashedPassword = await Bun.password.hash(body.password);

  try {
    const [user] = await db
      .update(userTable)
      .set({
        hashedPassword,
        lastSignInAt: new Date(),
        emailVerified: true
      })
      .where(eq(userTable.id, token.userId))
      .returning();

    if (!user) {
      throw new Error("User not found");
    }

    const session = await lucia.createSession(user.id, {});
    const sessionToken = await signJwtAsync(session.id);

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL,
      displayName: user.displayName,
      sessionToken
    };
  } catch (err) {
    console.log("🚀 ~ err:", err);
    Sentry.captureException(err);
    return status(
      500,
      "Failed to update your password, please try again later"
    );
  }
}
