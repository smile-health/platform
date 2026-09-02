import { env } from "@/config/env.js"
import { DEVICE_TYPE } from "@/common/constants/headers.js"
import { AuthKeycloakService } from "@smile-health/lib/api/auth.service.js"
import {
  ForbiddenError,
  HTTPError,
  UnauthorizedError,
} from "@smile-health/lib/error.js"
import { logger } from "@smile-health/lib/logger.js"
import { createMiddleware } from "hono/factory"

const authKeycloakService = new AuthKeycloakService(
  env.CORE_API_URL,
  env.USE_LOCAL_JWT_VALIDATION
)

export class AuthMiddleware {
  handleAuthHeaderReinjection = createMiddleware(async (c, next) => {
    // This is a placeholder for the actual auth middleware
    // In a real implementation, this would validate tokens and set user info
    // c.var.user = { global_id: 1 }
    await next()
  })
}

export class AuthKeycloakMiddleware {
  handleAuthKeycloak = createMiddleware(async (c, next) => {
    try {
      const authHeader = c.req.header("Authorization")
      const programId = c.req.header("x-program-id") ?? 0
      if (!authHeader) throw new UnauthorizedError()

      // Verify the token's signature/expiry locally before making any
      // network call, so an invalid/expired token never reaches core.
      await authKeycloakService.validateToken(authHeader.split(" ")[1] ?? "")

      const pathUrl = c.req.path.includes("/executive")
        ? "/executive/account/profile"
        : "/account/profile"

      const responseProfile = await fetch(env.CORE_API_URL + pathUrl, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          Connection: "keep-alive",
        },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await responseProfile.json()

      if (!responseProfile.ok) {
        logger.info(
          `Failed Request Get Profile ( Core ): ${responseProfile.ok} - ${responseProfile.status} - ${JSON.stringify(data)}`
        )
        throw new ForbiddenError(data!.message)
      }

      logger.info(
        `Success Request Get Profile ( Core ): ${data} - ${JSON.stringify(data)}`
      )

      c.set("programId", Number(programId))
      c.set("deviceId", DEVICE_TYPE[c.req.header("Device-Type") ?? "web"])
      c.set("roleId", data.role_id)
      c.set("language", c.req.header("Accept-Language") ?? "en")
      c.set("user", data)
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        throw error
      }
      logger.error(
        `Failed Request Get Profile ( Core ): ${JSON.stringify(error)}`
      )
      throw new ForbiddenError("Failed Get Profile")
    }
    await next()
  })
}
