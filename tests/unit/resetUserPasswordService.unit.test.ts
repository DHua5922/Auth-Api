import type { Mock } from "vitest";
import {
	BAD_REQUEST_STATUS_CODE,
	EMPTY_PASSWORD_ERROR_MESSAGE,
	NO_MATCHING_PASSWORDS_ERROR_MESSAGE,
} from "../../constants.ts";
import { updateUserPasswordByIdDal } from "../../dal/user.ts";
import { resetUserPasswordService } from "../../services/user.ts";
import { bcrypt } from "../../utilities/security.ts";

vi.mock("../../dal/user.ts", () => ({
	updateUserPasswordByIdDal: vi.fn(),
}));

vi.mock("../../utilities/security.ts", () => ({
	bcrypt: {
		hashPassword: vi.fn(),
	},
}));

test("should throw an error when password is empty", async () => {
	const value = resetUserPasswordService("507f1f77bcf86cd799439011", {
		password: "   ",
		confirmPassword: "   ",
	});

	await expect(value).rejects.toMatchObject({
		message: EMPTY_PASSWORD_ERROR_MESSAGE,
		status: BAD_REQUEST_STATUS_CODE,
	});
	expect(updateUserPasswordByIdDal).not.toHaveBeenCalled();
});

test("should throw an error when passwords do not match", async () => {
	const value = resetUserPasswordService("507f1f77bcf86cd799439011", {
		password: "password123",
		confirmPassword: "password124",
	});

	await expect(value).rejects.toMatchObject({
		message: NO_MATCHING_PASSWORDS_ERROR_MESSAGE,
		status: BAD_REQUEST_STATUS_CODE,
	});
	expect(updateUserPasswordByIdDal).not.toHaveBeenCalled();
});

test("should hash and update the user's password", async () => {
	const hashedPassword = "hashedPassword";
	const updatedUser = { _id: "507f1f77bcf86cd799439011" };
	const exec = vi.fn().mockResolvedValue(updatedUser);
	const populate = vi.fn().mockReturnValue({ exec });

	(bcrypt.hashPassword as Mock).mockResolvedValueOnce(hashedPassword);
	(updateUserPasswordByIdDal as Mock).mockReturnValueOnce({ populate });

	await expect(
		resetUserPasswordService("507f1f77bcf86cd799439011", {
			password: "password123",
			confirmPassword: "password123",
		}),
	).resolves.toEqual(updatedUser);
	expect(bcrypt.hashPassword).toHaveBeenCalledWith("password123", 10);
	expect(updateUserPasswordByIdDal).toHaveBeenCalledWith(
		"507f1f77bcf86cd799439011",
		hashedPassword,
	);
	expect(populate).toHaveBeenCalledWith("role");
	expect(exec).toHaveBeenCalledOnce();
});
