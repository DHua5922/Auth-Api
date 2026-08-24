import type { Request, Response } from "express";
import { z } from "zod";
import { SUCCESS_STATUS_CODE } from "../constants.ts";
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
import {
	getUserAccessTokenByEmailService,
	loginService,
	refreshTokensService,
	registerService,
} from "../services/auth.ts";
import {
	deleteUserByIdService,
	resetUserPasswordService,
} from "../services/user.ts";
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

export async function getMeController(req: RequestWithUser, res: Response) {
	const responseData = userResponseSchema.parse(req.user);
	res.status(SUCCESS_STATUS_CODE).json(responseData);
}

export async function getAccessTokenByEmailController(
	req: Request,
	res: Response,
) {
	const { email } = accessTokenByEmailRequestBodySchema.parse(req.body);
	const responseData = accessTokenByEmailResponseSchema.parse(
		await getUserAccessTokenByEmailService(email),
	);

	res.status(SUCCESS_STATUS_CODE).json(responseData);
}

export async function refreshTokensController(req: Request, res: Response) {
	const refreshTokensRequestBodySchema = z.object({
		refreshToken: z.string().meta({
			type: "string",
			example:
				"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2Y0YjQ3ZDYyYjA0ZDAwMTQxYzE4ZjkiLCJ0eXBlIjoicmVmcmVzaCIsImV4cGlyZWRJbiI6IjdkIiwiaWF0IjoxNjg4NzQ3OTk5fQ.8n7v8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8lW8",
		}),
	});
	const { refreshToken } = refreshTokensRequestBodySchema.parse(req.body);
	const newTokens = await refreshTokensService(refreshToken);
	const responseData = refreshTokensResponseSchema.parse(newTokens);

	res.status(SUCCESS_STATUS_CODE).json(responseData);
}

export async function resetPasswordController(
	req: RequestWithUser,
	res: Response,
) {
	const resetPasswordInput = resetPasswordServiceInputSchema.parse(req.body);
	const updatedUser = await resetUserPasswordService(
		req.user._id,
		resetPasswordInput,
	);
	const responseData = userResponseSchema.parse(updatedUser);

	res.status(SUCCESS_STATUS_CODE).json(responseData);
}
