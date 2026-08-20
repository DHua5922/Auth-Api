import { ApiError } from "js-ts-kit";
import { Types } from "mongoose";
import {
	BAD_REQUEST_STATUS_CODE,
	NO_MATCHING_PASSWORDS_ERROR_MESSAGE,
} from "../constants.ts";
import { deleteUserByIdDal, getUserDal, upsertUserDal } from "../dal/user.ts";
import type { RegisterUserServiceInput } from "../schemas/auth.ts";
import { bcrypt } from "../utilities/security.ts";

export async function getUserByIdService(_id: string) {
	return getUserDal({ _id }).populate("role").exec();
}

export async function getUserByEmailService(email: string) {
	return getUserDal({ email }).populate("role").exec();
}

export async function createNewUserService(
	registrationInput: RegisterUserServiceInput,
) {
	const { password, confirmPassword, ...userInput } = registrationInput;

	if (password !== confirmPassword) {
		throw new ApiError(
			NO_MATCHING_PASSWORDS_ERROR_MESSAGE,
			BAD_REQUEST_STATUS_CODE,
		);
	}

	const existingUserWithEmail = await getUserByEmailService(userInput.email);
	if (existingUserWithEmail) {
		throw new ApiError(
			`User with email ${userInput.email} already exists`,
			BAD_REQUEST_STATUS_CODE,
		);
	}

	const existingUserWithUsername = await getUserDal({
		username: userInput.username,
	});
	if (existingUserWithUsername) {
		throw new ApiError(
			`User with username ${userInput.username} already exists`,
			BAD_REQUEST_STATUS_CODE,
		);
	}

	const createdUser = await upsertUserDal(new Types.ObjectId(), {
		...userInput,
		password: await bcrypt.hashPassword(password, 10),
	})
		.populate("role")
		.exec();

	return createdUser;
}

export async function deleteUserByIdService(_id: string) {
	const user = await getUserDal({ _id }).exec();
	if (user.systemManaged) {
		throw new ApiError("System-managed users cannot be deleted", 403);
	}

	const deletedUser = await deleteUserByIdDal(_id).populate("role").exec();
	return deletedUser;
}
