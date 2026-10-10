import cron, { Patterns } from "@elysiajs/cron";
import * as Sentry from "@sentry/bun";
import Elysia from "elysia";

import { deleteExpiredSessions } from "@/libs/auth";
import { checkDatabaseHealth } from "@/libs/db-health-check";

import { deleteOlderNotes } from "../controllers/cron/delete-older-notes";

export const cronRoute = new Elysia({ prefix: "cron" })
  .use(
    cron({
      name: "delete_older_notes",
      pattern: Patterns.daily(),
      run: async () => {
        if (process.env.NODE_ENV === "production") {
          await deleteOlderNotes().catch((err) => {
            console.error("🚀 ~ delete_older_notes ~ err:", err);
            Sentry.captureException(err);
          });
        }
      }
    })
  )
  .use(
    cron({
      name: "database_health_check",
      pattern: Patterns.weekly(),
      run: async (store) => {
        if (process.env.NODE_ENV === "production") {
          await checkDatabaseHealth().catch((err) => {
            console.error("🚀 ~ database_health_check ~ err:", err);
            Sentry.captureException(err);
          });
        }
      }
    })
  )
  .use(
    cron({
      name: "delete_expired_sessions",
      pattern: Patterns.daily(),
      run: async () => {
        if (process.env.NODE_ENV === "production") {
          await deleteExpiredSessions().catch((err) => {
            console.error("🚀 ~ delete_expired_sessions ~ err:", err);
            Sentry.captureException(err);
          });
        }
      }
    })
  );
