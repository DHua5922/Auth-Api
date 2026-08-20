import { ApiError, JwtToken } from "js-ts-kit";
import jsonwebtoken from "jsonwebtoken";
import {
	UNAUTHORIZED_ERROR_MESSAGE,
	UNAUTHORIZED_STATUS_CODE,
} from "../constants.ts";

export const jwtToken = new JwtToken(
	jsonwebtoken,
	process.env.JWT_SECRET || "",
);

export function requireToken(
	token: string | undefined,
): asserts token is string {
	if (!token) {
		throw new ApiError(UNAUTHORIZED_ERROR_MESSAGE, UNAUTHORIZED_STATUS_CODE);
	}
}

export function requireAccessTokenType(type: string) {
	if (type !== "access") {
		throw new ApiError("Invalid access token", UNAUTHORIZED_STATUS_CODE);
	}
}

export function requireRefreshTokenType(type: string) {
	if (type !== "refresh") {
		throw new ApiError("Invalid refresh token", UNAUTHORIZED_STATUS_CODE);
	}
}
