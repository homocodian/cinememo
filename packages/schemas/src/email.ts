import * as z from "zod";

const emailSchema = z.email();

export function isValidEmail(email: string) {
  return emailSchema.safeParse(email).success;
}
