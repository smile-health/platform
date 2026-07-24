import { RouteConfigToTypedResponse } from "@hono/zod-openapi";
import { Context } from "hono";
import {
  loginRoute,
  logoutRoute,
  validateTokenRoute,
  sendForgotPasswordEmailRoute,
} from "../routes/authRoutes";
import { AuthDetails, LoginRequestSchema } from "../schemas/authSchemas";
import { AuthTokenSchema, UserNameSchema } from "../schemas/sharedSchemas";
import appService from "../services/appService";
import logger from "../utils/logger";
import { validateRequestBody } from "../utils/validators";

export const loginExecutiveHandler = async (
  c: Context,
): Promise<RouteConfigToTypedResponse<typeof loginRoute>> => {
  const validationResult = await validateRequestBody(c, LoginRequestSchema);

  if (!validationResult.success) {
    return c.json(validationResult.errorResponse, 400);
  }

  // Extract username and password & attempt login executive
  if (validationResult.data) {
    const { username, password, fcm_token } = validationResult.data;

    // Attempt login
    try {
      const deviceType = c.req.header("device-type") ?? "web";
      logger.info(
        `AuthExecutiveRouteHandlers.loginExecutiveHandler: Login attempt for executive user: '${username}' from device: '${deviceType}'`,
      );
      const token: AuthDetails = await appService.login(
        username,
        password,
        deviceType,
        true,
      );
      // Try to update the User Last login stats, this WONT fail the login request
      try {
        await appService.updateUserLastLogin(
          token.access_token,
          {
            fcm_token: fcm_token ?? null,
            last_login: new Date(),
            last_device: c.req.header("device-type")! ?? "web",
            language: c.req.header("Accept-Language"),
          },
          true,
        );
        logger.info(
          `AuthExecutiveRouteHandlers.loginExecutiveHandler: Last Login executive successfully recorded for user: '${username}'`,
        );
      } catch (error: any) {
        logger.warn(
          `AuthExecutiveRouteHandlers.loginExecutiveHandler: Unable to record login stats for user: '${username}' - ${JSON.stringify(error?.message)} - ${JSON.stringify(error?.statusCode)}`,
        );
        console.error(error);
      }

      logger.info(
        `AuthExecutiveRouteHandlers.loginExecutiveHandler: Login executive successful for user: '${username}'`,
      );
      return c.json({ authDetails: token }, 200);
    } catch (error: any) {
      // Handle specific error cases
      if (error.statusCode) {
        logger.warn(
          `AuthExecutiveRouteHandlers.loginExecutiveHandler: '${username}' - ${JSON.stringify(error?.message)} - ${JSON.stringify(error?.statusCode)}`,
        );
        return c.json(
          { message: c.var.t(error.message), code: error?.statusCode },
          error?.statusCode,
        );
      }
      if (error.message.includes("Unauthorized") || error.message.includes("not found")) {
        logger.warn(
          `AuthExecutiveRouteHandlers.loginExecutiveHandler: Unauthorized login executive attempt for user: '${username}'`,
        );
        return c.json({ message: error.message, code: 401 }, 401);
      }
      if (error.message.includes("Bad Request")) {
        logger.warn(
          `AuthExecutiveRouteHandlers.loginExecutiveHandler: Unsuccessful login executive attempt for user: '${username}'`,
        );
        return c.json({ message: error.message, code: 400 }, 400);
      }
      if (error.message.includes("device_not_allowed")) {
        logger.warn(
          `AuthExecutiveRouteHandlers.loginExecutiveHandler: Device not allowed for user: '${username}'`,
        );
        return c.json(
          {
            message: "Operators can only login from mobile devices",
            code: 403,
          },
          403,
        );
      }
      logger.error(
        `AuthExecutiveRouteHandlers.loginExecutiveHandler: Internal server error during login for user: '${username}', ${error}`,
      );
      return c.json({ message: "Internal server error", code: 500 }, 500);
    }
  } else {
    logger.warn(
      `AuthExecutiveRouteHandlers.loginExecutiveHandler: Login executive details are missing in request body`,
    );
    return c.json(
      {
        message: "Invalid request body, login executive details are missing",
        code: 400,
      },
      400,
    );
  }
};

export const validateTokenExecutiveHandler = async (
  c: Context,
): Promise<RouteConfigToTypedResponse<typeof validateTokenRoute>> => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    logger.warn(
      `AuthExecutiveRouteHandlers.validateTokenExecutiveHandler: Validation failed: Authorization header is missing`,
    );
    return c.json(
      { message: "Authorization header is missing", code: 400 },
      400,
    );
  }

  const reqValidationResult = AuthTokenSchema.safeParse(token);

  if (!reqValidationResult.success) {
    logger.warn(
      `AuthExecutiveRouteHandlers.validateTokenExecutiveHandler: Auth Token Validation failed: ${JSON.stringify(reqValidationResult.error.errors)}`,
    );
    const errorResponse = {
      message: reqValidationResult.error.errors,
      code: 400,
    };
    return c.json(errorResponse, 400);
  }

  try {
    const userInfo = await appService.validateToken(token);
    logger.info(
      `AuthExecutiveRouteHandlers.validateTokenExecutiveHandler: Token validated successfully for user: ${userInfo.sub}`,
    );
    return c.json({ userInfo: userInfo }, 200);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      logger.warn(
        `AuthExecutiveRouteHandlers.validateTokenExecutiveHandler: Token validation failed: ${error}`,
      );
      return c.json(
        { message: "Unauthorized: Invalid or expired token", code: 401 },
        401,
      );
    }
    logger.error(`Failed to validate token: ${error}`);
    return c.json({ message: "Failed to validate token", code: 500 }, 500);
  }
};

