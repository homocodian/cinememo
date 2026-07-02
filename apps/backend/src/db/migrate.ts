import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as path from "node:path";

import { env } from "@/env";

import { createSqlClient } from "./client";

const sql = createSqlClient(env.DIRECT_DATABASE_URL, {
  max: 1,
  prepare: false
});

const db = drizzle(sql);

async function runMigration() {
  try {
    console.log("Migrating....");
    await migrate(db, {
      migrationsFolder: path.join(import.meta.dir, "migrations")
    });
    await sql.end();
    console.log("Migration done.");
  } catch (error) {
    console.log("🚀 ~ runMigration ~ error:", error);
  }
}

runMigration();
