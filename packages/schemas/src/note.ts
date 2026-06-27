import * as z from "zod";

export const createNoteSchema = z.object({
  text: z
    .string({ error: "Text is required" })
    .min(3, "Text must be at least 3 characters"),
  category: z.enum(["general", "important"]),
  isComplete: z.boolean().optional(),
  deletedAt: z.date().optional().nullable(),
});

export type CreateNote = z.infer<typeof createNoteSchema>;

// update note

export const updateNoteSchema = createNoteSchema.partial();
export const updateNoteParamsSchema = z.object({
  id: z.string({ error: "ID is required" }).min(1, "ID cannot be empty"),
});

export type UpdateNoteParams = z.infer<typeof updateNoteParamsSchema>;
export type UpdateNote = z.infer<typeof updateNoteSchema>;

// share note

export const shareNoteWithSchema = z.email({
  error: "A valid email is required",
});
export type ShareNoteWith = z.infer<typeof shareNoteWithSchema>;

export const shareNoteWithUsersSchema = z.array(shareNoteWithSchema);
export type ShareNoteWithUsers = z.infer<typeof shareNoteWithUsersSchema>;

export const shareNoteParams = z.object({
  id: z.string({ error: "ID is required" }).min(1, "ID cannot be empty"),
});
export type ShareNoteParams = z.infer<typeof shareNoteParams>;

export const patchShareNoteWithUsersBody = z.union([
  shareNoteWithSchema,
  shareNoteWithUsersSchema,
]);

export type PatchShareNoteWithUsersBody = z.infer<
  typeof patchShareNoteWithUsersBody
>;
