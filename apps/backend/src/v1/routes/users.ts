import bearer from "@elysiajs/bearer";
import Elysia from "elysia";
import { rateLimit } from "elysia-rate-limit";

import { rateLimiterkeyGenerator } from "@/libs/rate-limiter-key-generator";

import { changePassword } from "../controllers/user/change-password";
import { createFCMToken } from "../controllers/user/fcm-token";
import { getDevices } from "../controllers/user/get-devices";
import { revokeDevice } from "../controllers/user/revoke-device";
import { updateUser } from "../controllers/user/update";
import { errorHandlerInstance } from "../utils/error-handler";
import { deriveUser } from "../utils/note/derive-user";
import { createFCMTokenSchema } from "../validations/fcm-token";
import { changePasswordSchema, userUpdateSchema } from "../validations/user";

export const userRoute = new Elysia({ prefix: "/user" })
  .use(bearer())
  .use(errorHandlerInstance)
  .derive(deriveUser)
  .use(
    rateLimit({
      scoping: "scoped",
      max: 5,
      generator: rateLimiterkeyGenerator,
      countFailedRequest: false
    })
  )
  .post("/fcm-token", createFCMToken, { body: createFCMTokenSchema })
  .patch("/profile", updateUser, { body: userUpdateSchema })
  .patch("/change-password", changePassword, { body: changePasswordSchema })
  .get("/devices", getDevices)
  .delete("/devices/:id", revokeDevice, {});
