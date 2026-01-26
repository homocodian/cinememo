// sort-imports-ignore
import "./libs/sentry";

import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { ip } from "elysia-ip";

import { env } from "./env";
import { v1Routes } from "./v1";
import { rootErrorHandler } from "./v1/utils/root-error-handler";

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

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
