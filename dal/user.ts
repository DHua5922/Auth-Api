import type { Types } from "mongoose";
import User from "../models/User.ts";

export function getUserDal(query: Partial<typeof User>) {
	return User.findOne(query);
}

export function upsertUserDal(
	_id: Types.ObjectId,
	userInput: {
		username: string;
		email: string;
		role: Types.ObjectId;
		password: string;
	},
) {
	return User.findByIdAndUpdate(_id, userInput, {
		upsert: true,
		new: true,
		setDefaultsOnInsert: true,
	});
}

export function deleteUserByIdDal(id: string) {
	return User.findOneAndDelete({
		_id: id,
		systemManaged: { $ne: true },
	});
}

export function updateUserPasswordByIdDal(id: string, password: string) {
	return User.findByIdAndUpdate(
		id,
		{ password },
		{
			new: true,
		},
	);
}

export function updateUserProfileByIdDal(
	id: string,
	profile: { username: string; email: string },
) {
	return User.findByIdAndUpdate(
		id,
		{
			username: profile.username,
			email: profile.email,
		},
		{
			new: true,
		},
	);
}
