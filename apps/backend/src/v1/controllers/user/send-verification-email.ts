import * as Sentry from "@sentry/bun";
import { eq } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import { emailVerificationCodeTable, userTable } from "@/db/schema/user";
import { sendVerificationCodeMail } from "@/libs/emails/verify-email";
import { generateEmailVerificationCode } from "@/libs/generate-email-varification-code";

interface SendVerificationEmailProps extends Context {
  user: User;
}

export async function sendVerificationEmail({
  user,
  status
}: SendVerificationEmailProps) {
  try {
    const [currentUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, user.id));

    if (!currentUser) {
      return status("Unauthorized");
    }

    if (currentUser.emailVerified) {
      return status(400, "Email is already verified");
    }

    await db
      .delete(emailVerificationCodeTable)
      .where(eq(emailVerificationCodeTable.userId, currentUser.id));

    const verificationCode = await generateEmailVerificationCode(
      currentUser.id,
      currentUser.email
    );

    const mail = await sendVerificationCodeMail(
      currentUser.email,
      verificationCode
    );

    if (mail.error) {
      return status(500, "Failed to send verification code");
    }

    return { message: `Verification has been sent to ${currentUser.email}` };
  } catch (err) {
    console.error("🚀 ~ sendVerificationEmail ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
