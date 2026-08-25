import { z } from "zod";
import {
	closeAccountController,
	getMeController,
	updateUserProfileController,
} from "../controllers/user.ts";
import { secureMiddleware } from "../middleware/auth.ts";
import {
	errorLoggingMiddleware,
	loggingMiddleware,
} from "../middleware/logging.ts";
import { validateRequestBodyMiddleware } from "../middleware/validation.ts";
import { objectIdStringSchema } from "../schemas/mongodb.ts";
import {
	updateUserProfileRequestBodySchema,
	userResponseSchema,
} from "../schemas/user.ts";
import { createDocumentedRoute } from "../utilities/docs.ts";

const { router, route } = createDocumentedRoute("/api/v1/users");

const tags = ["Users"];
const userResponseConfig = {
	"200": {
		content: {
			"application/json": {
				schema: userResponseSchema,
			},
		},
	},
};

route(
	{
		path: "/me",
		method: "get",
		tags,
		summary: "Get current user",
		description: "Return the authenticated user from the bearer access token.",
		responses: userResponseConfig,
	},
	loggingMiddleware,
	errorLoggingMiddleware(secureMiddleware),
	errorLoggingMiddleware(getMeController),
);

route(
	{
		path: "/{id}",
		method: "delete",
		tags,
		summary: "Close user account",
		description:
			"Deletes the user account and returns user information. The password is not included in the response.",
		request: {
			params: z.object({
				id: objectIdStringSchema.meta({
					description: "The ID of the user to delete",
				}),
			}),
		},
		responses: userResponseConfig,
	},
	loggingMiddleware,
	errorLoggingMiddleware(secureMiddleware),
	errorLoggingMiddleware(closeAccountController),
);

route(
	{
		path: "/{id}",
		method: "put",
		tags,
		summary: "Update user profile",
		description:
			"Update the authenticated user's profile fields (username and email).",
		request: {
			params: z.object({
				id: objectIdStringSchema.meta({
					description: "The ID of the user to update",
				}),
			}),
			body: {
				content: {
					"application/json": {
						schema: updateUserProfileRequestBodySchema,
					},
				},
				required: true,
			},
		},
		responses: {
			"200": {
				content: {
					"application/json": {
						schema: userResponseSchema,
					},
				},
			},
		},
	},
	loggingMiddleware,
	errorLoggingMiddleware(secureMiddleware),
	errorLoggingMiddleware(
		validateRequestBodyMiddleware(updateUserProfileRequestBodySchema),
	),
	errorLoggingMiddleware(updateUserProfileController),
);

export default router;
