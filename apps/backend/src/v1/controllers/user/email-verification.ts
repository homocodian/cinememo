import * as Sentry from "@sentry/bun";
import { eq } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import { userTable } from "@/db/schema/user";
import { verifyVerificationCode } from "@/v1/utils/user/verify-verification-code";
import { EmailVerification } from "@/v1/validations/user";

interface EmailVerificationProps extends Context {
  user: User;
  body: EmailVerification;
}

export async function emailVerification({
  user,
  status,
  body
}: EmailVerificationProps) {
  try {
    const validCode = await verifyVerificationCode(
      user.id,
      user.email,
      body.code
    );

    if (!validCode) {
      return status(400, "Invalid verification code");
    }

    await db
      .update(userTable)
      .set({ emailVerified: true })
      .where(eq(userTable.id, user.id));

    return { message: `${user.email} is verifed` };
  } catch (err) {
    console.error("🚀 ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
