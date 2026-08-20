import { Types } from "mongoose";
import type { Mock } from "vitest";
import {
	BAD_REQUEST_STATUS_CODE,
	NO_MATCHING_PASSWORDS_ERROR_MESSAGE,
} from "../../constants.ts";
import { getUserDal, upsertUserDal } from "../../dal/user.ts";
import { createNewUserService } from "../../services/user.ts";
import { bcrypt } from "../../utilities/security.ts";

vi.mock("../../dal/user.ts", () => ({
	getUserDal: vi.fn(),
	upsertUserDal: vi.fn(),
}));

vi.mock("../../utilities/security.ts", () => ({
	bcrypt: {
		hashPassword: vi.fn(),
	},
}));

const registrationInput = {
	username: "testuser",
	email: "testuser@example.com",
	role: new Types.ObjectId().toHexString(),
	password: "password123",
	confirmPassword: "password123",
};

test("should throw an error when passwords do not match", async () => {
	const value = createNewUserService({
		...registrationInput,
		confirmPassword: "differentPassword",
	});

	await expect(value).rejects.toMatchObject({
		message: NO_MATCHING_PASSWORDS_ERROR_MESSAGE,
		status: BAD_REQUEST_STATUS_CODE,
	});
	expect(getUserDal).not.toHaveBeenCalled();
	expect(upsertUserDal).not.toHaveBeenCalled();
});

test("should throw an error when email already exists", async () => {
	const existingUser = { _id: new Types.ObjectId() };
	mockEmailLookup(existingUser);

	const value = createNewUserService(registrationInput);

	await expect(value).rejects.toMatchObject({
		message: `User with email ${registrationInput.email} already exists`,
		status: BAD_REQUEST_STATUS_CODE,
	});
	expect(getUserDal).toHaveBeenCalledWith({
		email: registrationInput.email,
	});
	expect(upsertUserDal).not.toHaveBeenCalled();
});

test("should throw an error when username already exists", async () => {
	const existingUser = { _id: new Types.ObjectId() };
	mockEmailLookup(null);
	(getUserDal as Mock).mockResolvedValueOnce(existingUser);

	const value = createNewUserService(registrationInput);

	await expect(value).rejects.toMatchObject({
		message: `User with username ${registrationInput.username} already exists`,
		status: BAD_REQUEST_STATUS_CODE,
	});
	expect(getUserDal).toHaveBeenLastCalledWith({
		username: registrationInput.username,
	});
	expect(upsertUserDal).not.toHaveBeenCalled();
});

test("should hash the password and create a new user", async () => {
	const hashedPassword = "hashedPassword";
	const createdUser = {
		_id: new Types.ObjectId(),
		username: registrationInput.username,
		email: registrationInput.email,
		password: hashedPassword,
	};
	const exec = vi.fn().mockResolvedValue(createdUser);
	const populate = vi.fn().mockReturnValue({ exec });

	mockEmailLookup(null);
	(getUserDal as Mock).mockResolvedValueOnce(null);
	(bcrypt.hashPassword as Mock).mockResolvedValueOnce(hashedPassword);
	(upsertUserDal as Mock).mockReturnValue({ populate });

	await expect(createNewUserService(registrationInput)).resolves.toEqual(
		createdUser,
	);
	expect(bcrypt.hashPassword).toHaveBeenCalledWith(
		registrationInput.password,
		10,
	);
	expect(upsertUserDal).toHaveBeenCalledWith(expect.any(Types.ObjectId), {
		username: registrationInput.username,
		email: registrationInput.email,
		role: registrationInput.role,
		password: hashedPassword,
	});
	expect(populate).toHaveBeenCalledWith("role");
	expect(exec).toHaveBeenCalledOnce();
});

function mockEmailLookup(value: unknown) {
	const exec = vi.fn().mockResolvedValue(value);
	const populate = vi.fn().mockReturnValue({ exec });
	(getUserDal as Mock).mockReturnValueOnce({ populate });
}
