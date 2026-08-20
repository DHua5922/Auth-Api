import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type { RequestWithRequestId } from "../types/request.ts";

export function requestIdMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const requestId = randomUUID();
	(req as RequestWithRequestId).requestId = requestId;
	res.setHeader("X-Request-ID", requestId);
	next();
}
