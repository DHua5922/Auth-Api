import { z } from "zod";
import {
	EMPTY_PASSWORD_ERROR_MESSAGE,
	NO_MATCHING_PASSWORDS_ERROR_MESSAGE,
} from "../constants.ts";
import { userResponseSchema } from "./user.ts";

const tokenSchema = z.string().meta({
	type: "string",
	example:
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2Y0YjQ3ZDYyYjA0ZDAwMTQxYzE4ZjkiLCJ0eXBlIjoiYWNjZXNzIiwiZXhwaXJlZEluIjoiMTVtIiwiaWF0IjoxNjg4NzQ3OTk5fQ.8n7v8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8",
});

const passwordInputSchema = z.string().meta({
	type: "string",
	example: "password123",
});

const accessTokenExpireTimeSchema = z.string().meta({
	type: "string",
	example: "15m",
});
const refreshTokenExpireTimeSchema = z.string().meta({
	type: "string",
	example: "7d",
});

export const loginRequestBodySchema = z.object({
	email: z.email().meta({
		type: "string",
		example: "user@example.com",
	}),
	password: z.string().meta({
		type: "string",
		example: "password123",
	}),
});

export const loginResponseSchema = z.object({
	user: userResponseSchema,
	accessToken: tokenSchema,
	refreshToken: tokenSchema,
	accessTokenExpireTime: accessTokenExpireTimeSchema,
	refreshTokenExpireTime: refreshTokenExpireTimeSchema,
});

export const registerUserServiceInputSchema = z
	.object({
		username: z
			.string()
			.min(1, {
				message: "Username cannot be empty",
			})
			.meta({
				type: "string",
				example: "john_doe",
			}),
		email: z.email({
			message: "Email is invalid",
		}),
		password: passwordInputSchema.min(1, {
			message: EMPTY_PASSWORD_ERROR_MESSAGE,
		}),
		confirmPassword: passwordInputSchema,
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.confirmPassword) {
			ctx.addIssue({
				code: "custom",
				message: NO_MATCHING_PASSWORDS_ERROR_MESSAGE,
				path: ["confirmPassword"],
			});
		}

		if (!data.password.trim()) {
			ctx.addIssue({
				code: "custom",
				message: EMPTY_PASSWORD_ERROR_MESSAGE,
				path: ["password"],
			});
		}
	});
export type RegisterUserServiceInput = z.infer<
	typeof registerUserServiceInputSchema
>;

export const refreshTokensResponseSchema = z.object({
	accessToken: tokenSchema,
	refreshToken: tokenSchema,
	accessTokenExpireTime: accessTokenExpireTimeSchema,
	refreshTokenExpireTime: refreshTokenExpireTimeSchema,
});
