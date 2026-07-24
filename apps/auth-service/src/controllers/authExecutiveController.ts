import { OpenAPIHono } from "@hono/zod-openapi";
import {
  loginRoute,
  validateTokenRoute,
  logoutRoute,
  sendForgotPasswordEmailRoute,
} from "../routes/authExecutiveRoutes";
import {
  loginExecutiveHandler,
  validateTokenExecutiveHandler,
  logoutExecutiveHandler,
  resetPasswordEmailExecutiveHandler,
} from "../route-handlers/authExecutiveRouteHandlers";

export class AuthExecutiveController {
  public static registerRoutes(app: OpenAPIHono) {
    app.openapi(loginRoute, loginExecutiveHandler);
    app.openapi(
      sendForgotPasswordEmailRoute,
      resetPasswordEmailExecutiveHandler,
    );
    app.openapi(validateTokenRoute, validateTokenExecutiveHandler);
    app.openapi(logoutRoute, logoutExecutiveHandler);
  }
}
