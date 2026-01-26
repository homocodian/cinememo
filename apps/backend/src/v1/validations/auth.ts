import * as z from "zod/v4";

import { deviceSchema, userSchema } from "./user";

export const oAuthUserScheme = z.object({
  ...userSchema.shape,
  id: z.string()
});

export type OAuthUserSchema = z.infer<typeof oAuthUserScheme>;

export const oAuthBodySchema = z.object({
  user: oAuthUserScheme,
  device: deviceSchema
});

export type OAuthBodySchema = z.infer<typeof oAuthBodySchema>;
