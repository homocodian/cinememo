import * as Sentry from "@sentry/bun";
import { Context, t } from "elysia";
import { User } from "lucia";

import { NotesToUsers } from "@/db/schema/note";
import { getData } from "@/v1/utils/sync/get-data";
import { getTransformData } from "@/v1/utils/sync/get-transformed-data";
import {
  PullChangesBodySchema,
  PullChangesQuerySchema
} from "@/v1/validations/sync";

export type SharedWith = NotesToUsers & { user_email: string; id: null };

interface PullChangesProps extends Omit<Context, "query"> {
  user: User;
  query: PullChangesQuerySchema;
  body: PullChangesBodySchema;
}

export async function pullChanges({
  user,
  query,
  status,
  body
}: PullChangesProps) {
  try {
    const { data, epochTimestamp } = await getData({
      user,
      lastPulledAt: query.last_pulled_at
    });

    const changes = getTransformData(data, body);

    if (process.env.NODE_ENV === "development") {
      console.log("🚀 ~ pull changes:", changes);
    }

    return { changes, timestamp: epochTimestamp };
  } catch (err) {
    console.log("🚀 ~ pull changes err:", err);
    Sentry.captureException(err);
    return status(500, "Internal Server Error");
  }
}
