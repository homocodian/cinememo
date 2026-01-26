import * as Sentry from "@sentry/bun";
import { and, desc, eq, getTableColumns, ne } from "drizzle-orm";
import { Context } from "elysia";

import { db } from "@/db";
import { DeviceTable, deviceTable } from "@/db/schema/user";
import { UserWithSession } from "@/v1/utils/note/derive-user";

interface GetDevicesProps extends Context {
  user: UserWithSession;
}

type Device = Omit<DeviceTable, "sessionId">;

const { sessionId, ...deviceColumns } = getTableColumns(deviceTable);

export async function getDevices({ user, status }: GetDevicesProps) {
  try {
    const [[current], others] = await Promise.all([
      db
        .select(deviceColumns)
        .from(deviceTable)
        .where(
          and(
            eq(deviceTable.userId, user.id),
            eq(deviceTable.sessionId, user.session.id)
          )
        ),
      db
        .select(deviceColumns)
        .from(deviceTable)
        .where(
          and(
            eq(deviceTable.userId, user.id),
            ne(deviceTable.sessionId, user.session.id)
          )
        )
        .orderBy(desc(deviceTable.createdAt))
    ]);

    return { current, others: others as Device[] };
  } catch (err) {
    console.error("🚀 ~ getDevices ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
