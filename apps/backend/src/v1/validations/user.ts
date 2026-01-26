import * as z from "zod/v4";

import { deviceTypeList } from "@/db/schema/user";

const deviceType = z.enum(deviceTypeList);
// type DeviceType = z.infer<typeof deviceType>;

export const deviceSchema = z
  .object({
    type: deviceType.meta({ error: "Device type is required" }),
    name: z.string({ error: "Name is required" }),
    model: z.string({ error: "Model is required" }),
    osVersion: z.string({ error: "OS Version is required" }),
    os: z.string({ error: "OS is required" })
  })
  .partial()
  .optional();

export type DeviceSchema = z.infer<typeof deviceSchema>;

export const registerUserSchema = z.object(
  {
    fullName: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .string({ error: "Name is required" })
        .min(3, "Name must of at least 3 characters")
        .optional()
    ),
    email: z
      .string({
        error: "Email must of at least 3 characters"
      })
      .min(3, "Email must of at least 3 characters"),
    password: z
      .string({
        error: "Password must be at least 6 characters"
      })
      .min(8, "Password must be at least 6 characters"),
    device: deviceSchema
  },
  {
    error: "Expected an email and password"
  }
);

export type RegisterUser = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object(
  {
    email: z.string({
      error: "Invalid Email"
    }),
    password: z.string({
      error: "Password is required"
    }),
    device: deviceSchema
  },
  { error: "Email & password are required" }
);

export type LoginUser = z.infer<typeof loginUserSchema>;

export const passwordResetSchema = z.object({
  email: z.string({
    error: "Email is required"
  })
});

export type PasswordReset = z.infer<typeof passwordResetSchema>;

export const userSchema = z.object({
  id: z
    .number({ error: "ID is required" })
    .positive({ error: "ID must be a positive number" }),
  email: z.email({ error: "Email is required" }),
  emailVerified: z.boolean({ error: "Email verification status is required" }),
  photoURL: z.string({ error: "Photo URL is required" }).nullable(),
  displayName: z.string({ error: "Display name is required" }).nullable()
});

export type UserSchema = z.infer<typeof userSchema>;

export const emailVerificationSchema = z.object({
  code: z.string({ error: "Code is required" })
});

export type EmailVerification = z.infer<typeof emailVerificationSchema>;

export const passwordResetTokenSchema = z.object({
  password: z.string({ error: "Password is required" })
});

export type PasswordResetToken = z.infer<typeof passwordResetTokenSchema>;

export const logoutSchema = z
  .object({ deviceId: z.string().min(1) })
  .optional();

export type LogoutSchema = z.infer<typeof logoutSchema>;

export const userUpdateSchema = z
  .object({
    displayName: z
      .string({ error: "Display name is required" })
      .min(3, "Display name must be at least 3 characters"),
    photoURL: z.url({ error: "Photo URL must be a valid URL" })
  })
  .partial();

export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string({ error: "Current password is required" }),
  newPassword: z
    .string({ error: "New password is required" })
    .min(8, "New password must be at least 8 characters")
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export const oAuthQuerySchema = z
  .object({
    device: deviceSchema,
    redirect: z.url({ error: "Redirect URL is required" }),
    callback: z.url({ error: "Callback URL is required" })
  })
  .partial();

export type OAuthQuerySchema = z.infer<typeof oAuthQuerySchema>;
