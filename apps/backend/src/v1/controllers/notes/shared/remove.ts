import * as Sentry from "@sentry/bun";
import { and, eq, inArray } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import { noteTable, notesToUsersTable } from "@/db/schema/note";
import { userTable } from "@/db/schema/user";
import type {
  PatchShareNoteWithUsersBody,
  ShareNoteParams
} from "@/v1/validations/note";

interface ShareNoteProps extends Omit<Context, "params"> {
  user: User;
  body: PatchShareNoteWithUsersBody;
  params: Readonly<ShareNoteParams>;
}

export async function removeUserFromSharedNote({
  body,
  user,
  status,
  params
}: ShareNoteProps) {
  try {
    const [note] = await db
      .select({ id: noteTable.id })
      .from(noteTable)
      .where(and(eq(noteTable.id, params.id), eq(noteTable.userId, user.id)));

    if (!note) {
      return status(401, "You are not allowed to modify this resource");
    }

    if (!Array.isArray(body)) {
      const [userToRemove] = await db
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.email, body));

      if (!userToRemove) {
        return status(404, "User(s) not found to a remove from shared note");
      }

      await db
        .delete(notesToUsersTable)
        .where(
          and(
            eq(notesToUsersTable.noteId, note.id),
            eq(notesToUsersTable.userId, userToRemove.id)
          )
        );
    } else {
      const usersToRemove = await db
        .select({ id: userTable.id })
        .from(userTable)
        .where(inArray(userTable.email, body));

      if (!usersToRemove.length) {
        return status(404, "User(s) not found to a remove from shared note");
      }

      await db.delete(notesToUsersTable).where(
        and(
          eq(notesToUsersTable.noteId, note.id),
          inArray(
            notesToUsersTable.userId,
            usersToRemove.map(({ id }) => id)
          )
        )
      );
    }

    return { removedEmail: body, noteId: note.id };
  } catch (err) {
    console.error("🚀 ~ removeUserFromSharedNote :", err);
    Sentry.captureException(err);
    return status(500, "Failed to remove user from shared note");
  }
}
