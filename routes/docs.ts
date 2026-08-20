import express from "express";
import {
	getApiDocsController,
	getOpenApiDocumentController,
} from "../controllers/docs.ts";

const router = express.Router();

router.get("/openapi.json", getOpenApiDocumentController);
router.get("/docs", getApiDocsController);

export default router;
