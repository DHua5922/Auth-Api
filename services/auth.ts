import { ApiError } from "js-ts-kit";
import {
	BAD_REQUEST_STATUS_CODE,
	INVALID_LOGIN_CREDENTIALS_ERROR_MESSAGE,
} from "../constants.ts";
import { userResponseSchema } from "../schemas/user.ts";
import { bcrypt } from "../utilities/security.ts";
import {
	jwtToken,
	requireRefreshTokenType,
	requireToken,
} from "../utilities/token.ts";
import { getUserByEmailService } from "./user.ts";

export async function loginService(email: string, passwordInput: string) {
	const user = await getUserByEmailService(email);
	if (!user) {
		throw new ApiError(
			INVALID_LOGIN_CREDENTIALS_ERROR_MESSAGE,
			BAD_REQUEST_STATUS_CODE,
		);
	}

	const isMatchingPassword = await bcrypt.isMatchingPassword(
		user.password,
		passwordInput,
	);
	if (!isMatchingPassword) {
		throw new ApiError(
			INVALID_LOGIN_CREDENTIALS_ERROR_MESSAGE,
			BAD_REQUEST_STATUS_CODE,
		);
	}

	return {
		user: userResponseSchema.parse(user),
		...createTokens(user._id),
	};
}

export async function refreshTokensService(refreshToken: string) {
	requireToken(refreshToken);

	const tokenPayload = jwtToken.decode(refreshToken);
	requireRefreshTokenType(tokenPayload?.type);

	return createTokens(tokenPayload.userId);
}

function createTokens(userId: string) {
	const accessTokenExpireTime = process.env.ACCESS_TOKEN_EXPIRATION || "15m";
	const refreshTokenExpireTime = process.env.REFRESH_TOKEN_EXPIRATION || "7d";

	return {
		accessToken: jwtToken.create({
			userId,
			type: "access",
			expiresIn: accessTokenExpireTime,
		}),
		refreshToken: jwtToken.create({
			userId,
			type: "refresh",
			expiresIn: refreshTokenExpireTime,
		}),
	};
}
