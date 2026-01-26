import * as Sentry from "@sentry/bun";
import { and, eq, isNull } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import { noteTable, notesToUsersTable } from "@/db/schema/note";
import { userTable } from "@/db/schema/user";

interface GetSharedWithByNotesIdProps extends Omit<Context, "params"> {
  user: User;
  params: Readonly<{ id: string }>;
}

export async function getSharedWithByNoteId({
  user,
  status,
  params
}: GetSharedWithByNotesIdProps) {
  try {
    const [note] = await db
      .select()
      .from(noteTable)
      .where(
        and(
          eq(noteTable.userId, user.id),
          eq(noteTable.id, params.id),
          isNull(noteTable.deletedAt)
        )
      )
      .limit(1);

    if (!note) {
      return status(
        403,
        "You are not allowed to view the contents of this resource"
      );
    }

    const sharedWith = await db
      .select({
        email: userTable.email,
        noteId: notesToUsersTable.noteId,
        userId: notesToUsersTable.userId
      })
      .from(notesToUsersTable)
      .where(eq(notesToUsersTable.noteId, params.id))
      .innerJoin(userTable, eq(userTable.id, notesToUsersTable.userId));

    return sharedWith;
  } catch (err) {
    console.log("🚀 ~ getSharedWithByNoteId ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Failed to get shared with by note id");
  }
}
