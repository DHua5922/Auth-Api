import {
	OpenAPIRegistry,
	OpenApiGeneratorV3,
	type RouteConfig,
} from "@asteasolutions/zod-to-openapi";
import express, { type RequestHandler } from "express";

const registry = new OpenAPIRegistry();

export function generateOpenApiDocument() {
	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			title: "My API",
			version: "1.0.0",
			description: "This is my API documentation",
		},
		servers: [
			{
				url: "/",
			},
		],
	});
}

export function generateApiDocsHtml() {
	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>SSO Users Admin Panel API</title>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.32.12/swagger-ui.css" />
	</head>
	<body>
		<div id="swagger-ui"></div>
		<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.32.12/swagger-ui-bundle.js"></script>
		<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.32.12/swagger-ui-standalone-preset.js"></script>
		<script>
			window.onload = () => {
				window.ui = SwaggerUIBundle({
					url: "/openapi.json",
					dom_id: "#swagger-ui",
					deepLinking: true,
					withCredentials: true,
					presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
					layout: "StandaloneLayout",
				});
			};
		</script>
	</body>
</html>`;
}

export function createDocumentedRoute(basePath = "") {
	const router = express.Router();

	const route = (routeConfig: RouteConfig, ...handlers: RequestHandler[]) => {
		const fullUrl = `${basePath}${routeConfig.path}`;
		const expressPath = fullUrl.replace(/\{([^}]+)\}/g, ":$1");
		const method = routeConfig.method.toLowerCase() as keyof typeof router;
		const routerFn = router[method] as (
			path: string,
			...handlers: RequestHandler[]
		) => void;

		registry.registerPath({
			...routeConfig,
			path: fullUrl,
		});
		routerFn.call(router, expressPath, ...handlers);
	};

	return { router, route };
}
