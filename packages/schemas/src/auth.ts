import * as z from "zod";

import { deviceSchema, userSchema } from "./user";

export const oAuthUserScheme = z.object({
  ...userSchema.shape,
  id: z.string(),
});

export type OAuthUser = z.infer<typeof oAuthUserScheme>;

export const oAuthBodySchema = z.object({
  user: oAuthUserScheme,
  device: deviceSchema,
});

export type OAuthBody = z.infer<typeof oAuthBodySchema>;
