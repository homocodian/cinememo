import * as Sentry from "@sentry/bun";
import { and, eq } from "drizzle-orm";
import { Context } from "elysia";

import { db } from "@/db";
import { deviceTable } from "@/db/schema/user";
import { lucia } from "@/libs/auth";
import { UserWithSession } from "@/v1/utils/note/derive-user";

interface RevokeDeviceProps extends Omit<Context, "params"> {
  user: UserWithSession;
  params: {
    id: string;
  };
}

export async function revokeDevice({
  user,
  params,
  status
}: RevokeDeviceProps) {
  const deviceId = +params.id;
  if (!deviceId || isNaN(deviceId)) {
    return status(400, "Invalid Device Id");
  }

  try {
    const [device] = await db
      .select()
      .from(deviceTable)
      .where(
        and(eq(deviceTable.userId, user.id), eq(deviceTable.id, deviceId))
      );

    if (!device) {
      return status(404, "Device Not Found");
    }

    await lucia.invalidateSession(device.sessionId);
    return { message: "Device Revoked" };
  } catch (err) {
    console.error("🚀 ~ revokeDevice ~ err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
