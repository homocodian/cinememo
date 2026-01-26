import * as Sentry from "@sentry/bun";
import { ErrorHandler } from "elysia";

type ErrorParams = Pick<
  Parameters<ErrorHandler>[number],
  "code" | "error" | "status"
>;

export function rootErrorHandler({ error, status, code }: ErrorParams) {
  console.log("ROOT ERROR HANDLER: [ERROR]: ", error, "[CODE: ]", code);

  if (code === "VALIDATION") {
    return status(422, (error as any)?.customError ?? "Bad Request");
  }

  if ((error as any)?.message) {
    return status(
      500,
      (error as any)?.message.includes("supabase")
        ? "Something went wrong"
        : ((error as any)?.customError ?? (error as any)?.message) ||
            "Something went wrong"
    );
  }

  return status(500, "Internal Server Error");
}
