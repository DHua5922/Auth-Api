import { randomUUID } from "node:crypto";
import request from "supertest";
import { SUCCESS_STATUS_CODE } from "../../constants.ts";
import app from "../../index.ts";

const uniqueId = randomUUID();
const password = "password123";
const userCredentials = {
	username: `integration-${uniqueId}`,
	email: `integration-${uniqueId}@example.com`,
	password,
	confirmPassword: password,
};
const expectedUserResponse = {
	_id: expect.any(String),
	username: userCredentials.username,
	email: userCredentials.email,
	role: expect.any(String),
	dateCreated: expect.any(String),
	systemManaged: false,
};

let userId: string;
let accessToken: string;
let refreshToken: string;
const newPassword = "newPassword123";

beforeAll(async () => {
	const response = await request(app)
		.post("/api/v1/auth/register")
		.send(userCredentials);

	expect(response.status).toBe(201);
	expect(response.body).toEqual({
		user: expectedUserResponse,
		accessToken: expect.any(String),
		refreshToken: expect.any(String),
		accessTokenExpireTime: expect.any(String),
		refreshTokenExpireTime: expect.any(String),
	});

	userId = response.body.user._id;
	accessToken = response.body.accessToken;
	refreshToken = response.body.refreshToken;
});

afterAll(async () => {
	const response = await request(app)
		.delete(`/api/v1/auth/close-account/${userId}`)
		.set("Authorization", `Bearer ${accessToken}`);

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.body).toEqual(expectedUserResponse);
});

test("POST /login should return a user and token pair", async () => {
	const response = await request(app).post("/api/v1/auth/login").send({
		email: userCredentials.email,
		password,
	});

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.body).toEqual({
		user: expectedUserResponse,
		accessToken: expect.any(String),
		refreshToken: expect.any(String),
		accessTokenExpireTime: expect.any(String),
		refreshTokenExpireTime: expect.any(String),
	});

	accessToken = response.body.accessToken;
	refreshToken = response.body.refreshToken;
});

test("GET /me should return the authenticated user", async () => {
	const response = await request(app)
		.get("/api/v1/auth/me")
		.set("Authorization", `Bearer ${accessToken}`);

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.body).toEqual(expectedUserResponse);
});

test("POST /access-token-by-email should return an access token", async () => {
	const response = await request(app)
		.post("/api/v1/auth/access-token-by-email")
		.send({ email: userCredentials.email });

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.body).toEqual({
		accessToken: expect.any(String),
		accessTokenExpireTime: expect.any(String),
	});
});

test("POST /reset-password should update password for authenticated user", async () => {
	const response = await request(app)
		.post("/api/v1/auth/reset-password")
		.set("Authorization", `Bearer ${accessToken}`)
		.send({
			password: newPassword,
			confirmPassword: newPassword,
		});

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.body).toEqual(expectedUserResponse);
});

test("POST /login should allow using the new password after reset", async () => {
	const response = await request(app).post("/api/v1/auth/login").send({
		email: userCredentials.email,
		password: newPassword,
	});

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.body).toEqual({
		user: expectedUserResponse,
		accessToken: expect.any(String),
		refreshToken: expect.any(String),
		accessTokenExpireTime: expect.any(String),
		refreshTokenExpireTime: expect.any(String),
	});

	accessToken = response.body.accessToken;
	refreshToken = response.body.refreshToken;
});

test("POST /tokens/new should return a new token pair", async () => {
	const response = await request(app)
		.post("/api/v1/auth/tokens/new")
		.send({ refreshToken });

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.body).toEqual({
		accessToken: expect.any(String),
		refreshToken: expect.any(String),
		accessTokenExpireTime: expect.any(String),
		refreshTokenExpireTime: expect.any(String),
	});

	accessToken = response.body.accessToken;
	refreshToken = response.body.refreshToken;
});
