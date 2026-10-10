import Elysia, { t } from "elysia";

export const authModal = new Elysia().model({
  "auth.session": t.Cookie(
    {
      session: t.Optional(
        t.String({
          description: "Session cookie for user authentication",
          error: "Invalid session cookie",
          title: "Session Cookie"
        })
      )
    },
    {
      secrets: [process.env.COOKIE_SECRET ?? "secret"],
      sign: ["session"]
    }
  )
});
