import { BadRequestError } from "@smile-health/lib/error.js"

export class MissingStockStatusIdError extends BadRequestError {
  constructor() {
    super("validator.order_status.missing_stock_status_id")
  }
}
