import type { User } from "@cinememo/schemas/user";
import { and, eq, getTableColumns, gt, isNull, lt, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { noteTable, notesToUsersTable } from "@/db/schema/note";

const noteFields = getTableColumns(noteTable);

export async function getData({
  user,
  lastPulledAt
}: {
  user: User;
  lastPulledAt: number | undefined;
}) {
  const lastPulledAtToUnixTimestamp = lastPulledAt
    ? Math.floor(lastPulledAt / 1000)
    : 0;

  return db.transaction(async (trx) => {
    const created = await trx
      .select({ ...noteFields })
      .from(noteTable)
      .leftJoin(notesToUsersTable, eq(notesToUsersTable.noteId, noteTable.id))
      .where(
        and(
          or(
            eq(noteTable.userId, user.id),
            eq(notesToUsersTable.userId, user.id)
          ),
          isNull(noteTable.deletedAt),
          lastPulledAtToUnixTimestamp
            ? gt(
                noteTable.createdAt,
                sql`to_timestamp(${lastPulledAtToUnixTimestamp})`
              )
            : undefined
        )
      );

    if (lastPulledAtToUnixTimestamp) {
      const updated = await trx
        .select({ ...noteFields })
        .from(noteTable)
        .leftJoin(notesToUsersTable, eq(notesToUsersTable.noteId, noteTable.id))
        .where(
          and(
            or(
              eq(noteTable.userId, user.id),
              eq(notesToUsersTable.userId, user.id)
            ),
            isNull(noteTable.deletedAt),
            lt(
              noteTable.createdAt,
              sql`to_timestamp(${lastPulledAtToUnixTimestamp})`
            ),
            gt(
              noteTable.updatedAt,
              sql`to_timestamp(${lastPulledAtToUnixTimestamp})`
            )
          )
        );

      const deleted = await trx
        .select({ id: noteTable.id })
        .from(noteTable)
        .leftJoin(notesToUsersTable, eq(notesToUsersTable.noteId, noteTable.id))
        .where(
          and(
            or(
              eq(noteTable.userId, user.id),
              eq(notesToUsersTable.userId, user.id)
            ),
            gt(
              noteTable.deletedAt,
              sql`to_timestamp(${lastPulledAtToUnixTimestamp})`
            )
          )
        );

      const epochTimestamp = Date.now();

      return {
        data: {
          note: { created, updated, deleted }
        },
        epochTimestamp
      };
    }

    const epochTimestamp = Date.now();
    return {
      data: {
        note: { created, updated: [], deleted: [] }
      },
      epochTimestamp
    };
  });
}
