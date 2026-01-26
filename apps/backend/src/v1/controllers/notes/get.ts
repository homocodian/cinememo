import * as Sentry from "@sentry/bun";
import { and, desc, eq, getTableColumns, isNull, sql } from "drizzle-orm";
import type { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import {
  Note,
  NoteCategory,
  noteCategoryEnum,
  noteTable,
  notesToUsersTable
} from "@/db/schema/note";
import { userTable } from "@/db/schema/user";

interface GetNotesProps extends Context {
  user: User;
}

const allowedCategories = noteCategoryEnum.enumValues;

interface DBNote extends Note {
  email: string;
  sharedWith?: {
    userId: number;
    noteId: number;
    user: { id: number; email: string };
  } | null;
}

export async function getNotes({ user, query, status }: GetNotesProps) {
  const category = query?.category
    ? allowedCategories.includes(query.category as NoteCategory)
      ? (query.category as NoteCategory)
      : "general"
    : undefined;

  try {
    if (!category) {
      const statement = getSqlStatement(user);
      const notes = await db.execute(statement);
      return [...notes];
    }

    const noteColumns = getTableColumns(noteTable);

    const notes = await db
      .select({
        ...noteColumns,
        email: userTable.email
      })
      .from(noteTable)
      .where(
        and(
          eq(noteTable.userId, user.id),
          eq(noteTable.category, category),
          isNull(noteTable.deletedAt)
        )
      )
      .orderBy(desc(noteTable.updatedAt))
      .innerJoin(userTable, eq(userTable.id, noteTable.userId));

    return notes;
  } catch (err) {
    console.log("🚀 ~ getNotes ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Failed to get notes");
  }
}

function getSqlStatement(user: User) {
  return sql<DBNote[]>`SELECT 
  ${noteTable.id}, 
  ${noteTable.text}, 
  ${noteTable.category},
  ${noteTable.isComplete} AS "isComplete",
  ${noteTable.userId} AS "userId", 
  ${noteTable.createdAt} AS "createdAt", 
  ${noteTable.updatedAt} AS "updatedAt", 
  ${userTable.email},
  (SELECT JSON_AGG(
      json_build_object(
        'userId', ${notesToUsersTable.userId},
        'noteId', ${notesToUsersTable.noteId},
        'user', json_build_object('id', ${userTable.id},'email', ${userTable.email})
      )
    )
    FROM 
    ${notesToUsersTable} 
    LEFT JOIN 
      ${userTable} ON ${userTable.id} = ${notesToUsersTable.userId}
    WHERE 
    ${notesToUsersTable.noteId} = ${noteTable.id} 
    ) AS "sharedWith"
    
    FROM 
      ${noteTable}
    INNER JOIN ${userTable} ON ${userTable.id} = ${noteTable.userId}
    WHERE 
      (${noteTable.userId} = ${user.id} OR EXISTS (
        SELECT 
            1 
        FROM 
            ${notesToUsersTable} 
        WHERE 
            ${notesToUsersTable.noteId} = ${noteTable.id} 
            AND ${notesToUsersTable.userId} = ${user.id}
    )) AND ${noteTable.deletedAt} IS NULL
    ORDER BY ${noteTable.updatedAt} DESC`;
}
