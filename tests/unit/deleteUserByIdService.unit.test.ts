import type { Mock } from "vitest";
import { deleteUserByIdDal, getUserDal } from "../../dal/user.ts";
import { deleteUserByIdService } from "../../services/user.ts";

vi.mock("../../dal/user.ts", () => ({
	deleteUserByIdDal: vi.fn(),
	getUserDal: vi.fn(),
}));

test("should not delete a system-managed user", async () => {
	const exec = vi.fn().mockResolvedValue({ systemManaged: true });
	(getUserDal as Mock).mockReturnValue({ exec });

	const value = deleteUserByIdService("507f1f77bcf86cd799439011");
	await expect(value).rejects.toMatchObject({
		message: "System-managed users cannot be deleted",
		status: 403,
	});
	expect(deleteUserByIdDal).not.toHaveBeenCalled();
});
