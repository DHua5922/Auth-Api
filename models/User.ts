import { Schema } from "mongoose";
import mongoose from "../config/database.ts";
import "./Role.ts";

const User = mongoose.createModel("user", {
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	role: {
		type: Schema.Types.ObjectId,
		ref: "role",
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	dateCreated: {
		type: Date,
		default: Date.now,
	},
	systemManaged: {
		type: Boolean,
		default: false,
		immutable: true,
	},
});

export default User;
