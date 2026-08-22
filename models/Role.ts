import mongoose from "../config/database.ts";

const Role = mongoose.createModel("role", {
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

export default Role;
