import type { NextFunction, Response } from "express";
import { ApiError } from "js-ts-kit";
import { UNAUTHORIZED_ERROR_MESSAGE } from "../constants.ts";
import { getUserByIdService } from "../services/user.ts";
import type { RequestWithUser } from "../types/request.ts";
import {
	jwtToken,
	requireAccessTokenType,
	requireToken,
} from "../utilities/token.ts";

export async function secureMiddleware(
	req: RequestWithUser,
	_res: Response,
	next: NextFunction,
) {
	const accessToken = req.headers.authorization?.split(" ")[1];

	requireToken(accessToken);

	const tokenPayload = jwtToken.decode(accessToken);
	requireAccessTokenType(tokenPayload.type);

	const user = await getUserByIdService(tokenPayload.userId);
	if (!user) {
		throw new ApiError(UNAUTHORIZED_ERROR_MESSAGE, 404);
	}

	req.user = user;
	next();
}
