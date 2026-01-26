import * as Sentry from "@sentry/bun";
import { and, desc, eq, getTableColumns, isNull, sql } from "drizzle-orm";
import type { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import { NotesToUsers, noteTable, notesToUsersTable } from "@/db/schema/note";
import { userTable } from "@/db/schema/user";

interface GetSharedNotesProps extends Context {
  user: User;
}

export async function getSharedNotes({ user, status }: GetSharedNotesProps) {
  try {
    const noteColumns = getTableColumns(noteTable);

    const notes = await db
      .select({
        ...noteColumns,
        email: userTable.email,
        sharedWith: sql<NotesToUsers[]>`jsonb_build_array(
            jsonb_build_object(
              'userId', ${notesToUsersTable.userId}, 
              'noteId', ${notesToUsersTable.noteId},
              'user', json_build_object('id', ${sql.raw(`${user.id}`)},'email', ${sql.raw(`${user.id}`)})
            )
          ) AS "sharedWith"`
      })
      .from(notesToUsersTable)
      .where(eq(notesToUsersTable.userId, user.id))
      .innerJoin(
        noteTable,
        and(
          eq(noteTable.id, notesToUsersTable.noteId),
          isNull(noteTable.deletedAt)
        )
      )
      .innerJoin(userTable, eq(userTable.id, noteTable.userId))
      .orderBy(desc(noteTable.updatedAt));

    return notes;
  } catch (err) {
    console.log("🚀 ~ getSharedNotes ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Failed to get shared notes");
  }
}
