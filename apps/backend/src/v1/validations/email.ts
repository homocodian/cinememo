import * as z from "zod/v4";

const emailSchema = z.email();

export function isValidEmail(email: string) {
  return emailSchema.safeParse(email).success;
}
