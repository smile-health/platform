import {
  WsEntities,
  WsMaterials,
} from "@/common/infrastructure/database/types/db.js"
import { Context } from "hono"
import { Selectable } from "kysely"
import { ZodIssue } from "zod"
import { AppContextVariableMap } from "../context.js"
import { CreateOrderDinRequest } from "./din.schemas.js"

export interface DinContextVariableMap extends AppContextVariableMap {
  zodErrors: ZodIssue[]
  dataExtra: {
    activityId?: number
    detailEntitasVendor?: Selectable<WsEntities>
    detailEntitasCustomer?: Selectable<WsEntities>
    listMaterial?: Selectable<WsMaterials>[]
  }
  dataClient?: any
  requestUrl?: string
  originalBody?: Partial<CreateOrderDinRequest>
  originalPayload?: CreateOrderDinRequest
}

export type DinContext = Context<{ Variables: DinContextVariableMap }>
