import { DB } from "@/common/infrastructure/database/types/db.js"
import { AuthKeycloakMiddleware } from "@/common/middlewares/auth.middleware.js"
import { OpenAPIHono } from "@hono/zod-openapi"
import { EventMiddleware } from "@smile/lib/middlewares/event.middleware.js"
import { RequestMiddleware } from "@smile/lib/middlewares/request.middleware.js"
import { TransactionMiddleware } from "@smile/lib/middlewares/transaction.middleware.js"
import { StatusCodes } from "http-status-codes"
import { DinContext } from "./din.context.js"
import { DinMiddleware } from "./din.middleware.js"
import { DinModule } from "./din.module.js"
import { authLoginRoute, postPickingOrderRoute } from "./din.routes.js"

export class DinController {
  constructor(
    private readonly module: DinModule,
    private readonly middleware: DinMiddleware,
    private readonly reqMiddleware: RequestMiddleware,
    private readonly trxMiddleware: TransactionMiddleware<DB>,
    private readonly authMiddleware: AuthKeycloakMiddleware,
    private readonly evtMiddleware: EventMiddleware
  ) {}

  /**
   * Helper to build error response body
   */
  private buildErrorResponse(
    message: string,
    errors: Record<string, any>
  ): { message: string; errors: Record<string, any> } {
    return {
      message,
      errors,
    }
  }

  /**
   * Helper to log error and return response
   */
  private async logAndReturnError(
    ctx: DinContext,
    req: any,
    errorType: string,
    errorData: any,
    statusCode: number = StatusCodes.UNPROCESSABLE_ENTITY
  ) {
    const responseBody = this.buildErrorResponse(
      "Unable to process the submitted data. Please check your input.",
      errorData
    )

    const bodyString = JSON.stringify(responseBody)

    await this.module.createLog(ctx, ctx.var.client, errorType, req, {
      status: statusCode,
      body: bodyString,
      error: errorData,
    })

    return responseBody
  }

  registerRoutes(app: OpenAPIHono) {
    const middlewares = [
      this.reqMiddleware.handle,
      this.trxMiddleware.handle,
      this.authMiddleware.handleAuthKeycloak,
      this.evtMiddleware.handle, // ✅ Add event middleware to publish events
    ]

    app.use(authLoginRoute.getRoutingPath(), this.reqMiddleware.handle)
    app.openapi(authLoginRoute, async (c) => {
      const req = c.req.valid("form")
      const resp = await this.module.login(c, req)
      return c.json(resp, StatusCodes.OK)
    })
    app.use(postPickingOrderRoute.getRoutingPath(), ...middlewares)
    app.openapi(postPickingOrderRoute, async (c) => {
      const req = c.req.valid("json")
      const ctx = c as DinContext

      try {
        await this.middleware.validateRequest(ctx, req)
        await this.module.create(ctx, req)

        return c.json(
          {
            success: true,
            code: StatusCodes.OK,
            message: ctx.var.validate ?? "Success post data",
          },
          StatusCodes.OK
        )
      } catch (error) {
        let responseBody: { message: string; errors: Record<string, any> }

        // Handle ZodError (validation errors)
        if (
          error instanceof Error &&
          "errors" in error &&
          Array.isArray(error.errors)
        ) {
          const zodErrors = error.errors as any[]
          const errorsMap = this.buildZodErrorsMap(zodErrors)

          // Return with nested errors map format
          responseBody = this.buildErrorResponse(
            "Unable to process the submitted data. Please check your input.",
            errorsMap
          )

          // Log with detailed error info
          const bodyString = JSON.stringify(responseBody)
          await this.module.createLog(
            ctx,
            ctx.var.client,
            "create_order",
            req,
            {
              status: StatusCodes.UNPROCESSABLE_ENTITY,
              body: bodyString,
              error: {
                issues: zodErrors.map((err: any) => ({
                  code: err.code || "custom",
                  message: err.message,
                  path: err.path,
                })),
                name: "ZodError",
              },
            }
          )

          return c.json(responseBody, StatusCodes.UNPROCESSABLE_ENTITY)
        }

        // Handle ValidationError
        if (error instanceof Error && error.name === "ValidationError") {
          responseBody = await this.logAndReturnError(
            ctx,
            req,
            "create_order",
            {
              validation: [error.message],
            }
          )

          return c.json(responseBody, StatusCodes.UNPROCESSABLE_ENTITY)
        }

        // Handle other errors
        if (error instanceof Error) {
          responseBody = await this.logAndReturnError(
            ctx,
            req,
            "controller_error",
            {
              general: [error.message],
            }
          )

          return c.json(responseBody, StatusCodes.UNPROCESSABLE_ENTITY)
        }

        // Handle unknown error
        responseBody = await this.logAndReturnError(
          ctx,
          req,
          "controller_unknown_error",
          {
            general: ["An unexpected error occurred"],
          }
        )

        return c.json(responseBody, StatusCodes.UNPROCESSABLE_ENTITY)
      }
    })
  }

  /**
   * Helper to build nested errors map from Zod errors
   */
  private buildZodErrorsMap(zodErrors: any[]): Record<string, any> {
    const errorsMap: Record<string, any> = {}

    zodErrors.forEach((err) => {
      const path = err.path || []
      let currentLevel: any = errorsMap

      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i]
        if (!currentLevel[key]) {
          currentLevel[key] = {}
        }
        currentLevel = currentLevel[key]
      }

      // Add error message to the last level
      const lastKey = path[path.length - 1]
      if (!currentLevel[lastKey]) {
        currentLevel[lastKey] = []
      }
      currentLevel[lastKey].push(err.message || "Invalid value")
    })

    return errorsMap
  }
}
