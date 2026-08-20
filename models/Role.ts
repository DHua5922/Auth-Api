import mongoose from "../config/database.ts";

mongoose.createModel("role", {
	name: {
		type: String,
		required: true,
		unique: true,
	},
	description: {
		type: String,
		required: true,
	},
	systemManaged: {
		type: Boolean,
		default: false,
		immutable: true,
	},
});
