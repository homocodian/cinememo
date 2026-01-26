import { User } from "lucia";

import { CreateNote, NoteCategory } from "@/db/schema/note";
import { noteSchema } from "@/v1/validations/sync";

import { ValidationError } from "../validation-error";

export function getNotesToCreate(
  created: Array<Record<string, unknown>> | undefined,
  user: User
) {
  let notesToCreate: CreateNote[] = [];

  if (created && created.length > 0) {
    try {
      notesToCreate = noteSchema
        .array()
        .parse(created)
        .map((note) => ({
          id: note.id,
          userId: user.id,
          text: note.text,
          isComplete: note.is_complete,
          category: note.category as NoteCategory,
          createdAt: note.created_at,
          updatedAt: note.updated_at
        }));
    } catch (error) {
      console.log("🚀 ~ error:", error);
      throw new ValidationError("Unprocessable Content at note.created");
    }
  }

  return notesToCreate;
}
