import Elysia from "elysia";

export function errorHandlerInstance(app: Elysia) {
  return app.onError(({ error, code }) => {
    console.log(
      "\n--- ERROR_HANDLER ---\n",
      "CODE = ",
      code,
      "\n",
      "ERROR = ",
      error,
      "\n--- ERROR_HANDLER ---\n"
    );

    if (code === "VALIDATION") {
      return (error.all[0]?.summary ?? error.message.includes("supabase"))
        ? "Something went wrong"
        : (error?.["customError"] ?? error.message);
    }

    if (error instanceof Error) {
      return error.message.includes("supabase")
        ? "Something went wrong"
        : error.message;
    }

    return error;
  });
}
