import * as Setnry from "@sentry/bun";
import { inArray } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import { notesToUsersTable } from "@/db/schema/note";
import { userTable } from "@/db/schema/user";
import type {
  ShareNoteParams,
  ShareNoteWithUsersSchema
} from "@/v1/validations/note";

interface ShareNoteProps extends Omit<Context, "params"> {
  user: User;
  body: ShareNoteWithUsersSchema;
  params: Readonly<ShareNoteParams>;
}

export async function shareNote({ body, status, params }: ShareNoteProps) {
  try {
    const users = await db
      .selectDistinct({ id: userTable.id })
      .from(userTable)
      .where(inArray(userTable.email, body));

    if (!users.length) {
      return status(404, "User(s) not found to a share note with");
    }

    const createSharedWith = users.map((user) => ({
      userId: user.id,
      noteId: params.id
    }));

    const sharedWith = await db
      .insert(notesToUsersTable)
      .values(createSharedWith)
      .onConflictDoNothing()
      .returning();

    return sharedWith;
  } catch (err) {
    console.log("🚀 ~ shareNote ~ err:", err);
    Setnry.captureException(err);
    return status(500, "Failed to share the note");
  }
}
