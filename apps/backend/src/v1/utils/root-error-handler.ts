import * as Sentry from "@sentry/bun";
import { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import { ErrorHandler, ValidationError } from "elysia";

type ErrorParams = Pick<
  Parameters<ErrorHandler>[number],
  "code" | "error" | "status"
>;

export function rootErrorHandler({ error, status, code }: ErrorParams) {
  Sentry.captureException(error);
  console.log(
    "\n--- ROOT_ERROR_HANDLER ---\n",
    "CODE = ",
    code,
    "\n",
    "ERROR = ",
    error,
    "\n--- ROOT_ERROR_HANDLER ---\n"
  );

  if (error instanceof ValidationError) {
    return status(
      "Unprocessable Content",
      error.customError ??
        error.all.map((e) => ({
          path: e.path,
          message: e.message
        }))
    );
  }

  if (error instanceof DrizzleQueryError) {
    const cause = error.cause as any;

    console.error("DB query failed:", error.message, cause);

    switch (cause?.code) {
      case "23505": // unique_violation
        return status(409, "Resource already exists");
      case "23503": // foreign_key_violation
        return status(409, "Related resource not found");
      case "23502": // not_null_violation
        return status(400, "Missing required field");
      default:
        return status(500, "Database error");
    }
  }

  if (error instanceof DrizzleError) {
    console.error("DB error:", error.message, error.cause);
    return status(500, "Database error");
  }

  if ((error as any)?.message?.includes("supabase")) {
    return status(500, "Something went wrong");
  }
}
