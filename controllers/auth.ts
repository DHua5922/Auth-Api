import type { Request, Response } from "express";
import { SUCCESS_STATUS_CODE } from "../constants.ts";
import {
	loginRequestBodySchema,
	loginResponseSchema,
	refreshTokensResponseSchema,
	registerUserServiceInputSchema,
} from "../schemas/auth.ts";
import { userResponseSchema } from "../schemas/user.ts";
import {
	loginService,
	refreshTokensService,
	registerService,
} from "../services/auth.ts";
import { deleteUserByIdService } from "../services/user.ts";
import type { RequestWithUser } from "../types/request.ts";

export async function loginController(req: Request, res: Response) {
	const { email, password } = loginRequestBodySchema.parse(req.body);
	const loginData = await loginService(email, password);
	const responseData = loginResponseSchema.parse(loginData);

	res.status(SUCCESS_STATUS_CODE).json(responseData);
}

export async function registerNewUserController(req: Request, res: Response) {
	const registrationInput = registerUserServiceInputSchema.parse(req.body);
	const registrationData = await registerService(registrationInput);
	const responseData = loginResponseSchema.parse(registrationData);

	res.status(201).json(responseData);
}

export async function closeAccountController(req: Request, res: Response) {
	const user = await deleteUserByIdService(`${req.params.id}`);
	const responseData = userResponseSchema.parse(user);

	res.status(SUCCESS_STATUS_CODE).json(responseData);
}

export async function secureController(req: RequestWithUser, res: Response) {
	const responseData = userResponseSchema.parse(req.user);
	res.status(SUCCESS_STATUS_CODE).json(responseData);
}

export async function refreshTokensController(req: Request, res: Response) {
	const newTokens = await refreshTokensService(req.body.refreshToken);
	const responseData = refreshTokensResponseSchema.parse(newTokens);

	res.status(SUCCESS_STATUS_CODE).json(responseData);
}
