import * as Sentry from "@sentry/bun";
import { and, eq } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import { noteTable } from "@/db/schema/note";
import type { UpdateNote, UpdateNoteParamsSchema } from "@/v1/validations/note";

interface UpdateNoteProps extends Omit<Context, "params"> {
  user: User;
  body: UpdateNote;
  params: UpdateNoteParamsSchema;
}

export async function updateNote({
  user,
  body,
  status,
  params
}: UpdateNoteProps) {
  try {
    const [note] = await db
      .update(noteTable)
      .set(body)
      .where(and(eq(noteTable.id, params.id), eq(noteTable.userId, user.id)))
      .returning();

    if (!note) {
      return status(400, "Failed to update note");
    }

    return note;
  } catch (err) {
    console.log("🚀 ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
