import * as Sentry from "@sentry/bun";
import { SQL } from "bun";

import { env } from "@/env";

import { sendDatabaseUnhealthyReport } from "./emails/send-database-unhealthy-report";

export async function checkDatabaseHealth() {
  const client = new SQL(env.DATABASE_URL);

  try {
    await client.connect();
  } catch (error) {
    Sentry.captureException(error);
    sendDatabaseUnhealthyReport(error);
  } finally {
    await client.end();
  }
}
