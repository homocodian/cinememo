import { generateCodeVerifier, generateState } from "arctic";
import { Context } from "elysia";

import { google } from "@/libs/auth";
import { OAuthQuerySchema } from "@/v1/validations/user";

interface GoogleLoginProps extends Omit<Context, "query"> {
  query: OAuthQuerySchema;
  ip: string;
}

export async function googleLogin({
  cookie,
  redirect,
  query,
  request,
  ip
}: GoogleLoginProps) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")?.[0] || ip;

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "email",
    "profile"
  ]);

  cookie?.google_oauth_code_verifier?.set({
    value: codeVerifier,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
    sameSite: "lax"
  });

  cookie?.google_oauth_state?.set({
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
    sameSite: "lax"
  });

  if (query.device) {
    cookie?.device?.set({
      value: query.device,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      path: "/",
      sameSite: "lax"
    });
  }

  if (query.redirect) {
    cookie.redirect?.set({
      value: query.redirect,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      path: "/",
      sameSite: "lax"
    });
  }

  if (query.callback) {
    cookie.callback?.set({
      value: query.callback,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      path: "/",
      sameSite: "lax"
    });
  }

  cookie?.ip?.set({
    value: clientIP,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
    sameSite: "lax"
  });

  return redirect(url.toString(), 302);
}
