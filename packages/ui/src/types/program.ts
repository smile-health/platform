import { TProtocol } from './protocol'

export type TProgram = {
  id: number
  key: string
  name: string
  // Real workspace type from the backend — the source of truth for
  // "is this program/workspace WMS" (replaces the old fake WMS program +
  // integration_client_id checks).
  type?: 'smile' | 'wms'
  entity_id?: number
  color?: string
  protocols: TProtocol[]
  config: {
    color?: string
    material: {
      is_hierarchy_enabled: boolean
      is_batch_enabled: boolean
    }
    is_kfa_enabled?: boolean
    server_url?: string
    order?: {
      is_create_restricted?: boolean
      is_confirm_restricted?: boolean
    }
    transaction?: {
      is_transfer_stock_restricted: boolean
    }
    is_annual_planning: boolean
  }
  is_related?: boolean
  user_created_by?: {
    id: number
    firstname: string
    lastname: string
    fullname: string
  }
  description?: string
  user_updated_by?: {
    id: number
    firstname: string
    lastname: string
    fullname: string
  }
  created_at?: string
  updated_at?: string
  status?: number
  href?: string
}
