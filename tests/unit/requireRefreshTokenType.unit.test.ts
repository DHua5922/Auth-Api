import { UNAUTHORIZED_STATUS_CODE } from "../../constants.ts";
import { requireRefreshTokenType } from "../../utilities/token.ts";

test("should throw an error if the token type is not refresh", () => {
	try {
		requireRefreshTokenType("access");
	} catch (error) {
		expect(error).toMatchObject({
			message: "Invalid refresh token",
			status: UNAUTHORIZED_STATUS_CODE,
		});
	}
});

test("should not throw an error if the token type is refresh", () => {
	expect(() => requireRefreshTokenType("refresh")).not.toThrow();
});
