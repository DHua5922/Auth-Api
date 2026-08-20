import { Types } from "mongoose";
import request from "supertest";
import type { Mock } from "vitest";
import { SUCCESS_STATUS_CODE } from "../../constants.ts";
import app from "../../index.ts";
import { loginService, refreshTokensService } from "../../services/auth.ts";
import {
	createNewUserService,
	deleteUserByIdService,
	getUserByIdService,
} from "../../services/user.ts";
import { jwtToken } from "../../utilities/token.ts";

vi.mock("../../services/auth.ts", () => ({
	loginService: vi.fn(),
	refreshTokensService: vi.fn(),
}));

vi.mock("../../services/user.ts", () => ({
	createNewUserService: vi.fn(),
	deleteUserByIdService: vi.fn(),
	getUserByIdService: vi.fn(),
}));

const userId = "507f1f77bcf86cd799439011";
const roleId = new Types.ObjectId("507f1f77bcf86cd799439012");
const password = "password123";
const user = {
	_id: userId,
	username: "testuser",
	email: "testuser@example.com",
	role: {
		_id: roleId,
		name: "user",
		description: "Standard user",
	},
	dateCreated: new Date("2026-01-01T00:00:00.000Z"),
	systemManaged: false,
};
const expectedUserResponse = {
	...user,
	role: roleId.toHexString(),
	dateCreated: user.dateCreated.toISOString(),
};

test("POST /register should register a user", async () => {
	(createNewUserService as Mock).mockResolvedValueOnce(user);

	const response = await request(app).post("/api/v1/auth/register").send({
		username: user.username,
		email: user.email,
		password,
		confirmPassword: password,
	});

	expect(response.status).toBe(201);
	expect(response.body).toEqual(expectedUserResponse);
	expect(createNewUserService).toHaveBeenCalledWith({
		username: user.username,
		email: user.email,
		password,
		confirmPassword: password,
	});
});

test("POST /login should return a user and token pair", async () => {
	(loginService as Mock).mockResolvedValueOnce({
		user,
		accessToken: "accessToken",
		refreshToken: "refreshToken",
	});

	const response = await request(app).post("/api/v1/auth/login").send({
		email: user.email,
		password,
	});

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.body).toEqual({
		user: expectedUserResponse,
		accessToken: "accessToken",
		refreshToken: "refreshToken",
	});
	expect(loginService).toHaveBeenCalledWith(user.email, password);
});

test("POST /secure should return the authenticated user", async () => {
	const accessToken = jwtToken.create({
		userId,
		type: "access",
		expiresIn: "1m",
	});
	(getUserByIdService as Mock).mockResolvedValueOnce(user);

	const response = await request(app)
		.post("/api/v1/auth/secure")
		.set("Authorization", `Bearer ${accessToken}`);

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.body).toEqual(expectedUserResponse);
	expect(getUserByIdService).toHaveBeenCalledWith(userId);
});

test("DELETE /close-account/:id should close the account", async () => {
	const accessToken = jwtToken.create({
		userId,
		type: "access",
		expiresIn: "1m",
	});
	(getUserByIdService as Mock).mockResolvedValueOnce(user);
	(deleteUserByIdService as Mock).mockResolvedValueOnce(user);

	const response = await request(app)
		.delete(`/api/v1/auth/close-account/${userId}`)
		.set("Authorization", `Bearer ${accessToken}`);

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.body).toEqual(expectedUserResponse);
	expect(deleteUserByIdService).toHaveBeenCalledWith(userId);
});

test("POST /tokens/new should return a new token pair", async () => {
	const oldRefreshToken = "oldRefreshToken";
	(refreshTokensService as Mock).mockResolvedValueOnce({
		accessToken: "newAccessToken",
		refreshToken: "newRefreshToken",
	});

	const response = await request(app)
		.post("/api/v1/auth/tokens/new")
		.send({ refreshToken: oldRefreshToken });

	expect(response.status).toBe(SUCCESS_STATUS_CODE);
	expect(response.body).toEqual({
		accessToken: "newAccessToken",
		refreshToken: "newRefreshToken",
	});
	expect(refreshTokensService).toHaveBeenCalledWith(oldRefreshToken);
});
