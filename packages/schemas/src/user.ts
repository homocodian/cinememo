import * as z from "zod";

export const deviceTypes = [
  "UNKNOWN",
  "PHONE",
  "TABLET",
  "DESKTOP",
  "TV",
] as const;

const deviceType = z.enum(deviceTypes);

export const deviceSchema = z
  .object({
    type: deviceType.meta({ error: "Device type is required" }),
    name: z.string({ error: "Name is required" }),
    model: z.string({ error: "Model is required" }),
    osVersion: z.string({ error: "OS Version is required" }),
    os: z.string({ error: "OS is required" }),
  })
  .partial()
  .optional();

export type Device = z.infer<typeof deviceSchema>;

export const registerUserSchema = z
  .object(
    {
      fullName: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z
          .string({ error: "Name is required" })
          .min(3, "Name must of at least 3 characters")
          .optional(),
      ),
      email: z
        .string({
          error: "Email must of at least 3 characters",
        })
        .min(3, "Email must of at least 3 characters"),
      password: z
        .string({
          error: "Password must be at least 8 characters",
        })
        .min(8, "Password must be at least 8 characters"),
      confirmPassword: z
        .string({
          error: "Confirm password is required",
        })
        .optional(),
      device: deviceSchema,
    },
    {
      error: "Expected an email and password",
    },
  )
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterUser = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object(
  {
    email: z.string({
      error: "Invalid Email",
    }),
    password: z.string({
      error: "Password is required",
    }),
    device: deviceSchema,
  },
  { error: "Email & password are required" },
);

export type LoginUser = z.infer<typeof loginUserSchema>;

export const passwordResetSchema = z.object({
  email: z.string({
    error: "Email is required",
  }),
});

export type PasswordReset = z.infer<typeof passwordResetSchema>;

export const userSchema = z.object({
  id: z
    .number({ error: "ID is required" })
    .positive({ error: "ID must be a positive number" }),
  email: z.email({ error: "Email is required" }),
  emailVerified: z.boolean({ error: "Email verification status is required" }),
  photoURL: z.string({ error: "Photo URL is required" }).nullable(),
  displayName: z.string({ error: "Display name is required" }).nullable(),
});

export type User = z.infer<typeof userSchema>;

export const emailVerificationSchema = z.object({
  code: z.string({ error: "Code is required" }),
});

export type EmailVerification = z.infer<typeof emailVerificationSchema>;

export const passwordResetTokenSchema = z.object({
  password: z.string({ error: "Password is required" }),
});

export type PasswordResetToken = z.infer<typeof passwordResetTokenSchema>;

export const logoutSchema = z
  .object({ deviceId: z.string().min(1) })
  .optional();

export type Logout = z.infer<typeof logoutSchema>;

export const userUpdateSchema = z
  .object({
    displayName: z
      .string({ error: "Display name is required" })
      .min(3, "Display name must be at least 3 characters"),
    photoURL: z.url({ error: "Photo URL must be a valid URL" }),
  })
  .partial();

export type UserUpdate = z.infer<typeof userUpdateSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string({ error: "Current password is required" }),
  newPassword: z
    .string({ error: "New password is required" })
    .min(8, "New password must be at least 8 characters"),
});

export type ChangePassword = z.infer<typeof changePasswordSchema>;

export const oAuthQuerySchema = z
  .object({
    device: deviceSchema,
    redirect: z.url({ error: "Redirect URL is required" }),
    callback: z.url({ error: "Callback URL is required" }),
  })
  .partial();

export type OAuthQuery = z.infer<typeof oAuthQuerySchema>;
