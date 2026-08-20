import { z } from "zod";

export const objectIdStringSchema = z
	.string()
	.regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");
