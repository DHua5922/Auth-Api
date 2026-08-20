import type { Request } from "express";
import type User from "../models/User.ts";

export interface RequestWithUser extends Request {
	user?: typeof User;
}

export interface RequestWithRequestId extends Request {
	requestId: string;
}
