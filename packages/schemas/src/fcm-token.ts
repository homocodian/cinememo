import * as z from "zod/v4";

export const createFCMTokenSchema = z.object({
  deviceId: z
    .string({ error: "Device ID is required" })
    .min(1, "Device ID cannot be empty"),
  token: z
    .string({ error: "Token is required" })
    .min(1, "Token cannot be empty")
});

export type CreateFCMToken = z.infer<typeof createFCMTokenSchema>;
