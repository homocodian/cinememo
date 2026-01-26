import * as z from "zod/v4";

const server = z.object({
  PORT: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1),
  TOKEN_SECRET: z.string().min(1),
  ALGORITHM: z.string().min(1),
  HOSTNAME: z.string().min(1).optional(),
  CLIENT_URL: z.url(),
  RESEND_API_KEY: z.string().min(1),
  APP_NAME: z.string().min(1),
  ADMIN_EMAIL: z.email(),
  REDIS_URL: z.string().min(1),
  IPINFO_TOKEN: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().min(1)
});

type ServerEnv = z.infer<typeof server>;

const processEnv = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  ALGORITHM: process.env.ALGORITHM,
  HOSTNAME: process.env.HOSTNAME,
  CLIENT_URL: process.env.CLIENT_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  APP_NAME: process.env.APP_NAME,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  REDIS_URL: process.env.REDIS_URL,
  IPINFO_TOKEN: process.env.IPINFO_TOKEN,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI
} satisfies Record<keyof ServerEnv, string | undefined>;

// Don't touch the part below
// --------------------------

let defaultEnv = process.env;

if (!!process.env.SKIP_ENV_VALIDATION == false) {
  const isServer = typeof window === "undefined";

  let parsed = server.safeParse(processEnv);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:\n",
      z.prettifyError(parsed.error)
    );
    process.exit(1);
  }

  defaultEnv = new Proxy(processEnv, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`
        );
      return target[prop as keyof typeof target];
    }
  });
}

export const env = defaultEnv as ServerEnv;
