import * as Sentry from "@sentry/bun";
import { eq } from "drizzle-orm";
import { Context } from "elysia";

import { db } from "@/db";
import { userTable } from "@/db/schema/user";
import { env } from "@/env";
import { sendPasswordResetToken } from "@/libs/emails/password-reset";
import { createPasswordResetToken } from "@/v1/utils/user/create-password-reset-token";
import { PasswordReset } from "@/v1/validations/user";

interface PasswordResetProps extends Context {
  body: PasswordReset;
}

export async function passwordReset(ctx: PasswordResetProps) {
  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, ctx.body.email));

  if (!user || user.disabled) {
    return `If a ${env.APP_NAME} account exists for ${ctx.body.email}, an e-mail will be sent with further instructions.`;
  }

  try {
    const verificationToken = await createPasswordResetToken(user.id);

    const verificationLink =
      `${env.CLIENT_URL}/reset-password/` + verificationToken;

    const { error } = await sendPasswordResetToken(
      user.email,
      verificationLink,
      user.displayName
    );

    if (error) {
      return ctx.status(
        500,
        "Unable to send reset link, please try again later"
      );
    }

    return `If a ${env.APP_NAME} account exists for ${ctx.body.email}, an e-mail will be sent with further instructions.`;
  } catch (err) {
    console.error("🚀 ~ passwordReset ~ err:", err);
    Sentry.captureException(err);
    return ctx.status(500, "Internal Server Error");
  }
}
