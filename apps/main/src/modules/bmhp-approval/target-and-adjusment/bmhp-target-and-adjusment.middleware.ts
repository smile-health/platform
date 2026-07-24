import { Context, Next } from "hono"

export class BmhpTargetAdjustmentMiddleware {
  constructor() {}

  /**
   * Validate that user has access to the province
   */
  async validateProvinceAccess() {
    return async (c: Context, next: Next) => {
      // Add any custom validation logic here if needed
      // For example, checking if user has access to the specified province
      await next()
    }
  }

  /**
   * Validate that the year exists and is valid
   */
  async validateYear() {
    return async (c: Context, next: Next) => {
      // Add any custom validation logic here if needed
      // For example, checking if the year/program_plan exists
      await next()
    }
  }
}
