import { z } from "zod";
import {
	getAccessTokenByEmailController,
	loginController,
	refreshTokensController,
	registerNewUserController,
	resetPasswordController,
} from "../controllers/auth.ts";
import { secureMiddleware } from "../middleware/auth.ts";
import {
	errorLoggingMiddleware,
	loggingMiddleware,
} from "../middleware/logging.ts";
import { validateRequestBodyMiddleware } from "../middleware/validation.ts";
import {
	accessTokenByEmailRequestBodySchema,
	accessTokenByEmailResponseSchema,
	loginRequestBodySchema,
	loginResponseSchema,
	refreshTokensResponseSchema,
	registerUserServiceInputSchema,
	resetPasswordServiceInputSchema,
} from "../schemas/auth.ts";
import { userResponseSchema } from "../schemas/user.ts";
import { createDocumentedRoute } from "../utilities/docs.ts";

const { router, route } = createDocumentedRoute("/api/v1/auth");

const tags = ["Authentication"];
const userResponseConfig = {
	"200": {
		content: {
			"application/json": {
				schema: userResponseSchema,
			},
		},
	},
};

const refreshTokensRequestBodySchema = z.object({
	refreshToken: z.string().meta({
		type: "string",
		example:
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2Y0YjQ3ZDYyYjA0ZDAwMTQxYzE4ZjkiLCJ0eXBlIjoicmVmcmVzaCIsImV4cGlyZWRJbiI6IjdkIiwiaWF0IjoxNjg4NzQ3OTk5fQ.8n7v8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8",
	}),
});

route(
	{
		path: "/login",
		method: "post",
		tags,
		summary: "Log in",
		description:
			"Authenticate a user and returns user information. The password is not included in the response.",
		request: {
			body: {
				content: {
					"application/json": {
						schema: loginRequestBodySchema,
					},
				},
				required: true,
			},
		},
		responses: {
			"200": {
				content: {
					"application/json": {
						schema: loginResponseSchema,
					},
				},
			},
		},
	},
	loggingMiddleware,
	errorLoggingMiddleware(validateRequestBodyMiddleware(loginRequestBodySchema)),
	errorLoggingMiddleware(loginController),
);

route(
	{
		path: "/register",
		method: "post",
		tags,
		summary: "Register user",
		description:
			"Register a new user and return user information with access and refresh tokens.",
		request: {
			body: {
				content: {
					"application/json": {
						schema: registerUserServiceInputSchema,
					},
				},
				required: true,
			},
		},
		responses: {
			"201": {
				content: {
					"application/json": {
						schema: loginResponseSchema,
					},
				},
			},
		},
	},
	loggingMiddleware,
	errorLoggingMiddleware(
		validateRequestBodyMiddleware(registerUserServiceInputSchema),
	),
	errorLoggingMiddleware(registerNewUserController),
);

route(
	{
		path: "/access-token-by-email",
		method: "post",
		tags,
		summary: "Get access token by email",
		description: "Return an access token for the provided email address.",
		request: {
			body: {
				content: {
					"application/json": {
						schema: accessTokenByEmailRequestBodySchema,
					},
				},
				required: true,
			},
		},
		responses: {
			"200": {
				content: {
					"application/json": {
						schema: accessTokenByEmailResponseSchema,
					},
				},
			},
		},
	},
	loggingMiddleware,
	errorLoggingMiddleware(
		validateRequestBodyMiddleware(accessTokenByEmailRequestBodySchema),
	),
	errorLoggingMiddleware(getAccessTokenByEmailController),
);

route(
	{
		path: "/reset-password",
		method: "post",
		tags,
		summary: "Reset password",
		description:
			"Reset the authenticated user's password using password and confirm password.",
		request: {
			body: {
				content: {
					"application/json": {
						schema: resetPasswordServiceInputSchema,
					},
				},
				required: true,
			},
		},
		responses: userResponseConfig,
	},
	loggingMiddleware,
	errorLoggingMiddleware(secureMiddleware),
	errorLoggingMiddleware(
		validateRequestBodyMiddleware(resetPasswordServiceInputSchema),
	),
	errorLoggingMiddleware(resetPasswordController),
);

route(
	{
		path: "/tokens/new",
		method: "post",
		tags,
		summary: "Refresh tokens",
		description:
			"Get new access token and refresh token using the given refresh token.",
		responses: {
			"200": {
				content: {
					"application/json": {
						schema: refreshTokensResponseSchema,
					},
				},
			},
		},
	},
	loggingMiddleware,
	errorLoggingMiddleware(
		validateRequestBodyMiddleware(refreshTokensRequestBodySchema),
	),
	errorLoggingMiddleware(refreshTokensController),
);

export default router;
