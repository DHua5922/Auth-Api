import type { Request, Response } from "express";
import { SUCCESS_STATUS_CODE } from "../constants.ts";
import {
	accessTokenByEmailResponseSchema,
	loginResponseSchema,
	refreshTokensResponseSchema,
} from "../schemas/auth.ts";
import { userResponseSchema } from "../schemas/user.ts";
import {
	getUserAccessTokenByEmailService,
	loginService,
	refreshTokensService,
	registerService,
} from "../services/auth.ts";
import { resetUserPasswordService } from "../services/user.ts";
import type { RequestWithUser } from "../types/request.ts";

export async function loginController(req: Request, res: Response) {
	const { email, password } = req.body as {
		email: string;
		password: string;
	};
	const loginData = await loginService(email, password);
	const responseData = loginResponseSchema.parse(loginData);

	res.status(SUCCESS_STATUS_CODE).json(responseData);
}

export async function registerNewUserController(req: Request, res: Response) {
	const registrationData = await registerService(req.body);
	const responseData = loginResponseSchema.parse(registrationData);

	res.status(201).json(responseData);
}

export async function getAccessTokenByEmailController(
	req: Request,
	res: Response,
) {
	const { email } = req.body as { email: string };
	const responseData = accessTokenByEmailResponseSchema.parse(
		await getUserAccessTokenByEmailService(email),
	);

	res.status(SUCCESS_STATUS_CODE).json(responseData);
}

export async function refreshTokensController(req: Request, res: Response) {
	const { refreshToken } = req.body as { refreshToken: string };
	const newTokens = await refreshTokensService(refreshToken);
	const responseData = refreshTokensResponseSchema.parse(newTokens);

	res.status(SUCCESS_STATUS_CODE).json(responseData);
}

export async function resetPasswordController(
	req: RequestWithUser,
	res: Response,
) {
	const updatedUser = await resetUserPasswordService(req.user._id, req.body);
	const responseData = userResponseSchema.parse(updatedUser);

	res.status(SUCCESS_STATUS_CODE).json(responseData);
}
