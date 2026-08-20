import "dotenv/config";
import express, { type Express } from "express";
import { z } from "zod";
import mongoose from "./config/database.ts";
import { requestIdMiddleware } from "./middleware/requestId.ts";
import authRouter from "./routes/auth.ts";
import docsRouter from "./routes/docs.ts";
import homeRouter from "./routes/home.ts";

checkEnvVariables();
mongoose.connectToMongoDb();

const app: Express = express();
configureApp(app);

const shouldStartLocalServer =
	process.env.NODE_ENV !== "test" && process.env.VERCEL !== "1";

if (shouldStartLocalServer) {
	const port = process.env.PORT || 8080;
	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
}

export default app;

function checkEnvVariables() {
	const envSchema = z.object({
		MONGO_URI: z.string(),
		ACCESS_TOKEN_NAME: z.string(),
		ACCESS_TOKEN_EXPIRATION: z.string(),
		REFRESH_TOKEN_NAME: z.string(),
		REFRESH_TOKEN_EXPIRATION: z.string(),
		JWT_SECRET: z.string(),
	});

	const envValidation = envSchema.safeParse(process.env);
	if (!envValidation.success) {
		console.error(
			"INVALID ENVIRONMENT VARIABLES:\n",
			z.treeifyError(envValidation.error),
		);
		process.exit(1);
	}
}

function configureApp(app: Express) {
	app.use(requestIdMiddleware);
	app.use(express.json());
	app.use(homeRouter);
	app.use(authRouter);
	app.use(docsRouter);
}
