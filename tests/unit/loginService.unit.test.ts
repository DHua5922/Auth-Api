import { Types } from "mongoose";
import type { Mock } from "vitest";
import {
	BAD_REQUEST_STATUS_CODE,
	INVALID_LOGIN_CREDENTIALS_ERROR_MESSAGE,
} from "../../constants.ts";
import { loginService } from "../../services/auth.ts";
import { getUserByEmailService } from "../../services/user.ts";
import { bcrypt } from "../../utilities/security.ts";
import { jwtToken } from "../../utilities/token.ts";

vi.mock("../../services/user.ts", () => ({
	getUserByEmailService: vi.fn(),
}));

vi.mock("../../utilities/security.ts", () => ({
	bcrypt: {
		isMatchingPassword: vi.fn(),
	},
}));

vi.mock("../../utilities/token.ts", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("../../utilities/token.ts")>();

	return {
		...actual,
		jwtToken: {
			create: vi.fn(),
		},
	};
});

const testUser = {
	_id: "507f1f77bcf86cd799439011",
	username: "testuser",
	email: "testUser@example.com",
	role: {
		_id: new Types.ObjectId("507f1f77bcf86cd799439012"),
		name: "admin",
		description: "Administrator role",
	},
	password: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQ8Z/5a6m0j0Z5F5F5F5G",
	dateCreated: new Date(),
};

test("should throw error message when email is not found", async () => {
	const getUserByEmailServiceMock = getUserByEmailService as Mock;

	getUserByEmailServiceMock.mockResolvedValueOnce(null);

	const value = loginService("nonexistent@example.com", "anyPassword");
	await expect(value).rejects.toMatchObject({
		message: INVALID_LOGIN_CREDENTIALS_ERROR_MESSAGE,
		status: BAD_REQUEST_STATUS_CODE,
	});
});

test("should throw error message when password is wrong", async () => {
	const getUserByEmailServiceMock = getUserByEmailService as Mock;
	const bcryptMock = bcrypt.isMatchingPassword as Mock;

	getUserByEmailServiceMock.mockResolvedValueOnce(testUser);
	bcryptMock.mockResolvedValueOnce(false);

	const value = loginService(testUser.email, "wrongPassword");
	await expect(value).rejects.toMatchObject({
		message: INVALID_LOGIN_CREDENTIALS_ERROR_MESSAGE,
		status: BAD_REQUEST_STATUS_CODE,
	});
});

test("should return user and token information when login is successful", async () => {
	const getUserByEmailServiceMock = getUserByEmailService as Mock;
	const isMatchingPasswordMock = bcrypt.isMatchingPassword as Mock;
	const createJwtTokenMock = jwtToken.create as Mock;

	getUserByEmailServiceMock.mockResolvedValueOnce(testUser);
	isMatchingPasswordMock.mockResolvedValueOnce(true);
	createJwtTokenMock
		.mockReturnValueOnce("accessToken")
		.mockReturnValueOnce("refreshToken");

	const { password, ...userWithoutPassword } = testUser;
	const value = await loginService(
		userWithoutPassword.email,
		"correctPassword",
	);
	const expectedResult = {
		user: {
			...userWithoutPassword,
			role: userWithoutPassword.role._id.toHexString(),
		},
		accessToken: "accessToken",
		refreshToken: "refreshToken",
	};

	expect(value).toEqual(expectedResult);
});
