import * as Sentry from "@sentry/bun";
import { and, eq, inArray, sql } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import { NoteCategory, noteTable, notesToUsersTable } from "@/db/schema/note";
import { getNotesToCreate } from "@/v1/utils/sync/note/create";
import { getNotesToDelete } from "@/v1/utils/sync/note/delete";
import { getNotesToUpdate } from "@/v1/utils/sync/note/update";
import { ValidationError } from "@/v1/utils/sync/validation-error";
import {
  PushChangesBodySchema,
  PushChangesQuerySchema
} from "@/v1/validations/sync";

interface PushChangesProps extends Omit<Context, "query"> {
  user: User;
  query: PushChangesQuerySchema;
  body: PushChangesBodySchema;
}

export async function pushChanges({
  user,
  body,
  query,
  status
}: PushChangesProps) {
  try {
    const notesToCreate = getNotesToCreate(body.note?.created, user);
    const notesToUpdate = getNotesToUpdate(body.note?.updated);
    const noteIdsToDelete = getNotesToDelete(body.note?.deleted);

    await db.transaction(async (trx) => {
      if (notesToCreate.length > 0) {
        await trx
          .insert(noteTable)
          .values(notesToCreate)
          .onConflictDoUpdate({
            target: noteTable.id,
            set: {
              category: sql`coalesce(excluded.category, ${noteTable.category})`,
              text: sql`excluded.text`,
              updatedAt: sql`coalesce(excluded.updated_at, ${noteTable.updatedAt})`,
              deletedAt: sql`coalesce(excluded.deleted_at, ${noteTable.deletedAt})`
            }
          });
      }

      if (notesToUpdate.length > 0) {
        for await (const updateNote of notesToUpdate) {
          const data = await trx.query.noteTable.findFirst({
            where: and(
              eq(noteTable.id, updateNote.id),
              eq(noteTable.userId, updateNote.user_id)
            ),
            with: {
              sharedWith: {
                where: and(
                  eq(notesToUsersTable.noteId, updateNote.id),
                  eq(notesToUsersTable.userId, user.id)
                )
              }
            }
          });

          if (!data || data.deletedAt) throw new Error("Not Found");

          if (
            (data.userId !== user.id && data.sharedWith?.length === 0) ||
            data.updatedAt.getTime() > query.last_pulled_at
          ) {
            throw new Error("Forbidden");
          }

          await trx
            .update(noteTable)
            .set({
              text: updateNote.text,
              category: updateNote.category as NoteCategory,
              deletedAt: updateNote.deleted_at,
              updatedAt: updateNote.updated_at
            })
            .where(
              and(
                eq(noteTable.id, updateNote.id),
                eq(noteTable.userId, updateNote.user_id)
              )
            );
        }
      }

      if (noteIdsToDelete.length > 0) {
        await trx
          .delete(noteTable)
          .where(
            and(
              eq(noteTable.userId, user.id),
              inArray(noteTable.id, noteIdsToDelete)
            )
          );
      }

      const deleteSharedWithMe = notesToUpdate
        .filter((note) => note.user_id !== user.id && note.deleted_at)
        .map((note) => `(${note.user_id},'${note.id}'::uuid)`);

      if (deleteSharedWithMe.length > 0) {
        await trx
          .delete(notesToUsersTable)
          .where(
            sql`(${notesToUsersTable.userId},${notesToUsersTable.noteId}) IN (VALUES ${sql.raw(`${deleteSharedWithMe.join(",")}`)})`
          );
      }
    });

    return {
      message: "Changes pushed successfully"
    };
  } catch (err) {
    console.log("🚀 push changes ~ err:", err);
    Sentry.captureException(err);

    if (err instanceof ValidationError) return status(422, err.message);

    if (err instanceof Error && err?.message === "Forbidden") {
      return status(403, "Forbidden");
    }

    if (err instanceof Error && err?.message === "Not Found") {
      return status(404, "Not Found");
    }

    return status(500, "Internal Server Error");
  }
}
