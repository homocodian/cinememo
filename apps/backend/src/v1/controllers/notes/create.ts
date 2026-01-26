import * as Sentry from "@sentry/bun";
import { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import { noteTable } from "@/db/schema/note";
import type { CreateNote } from "@/v1/validations/note";

interface CreateNoteProps extends Context {
  user: User;
  body: CreateNote;
}

export async function createNote({ user, body, status }: CreateNoteProps) {
  try {
    const [note] = await db
      .insert(noteTable)
      .values({ ...body, userId: user.id })
      .returning();

    if (!note) {
      return status(400, "Failed to create note");
    }

    return note;
  } catch (err) {
    console.log("🚀 ~ createNote ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
