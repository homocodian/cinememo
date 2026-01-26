import * as Sentry from "@sentry/bun";
import { and, eq } from "drizzle-orm";
import { Context } from "elysia";
import type { User } from "lucia";

import { db } from "@/db";
import { notesToUsersTable } from "@/db/schema/note";
import { ShareNoteParams } from "@/v1/validations/note";

interface RemoveSharedNoteForMeProps extends Omit<Context, "params"> {
  user: User;
  params: Readonly<ShareNoteParams>;
}

export async function removeSharedNoteForMe({
  user,
  params,
  status
}: RemoveSharedNoteForMeProps) {
  try {
    const [removedSharedNote] = await db
      .delete(notesToUsersTable)
      .where(
        and(
          eq(notesToUsersTable.userId, user.id),
          eq(notesToUsersTable.noteId, params.id)
        )
      )
      .returning();

    if (!removedSharedNote) {
      return status(400, "You are not allowed to remove the shared note");
    }

    return removedSharedNote;
  } catch (err) {
    console.error("🚀 removeSharedNoteForMe ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Failed to remove from shared note");
  }
}
