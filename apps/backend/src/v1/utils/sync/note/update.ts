import * as z from "zod/v4";

import { noteSchema } from "@/v1/validations/sync";

import { ValidationError } from "../validation-error";

const noteUpdateSchema = noteSchema.partial().required({
  id: true,
  user_id: true
});

type NoteUpdate = z.infer<typeof noteUpdateSchema>;

export function getNotesToUpdate(
  updated: Array<Record<string, unknown>> | undefined
) {
  let notesToUpdate: NoteUpdate[] = [];

  if (updated && updated.length > 0) {
    try {
      notesToUpdate = noteUpdateSchema.array().parse(updated);
    } catch (error) {
      throw new ValidationError("Unprocessable Content at note.updated");
    }
  }

  return notesToUpdate;
}
