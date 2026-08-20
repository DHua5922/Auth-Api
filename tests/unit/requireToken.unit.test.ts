import {
	UNAUTHORIZED_ERROR_MESSAGE,
	UNAUTHORIZED_STATUS_CODE,
} from "../../constants.ts";
import { requireToken } from "../../utilities/token.ts";

test("should throw an error if the token is missing", () => {
	try {
		requireToken("");
	} catch (error) {
		expect(error).toMatchObject({
			message: UNAUTHORIZED_ERROR_MESSAGE,
			status: UNAUTHORIZED_STATUS_CODE,
		});
	}
});

test("should not throw an error if the token exists", () => {
	expect(() => requireToken("validToken")).not.toThrow();
});
