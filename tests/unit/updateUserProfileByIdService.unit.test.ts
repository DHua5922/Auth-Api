import { Types } from "mongoose";
import type { Mock } from "vitest";
import { BAD_REQUEST_STATUS_CODE } from "../../constants.ts";
import { getUserDal, updateUserProfileByIdDal } from "../../dal/user.ts";
import { updateUserProfileByIdService } from "../../services/user.ts";

vi.mock("../../dal/user.ts", () => ({
	getUserDal: vi.fn(),
	updateUserProfileByIdDal: vi.fn(),
}));

const userId = "507f1f77bcf86cd799439011";
const updateInput = {
	username: "updateduser",
	email: "updated@example.com",
};

test("should throw when email already exists on another user", async () => {
	mockGetUserByQuery({ _id: new Types.ObjectId() });

	const value = updateUserProfileByIdService(userId, updateInput);

	await expect(value).rejects.toMatchObject({
		message: `User with email ${updateInput.email} already exists`,
		status: BAD_REQUEST_STATUS_CODE,
	});
	expect(updateUserProfileByIdDal).not.toHaveBeenCalled();
});

test("should throw when username already exists on another user", async () => {
	mockGetUserByQuery(null);
	mockGetUserByQuery({ _id: new Types.ObjectId() });

	const value = updateUserProfileByIdService(userId, updateInput);

	await expect(value).rejects.toMatchObject({
		message: `User with username ${updateInput.username} already exists`,
		status: BAD_REQUEST_STATUS_CODE,
	});
	expect(updateUserProfileByIdDal).not.toHaveBeenCalled();
});

test("should update profile when username and email are available", async () => {
	mockGetUserByQuery(null);
	mockGetUserByQuery(null);
	const updatedUser = {
		_id: userId,
		username: updateInput.username,
		email: updateInput.email,
	};
	const exec = vi.fn().mockResolvedValue(updatedUser);
	const populate = vi.fn().mockReturnValue({ exec });
	(updateUserProfileByIdDal as Mock).mockReturnValueOnce({ populate });

	await expect(
		updateUserProfileByIdService(userId, updateInput),
	).resolves.toEqual(updatedUser);
	expect(updateUserProfileByIdDal).toHaveBeenCalledWith(userId, updateInput);
	expect(populate).toHaveBeenCalledWith("role");
	expect(exec).toHaveBeenCalledOnce();
});

function mockGetUserByQuery(value: unknown) {
	const exec = vi.fn().mockResolvedValue(value);
	(getUserDal as Mock).mockReturnValueOnce({ exec });
}
