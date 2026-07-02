import postgres from "postgres";

import { env } from "@/env";

const connectionString = env.DATABASE_URL;

export function createSqlClient(
  conString: string,
  options?: { max: number; prepare: boolean }
) {
  return postgres(conString, options);
}

export const sqlClient = createSqlClient(connectionString);
