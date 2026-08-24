import { z } from "zod";
import {
  closeAccountController,
  getAccessTokenByEmailController,
  getMeController,
  loginController,
  refreshTokensController,
  registerNewUserController,
  resetPasswordController,
} from "../controllers/auth.ts";
import { secureMiddleware } from "../middleware/auth.ts";
import {
  errorLoggingMiddleware,
  loggingMiddleware,
} from "../middleware/logging.ts";
import {
  accessTokenByEmailRequestBodySchema,
  accessTokenByEmailResponseSchema,
  loginRequestBodySchema,
  loginResponseSchema,
  refreshTokensResponseSchema,
  registerUserServiceInputSchema,
  resetPasswordServiceInputSchema,
} from "../schemas/auth.ts";
import { objectIdStringSchema } from "../schemas/mongodb.ts";
import { userResponseSchema } from "../schemas/user.ts";
import { createDocumentedRoute } from "../utilities/docs.ts";

const { router, route } = createDocumentedRoute("/api/v1/auth");

const tags = ["Authentication"];
const userResponseConfig = {
  "200": {
    content: {
      "application/json": {
        schema: userResponseSchema,
      },
    },
  },
};

route(
  {
    path: "/login",
    method: "post",
    tags,
    summary: "Log in",
    description:
      "Authenticate a user and returns user information. The password is not included in the response.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: loginRequestBodySchema,
          },
        },
        required: true,
      },
    },
    responses: {
      "200": {
        content: {
          "application/json": {
            schema: loginResponseSchema,
          },
        },
      },
    },
  },
  loggingMiddleware,
  errorLoggingMiddleware(loginController),
);

route(
  {
    path: "/register",
    method: "post",
    tags,
    summary: "Register user",
    description:
      "Register a new user and return user information with access and refresh tokens.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: registerUserServiceInputSchema,
          },
        },
        required: true,
      },
    },
    responses: {
      "201": {
        content: {
          "application/json": {
            schema: loginResponseSchema,
          },
        },
      },
    },
  },
  loggingMiddleware,
  errorLoggingMiddleware(registerNewUserController),
);

route(
  {
    path: "/access-token-by-email",
    method: "post",
    tags,
    summary: "Get access token by email",
    description: "Return an access token for the provided email address.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: accessTokenByEmailRequestBodySchema,
          },
        },
        required: true,
      },
    },
    responses: {
      "200": {
        content: {
          "application/json": {
            schema: accessTokenByEmailResponseSchema,
          },
        },
      },
    },
  },
  loggingMiddleware,
  errorLoggingMiddleware(getAccessTokenByEmailController),
);

route(
  {
    path: "/me",
    method: "get",
    tags,
    summary: "Get current user",
    description: "Return the authenticated user from the bearer access token.",
    responses: userResponseConfig,
  },
  loggingMiddleware,
  errorLoggingMiddleware(secureMiddleware),
  errorLoggingMiddleware(getMeController),
);

route(
  {
    path: "/close-account/{id}",
    method: "delete",
    tags,
    summary: "Close user account",
    description:
      "Deletes the user account and returns user information. The password is not included in the response.",
    request: {
      params: z.object({
        id: objectIdStringSchema.meta({
          description: "The ID of the user to delete",
        }),
      }),
    },
    responses: userResponseConfig,
  },
  loggingMiddleware,
  errorLoggingMiddleware(secureMiddleware),
  errorLoggingMiddleware(closeAccountController),
);

route(
  {
    path: "/reset-password",
    method: "post",
    tags,
    summary: "Reset password",
    description:
      "Reset the authenticated user's password using password and confirm password.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: resetPasswordServiceInputSchema,
          },
        },
        required: true,
      },
    },
    responses: userResponseConfig,
  },
  loggingMiddleware,
  errorLoggingMiddleware(secureMiddleware),
  errorLoggingMiddleware(resetPasswordController),
);

route(
  {
    path: "/tokens/new",
    method: "post",
    tags,
    summary: "Refresh tokens",
    description:
      "Get new access token and refresh token using the given refresh token.",
    responses: {
      "200": {
        content: {
          "application/json": {
            schema: refreshTokensResponseSchema,
          },
        },
      },
    },
  },
  loggingMiddleware,
  errorLoggingMiddleware(refreshTokensController),
);

export default router;
