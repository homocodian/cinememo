import * as Sentry from "@sentry/bun";

import { sqlClient } from "@/db/client";

import { sendDatabaseUnhealthyReport } from "./emails/send-database-unhealthy-report";

export async function checkDatabaseHealth(timeoutMs = 3000) {
  try {
    await Promise.race([
      sqlClient`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("DB health check timed out")),
          timeoutMs
        )
      )
    ]);
    return { status: "healthy" };
  } catch (error) {
    Sentry.captureException(error);
    sendDatabaseUnhealthyReport(error);
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
