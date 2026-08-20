import type { Request, Response } from "express";
import {
	generateApiDocsHtml,
	generateOpenApiDocument,
} from "../utilities/docs.ts";

export function getOpenApiDocumentController(_req: Request, res: Response) {
	res.json(generateOpenApiDocument());
}

export function getApiDocsController(_req: Request, res: Response) {
	res.type("html").send(generateApiDocsHtml());
}
