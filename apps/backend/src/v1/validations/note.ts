import { createInsertSchema } from "drizzle-zod";
import * as z from "zod/v4";

import { noteTable } from "@/db/schema/note";

// create note
const _noteInsertSchema = createInsertSchema(noteTable);

export const createNoteSchema = _noteInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true
});

export type CreateNote = z.infer<typeof createNoteSchema>;

// update note

export const updateNoteSchema = createNoteSchema.partial();
export const updateNoteParamsSchema = z.object({
  id: z.string({ error: "ID is required" }).min(1, "ID cannot be empty")
});

export type UpdateNoteParamsSchema = z.infer<typeof updateNoteParamsSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;

// share note

export const shareNoteWithSchema = z.email({
  error: "A valid email is required"
});
export type ShareNoteWithSchema = z.infer<typeof shareNoteWithSchema>;

export const shareNoteWithUsersSchema = z.array(shareNoteWithSchema);
export type ShareNoteWithUsersSchema = z.infer<typeof shareNoteWithUsersSchema>;

export const shareNoteParams = z.object({
  id: z.string({ error: "ID is required" }).min(1, "ID cannot be empty")
});
export type ShareNoteParams = z.infer<typeof shareNoteParams>;

export const patchShareNoteWithUsersBody = z.union([
  shareNoteWithSchema,
  shareNoteWithUsersSchema
]);

export type PatchShareNoteWithUsersBody = z.infer<
  typeof patchShareNoteWithUsersBody
>;
