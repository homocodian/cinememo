import IORedis from "ioredis";

import { env } from "@/env";

export const redisClient = new IORedis(env.REDIS_URL, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: null
});

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});
