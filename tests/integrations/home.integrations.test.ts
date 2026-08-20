import request from "supertest";
import { SUCCESS_STATUS_CODE } from "../../constants.ts";
import app from "../../index.ts";

test("should give message", async () => {
	const response = await request(app).get("/");

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.text).toEqual("This is working!");
	expect(response.headers["x-request-id"]).toMatch(
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
	);
});
