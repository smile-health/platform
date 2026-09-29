import * as jwt from "jsonwebtoken"
import { JWTPayload } from "@smile-health/lib/types/jwt.js"
import env from "@/config/env.js"

export const createToken = (overrides: Partial<JWTPayload> = {}) => {
  const payload: JWTPayload = {
    account_id: 1,
    role: 1,
    workspaces: [],
    ...overrides,
  }
  return jwt.sign(payload, env.APP_KEY, { expiresIn: "7d" })
}
