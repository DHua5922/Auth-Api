import type { Request, Response } from "express";
import { SUCCESS_STATUS_CODE } from "../constants.ts";

export function homeController(_req: Request, res: Response) {
	res.status(SUCCESS_STATUS_CODE).send("This is working!");
}
