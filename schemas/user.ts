import { Types } from "mongoose";
import { z } from "zod";
import { objectIdStringSchema } from "./mongodb.ts";

const objectIdSchema = z.preprocess(
	(id) => (id instanceof Types.ObjectId ? id.toHexString() : id),
	objectIdStringSchema,
);

const roleSchema = z.object({
	_id: objectIdSchema,
	name: z.string(),
	description: z.string(),
	systemManaged: z.boolean().optional(),
});

export const userResponseSchema = z.object({
	_id: objectIdStringSchema,
	username: z.string(),
	email: z.email(),
	role: roleSchema.transform((role) => role._id).pipe(objectIdStringSchema),
	dateCreated: z.date(),
	systemManaged: z.boolean().optional(),
});
