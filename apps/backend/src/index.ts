// sort-imports-ignore
import "./libs/sentry";

import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { ip } from "elysia-ip";

import { env } from "./env";
import { v1Routes } from "./v1";
import { rootErrorHandler } from "./v1/utils/root-error-handler";
import { redisClient } from "./libs/redis-connection";
import { sqlClient } from "./db/client";

const app = new Elysia({ prefix: "/api" })
  .use(cors())
  .use(ip())
  .onError(rootErrorHandler)
  .use(v1Routes)
  .get("/", () => {
    return {
      success: true,
      data: "Server running"
    };
  })
  .post("/", () => {
    return {
      success: true,
      data: "Server running"
    };
  })
  .listen(env.PORT || 3000);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("Shutting down gracefully...");

  if (app.server) {
    try {
      await app.stop(true);
      console.log("HTTP server closed");
    } catch (err) {
      console.error("Error while closing the server:", err);
    }
  }

  try {
    await sqlClient.end({ timeout: 0 });
    console.log("Database connection closed");
  } catch (err) {
    console.error("Error while closing the database connection:", err);
  }

  if (redisClient.status === "ready" || redisClient.status === "connect") {
    try {
      await redisClient.quit();
      console.log("Redis connection closed");
    } catch (err) {
      console.error("Error while closing the Redis connection:", err);
    }
  }

  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
