import { DB } from "@/common/infrastructure/database/types/db.js"
import { IContextVariableMap } from "@smile/lib/types/context.js"
import { Context } from "hono"
import { Selectable } from "kysely"
import { IntegrationClients, WsUsers } from "@/common/infrastructure/database/types/db.js"

export interface AppContextVariableMap extends IContextVariableMap<DB> {
  orderId: number
  requestType: string
  validate: string
  userId?: number
  programId?: number
  activityIds?: number[]
  user?: Selectable<WsUsers> & { program_name?: string }
  client?: Selectable<IntegrationClients>
  deviceType?: number
}

export type AppContext = Context<{ Variables: AppContextVariableMap }>
