import * as Sentry from "@sentry/bun";
import { and, eq } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import { noteTable, notesToUsersTable } from "@/db/schema/note";
import { ShareNoteParams } from "@/v1/validations/note";

interface ShareNoteProps extends Omit<Context, "params"> {
  user: User;
  params: Readonly<ShareNoteParams>;
}

export async function unshareNote({ user, status, params }: ShareNoteProps) {
  const [note] = await db
    .select()
    .from(noteTable)
    .where(and(eq(noteTable.id, params.id), eq(noteTable.userId, user.id)));

  if (!note) {
    return status(401, "You are not allowed to modify this resource");
  }

  try {
    const unshared = await db
      .delete(notesToUsersTable)
      .where(eq(notesToUsersTable.noteId, note.id))
      .returning();

    if (!unshared) {
      return status(400, "Failed to unshare note");
    }

    return note;
  } catch (err) {
    console.error("🚀 ~ unshareNote ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Failed to unshare the note");
  }
}
