import { Types } from "mongoose";
import { z } from "zod";
import { objectIdStringSchema } from "./mongodb.ts";

const objectIdSchema = z.preprocess(
	(id) =>
		id instanceof Types.ObjectId || hasToHexString(id) ? id.toHexString() : id,
	objectIdStringSchema,
);

const roleSchema = z.object({
	_id: objectIdSchema,
	name: z.string(),
	description: z.string(),
	systemManaged: z.boolean().optional(),
});

export const userResponseSchema = z.object({
	_id: objectIdSchema,
	username: z.string(),
	email: z.email(),
	role: z.union([
		roleSchema.transform((role) => role._id).pipe(objectIdStringSchema),
		objectIdStringSchema,
	]),
	dateCreated: z.date(),
	systemManaged: z.boolean().optional(),
});

export const updateUserProfileRequestBodySchema = z.object({
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
});

export type UpdateUserProfileInput = z.infer<
	typeof updateUserProfileRequestBodySchema
>;

function hasToHexString(
	value: unknown,
): value is { toHexString: () => string } {
	return (
		typeof value === "object" &&
		value !== null &&
		"toHexString" in value &&
		typeof value.toHexString === "function"
	);
}
