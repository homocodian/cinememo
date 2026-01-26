import * as z from "zod/v4";

import { ValidationError } from "../validation-error";

const noteDeleteSchema = z.array(z.string());

export function getNotesToDelete(deleted: Array<string> | undefined) {
  let notesToDelete: string[] = [];

  if (deleted && deleted.length > 0) {
    try {
      notesToDelete = noteDeleteSchema.parse(deleted);
    } catch (error) {
      throw new ValidationError("Unprocessable Content at note.deleted");
    }
  }

  return notesToDelete;
}
