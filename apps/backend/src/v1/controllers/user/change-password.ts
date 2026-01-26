import * as Sentry from "@sentry/bun";
import { and, eq, ne } from "drizzle-orm";
import { Context } from "elysia";

import { db } from "@/db";
import { FCMTokenTable } from "@/db/schema/fcm-token";
import { sessionTable, userTable } from "@/db/schema/user";
import { validatePassword } from "@/libs/password-validation";
import { UserWithSession } from "@/v1/utils/note/derive-user";
import { ChangePasswordSchema } from "@/v1/validations/user";

interface ChangePasswordProps extends Context {
  user: UserWithSession;
  body: ChangePasswordSchema;
}

export async function changePassword({
  user,
  status,
  body
}: ChangePasswordProps) {
  try {
    const validatedPassword = validatePassword(body.newPassword);

    if (!validatedPassword.ok) {
      return status(400, validatedPassword.error);
    }

    const [currentUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, user.id));

    if (!currentUser || !currentUser.hashedPassword) {
      return status(404, "User not found");
    }

    const validPassword = await Bun.password.verify(
      body.currentPassword,
      currentUser.hashedPassword
    );

    if (!validPassword) {
      return status(400, "Incorrect password");
    }

    if (body.currentPassword === body.newPassword) {
      return status(400, "New password cannot be the same as the old password");
    }

    const hashedPassword = await Bun.password.hash(body.newPassword);

    await Promise.all([
      db
        .delete(sessionTable)
        .where(
          and(
            eq(sessionTable.userId, user.id),
            ne(sessionTable.id, user.session.id)
          )
        ),
      db.delete(FCMTokenTable).where(eq(FCMTokenTable.userId, user.id))
    ]);

    await db
      .update(userTable)
      .set({ hashedPassword })
      .where(eq(userTable.id, user.id));

    return { message: "Password changed successfully" };
  } catch (err) {
    console.log("🚀 ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
