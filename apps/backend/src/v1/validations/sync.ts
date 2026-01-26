import * as z from "zod/v4";

const dateSchema = z.object({
  created_at: z
    .union([z.string(), z.number()], { error: "Invalid date format" })
    .transform((v) => new Date(v)),
  updated_at: z
    .union([z.string(), z.number()], { error: "Invalid date format" })
    .transform((v) => new Date(v)),
  deleted_at: z
    .union([z.string(), z.number()], { error: "Invalid date format" })
    .transform((v) => new Date(v))
    .nullish()
});

export const noteSchema = z.object({
  ...dateSchema.shape,
  id: z.string({ error: "ID is required" }),
  text: z.string({ error: "Text is required" }),
  category: z.string({ error: "Category must be a string" }).optional(),
  is_complete: z.boolean({ error: "is_complete must be a boolean" }).optional(),
  user_id: z.number({ error: "User ID is required" })
});

export type NoteSchema = z.infer<typeof noteSchema>;

export const sharedWithSchema = z.object({
  ...dateSchema.shape,
  note_id: z.string(),
  user_email: z.email()
});

export type SharedWithSchema = z.infer<typeof sharedWithSchema>;

export const changesSchema = z.record(
  z.string(),
  z.object({
    created: z.record(z.string(), z.any()).array(),
    updated: z.record(z.string(), z.any()).array(),
    deleted: z.string().array()
  })
);

export type ChangesSchema = z.infer<typeof changesSchema>;

export const pushChangesBodySchema = changesSchema;
export type PushChangesBodySchema = z.infer<typeof pushChangesBodySchema>;

export const pushChangesQuerySchema = z.object({
  last_pulled_at: z.number()
});

export type PushChangesQuerySchema = z.infer<typeof pushChangesQuerySchema>;

export const pullChangesQuerySchema = z.object({
  last_pulled_at: z.number().optional(),
  schema_version: z.number(),
  migration: z
    .object({
      from: z.number(),
      tables: z.string().array(),
      columns: z
        .object({
          table: z.string(),
          columns: z.array(z.string())
        })
        .array()
    })
    .nullish()
});

export type PullChangesQuerySchema = z.infer<typeof pullChangesQuerySchema>;

export const pullChangesBodySchema = z.record(z.string(), z.string().array());

export type PullChangesBodySchema = z.infer<typeof pullChangesBodySchema>;
