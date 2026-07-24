import { BaseMiddleware } from "@smile/lib/base/middleware"
import { Context } from "hono"
import {
  AddColdStorageRequestSchema,
  BulkAddColdStorageRequestSchema,
} from "./coldstorage.shcema"

export class ColdStorageMiddleware extends BaseMiddleware {
  constructor() {
    super()
  }

  create = (c: Context) => {
    return AddColdStorageRequestSchema.superRefine((data, ctx) => {})
  }

  bulkCreate = (c: Context) => {
    return BulkAddColdStorageRequestSchema.superRefine((data, ctx) => {})
  }
}