export const logoutExecutiveHandler = async (
  c: Context,
): Promise<RouteConfigToTypedResponse<typeof logoutRoute>> => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    logger.warn(
      `AuthExecutiveRouteHandlers.logoutExecutiveHandler: Validation failed: Authorization header is missing`,
    );
    return c.json(
      { message: "Authorization header is missing", code: 400 },
      400,
    );
  }

  const reqValidationResult = AuthTokenSchema.safeParse(token);

  if (!reqValidationResult.success) {
    logger.warn(
      `AuthExecutiveRouteHandlers.logoutExecutiveHandler: Auth Token Validation failed: ${JSON.stringify(reqValidationResult.error.errors)}`,
    );
    const errorResponse = {
      message: reqValidationResult.error.errors,
      code: 400,
    };
    return c.json(errorResponse, 400);
  }

  try {
    await appService.logoutUser(token);
    logger.info(
      `AuthExecutiveRouteHandlers.logoutExecutiveHandler: Executive logged out successfully`,
    );
    return c.json({}, 200); // Return an empty object with the status code 204
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      logger.warn(
        `AuthExecutiveRouteHandlers.logoutExecutiveHandler: Token validation failed: ${error}`,
      );
      return c.json(
        { message: "Unauthorized: Invalid or expired token", code: 401 },
        401,
      );
    }
    if (error.message.includes("User not found")) {
      logger.warn(
        `AuthExecutiveRouteHandlers.logoutExecutiveHandler: User not found with token: ${error}`,
      );
      return c.json({ message: "User not found", code: 404 }, 404);
    }
    logger.error(
      `AuthExecutiveRouteHandlers.logoutExecutiveHandler: Failed to log out executive: ${error}`,
    );
    return c.json({ message: "Failed to log out executive", code: 500 }, 500);
  }
};

export const resetPasswordEmailExecutiveHandler = async (
  c: Context,
): Promise<RouteConfigToTypedResponse<typeof sendForgotPasswordEmailRoute>> => {
  const reqBody = await c.req.json();
  const reqValidationResult = UserNameSchema.safeParse(reqBody);

  if (!reqValidationResult.success) {
    logger.warn(
      `AuthExecutiveRouteHandlers.resetPasswordEmailExecutiveHandler: Request Validation failed: ${JSON.stringify(reqValidationResult.error.errors)}`,
    );
    const errorResponse = {
      message: reqValidationResult.error.errors,
      code: 400,
    };
    return c.json(errorResponse, 400);
  }

  if (reqValidationResult.data && reqValidationResult.data.username) {
    logger.info(
      `AuthExecutiveRouteHandlers.resetPasswordEmailExecutiveHandler: Attempting to send reset password email to user: '${reqValidationResult.data.username}'`,
    );
    const username: string = reqValidationResult.data.username;
    let userId: string = "";
    // Check if the username is valid and exists in the system
    try {
      logger.debug(
        `AuthExecutiveRouteHandlers.resetPasswordEmailExecutiveHandler: Checking if user: '${reqValidationResult.data.username}' exists in the system.`,
      );
      const userExists = await appService.checkUserExists(username);
      if (!userExists) {
        logger.warn(
          `AuthExecutiveRouteHandlers.resetPasswordEmailExecutiveHandler: User not found: '${username}'`,
        );
        return c.json({ message: "User not found", code: 404 }, 404);
      }
      // If user exists, get the user ID
      userId = userExists.id!;
      logger.info(
        `AuthExecutiveRouteHandlers.resetPasswordEmailExecutiveHandler: User '${username}' exists with id: '${userId}'`,
      );
    } catch (error: any) {
      logger.error(
        `AuthExecutiveRouteHandlers.resetPasswordEmailExecutiveHandler: Internal server error while validating user: ${error}`,
      );
      return c.json(
        {
          message:
            "Internal server error, Failed to send reset password email to user as user validation failed.",
          code: 500,
        },
        500,
      );
    }
    // Send the reset password email
    try {
      await appService.sendUpdatePwdActionEmailToUser(userId);
      logger.info(
        `AuthExecutiveRouteHandlers.resetPasswordEmailExecutiveHandler: Password reset email sent to user: '${username}'`,
      );
      return c.json({}, 200);
    } catch (error: any) {
      if (error.message.includes("User not found")) {
        logger.warn(
          `AuthExecutiveRouteHandlers.resetPasswordEmailExecutiveHandler: User not found for password update: '${username}', Error: ${error.message}`,
        );
        return c.json({ message: `User not found`, code: 404 }, 404);
      }
      if (error.message.includes("Bad or invalid request")) {
        logger.warn(
          `AuthExecutiveRouteHandlers.resetPasswordEmailExecutiveHandler: Bad request for user password update: '${username}', Error: ${error.message}`,
        );
        return c.json({ message: `${error.message}`, code: 400 }, 400);
      }
      logger.error(
        `AuthExecutiveRouteHandlers.resetPasswordEmailExecutiveHandler: Internal server error: ${error}`,
      );
      return c.json(
        {
          message:
            "Internal server error, Failed to send reset password email to user",
          code: 500,
        },
        500,
      );
    }
  } else {
    logger.warn(
      `AuthExecutiveRouteHandlers.resetPasswordEmailExecutiveHandler: Required user details are missing in the request parameters`,
    );
    return c.json(
      { message: "Invalid request, user ID is missing", code: 400 },
      400,
    );
  }
};
