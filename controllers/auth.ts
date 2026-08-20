import type { Request, Response } from "express";
import { SUCCESS_STATUS_CODE } from "../constants.ts";
import {
	loginRequestBodySchema,
	loginResponseSchema,
	refreshTokensResponseSchema,
	registerUserServiceInputSchema,
} from "../schemas/auth.ts";
import { userResponseSchema } from "../schemas/user.ts";
import { loginService, refreshTokensService } from "../services/auth.ts";
import {
	createNewUserService,
	deleteUserByIdService,
} from "../services/user.ts";
import type { RequestWithUser } from "../types/request.ts";

export async function loginController(req: Request, res: Response) {
	const { email, password } = loginRequestBodySchema.parse(req.body);
	res
		.status(SUCCESS_STATUS_CODE)
		.json(loginResponseSchema.parse(await loginService(email, password)));
}

export async function registerNewUserController(req: Request, res: Response) {
	const registrationInput = registerUserServiceInputSchema.parse(req.body);
	const user = await createNewUserService(registrationInput);

	res.status(201).json(userResponseSchema.parse(user));
}

export async function closeAccountController(req: Request, res: Response) {
	const user = await deleteUserByIdService(`${req.params.id}`);
	res.status(SUCCESS_STATUS_CODE).json(userResponseSchema.parse(user));
}

export async function secureController(req: RequestWithUser, res: Response) {
	res.status(SUCCESS_STATUS_CODE).json(userResponseSchema.parse(req.user));
}

export async function refreshTokensController(req: Request, res: Response) {
	const newTokens = await refreshTokensService(req.body.refreshToken);

	res
		.status(SUCCESS_STATUS_CODE)
		.json(refreshTokensResponseSchema.parse(newTokens));
}
