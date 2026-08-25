import type { Request, Response } from "express";
import { z } from "zod";
import { SUCCESS_STATUS_CODE } from "../constants.ts";
import { objectIdStringSchema } from "../schemas/mongodb.ts";
import { userResponseSchema } from "../schemas/user.ts";
import {
	deleteUserByIdService,
	updateUserProfileByIdService,
} from "../services/user.ts";
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

export async function closeAccountController(req: Request, res: Response) {
	const user = await deleteUserByIdService(`${req.params.id}`);
	const responseData = userResponseSchema.parse(user);

	res.status(SUCCESS_STATUS_CODE).json(responseData);
}

export async function getMeController(req: RequestWithUser, res: Response) {
	const responseData = userResponseSchema.parse(req.user);
	res.status(SUCCESS_STATUS_CODE).json(responseData);
}
