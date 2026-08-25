import type { Response } from "express";
import { z } from "zod";
import { SUCCESS_STATUS_CODE } from "../constants.ts";
import { objectIdStringSchema } from "../schemas/mongodb.ts";
import { userResponseSchema } from "../schemas/user.ts";
import { updateUserProfileByIdService } from "../services/user.ts";
import type { RequestWithUser } from "../types/request.ts";

const updateUserProfileParamsSchema = z.object({
	id: objectIdStringSchema,
});

export async function updateUserProfileController(
	req: RequestWithUser,
	res: Response,
) {
	const { id } = updateUserProfileParamsSchema.parse(req.params);
	const updatedUser = await updateUserProfileByIdService(id, req.body);
	const responseData = userResponseSchema.parse(updatedUser);

	res.status(SUCCESS_STATUS_CODE).json(responseData);
}
