import Role from "../models/Role.ts";

export function getRoleDal(query: { name: string }) {
	return Role.findOne(query);
}
