import { z } from "zod";

const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

export const authSchema = z.object({
	email: z.string().min(1, "Email is required").email(),
	password: z.string().min(1, "Password is required"),
});

export const registerAuthSchema = authSchema
	.merge(
		z.object({
			password: z
				.string()
				.min(8, "Password must contain at least 8 characters")
				.regex(
					passwordRegex,
					"Password should contain atleast one number and one special character"
				),
			confirmPassword: z.string(),
		})
	)
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export type AuthSchema = z.infer<typeof authSchema>;

export type RegisterAuthSchema = z.infer<typeof registerAuthSchema>;
