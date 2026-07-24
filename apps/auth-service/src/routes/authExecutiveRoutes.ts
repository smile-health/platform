import { createRoute, RouteConfig } from "@hono/zod-openapi";
import { ErrorResponseSchema, UserNameSchema } from "../schemas/sharedSchemas";
import {
  LoginRequestSchema,
  LoginResponseSchema,
  UserInfoResponseSchema,
} from "../schemas/authSchemas";
import { loginRateLimiter } from "../middlewares/rateLimiterMiddleware";

// Define the login route
export const loginRoute: RouteConfig = createRoute({
  method: "post",
  path: "/executive/login",
  summary: "Executive User Login",
  description:
    "Authenticate executive user and return access token with other details",
  tags: ["Auth Executive"],
  middleware: [loginRateLimiter],
  requestBody: {
    content: {
      "application/x-www-form-urlencoded": {
        body: LoginRequestSchema,
        example: {
          username: "username",
          password: "password",
        },
      },
    },
    required: true,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
      description: "Successful executive login",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Bad request",
    },
    401: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Access not found",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Define the validate token route
export const validateTokenRoute: RouteConfig = createRoute({
  method: "get",
  path: "/executive/validate-token",
  summary: "Validate Token and Get Executive User Info",
  description: "Validate the token and retrieve executive user information",
  tags: ["Auth Executive"],
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: "Token validated successfully",
      content: {
        "application/json": {
          schema: UserInfoResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Define the logout route
export const logoutRoute: RouteConfig = createRoute({
  method: "post",
  path: "/executive/logout",
  summary: "Logout Executive User",
  description:
    "Logout the executive user and invalidate all sessions associated with the executive user",
  tags: ["Auth Executive"],
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: "Executive user logged out successfully",
    },
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Define the send forgot password email route
export const sendForgotPasswordEmailRoute: RouteConfig = createRoute({
  method: "put",
  path: "/executive/forgot-password",
  summary:
    "User forgot the password, send Update Password Action Email to User",
  description:
    "As the user is unable to use his existing credentials, send a password reset email to the user with a link",
  tags: ["Auth"],
  requestBody: {
    content: {
      "application/json": {
        body: UserNameSchema,
        example: {
          username: "testuser",
        },
      },
    },
  },
  responses: {
    200: {
      description: "User action email sent successfully",
    },
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});
