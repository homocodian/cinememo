import bearer from "@elysiajs/bearer";
import Elysia from "elysia";
import { ip } from "elysia-ip";
import { rateLimit } from "elysia-rate-limit";

import { rateLimiterkeyGenerator } from "@/libs/rate-limiter-key-generator";
import {
  emailVerificationSchema,
  loginUserSchema,
  logoutSchema,
  oAuthQuerySchema,
  passwordResetSchema,
  passwordResetTokenSchema,
  registerUserSchema
} from "@/v1/validations/user";

import { createGoogleOAuth } from "../controllers/auth/create-google-oauth";
import { emailVerification } from "../controllers/user/email-verification";
import { googleCallback } from "../controllers/user/google-callback";
import { googleLogin } from "../controllers/user/google-login";
import { loginUser } from "../controllers/user/login";
import { logout, logoutAll } from "../controllers/user/logout";
import { passwordReset } from "../controllers/user/password-reset";
import { passwordResetToken } from "../controllers/user/password-reset-token";
import { getProfile } from "../controllers/user/profile";
import { registerUser } from "../controllers/user/register";
import { sendVerificationEmail } from "../controllers/user/send-verification-email";
import { deriveUser } from "../utils/note/derive-user";
import { oAuthBodySchema } from "../validations/auth";

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(bearer())
  .use(ip())
  .use(
    rateLimit({
      max: 10,
      scoping: "scoped",
      generator: rateLimiterkeyGenerator
    })
  )
  .post("/register", registerUser, {
    body: registerUserSchema
  })
  .post("/login", loginUser, {
    body: loginUserSchema
  })
  .get("/google", googleLogin)
  .post("/google", createGoogleOAuth, { body: oAuthBodySchema })
  .get("/google/callback", googleCallback, { query: oAuthQuerySchema })
  .post("/logout", logout, { body: logoutSchema })
  .post("/logout-all", logoutAll)
  .get("/profile", getProfile);

export const passwordResetRoute = new Elysia({ prefix: "/auth" })
  .use(bearer())
  .use(
    rateLimit({
      scoping: "scoped",
      max: 3,
      generator: rateLimiterkeyGenerator,
      countFailedRequest: true
    })
  )
  .post("/reset-password", passwordReset, { body: passwordResetSchema })
  .post("/reset-password/:token", passwordResetToken, {
    body: passwordResetTokenSchema
  });

export const emailVerificationRoute = new Elysia({ prefix: "/auth" })
  .use(bearer())
  .derive(deriveUser)
  .use(
    rateLimit({
      scoping: "scoped",
      max: 3,
      generator: rateLimiterkeyGenerator,
      countFailedRequest: true
    })
  )
  .post("/email-verification", emailVerification, {
    body: emailVerificationSchema
  });

export const getVerificationCodeRoute = new Elysia({ prefix: "/auth" })
  .use(bearer())
  .derive(deriveUser)
  .use(
    rateLimit({
      scoping: "scoped",
      max: 1,
      generator: rateLimiterkeyGenerator
    })
  )
  .get("/email-verification", sendVerificationEmail);
