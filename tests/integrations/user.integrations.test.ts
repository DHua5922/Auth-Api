import { randomUUID } from "node:crypto";
import request from "supertest";
import { SUCCESS_STATUS_CODE } from "../../constants.ts";
import app from "../../index.ts";

const uniqueId = randomUUID();
const password = "password123";
const registrationInput = {
	username: `profile-${uniqueId}`,
	email: `profile-${uniqueId}@example.com`,
	password,
	confirmPassword: password,
};

let userId: string;
let accessToken: string;

beforeAll(async () => {
	const registerResponse = await request(app)
		.post("/api/v1/auth/register")
		.send(registrationInput);

	expect(registerResponse.status).toBe(201);
	userId = registerResponse.body.user._id;
	accessToken = registerResponse.body.accessToken;
});

afterAll(async () => {
	const response = await request(app)
		.delete(`/api/v1/auth/close-account/${userId}`)
		.set("Authorization", `Bearer ${accessToken}`);

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
});

test("PUT /api/v1/users/{id} should update username and email", async () => {
	const updatedUsername = `updated-${uniqueId}`;
	const updatedEmail = `updated-${uniqueId}@example.com`;

	const response = await request(app)
		.put(`/api/v1/users/${userId}`)
		.set("Authorization", `Bearer ${accessToken}`)
		.send({
			username: updatedUsername,
			email: updatedEmail,
		});

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.body).toEqual({
		_id: userId,
		username: updatedUsername,
		email: updatedEmail,
		role: expect.any(String),
		dateCreated: expect.any(String),
		systemManaged: false,
	});
});
