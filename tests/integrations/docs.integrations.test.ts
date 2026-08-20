import request from "supertest";
import { SUCCESS_STATUS_CODE } from "../../constants.ts";
import app from "../../index.ts";

test("should give OpenAPI document", async () => {
	const response = await request(app).get("/openapi.json");

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.type).toBe("application/json");
	expect(response.body.openapi).toBe("3.0.0");
});

test("should document the close account ID path parameter", async () => {
	const response = await request(app).get("/openapi.json");
	const closeAccountOperation =
		response.body.paths["/api/v1/auth/close-account/{id}"].delete;

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(closeAccountOperation.parameters).toContainEqual(
		expect.objectContaining({
			in: "path",
			name: "id",
			required: true,
			description: "The ID of the user to delete",
			schema: expect.objectContaining({
				type: "string",
				pattern: "^[a-f\\d]{24}$/i",
			}),
		}),
	);
});

test("should give API documentation", async () => {
	const response = await request(app).get("/docs");

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.type).toBe("text/html");
	expect(response.text).toContain('url: "/openapi.json"');
	expect(response.text).toContain("swagger-ui-bundle.js");
});
