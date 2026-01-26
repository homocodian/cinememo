import * as Sentry from "@sentry/bun";
import { and, eq } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import { noteTable } from "@/db/schema/note";
import { UpdateNoteParamsSchema } from "@/v1/validations/note";

interface DeleteNoteProps extends Omit<Context, "params"> {
  user: User;
  params: Readonly<UpdateNoteParamsSchema>;
}

export async function deleteNote({ user, status, params }: DeleteNoteProps) {
  try {
    const [note] = await db
      .update(noteTable)
      .set({ deletedAt: new Date() })
      .where(and(eq(noteTable.id, params.id), eq(noteTable.userId, user.id)))
      .returning();

    if (!note) {
      return status(400, "Failed to delete the note");
    }

    return note;
  } catch (err) {
    console.log("🚀 ~ deleteNote ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Server error : Failed to delete the note");
  }
}
