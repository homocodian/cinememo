import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as path from "node:path";

const sql = new SQL(process.env.DATABASE_URL!, { max: 1 });
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
