import { ApiError } from "js-ts-kit";
import { TokenExpiredError } from "jsonwebtoken";
import { z } from "zod";
import {
	BAD_REQUEST_STATUS_CODE,
	EMPTY_PASSWORD_ERROR_MESSAGE,
	INTERNAL_SERVER_ERROR_STATUS_CODE,
	UNAUTHORIZED_STATUS_CODE,
} from "../../constants.ts";
import { parseError } from "../../middleware/logging.ts";

test("should return default error message", () => {
	const errorMessage = "Default error message";
	const error = new Error(errorMessage);
	const value = parseError(error);

	expect(value.status).toEqual(INTERNAL_SERVER_ERROR_STATUS_CODE);
	expect(value.message).toEqual(errorMessage);
});

test("should return API error message", () => {
	const errorMessage = "API error message";
	const apiError = new ApiError(errorMessage, BAD_REQUEST_STATUS_CODE);
	const value = parseError(apiError);

	expect(value.status).toEqual(BAD_REQUEST_STATUS_CODE);
	expect(value.message).toEqual(errorMessage);
});

test("should return token expired error message", () => {
	const errorMessage = "Token expired error message";
	const tokenExpiredError = new TokenExpiredError(errorMessage, new Date());
	const value = parseError(tokenExpiredError);

	expect(value.status).toEqual(UNAUTHORIZED_STATUS_CODE);
	expect(value.message).toEqual(errorMessage);
});

test("should convert Zod error to bad request error", () => {
	const schema = z.string().min(1, EMPTY_PASSWORD_ERROR_MESSAGE);
	const result = schema.safeParse("");

	if (result.success) {
		throw new Error("Expected validation to fail");
	}

	const value = parseError(result.error);

	expect(value.status).toBe(BAD_REQUEST_STATUS_CODE);
	expect(value.message).toBe(EMPTY_PASSWORD_ERROR_MESSAGE);
});
