import type { NextFunction, Request, Response } from "express";
import { ApiError, buildApiRequestString, DefaultError } from "js-ts-kit";
import type { TokenExpiredError } from "jsonwebtoken";
import { z } from "zod";
import {
	BAD_REQUEST_STATUS_CODE,
	INTERNAL_SERVER_ERROR_STATUS_CODE,
	UNAUTHORIZED_STATUS_CODE,
} from "../constants.ts";
import type { RequestWithRequestId } from "../types/request.ts";

interface Console {
	(...data: unknown[]): void;
	(message?: unknown, ...optionalParams: unknown[]): void;
	(...data: unknown[]): void;
	(message?: unknown, ...optionalParams: unknown[]): void;
	(arg0: string): void;
}

export function loggingMiddleware(
	req: Request,
	_res: Response,
	next: NextFunction,
) {
	logRequest(console.log, req, "OUR BACKEND ENDPOINT REQUEST:\n\n");
	next();
}

export function errorLoggingMiddleware(
	func: (req: Request, res: Response, next: NextFunction) => unknown,
) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			return await func(req, res, next);
		} catch (err: unknown) {
			console.error(`[requestId=${getRequestId(req)}]`, err);

			logRequest(console.error, req, "OUR BACKEND ENDPOINT REQUEST ERROR:\n\n");

			const error = parseError(err);
			res.status(error.status).send(error.message);
		}
	};
}

function logRequest(console: Console, req: Request, label: string) {
	const httpProtocol = req.headers["x-forwarded-proto"] || req.protocol;
	const fullUrl = `${httpProtocol}://${req.get("host")}${req.originalUrl}`;

	const headers = Object.fromEntries(
		Object.entries(req.headers).map(([key, value]) => [key, String(value)]),
	);

	const body =
		req.body && Object.keys(req.body).length > 0
			? JSON.stringify(req.body)
			: "";

	console(
		`${label}Request ID: ${getRequestId(req)}\n${buildApiRequestString(req.method, fullUrl, headers, body)}`,
	);
}

function getRequestId(req: Request) {
	return (req as RequestWithRequestId).requestId;
}

export function parseError(err: unknown) {
	if ((err as ApiError).status && (err as ApiError).message) {
		const apiError = err as ApiError;
		return new ApiError(apiError.message, apiError.status);
	}

	if (err instanceof z.ZodError) {
		return new ApiError(
			err.issues[0]?.message || "Invalid input",
			BAD_REQUEST_STATUS_CODE,
		);
	}

	if ((err as TokenExpiredError).name === "TokenExpiredError") {
		return new ApiError(
			(err as TokenExpiredError).message,
			UNAUTHORIZED_STATUS_CODE,
		);
	}

	return new ApiError(
		DefaultError.message(err),
		INTERNAL_SERVER_ERROR_STATUS_CODE,
	);
}
