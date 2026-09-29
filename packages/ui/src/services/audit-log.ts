import axios from '#lib/axios'
import { TCommonFilter, TCommonResponseList } from '#types/common'
import { handleAxiosResponse } from '#utils/api'

export type AuditLogMetadata = {
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
} | null

export type TAuditLog = {
  id: string
  service: string | null
  program_id: string | null
  actor_id: string | null
  actor_name: string | null
  actor_role: string | null
  action: string
  module: string
  entity_id: string | null
  metadata: AuditLogMetadata
  ip: string | null
  created_at: string
}

export type ListAuditLogsParams = TCommonFilter & {
  program_id?: string | number
  module?: string
  entity_id?: string | number
  actor_id?: string | number
  date_from?: string
  date_to?: string
  service?: string
  action?: string
}

export type ListAuditLogsResponse = TCommonResponseList & {
  data: TAuditLog[]
}

export type AuditLogSettings = {
  retention_days: number
}

export async function listAuditLogs(
  params: ListAuditLogsParams
): Promise<ListAuditLogsResponse> {
  const response = await axios.get('/core/audit-logs', {
    params,
  })

  return handleAxiosResponse<ListAuditLogsResponse>(response)
}

export async function getAuditLogSettings(): Promise<AuditLogSettings> {
  const response = await axios.get('/core/audit-logs/settings')

  return handleAxiosResponse<AuditLogSettings>(response)
}

export async function updateAuditLogSettings(
  body: AuditLogSettings
): Promise<AuditLogSettings> {
  const response = await axios.put('/core/audit-logs/settings', body)

  return handleAxiosResponse<AuditLogSettings>(response)
}
